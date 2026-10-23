import type { MetadataRoute } from "next";
import { allCurated } from "@/lib/curated";
import { isExamplePrivate } from "@/lib/seo";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://immerse.unitedundergod.org";

const ROUTES: Array<{ path: string; priority: number }> = [
  { path: "/", priority: 1 },
  { path: "/search", priority: 0.9 },
  { path: "/places", priority: 0.85 },
  { path: "/adventures", priority: 0.85 },
  { path: "/partners", priority: 0.8 },
  { path: "/host", priority: 0.7 },
  { path: "/trust", priority: 0.7 },
  { path: "/privacy", priority: 0.4 },
  { path: "/terms", priority: 0.4 },
  { path: "/policy/severe-abuse", priority: 0.5 },
];

// /trips, /account, /admin and /book/* are per-person and noindex. Example private stays are
// illustrations, not real listings, so they stay out. Live federal /site/{id} pages are reachable
// from search but not listed here (thousands of ids, fetched on demand).
const CURATED_SITE_ROUTES = allCurated()
  .filter((s) => !isExamplePrivate(s))
  .map((s) => ({ path: `/site/${encodeURIComponent(s.id)}`, priority: 0.6 }));

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [...ROUTES, ...CURATED_SITE_ROUTES].map(({ path, priority }) => ({
    url: `${BASE_URL}${path === "/" ? "" : path}`,
    lastModified,
    changeFrequency: priority >= 0.85 ? "weekly" : "monthly",
    priority,
  }));
}
