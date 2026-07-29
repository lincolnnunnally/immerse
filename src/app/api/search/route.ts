import { NextRequest, NextResponse } from "next/server";
import { searchFacilities, mapFacilityToCampSite } from "@/lib/ridb";
import { mockSites } from "@/lib/mock-sites";
import {
  searchRecGovCampgrounds,
  mapRecGovToCampSite,
  STATE_SEARCH_CENTERS,
} from "@/lib/recgov";
import { CampSite } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const state = (searchParams.get("state") || "GA").toUpperCase().slice(0, 2);
  const clamp = (n: number, lo: number, hi: number, dflt: number) =>
    Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : dflt;
  const radius = clamp(Number(searchParams.get("radius")), 1, 500, 100);
  const query = (searchParams.get("q") || undefined)?.slice(0, 120);
  const limit = clamp(Number(searchParams.get("limit")), 1, 200, 50);
  const activityFilter = (searchParams.get("activity") || "camping").toLowerCase();

  // ── Path A: RIDB with API key ──────────────────────────────────────────
  if (process.env.RIDB_API_KEY) {
    try {
      const activityParam = activityFilter === "ohv" ? undefined : "9";

      const params: Parameters<typeof searchFacilities>[0] = {
        state,
        radius,
        limit,
        query,
        activity: activityParam,
      };

      if (lat && lng) {
        params.latitude = Number(lat);
        params.longitude = Number(lng);
      }

      const { facilities, total } = await searchFacilities(params);

      let sites: CampSite[] = facilities
        .filter((f) => f.FacilityLatitude && f.FacilityLongitude)
        .map((f) => {
          const mapped = mapFacilityToCampSite(f);
          mapped.dataSource = "ridb";
          mapped.landManager = inferLandManager(f);
          return mapped;
        });

      sites = mergeCurated(sites, state, activityFilter);

      return NextResponse.json({
        source: "ridb",
        state,
        total,
        count: sites.length,
        sites,
      });
    } catch (err) {
      console.error("RIDB search failed, trying Recreation.gov public API:", err);
    }
  }

  // ── Path B: Recreation.gov public search (no key) ──────────────────────
  try {
    const center = STATE_SEARCH_CENTERS[state];
    const { results, total } = await searchRecGovCampgrounds({
      state,
      query,
      limit: Math.min(limit, 50),
      lat: lat ? Number(lat) : center?.lat,
      lng: lng ? Number(lng) : center?.lng,
      radius: lat && lng ? radius : center?.radius,
    });

    let sites: CampSite[] = results
      .filter((r) => r.latitude && r.longitude)
      .map(mapRecGovToCampSite);

    sites = mergeCurated(sites, state, activityFilter);

    if (query) {
      sites = rankAndFilterByQuery(sites, query, results);
    } else {
      // Prefer listings with photos so the feed feels inviting
      sites = [...sites].sort((a, b) => Number(Boolean(b.imageUrl)) - Number(Boolean(a.imageUrl)));
    }

    return NextResponse.json({
      source: "recreation.gov",
      state,
      total,
      count: sites.length,
      sites,
      message:
        state === "GA"
          ? "Live federal campgrounds via Recreation.gov, plus curated dispersed / WMA / OHV / private nature stays for Georgia."
          : "Live federal campgrounds via Recreation.gov for this area. Curated dispersed coverage is currently strongest for Georgia.",
    });
  } catch (err) {
    console.error("Recreation.gov search failed:", err);
  }

  // ── Path C: curated Georgia fallback ───────────────────────────────────
  let sites = state === "GA" ? [...mockSites] : [];

  if (query) {
    sites = rankAndFilterByQuery(sites, query, []);
  } else {
    sites = [...sites].sort((a, b) => Number(Boolean(b.imageUrl)) - Number(Boolean(a.imageUrl)));
  }

  sites = applyActivity(sites, activityFilter);

  return NextResponse.json({
    source: "mock",
    state,
    total: sites.length,
    count: sites.length,
    sites,
    message:
      state === "GA"
        ? "Live federal search was unavailable — showing curated Georgia data."
        : `Live federal search was unavailable and there is no curated set for ${state} yet. Try again shortly.`,
  });
}

/** Token match so "beautiful waterfalls" hits Desoto Falls / waterfall hikes. */
function rankAndFilterByQuery(
  sites: CampSite[],
  query: string,
  recgovResults: { entity_id?: string }[]
): CampSite[] {
  const tokens = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2 && !["the", "and", "for", "with", "near", "best"].includes(t));
  // synonym boosts
  const expanded = new Set(tokens);
  if (tokens.some((t) => t.startsWith("waterfall") || t === "falls" || t === "cascade")) {
    expanded.add("waterfall");
    expanded.add("falls");
    expanded.add("cascade");
  }
  const liveIds = new Set(recgovResults.map((r) => String(r.entity_id)));

  const scored = sites.map((s) => {
    const hay = [
      s.name,
      s.description,
      s.agency,
      ...(s.mustSees || []),
      ...(s.activities || []),
      ...(s.amenities || []),
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
    // rec.gov search already scoped by q — keep those even if token miss on short names
    if (liveIds.has(s.id) || s.dataSource === "ridb") score += 0.5;
    return { s, score };
  });

  let kept = scored.filter((x) => x.score > 0);
  if (kept.length === 0) {
    // Fall back: keep rec.gov hits + any curated with photo
    kept = scored.filter(
      (x) => liveIds.has(x.s.id) || x.s.dataSource === "ridb" || Boolean(x.s.imageUrl)
    );
  }
  if (kept.length === 0) kept = scored;

  kept.sort((a, b) => b.score - a.score);
  return kept.map((x) => x.s);
}

function mergeCurated(
  sites: CampSite[],
  state: string,
  activityFilter: string
): CampSite[] {
  if (state === "GA") {
    const curatedExtra = mockSites.filter(
      (s) =>
        s.type === "dispersed" ||
        s.type === "wma" ||
        s.type === "ohv" ||
        s.type === "private" ||
        s.dataSource === "curated"
    );
    const existingNames = new Set(sites.map((s) => s.name.toLowerCase()));
    const existingIds = new Set(sites.map((s) => s.id));
    curatedExtra.forEach((c) => {
      if (!existingNames.has(c.name.toLowerCase()) && !existingIds.has(c.id)) {
        sites.push(c);
      }
    });
  }
  return applyActivity(sites, activityFilter);
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
  if (activityFilter === "dispersed") {
    return sites.filter((s) => s.type === "dispersed" || s.type === "wma");
  }
  if (activityFilter === "private") {
    return sites.filter((s) => s.type === "private");
  }
  if (activityFilter === "developed") {
    return sites.filter((s) => s.type === "developed" || s.type === "state");
  }
  return sites;
}

function inferLandManager(f: {
  FacilityTypeDescription?: string;
  [key: string]: unknown;
}): CampSite["landManager"] {
  const org = String(
    (f as { OrgName?: string; OrganizationName?: string }).OrgName ||
      (f as { OrganizationName?: string }).OrganizationName ||
      ""
  ).toLowerCase();
  if (org.includes("forest") || org.includes("usfs")) return "USFS";
  if (org.includes("national park") || org.includes("nps")) return "NPS";
  if (org.includes("blm") || org.includes("land management")) return "BLM";
  if (org.includes("corps") || org.includes("usace")) return "USACE";
  if (org.includes("fish") || org.includes("wildlife") || org.includes("fws"))
    return "FWS";
  return "Other";
}
