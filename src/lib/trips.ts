import { createImmerseClient } from "./supabase";
import { CampSite } from "./types";

/**
 * Saved sites, persisted to the shared LPL Supabase (immerse_saved_sites) with
 * RLS so each person only sees their own. Replaces the old localStorage store,
 * so trips now sync across every device the person signs in on.
 */
export interface SavedTrip {
  id: string;
  siteId: string;
  siteName: string;
  siteType?: string;
  agency?: string;
  driveTimeMinutes?: number;
  passRequired?: string;
  reservationUrl?: string;
  savedAt: string; // ISO (created_at)
  notes?: string;
  plannedArrival?: string;
  nights?: number;
}

type Row = {
  id: string;
  site_id: string;
  site_name: string;
  site_type?: string | null;
  agency?: string | null;
  drive_time_minutes?: number | null;
  pass_required?: string | null;
  reservation_url?: string | null;
  created_at: string;
  notes?: string | null;
  planned_arrival?: string | null;
  nights?: number | null;
};

function rowToTrip(r: Row): SavedTrip {
  return {
    id: r.id,
    siteId: r.site_id,
    siteName: r.site_name,
    siteType: r.site_type ?? undefined,
    agency: r.agency ?? undefined,
    driveTimeMinutes: r.drive_time_minutes ?? undefined,
    passRequired: r.pass_required ?? undefined,
    reservationUrl: r.reservation_url ?? undefined,
    savedAt: r.created_at,
    notes: r.notes ?? undefined,
    plannedArrival: r.planned_arrival ?? undefined,
    nights: r.nights ?? undefined,
  };
}

// Session cache of saved site ids, shared by every SaveTripButton so a page of
// many cards makes one query, not one per card.
let savedIdCache: Set<string> | null = null;
let inflight: Promise<Set<string>> | null = null;

export async function currentUserId(): Promise<string | null> {
  const sb = createImmerseClient();
  if (!sb) return null;
  const { data } = await sb.auth.getUser();
  return data.user?.id ?? null;
}

export async function getSavedIds(): Promise<Set<string>> {
  if (savedIdCache) return savedIdCache;
  if (inflight) return inflight;
  const sb = createImmerseClient();
  if (!sb) {
    savedIdCache = new Set();
    return savedIdCache;
  }
  inflight = (async () => {
    const { data: u } = await sb.auth.getUser();
    if (!u.user) {
      savedIdCache = new Set();
      inflight = null;
      return savedIdCache;
    }
    const { data } = await sb.from("immerse_saved_sites").select("site_id");
    savedIdCache = new Set((data || []).map((r: { site_id: string }) => r.site_id));
    inflight = null;
    return savedIdCache;
  })();
  return inflight;
}

export function clearSavedCache() {
  savedIdCache = null;
  inflight = null;
}

export async function loadTrips(): Promise<SavedTrip[]> {
  const sb = createImmerseClient();
  if (!sb) return [];
  const { data: u } = await sb.auth.getUser();
  if (!u.user) return [];
  const { data } = await sb
    .from("immerse_saved_sites")
    .select("*")
    .order("created_at", { ascending: false });
  const trips = (data || []).map(rowToTrip);
  savedIdCache = new Set(trips.map((t) => t.siteId));
  return trips;
}

export async function isTripSaved(siteId: string): Promise<boolean> {
  const ids = await getSavedIds();
  return ids.has(siteId);
}

export async function addTrip(
  site: CampSite,
  extras?: { plannedArrival?: string; nights?: number; notes?: string }
): Promise<boolean> {
  const sb = createImmerseClient();
  if (!sb) return false;
  const { data: u } = await sb.auth.getUser();
  if (!u.user) return false;

  const { error } = await sb.from("immerse_saved_sites").upsert(
    {
      auth_user_id: u.user.id,
      site_id: site.id,
      site_name: site.name,
      site_type: site.type,
      agency: site.agency ?? null,
      land_manager: site.landManager ?? null,
      data_source: site.dataSource ?? null,
      drive_time_minutes: site.driveTimeMinutes ?? null,
      pass_required: site.passRequired ?? null,
      reservation_url: site.reservationUrl ?? null,
      latitude: site.lat ?? null,
      longitude: site.lng ?? null,
      planned_arrival: extras?.plannedArrival ?? null,
      nights: extras?.nights ?? 2,
      notes: extras?.notes ?? null,
    },
    { onConflict: "auth_user_id,site_id" }
  );
  if (error) return false;

  savedIdCache?.add(site.id);

  // Best-effort: contribute to the shared UUG growth journey.
  fetch("/api/journey", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: u.user.email,
      displayName: (u.user.user_metadata as { display_name?: string })?.display_name,
      eventType: "plan_synced",
      title: `Planned a trip to ${site.name}`,
      detail: "Chose to get into nature.",
    }),
  }).catch(() => {});

  return true;
}

export async function removeTrip(siteId: string): Promise<void> {
  const sb = createImmerseClient();
  if (!sb) return;
  const { data: u } = await sb.auth.getUser();
  if (!u.user) return;
  await sb.from("immerse_saved_sites").delete().eq("site_id", siteId);
  savedIdCache?.delete(siteId);
}

/** Extract Recreation.gov campground ID from a reservation URL when present */
export function extractFacilityId(reservationUrl?: string, siteId?: string): string | null {
  if (reservationUrl) {
    const match = reservationUrl.match(/campgrounds\/(\d+)/i);
    if (match) return match[1];
  }
  if (siteId && /^\d+$/.test(siteId)) return siteId;
  return null;
}
