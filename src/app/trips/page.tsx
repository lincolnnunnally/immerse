"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadTrips, removeTrip, SavedTrip } from "@/lib/trips";

export default function TripsPage() {
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setTrips(loadTrips());
    setReady(true);
  }, []);

  function handleRemove(siteId: string) {
    removeTrip(siteId);
    setTrips(loadTrips());
  }

  if (!ready) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-forest-500">
        Loading your trips…
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-forest-900 mb-4">My Trips</h1>
        <p className="text-forest-600 mb-8 max-w-md mx-auto">
          Nothing saved yet. Open a site and tap <strong>Save to My Trips</strong> — it stays on this
          device until you clear it.
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

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-forest-900">My Trips</h1>
          <p className="text-sm text-forest-600 mt-1">
            {trips.length} saved · stored on this device
          </p>
        </div>
        <Link
          href="/search"
          className="text-sm font-medium text-forest-700 hover:underline"
        >
          + Add more
        </Link>
      </div>

      <ul className="space-y-4">
        {trips.map((trip) => (
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
                onClick={() => handleRemove(trip.siteId)}
                className="text-xs text-forest-500 hover:text-red-600 shrink-0"
              >
                Remove
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-forest-700">
              {trip.driveTimeMinutes != null && (
                <span>
                  Drive ~{Math.floor(trip.driveTimeMinutes / 60)}h {trip.driveTimeMinutes % 60}m
                </span>
              )}
              {trip.nights != null && <span>{trip.nights} nights (planned)</span>}
              <span className="text-forest-500">
                Saved {new Date(trip.savedAt).toLocaleDateString()}
              </span>
            </div>

            {trip.passRequired && (
              <p className="mt-2 text-xs text-forest-600">
                Pass: {trip.passRequired}
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={`/site/${trip.siteId}`}
                className="inline-flex px-4 py-2 rounded-full bg-forest-700 text-white text-sm font-medium hover:bg-forest-800"
              >
                Open details
              </Link>
              {trip.reservationUrl && (
                <a
                  href={trip.reservationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex px-4 py-2 rounded-full border border-forest-300 text-forest-800 text-sm font-medium hover:bg-forest-50"
                >
                  Recreation.gov
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
