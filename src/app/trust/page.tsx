import Link from "next/link";
import {
  DEFAULT_NATURE_EXPECTATIONS,
  IMMERSE_PROTECTION,
  RATING_DIMENSIONS_GUEST_ABOUT_HOST,
  RATING_DIMENSIONS_HOST_ABOUT_GUEST,
  REVIEW_WINDOW_DAYS,
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
        what they booked. Immerse is designed so both sides get what they expect — before anyone
        shows up.
      </p>

      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        <div className="rounded-2xl border border-forest-100 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-forest-900 mb-2">What hosts need</h2>
          <ul className="text-sm text-forest-700 space-y-1.5">
            <li>▸ Property left in good condition</li>
            <li>▸ Guests who respect quiet and boundaries</li>
            <li>▸ Real people, not anonymous risk</li>
            <li>▸ A path when something goes wrong</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-forest-100 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-forest-900 mb-2">What guests need</h2>
          <ul className="text-sm text-forest-700 space-y-1.5">
            <li>▸ The site matches photos & description</li>
            <li>▸ Privacy and a nature feel</li>
            <li>▸ Quiet, not a party next door</li>
            <li>▸ They feel safe on arrival</li>
          </ul>
        </div>
      </div>

      {/* Critical: no post-pay side contracts */}
      <section className="mb-10 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-6">
        <h2 className="text-xl font-semibold text-forest-900 mb-2">
          No surprise contracts after you pay
        </h2>
        <p className="text-sm text-forest-800 mb-3">
          Some platforms let hosts send long waivers or extra verification <em>after</em> payment.
          That feels like a trap. Immerse does not allow it.
        </p>
        <ul className="text-sm text-forest-800 space-y-2">
          <li>▸ {BOOKING_POLICY.noPostPaymentAgreements}</li>
          <li>▸ {BOOKING_POLICY.platformTermsOnly}</li>
          <li>▸ {BOOKING_POLICY.refundIfSideContract}</li>
        </ul>
        <p className="mt-4 text-sm text-forest-700">
          If a host needs a rule, it must be on the listing and in the in-app agreement screen{" "}
          <strong>before</strong> payment. Public-land trips never use private host contracts at all.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-forest-900 mb-3">1. Verification (who is real)</h2>
        <p className="text-sm text-forest-700 mb-4">
          Before a private stay is bookable, both sides move up a short ladder. Higher levels unlock
          higher-trust stays. ID checks happen in the app — not in a PDF the host emails later.
        </p>
        <ol className="space-y-2 text-sm text-forest-800">
          <li className="flex gap-3">
            <span className="font-mono text-forest-500">1</span>
            <span>
              <strong>Email + phone</strong> — baseline account
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-mono text-forest-500">2</span>
            <span>
              <strong>Government ID verified</strong> — required to book or host private nature stays
            </span>
          </li>
          <li className="flex gap-3">
            <span className="font-mono text-forest-500">3</span>
            <span>
              <strong>ID + address</strong> — optional, shown as a stronger trust badge
            </span>
          </li>
        </ol>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-forest-900 mb-3">
          2. Clear expectations before anyone pays
        </h2>
        <p className="text-sm text-forest-700 mb-4">
          Every private listing carries structured rules. You check them off in the Request stay
          flow. That checklist <em>is</em> the agreement.
        </p>
        <div className="rounded-2xl bg-forest-50 border border-forest-100 p-5 text-sm">
          <p className="font-medium text-forest-900 mb-2">Default nature-stay rules</p>
          <ul className="space-y-1 text-forest-800">
            <li>Quiet hours: {DEFAULT_NATURE_EXPECTATIONS.quietHours}</li>
            <li>Max guests: {DEFAULT_NATURE_EXPECTATIONS.maxGuests}</li>
            <li>Generators: not allowed</li>
            <li>Amplified music: not allowed</li>
            <li>{DEFAULT_NATURE_EXPECTATIONS.privacyNote}</li>
          </ul>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-forest-900 mb-3">
          3. Two-sided ratings (reputation both ways)
        </h2>
        <p className="text-sm text-forest-700 mb-4">
          After a stay, the guest rates the host and the host rates the guest. Reviews are held
          until both are submitted or {REVIEW_WINDOW_DAYS} days pass.
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
        <h2 className="text-xl font-semibold text-forest-900 mb-3">
          4. Immerse Care (protection layer)
        </h2>
        <p className="text-sm text-forest-700 mb-2">
          Status:{" "}
          <span className="inline-flex px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-medium">
            {IMMERSE_PROTECTION.status}
          </span>
          {" "}
          — partner integration before paid bookings go live.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <div className="rounded-xl bg-white border border-forest-100 p-4">
            <p className="font-medium text-forest-900 mb-2">For hosts</p>
            <ul className="text-sm text-forest-700 space-y-1">
              {IMMERSE_PROTECTION.hostCoverage.map((c) => (
                <li key={c}>▸ {c}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl bg-white border border-forest-100 p-4">
            <p className="font-medium text-forest-900 mb-2">For guests</p>
            <ul className="text-sm text-forest-700 space-y-1">
              {IMMERSE_PROTECTION.guestCoverage.map((c) => (
                <li key={c}>▸ {c}</li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-4 text-sm text-forest-700">
          <strong>Security hold:</strong> {IMMERSE_PROTECTION.depositNote}
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold text-forest-900 mb-3">
          5. Stay record (photos + messages matter)
        </h2>
        <p className="text-sm text-forest-700">
          Check-in and checkout encourage a few photos of the site condition. Messages stay on the
          stay record. Disputes use documentation, not memory.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-semibold text-forest-900 mb-3">6. When something goes wrong</h2>
        <ol className="list-decimal ml-5 text-sm text-forest-800 space-y-2">
          <li>Message through Immerse first (creates a record).</li>
          <li>Open a claim with photos within the review window.</li>
          <li>Immerse reviews stay record + ratings history of both sides.</li>
          <li>
            Resolution: deposit, refund, Care claim, or account limits — including full refund if a
            host demanded a post-payment side contract.
          </li>
        </ol>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/host"
          className="inline-flex px-6 py-3 rounded-full bg-forest-700 text-white font-semibold hover:bg-forest-800"
        >
          Host nature stays
        </Link>
        <Link
          href="/search"
          className="inline-flex px-6 py-3 rounded-full border border-forest-300 text-forest-800 font-medium hover:bg-forest-50"
        >
          Find a place to immerse
        </Link>
      </div>
    </div>
  );
}
