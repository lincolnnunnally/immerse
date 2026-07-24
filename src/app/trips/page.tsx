import Link from "next/link";

export default function TripsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <h1 className="text-3xl font-bold text-forest-900 mb-4">My Trips</h1>
      <p className="text-forest-600 mb-8 max-w-md mx-auto">
        Saved trips and itineraries will live here. For now, start by searching and opening a site detail page.
      </p>
      <Link
        href="/search"
        className="inline-flex px-6 py-3 rounded-full bg-forest-700 text-white font-semibold hover:bg-forest-800 transition"
      >
        Find a place to immerse
      </Link>
    </div>
  );
}
