import Link from "next/link";
import { CampSite } from "@/lib/types";

async function fetchSites(): Promise<{ sites: CampSite[]; source: string; message?: string }> {
  // Server-side fetch to our own API route
  const base = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  try {
    // Default: Georgia focus
    const res = await fetch(
      `${base}/api/search?state=GA&radius=100&limit=40`,
      { next: { revalidate: 1800 } }
    );
    if (!res.ok) throw new Error("Search API error");
    return res.json();
  } catch {
    const { mockSites } = await import("@/lib/mock-sites");
    return { sites: mockSites, source: "mock", message: "Could not reach search API" };
  }
}

function SiteCard({ site }: { site: CampSite }) {
  const typeLabel =
    site.type === "developed"
      ? "Developed"
      : site.type === "dispersed"
      ? "Dispersed / Free"
      : site.type === "private"
      ? "Private"
      : "State";

  const typeColor =
    site.type === "dispersed"
      ? "bg-emerald-100 text-emerald-800"
      : site.type === "developed"
      ? "bg-sky-100 text-sky-800"
      : "bg-amber-100 text-amber-800";

  return (
    <Link
      href={`/site/${site.id}`}
      className="block bg-white rounded-2xl border border-forest-100 shadow-sm hover:shadow-md hover:border-forest-300 transition overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h2 className="font-semibold text-lg text-forest-900 leading-snug">
            {site.name}
          </h2>
          <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${typeColor}`}>
            {typeLabel}
          </span>
        </div>

        {site.agency && (
          <p className="text-xs text-forest-500 mb-3">{site.agency}</p>
        )}

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4">
          {site.driveTimeMinutes != null && (
            <div>
              <span className="text-forest-500">Drive</span>
              <p className="font-medium text-forest-800">
                ~{Math.round(site.driveTimeMinutes / 60)}h {site.driveTimeMinutes % 60}m
              </p>
            </div>
          )}
          <div>
            <span className="text-forest-500">Hike-in</span>
            <p className="font-medium text-forest-800">
              {site.hikeInMiles === 0 || site.hikeInMiles == null
                ? "Drive-up / TBD"
                : `${site.hikeInMiles} mi`}
              {site.hikeInElevationGain ? ` (+${site.hikeInElevationGain} ft)` : ""}
            </p>
          </div>
          <div>
            <span className="text-forest-500">Pass</span>
            <p className="font-medium text-forest-800 truncate" title={site.passRequired}>
              {site.passRequired.length > 28
                ? site.passRequired.slice(0, 26) + "…"
                : site.passRequired}
            </p>
          </div>
          <div>
            <span className="text-forest-500">Reserve?</span>
            <p className="font-medium text-forest-800">
              {site.reservationRequired ? "Yes" : "No — first come"}
            </p>
          </div>
        </div>

        {site.mustSees && site.mustSees.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {site.mustSees.slice(0, 3).map((item) => (
              <span
                key={item}
                className="text-xs bg-forest-50 text-forest-700 px-2 py-0.5 rounded-full"
              >
                {item}
              </span>
            ))}
          </div>
        )}

        <p className="text-sm text-forest-600 line-clamp-2">{site.description}</p>
      </div>
    </Link>
  );
}

export default async function SearchPage() {
  const { sites, source, message } = await fetchSites();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-forest-900 mb-2">Find a place to immerse</h1>
        <p className="text-forest-600">
          {source === "ridb"
            ? "Live federal data via RIDB · Georgia focus"
            : "Curated starter data · add RIDB_API_KEY for live federal results"}
        </p>
        {message && (
          <p className="mt-2 text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 inline-block">
            {message}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <span className="px-4 py-2 rounded-full bg-forest-700 text-white text-sm font-medium">
          All ({sites.length})
        </span>
        <span className="px-4 py-2 rounded-full bg-white border border-forest-200 text-forest-700 text-sm font-medium">
          Developed
        </span>
        <span className="px-4 py-2 rounded-full bg-white border border-forest-200 text-forest-700 text-sm font-medium">
          Dispersed / Free
        </span>
      </div>

      {sites.length === 0 ? (
        <p className="text-forest-600">No sites found. Try adjusting filters or adding an RIDB key.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {sites.map((site) => (
            <SiteCard key={site.id} site={site} />
          ))}
        </div>
      )}

      <p className="mt-12 text-center text-sm text-forest-500">
        Data source: {source === "ridb" ? "Recreation Information Database (RIDB)" : "Curated mock set"}.
        Availability calendars and pass enrichment coming next.
      </p>
    </div>
  );
}
