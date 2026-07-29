import type { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://immerse.unitedundergod.org";

const ROUTES: Array<{ path: string; priority: number }> = [
  { path: "/", priority: 1 },
  { path: "/search", priority: 0.9 },
  { path: "/adventures", priority: 0.85 },
  { path: "/adventures/new", priority: 0.5 },
  { path: "/partners", priority: 0.8 },
  { path: "/host", priority: 0.7 },
  { path: "/trips", priority: 0.6 },
  { path: "/trust", priority: 0.7 },
  { path: "/privacy", priority: 0.4 },
  { path: "/terms", priority: 0.4 },
  { path: "/policy/severe-abuse", priority: 0.5 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return ROUTES.map(({ path, priority }) => ({
    url: `${BASE_URL}${path === "/" ? "" : path}`,
    lastModified,
    changeFrequency: priority >= 0.85 ? "weekly" : "monthly",
    priority,
  }));
}
