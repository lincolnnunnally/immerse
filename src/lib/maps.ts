/**
 * Map helpers — research maps in-app; navigation via the user's preferred app.
 * We do not build turn-by-turn navigation (Apple / Google / Waze already own that).
 */

export type MapPin = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  href?: string;
  type?: string;
};

export function hasValidCoords(lat?: number | null, lng?: number | null): boolean {
  if (lat == null || lng == null) return false;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  if (lat === 0 && lng === 0) return false;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return false;
  return true;
}

/** Google Maps directions (works on web + Android; iOS often offers choice). */
export function googleMapsDirectionsUrl(lat: number, lng: number, label?: string): string {
  const dest = label ? `${lat},${lng} (${label})` : `${lat},${lng}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}&travelmode=driving`;
}

/** Apple Maps — opens in Maps.app on iOS/macOS; web fallback elsewhere. */
export function appleMapsDirectionsUrl(lat: number, lng: number, label?: string): string {
  const params = new URLSearchParams({
    daddr: `${lat},${lng}`,
    dirflg: "d",
  });
  if (label) params.set("q", label);
  return `https://maps.apple.com/?${params.toString()}`;
}

/** Waze deep link. */
export function wazeDirectionsUrl(lat: number, lng: number): string {
  return `https://waze.com/ul?ll=${lat}%2C${lng}&navigate=yes`;
}

/** Place pin (research, not navigation). */
export function googleMapsPlaceUrl(lat: number, lng: number, label?: string): string {
  const q = label
    ? `${label}@${lat},${lng}`
    : `${lat},${lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

export function appleMapsPlaceUrl(lat: number, lng: number, label?: string): string {
  const params = new URLSearchParams({
    ll: `${lat},${lng}`,
  });
  if (label) params.set("q", label);
  return `https://maps.apple.com/?${params.toString()}`;
}

/** Rough default centers when no pins (SE US). */
export const DEFAULT_MAP_CENTER = { lat: 34.2, lng: -83.9, zoom: 7 };
