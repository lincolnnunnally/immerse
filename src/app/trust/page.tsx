import Link from "next/link";
import {
  DEFAULT_NATURE_EXPECTATIONS,
  IMMERSE_PROTECTION,
  RATING_DIMENSIONS_GUEST_ABOUT_HOST,
  RATING_DIMENSIONS_HOST_ABOUT_GUEST,
  REVIEW_WINDOW_DAYS,
  WILDLIFE_PROTECTION_RULE,
} from "@/lib/trust";
import { BOOKING_POLICY } from "@/lib/booking";
import {
  EXAMPLE_GUEST_PROFILE,
  EXAMPLE_HOST_PROFILE,
  TrustProfileCard,
} from "@/components/TrustProfileCard";

export default function TrustPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <p className="text-sm text-forest-500 mb-2">Safety for both sides</p>
      <h1 className="text-3xl font-bold text-forest-900 mb-3">Trust on Immerse</h1>
      <p className="text-forest-700 text-lg leading-relaxed mb-10">
        Hosts need their home and land protected. Guests need privacy, quiet, and a stay that matches
        what they booked. Some harm cannot be undone — we prevent what we can, ban what we must, and
        never pretend money restores wildlife or trust.
      </p>

      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        <div className="rounded-2xl border border-forest-100 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-forest-900 mb-2">What hosts need</h2>
          <ul className="text-sm text-forest-700 space-y-1.5">
            <li>▸ Property and wildlife left unharmed</li>
            <li>▸ Guests who respect quiet and boundaries</li>
            <li>▸ Real people, not anonymous risk</li>
            <li>▸ Power to close listings after trauma</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-forest-100 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-forest-900 mb-2">What guests need</h2>
          <ul className="text-sm text-forest-700 space-y-1.5">
            <li>▸ The site matches photos & description</li>
            <li>▸ Privacy and a nature feel</li>
            <li>▸ Quiet, not a party next door</li>
            <li>▸ Clear rules before they pay</li>
          </ul>
        </div>
      </div>

      <section className="mb-10 rounded-2xl border-2 border-amber-300 bg-amber-50 p-6">
        <h2 className="text-xl font-semibold text-forest-900 mb-2">Wildlife is not optional</h2>
        <p className="text-sm text-forest-800 mb-3">{WILDLIFE_PROTECTION_RULE}</p>
        <p className="text-sm text-forest-700 mb-3">
          This is the first checkbox on every private stay agreement. Killing or harming animals on a
          host’s land is <strong>severe abuse</strong> — not a cleaning-fee dispute.
        </p>
        <Link
          href="/policy/severe-abuse"
          className="text-sm font-semibold text-forest-900 underline"
        >
          Read the severe abuse policy →
        </Link>
      </section>

      <section className="mb-10 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-6">
        <h2 className="text-xl font-semibold text-forest-900 mb-2">
          No surprise contracts after you pay
        </h2>
        <ul className="text-sm text-forest-800 space-y-2">
          <li>▸ {BOOKING_POLICY.noPostPaymentAgreements}</li>
          <li>▸ {BOOKING_POLICY.refundIfSideContract}</li>
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-forest-900 mb-3">1. Verification</h2>
        <p className="text-sm text-forest-700 mb-4">
          Government ID is required to book or host private stays — in the app, not in a host email
          after payment.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-forest-900 mb-3">
          2. Expectations before anyone pays
        </h2>
        <div className="rounded-2xl bg-forest-50 border border-forest-100 p-5 text-sm">
          <ul className="space-y-1 text-forest-800">
            <li>Quiet hours: {DEFAULT_NATURE_EXPECTATIONS.quietHours}</li>
            <li>Max guests: {DEFAULT_NATURE_EXPECTATIONS.maxGuests}</li>
            <li>Generators: not allowed</li>
            <li>Wildlife: protected — see required rule above</li>
            <li>{DEFAULT_NATURE_EXPECTATIONS.privacyNote}</li>
          </ul>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-forest-900 mb-3">3. Two-sided ratings</h2>
        <p className="text-sm text-forest-700 mb-4">
          Reviews held until both sides submit or {REVIEW_WINDOW_DAYS} days pass. Severe abuse is
          handled under a separate ban path — not a mutual star rating.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div className="rounded-xl border border-forest-100 p-4">
            <p className="text-xs font-semibold uppercase text-forest-500 mb-2">Guest rates host</p>
            <ul className="text-sm text-forest-800 space-y-1">
              {RATING_DIMENSIONS_GUEST_ABOUT_HOST.map((d) => (
                <li key={d.key}>▸ {d.label}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-forest-100 p-4">
            <p className="text-xs font-semibold uppercase text-forest-500 mb-2">Host rates guest</p>
            <ul className="text-sm text-forest-800 space-y-1">
              {RATING_DIMENSIONS_HOST_ABOUT_GUEST.map((d) => (
                <li key={d.key}>▸ {d.label}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <TrustProfileCard profile={EXAMPLE_HOST_PROFILE} />
          <TrustProfileCard profile={EXAMPLE_GUEST_PROFILE} />
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-forest-900 mb-3">4. Immerse Care — and its limits</h2>
        <p className="text-sm text-forest-700 mb-2">
          Status:{" "}
          <span className="inline-flex px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-medium">
            {IMMERSE_PROTECTION.status}
          </span>
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <div className="rounded-xl bg-white border border-forest-100 p-4">
            <p className="font-medium text-forest-900 mb-2">Financial path (hosts)</p>
            <ul className="text-sm text-forest-700 space-y-1">
              {IMMERSE_PROTECTION.hostCoverage.map((c) => (
                <li key={c}>▸ {c}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl bg-white border border-forest-100 p-4">
            <p className="font-medium text-forest-900 mb-2">Financial path (guests)</p>
            <ul className="text-sm text-forest-700 space-y-1">
              {IMMERSE_PROTECTION.guestCoverage.map((c) => (
                <li key={c}>▸ {c}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-4 rounded-xl border border-forest-200 bg-forest-50 p-4 text-sm text-forest-800">
          <p className="font-semibold mb-1">Irreversible harm</p>
          <p>{IMMERSE_PROTECTION.irreversibleHarmNote}</p>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-semibold text-forest-900 mb-3">5. When something goes wrong</h2>
        <p className="text-sm text-forest-700 mb-3">
          Ordinary issues: message → claim → deposit / Care.{" "}
          <Link href="/policy/severe-abuse" className="font-medium underline">
            Severe abuse of land or wildlife
          </Link>
          : ban, evidence, law enforcement — not a mediated “both sides” chat.
        </p>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/policy/severe-abuse"
          className="inline-flex px-6 py-3 rounded-full bg-forest-700 text-white font-semibold hover:bg-forest-800"
        >
          Severe abuse policy
        </Link>
        <Link
          href="/host"
          className="inline-flex px-6 py-3 rounded-full border border-forest-300 text-forest-800 font-medium hover:bg-forest-50"
        >
          Host nature stays
        </Link>
      </div>
    </div>
  );
}
