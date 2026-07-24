import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Immerse — Find & Plan Nature Camping Trips",
  description:
    "Easily discover camping spots on federal, state, private, and dispersed land. Clear info on passes, parking, hike-in, drive times, must-sees, and simple itineraries.",
  keywords: [
    "camping",
    "nature immersion",
    "national forest",
    "dispersed camping",
    "recreation.gov alternative",
    "trip planner",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <header className="border-b border-forest-200 bg-white/80 backdrop-blur sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2 group">
              <span className="text-2xl">🌲</span>
              <span className="font-semibold text-xl tracking-tight text-forest-800 group-hover:text-forest-600 transition">
                Immerse
              </span>
            </a>
            <nav className="flex items-center gap-6 text-sm font-medium text-forest-700">
              <a href="/search" className="hover:text-forest-500 transition">
                Search
              </a>
              <a href="/trips" className="hover:text-forest-500 transition">
                My Trips
              </a>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="border-t border-forest-100 mt-16 py-8 text-center text-sm text-forest-600">
          <p>Built to remove the barriers between you and nature.</p>
          <p className="mt-1 text-forest-400">Immerse © 2026</p>
        </footer>
      </body>
    </html>
  );
}
