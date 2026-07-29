# Immerse

**The easy way to find and plan nature immersion camping trips.**

Live: **https://immerse.unitedundergod.org**

## What works now

- Live federal campground search via Recreation.gov public API (no key required)
- Optional RIDB key for richer federal inventory when set
- Research maps on search + site pages (OpenStreetMap / Leaflet)
- Directions open in **Google Maps, Apple Maps, or Waze** (no in-app turn-by-turn)
- Georgia curated enrichment (dispersed, WMA, OHV, example private nature stays)
- Site detail for curated **and** numeric federal IDs
- Availability summaries for Recreation.gov campgrounds
- Shared LPL accounts, saved trips, password recovery request
- Adventure videos (YouTube links) + park/manager partner interest
- Privacy + Terms; honest copy on example private listings

## Tech

- Next.js 15 (App Router) + TypeScript + Tailwind
- Shared LPL Supabase (`immerse_*` tables)
- Vercel + `immerse.unitedundergod.org`

## Local

```bash
npm install
cp .env.example .env.local
# Required for accounts: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
# Optional: RIDB_API_KEY, NEXT_PUBLIC_MAPBOX_TOKEN
npm run dev
```

## Optional env

| Var | Purpose |
|-----|---------|
| `RIDB_API_KEY` | Free federal RIDB API (preferred when present) |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Future maps / real drive times |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL (production: https://immerse.unitedundergod.org) |

## Roadmap

- [x] Live federal search without requiring a key (Recreation.gov)
- [x] Site detail for live federal IDs
- [x] Adventure YouTube posts + park partner interest
- [x] Privacy / Terms / honest private-stay framing
- [x] Research map + deep-link directions (Google / Apple / Waze)
- [ ] Drive-time from user location (needs Mapbox or similar matrix API)
- [ ] Full pass / parking enrichment beyond facility defaults
- [ ] Live private hosts + payments only after fulfillment proven
- [ ] Paid park marketing campaigns (after partner agreements)

---

*Get immersed.*
