"use client";

import { useEffect, useState } from "react";

type AvailabilitySummary = {
  facilityId: string;
  year: number;
  month: number;
  totalCampsites: number;
  sitesWithAvailability: number;
  totalAvailableNights: number;
  sampleAvailableDates: string[];
  error?: string;
};

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function formatDate(iso: string): string {
  // iso like 2026-08-15T00:00:00Z
  const d = iso.slice(0, 10);
  const [, m, day] = d.split("-");
  return `${MONTH_NAMES[Number(m) - 1]?.slice(0, 3) || m} ${Number(day)}`;
}

export function AvailabilityPanel({
  facilityId,
  reservationUrl,
}: {
  facilityId: string | null;
  reservationUrl?: string;
}) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [data, setData] = useState<AvailabilitySummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!facilityId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/availability?facilityId=${facilityId}&year=${year}&month=${month}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || json.detail || "Failed to load");
        if (!cancelled) setData(json);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(String(err.message || err));
          setData(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [facilityId, year, month]);

  function shiftMonth(delta: number) {
    let m = month + delta;
    let y = year;
    if (m < 1) {
      m = 12;
      y -= 1;
    } else if (m > 12) {
      m = 1;
      y += 1;
    }
    setMonth(m);
    setYear(y);
  }

  if (!facilityId) {
    return (
      <section className="bg-white rounded-2xl border border-forest-100 p-6 mb-8 shadow-sm">
        <h2 className="font-semibold text-forest-900 mb-2 text-lg">Availability</h2>
        <p className="text-sm text-forest-600">
          Live calendars are available for reservable Recreation.gov campgrounds. This site is
          first-come or not linked to a numeric facility ID yet.
        </p>
        {reservationUrl && (
          <a
            href={reservationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-3 text-sm font-medium text-forest-700 hover:underline"
          >
            Check on Recreation.gov →
          </a>
        )}
      </section>
    );
  }

  return (
    <section className="bg-white rounded-2xl border border-forest-100 p-6 mb-8 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="font-semibold text-forest-900 text-lg">Availability</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            className="w-8 h-8 rounded-full border border-forest-200 text-forest-700 hover:bg-forest-50"
            aria-label="Previous month"
          >
            ‹
          </button>
          <span className="text-sm font-medium text-forest-800 min-w-[7.5rem] text-center">
            {MONTH_NAMES[month - 1]} {year}
          </span>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            className="w-8 h-8 rounded-full border border-forest-200 text-forest-700 hover:bg-forest-50"
            aria-label="Next month"
          >
            ›
          </button>
        </div>
      </div>

      {loading && (
        <p className="text-sm text-forest-500">Loading calendar from Recreation.gov…</p>
      )}

      {error && !loading && (
        <div className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-lg p-3">
          <p className="font-medium">Could not load availability</p>
          <p className="mt-1 text-amber-700">{error}</p>
          {reservationUrl && (
            <a
              href={reservationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 font-medium underline"
            >
              Open on Recreation.gov →
            </a>
          )}
        </div>
      )}

      {data && !loading && !error && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-forest-50 rounded-xl py-3 px-2">
              <p className="text-2xl font-bold text-forest-900">{data.totalCampsites}</p>
              <p className="text-xs text-forest-600">Total sites</p>
            </div>
            <div className="bg-emerald-50 rounded-xl py-3 px-2">
              <p className="text-2xl font-bold text-emerald-800">{data.sitesWithAvailability}</p>
              <p className="text-xs text-emerald-700">Sites with openings</p>
            </div>
            <div className="bg-sky-50 rounded-xl py-3 px-2">
              <p className="text-2xl font-bold text-sky-800">{data.totalAvailableNights}</p>
              <p className="text-xs text-sky-700">Available nights</p>
            </div>
          </div>

          {data.sampleAvailableDates.length > 0 ? (
            <div>
              <p className="text-xs text-forest-500 mb-2">Sample available dates this month</p>
              <div className="flex flex-wrap gap-1.5">
                {data.sampleAvailableDates.map((d) => (
                  <span
                    key={d}
                    className="text-xs bg-emerald-100 text-emerald-900 px-2 py-1 rounded-full"
                  >
                    {formatDate(d)}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-forest-600">
              No open nights found for this month in the public calendar. Try the next month or check
              Recreation.gov for cancellations.
            </p>
          )}

          {reservationUrl && (
            <a
              href={reservationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex mt-2 text-sm font-semibold text-forest-700 hover:underline"
            >
              Book on Recreation.gov →
            </a>
          )}
        </div>
      )}
    </section>
  );
}
