import Link from "next/link";
import { CURATED_BY_STATE } from "@/lib/curated";
import { JsonLd } from "@/components/JsonLd";
import { isExamplePrivate, serviceJsonLd, serviceMetadata } from "@/lib/seo";
import type { CampSite, SiteType } from "@/lib/types";

export const metadata = serviceMetadata("places");

const STATE_NAMES: Record<string, string> = { GA: "Georgia", AL: "Alabama" };

// Same distinctions the search filters make: dispersed and WMA are not the same thing.
const TYPE_SECTIONS: Array<{ type: SiteType; heading: string; blurb: string }> = [
  { type: "developed", heading: "Developed campgrounds", blurb: "Tables, fire rings, toilets; usually reservable." },
  { type: "state", heading: "State park campgrounds", blurb: "Run by the state park system; reservations through the state." },
  { type: "dispersed", heading: "Dispersed / primitive camping", blurb: "No facilities, broadly allowed on national forest land under its rules." },
  { type: "wma", heading: "WMA / wildlife area camping", blurb: "Hunting-area overlays with their own camping rules — often designated sites only." },
  { type: "ohv", heading: "OHV / 4x4 trail areas", blurb: "Designated off-highway vehicle trails, with camping nearby." },
  { type: "destination", heading: "Destinations — camp nearby", blurb: "Canyons and waterfalls you go to for the day; each page shows where to sleep near it." },
];

function publicSites(state: string): CampSite[] {
  return (CURATED_BY_STATE[state] ?? []).filter((s) => !isExamplePrivate(s));
}

export default function PlacesPage() {
  const states = Object.keys(CURATED_BY_STATE);
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <JsonLd data={serviceJsonLd("places")} />
      <p className="text-sm text-forest-500 mb-2">Checked by hand</p>
      <h1 className="text-3xl font-bold text-forest-900 mb-3">Camping spots in Georgia and Alabama</h1>
      <p className="text-forest-700 leading-relaxed mb-4">
        Live federal campgrounds come straight from Recreation.gov in{" "}
        <Link href="/search" className="underline underline-offset-2">search</Link>. These are the extras
        it can&apos;t see — state parks, dispersed sites, wildlife areas, OHV trails and canyon
        destinations — that we have looked up one by one. Each page shows fees, passes, parking,
        access, the forecast and directions.
      </p>
      <nav aria-label="States" className="flex flex-wrap gap-3 mb-8 text-sm">
        {states.map((st) => (
          <a key={st} href={`#${st.toLowerCase()}`} className="px-3 py-1.5 rounded-full border border-forest-300 text-forest-800">
            {STATE_NAMES[st] ?? st}
          </a>
        ))}
      </nav>
      {states.map((st) => {
        const sites = publicSites(st);
        return (
          <section key={st} id={st.toLowerCase()} className="mb-12">
            <h2 className="text-2xl font-bold text-forest-900 mb-4">{STATE_NAMES[st] ?? st}</h2>
            {TYPE_SECTIONS.map((sec) => {
              const list = sites.filter((s) => s.type === sec.type);
              if (list.length === 0) return null;
              return (
                <div key={sec.type} className="mb-6">
                  <h3 className="font-semibold text-forest-900 text-lg">{sec.heading}</h3>
                  <p className="text-sm text-forest-600 mb-2">{sec.blurb}</p>
                  <ul className="space-y-2">
                    {list.map((s) => (
                      <li key={s.id} className="bg-white rounded-xl border border-forest-100 px-4 py-3">
                        <Link href={`/site/${encodeURIComponent(s.id)}`} className="font-medium text-forest-800 underline-offset-2 hover:underline">
                          {s.name}
                        </Link>
                        <span className="text-sm text-forest-600">
                          {s.agency ? ` · ${s.agency}` : ""}
                          {s.campingFee ? ` · ${s.campingFee}` : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
            <Link href={`/search?state=${st}`} className="text-sm font-medium text-forest-700 underline underline-offset-2">
              Search all of {STATE_NAMES[st] ?? st}, including live federal campgrounds →
            </Link>
          </section>
        );
      })}
    </div>
  );
}
