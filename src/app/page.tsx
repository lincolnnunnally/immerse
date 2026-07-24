import Link from "next/link";

export default function HomePage() {
  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-forest-900 via-forest-800 to-forest-950 text-white">
        <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzLTItMi0yLTQgMi0yIDItNGgtMnYyYzAgMi0yIDQtMiA0czIgMiAyIDQtMiAyLTIgNGgydi0yem0tMjAgMGMwLTIgMi00IDItNHMtMi0yLTItNCAyLTIgMi00aC0ydjJjMCAyLTIgNC0yIDRzMiAyIDIgNC0yIDItMiA0aDJ2LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')]"></div>
        <div className="relative max-w-4xl mx-auto px-4 py-24 md:py-32 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Get immersed in nature.
            <br />
            <span className="text-forest-300">Without the friction.</span>
          </h1>
          <p className="text-lg md:text-xl text-forest-100 max-w-2xl mx-auto mb-10 leading-relaxed">
            Find camping spots on public and private land. Instantly know the drive time, hike-in, passes, parking, and must-sees. Build a simple itinerary. Reserve with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/search"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-white text-forest-900 font-semibold text-lg hover:bg-forest-50 transition shadow-lg"
            >
              Start searching
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full border-2 border-forest-400 text-white font-semibold text-lg hover:bg-forest-800/50 transition"
            >
              How it works
            </Link>
          </div>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="max-w-5xl mx-auto px-4 py-20" id="how-it-works">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-forest-900 mb-4">
            The information barrier ends here
          </h2>
          <p className="text-lg text-forest-700 max-w-2xl mx-auto">
            Existing apps leave you guessing. Immerse puts the practical details front and center so you can actually go.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-forest-100">
            <div className="text-3xl mb-4">🗺️</div>
            <h3 className="font-semibold text-lg text-forest-900 mb-2">Unified search</h3>
            <p className="text-forest-700 text-sm leading-relaxed">
              Federal campgrounds, dispersed sites, state parks, and private land in one clean interface. No more tab-hopping.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-forest-100">
            <div className="text-3xl mb-4">✅</div>
            <h3 className="font-semibold text-lg text-forest-900 mb-2">Zero guessing</h3>
            <p className="text-forest-700 text-sm leading-relaxed">
              Drive time, hike-in distance, exact pass needed, parking rules, reservation window — all on the card before you click.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-forest-100">
            <div className="text-3xl mb-4">📅</div>
            <h3 className="font-semibold text-lg text-forest-900 mb-2">Simple itineraries</h3>
            <p className="text-forest-700 text-sm leading-relaxed">
              One-click day-by-day plan with setup buffers, must-sees, packing notes, and direct reservation links.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-forest-50 border-y border-forest-100">
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-forest-900 mb-4">
            Ready to get outside?
          </h2>
          <p className="text-forest-700 mb-8">
            Start with Georgia & the Southeast. National coverage is coming.
          </p>
          <Link
            href="/search"
            className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-forest-700 text-white font-semibold hover:bg-forest-800 transition"
          >
            Explore places to immerse
          </Link>
        </div>
      </section>
    </div>
  );
}
