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

/**
 * Public (no key) Recreation.gov availability endpoint.
 * start_date MUST be the first of the month: YYYY-MM-01T00:00:00.000Z
 */
export async function getCampgroundAvailabilityMonth(
  facilityId: string | number,
  year: number,
  month: number // 1-12
) {
  const start = `${year}-${String(month).padStart(2, "0")}-01T00:00:00.000Z`;
  const url = `https://www.recreation.gov/api/camps/availability/campground/${facilityId}/month?start_date=${encodeURIComponent(start)}`;

  const res = await fetch(url, {
    headers: {
      accept: "application/json",
      "user-agent": "ImmerseCampPlanner/0.1 (nature immersion tool)",
    },
    next: { revalidate: 300 }, // 5 min cache for availability
  });

  if (!res.ok) {
    throw new Error(`Availability ${res.status}`);
  }

  return res.json() as Promise<{
    campsites: Record<
      string,
      {
        campsite_id: string;
        site: string;
        loop: string;
        campsite_type: string;
        campsite_reserve_type: string;
        availabilities: Record<string, string>; // date -> "Available" | "Reserved" | ...
        max_num_people?: number;
        min_num_people?: number;
        type_of_use?: string;
      }
    >;
    count: number;
  }>;
}

/**
 * Map a RIDB facility into our CampSite shape (partial – we enrich further later).
 */
export function mapFacilityToCampSite(f: RIDBFacility): import("./types").CampSite {
  const id = String(f.FacilityID);
  const reservable = f.Reservable === true || String(f.FacilityReservationURL || "").includes("recreation.gov");

  return {
    id,
    name: f.FacilityName || "Unnamed Facility",
    type: "developed",
    agency: (f as any).OrgName || (f as any).OrganizationName || "Federal",
    lat: Number(f.FacilityLatitude) || 0,
    lng: Number(f.FacilityLongitude) || 0,
    reservationRequired: !!reservable,
    reservationUrl: f.FacilityReservationURL || `https://www.recreation.gov/camping/campgrounds/${id}`,
    bookingWindow: "Typically 6 months rolling (check site)",
    passRequired: "Check site (America the Beautiful often covers day-use; camping fees separate)",
    parkingFee: "See facility details",
    campingFee: "See Recreation.gov",
    amenities: [],
    mustSees: [],
    description: stripHtml(f.FacilityDescription || ""),
    notes: f.StayLimit ? `Stay limit: ${f.StayLimit}` : undefined,
  };
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 600);
}
