import { NextRequest, NextResponse } from "next/server";
import { searchFacilities, mapFacilityToCampSite } from "@/lib/ridb";
import { mockSites } from "@/lib/mock-sites";
import { CampSite } from "@/lib/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const state = (searchParams.get("state") || "GA").toUpperCase().slice(0, 2);
  const clamp = (n: number, lo: number, hi: number, dflt: number) =>
    Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : dflt;
  const radius = clamp(Number(searchParams.get("radius")), 1, 500, 100);
  const query = (searchParams.get("q") || undefined)?.slice(0, 120);
  const limit = clamp(Number(searchParams.get("limit")), 1, 200, 50);
  const activityFilter = (searchParams.get("activity") || "camping").toLowerCase();

  if (process.env.RIDB_API_KEY) {
    try {
      const activityParam = activityFilter === "ohv" ? undefined : "9";

      const params: Parameters<typeof searchFacilities>[0] = {
        state,
        radius,
        limit,
        query,
        activity: activityParam,
      };

      if (lat && lng) {
        params.latitude = Number(lat);
        params.longitude = Number(lng);
      }

      const { facilities, total } = await searchFacilities(params);

      let sites: CampSite[] = facilities
        .filter((f) => f.FacilityLatitude && f.FacilityLongitude)
        .map((f) => {
          const mapped = mapFacilityToCampSite(f);
          mapped.dataSource = "ridb";
          mapped.landManager = inferLandManager(f);
          return mapped;
        });

      if (state === "GA") {
        const curatedExtra = mockSites.filter(
          (s) =>
            s.type === "dispersed" ||
            s.type === "wma" ||
            s.type === "ohv" ||
            s.type === "private"
        );
        const existingNames = new Set(sites.map((s) => s.name.toLowerCase()));
        curatedExtra.forEach((c) => {
          if (!existingNames.has(c.name.toLowerCase())) {
            sites.push(c);
          }
        });
      }

      if (activityFilter === "ohv") {
        sites = sites.filter(
          (s) =>
            s.ohvFriendly ||
            s.type === "ohv" ||
            (s.activities || []).some(
              (a) => a.toLowerCase().includes("ohv") || a.toLowerCase().includes("4x4")
            )
        );
      }

      return NextResponse.json({
        source: "ridb",
        state,
        total,
        count: sites.length,
        sites,
      });
    } catch (err) {
      console.error("RIDB search failed, falling back to mock:", err);
    }
  }

  let sites = state === "GA" ? [...mockSites] : [];

  if (query) {
    const q = query.toLowerCase();
    sites = sites.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        (s.mustSees || []).some((m) => m.toLowerCase().includes(q)) ||
        (s.activities || []).some((a) => a.toLowerCase().includes(q))
    );
  }

  if (activityFilter === "ohv") {
    sites = sites.filter((s) => s.ohvFriendly || s.type === "ohv");
  } else if (activityFilter === "dispersed") {
    sites = sites.filter((s) => s.type === "dispersed" || s.type === "wma");
  } else if (activityFilter === "private") {
    sites = sites.filter((s) => s.type === "private");
  }

  return NextResponse.json({
    source: "mock",
    state,
    total: sites.length,
    count: sites.length,
    sites,
    message: process.env.RIDB_API_KEY
      ? "RIDB call failed – showing curated data"
      : state === "GA"
      ? "No RIDB_API_KEY yet – showing curated Georgia data (NF + dispersed + WMAs + OHV + private nature stays). Drop the key in .env.local and restart for live federal results."
      : `No RIDB_API_KEY and no curated set for ${state} yet. Add the free key from ridb.recreation.gov to search federal lands nationwide.`,
  });
}

function inferLandManager(f: {
  FacilityTypeDescription?: string;
  [key: string]: unknown;
}): CampSite["landManager"] {
  const org = String(
    (f as any).OrgName || (f as any).OrganizationName || ""
  ).toLowerCase();
  if (org.includes("forest") || org.includes("usfs")) return "USFS";
  if (org.includes("national park") || org.includes("nps")) return "NPS";
  if (org.includes("blm") || org.includes("land management")) return "BLM";
  if (org.includes("corps") || org.includes("usace")) return "USACE";
  if (org.includes("fish") || org.includes("wildlife") || org.includes("fws"))
    return "FWS";
  return "Other";
}
