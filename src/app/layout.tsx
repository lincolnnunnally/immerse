import type { Metadata } from "next";
import "./globals.css";
import { AuthNav } from "@/components/AuthNav";
import { Telemetry } from "../lib/TelemetryProvider";

export const metadata: Metadata = {
  title: "Immerse — Find & Plan Nature Camping Trips",
  description:
    "Discover camping spots on federal and curated land. Clear info on passes, parking, hike-in, drive times, availability, itinerary templates, and YouTube adventure videos.",
  keywords: [
    "camping",
    "nature immersion",
    "national forest",
    "dispersed camping",
    "recreation.gov alternative",
    "trip planner",
    "adventure videos",
    "private nature stay",
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
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
            <a href="/" className="flex items-center gap-2 group shrink-0">
              <span className="text-2xl">🌲</span>
              <span className="font-semibold text-xl tracking-tight text-forest-800 group-hover:text-forest-600 transition">
                Immerse
              </span>
            </a>
            <nav className="flex items-center gap-3 sm:gap-4 text-sm font-medium text-forest-700 flex-wrap justify-end">
              <a href="/search" className="hover:text-forest-500 transition">
                Search
              </a>
              <a href="/adventures" className="hover:text-forest-500 transition">
                Adventures
              </a>
              <a href="/trips" className="hover:text-forest-500 transition">
                My Trips
              </a>
              <a href="/host" className="hover:text-forest-500 transition hidden sm:inline">
                Host
              </a>
              <a href="/partners" className="hover:text-forest-500 transition hidden md:inline">
                Partners
              </a>
              <a href="/trust" className="hover:text-forest-500 transition hidden sm:inline">
                Trust
              </a>
              <AuthNav />
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="border-t border-forest-100 mt-16 py-8 text-center text-sm text-forest-600">
          <p>Built to remove the barriers between you and nature.</p>
          <p className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-forest-500">
            <a href="/privacy" className="hover:text-forest-700 underline-offset-2 hover:underline">
              Privacy
            </a>
            <a href="/terms" className="hover:text-forest-700 underline-offset-2 hover:underline">
              Terms
            </a>
            <a href="/partners" className="hover:text-forest-700 underline-offset-2 hover:underline">
              Parks & partners
            </a>
            <a
              href="mailto:hello@unitedundergod.org"
              className="hover:text-forest-700 underline-offset-2 hover:underline"
            >
              Contact
            </a>
          </p>
          <p className="mt-2 text-forest-400">Immerse © 2026 · unitedundergod.org</p>
        </footer>
        <Telemetry app="immerse" />
      </body>
    </html>
  );
}
