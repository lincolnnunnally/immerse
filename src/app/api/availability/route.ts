import { NextRequest, NextResponse } from "next/server";
import { getCampgroundAvailabilityMonth } from "@/lib/ridb";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const facilityId = searchParams.get("facilityId");
  const year = Number(searchParams.get("year") || new Date().getFullYear());
  const month = Number(searchParams.get("month") || new Date().getMonth() + 1);

  if (!facilityId) {
    return NextResponse.json({ error: "facilityId required" }, { status: 400 });
  }

  try {
    const data = await getCampgroundAvailabilityMonth(facilityId, year, month);

    // Summarize: how many sites have at least one Available day, total Available nights, etc.
    let sitesWithAvailability = 0;
    let totalAvailableNights = 0;
    const sampleAvailableDates: string[] = [];

    Object.values(data.campsites || {}).forEach((site) => {
      const available = Object.entries(site.availabilities || {}).filter(
        ([, status]) => status === "Available"
      );
      if (available.length > 0) {
        sitesWithAvailability += 1;
        totalAvailableNights += available.length;
        available.slice(0, 3).forEach(([date]) => {
          if (sampleAvailableDates.length < 10 && !sampleAvailableDates.includes(date)) {
            sampleAvailableDates.push(date);
          }
        });
      }
    });

    return NextResponse.json({
      facilityId,
      year,
      month,
      totalCampsites: data.count,
      sitesWithAvailability,
      totalAvailableNights,
      sampleAvailableDates: sampleAvailableDates.sort(),
      // full payload available if client wants it later
      // campsites: data.campsites,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch availability", detail: String(err) },
      { status: 502 }
    );
  }
}
