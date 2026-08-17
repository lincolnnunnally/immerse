import { NextRequest, NextResponse } from "next/server";
import { searchFacilities, mapFacilityToCampSite, inferLandManagerFromFacility } from "@/lib/ridb";
import {
  searchRecGovCampgrounds,
  mapRecGovToCampSite,
  STATE_SEARCH_CENTERS,
} from "@/lib/recgov";
import { CampSite } from "@/lib/types";
import { curatedForState, curatedNear } from "@/lib/curated";
import { resolvePlace, HOME_REFERENCE, type Place } from "@/lib/places";
import { estimateDriveMinutes, haversineMiles } from "@/lib/geo";

export const dynamic = "force-dynamic";

/**
 * GET /api/search
 *   q        free text — a PLACE ("Little River Canyon", "Fort Payne") or a keyword ("waterfalls")
 *   state    2-letter fallback region when q is not a place
 *   lat,lng  explicit center (overrides place resolution)
 *   radius   miles (only honoured with explicit lat/lng; places carry their own radius)
 *   activity camping | developed | dispersed | ohv | private
 *
 * Order of truth: RIDB (key) → Recreation.gov public → curated. Curated sites for the
 * region (state parks, destinations, dispersed…) are ALWAYS merged in — the federal
 * inventory can't see them. A resolved place sorts results by distance from it.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const clamp = (n: number, lo: number, hi: number, dflt: number) =>
    Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : dflt;

  const latParam = Number(searchParams.get("lat"));
  const lngParam = Number(searchParams.get("lng"));
  const hasExplicitCenter =
    Number.isFinite(latParam) && Number.isFinite(lngParam) && !(latParam === 0 && lngParam === 0);
  const requestedState = (searchParams.get("state") || "GA").toUpperCase().slice(0, 2);
  const rawQuery = (searchParams.get("q") || "").trim().slice(0, 120) || undefined;
  const limit = clamp(Number(searchParams.get("limit")), 1, 200, 50);
  const activityFilter = (searchParams.get("activity") || "camping").toLowerCase();

  // ── Resolve "where" ────────────────────────────────────────────────────
  const place: Place | null = hasExplicitCenter ? null : await resolvePlace(rawQuery);
  const center = hasExplicitCenter
    ? { lat: latParam, lng: lngParam, radius: clamp(Number(searchParams.get("radius")), 1, 500, 100) }
    : place
      ? { lat: place.lat, lng: place.lng, radius: place.radiusMiles }
      : null;
  const state = place?.state || requestedState;
  // Text that is NOT a place gets used as a keyword; place names never go to the federal APIs
  const textQuery = place ? undefined : rawQuery;
  const stateCenter = STATE_SEARCH_CENTERS[state];

  let sites: CampSite[] = [];
  let source: "ridb" | "recreation.gov" | "mock" = "mock";
  let total = 0;
  const notes: string[] = [];

  // ── Path A: RIDB with API key (NOTE: RIDB silently caps radius at ~25 mi) ──
  const byId = new Map<string, CampSite>();
  const push = (list: CampSite[]) => {
    for (const s of list) if (!byId.has(s.id)) byId.set(s.id, s);
  };
  if (process.env.RIDB_API_KEY) {
    try {
      const base = {
        limit,
        query: textQuery,
        activity: activityFilter === "ohv" ? undefined : "9",
        ...(center
          ? { latitude: center.lat, longitude: center.lng, radius: Math.min(center.radius, 25) }
          : { state, radius: stateCenter?.radius ?? 150 }),
      };
      let { facilities, total: t } = await searchFacilities(base);
      // The camping activity filter is sometimes too strict (or empty for keyword queries) — retry without it
      if (facilities.length === 0 && base.activity) {
        ({ facilities, total: t } = await searchFacilities({ ...base, activity: undefined }));
      }
      total = t;
      push(
        facilities
          .filter((f) => f.FacilityLatitude && f.FacilityLongitude)
          .map((f) => {
            const mapped = mapFacilityToCampSite(f);
            mapped.dataSource = "ridb";
            mapped.landManager = inferLandManagerFromFacility(f);
            return mapped;
          })
      );
      if (byId.size > 0) source = "ridb";
    } catch (err) {
      console.error("RIDB search failed, trying Recreation.gov public API:", err);
    }
  }

  // ── Path B: Recreation.gov public search ───────────────────────────────
  // Always run for place searches (RIDB's 25-mi cap misses real options 25–40 mi out);
  // otherwise only when RIDB gave nothing.
  if (byId.size === 0 || (center && center.radius > 25)) {
    try {
      const { results, total: t } = await searchRecGovCampgrounds({
        state,
        query: textQuery,
        limit: Math.min(limit, 50),
        lat: center?.lat ?? stateCenter?.lat,
        lng: center?.lng ?? stateCenter?.lng,
        radius: center?.radius ?? stateCenter?.radius,
        strictState: !center,
      });
      if (byId.size === 0) total = t;
      const before = byId.size;
      push(results.filter((r) => r.latitude && r.longitude).map(mapRecGovToCampSite));
      if (before === 0 && byId.size > 0) source = "recreation.gov";
    } catch (err) {
      console.error("Recreation.gov search failed:", err);
    }
  }
  sites = Array.from(byId.values());

  // ── Curated merge (always) ─────────────────────────────────────────────
  const curated = center
    ? curatedNear(center.lat, center.lng, center.radius)
    : curatedForState(state);
  sites = mergeCurated(sites, curated);

  // ── Keyword ranking ────────────────────────────────────────────────────
  if (textQuery) {
    sites = rankAndFilterByQuery(sites, textQuery);
  }

  // ── Activity filter ────────────────────────────────────────────────────
  sites = applyActivity(sites, activityFilter);

  // ── Distance from place + drive estimate + ordering ────────────────────
  if (center) {
    for (const s of sites) {
      s.distanceMiles = Math.round(haversineMiles(center.lat, center.lng, s.lat, s.lng) * 10) / 10;
    }
    const pinned = place?.destinationSiteId;
    sites.sort((a, b) => {
      if (pinned) {
        if (a.id === pinned) return -1;
        if (b.id === pinned) return 1;
      }
      return (a.distanceMiles ?? 1e9) - (b.distanceMiles ?? 1e9);
    });
  } else if (!textQuery) {
    // Prefer listings with photos so the feed feels inviting
    sites = [...sites].sort((a, b) => Number(Boolean(b.imageUrl)) - Number(Boolean(a.imageUrl)));
  }
  for (const s of sites) {
    if (s.driveTimeMinutes == null) {
      s.driveTimeMinutes = estimateDriveMinutes(
        haversineMiles(HOME_REFERENCE.lat, HOME_REFERENCE.lng, s.lat, s.lng)
      );
    }
    if (!s.state) s.state = guessState(s, state);
  }

  // ── Message ────────────────────────────────────────────────────────────
  if (place) {
    notes.push(
      `Showing places within ~${place.radiusMiles} miles of ${place.name}, nearest first.`
    );
  }
  if (source === "mock") {
    notes.push(
      curated.length
        ? "Live federal search was unavailable — showing curated data only."
        : `Live federal search was unavailable and there is no curated set for ${state} yet. Try again shortly.`
    );
  } else if (rawQuery && !place && sites.length === 0) {
    notes.push(`Nothing matched "${rawQuery}". Try a place name (park, town, canyon) or a simpler keyword.`);
  }

  return NextResponse.json({
    source,
    state,
    place: place
      ? {
          slug: place.slug,
          name: place.name,
          state: place.state,
          lat: place.lat,
          lng: place.lng,
          radiusMiles: place.radiusMiles,
          blurb: place.blurb,
          destinationSiteId: place.destinationSiteId,
        }
      : null,
    total,
    count: sites.length,
    sites,
    message: notes.join(" ") || undefined,
  });
}

function guessState(s: CampSite, fallback: string): string {
  // Very rough bounding boxes for the Southeast — good enough for a label
  const { lat, lng } = s;
  if (lat > 30.2 && lat < 35.05 && lng > -88.6 && lng < -84.85) return "AL";
  if (lat > 30.35 && lat < 35.05 && lng > -85.7 && lng < -80.75) return "GA";
  return fallback;
}

/** Token match so "waterfalls" hits Little River Falls / Desoto Falls / waterfall hikes. */
function rankAndFilterByQuery(sites: CampSite[], query: string): CampSite[] {
  const tokens = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2 && !["the", "and", "for", "with", "near", "best"].includes(t));
  const expanded = new Set(tokens);
  if (tokens.some((t) => t.startsWith("waterfall") || t === "falls" || t === "cascade")) {
    expanded.add("waterfall");
    expanded.add("falls");
    expanded.add("cascade");
  }
  if (tokens.some((t) => t.startsWith("swim"))) {
    expanded.add("swim");
    expanded.add("swimming");
  }

  const scored = sites.map((s) => {
    const hay = [
      s.name,
      s.description,
      s.agency,
      ...(s.mustSees || []),
      ...(s.activities || []),
      ...(s.amenities || []),
      ...((s.nearby || []).map((n) => n.name)),
      s.notes || "",
    ]
      .join(" ")
      .toLowerCase();
    let score = 0;
    for (const t of expanded) {
      if (hay.includes(t)) score += t === "waterfall" || t === "falls" ? 3 : 1;
      if (s.name.toLowerCase().includes(t)) score += 2;
    }
    if (s.imageUrl) score += 1.5;
    if (s.dataSource === "ridb") score += 0.5; // federal API already scoped by q
    return { s, score };
  });

  let kept = scored.filter((x) => x.score > 0);
  if (kept.length === 0) {
    kept = scored.filter((x) => x.s.dataSource === "ridb" || Boolean(x.s.imageUrl));
  }
  if (kept.length === 0) kept = scored;

  kept.sort((a, b) => b.score - a.score);
  return kept.map((x) => x.s);
}

