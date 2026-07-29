"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  loadTrips,
  removeTrip,
  currentUserId,
  SavedTrip,
  tripBookingUrl,
} from "@/lib/trips";

const MONTH = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatYmd(ymd?: string) {
  if (!ymd || !/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return null;
  const [y, m, d] = ymd.split("-");
  return `${MONTH[Number(m) - 1]} ${Number(d)}, ${y}`;
}

function departYmd(arrival?: string, nights?: number) {
  if (!arrival || !nights) return null;
  const d = new Date(`${arrival}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + nights);
  return d.toISOString().slice(0, 10);
}

export default function TripsPage() {
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    (async () => {
      const uid = await currentUserId();
      setSignedIn(Boolean(uid));
      if (uid) setTrips(await loadTrips());
      setReady(true);
    })();
  }, []);

  async function handleRemove(siteId: string) {
    await removeTrip(siteId);
    setTrips((prev) => prev.filter((t) => t.siteId !== siteId));
  }

  if (!ready) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-forest-500">
        Loading your trips…
      </div>
    );
  }

  if (!signedIn) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-forest-900 mb-4">My Trips</h1>
        <p className="text-forest-600 mb-8 max-w-md mx-auto">
          Sign in to schedule stays, save dates, and keep plans synced across every device.
        </p>
        <Link
          href="/account?next=/trips"
          className="inline-flex px-6 py-3 rounded-full bg-forest-700 text-white font-semibold hover:bg-forest-800 transition"
        >
          Sign in to start planning
        </Link>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-forest-900 mb-4">My Trips</h1>
        <p className="text-forest-600 mb-8 max-w-md mx-auto">
          Nothing scheduled yet. Open a site, pick open nights on the calendar, and tap{" "}
          <strong>Save schedule to My Trips</strong>.
        </p>
        <Link
          href="/search"
          className="inline-flex px-6 py-3 rounded-full bg-forest-700 text-white font-semibold hover:bg-forest-800 transition"
        >
          Find a place to immerse
        </Link>
      </div>
    );
  }

  const scheduled = trips.filter((t) => t.plannedArrival);
  const wishlist = trips.filter((t) => !t.plannedArrival);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-forest-900">My Trips</h1>
          <p className="text-sm text-forest-600 mt-1">
            {scheduled.length} scheduled · {wishlist.length} saved without dates · synced to your
            account
          </p>
        </div>
        <Link href="/search" className="text-sm font-medium text-forest-700 hover:underline">
          + Add more
        </Link>
      </div>

      <TripList
        title="Scheduled"
        empty="No dated stays yet — open a campground and pick nights on the calendar."
        trips={scheduled}
        onRemove={handleRemove}
      />
      <TripList
        title="Saved (no dates yet)"
        empty=""
        trips={wishlist}
        onRemove={handleRemove}
      />
    </div>
  );
}

function TripList({
  title,
  empty,
  trips,
  onRemove,
}: {
  title: string;
  empty: string;
  trips: SavedTrip[];
  onRemove: (id: string) => void;
}) {
  if (trips.length === 0) {
    if (!empty) return null;
    return (
      <section className="mb-10">
        <h2 className="font-semibold text-forest-900 mb-3">{title}</h2>
        <p className="text-sm text-forest-600">{empty}</p>
      </section>
    );
  }

  return (
    <section className="mb-10">
      <h2 className="font-semibold text-forest-900 mb-3">{title}</h2>
      <ul className="space-y-4">
        {trips.map((trip) => {
          const arrive = formatYmd(trip.plannedArrival);
          const leave = formatYmd(departYmd(trip.plannedArrival, trip.nights) || undefined);
          const book = tripBookingUrl(trip);

          return (
            <li
              key={trip.id}
              className="bg-white rounded-2xl border border-forest-100 p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Link
                    href={`/site/${trip.siteId}`}
                    className="font-semibold text-lg text-forest-900 hover:text-forest-700"
                  >
                    {trip.siteName}
                  </Link>
                  {trip.agency && (
                    <p className="text-xs text-forest-500 mt-0.5">{trip.agency}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(trip.siteId)}
                  className="text-xs text-forest-500 hover:text-red-600 shrink-0"
                >
                  Remove
                </button>
              </div>

              {arrive && (
                <p className="mt-3 text-sm font-medium text-forest-900">
                  {arrive}
                  {leave ? ` → ${leave}` : ""}
                  {trip.nights != null ? ` · ${trip.nights} night${trip.nights === 1 ? "" : "s"}` : ""}
                </p>
              )}

              {trip.notes && (
                <p className="mt-1 text-xs text-forest-600">{trip.notes}</p>
              )}

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-forest-700">
                {trip.driveTimeMinutes != null && (
                  <span>
                    Drive ~{Math.floor(trip.driveTimeMinutes / 60)}h {trip.driveTimeMinutes % 60}m
                  </span>
                )}
                <span className="text-forest-500">
                  Saved {new Date(trip.savedAt).toLocaleDateString()}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/site/${trip.siteId}`}
                  className="inline-flex px-4 py-2 rounded-full bg-forest-700 text-white text-sm font-medium hover:bg-forest-800"
                >
                  {trip.plannedArrival ? "Adjust schedule" : "Pick dates"}
                </Link>
                {book && (
                  <a
                    href={book}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex px-4 py-2 rounded-full border border-forest-300 text-forest-800 text-sm font-medium hover:bg-forest-50"
                  >
                    Reserve on Recreation.gov →
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
