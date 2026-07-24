import { NextRequest, NextResponse } from "next/server";
import { searchFacilities, mapFacilityToCampSite } from "@/lib/ridb";
import { mockSites } from "@/lib/mock-sites";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const state = searchParams.get("state") || "GA";
  const radius = Number(searchParams.get("radius") || 75);
  const query = searchParams.get("q") || undefined;
  const limit = Number(searchParams.get("limit") || 40);

  // Prefer live RIDB when key is present
  if (process.env.RIDB_API_KEY) {
    try {
      const params: Parameters<typeof searchFacilities>[0] = {
        state,
        radius,
        limit,
        query,
        // activity filter for camping – RIDB activity IDs; 9 is commonly camping
        activity: "9",
      };

      if (lat && lng) {
        params.latitude = Number(lat);
        params.longitude = Number(lng);
      }

      const { facilities, total } = await searchFacilities(params);

      // Keep only facilities that look like camping / recreation sites with coords
      const sites = facilities
        .filter((f) => f.FacilityLatitude && f.FacilityLongitude)
        .map(mapFacilityToCampSite);

      return NextResponse.json({
        source: "ridb",
        total,
        count: sites.length,
        sites,
      });
    } catch (err) {
      console.error("RIDB search failed, falling back to mock:", err);
      // fall through to mock
    }
  }

  // Fallback: curated Georgia set so the app still works without a key
  let sites = mockSites;
  if (query) {
    const q = query.toLowerCase();
    sites = sites.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.mustSees.some((m) => m.toLowerCase().includes(q))
    );
  }

  return NextResponse.json({
    source: "mock",
    total: sites.length,
    count: sites.length,
    sites,
    message: process.env.RIDB_API_KEY
      ? "RIDB call failed – showing curated data"
      : "No RIDB_API_KEY set – showing curated Georgia starter data. Add a free key from ridb.recreation.gov",
  });
}
