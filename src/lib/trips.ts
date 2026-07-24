import { CampSite } from "./types";

export interface SavedTrip {
  id: string;
  siteId: string;
  siteName: string;
  siteType: CampSite["type"];
  agency?: string;
  driveTimeMinutes?: number;
  passRequired?: string;
  reservationUrl?: string;
  savedAt: string; // ISO
  notes?: string;
  plannedArrival?: string; // YYYY-MM-DD optional
  nights?: number;
}

const STORAGE_KEY = "immerse_trips";

export function loadTrips(): SavedTrip[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedTrip[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveTrips(trips: SavedTrip[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
}

export function isTripSaved(siteId: string): boolean {
  return loadTrips().some((t) => t.siteId === siteId);
}

export function addTrip(site: CampSite, extras?: { plannedArrival?: string; nights?: number; notes?: string }): SavedTrip {
  const trips = loadTrips();
  const existing = trips.find((t) => t.siteId === site.id);
  if (existing) return existing;

  const trip: SavedTrip = {
    id: `trip_${site.id}_${Date.now()}`,
    siteId: site.id,
    siteName: site.name,
    siteType: site.type,
    agency: site.agency,
    driveTimeMinutes: site.driveTimeMinutes,
    passRequired: site.passRequired,
    reservationUrl: site.reservationUrl,
    savedAt: new Date().toISOString(),
    plannedArrival: extras?.plannedArrival,
    nights: extras?.nights ?? 2,
    notes: extras?.notes,
  };

  trips.unshift(trip);
  saveTrips(trips);
  return trip;
}

export function removeTrip(siteId: string) {
  const trips = loadTrips().filter((t) => t.siteId !== siteId);
  saveTrips(trips);
}

/** Extract Recreation.gov campground ID from a reservation URL when present */
export function extractFacilityId(reservationUrl?: string, siteId?: string): string | null {
  if (reservationUrl) {
    const match = reservationUrl.match(/campgrounds\/(\d+)/i);
    if (match) return match[1];
  }
  // Numeric curated IDs that are real Rec.gov IDs
  if (siteId && /^\d+$/.test(siteId)) return siteId;
  return null;
}
