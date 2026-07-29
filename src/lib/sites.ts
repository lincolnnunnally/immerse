/**
 * Single resolver for camp sites — curated mock + live federal.
 * DC-5: one getSite path for search cards, detail pages, and booking.
 */

import { getSiteById as getMockSite, mockSites } from "./mock-sites";
import { getFacility, mapFacilityToCampSite } from "./ridb";
import { getRecGovCampground, mapRecGovToCampSite } from "./recgov";
import type { CampSite } from "./types";

export async function resolveSite(id: string): Promise<CampSite | null> {
  if (!id) return null;

  // Curated / private / dispersed always win on known ids
  const curated = getMockSite(id);
  if (curated) return curated;

  // Numeric = federal facility (Recreation.gov / RIDB id)
  if (/^\d{1,12}$/.test(id)) {
    if (process.env.RIDB_API_KEY) {
      try {
        const f = await getFacility(id);
        if (f) {
          const mapped = mapFacilityToCampSite(f);
          mapped.dataSource = "ridb";
          return mapped;
        }
      } catch {
        // fall through to rec.gov
      }
    }

    const rg = await getRecGovCampground(id);
    if (rg) return mapRecGovToCampSite(rg);
  }

  return null;
}

export function listCuratedForState(state: string): CampSite[] {
  if (state.toUpperCase() !== "GA") return [];
  return [...mockSites];
}

export { mockSites };
