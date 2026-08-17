/**
 * Place resolution for search: "Little River Canyon", "Fort Payne", "near Helen GA"…
 * 1) Curated gazetteer of Southeast destinations (fast, offline, tuned radii).
 * 2) Nominatim (OpenStreetMap) fallback for anything else — free, needs a UA,
 *    ≤1 req/s. Cached 24h at the edge, US-only.
 */

export type Place = {
  slug: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
  /** Search radius in miles that makes sense for this destination */
  radiusMiles: number;
  aliases?: string[];
  /** Curated site id that IS this destination (pinned first in results) */
  destinationSiteId?: string;
  blurb?: string;
  source: "gazetteer" | "nominatim";
};

type GazetteerEntry = Omit<Place, "source">;

export const GAZETTEER: GazetteerEntry[] = [
  // ── Alabama ─────────────────────────────────────────────────────────
  {
    slug: "little-river-canyon",
    name: "Little River Canyon National Preserve",
    state: "AL",
    lat: 34.3925,
    lng: -85.6301,
    radiusMiles: 40,
    aliases: ["little river canyon", "little river falls", "canyon rim", "lrc", "little river canyon national preserve"],
    destinationSiteId: "al-little-river-canyon",
    blurb: "Deep sandstone canyon on Lookout Mountain with waterfalls, swimming holes, and Canyon Rim Drive overlooks. Camp at DeSoto State Park next door.",
  },
  {
    slug: "desoto-state-park",
    name: "DeSoto State Park",
    state: "AL",
    lat: 34.4948,
    lng: -85.6183,
    radiusMiles: 40,
    aliases: ["desoto state park", "desoto", "de soto state park", "desoto falls"],
    destinationSiteId: "al-desoto-state-park",
  },
  {
    slug: "fort-payne",
    name: "Fort Payne, AL",
    state: "AL",
    lat: 34.4443,
    lng: -85.7197,
    radiusMiles: 40,
    aliases: ["fort payne", "ft payne", "ft. payne", "lookout mountain alabama", "northeast alabama", "ne alabama", "dekalb county alabama"],
  },
  { slug: "mentone", name: "Mentone, AL", state: "AL", lat: 34.5687, lng: -85.5855, radiusMiles: 40, aliases: ["mentone"] },
  { slug: "cheaha", name: "Cheaha / Talladega National Forest", state: "AL", lat: 33.4855, lng: -85.8087, radiusMiles: 35, aliases: ["cheaha", "cheaha state park", "talladega national forest", "talladega nf", "mount cheaha"] },
  { slug: "sipsey", name: "Sipsey Wilderness / Bankhead National Forest", state: "AL", lat: 34.33, lng: -87.4, radiusMiles: 35, aliases: ["sipsey", "sipsey wilderness", "bankhead", "bankhead national forest"] },
  { slug: "guntersville", name: "Lake Guntersville", state: "AL", lat: 34.395, lng: -86.209, radiusMiles: 30, aliases: ["guntersville", "lake guntersville", "lake guntersville state park"] },
  { slug: "gadsden", name: "Gadsden / Noccalula Falls", state: "AL", lat: 34.04, lng: -86.022, radiusMiles: 30, aliases: ["gadsden", "noccalula", "noccalula falls"] },
  { slug: "birmingham", name: "Birmingham, AL", state: "AL", lat: 33.5186, lng: -86.8104, radiusMiles: 60, aliases: ["birmingham"] },
  { slug: "huntsville", name: "Huntsville, AL", state: "AL", lat: 34.7304, lng: -86.5861, radiusMiles: 50, aliases: ["huntsville", "monte sano"] },

  // ── Georgia ─────────────────────────────────────────────────────────
  { slug: "conyers", name: "Conyers, GA", state: "GA", lat: 33.6676, lng: -84.0177, radiusMiles: 60, aliases: ["conyers", "rockdale"] },
  { slug: "atlanta", name: "Atlanta, GA", state: "GA", lat: 33.749, lng: -84.388, radiusMiles: 70, aliases: ["atlanta", "metro atlanta"] },
  { slug: "helen", name: "Helen / Chattahoochee headwaters", state: "GA", lat: 34.7026, lng: -83.7285, radiusMiles: 30, aliases: ["helen", "helen ga", "unicoi", "anna ruby falls"] },
  { slug: "blue-ridge", name: "Blue Ridge, GA", state: "GA", lat: 34.864, lng: -84.324, radiusMiles: 30, aliases: ["blue ridge", "blue ridge ga", "toccoa river", "aska"] },
  { slug: "dahlonega", name: "Dahlonega, GA", state: "GA", lat: 34.5326, lng: -83.9849, radiusMiles: 30, aliases: ["dahlonega"] },
  { slug: "tallulah-gorge", name: "Tallulah Gorge", state: "GA", lat: 34.7393, lng: -83.3922, radiusMiles: 30, aliases: ["tallulah", "tallulah gorge", "tallulah falls", "clayton ga", "rabun"] },
  { slug: "amicalola", name: "Amicalola Falls", state: "GA", lat: 34.5594, lng: -84.2489, radiusMiles: 30, aliases: ["amicalola", "amicalola falls", "springer mountain"] },
  { slug: "cohutta", name: "Cohutta Wilderness", state: "GA", lat: 34.9, lng: -84.6, radiusMiles: 30, aliases: ["cohutta", "cohutta wilderness", "conasauga", "jacks river"] },
  { slug: "vogel", name: "Vogel State Park / Blood Mountain", state: "GA", lat: 34.766, lng: -83.923, radiusMiles: 25, aliases: ["vogel", "vogel state park", "blood mountain", "neels gap"] },
  { slug: "ellijay", name: "Ellijay, GA", state: "GA", lat: 34.695, lng: -84.482, radiusMiles: 30, aliases: ["ellijay"] },
  { slug: "cloudland-canyon", name: "Cloudland Canyon", state: "GA", lat: 34.836, lng: -85.483, radiusMiles: 30, aliases: ["cloudland", "cloudland canyon", "lookout mountain georgia", "trenton ga"] },
  { slug: "north-georgia", name: "North Georgia mountains", state: "GA", lat: 34.75, lng: -83.9, radiusMiles: 60, aliases: ["north georgia", "north ga", "north georgia mountains", "chattahoochee national forest", "chattahoochee nf"] },
  { slug: "cumberland-island", name: "Cumberland Island", state: "GA", lat: 30.85, lng: -81.45, radiusMiles: 30, aliases: ["cumberland island", "st marys"] },
  { slug: "okefenokee", name: "Okefenokee Swamp", state: "GA", lat: 30.83, lng: -82.36, radiusMiles: 40, aliases: ["okefenokee", "stephen foster"] },
  { slug: "providence-canyon", name: "Providence Canyon", state: "GA", lat: 32.067, lng: -84.917, radiusMiles: 30, aliases: ["providence canyon", "little grand canyon"] },
  { slug: "pine-mountain", name: "Pine Mountain / F.D. Roosevelt State Park", state: "GA", lat: 32.84, lng: -84.8, radiusMiles: 30, aliases: ["pine mountain", "fdr state park", "f.d. roosevelt", "callaway"] },

  // ── Tennessee ───────────────────────────────────────────────────────
  { slug: "chattanooga", name: "Chattanooga, TN", state: "TN", lat: 35.0456, lng: -85.3097, radiusMiles: 40, aliases: ["chattanooga", "signal mountain", "prentice cooper"] },
  { slug: "smokies", name: "Great Smoky Mountains", state: "TN", lat: 35.6532, lng: -83.5070, radiusMiles: 40, aliases: ["smokies", "smoky mountains", "great smoky mountains", "gatlinburg", "cades cove", "townsend", "elkmont"] },
  { slug: "cherokee-nf", name: "Cherokee National Forest / Tellico", state: "TN", lat: 35.367, lng: -84.293, radiusMiles: 35, aliases: ["cherokee national forest", "tellico", "tellico plains", "ocoee", "hiwassee", "citico"] },
  { slug: "big-south-fork", name: "Big South Fork", state: "TN", lat: 36.49, lng: -84.7, radiusMiles: 35, aliases: ["big south fork", "bandy creek"] },
  { slug: "fall-creek-falls", name: "Fall Creek Falls", state: "TN", lat: 35.66, lng: -85.35, radiusMiles: 30, aliases: ["fall creek falls", "savage gulf", "south cumberland"] },

  // ── North Carolina ──────────────────────────────────────────────────
  { slug: "asheville", name: "Asheville, NC", state: "NC", lat: 35.5951, lng: -82.5515, radiusMiles: 40, aliases: ["asheville", "blue ridge parkway"] },
  { slug: "pisgah", name: "Pisgah National Forest / Brevard", state: "NC", lat: 35.283, lng: -82.79, radiusMiles: 35, aliases: ["pisgah", "brevard", "davidson river", "dupont", "looking glass"] },
  { slug: "nantahala", name: "Nantahala / Bryson City", state: "NC", lat: 35.43, lng: -83.45, radiusMiles: 35, aliases: ["nantahala", "bryson city", "franklin nc", "highlands nc", "cashiers"] },
  { slug: "boone", name: "Boone / High Country", state: "NC", lat: 36.2168, lng: -81.6746, radiusMiles: 35, aliases: ["boone", "blowing rock", "grandfather mountain", "linville"] },
  { slug: "great-smokies-nc", name: "Smokies — NC side (Cherokee)", state: "NC", lat: 35.474, lng: -83.315, radiusMiles: 35, aliases: ["cherokee nc", "smokemont", "deep creek"] },

  // ── South Carolina ──────────────────────────────────────────────────
  { slug: "table-rock", name: "Table Rock / Upstate SC", state: "SC", lat: 35.03, lng: -82.70, radiusMiles: 35, aliases: ["table rock", "upstate", "jocassee", "caesars head", "oconee"] },
  { slug: "congaree", name: "Congaree National Park", state: "SC", lat: 33.79, lng: -80.78, radiusMiles: 30, aliases: ["congaree"] },

  // ── Florida ─────────────────────────────────────────────────────────
  { slug: "ocala", name: "Ocala National Forest", state: "FL", lat: 29.17, lng: -81.8, radiusMiles: 40, aliases: ["ocala", "ocala national forest", "juniper springs", "alexander springs"] },
  { slug: "apalachicola", name: "Apalachicola National Forest", state: "FL", lat: 30.2, lng: -84.7, radiusMiles: 40, aliases: ["apalachicola", "st marks", "wakulla"] },
];

