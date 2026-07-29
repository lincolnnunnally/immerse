"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { CampSite } from "@/lib/types";
import {
  addDaysYmd,
  defaultPlanMonth,
  recreationGovStayUrl,
  stayIsOpen,
} from "@/lib/availability";
import { addTrip, currentUserId, isTripSaved } from "@/lib/trips";

type MonthPayload = {
  facilityId: string;
  year: number;
  month: number;
  totalCampsites: number;
  sitesWithAvailability: number;
  totalAvailableNights: number;
  availableDates: string[];
  dayOpenCounts: Record<string, number>;
  sampleAvailableDates: string[];
  error?: string;
  hint?: string;
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

function formatDay(ymd: string): string {
  const [, m, d] = ymd.split("-");
  return `${MONTH_NAMES[Number(m) - 1]?.slice(0, 3) || m} ${Number(d)}`;
}

export function ScheduleTripPanel({
  site,
  facilityId,
}: {
  site: CampSite;
  facilityId: string | null;
}) {
  const router = useRouter();
  const dflt = defaultPlanMonth();
  const [year, setYear] = useState(dflt.year);
  const [month, setMonth] = useState(dflt.month);
  const [data, setData] = useState<MonthPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [arrival, setArrival] = useState("");
  const [nights, setNights] = useState(2);
  const [busy, setBusy] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [alreadySaved, setAlreadySaved] = useState(false);

  const maxNights = site.maxStayDays && site.maxStayDays > 0 ? Math.min(site.maxStayDays, 14) : 7;

  useEffect(() => {
    isTripSaved(site.id).then(setAlreadySaved).catch(() => {});
  }, [site.id]);

  useEffect(() => {
    if (!facilityId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setHint(null);

    fetch(
      `/api/availability?facilityId=${encodeURIComponent(facilityId)}&year=${year}&month=${month}`
    )
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) {
          throw Object.assign(new Error(json.error || "Failed to load"), {
            hint: json.hint,
            detail: json.detail,
          });
        }
        if (!cancelled) {
          setData(json);
          // Auto-pick first open arrival if none selected or out of month
          const dates: string[] = json.availableDates || json.sampleAvailableDates || [];
          if (dates.length && (!arrival || !dates.includes(arrival))) {
            setArrival(dates[0]);
          }
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(String(err.message || err));
          setHint(err.hint || null);
          setData(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only refetch on facility/month
  }, [facilityId, year, month]);

  const availableSet = useMemo(
    () => new Set(data?.availableDates || data?.sampleAvailableDates || []),
    [data]
  );

  const stayOk = arrival && nights > 0 ? stayIsOpen(availableSet, arrival, nights) : false;
  const depart = arrival && nights > 0 ? addDaysYmd(arrival, nights) : "";

  const bookUrl =
    facilityId && arrival
      ? recreationGovStayUrl(facilityId, arrival, nights, site.reservationUrl)
      : site.reservationUrl ||
        (facilityId
          ? `https://www.recreation.gov/camping/campgrounds/${facilityId}`
          : undefined);

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

  async function handleSchedule() {
    if (!arrival || nights < 1) return;
    setBusy(true);
    setSavedMsg("");
    try {
      const uid = await currentUserId();
      if (!uid) {
        router.push(
          `/account?next=${encodeURIComponent(`/site/${site.id}`)}`
        );
        return;
      }
      const ok = await addTrip(site, {
        plannedArrival: arrival,
        nights,
        notes: stayOk
          ? `Scheduled ${arrival} → ${depart} (${nights} night${nights === 1 ? "" : "s"}) · calendar showed openings`
          : `Planned ${arrival} → ${depart} (${nights} night${nights === 1 ? "" : "s"}) · verify openings on Recreation.gov`,
      });
      if (ok) {
        setAlreadySaved(true);
        setSavedMsg(
          stayOk
            ? "Trip scheduled in My Trips. Next: reserve on Recreation.gov so the site is actually yours."
            : "Dates saved to My Trips. Calendar did not show full openings — confirm on Recreation.gov before you go."
        );
      } else {
        setSavedMsg("Could not save trip. Try signing in again.");
      }
    } finally {
      setBusy(false);
    }
  }

  // Calendar grid for the month
  const calendarDays = useMemo(() => {
    const first = new Date(Date.UTC(year, month - 1, 1));
    const startPad = first.getUTCDay(); // 0 Sun
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const cells: { ymd: string | null; open: number }[] = [];
    for (let i = 0; i < startPad; i++) cells.push({ ymd: null, open: 0 });
    for (let d = 1; d <= daysInMonth; d++) {
      const ymd = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({ ymd, open: data?.dayOpenCounts?.[ymd] || 0 });
    }
    return cells;
  }, [year, month, data]);

  if (!facilityId) {
    return (
      <section className="bg-white rounded-2xl border border-forest-100 p-6 mb-8 shadow-sm">
        <h2 className="font-semibold text-forest-900 mb-2 text-lg">Schedule this trip</h2>
        <p className="text-sm text-forest-600 mb-4">
          This place isn&apos;t linked to a Recreation.gov campground calendar. You can still save
          planned dates and follow official rules (first-come / dispersed / private).
        </p>
        <ManualSchedule
          site={site}
          arrival={arrival}
          setArrival={setArrival}
          nights={nights}
          setNights={setNights}
          maxNights={maxNights}
          busy={busy}
          onSchedule={handleSchedule}
          savedMsg={savedMsg}
          reservationUrl={site.reservationUrl}
        />
      </section>
    );
  }

  return (
    <section className="bg-white rounded-2xl border border-forest-100 p-6 mb-8 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <h2 className="font-semibold text-forest-900 text-lg">Schedule this trip</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            className="w-8 h-8 rounded-full border border-forest-200 text-forest-700 hover:bg-forest-50"
            aria-label="Previous month"
          >
            ‹
          </button>
          <span className="text-sm font-medium text-forest-800 min-w-[8rem] text-center">
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
      <p className="text-sm text-forest-600 mb-4">
        Pick nights that show openings, save them to My Trips, then reserve on Recreation.gov so the
        campsite is actually held for you.
      </p>

      {loading && (
        <p className="text-sm text-forest-500 mb-4">Loading live calendar from Recreation.gov…</p>
      )}

      {error && !loading && (
        <div className="text-sm text-amber-900 bg-amber-50 border border-amber-100 rounded-xl p-3 mb-4">
          <p className="font-medium">Could not load availability right now</p>
          <p className="mt-1 text-amber-800">{error}</p>
          {hint && <p className="mt-1 text-amber-700">{hint}</p>}
          <button
            type="button"
            onClick={() => {
              // force remount fetch
              setMonth((m) => m);
              setError(null);
              setLoading(true);
              fetch(
                `/api/availability?facilityId=${encodeURIComponent(facilityId)}&year=${year}&month=${month}&_=${Date.now()}`
              )
                .then(async (res) => {
                  const json = await res.json();
                  if (!res.ok) throw new Error(json.error || "Failed");
                  setData(json);
                  setError(null);
                })
                .catch((e) => setError(String(e.message || e)))
                .finally(() => setLoading(false));
            }}
            className="mt-2 text-sm font-semibold underline"
          >
            Retry calendar
          </button>
        </div>
      )}

      {data && !loading && (
        <>
          <div className="grid grid-cols-3 gap-3 text-center mb-4">
            <div className="bg-forest-50 rounded-xl py-3 px-2">
              <p className="text-2xl font-bold text-forest-900">{data.totalCampsites}</p>
              <p className="text-xs text-forest-600">Campsites</p>
            </div>
            <div className="bg-emerald-50 rounded-xl py-3 px-2">
              <p className="text-2xl font-bold text-emerald-800">{data.sitesWithAvailability}</p>
              <p className="text-xs text-emerald-700">With openings</p>
            </div>
            <div className="bg-sky-50 rounded-xl py-3 px-2">
              <p className="text-2xl font-bold text-sky-800">{data.totalAvailableNights}</p>
              <p className="text-xs text-sky-700">Open nights</p>
            </div>
          </div>

          {/* Mini calendar */}
          <div className="mb-5">
            <div className="grid grid-cols-7 gap-1 text-[10px] text-forest-500 mb-1 text-center">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <span key={`${d}-${i}`}>{d}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((cell, i) => {
                if (!cell.ymd) {
                  return <div key={`e-${i}`} className="aspect-square" />;
                }
                const isOpen = cell.open > 0;
                const selected = arrival === cell.ymd;
                const today = new Date().toISOString().slice(0, 10);
                const past = cell.ymd < today;
                return (
                  <button
                    key={cell.ymd}
                    type="button"
                    disabled={past || !isOpen}
                    onClick={() => setArrival(cell.ymd!)}
                    title={
                      isOpen
                        ? `${cell.ymd}: ${cell.open} site(s) open`
                        : `${cell.ymd}: no open sites in calendar`
                    }
                    className={`aspect-square rounded-lg text-xs font-medium transition ${
                      selected
                        ? "bg-forest-700 text-white ring-2 ring-forest-400"
                        : isOpen
                          ? "bg-emerald-100 text-emerald-900 hover:bg-emerald-200"
                          : past
                            ? "bg-forest-50 text-forest-300"
                            : "bg-forest-50 text-forest-400"
                    } disabled:cursor-not-allowed`}
                  >
                    {Number(cell.ymd.slice(8))}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[11px] text-forest-500">
              Green = at least one site open that night (live from Recreation.gov). Click a green day
              to start your stay.
            </p>
          </div>
        </>
      )}

      <div className="grid sm:grid-cols-2 gap-3 mb-3">
        <label className="block text-sm">
          <span className="text-forest-600">Arrival</span>
          <input
            type="date"
            value={arrival}
            onChange={(e) => setArrival(e.target.value)}
            className="mt-1 w-full rounded-xl border border-forest-200 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="text-forest-600">Nights</span>
          <input
            type="number"
            min={1}
            max={maxNights}
            value={nights}
            onChange={(e) => setNights(Math.max(1, Math.min(maxNights, Number(e.target.value) || 1)))}
            className="mt-1 w-full rounded-xl border border-forest-200 px-3 py-2"
          />
        </label>
      </div>

      {arrival && (
        <p className="text-sm text-forest-700 mb-3">
          Stay: <strong>{formatDay(arrival)}</strong>
          {depart ? (
            <>
              {" "}
              → <strong>{formatDay(depart)}</strong> ({nights} night{nights === 1 ? "" : "s"})
            </>
          ) : null}
          {data && (
            <span
              className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${
                stayOk
                  ? "bg-emerald-100 text-emerald-900"
                  : "bg-amber-100 text-amber-900"
              }`}
            >
              {stayOk ? "Openings on each night" : "Verify openings on Recreation.gov"}
            </span>
          )}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!arrival || busy}
          onClick={handleSchedule}
          className="inline-flex px-5 py-2.5 rounded-full bg-forest-700 text-white text-sm font-semibold hover:bg-forest-800 disabled:opacity-50"
        >
          {busy ? "Saving…" : alreadySaved ? "Update schedule in My Trips" : "Save schedule to My Trips"}
        </button>
        {bookUrl && (
          <a
            href={bookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex px-5 py-2.5 rounded-full border border-forest-300 text-forest-900 text-sm font-semibold hover:bg-forest-50"
          >
            Reserve on Recreation.gov →
          </a>
        )}
      </div>

      {savedMsg && (
        <p className="mt-3 text-sm text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
          {savedMsg}{" "}
          <a href="/trips" className="font-semibold underline">
            View My Trips
          </a>
        </p>
      )}

      <p className="mt-4 text-xs text-forest-500">
        Immerse helps you plan and track dates. Official reservations (and payment) happen on
        Recreation.gov for public campgrounds — that&apos;s what actually holds your site.
      </p>
    </section>
  );
}

function ManualSchedule({
  site,
  arrival,
  setArrival,
  nights,
  setNights,
  maxNights,
  busy,
  onSchedule,
  savedMsg,
  reservationUrl,
}: {
  site: CampSite;
  arrival: string;
  setArrival: (v: string) => void;
  nights: number;
  setNights: (n: number) => void;
  maxNights: number;
  busy: boolean;
  onSchedule: () => void;
  savedMsg: string;
  reservationUrl?: string;
}) {
  return (
    <div>
      <div className="grid sm:grid-cols-2 gap-3 mb-3">
        <label className="block text-sm">
          <span className="text-forest-600">Planned arrival</span>
          <input
            type="date"
            value={arrival}
            onChange={(e) => setArrival(e.target.value)}
            className="mt-1 w-full rounded-xl border border-forest-200 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="text-forest-600">Nights</span>
          <input
            type="number"
            min={1}
            max={maxNights}
            value={nights}
            onChange={(e) =>
              setNights(Math.max(1, Math.min(maxNights, Number(e.target.value) || 1)))
            }
            className="mt-1 w-full rounded-xl border border-forest-200 px-3 py-2"
          />
        </label>
      </div>
      <button
        type="button"
        disabled={!arrival || busy}
        onClick={onSchedule}
        className="inline-flex px-5 py-2.5 rounded-full bg-forest-700 text-white text-sm font-semibold disabled:opacity-50"
      >
        {busy ? "Saving…" : "Save dates to My Trips"}
      </button>
      {reservationUrl && (
        <a
          href={reservationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 inline-flex px-5 py-2.5 rounded-full border border-forest-300 text-sm font-semibold"
        >
          Official site →
        </a>
      )}
      {savedMsg && <p className="mt-3 text-sm text-emerald-800">{savedMsg}</p>}
      <p className="mt-2 text-xs text-forest-500">Planning {site.name}</p>
    </div>
  );
}
