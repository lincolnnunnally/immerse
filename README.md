# Immerse

**The easy way to find and plan nature immersion camping trips.**

Unified search for federal, state, private, and dispersed sites — with the information that actually matters:

- Drive time from your location
- Hike-in distance & elevation
- Passes required (America the Beautiful, park-specific, none)
- Parking fees / day-use rules
- Reservation status & windows
- Must-see highlights nearby
- Simple day-by-day itinerary

Built to remove the friction that stops people from getting into nature.

## Why Immerse exists

Existing tools (Recreation.gov, ReserveAmerica, state apps, Forest Service sites) are fragmented, confusing, and leave you guessing about the practical details. Immerse solves that by putting clarity first.

## Current Status (MVP)

- Search focused on Southeast / Georgia (Chattahoochee-Oconee National Forest + nearby) to start
- Clear info cards for every site
- Basic itinerary builder
- Ready for RIDB (federal) data integration
- Map-ready architecture

## Tech Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui patterns
- Mapbox GL (or Leaflet fallback)
- RIDB API + Recreation.gov public availability endpoints
- Vercel deployment ready

## Getting Started

```bash
git clone https://github.com/lincolnnunnally/immerse.git
cd immerse
npm install
cp .env.example .env.local
# Add your RIDB API key and Mapbox token
npm run dev
```

### Required API Keys

1. **RIDB API Key** (free): https://ridb.recreation.gov → sign up → generate key
2. **Mapbox Access Token** (free tier): https://account.mapbox.com

## Roadmap

- [x] Project scaffold & vision
- [ ] Live RIDB search + availability
- [ ] Full pass / parking / hike-in enrichment
- [ ] AI itinerary generation
- [ ] Cancellation alerts
- [ ] PWA / offline support
- [ ] Broader national coverage

## Contributing

This is being built to solve a real personal pain point. Feedback and ideas welcome.

---

*Get immersed.*
