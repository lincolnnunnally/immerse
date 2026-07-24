import Link from "next/link";
import { CampSite } from "@/lib/types";

const STATES = [
  { code: "GA", label: "Georgia" },
  { code: "NC", label: "North Carolina" },
  { code: "SC", label: "South Carolina" },
  { code: "TN", label: "Tennessee" },
  { code: "AL", label: "Alabama" },
  { code: "FL", label: "Florida" },
];

async function fetchSites(
  state: string
): Promise<{ sites: CampSite[]; source: string; message?: string; state?: string }> {
  const base = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  try {
    const res = await fetch(
      `${base}/api/search?state=${encodeURIComponent(state)}&radius=100&limit=50`,
      { next: { revalidate: 1800 } }
    );
    if (!res.ok) throw new Error("Search API error");
    return res.json();
  } catch {
    const { mockSites } = await import("@/lib/mock-sites");
    return {
      sites: state === "GA" ? mockSites : [],
      source: "mock",
      message: "Could not reach search API",
      state,
    };
  }
}

function typeLabel(site: CampSite): string {
  switch (site.type) {
    case "developed":
      return "Developed";
    case "dispersed":
      return "Dispersed / Free";
    case "wma":
      return "WMA / Wildlife";
    case "ohv":
      return "OHV / 4x4";
    case "private":
      return "Private";
    case "state":
      return "State";
    default:
      return site.type;
  }
}

function typeColor(site: CampSite): string {
  switch (site.type) {
    case "dispersed":
      return "bg-emerald-100 text-emerald-800";
    case "developed":
      return "bg-sky-100 text-sky-800";
    case "wma":
      return "bg-lime-100 text-lime-800";
    case "ohv":
      return "bg-orange-100 text-orange-900";
    default:
      return "bg-amber-100 text-amber-800";
  }
}

function SiteCard({ site }: { site: CampSite }) {
  const passShort =
    site.passRequired.length > 32
      ? site.passRequired.slice(0, 30) + "…"
      : site.passRequired;

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
          <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${typeColor(site)}`}>
            {typeLabel(site)}
          </span>
        </div>

        {site.agency && (
          <p className="text-xs text-forest-500 mb-3">{site.agency}</p>
        )}

        {/* Anti-guessing row */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4">
          {site.driveTimeMinutes != null && (
            <div>
              <span className="text-forest-500">Drive</span>
              <p className="font-medium text-forest-800">
                ~{Math.floor(site.driveTimeMinutes / 60)}h {site.driveTimeMinutes % 60}m
              </p>
            </div>
          )}
          <div>
            <span className="text-forest-500">Hike-in</span>
            <p className="font-medium text-forest-800">
              {site.hikeInMiles === 0 || site.hikeInMiles == null
                ? "Drive-up"
                : `${site.hikeInMiles} mi`}
              {site.hikeInElevationGain ? ` · +${site.hikeInElevationGain} ft` : ""}
            </p>
          </div>
          <div>
            <span className="text-forest-500">Pass</span>
            <p className="font-medium text-forest-800" title={site.passRequired}>
              {passShort}
            </p>
          </div>
          <div>
            <span className="text-forest-500">Parking</span>
            <p className="font-medium text-forest-800">
              {site.parkingFee || "See details"}
            </p>
          </div>
          <div>
            <span className="text-forest-500">Camping fee</span>
            <p className="font-medium text-forest-800">
              {site.campingFee || "See details"}
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

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  const params = await searchParams;
  const state = (params.state || "GA").toUpperCase();
  const { sites, source, message } = await fetchSites(state);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-forest-900 mb-2">Find a place to immerse</h1>
        <p className="text-forest-600">
          {source === "ridb"
            ? `Live federal data via RIDB · ${state}`
            : state === "GA"
            ? "Curated Georgia data · add RIDB_API_KEY for live federal results nationwide"
            : `No curated set for ${state} yet · add RIDB_API_KEY to unlock federal lands`}
        </p>
        {message && (
          <p className="mt-2 text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 inline-block">
            {message}
          </p>
        )}
      </div>

      {/* State selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATES.map((s) => (
          <Link
            key={s.code}
            href={`/search?state=${s.code}`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              state === s.code
                ? "bg-forest-700 text-white"
                : "bg-white border border-forest-200 text-forest-700 hover:border-forest-400"
            }`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-8">
        <span className="px-4 py-2 rounded-full bg-forest-100 text-forest-800 text-sm font-medium">
          All ({sites.length})
        </span>
        <span className="px-4 py-2 rounded-full bg-white border border-forest-200 text-forest-600 text-sm">
          Developed
        </span>
        <span className="px-4 py-2 rounded-full bg-white border border-forest-200 text-forest-600 text-sm">
          Dispersed / WMA
        </span>
        <span className="px-4 py-2 rounded-full bg-white border border-forest-200 text-forest-600 text-sm">
          OHV / 4x4
        </span>
      </div>

      {sites.length === 0 ? (
        <div className="text-center py-16 bg-forest-50 rounded-2xl border border-forest-100">
          <p className="text-forest-800 font-medium mb-2">No sites for {state} yet</p>
          <p className="text-sm text-forest-600 max-w-md mx-auto">
            Drop your free RIDB API key into <code className="bg-white px-1 rounded">.env.local</code> and
            restart. Federal campgrounds and recreation areas for every state will light up automatically.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {sites.map((site) => (
            <SiteCard key={site.id} site={site} />
          ))}
        </div>
      )}

      <p className="mt-12 text-center text-sm text-forest-500">
        Data source: {source === "ridb" ? "RIDB + Georgia enrichment" : "Curated Georgia set"}.
        Pass, parking, and hike-in fields are shown on every card so you stop guessing.
      </p>
    </div>
  );
}
