/**
 * Recreation.gov public search + campground detail (no API key required).
 * Used when RIDB_API_KEY is not set so federal campgrounds still work live.
 * Be polite: cache responses, modest limits.
 */

import type { CampSite, LandManager } from "./types";

const UA = "ImmerseCampPlanner/1.0 (nature immersion; unitedundergod.org)";

/** Approximate search centers for SE states (camping-rich areas). */
export const STATE_SEARCH_CENTERS: Record<
  string,
  { lat: number; lng: number; radius: number; label: string }
> = {
  GA: { lat: 34.25, lng: -83.9, radius: 160, label: "Georgia" },
  NC: { lat: 35.5, lng: -82.5, radius: 160, label: "North Carolina" },
  SC: { lat: 34.5, lng: -81.5, radius: 140, label: "South Carolina" },
  TN: { lat: 35.7, lng: -84.5, radius: 160, label: "Tennessee" },
  AL: { lat: 33.5, lng: -86.5, radius: 150, label: "Alabama" },
  FL: { lat: 29.5, lng: -82.5, radius: 180, label: "Florida" },
};

export interface RecGovSearchResult {
  entity_id: string;
  name: string;
  description?: string;
  latitude?: string | number;
  longitude?: string | number;
  org_name?: string;
  parent_name?: string;
  state_code?: string;
  city?: string;
  reservable?: boolean;
  preview_image_url?: string;
  average_rating?: number;
  number_of_ratings?: number;
  campsites_count?: string | number;
  activities?: { activity_name?: string }[];
  addresses?: { state_code?: string; city?: string }[];
  directions?: string;
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 700);
}

async function recgovFetch<T>(url: string, revalidate = 1800): Promise<T> {
  const res = await fetch(url, {
    headers: { accept: "application/json", "user-agent": UA },
    next: { revalidate },
  });
  if (!res.ok) {
    throw new Error(`Recreation.gov ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function searchRecGovCampgrounds(params: {
  state: string;
  query?: string;
  limit?: number;
  lat?: number;
  lng?: number;
  radius?: number;
}): Promise<{ results: RecGovSearchResult[]; total: number }> {
  const state = params.state.toUpperCase();
  const center = STATE_SEARCH_CENTERS[state];
  const limit = Math.min(Math.max(params.limit ?? 40, 1), 50);

  const sp = new URLSearchParams();
  sp.set("fq", "entity_type:campground");
  sp.set("size", String(limit));
  sp.set("start", "0");

  if (params.query?.trim()) {
    sp.set("q", params.query.trim().slice(0, 80));
  }

  const lat = params.lat ?? center?.lat;
  const lng = params.lng ?? center?.lng;
  const radius = params.radius ?? center?.radius ?? 120;

  if (lat != null && lng != null) {
    sp.set("lat", String(lat));
    sp.set("lng", String(lng));
    sp.set("radius", String(radius));
  }

  const data = await recgovFetch<{
    results?: RecGovSearchResult[];
    total?: number;
  }>(`https://www.recreation.gov/api/search?${sp.toString()}`);

  let results = data.results || [];

  // Prefer matches that claim the selected state when we have a code
  if (center) {
    const stateName = center.label.toLowerCase();
    const scored = results.map((r) => {
      const sc = (
        r.state_code ||
        r.addresses?.[0]?.state_code ||
        ""
      ).toLowerCase();
      const inState =
        sc === state.toLowerCase() ||
        sc === stateName ||
        sc.includes(state.toLowerCase());
      return { r, inState };
    });
    const inState = scored.filter((s) => s.inState).map((s) => s.r);
    if (inState.length >= 3) results = inState;
  }

  return { results, total: data.total ?? results.length };
}

export async function getRecGovCampground(
  facilityId: string
): Promise<RecGovSearchResult | null> {
  if (!/^\d{1,12}$/.test(facilityId)) return null;

  try {
    const data = await recgovFetch<{
      campground?: Record<string, unknown>;
    }>(`https://www.recreation.gov/api/camps/campgrounds/${facilityId}`, 3600);

    const c = data.campground;
    if (!c) return null;

    const desc =
      (c.facility_description_raw as string) ||
      (c.facility_description as string) ||
      (c.description as string) ||
      "";

    return {
      entity_id: String(c.facility_id || facilityId),
      name: String(c.facility_name || "Campground"),
      description: desc,
      latitude: c.facility_latitude as number,
      longitude: c.facility_longitude as number,
      org_name: (c.org_name as string) || undefined,
      parent_name: (c.parent_name as string) || undefined,
      reservable: Boolean(c.is_reservable ?? c.reservable ?? true),
      directions: (c.facility_directions as string) || undefined,
      city: (c.city as string) || undefined,
      state_code: (c.state_code as string) || undefined,
      preview_image_url: (c.facility_photo_url as string) || undefined,
    };
  } catch {
    // Fall back to search by id name
    try {
      const { results } = await searchRecGovCampgrounds({
        state: "GA",
        query: facilityId,
        limit: 5,
      });
      const hit = results.find((r) => String(r.entity_id) === facilityId);
      return hit || null;
    } catch {
      return null;
    }
  }
}

function inferLandManager(org?: string): LandManager {
  const o = (org || "").toLowerCase();
  if (o.includes("forest") || o.includes("usfs") || o.includes("usda")) return "USFS";
  if (o.includes("national park") || o.includes("nps")) return "NPS";
  if (o.includes("blm") || o.includes("land management")) return "BLM";
  if (o.includes("corps") || o.includes("army")) return "USACE";
  if (o.includes("fish") || o.includes("wildlife") || o.includes("fws")) return "FWS";
  if (o.includes("state park")) return "State Parks";
  return "Other";
}

export function mapRecGovToCampSite(r: RecGovSearchResult): CampSite {
  const id = String(r.entity_id);
  const activities = (r.activities || [])
    .map((a) => a.activity_name)
    .filter(Boolean) as string[];

  const desc = stripHtml(r.description || "");
  const agency = r.org_name
    ? r.parent_name
      ? `${r.org_name} — ${r.parent_name}`
      : r.org_name
    : r.parent_name || "Federal / Recreation.gov";

  return {
    id,
    name: r.name || "Campground",
    type: "developed",
    agency,
    landManager: inferLandManager(r.org_name),
    lat: Number(r.latitude) || 0,
    lng: Number(r.longitude) || 0,
    reservationRequired: r.reservable !== false,
    reservationUrl: `https://www.recreation.gov/camping/campgrounds/${id}`,
    bookingWindow: "Typically 6 months rolling (confirm on Recreation.gov)",
    passRequired:
      "Check Recreation.gov / facility page (America the Beautiful often covers day-use; camping fees separate)",
    parkingFee: "See facility details",
    campingFee: "See Recreation.gov",
    amenities: [],
    mustSees: activities.slice(0, 4),
    description:
      desc ||
      `${r.name} on Recreation.gov. Open the reservation page for current fees, passes, and site maps.`,
    notes: r.directions ? stripHtml(r.directions).slice(0, 280) : undefined,
    imageUrl: r.preview_image_url,
    activities,
    dataSource: "ridb", // live federal inventory path
    status: "unknown",
    access: "any_vehicle",
    roadQuality: "unknown",
  };
}
