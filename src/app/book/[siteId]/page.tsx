"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { getSiteById } from "@/lib/mock-sites";
import { BOOKING_POLICY, buildAgreedRules } from "@/lib/booking";
import { DEFAULT_NATURE_EXPECTATIONS } from "@/lib/trust";

export default function BookPage() {
  const params = useParams();
  const siteId = String(params.siteId || "");
  const site = getSiteById(siteId);

  const [arrival, setArrival] = useState("");
  const [nights, setNights] = useState(2);
  const [guests, setGuests] = useState(2);
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [platformOk, setPlatformOk] = useState(false);
  const [noSideContractOk, setNoSideContractOk] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const rules = useMemo(() => (site ? buildAgreedRules(site) : []), [site]);

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
          parking, and stay rules on the site page (and official agency rules).
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

  const allRulesChecked = rules.every((_, i) => checked[i]);
  const canConfirm = Boolean(arrival) && allRulesChecked && platformOk && noSideContractOk;

  function toggleRule(i: number) {
    setChecked((prev) => ({ ...prev, [i]: !prev[i] }));
  }

  function handleConfirm() {
    if (!canConfirm) return;
    // Payment integration later — this freezes the agreement snapshot pre-pay
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-forest-900 mb-3">Agreement locked</h1>
        <p className="text-forest-700 mb-2">
          Your stay rules for <strong>{site.name}</strong> are recorded in Immerse.
        </p>
        <p className="text-sm text-forest-600 mb-8">
          Payment will plug in here next. Important: the host cannot add new contracts after this
          point. If they try, you can cancel under Immerse policy.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href={`/site/${site.id}`}
            className="inline-flex px-5 py-2.5 rounded-full bg-forest-700 text-white font-medium"
          >
            Back to site
          </Link>
          <Link
            href="/trust"
            className="inline-flex px-5 py-2.5 rounded-full border border-forest-300 text-forest-800 font-medium"
          >
            Trust & Care
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

      <h1 className="text-2xl font-bold text-forest-900 mb-1">Request this nature stay</h1>
      <p className="text-forest-600 text-sm mb-8">
        Everything you must agree to is on this screen — before any payment. No surprise contracts
        from the host afterward.
      </p>

      {/* Anti-scam banner */}
      <div className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
        <p className="font-semibold mb-1">Platform promise</p>
        <p>{BOOKING_POLICY.noPostPaymentAgreements}</p>
      </div>

      {/* Dates */}
      <section className="mb-8 space-y-4">
        <h2 className="font-semibold text-forest-900">Dates</h2>
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
            Listed rate: <strong>{site.campingFee}</strong> (payment integration next)
          </p>
        )}
      </section>

      {/* Full agreement checklist — must complete before pay */}
      <section className="mb-8">
        <h2 className="font-semibold text-forest-900 mb-1">Agree to stay rules</h2>
        <p className="text-xs text-forest-500 mb-4">
          Check each item. This is the complete agreement for this stay.
        </p>
        <ul className="space-y-3">
          {rules.map((rule, i) => (
            <li key={i}>
              <label className="flex gap-3 items-start text-sm text-forest-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!checked[i]}
                  onChange={() => toggleRule(i)}
                  className="mt-1 rounded border-forest-300"
                />
                <span>{rule}</span>
              </label>
            </li>
          ))}
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
            I agree to Immerse platform terms and the Trust & Care rules for private nature stays.
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
            I understand the host cannot require any extra contract, waiver, or off-platform payment
            after I book. If they do, I can cancel under Immerse policy.
          </span>
        </label>
      </section>

      <button
        type="button"
        disabled={!canConfirm}
        onClick={handleConfirm}
        className={`w-full py-3.5 rounded-full font-semibold text-white transition ${
          canConfirm
            ? "bg-forest-700 hover:bg-forest-800"
            : "bg-forest-300 cursor-not-allowed"
        }`}
      >
        Lock agreement (payment next)
      </button>

      <p className="mt-4 text-xs text-center text-forest-500">
        Public-land trips never use this flow — only private nature stays.
      </p>
    </div>
  );
}
