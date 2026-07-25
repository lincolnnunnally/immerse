import Link from "next/link";
import { PRIVATE_HOST_LIMITS } from "@/lib/types";

export default function HostPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <p className="text-sm text-forest-500 mb-2">For landowners</p>
      <h1 className="text-3xl font-bold text-forest-900 mb-3">
        Share land for immersion — not a campground
      </h1>
      <p className="text-forest-700 text-lg leading-relaxed mb-8">
        Immerse is for people who want to get saturated in nature. If you own land and want to
        open a few quiet spots, you can earn something for stewardship — without turning your
        place into a commercial park.
      </p>

      <section className="bg-white rounded-2xl border border-forest-100 p-6 mb-8 shadow-sm">
        <h2 className="font-semibold text-forest-900 text-lg mb-3">The nature-first rules</h2>
        <ul className="space-y-3 text-forest-800 text-sm">
          <li className="flex gap-2">
            <span className="text-forest-500">▸</span>
            <span>
              <strong>Max {PRIVATE_HOST_LIMITS.maxSitesPerProperty} sites</strong> per property.
              Enough for a small group of guests — not a campground layout.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-forest-500">▸</span>
            <span>
              <strong>No permanent commercial infrastructure.</strong> We do not allow RV hookup
              rows, dump stations, pools, gift shops, or event pavilions as the product.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-forest-500">▸</span>
            <span>
              <strong>Nature stays nature.</strong> Guests come for quiet, stars, and land — not
              amenities that erase the wild feel.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-forest-500">▸</span>
            <span>
              <strong>Leave No Trace required.</strong> Hosts and guests share responsibility.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-forest-500">▸</span>
            <span>
              <strong>You can earn revenue</strong> without volume. A few thoughtful nights beat
              packing the land every weekend.
            </span>
          </li>
        </ul>
      </section>

      <section className="bg-amber-50 border border-amber-100 rounded-2xl p-6 mb-8 text-sm text-amber-950">
        <h2 className="font-semibold mb-2">What we intentionally reject</h2>
        <p className="mb-3">
          Listings that look like mini commercial campgrounds — dense sites, permanent hookups,
          activity centers, or anything that would make a guest say “this is no longer nature.”
          Hipcamp-style access is welcome; theme-park camping is not.
        </p>
        <p className="font-medium">Banned as primary amenities:</p>
        <p className="mt-1 text-amber-900">
          {PRIVATE_HOST_LIMITS.bannedAmenities.join(" · ")}
        </p>
      </section>

      <section className="mb-10">
        <h2 className="font-semibold text-forest-900 text-lg mb-3">The host pledge</h2>
        <blockquote className="border-l-4 border-forest-400 pl-4 text-forest-800 italic">
          {PRIVATE_HOST_LIMITS.requiredPledge}
        </blockquote>
      </section>

      <section className="bg-forest-50 rounded-2xl border border-forest-100 p-6 mb-8">
        <h2 className="font-semibold text-forest-900 text-lg mb-2">How listing will work</h2>
        <ol className="list-decimal ml-5 space-y-2 text-sm text-forest-800">
          <li>Tell us about the land and how many true nature sites (≤ {PRIVATE_HOST_LIMITS.maxSitesPerProperty}).</li>
          <li>Agree to the nature-first rules and host pledge.</li>
          <li>We review for fit — not just “is it bookable,” but “does it still feel like immersion.”</li>
          <li>Approved stays appear in search next to public land, with the same clarity cards.</li>
        </ol>
        <p className="mt-4 text-sm text-forest-600">
          Booking / payments and host dashboard are on the roadmap. Right now this page is the
          product contract: what Immerse will and will not become.
        </p>
      </section>

      <div className="flex flex-wrap gap-3">
        <a
          href="mailto:host@immerse.app?subject=Immerse%20private%20nature%20stay%20interest"
          className="inline-flex px-6 py-3 rounded-full bg-forest-700 text-white font-semibold hover:bg-forest-800 transition"
        >
          Express interest as a host
        </a>
        <Link
          href="/search"
          className="inline-flex px-6 py-3 rounded-full border border-forest-300 text-forest-800 font-medium hover:bg-forest-50"
        >
          Browse places to immerse
        </Link>
      </div>
    </div>
  );
}
