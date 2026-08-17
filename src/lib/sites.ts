/**
 * Single resolver for camp sites — curated (any state) + live federal.
 * DC-5: one getSite path for search cards, detail pages, and booking.
 */

import { mockSites } from "./mock-sites";
import { curatedForState, getCuratedById } from "./curated";
import { getFacility, mapFacilityToCampSite } from "./ridb";
import { getRecGovCampground, mapRecGovToCampSite } from "./recgov";
import type { CampSite } from "./types";

export async function resolveSite(id: string): Promise<CampSite | null> {
  if (!id) return null;

  // Curated / private / dispersed / state / destination always win on known ids
  const curated = getCuratedById(id);
  if (curated) return curated;

  // Numeric = Recreation.gov facility id; UUID = RIDB-only facility (no rec.gov page)
  const isNumeric = /^\d{1,12}$/.test(id);
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  if (isNumeric || isUuid) {
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

    if (isNumeric) {
      const rg = await getRecGovCampground(id);
      if (rg) return mapRecGovToCampSite(rg);
    }
  }

  return null;
}

export function listCuratedForState(state: string): CampSite[] {
  return curatedForState(state);
}

export { mockSites };
