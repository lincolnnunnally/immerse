import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-forest-900 mb-4">Terms of use</h1>
      <p className="text-forest-700 leading-relaxed mb-4">
        Immerse helps you discover and plan nature immersion trips. By using the app you agree to
        these terms.
      </p>
      <h2 className="text-xl font-semibold text-forest-900 mt-8 mb-2">Not a reservation system</h2>
      <p className="text-forest-700 leading-relaxed mb-4">
        Public-land reservations are completed on Recreation.gov or the official agency site.
        Immerse may show availability summaries and links for convenience. Always confirm fees,
        passes, closures, and fire rules with the managing agency before you go.
      </p>
      <h2 className="text-xl font-semibold text-forest-900 mt-8 mb-2">Private nature stays</h2>
      <p className="text-forest-700 leading-relaxed mb-4">
        Example private listings are not live paid bookings. Interest forms are waitlist /
        product-design signals until hosts are onboarded and payment/fulfillment is proven. No
        money is taken for private stays until that is true.
      </p>
      <h2 className="text-xl font-semibold text-forest-900 mt-8 mb-2">Adventure videos</h2>
      <p className="text-forest-700 leading-relaxed mb-4">
        You must own the rights (or have permission) to any YouTube video you link. Content must not
        promote harm to wildlife, land, or people. We may remove posts that violate Leave No Trace
        or our{" "}
        <Link href="/policy/severe-abuse" className="underline">
          severe abuse policy
        </Link>
        .
      </p>
      <h2 className="text-xl font-semibold text-forest-900 mt-8 mb-2">Safety</h2>
      <p className="text-forest-700 leading-relaxed mb-4">
        Outdoor recreation has real risks. You are responsible for your preparation, gear, weather
        decisions, and compliance with local law.
      </p>
      <h2 className="text-xl font-semibold text-forest-900 mt-8 mb-2">Accounts</h2>
      <p className="text-forest-700 leading-relaxed mb-4">
        Keep your password safe. Do not abuse the service or scrape it aggressively. We may suspend
        accounts that harm other users or the land.
      </p>
      <h2 className="text-xl font-semibold text-forest-900 mt-8 mb-2">Contact</h2>
      <p className="text-forest-700 leading-relaxed mb-8">
        <a className="underline" href="mailto:hello@unitedundergod.org">
          hello@unitedundergod.org
        </a>
      </p>
      <Link href="/" className="text-forest-700 underline text-sm">
        ← Home
      </Link>
    </div>
  );
}
