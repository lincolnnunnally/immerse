/**
 * Recreation.gov public campground availability.
 * Retries on 429, browser-like headers, month calendars for scheduling.
 */

export type DayStatus =
  | "Available"
  | "Reserved"
  | "Not Reservable"
  | "NYR" // not yet released
  | "Closed"
  | string;

export type MonthAvailability = {
  facilityId: string;
  year: number;
  month: number;
  totalCampsites: number;
  sitesWithAvailability: number;
  totalAvailableNights: number;
  /** Unique calendar days that have at least one open site (YYYY-MM-DD) */
  availableDates: string[];
  /** Per-day aggregate: open site count that night */
  dayOpenCounts: Record<string, number>;
  sampleAvailableDates: string[];
};

const UA =
  "Mozilla/5.0 (compatible; ImmerseCampPlanner/1.1; +https://immerse.unitedundergod.org)";

function monthStartIso(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}-01T00:00:00.000Z`;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Fetch one month of availability. Retries on 429/503.
 */
export async function fetchCampgroundMonth(
  facilityId: string | number,
  year: number,
  month: number,
  opts?: { attempts?: number }
): Promise<{
  campsites: Record<
    string,
    {
      campsite_id?: string;
      site?: string;
      loop?: string;
      availabilities?: Record<string, DayStatus>;
    }
  >;
  count: number;
}> {
  const id = String(facilityId);
  if (!/^\d{1,12}$/.test(id)) {
    throw new Error("Invalid facility id");
  }

  const start = monthStartIso(year, month);
  const url = `https://www.recreation.gov/api/camps/availability/campground/${id}/month?start_date=${encodeURIComponent(start)}`;
  const attempts = opts?.attempts ?? 4;
  let lastErr: Error | null = null;

  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, {
        headers: {
          accept: "application/json, text/plain, */*",
          "user-agent": UA,
          origin: "https://www.recreation.gov",
          referer: `https://www.recreation.gov/camping/campgrounds/${id}`,
        },
        // Cache at the edge briefly; availability changes often
        next: { revalidate: 120 },
      });

      if (res.status === 429 || res.status === 503) {
        lastErr = new Error(`Availability ${res.status}`);
        // Respect Retry-After when present
        const ra = Number(res.headers.get("retry-after"));
        const wait = Number.isFinite(ra) && ra > 0 ? ra * 1000 : 400 * Math.pow(2, i);
        await sleep(wait);
        continue;
      }

      if (!res.ok) {
        throw new Error(`Availability ${res.status}`);
      }

      return (await res.json()) as {
        campsites: Record<string, { availabilities?: Record<string, DayStatus> }>;
        count: number;
      };
    } catch (e) {
      lastErr = e instanceof Error ? e : new Error(String(e));
      if (i < attempts - 1) await sleep(350 * Math.pow(2, i));
    }
  }

  throw lastErr || new Error("Availability failed");
}

export function summarizeMonth(
  facilityId: string,
  year: number,
  month: number,
  data: {
    campsites?: Record<string, { availabilities?: Record<string, DayStatus> }>;
    count?: number;
  }
): MonthAvailability {
  const dayOpenCounts: Record<string, number> = {};
  let sitesWithAvailability = 0;
  let totalAvailableNights = 0;

  Object.values(data.campsites || {}).forEach((site) => {
    const available = Object.entries(site.availabilities || {}).filter(
      ([, status]) => status === "Available"
    );
    if (available.length > 0) {
      sitesWithAvailability += 1;
      totalAvailableNights += available.length;
      available.forEach(([date]) => {
        const day = date.slice(0, 10);
        dayOpenCounts[day] = (dayOpenCounts[day] || 0) + 1;
      });
    }
  });

  const availableDates = Object.keys(dayOpenCounts).sort();
  // Prefer upcoming days only
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = availableDates.filter((d) => d >= today);

  return {
    facilityId: String(facilityId),
    year,
    month,
    totalCampsites: data.count ?? Object.keys(data.campsites || {}).length,
    sitesWithAvailability,
    totalAvailableNights,
    availableDates: upcoming.length ? upcoming : availableDates,
    dayOpenCounts,
    sampleAvailableDates: (upcoming.length ? upcoming : availableDates).slice(0, 14),
  };
}

/** Build Recreation.gov deep link with stay dates when possible. */
export function recreationGovStayUrl(
  facilityId: string,
  arrivalYmd: string,
  nights: number,
  baseReservationUrl?: string
): string {
  const base =
    baseReservationUrl ||
    `https://www.recreation.gov/camping/campgrounds/${facilityId}`;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(arrivalYmd) || nights < 1) return base;

  const start = new Date(`${arrivalYmd}T12:00:00Z`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + nights);
  const endYmd = end.toISOString().slice(0, 10);

  // Recreation.gov accepts several param shapes; these are widely used on their web UI
  const u = new URL(base.split("?")[0]);
  u.searchParams.set("startDate", arrivalYmd);
  u.searchParams.set("endDate", endYmd);
  return u.toString();
}

/** Default month to show: current if early in month, else next (more planning room). */
export function defaultPlanMonth(now = new Date()): { year: number; month: number } {
  const day = now.getDate();
  let year = now.getFullYear();
  let month = now.getMonth() + 1;
  if (day >= 20) {
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }
  return { year, month };
}

export function addDaysYmd(ymd: string, days: number): string {
  const d = new Date(`${ymd}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** True if every night from arrival for `nights` has some open site. */
export function stayIsOpen(
  availableDates: Set<string> | string[],
  arrivalYmd: string,
  nights: number
): boolean {
  const set = availableDates instanceof Set ? availableDates : new Set(availableDates);
  for (let i = 0; i < nights; i++) {
    if (!set.has(addDaysYmd(arrivalYmd, i))) return false;
  }
  return true;
}