/** Home reference for drive estimates (owner's base — metro Atlanta east side). */
export const HOME_REFERENCE = { name: "Conyers, GA", lat: 33.6676, lng: -84.0177 };

function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\b(near|around|close to|by|in|at|the|camping|campground|campgrounds|camp|trip|to)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Match against the gazetteer only (sync, no network). */
export function matchGazetteer(query: string): Place | null {
  const q = norm(query);
  if (!q) return null;
  let best: { p: GazetteerEntry; score: number } | null = null;
  for (const p of GAZETTEER) {
    const names = [p.name.toLowerCase(), p.slug.replace(/-/g, " "), ...(p.aliases || [])];
    for (const n of names) {
      const nn = norm(n);
      if (!nn) continue;
      let score = 0;
      if (q === nn) score = 100;
      else if (q.includes(nn)) score = 60 + nn.length; // longer alias = more specific
      else if (nn.includes(q) && q.length >= 5) score = 40 + q.length;
      if (score > 0 && (!best || score > best.score)) best = { p, score };
    }
  }
  return best ? { ...best.p, source: "gazetteer" } : null;
}

const NOMINATIM_UA = "ImmerseCampPlanner/1.0 (nature immersion; hello@unitedundergod.org)";

/** Geocode with Nominatim (US only). Cached 24h. Returns null on any failure. */
export async function geocodeNominatim(query: string): Promise<Place | null> {
  const q = query.trim().slice(0, 100);
  if (q.length < 3) return null;
  try {
    const sp = new URLSearchParams({
      q,
      format: "jsonv2",
      limit: "1",
      countrycodes: "us",
      addressdetails: "1",
    });
    const res = await fetch(`https://nominatim.openstreetmap.org/search?${sp}`, {
      headers: { "user-agent": NOMINATIM_UA, accept: "application/json" },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const rows = (await res.json()) as Array<{
      lat: string;
      lon: string;
      display_name?: string;
      name?: string;
      type?: string;
      addresstype?: string;
      address?: { state?: string; ["ISO3166-2-lvl4"]?: string };
    }>;
    const r = rows?.[0];
    if (!r) return null;
    const lat = Number(r.lat);
    const lng = Number(r.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    const iso = r.address?.["ISO3166-2-lvl4"] || "";
    const state = iso.startsWith("US-") ? iso.slice(3) : "";
    const kind = (r.addresstype || r.type || "").toLowerCase();
    // Cities/towns → moderate radius; parks/natural features → tighter
    const radiusMiles = ["city", "town", "county", "state"].includes(kind) ? 40 : 30;
    const label = r.name || (r.display_name || q).split(",")[0];
    return {
      slug: `osm-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`,
      name: state ? `${label}, ${state}` : label,
      state,
      lat,
      lng,
      radiusMiles,
      source: "nominatim",
    };
  } catch {
    return null;
  }
}

/** True when the query reads like a place (letters, spaces) rather than a keyword like "waterfalls". */
const KEYWORD_ONLY = new Set([
  "waterfall", "waterfalls", "falls", "swimming", "swim", "creek", "river", "lake", "hiking", "trail",
  "quiet", "shade", "tent", "rv", "cabin", "cabins", "free", "dispersed", "primitive", "backcountry",
  "hammock", "kayak", "fishing", "ohv", "atv", "beach", "mountain", "mountains", "canyon", "cave",
]);

export function looksLikePlace(query: string): boolean {
  const q = norm(query);
  if (!q) return false;
  const tokens = q.split(" ").filter(Boolean);
  if (tokens.every((t) => KEYWORD_ONLY.has(t))) return false;
  return true;
}

/** Full resolution: gazetteer first, then Nominatim if the query looks like a place. */
export async function resolvePlace(query?: string | null): Promise<Place | null> {
  if (!query) return null;
  const g = matchGazetteer(query);
  if (g) return g;
  if (!looksLikePlace(query)) return null;
  return geocodeNominatim(query);
}

export function findGazetteer(slug: string): Place | null {
  const p = GAZETTEER.find((g) => g.slug === slug);
  return p ? { ...p, source: "gazetteer" } : null;
}
