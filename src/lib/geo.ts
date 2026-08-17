/**
 * Small geo helpers: distance, bearings-free "how far", and sunrise/sunset.
 * No external services — safe to call anywhere.
 */

const EARTH_RADIUS_MI = 3958.7613;

export function haversineMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_MI * Math.asin(Math.min(1, Math.sqrt(a)));
}

/** Rough drive-time estimate from straight-line miles (rural SE roads ≈ 42 mph avg incl. winding roads). */
export function estimateDriveMinutes(miles: number): number {
  if (!Number.isFinite(miles) || miles <= 0) return 0;
  // Straight-line → road distance factor ~1.25, average 42 mph
  return Math.round((miles * 1.25) / 42 * 60);
}

export function formatMinutes(min: number): string {
  if (!Number.isFinite(min) || min <= 0) return "";
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

/**
 * Sunrise / sunset (NOAA algorithm, ±2 min). Returns UTC Date objects for the
 * calendar day given by ymd (YYYY-MM-DD) at lat/lng, or null for polar edge cases.
 */
export function sunTimes(
  lat: number,
  lng: number,
  ymd: string
): { sunrise: Date; sunset: Date } | null {
  const [y, m, d] = ymd.split("-").map(Number);
  if (!y || !m || !d) return null;

  const rad = Math.PI / 180;
  const zenith = 90.833; // official
  const dayOfYear = Math.floor(
    (Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 0)) / 86400000
  );
  const lngHour = lng / 15;

  const compute = (rising: boolean): number | null => {
    const t = dayOfYear + ((rising ? 6 : 18) - lngHour) / 24;
    const M = 0.9856 * t - 3.289;
    let L =
      M + 1.916 * Math.sin(M * rad) + 0.02 * Math.sin(2 * M * rad) + 282.634;
    L = ((L % 360) + 360) % 360;
    let RA = Math.atan(0.91764 * Math.tan(L * rad)) / rad;
    RA = ((RA % 360) + 360) % 360;
    const Lq = Math.floor(L / 90) * 90;
    const RAq = Math.floor(RA / 90) * 90;
    RA = (RA + (Lq - RAq)) / 15;
    const sinDec = 0.39782 * Math.sin(L * rad);
    const cosDec = Math.cos(Math.asin(sinDec));
    const cosH =
      (Math.cos(zenith * rad) - sinDec * Math.sin(lat * rad)) /
      (cosDec * Math.cos(lat * rad));
    if (cosH > 1 || cosH < -1) return null;
    let H = rising ? 360 - Math.acos(cosH) / rad : Math.acos(cosH) / rad;
    H = H / 15;
    const T = H + RA - 0.06571 * t - 6.622;
    let UT = T - lngHour;
    UT = ((UT % 24) + 24) % 24;
    return UT; // hours UTC
  };

  const riseUT = compute(true);
  const setUT = compute(false);
  if (riseUT == null || setUT == null) return null;

  const base = Date.UTC(y, m - 1, d);
  return {
    sunrise: new Date(base + riseUT * 3600000),
    sunset: new Date(base + setUT * 3600000),
  };
}

export function formatLocalTime(date: Date, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone,
    }).format(date);
  } catch {
    return date.toISOString().slice(11, 16) + "Z";
  }
}

export function todayYmd(timeZone = "America/Chicago"): string {
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());
    const get = (t: string) => parts.find((p) => p.type === t)?.value || "";
    return `${get("year")}-${get("month")}-${get("day")}`;
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}
