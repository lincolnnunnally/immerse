/**
 * Curated (hand-verified) sites by state. Live federal inventory (RIDB /
 * Recreation.gov) is the backbone; curated entries add what it can't see —
 * state parks, county parks, dispersed / WMA / OHV, destinations (canyons,
 * waterfalls), and example private nature stays.
 */

import { mockSites } from "./mock-sites";
import { alabamaSites } from "./curated-al";
import { haversineMiles } from "./geo";
import type { CampSite } from "./types";

export const CURATED_BY_STATE: Record<string, CampSite[]> = {
  GA: mockSites,
  AL: alabamaSites,
};

export function allCurated(): CampSite[] {
  return Object.values(CURATED_BY_STATE).flat();
}

export function curatedForState(state: string): CampSite[] {
  return CURATED_BY_STATE[state.toUpperCase()] || [];
}

export function getCuratedById(id: string): CampSite | undefined {
  for (const list of Object.values(CURATED_BY_STATE)) {
    const hit = list.find((s) => s.id === id);
    if (hit) return hit;
  }
  return undefined;
}

/** Curated sites within `radiusMiles` of a point (any state), nearest first. */
export function curatedNear(lat: number, lng: number, radiusMiles: number): CampSite[] {
  return allCurated()
    .map((s) => ({ s, d: haversineMiles(lat, lng, s.lat, s.lng) }))
    .filter((x) => x.d <= radiusMiles)
    .sort((a, b) => a.d - b.d)
    .map((x) => x.s);
}

export function curatedStates(): string[] {
  return Object.keys(CURATED_BY_STATE);
}
