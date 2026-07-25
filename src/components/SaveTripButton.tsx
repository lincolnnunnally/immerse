"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CampSite } from "@/lib/types";
import { addTrip, isTripSaved, removeTrip, currentUserId } from "@/lib/trips";

export function SaveTripButton({ site }: { site: CampSite }) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    isTripSaved(site.id).then((s) => {
      if (active) {
        setSaved(s);
        setReady(true);
      }
    });
    return () => {
      active = false;
    };
  }, [site.id]);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    const uid = await currentUserId();
    if (!uid) {
      router.push(`/account?next=${encodeURIComponent(`/site/${site.id}`)}`);
      setBusy(false);
      return;
    }
    if (saved) {
      await removeTrip(site.id);
      setSaved(false);
    } else {
      const ok = await addTrip(site);
      if (ok) setSaved(true);
    }
    setBusy(false);
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
      disabled={busy}
      className={`inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-semibold transition disabled:opacity-60 ${
        saved
          ? "bg-forest-100 text-forest-800 border border-forest-300 hover:bg-forest-200"
          : "bg-white border border-forest-300 text-forest-800 hover:border-forest-500 hover:bg-forest-50"
      }`}
    >
      {saved ? "✓ Saved to My Trips" : "Save to My Trips"}
    </button>
  );
}
