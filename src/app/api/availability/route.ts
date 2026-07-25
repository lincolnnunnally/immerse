import { NextRequest, NextResponse } from "next/server";
import { getCampgroundAvailabilityMonth } from "@/lib/ridb";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const facilityId = searchParams.get("facilityId");
  const now = new Date();
  const year = Number(searchParams.get("year") || now.getFullYear());
  const month = Number(searchParams.get("month") || now.getMonth() + 1);

  // facilityId is interpolated into an external Recreation.gov URL — allow only
  // digits so it can't be used to reshape the request (SSRF / injection guard).
  if (!facilityId || !/^\d{1,10}$/.test(facilityId)) {
    return NextResponse.json({ error: "Valid numeric facilityId required" }, { status: 400 });
  }
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    return NextResponse.json({ error: "Invalid year" }, { status: 400 });
  }
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    return NextResponse.json({ error: "Invalid month" }, { status: 400 });
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
