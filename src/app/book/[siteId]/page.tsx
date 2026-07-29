"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getSiteById } from "@/lib/mock-sites";
import { BOOKING_POLICY, buildAgreedRules } from "@/lib/booking";
import { DEFAULT_NATURE_EXPECTATIONS, WILDLIFE_PROTECTION_RULE } from "@/lib/trust";
import { createImmerseClient } from "@/lib/supabase";
import type { CampSite } from "@/lib/types";

export default function BookPage() {
  const params = useParams();
  const siteId = String(params.siteId || "");
  const [site, setSite] = useState<CampSite | null | undefined>(undefined);

  const [arrival, setArrival] = useState("");
  const [nights, setNights] = useState(2);
  const [guests, setGuests] = useState(2);
  const [email, setEmail] = useState("");
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [platformOk, setPlatformOk] = useState(false);
  const [noSideContractOk, setNoSideContractOk] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const curated = getSiteById(siteId);
    if (curated) {
      setSite(curated);
      return;
    }
    // Live federal / other — fetch via search detail isn't needed for private-only flow
    fetch(`/api/site/${encodeURIComponent(siteId)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setSite(data?.site ?? null))
      .catch(() => setSite(null));
  }, [siteId]);

  useEffect(() => {
    const sb = createImmerseClient();
    sb?.auth.getUser().then(({ data }) => {
      if (data.user?.email) setEmail(data.user.email);
    });
  }, []);

  const rules = useMemo(() => (site ? buildAgreedRules(site) : []), [site]);

  if (site === undefined) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center text-forest-500">Loading…</div>
    );
  }

  if (!site) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <p className="text-forest-700 mb-4">Site not found.</p>
        <Link href="/search" className="text-forest-700 underline">
          Back to search
        </Link>
      </div>
    );
  }

  if (site.type !== "private") {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-forest-900 mb-3">Public land</h1>
        <p className="text-forest-700 mb-6">
          This place is on public land. There is no private host contract — follow the pass,
          parking, and stay rules on the site page (and official agency rules). Reserve on
          Recreation.gov when required.
        </p>
        <Link
          href={`/site/${site.id}`}
          className="inline-flex px-5 py-2.5 rounded-full bg-forest-700 text-white font-medium"
        >
          Back to site details
        </Link>
      </div>
    );
  }

  const isExample =
    site.dataSource === "private_host" || site.id.startsWith("private-");

  const allRulesChecked = rules.every((_, i) => checked[i]);
  const canConfirm =
    Boolean(arrival) &&
    Boolean(email.includes("@")) &&
    allRulesChecked &&
    platformOk &&
    noSideContractOk &&
    !busy;

  function toggleRule(i: number) {
    setChecked((prev) => ({ ...prev, [i]: !prev[i] }));
  }

  async function handleConfirm() {
    if (!canConfirm || !site) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/stay-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteId: site.id,
          siteName: site.name,
          arrival,
          nights,
          guests,
          email: email.trim().toLowerCase(),
          agreedRules: rules,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Could not save your interest. Try again.");
        return;
      }
      setRequestId(data.id || null);
      setSubmitted(true);
    } catch {
      setError("Could not save your interest. Try again.");
    } finally {
      setBusy(false);
    }
  }

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-forest-900 mb-3">Interest recorded</h1>
        <p className="text-forest-700 mb-2">
          Your interest for <strong>{site.name}</strong> is saved
          {requestId ? ` (#${requestId.slice(0, 8)})` : ""}.
        </p>
        <p className="text-sm text-forest-600 mb-8">
          {isExample
            ? "This was an example listing. Private stays are not bookable for payment yet — we will use your interest when hosts go live. No money was charged."
            : "The host will review when the listing is live. Payment is not enabled until hosts are fulfilled on-platform."}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href={`/site/${site.id}`}
            className="inline-flex px-5 py-2.5 rounded-full bg-forest-700 text-white font-medium"
          >
            Back to site
          </Link>
          <Link
            href="/host"
            className="inline-flex px-5 py-2.5 rounded-full border border-forest-300 text-forest-800 font-medium"
          >
            Become a host
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <Link
        href={`/site/${site.id}`}
        className="text-sm text-forest-600 hover:text-forest-800 mb-6 inline-block"
      >
        ← {site.name}
      </Link>

      <h1 className="text-2xl font-bold text-forest-900 mb-1">
        {isExample ? "Express interest in this nature stay" : "Request this nature stay"}
      </h1>
      <p className="text-forest-600 text-sm mb-4">
        Everything you must agree to is on this screen.{" "}
        {isExample
          ? "Example listings are not live hosts — this records interest only. No payment."
          : "No payment until hosts are live and fulfillment works."}
      </p>

      {isExample && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          <strong>Example listing.</strong> Not a real bookable host. Interest helps us launch
          private nature stays the right way.
        </div>
      )}

      <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
        <p className="font-semibold mb-1">Platform promise</p>
        <p>{BOOKING_POLICY.noPostPaymentAgreements}</p>
      </div>

      <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
        <p className="font-semibold mb-1">Wildlife is not optional</p>
        <p className="mb-2">{BOOKING_POLICY.wildlifeRequired}</p>
        <Link href="/policy/severe-abuse" className="font-medium underline">
          What happens if wildlife or land is severely abused →
        </Link>
      </div>

      <section className="mb-8 space-y-4">
        <h2 className="font-semibold text-forest-900">Dates & contact</h2>
        <label className="block text-sm">
          <span className="text-forest-600">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-forest-200 px-3 py-2"
            placeholder="you@email.com"
          />
        </label>
        <label className="block text-sm">
          <span className="text-forest-600">Arrival</span>
          <input
            type="date"
            value={arrival}
            onChange={(e) => setArrival(e.target.value)}
            className="mt-1 w-full rounded-xl border border-forest-200 px-3 py-2"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">
            <span className="text-forest-600">Nights</span>
            <input
              type="number"
              min={1}
              max={site.maxStayDays || 7}
              value={nights}
              onChange={(e) => setNights(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-forest-200 px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="text-forest-600">Guests</span>
            <input
              type="number"
              min={1}
              max={DEFAULT_NATURE_EXPECTATIONS.maxGuests}
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-forest-200 px-3 py-2"
            />
          </label>
        </div>
        {site.campingFee && (
          <p className="text-sm text-forest-700">
            Listed rate: <strong>{site.campingFee}</strong> (not charged here)
          </p>
        )}
      </section>

      <section className="mb-8">
        <h2 className="font-semibold text-forest-900 mb-1">Agree to stay rules</h2>
        <p className="text-xs text-forest-500 mb-4">
          Check each item. The wildlife rule is required and listed first.
        </p>
        <ul className="space-y-3">
          {rules.map((rule, i) => {
            const isWildlife = rule === WILDLIFE_PROTECTION_RULE;
            return (
              <li key={i}>
                <label
                  className={`flex gap-3 items-start text-sm cursor-pointer rounded-xl p-3 ${
                    isWildlife
                      ? "bg-amber-50 border border-amber-200 text-amber-950"
                      : "text-forest-800"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={!!checked[i]}
                    onChange={() => toggleRule(i)}
                    className="mt-1 rounded border-forest-300"
                  />
                  <span>
                    {isWildlife && (
                      <span className="block text-xs font-semibold uppercase tracking-wide text-amber-800 mb-1">
                        Required — wildlife
                      </span>
                    )}
                    {rule}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mb-8 space-y-3">
        <label className="flex gap-3 items-start text-sm text-forest-800 cursor-pointer">
          <input
            type="checkbox"
            checked={platformOk}
            onChange={(e) => setPlatformOk(e.target.checked)}
            className="mt-1"
          />
          <span>
            I agree to Immerse{" "}
            <Link href="/terms" className="underline">
              Terms
            </Link>
            ,{" "}
            <Link href="/trust" className="underline">
              Trust & Care
            </Link>
            , and the{" "}
            <Link href="/policy/severe-abuse" className="underline">
              severe abuse policy
            </Link>
            .
          </span>
        </label>
        <label className="flex gap-3 items-start text-sm text-forest-800 cursor-pointer">
          <input
            type="checkbox"
            checked={noSideContractOk}
            onChange={(e) => setNoSideContractOk(e.target.checked)}
            className="mt-1"
          />
          <span>
            I understand the host cannot require any extra contract after I book. If they do, I can
            cancel under Immerse policy.
          </span>
        </label>
      </section>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      <button
        type="button"
        disabled={!canConfirm}
        onClick={handleConfirm}
        className={`w-full py-3.5 rounded-full font-semibold text-white transition ${
          canConfirm ? "bg-forest-700 hover:bg-forest-800" : "bg-forest-300 cursor-not-allowed"
        }`}
      >
        {busy ? "Saving…" : isExample ? "Record interest (no payment)" : "Submit request (no payment)"}
      </button>

      <p className="mt-4 text-xs text-center text-forest-500">
        Public-land trips never use this flow — only private nature stays.
      </p>
    </div>
  );
}
