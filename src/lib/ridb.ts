/**
 * RIDB (Recreation Information Database) client
 * Docs: https://ridb.recreation.gov/docs
 * Get a free key: https://ridb.recreation.gov → Profile → API Keys
 *
 * Rate limit guidance: ~50 requests/minute. Be polite.
 */

const RIDB_BASE = "https://ridb.recreation.gov/api/v1";

export interface RIDBFacility {
  FacilityID: string | number;
  FacilityName: string;
  FacilityDescription?: string;
  FacilityTypeDescription?: string;
  FacilityLatitude?: number;
  FacilityLongitude?: number;
  FacilityPhone?: string;
  FacilityEmail?: string;
  FacilityReservationURL?: string;
  FacilityAdaAccess?: string;
  Reservable?: boolean;
  Enabled?: boolean;
  Keywords?: string;
  StayLimit?: string;
  // many more fields exist; we map the useful ones
  [key: string]: unknown;
}

export interface RIDBCampsite {
  CampsiteID: string | number;
  CampsiteName?: string;
  CampsiteType?: string;
  TypeOfUse?: string;
  Loop?: string;
  CampsiteReservable?: boolean | string;
  CampsiteAccessible?: boolean | string;
  [key: string]: unknown;
}

export interface RIDBSearchParams {
  latitude?: number;
  longitude?: number;
  radius?: number; // miles
  state?: string; // e.g. "GA"
  query?: string;
  activity?: string; // activity IDs, comma-separated. Camping-related often 9
  limit?: number;
  offset?: number;
  full?: "true" | "false";
}

function getApiKey(): string | undefined {
  return process.env.RIDB_API_KEY;
}

