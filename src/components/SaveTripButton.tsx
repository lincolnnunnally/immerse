"use client";

import { useEffect, useState } from "react";
import { CampSite } from "@/lib/types";
import { addTrip, isTripSaved, removeTrip } from "@/lib/trips";

export function SaveTripButton({ site }: { site: CampSite }) {
  const [saved, setSaved] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSaved(isTripSaved(site.id));
    setReady(true);
  }, [site.id]);

  function toggle() {
    if (saved) {
      removeTrip(site.id);
      setSaved(false);
    } else {
      addTrip(site);
      setSaved(true);
    }
  }

  if (!ready) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex items-center justify-center px-5 py-2.5 rounded-full border border-forest-200 text-forest-400 text-sm font-medium"
      >
        Save trip
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-semibold transition ${
        saved
          ? "bg-forest-100 text-forest-800 border border-forest-300 hover:bg-forest-200"
          : "bg-white border border-forest-300 text-forest-800 hover:border-forest-500 hover:bg-forest-50"
      }`}
    >
      {saved ? "✓ Saved to My Trips" : "Save to My Trips"}
    </button>
  );
}
