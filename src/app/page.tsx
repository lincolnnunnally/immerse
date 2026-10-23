import Link from "next/link";
import { HOME, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/", HOME.title, HOME.description);

export default function HomePage() {
  return (
    <div className="relative">
      <section className="relative overflow-hidden bg-gradient-to-br from-forest-900 via-forest-800 to-forest-950 text-white">
        <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzLTItMi0yLTQgMi0yIDItNGgtMnYyYzAgMi0yIDQtMiA0czIgMiAyIDQtMiAyLTIgNGgydi0yem0tMjAgMGMwLTIgMi00IDItNHMtMi0yLTItNCAyLTIgMi00aC0ydjJjMCAyLTIgNC0yIDRzMiAyIDIgNC0yIDItMiA0aDJ2LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')]"></div>
        <div className="relative max-w-4xl mx-auto px-4 py-24 md:py-32 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Get immersed in nature.
            <br />
            <span className="text-forest-300">Without the friction.</span>
          </h1>
          <p className="text-lg md:text-xl text-forest-100 max-w-2xl mx-auto mb-8 leading-relaxed">
            Type a place — a canyon, a park, a town — and see where you can actually sleep near it:
            federal campgrounds live from Recreation.gov, state parks, and curated dispersed spots.
            Fees, passes, forecast, and reservation links up front. Directions in the maps app you
            already use.
          </p>
          <form action="/search" method="get" className="max-w-xl mx-auto mb-5 flex flex-col sm:flex-row gap-2">
            <input
              type="search"
              name="q"
              placeholder="Where to? e.g. Little River Canyon"
              className="flex-1 rounded-full px-5 py-3.5 text-forest-900 text-base focus:outline-none focus:ring-4 focus:ring-forest-400/40 shadow-lg"
              aria-label="Where do you want to go?"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-white text-forest-900 font-semibold text-lg hover:bg-forest-50 transition shadow-lg"
            >
              Find camping
            </button>
          </form>
          <div className="flex flex-wrap gap-2 justify-center text-sm mb-6">
            {[
              { q: "Little River Canyon", label: "Little River Canyon, AL" },
              { q: "Helen GA", label: "Helen, GA" },
              { q: "Cloudland Canyon", label: "Cloudland Canyon, GA" },
              { q: "Cheaha", label: "Cheaha / Talladega NF" },
              { q: "Smokies", label: "Great Smoky Mountains" },
            ].map((s) => (
              <Link
                key={s.q}
                href={`/search?q=${encodeURIComponent(s.q)}`}
                className="px-3 py-1.5 rounded-full border border-forest-500/70 text-forest-100 hover:bg-forest-800/60 transition"
              >
                {s.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/search"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-full border-2 border-forest-400 text-white font-semibold hover:bg-forest-800/50 transition"
            >
              Browse by state
            </Link>
            <Link
              href="/adventures"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-full border-2 border-forest-400 text-white font-semibold hover:bg-forest-800/50 transition"
            >
              Adventure videos
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-20" id="how-it-works">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-forest-900 mb-4">
            The information barrier ends here
          </h2>
          <p className="text-lg text-forest-700 max-w-2xl mx-auto">
            Existing apps leave you guessing. Immerse puts the practical details front and center so
            you can actually go.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-forest-100">
            <div className="text-3xl mb-4">🗺️</div>
            <h3 className="font-semibold text-lg text-forest-900 mb-2">Search by place</h3>
            <p className="text-forest-700 text-sm leading-relaxed">
              Live federal campgrounds via Recreation.gov, plus state parks, destinations, and
              dispersed / WMA / OHV spots we&apos;ve verified — sorted by distance from where you
              want to be.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-forest-100">
            <div className="text-3xl mb-4">✅</div>
            <h3 className="font-semibold text-lg text-forest-900 mb-2">Trip-ready, not just listed</h3>
            <p className="text-forest-700 text-sm leading-relaxed">
              Pass, parking, fees, and who actually holds the reservation. Every site page pulls the
              live NWS forecast, weather and park alerts, and sunrise/sunset — the night-before
              checklist, done.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-forest-100">
            <div className="text-3xl mb-4">🎬</div>
            <h3 className="font-semibold text-lg text-forest-900 mb-2">Adventure videos</h3>
            <p className="text-forest-700 text-sm leading-relaxed">
              Link YouTube videos from real trips so the next person can feel the place — and parks
              can partner on authentic marketing.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-forest-50 border-y border-forest-100">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-forest-900 mb-4">
            Ready to get outside?
          </h2>
          <p className="text-forest-700 mb-8">
            Start with the Southeast. Live federal inventory works across every state we list;
            Georgia and northeast Alabama have the deepest curated extras.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/search?state=GA"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-forest-700 text-white font-semibold text-lg hover:bg-forest-800 transition shadow-md"
            >
              Search Georgia
            </Link>
            <Link
              href="/search?state=AL"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-forest-700 text-white font-semibold text-lg hover:bg-forest-800 transition shadow-md"
            >
              Search Alabama
            </Link>
            <Link
              href="/partners"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full border border-forest-300 text-forest-800 font-semibold hover:bg-white transition"
            >
              Parks & managers
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
