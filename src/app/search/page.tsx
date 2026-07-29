import Link from "next/link";
import { CampSite } from "@/lib/types";
import { headers } from "next/headers";
import { SitesMap } from "@/components/SitesMap";
import { hasValidCoords } from "@/lib/maps";

const STATES = [
  { code: "GA", label: "Georgia" },
  { code: "NC", label: "North Carolina" },
  { code: "SC", label: "South Carolina" },
  { code: "TN", label: "Tennessee" },
  { code: "AL", label: "Alabama" },
  { code: "FL", label: "Florida" },
];

const FILTERS = [
  { key: "camping", label: "All" },
  { key: "developed", label: "Developed" },
  { key: "dispersed", label: "Dispersed / WMA" },
  { key: "ohv", label: "OHV / 4x4" },
  { key: "private", label: "Private" },
] as const;

async function absoluteOrigin(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") || h.get("host");
    const proto = h.get("x-forwarded-proto") || "https";
    if (host) return `${proto}://${host}`;
  } catch {
    /* local */
  }
  return "http://localhost:3000";
}

async function fetchSites(
  state: string,
  activity: string,
  q?: string
): Promise<{ sites: CampSite[]; source: string; message?: string; state?: string }> {
  const base = await absoluteOrigin();
  const sp = new URLSearchParams({
    state,
    radius: "160",
    limit: "50",
    activity,
  });
  if (q) sp.set("q", q);

  try {
    const res = await fetch(`${base}/api/search?${sp.toString()}`, {
      next: { revalidate: 900 },
    });
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
    case "private":
      return "bg-violet-100 text-violet-900";
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
          <span
            className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${typeColor(site)}`}
          >
            {typeLabel(site)}
          </span>
        </div>

        {site.agency && <p className="text-xs text-forest-500 mb-3">{site.agency}</p>}

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-4">
          {site.driveTimeMinutes != null && (
            <div>
              <span className="text-forest-500">Drive (from Atlanta area)</span>
              <p className="font-medium text-forest-800">
                ~{Math.floor(site.driveTimeMinutes / 60)}h {site.driveTimeMinutes % 60}m
              </p>
            </div>
          )}
          <div>
            <span className="text-forest-500">Hike-in</span>
            <p className="font-medium text-forest-800">
              {site.hikeInMiles === 0 || site.hikeInMiles == null
                ? site.dataSource === "ridb"
                  ? "See site details"
                  : "Drive-up"
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
            <p className="font-medium text-forest-800">{site.parkingFee || "See details"}</p>
          </div>
          <div>
            <span className="text-forest-500">Camping fee</span>
            <p className="font-medium text-forest-800">{site.campingFee || "See details"}</p>
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
  searchParams: Promise<{ state?: string; activity?: string; q?: string }>;
}) {
  const params = await searchParams;
  const state = (params.state || "GA").toUpperCase();
  const activity = (params.activity || "camping").toLowerCase();
  const q = (params.q || "").trim();
  const { sites, source, message } = await fetchSites(state, activity, q || undefined);

  const sourceLabel =
    source === "ridb"
      ? `Live federal data (RIDB) · ${state}`
      : source === "recreation.gov"
        ? `Live federal campgrounds (Recreation.gov) · ${state}`
        : state === "GA"
          ? "Curated Georgia data (live federal search temporarily unavailable)"
          : `Limited results for ${state}`;

  function hrefFor(next: { state?: string; activity?: string; q?: string }) {
    const sp = new URLSearchParams();
    sp.set("state", next.state || state);
    if ((next.activity || activity) !== "camping") {
      sp.set("activity", next.activity || activity);
    }
    const qq = next.q !== undefined ? next.q : q;
    if (qq) sp.set("q", qq);
    return `/search?${sp.toString()}`;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-forest-900 mb-2">Find a place to immerse</h1>
        <p className="text-forest-600">{sourceLabel}</p>
        {message && (
          <p className="mt-2 text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 inline-block">
            {message}
          </p>
        )}
        <p className="mt-2 text-xs text-forest-500">
          Drive times shown on curated cards are approx. from metro Atlanta / Conyers. Live federal
          cards use Recreation.gov details — confirm fees, passes, and access on the reservation
          page before you go.
        </p>
      </div>

      <form action="/search" method="get" className="mb-6 flex flex-col sm:flex-row gap-2">
        <input type="hidden" name="state" value={state} />
        {activity !== "camping" && <input type="hidden" name="activity" value={activity} />}
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search by name or keyword…"
          className="flex-1 rounded-full border border-forest-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-300"
        />
        <button
          type="submit"
          className="px-5 py-2.5 rounded-full bg-forest-700 text-white text-sm font-semibold hover:bg-forest-800"
        >
          Search
        </button>
      </form>

      <div className="flex flex-wrap gap-2 mb-4">
        {STATES.map((s) => (
          <Link
            key={s.code}
            href={hrefFor({ state: s.code })}
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
        {FILTERS.map((f) => {
          const active = activity === f.key;
          return (
            <Link
              key={f.key}
              href={hrefFor({ activity: f.key })}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                active
                  ? "bg-forest-100 text-forest-900 border border-forest-300"
                  : "bg-white border border-forest-200 text-forest-600 hover:border-forest-400"
              }`}
            >
              {f.label}
              {f.key === "camping" ? ` (${sites.length})` : ""}
            </Link>
          );
        })}
      </div>

      {sites.length === 0 ? (
        <div className="text-center py-16 bg-forest-50 rounded-2xl border border-forest-100">
          <p className="text-forest-800 font-medium mb-2">No sites matched for {state}</p>
          <p className="text-sm text-forest-600 max-w-md mx-auto">
            Try another state, clear filters, or search a park name. Federal campgrounds load from
            Recreation.gov when available.
          </p>
        </div>
      ) : (
        <>
          <section className="mb-8">
            <div className="flex items-end justify-between gap-3 mb-3">
              <div>
                <h2 className="font-semibold text-forest-900 text-lg">Map of results</h2>
                <p className="text-sm text-forest-600">
                  Click a pin for the site. For turn-by-turn, open a site and use Google / Apple /
                  Waze — we don&apos;t replace your preferred maps app.
                </p>
              </div>
              <span className="text-xs text-forest-500 shrink-0">
                {sites.filter((s) => hasValidCoords(s.lat, s.lng)).length} plotted
              </span>
            </div>
            <SitesMap
              mode="search"
              pins={sites
                .filter((s) => hasValidCoords(s.lat, s.lng))
                .map((s) => ({
                  id: s.id,
                  name: s.name,
                  lat: s.lat,
                  lng: s.lng,
                  href: `/site/${s.id}`,
                  type: s.type,
                }))}
            />
          </section>

          <div className="grid md:grid-cols-2 gap-5">
            {sites.map((site) => (
              <SiteCard key={site.id} site={site} />
            ))}
          </div>
        </>
      )}

      <p className="mt-12 text-center text-sm text-forest-500">
        Data source:{" "}
        {source === "ridb"
          ? "RIDB"
          : source === "recreation.gov"
            ? "Recreation.gov public inventory"
            : "Curated fallback"}
        {state === "GA" ? " + Georgia enrichment (dispersed / WMA / OHV / private examples)" : ""}.
      </p>
    </div>
  );
}