function mergeCurated(sites: CampSite[], curated: CampSite[]): CampSite[] {
  const existingNames = new Set(sites.map((s) => s.name.toLowerCase()));
  const existingIds = new Set(sites.map((s) => s.id));
  const out = [...sites];
  for (const c of curated) {
    if (!existingNames.has(c.name.toLowerCase()) && !existingIds.has(c.id)) {
      out.push({ ...c });
      existingNames.add(c.name.toLowerCase());
      existingIds.add(c.id);
    }
  }
  return out;
}

function applyActivity(sites: CampSite[], activityFilter: string): CampSite[] {
  if (activityFilter === "ohv") {
    return sites.filter(
      (s) =>
        s.ohvFriendly ||
        s.type === "ohv" ||
        (s.activities || []).some(
          (a) => a.toLowerCase().includes("ohv") || a.toLowerCase().includes("4x4")
        )
    );
  }
  // Dispersed camping (national forest / BLM style, no designated site) is a different
  // thing from a state wildlife management area. Keep them as separate filters so we
  // don't imply dispersed camping only happens on WMAs.
  if (activityFilter === "dispersed") {
    return sites.filter((s) => s.type === "dispersed");
  }
  if (activityFilter === "wma") {
    return sites.filter((s) => s.type === "wma");
  }
  if (activityFilter === "private") {
    return sites.filter((s) => s.type === "private");
  }
  if (activityFilter === "developed") {
    return sites.filter((s) => s.type === "developed" || s.type === "state");
  }
  return sites;
}