async function ridbFetch<T>(path: string, params: Record<string, string | number | undefined> = {}): Promise<T> {
  const key = getApiKey();
  if (!key) {
    throw new Error("RIDB_API_KEY is not set. Get one free at https://ridb.recreation.gov");
  }

  const url = new URL(`${RIDB_BASE}${path}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
  });

  const res = await fetch(url.toString(), {
    headers: {
      accept: "application/json",
      apikey: key,
    },
    next: { revalidate: 3600 }, // cache facility data for 1h
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`RIDB ${res.status}: ${text.slice(0, 200)}`);
  }

  return res.json() as Promise<T>;
}

export async function searchFacilities(params: RIDBSearchParams) {
  const data = await ridbFetch<{
    RECDATA: RIDBFacility[];
    METADATA: { RESULTS: { CURRENT_COUNT: number; TOTAL_COUNT: number } };
  }>("/facilities", {
    latitude: params.latitude,
    longitude: params.longitude,
    radius: params.radius ?? 50,
    state: params.state,
    query: params.query,
    activity: params.activity,
    limit: params.limit ?? 50,
    offset: params.offset ?? 0,
    full: params.full ?? "true",
  });

  return {
    facilities: data.RECDATA || [],
    total: data.METADATA?.RESULTS?.TOTAL_COUNT ?? 0,
  };
}

export async function getFacility(facilityId: string | number) {
  const data = await ridbFetch<{ RECDATA: RIDBFacility[] }>(`/facilities/${facilityId}`);
  // some versions return single object, others array under RECDATA
  if (Array.isArray(data.RECDATA)) return data.RECDATA[0] ?? null;
  return (data as unknown as RIDBFacility) || null;
}

export async function getFacilityCampsites(facilityId: string | number, limit = 50) {
  const data = await ridbFetch<{ RECDATA: RIDBCampsite[] }>(
    `/facilities/${facilityId}/campsites`,
    { limit, offset: 0 }
  );
  return data.RECDATA || [];
}

/** @deprecated use fetchCampgroundMonth from @/lib/availability */
export async function getCampgroundAvailabilityMonth(
  facilityId: string | number,
  year: number,
  month: number
) {
  const { fetchCampgroundMonth } = await import("./availability");
  return fetchCampgroundMonth(facilityId, year, month);
}

/**
 * Map a RIDB facility into our CampSite shape (partial – we enrich further later).
 */
type RIDBOrg = { OrgName?: string; OrgAbbrevName?: string; OrgType?: string; OrgID?: string | number };
type RIDBRecArea = { RecAreaName?: string; RecAreaID?: string | number };
type RIDBAddress = { AddressStateCode?: string; City?: string };

/** Human agency label from a full RIDB facility record (ORGANIZATION[] + RECAREA[]). */
export function facilityAgency(f: RIDBFacility): { agency: string; org: string; parent?: string } {
  const orgs = ((f as { ORGANIZATION?: RIDBOrg[] }).ORGANIZATION || []).filter(Boolean);
  const org =
    orgs.find((o) => o.OrgName)?.OrgName ||
    (f as { OrgName?: string }).OrgName ||
    (f as { OrganizationName?: string }).OrganizationName ||
    "";
  const parent = ((f as { RECAREA?: RIDBRecArea[] }).RECAREA || []).find((r) => r.RecAreaName)?.RecAreaName;
  const agency = org ? (parent && parent !== org ? `${org} — ${parent}` : org) : parent || "Federal / Recreation.gov";
  return { agency, org, parent };
}

export function facilityState(f: RIDBFacility): string | undefined {
  const addr = ((f as { FACILITYADDRESS?: RIDBAddress[] }).FACILITYADDRESS || []).find(
    (a) => a.AddressStateCode
  );
  return addr?.AddressStateCode?.toUpperCase();
}

export function inferLandManagerFromFacility(f: RIDBFacility): import("./types").LandManager {
  const { org, parent } = facilityAgency(f);
  const o = `${org} ${parent || ""}`.toLowerCase();
  if (o.includes("forest") || o.includes("usfs") || o.includes("usda")) return "USFS";
  if (o.includes("national park") || o.includes("nps")) return "NPS";
  if (o.includes("blm") || o.includes("land management")) return "BLM";
  if (o.includes("corps") || o.includes("usace") || o.includes("army")) return "USACE";
  if (o.includes("fish") || o.includes("wildlife") || o.includes("fws")) return "FWS";
  if (o.includes("state park")) return "State Parks";
  return "Other";
}

/** Campground vs. everything else RIDB calls a "facility" (visitor centers, trailheads, boat ramps…). */
export function facilityKind(f: RIDBFacility): "campground" | "visitor center" | "trailhead" | "day-use area" | "facility" {
  const t = String(f.FacilityTypeDescription || "").toLowerCase();
  const n = String(f.FacilityName || "").toLowerCase();
  const hasCampsites = Array.isArray((f as { CAMPSITE?: unknown[] }).CAMPSITE) && ((f as { CAMPSITE?: unknown[] }).CAMPSITE || []).length > 0;
  if (t.includes("camp") || hasCampsites) return "campground";
  if (t.includes("visitor") || n.includes("visitor center") || n.includes("canyon center")) return "visitor center";
  if (t.includes("trailhead") || n.includes("trailhead")) return "trailhead";
  if (t.includes("day use") || t.includes("picnic") || t.includes("boat")) return "day-use area";
  if (n.includes("campground") || n.includes("camp ")) return "campground";
  return "facility";
}

export function mapFacilityToCampSite(f: RIDBFacility): import("./types").CampSite {
  const id = String(f.FacilityID);
  const reservable = f.Reservable === true || String(f.FacilityReservationURL || "").includes("recreation.gov");

  // RIDB full payloads sometimes include MEDIA; otherwise UI falls back to placeholder
  // until Recreation.gov search path (or a media fetch) supplies preview_image_url.
  const media = (f as { MEDIA?: { URL?: string; MediaType?: string; IsPrimary?: boolean }[] }).MEDIA;
  const photo =
    media?.find((m) => m.URL && m.IsPrimary && String(m.MediaType || "").toLowerCase().includes("image"))?.URL ||
    media?.find((m) => m.URL && String(m.MediaType || "").toLowerCase().includes("image"))?.URL ||
    media?.find((m) => m.URL)?.URL;

  const { agency } = facilityAgency(f);
  const activities = ((f as { ACTIVITY?: { ActivityName?: string }[] }).ACTIVITY || [])
    .map((a) => a.ActivityName)
    .filter(Boolean) as string[];
  const kind = facilityKind(f);

  return {
    id,
    name: f.FacilityName || "Unnamed Facility",
    type: kind === "campground" ? "developed" : "destination",
    agency,
    landManager: inferLandManagerFromFacility(f),
    state: facilityState(f),
    phone: f.FacilityPhone || undefined,
    activities: activities.length ? activities.slice(0, 12) : undefined,
    lat: Number(f.FacilityLatitude) || 0,
    lng: Number(f.FacilityLongitude) || 0,
    reservationRequired: kind === "campground" ? !!reservable : false,
    reservationUrl:
      f.FacilityReservationURL ||
      (kind === "campground"
        ? `https://www.recreation.gov/camping/campgrounds/${id}`
        : `https://www.recreation.gov/gateways/${id}`),
    bookingWindow: kind === "campground" ? "Typically 6 months rolling (check site)" : undefined,
    passRequired:
      kind === "campground"
        ? "Check site (America the Beautiful often covers day-use; camping fees separate)"
        : "Check the facility page (day-use fees vary; many federal sites are free)",
    parkingFee: "See facility details",
    campingFee:
      kind === "campground"
        ? "See Recreation.gov"
        : `No camping here (${kind}) — camp nearby`,
    amenities: [],
    mustSees: activities.slice(0, 4),
    description: stripHtml(f.FacilityDescription || ""),
    notes: f.StayLimit ? `Stay limit: ${f.StayLimit}` : undefined,
    imageUrl: photo || undefined,
  };
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 600);
}
