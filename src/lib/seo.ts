import type { Metadata } from "next";
import type { CampSite } from "./types";

/**
 * What search engines see. Every line describes something Immerse does today.
 * Never index: My Trips, account, admin, booking requests, or example private stays.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://immerse.unitedundergod.org").replace(/\/$/, "");
export const SITE_NAME = "Immerse";

export function absoluteUrl(path: string): string {
  return path === "/" ? SITE_URL : `${SITE_URL}${path}`;
}

export function pageMetadata(path: string, title: string, description: string): Metadata {
  const url = absoluteUrl(path);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", siteName: SITE_NAME, url, title, description, locale: "en_US" },
    twitter: { card: "summary", title, description },
  };
}

export const NOINDEX: Metadata = { robots: { index: false, follow: false } };

/** One entry per thing Immerse lets people do. Used for metadata, JSON-LD and footer links. */
export const SERVICES = {
  search: {
    path: "/search",
    name: "Campground search",
    title: "Find campgrounds near a park, canyon or town | Immerse",
    description:
      "Type a place and see where you can sleep near it: federal campgrounds live from Recreation.gov, state parks, and curated dispersed, WMA and OHV spots.",
  },
  places: {
    path: "/places",
    name: "Curated camping spots",
    title: "Camping spots in Georgia and Alabama, checked by hand | Immerse",
    description:
      "Hand-checked campgrounds, dispersed sites, wildlife areas, OHV trails, state parks and canyons in Georgia and northeast Alabama, with fees and access.",
  },
  adventures: {
    path: "/adventures",
    name: "Adventure videos",
    title: "Camping and outdoor adventure videos from real trips | Immerse",
    description:
      "Watch YouTube videos from real camping trips so you can feel a place before you go, or share your own adventure video and link it to the place you camped.",
  },
  share: {
    path: "/adventures/new",
    name: "Share an adventure video",
    title: "Share your camping trip video | Immerse",
    description:
      "Filmed a trip on your phone? Upload it to YouTube, paste the link, and tie it to the place so the next camper can see what it is really like.",
  },
  host: {
    path: "/host",
    name: "Host a private nature stay",
    title: "Host a private nature stay on your land | Immerse",
    description:
      "Own land and want to open a few quiet spots? Read the nature-first rules and host pledge, and express interest. Booking and payments are not live yet.",
  },
  partners: {
    path: "/partners",
    name: "Parks and land manager partners",
    title: "Adventure marketing for parks and forests | Immerse",
    description:
      "State parks, national forests and recreation areas: partner so visitor adventure videos and trip prep highlight your sites. Tell us you're interested.",
  },
  trust: {
    path: "/trust",
    name: "Trust and safety",
    title: "Trust and safety for hosts and guests | Immerse",
    description:
      "How Immerse protects hosts' land and guests' privacy and quiet: what we prevent, what we ban, and why money never stands in for lost trust.",
  },
} as const;

export type ServiceKey = keyof typeof SERVICES;

export const SERVICE_ORDER: ServiceKey[] = ["search", "places", "adventures", "share", "host", "partners", "trust"];

export function serviceMetadata(key: ServiceKey): Metadata {
  const s = SERVICES[key];
  return pageMetadata(s.path, s.title, s.description);
}

export const HOME = {
  title: "Immerse — find and plan nature camping trips",
  description:
    "Find camping near a park, canyon or town: Recreation.gov campgrounds, state parks and curated dispersed spots, with fees, passes and directions up front.",
};

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  email: "hello@unitedundergod.org",
};

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: SITE_NAME,
  url: SITE_URL,
  publisher: { "@id": `${SITE_URL}/#organization` },
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export function serviceJsonLd(key: ServiceKey) {
  const s = SERVICES[key];
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: s.name,
    description: s.description,
    url: absoluteUrl(s.path),
    provider: { "@id": `${SITE_URL}/#organization` },
  };
}

/** Example private stays are illustrations, not real listings — never index them. */
export function isExamplePrivate(site: CampSite): boolean {
  return site.type === "private" && (site.dataSource === "private_host" || site.id.startsWith("private-"));
}

const TYPE_WORD: Record<string, string> = {
  developed: "campground",
  dispersed: "dispersed camping",
  wma: "wildlife area camping",
  ohv: "OHV and 4x4 trail camping",
  state: "state park camping",
  destination: "where to camp nearby",
  private: "private nature stay",
};

function clip(text: string, max: number): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), max - 20))}…`;
}

export function siteMetadata(site: CampSite): Metadata {
  const path = `/site/${encodeURIComponent(site.id)}`;
  const word = TYPE_WORD[site.type] ?? "camping";
  const candidates = [`${site.name} — ${word} | Immerse`, `${site.name} | Immerse`, site.name];
  const title = candidates.find((t) => t.length <= 65) ?? clip(site.name, 65);
  const description = clip(
    site.description || `${site.name} — fees, passes, access, forecast, and directions on Immerse.`,
    158,
  );
  const meta = pageMetadata(path, title, description);
  return isExamplePrivate(site) ? { ...meta, ...NOINDEX } : meta;
}

/** JSON-LD for a real public place. Only facts already shown on the page. */
export function siteJsonLd(site: CampSite) {
  const hasGeo = Number.isFinite(site.lat) && Number.isFinite(site.lng) && (site.lat !== 0 || site.lng !== 0);
  return {
    "@context": "https://schema.org",
    "@type": site.type === "destination" ? "TouristAttraction" : "Campground",
    name: site.name,
    description: site.description || undefined,
    url: absoluteUrl(`/site/${encodeURIComponent(site.id)}`),
    ...(site.imageUrl ? { image: site.imageUrl } : {}),
    ...(hasGeo ? { geo: { "@type": "GeoCoordinates", latitude: site.lat, longitude: site.lng } } : {}),
    ...(site.amenities?.length
      ? {
          amenityFeature: site.amenities.map((a) => ({ "@type": "LocationFeatureSpecification", name: a, value: true })),
        }
      : {}),
  };
}
