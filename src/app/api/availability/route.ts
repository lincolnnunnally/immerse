import { NextRequest, NextResponse } from "next/server";
import {
  defaultPlanMonth,
  fetchCampgroundMonth,
  summarizeMonth,
} from "@/lib/availability";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const facilityId = searchParams.get("facilityId");
  const dflt = defaultPlanMonth();
  const year = Number(searchParams.get("year") || dflt.year);
  const month = Number(searchParams.get("month") || dflt.month);

  // facilityId is interpolated into an external Recreation.gov URL — digits only
  if (!facilityId || !/^\d{1,12}$/.test(facilityId)) {
    return NextResponse.json(
      { error: "Valid numeric facilityId required" },
      { status: 400 }
    );
  }
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    return NextResponse.json({ error: "Invalid year" }, { status: 400 });
  }
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    return NextResponse.json({ error: "Invalid month" }, { status: 400 });
  }

  try {
    const raw = await fetchCampgroundMonth(facilityId, year, month);
    const summary = summarizeMonth(facilityId, year, month, raw);

    return NextResponse.json({
      ...summary,
      // keep old field name for any callers
      sampleAvailableDates: summary.sampleAvailableDates,
      ok: true,
    });
  } catch (err) {
    console.error("availability", facilityId, year, month, err);
    return NextResponse.json(
      {
        error: "Failed to fetch availability",
        detail: String(err),
        facilityId,
        year,
        month,
        hint: "Recreation.gov may be rate-limiting. Wait a moment and try again, or open the campground on Recreation.gov.",
      },
      { status: 502 }
    );
  }
}
