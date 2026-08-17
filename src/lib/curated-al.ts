import type { CampSite, Jurisdiction, LandRule, VerifyContact } from "./types";

/**
 * Little River Canyon is the case that taught us not to state land rules as flat fact.
 *
 * Four official sources answer "can I camp here?" and they do not read the same way:
 *   • The park's camping page (2021)  — "Camping is currently not permitted."
 *   • Laws & Policies (Dec 2025)      — "Camping is not permitted."
 *   • The Superintendent's Compendium (signed 05/27/2026, the NEWEST and legally
 *     authoritative document) — literally reads "Camping is not prohibited within the
 *     Little River Canyon National Preserve", with the justification "To protect the
 *     visitors and the resources within the preserve." That sentence contradicts its own
 *     justification and is almost certainly a dropped-word drafting error.
 *   • The nps.gov interactive map appears to show camping symbols, and the static map
 *     hosted there is an Alabama DCNR hunting map whose generic legend includes
 *     "CAMP OR LODGE" — its only camp symbol sits on DeSoto State Park, outside the preserve.
 *
 * The preserve is ALSO Little River Wildlife Management Area, co-managed with Alabama DCNR
 * for hunting — so two rule-sets really do cover this ground. They happen to agree: federal
 * law bars camping outside designated sites (36 CFR 2.10(b)(10)) and none are designated,
 * while Alabama's WMA rule bars camping "except in designated sites" and this WMA designates
 * none. NOTE: an earlier revision of this file claimed the WMA (13,100 ac) exceeds federal
 * ownership (11,042 ac) and therefore spans non-federal land. That did not survive review —
 * neither figure could be verified from a live official source (the state WMA page 404s and
 * the NPS statistics page is offline), and the compendium describes the WMA as "that portion
 * of the preserve", i.e. a SUBSET. Multiple owners are real (four cooperator logos, a plotted
 * private-land category); the geometry is unresolved and is no longer asserted.
 *
 * So the answer is "no camping" — but we show the reader every source and its date rather
 * than asserting it, because the newest federal document can be read the other way.
 * Verified 2026-08-17 by fetching raw page HTML (not summaries — a one-word inversion is
 * exactly what a summariser gets wrong).
 */

const LIRI_JURISDICTIONS: Jurisdiction[] = [
  {
    name: "National Park Service — Little River Canyon National Preserve",
    role: "Owns and regulates the federal land (11,042 of the 15,288 authorized acres)",
    url: "https://www.nps.gov/liri/index.htm",
  },
  {
    name: "Alabama DCNR — Wildlife & Freshwater Fisheries",
    role: "Sets the hunting rules on Little River WMA — which the compendium describes as “that portion of the preserve identified by the State of Alabama as the Little River Canyon Wildlife Management Area”. Hunting only; it grants nothing about camping.",
    url: "https://www.nps.gov/liri/planyourvisit/hunting.htm",
  },
  {
    name: "Forever Wild Land Trust / Alabama State Parks",
    role: "Named as cooperators on the WMA permit, and the maps plot a separate private-land category — so more than one owner is involved. The exact geometry is unresolved: we could not verify published acreage from an official source.",
  },
];

const LIRI_VERIFY: VerifyContact[] = [
  {
    label: "Preserve headquarters (the authority on what's allowed)",
    phone: "256-845-9605",
    url: "https://www.nps.gov/liri/learn/management/compedium.htm",
    note: "— ask specifically about camping; the compendium wording is ambiguous",
  },
  {
    label: "Current closures & conditions",
    url: "https://www.nps.gov/liri/planyourvisit/conditions.htm",
  },
  {
    label: "Alabama WMA hunting rules (state side)",
    url: "https://www.outdooralabama.com/wildlife-management-areas",
  },
];

const LIRI_RULES: LandRule[] = [
  {
    activity: "Camping",
    status: "prohibited",
    authority: "National Park Service — 36 CFR 2.10",
    detail:
      "Federal law is the backstop that settles this regardless of how the park's own wording reads: 36 CFR 2.10(a) lets a superintendent designate camping sites, and 2.10(b)(10) prohibits “camping outside of designated sites or areas.” Little River Canyon has designated no sites and operates no campground, so camping is prohibited by regulation.",
    sourceUrl:
      "https://www.ecfr.gov/api/versioner/v1/full/2026-08-13/title-36.xml?part=2&section=2.10",
    sourceKind: "Federal regulation — official eCFR current text",
    sourceDate: "eCFR issue date 2026-08-13",
    confidence: "verified",
  },
  {
    activity: "Camping",
    status: "prohibited",
    authority: "National Park Service — Superintendent's Compendium",
    detail:
      "The decisive current restriction is the night closure, not the camping paragraph: the compendium closes the preserve's non-gated parking lots, overlooks and backcountry roads during hours of darkness (30 min before sunrise to 30 min after sunset), with exceptions ONLY for licensed night hunting of raccoon, opossum and fox, and for fishing. There is no overnight-stay exception, which forecloses camping.",
    sourceUrl: "https://www.nps.gov/liri/learn/management/compedium.htm",
    sourceKind: "Superintendent's Compendium (signed 05/27/2026)",
    sourceDate: "July 7, 2026",
    confidence: "verified",
    caveat:
      "Heads up: this same document's § 2.10 paragraph literally reads “Camping is not prohibited within the Little River Canyon National Preserve” — while giving the justification “To protect the visitors and the resources within the preserve.” That is internally contradictory and reads like a dropped “not”. Do not treat it as permission; the night closure and 36 CFR 2.10 both point the other way. If you want to camp here, this is the ambiguity to raise on the phone.",
  },
  {
    activity: "Camping",
    status: "prohibited",
    authority: "National Park Service — park camping page",
    detail:
      "The park states plainly: “Camping is currently not permitted at Little River Canyon National Preserve.” It points to DeSoto State Park (NPS says 7 miles north on this page and 10 on another — call it roughly 7 to 10 miles, tent/RV/backcountry sites) and privately run campgrounds around Fort Payne instead.",
    sourceUrl:
      "https://www.nps.gov/liri/planyourvisit/camping-at-little-river-canyon-national-preserve.htm",
    sourceKind: "Park web page",
    sourceDate: "March 23, 2021",
    confidence: "verified",
    caveat: "Five years old — corroborated here by the 2026 compendium rather than relied on alone.",
  },
  {
    activity: "Camping",
    status: "prohibited",
    authority: "Alabama DCNR — WMA Regulation 220-2-.55(1)(m)",
    detail:
      "The state side reaches the same answer independently. Alabama makes it unlawful “to camp on any AREA except in designated sites,” capped at 9 days in any 30-day period. The official 2026–2027 Little River WMA permit designates no campsites and its map legend carries no campground or campsite symbol — so the WMA overlay creates no camping right either, on federal or non-federal parts of the WMA.",
    sourceUrl:
      "https://www.outdooralabama.com/sites/default/files/WMAs/Rules-Regulations/Alabama%20Wildlife%20Management%20Areas%20Regulation%20220-2-.55.pdf",
    sourceKind: "State regulation (Ala. Admin. Code 220-2-.55)",
    confidence: "verified",
    caveat: "The official PDF prints no revision date, so the in-force version could not be confirmed.",
  },
  {
    activity: "Camping",
    status: "prohibited",
    authority: "National Park Service — Permits & Reservations",
    detail:
      "This closes the obvious loophole — “can I just get a permit?” No. The park's permits page, the freshest document in the whole record, lists every permit it issues: Special Use, Filming, and Commercial Use Authorization. There is no camping permit, no backcountry permit and no overnight permit, and the page never mentions camping.",
    sourceUrl: "https://www.nps.gov/liri/planyourvisit/permitsandreservations.htm",
    sourceKind: "Park web page",
    sourceDate: "July 9, 2026",
    confidence: "verified",
  },
  {
    activity: "Why the nps.gov map looks like camping is allowed",
    status: "unclear",
    authority: "nps.gov Maps page (map authored by Alabama DCNR, not NPS)",
    detail:
      "Worth knowing before you trust the map: nps.gov publishes no NPS park map here at all — it hosts a state-authored hunting basemap, headed “Little River Canyon National Preserve Wildlife Management Area Map” and credited to the Alabama Department of Conservation and Natural Resources. That is also why the park reads as a WMA. Its legend does carry a “CAMP OR LODGE” symbol, but the one legible camp triangle sits beside the “DESOTO STATE PARK RESORT” label — measured entirely outside the shaded WMA area — so it marks DeSoto's camping, under Alabama State Parks, not a campsite in the preserve. The legend also lists “PRIMITIVE ROAD”, which is easy to read as “primitive camping”. The state's own 2020-2021 edition of this map already had no camping symbol, and neither does the current 2026-27 one, so the version nps.gov serves is at least two editions stale.",
    sourceUrl: "https://www.nps.gov/liri/planyourvisit/maps.htm",
    sourceKind: "Official park web page hosting a state map",
    sourceDate: "Page last updated November 29, 2020",
    confidence: "verified",
    caveat:
      "A map symbol is the weakest authority here — only the superintendent can designate a campsite, and that happens in the compendium, not on a basemap legend.",
  },
  {
    activity: "Backcountry / primitive campsites (Slant Rock, Billy's Ford, Hartline Ford)",
    status: "closed_temporarily",
    authority: "National Park Service — park FAQ",
    detail:
      "These three primitive sites did once exist in the backcountry and are the likely reason older maps and guides still show camping here. NPS closed all of them: “Little River Canyon National Preserve has closed all backcountry campsites for health and safety reasons… the pit toilets at the sites are unserviceable… We do not have a date for opening new campsites at this time.” Separately, Slant Rock Road is currently closed to vehicles (hike or bike in).",
    sourceUrl: "https://www.nps.gov/liri/faqs.htm",
    sourceKind: "Park FAQ + conditions page",
    sourceDate: "FAQ March 26, 2021; conditions May 28, 2026",
    confidence: "verified",
  },
  {
    activity: "Hunting (why this land is also a WMA)",
    status: "conditional",
    authority: "Alabama DCNR — Wildlife & Freshwater Fisheries",
    detail:
      "This is what the WMA designation is actually for. NPS manages the preserve's Backcountry Area as Little River Wildlife Management Area in cooperation with Alabama DCNR, Alabama State Parks and the Forever Wild Land Trust; the state sets the hunting rules and requires deer and turkey harvests to be reported within 48 hours. The WMA is a hunting-management overlay — not a separate campable parcel.",
    conditions:
      "Alabama hunting licence + WMA licence, plus the free area permit and a daily permit (or the Outdoor Alabama WMA check-in app). Hunter education required if born on or after 1977-08-01.",
    sourceUrl: "https://www.nps.gov/liri/planyourvisit/hunting.htm",
    sourceKind: "Park web page",
    sourceDate: "May 28, 2026",
    confidence: "verified",
    caveat: "Licence fees change yearly and the official fee sheet is stale — confirm the price at purchase.",
  },
  {
    activity: "Campfires",
    status: "conditional",
    authority: "National Park Service — Superintendent's Compendium",
    detail:
      "Fires are restricted to designated picnic-area fire rings and standing grills, using appropriate fuel. Fallen dead wood on the ground may be collected for those rings only; standing dead trees may not be cut, as they are habitat.",
    conditions: "Designated fire rings / standing grills in picnic areas only",
    sourceUrl: "https://www.nps.gov/liri/learn/management/compedium.htm",
    sourceKind: "Superintendent's Compendium",
    sourceDate: "July 7, 2026",
    confidence: "verified",
  },
  {
    activity: "Swimming",
    status: "allowed",
    authority: "National Park Service",
    detail:
      "Swimming and wading are a normal use here — Blue Hole, Little Falls and the pools below Little River Falls are the classic spots. You must stay 50 feet back from the brink of Little River Falls; that one is enforced, and people have died on the wet rock.",
    sourceUrl: "https://www.nps.gov/liri/planyourvisit/waterfalls.htm",
    sourceKind: "Park web page",
    confidence: "verified",
  },
  {
    activity: "Drones",
    status: "prohibited",
    authority: "National Park Service — Superintendent's Compendium",
    detail:
      "Launching, landing or operating unmanned aircraft anywhere in the preserve is prohibited without written approval from the superintendent.",
    sourceUrl: "https://www.nps.gov/liri/learn/management/compedium.htm",
    sourceKind: "Superintendent's Compendium",
    sourceDate: "July 7, 2026",
    confidence: "verified",
  },
  {
    activity: "OHVs / ATVs",
    status: "prohibited",
    authority: "National Park Service",
    detail:
      "Off-highway vehicles — ATVs, UTVs and non-street-legal dirt bikes — are not allowed on any road in the preserve, including the 23 miles of backcountry WMA roads. Those roads are open to street-licensed 4WD vehicles, horses, bicycles and hikers, at an 11 mph limit.",
    sourceUrl: "https://www.nps.gov/liri/planyourvisit/wildlife-management-area.htm",
    sourceKind: "Park web page + compendium",
    sourceDate: "July 29, 2022",
    confidence: "verified",
  },
];

const LIRI_RULES_SUMMARY =
  "You cannot camp inside the preserve — but the official sources genuinely disagree, so here is all of it. Three NPS pages say camping is not permitted, and no campsites are designated, which is what makes it prohibited under 36 CFR 2.10. The catch: the newest and most authoritative document, the 2026 Superintendent's Compendium, literally reads “Camping is not prohibited” — with a justification that only makes sense for a prohibition. Its night closure of every lot and backcountry road settles it in practice. The preserve is also Little River Wildlife Management Area — a hunting overlay, not a camping permission — and Alabama's WMA rule independently bars camping except in designated sites, of which this WMA has none. Camp at DeSoto State Park, 15 minutes north, and drive in.";

/**
 * Northeast Alabama — Little River Canyon / Lookout Mountain.
 * Every fact below was verified against the official source cited in each entry's
 * `notes` on 2026-08-16/17 (nps.gov/liri, developer.nps.gov, alapark.com,
 * cherokeerockvillage.com). Coordinates come from USGS GNIS, the US Census
 * geocoder on the official street address, OpenStreetMap, or the managing org.
 *
 * The one thing you must know about this area: the National Preserve itself has
 * NO camping (day use only; the three backcountry sites are closed indefinitely).
 * You sleep at DeSoto State Park, Cherokee Rock Village, or Buck's Pocket and
 * drive into the canyon.
 */

const LRC_NEARBY: NonNullable<CampSite["nearby"]> = [
  {
    name: "DeSoto State Park — Improved Campground (94 hookup sites, tents welcome)",
    siteId: "al-desoto-state-park",
    minutes: 15,
    note: "Closest real camping. Reserve at reserve.alapark.com/desoto or call 256-845-5075. Check-in 2 PM.",
  },
  {
    name: "DeSoto State Park — Primitive Campground (18 walk-in tent sites)",
    siteId: "al-desoto-primitive",
    minutes: 15,
    note: "Quieter and wooded — fire rings, vault toilet, central water. Gate key at check-in.",
  },
  {
    name: "Cherokee Rock Village (Cherokee County / SCC, Leesburg)",
    siteId: "al-cherokee-rock-village",
    minutes: 40,
    note: "Has a first-come, first-served tent section at $19/night — no reservation needed if you're deciding late.",
  },
  {
    name: "Buck's Pocket State Park (Grove Oak) — 256-622-8400",
    minutes: 45,
    note: "23 RV sites + 11 primitive tent sites. Reserve at reserve.alapark.com/bucks-pocket. Verified alapark.com 2026-08-17.",
  },
];

export const alabamaSites: CampSite[] = [
  // ── The destination itself ─────────────────────────────────────────────
  {
    id: "al-little-river-canyon",
    name: "Little River Canyon National Preserve",
    type: "destination",
    agency: "National Park Service — Little River Canyon National Preserve",
    landManager: "NPS",
    state: "AL",
    npsParkCode: "liri",
    lat: 34.3951,
    lng: -85.6269,
    elevation: 1200,
    driveTimeMinutes: 173,
    hikeInMiles: 0,
    reservationRequired: false,
    reservationUrl: "https://www.nps.gov/liri/planyourvisit/hours.htm",
    officialUrl: "https://www.nps.gov/liri/index.htm",
    phone: "256-845-9605",
    passRequired:
      "None for the preserve, Little River Falls, the Canyon Center or the Rim Parkway. $15/vehicle/day only at Canyon Mouth Park (America the Beautiful accepted).",
    parkingFee: "Free — Little River Falls lot holds 100 cars with RV/bus spaces",
    campingFee:
      "NO camping anywhere in the preserve — day use only. Nearest camping: DeSoto State Park, 15 min north.",
    amenities: [
      "Restrooms at Little River Falls, Eberhart Point and Canyon Mouth Park",
      "Picnic tables & grills at the Falls, Blue Hole and Canyon Mouth",
      "ADA boardwalk to the Little River Falls overlook",
      "Canyon Center (JSU): WiFi, water bottle filling, film, gift shop — CLOSED MONDAYS",
      "26+ miles of trails",
      "Swim holes: Blue Hole, Little Falls, below Little River Falls, Eberhart",
      "No food or vendors inside the preserve — Fort Payne is ~10 mi west",
    ],
    mustSees: [
      "Little River Falls (45 ft) — boardwalk from the free lot west of the AL-35 bridge",
      "Little Falls / Martha's Falls swim hole — 0.75 mi trail, 137 stone steps down",
      "Blue Hole — calm, kid-friendly swim ¼ mi east of the Falls on AL-35",
      "Canyon Rim Parkway (AL-176): Lynn, Hawks Glide, Canyon View, Wolf Creek, Crow Point, Eberhart",
      "Mushroom Rock",
      "Grace's High Falls (133 ft, tallest in Alabama) — rain-fed, usually dry in August",
      "Eberhart Trail — 0.75 mi steep down to the river swim hole and old chairlift ruins",
    ],
    activities: [
      "Hiking",
      "Swimming",
      "Waterfall viewing",
      "Scenic drive",
      "Rock climbing",
      "Kayaking (expert only)",
      "Fishing",
      "Wildlife viewing",
    ],
    description:
      "A 15,000-acre sandstone canyon on Lookout Mountain about 10 miles east of Fort Payne: Little River Falls, a 23-mile rim parkway with eight overlooks, canyon swim holes, and a 4WD backcountry. Open sunrise to sunset with no entrance fee (except Canyon Mouth Park). There is no camping in the preserve — sleep at DeSoto State Park next door and drive in each morning.",
    notes:
      "Rules: no alcohol, no glass, no drones without a permit, dogs on a 6-ft leash, and stay 50 ft back from the falls edge (that one is law). The Falls lot fills by 11 AM on summer weekends. The Canyon Center and its overflow lot are closed Mondays — buy passes at the Rim of the Canyon Cafe across the street. Current closure: Slant Rock Road, no vehicle access (hike or bike in). Poor cell reception in the canyon; be out before dark; flash-flood risk after heavy rain. Verified against nps.gov/liri hours, fees, conditions and FAQ pages 2026-08-16.",
    imageUrl:
      "https://www.nps.gov/common/uploads/structured_data/3C870F95-1DD8-B71B-0B1A89976F5B3292.jpg",
    rulesSummary: LIRI_RULES_SUMMARY,
    landRules: LIRI_RULES,
    jurisdictions: LIRI_JURISDICTIONS,
    verifyWith: LIRI_VERIFY,
    dataSource: "curated",
    status: "open",
    access: "any_vehicle",
    roadQuality: "paved",
    pulse: {
      summary:
        "Weekdays are calm; summer weekends fill the Falls lot by 11 AM. South of Eberhart Point the rim road (CR-275 to Canyon Mouth) is steep and winding — no trailers or RVs.",
      crowd: "moderate",
      roadNote: "Paved rim drive; backcountry roads need 4WD",
      lastVerified: "2026-08",
      source: "official",
    },
    nearby: LRC_NEARBY,
  },
  {
    id: "al-little-river-falls",
    name: "Little River Falls & Blue Hole (free day use)",
    type: "destination",
    agency: "National Park Service — Little River Canyon National Preserve",
    landManager: "NPS",
    state: "AL",
    npsParkCode: "liri",
    lat: 34.3951,
    lng: -85.62691,
    driveTimeMinutes: 172,
    hikeInMiles: 0.1,
    reservationRequired: false,
    reservationUrl: "https://www.nps.gov/liri/planyourvisit/little-river-falls.htm",
    officialUrl: "https://www.nps.gov/liri/planyourvisit/waterfalls.htm",
    phone: "256-845-9605",
    passRequired: "None",
    parkingFee: "Free — 100-car lot on the west side of the AL-35 bridge, restrooms mid-lot",
    campingFee: "No camping and no overnight parking; the area closes after dark.",
    amenities: [
      "Free parking (RV/bus spaces)",
      "Restrooms",
      "Picnic tables & grills",
      "ADA boardwalk — step-free route plus a shorter rock-step route",
      "Swim hole below the falls at low water",
      "Bridge Trail, 0.75 mi to the Canyon Center",
    ],
    mustSees: [
      "Boardwalk view of the 45-ft falls",
      "Little Falls / Martha's Falls swim — 0.75 mi, 137 stone steps",
      "Blue Hole — ¼ mi east on AL-35, very small lot",
      "The AL-35 bridge overlooks",
    ],
    activities: ["Waterfall viewing", "Swimming", "Hiking", "Picnicking"],
    description:
      "The 45-foot waterfall where the canyon begins, right at the AL-35 bridge — the easiest big payoff in the preserve. Free lot, restrooms, and an ADA boardwalk to the overlook. By late summer the flow drops and the ledges above and below the falls turn into wading and swimming pools; the Little Falls Trail drops 137 stone steps to a river-wide sandstone shelf that is the local favorite swim spot.",
    notes:
      "The lot is often full by 11 AM on late-spring and summer weekends and staff close it; the Canyon Center overflow lot is closed Mondays. Rocks are slippery and people have died here — stay 50 ft from the falls edge. Coordinates from USGS GNIS feature 150711. Verified nps.gov/liri 2026-08-16.",
    rulesSummary: LIRI_RULES_SUMMARY,
    landRules: LIRI_RULES,
    jurisdictions: LIRI_JURISDICTIONS,
    verifyWith: LIRI_VERIFY,
    imageUrl:
      "https://www.nps.gov/common/uploads/structured_data/8C825EA4-0C4E-1B2F-69AC99C5CBFF3679.jpg",
    dataSource: "curated",
    status: "open",
    access: "any_vehicle",
    roadQuality: "paved",
    nearby: LRC_NEARBY,
  },
  {
    id: "al-canyon-mouth-park",
    name: "Canyon Mouth Park ($15/vehicle day use)",
    type: "destination",
    agency: "National Park Service — Little River Canyon National Preserve",
    landManager: "NPS",
    state: "AL",
    npsParkCode: "liri",
    lat: 34.2887,
    lng: -85.6833,
    driveTimeMinutes: 177,
    hikeInMiles: 0,
    reservationRequired: false,
    reservationUrl: "https://www.nps.gov/liri/planyourvisit/canyon-mouth-park.htm",
    officialUrl: "https://www.nps.gov/liri/planyourvisit/fees.htm",
    phone: "256-779-3199",
    passRequired:
      "$15 per vehicle per day, or $35 annual. Fee machine takes cash or card — no bills over $20, exact change, no change given. America the Beautiful passes accepted.",
    parkingFee: "Included in the $15 entrance",
    campingFee:
      "No camping. Gates close promptly (summer 8 AM–7 PM Central) — vehicles left inside get ticketed or locked in.",
    amenities: [
      "Paved parking",
      "Restrooms",
      "Pavilion",
      "Shaded picnic tables & grills",
      "Playground",
      "Soccer field",
      "Easy river access / swimming",
      "Kayak take-out",
      "1-mile easy river trail to Johnnie's Creek",
    ],
    mustSees: ["Canyon Mouth Trail along the Little River", "Wading and swimming at the river"],
    activities: ["Swimming", "Picnicking", "Hiking", "Kayaking"],
    description:
      "The shady family end of the canyon, at its southern mouth near Cedar Bluff in Cherokee County — and the only fee area in the preserve. Easy river access, lots of shade, grills, and a flat one-mile trail along the water. Reach it from AL-273 onto Cherokee CR-275, or down 11 steep, winding miles from Eberhart Point (no trailers or RVs).",
    notes:
      "Summer hours 8 AM–7 PM Central. Many phone map apps call it “Canyon Mouth Picnic Area”. Bring cash as a backup for the fee machine. Coordinates from OpenStreetMap. Verified nps.gov hours/fees pages (updated May 2026).",
    rulesSummary: LIRI_RULES_SUMMARY,
    landRules: LIRI_RULES,
    jurisdictions: LIRI_JURISDICTIONS,
    verifyWith: LIRI_VERIFY,
    imageUrl:
      "https://www.nps.gov/common/uploads/structured_data/8C58A4FA-05FF-876E-05DD3F27CD0A3CB3.jpg",
    dataSource: "curated",
    status: "open",
    access: "any_vehicle",
    roadQuality: "paved",
    nearby: LRC_NEARBY,
  },
  {
    id: "al-desoto-falls",
    name: "DeSoto Falls (day use)",
    type: "destination",
    agency: "Alabama State Parks — DeSoto State Park",
    landManager: "State Parks",
    state: "AL",
    lat: 34.5488,
    lng: -85.5907,
    driveTimeMinutes: 190,
    hikeInMiles: 0.2,
    reservationRequired: false,
    reservationUrl: "https://www.alapark.com/parks/desoto-state-park",
    officialUrl: "https://www.alapark.com/parks/desoto-state-park",
    phone: "256-845-5380",
    passRequired: "None stated for the falls day-use area — confirm with the park office",
    parkingFee: "Day-use lot at the falls overlook",
    campingFee: "No camping at the falls — camp in DeSoto State Park a few minutes south.",
    amenities: ["Parking", "Overlook platforms", "Short walk to the upper falls and dam"],
    mustSees: ["The ~100-ft falls plunging into the gorge", "Upper falls / old dam area"],
    activities: ["Waterfall viewing", "Photography", "Short hike"],
    description:
      "A tall waterfall on the West Fork of the Little River in its own day-use area a few miles north of DeSoto State Park's campground — one of the most photographed falls in Alabama. Short walk from the lot to the overlooks. Flow depends on recent rain, so late summer can be thin.",
    notes:
      "Separate from the state park campground; larger vehicles should avoid CR-613 per the park. Coordinates from OpenStreetMap (waterway/waterfall feature). Flow is rain-dependent — after a dry stretch expect a modest stream. Verified alapark.com 2026-08-17.",
    dataSource: "curated",
    status: "open",
    access: "any_vehicle",
    roadQuality: "paved",
    nearby: [
      { name: "DeSoto State Park — Improved Campground", siteId: "al-desoto-state-park", minutes: 10 },
      { name: "DeSoto State Park — Primitive Campground", siteId: "al-desoto-primitive", minutes: 10 },
      { name: "Little River Canyon National Preserve", siteId: "al-little-river-canyon", minutes: 25 },
    ],
  },

  // ── Where you actually sleep ───────────────────────────────────────────
  {
    id: "al-desoto-state-park",
    name: "DeSoto State Park — Improved Campground",
    type: "state",
    agency: "Alabama State Parks — DeSoto State Park",
    landManager: "State Parks",
    state: "AL",
    lat: 34.5002,
    lng: -85.6181,
    elevation: 1700,
    driveTimeMinutes: 184,
    hikeInMiles: 0,
    reservationRequired: true,
    reservationUrl: "https://reserve.alapark.com/desoto",
    officialUrl: "https://www.alapark.com/parks/desoto-state-park/improved-campground",
    phone: "256-845-5075",
    bookingWindow:
      "Online or by phone; same-day is possible by phone if sites remain. Two-night minimum on weekends.",
    passRequired: "None to camp. America the Beautiful does not apply — this is a state park.",
    parkingFee: "Included with your campsite",
    campingFee:
      "Rates vary by season and are not published online — call 256-845-5075. Plus a one-time $5.25 reservation fee and a 4.25% resort fee per night, paid in full at booking.",
    maxStayDays: 14,
    amenities: [
      "94 full-hookup sites (50/30 amp) — tents welcome, 2 tents or 1 RV + 1 tent per site",
      "Comfort stations with hot showers and laundry",
      "Fire rings, picnic tables, grills",
      "Country store, 9–5",
      "Lodge and restaurant",
      "Swimming pool",
      "35+ miles of trails",
      "Cell service is spotty",
    ],
    mustSees: [
      "Little River Canyon National Preserve — 15 min south",
      "DeSoto Falls — ~100-ft falls in its own day-use area north of the campground",
      "Indian Falls, Lost Falls, Laurel Falls and Azalea Cascade — short trails inside the park",
      "CCC museum and Lodge",
    ],
    activities: ["Camping", "Hiking", "Waterfall viewing", "Swimming (pool)", "Mountain biking", "Fishing"],
    description:
      "The base camp for Little River Canyon: a 3,500-acre state park on Lookout Mountain 8 miles northeast of Fort Payne, 15 minutes from the Canyon Center. Wooded full-hookup sites with real showers and laundry, plus the park's own waterfalls and 35 miles of trail. Book on the Alabama State Parks site — not Recreation.gov — or call the campground desk directly.",
    notes:
      "Check-in 2 PM, check-out 11 AM; cancellations 72 hours before arrival. GPS directions are unreliable here — use the park's written directions to 7104 DeSoto Parkway NE, Fort Payne. Coordinates from the US Census geocoder on that address. Verified alapark.com 2026-08-16; nightly rates are genuinely not published, so call.",
    dataSource: "curated",
    status: "open",
    access: "any_vehicle",
    roadQuality: "paved",
    pulse: {
      summary:
        "Weeknights are usually open; weekends and fall-color season book out. For a same-day site, phone the campground desk rather than trusting the online calendar.",
      crowd: "moderate",
      lastVerified: "2026-08",
      source: "official",
    },
    nearby: [
      {
        name: "Little River Canyon National Preserve",
        siteId: "al-little-river-canyon",
        minutes: 15,
        note: "Little River Falls, Rim Parkway overlooks, canyon swim holes",
      },
      { name: "Little River Falls & Blue Hole", siteId: "al-little-river-falls", minutes: 15 },
      { name: "DeSoto Falls", siteId: "al-desoto-falls", minutes: 10 },
      { name: "Canyon Mouth Park ($15)", siteId: "al-canyon-mouth-park", minutes: 45 },
    ],
  },
  {
    id: "al-desoto-primitive",
    name: "DeSoto State Park — Primitive Campground (walk-in tent)",
    type: "state",
    agency: "Alabama State Parks — DeSoto State Park",
    landManager: "State Parks",
    state: "AL",
    lat: 34.4993,
    lng: -85.6205,
    elevation: 1700,
    driveTimeMinutes: 184,
    hikeInMiles: 0.1,
    reservationRequired: true,
    reservationUrl: "https://reserve.alapark.com/desoto",
    officialUrl: "https://www.alapark.com/parks/desoto-state-park/primitive-campsites",
    phone: "256-845-5075",
    bookingWindow:
      "Reservable, but your specific site is chosen at check-in. The two backpacking shelters are by phone or first-come.",
    passRequired: "None to camp",
    parkingFee: "Included — short walk in from the primitive lot; gate key issued at check-in",
    campingFee:
      "Rates vary by season — call 256-845-5075. Plus the $5.25 reservation fee and 4.25% resort fee per night.",
    maxStayDays: 14,
    amenities: [
      "18 wooded walk-in tent sites",
      "Fire rings",
      "Central vault toilet and water faucet",
      "Picnic shelter",
      "Showers at the Improved Campground, ~1 mi away",
      "Padlocked gate — key at check-in",
    ],
    mustSees: [
      "Little River Canyon National Preserve — 15 min south",
      "Lost Falls and Laurel Falls trails from the park",
      "DeSoto Falls day-use area",
    ],
    activities: ["Tent camping", "Hiking", "Waterfall viewing"],
    description:
      "The quiet way to sleep at DeSoto — 18 walk-in tent sites in the woods with fire rings, a vault toilet and water, no RVs and no hookups. Same 15-minute drive to the canyon, and you can still use the showers at the improved loop. Two backpacking shelters (Never-Never Land, 0.75 mi from the Lost Falls trailhead, and CCC Quarry) if you want a true hike-in night.",
    notes:
      "Check in at the campground/Country Store by 2 PM for your gate key. Two-night minimum on weekends. Coordinates are approximate within the park (the primitive loop sits just west of the improved campground) — follow the park's written directions. Verified alapark.com 2026-08-16.",
    dataSource: "curated",
    status: "open",
    access: "any_vehicle",
    roadQuality: "paved",
    nearby: [
      { name: "Little River Canyon National Preserve", siteId: "al-little-river-canyon", minutes: 15 },
      { name: "Little River Falls & Blue Hole", siteId: "al-little-river-falls", minutes: 15 },
      { name: "DeSoto Falls", siteId: "al-desoto-falls", minutes: 10 },
    ],
  },
  {
    id: "al-cherokee-rock-village",
    name: "Cherokee Rock Village",
    type: "developed",
    agency: "Cherokee County / Southeastern Climbers Coalition — Leesburg, AL",
    landManager: "Other",
    state: "AL",
    lat: 34.1804,
    lng: -85.8268,
    elevation: 1600,
    hikeInMiles: 0,
    reservationRequired: false,
    reservationUrl: "https://www.campspot.com/book/cherokee-rock-village",
    officialUrl: "https://www.cherokeerockvillage.com/",
    phone: "256-523-3799",
    bookingWindow:
      "Brow sites and the RV area need reservations; the tent-only section and middle section are first-come, first-served.",
    passRequired: "Day use is charged per vehicle — confirm current rates on the official site",
    parkingFee: "Day use: about $7 per car (vans/buses more) — confirm on site",
    campingFee: "$19/night for the first-come tent-only section; reserved brow and RV sites vary",
    maxStayDays: 14,
    amenities: [
      "100+ primitive tent sites and 15 primitive RV sites (up to 40 ft)",
      "Full bathhouse — flush toilets and ADA-accessible showers",
      "Fire pit and picnic table at each site",
      "Observation deck, playground, covered pavilion",
      "Open sunrise to sunset for day use; overnight guests stay past dark",
    ],
    mustSees: [
      "The boulder field and sandstone towers on the brow",
      "Sunset over Weiss Lake from the observation deck",
      "Bouldering and top-rope climbing routes",
    ],
    activities: ["Camping", "Rock climbing", "Bouldering", "Hiking", "Photography"],
    description:
      "A boulder field of house-sized sandstone towers on the brow of Lookout Mountain above Weiss Lake, about 40 minutes southwest of Little River Canyon. It is Alabama's best-known climbing area, and the reason it belongs on this list for a late plan: a tent-only section stays first-come, first-served at $19 a night, so you can drive up without a reservation.",
    notes:
      "Address 2000 County Road 70, Leesburg, AL 35983. Coordinates cross-checked between the Southeastern Climbers Coalition (34.1804, -85.8268) and the US Census geocoder on the street address — the access road is rough in spots, so follow the official directions rather than a dropped pin. Verified cherokeerockvillage.com 2026-08-17; rates can change, so confirm before you rely on them.",
    dataSource: "curated",
    status: "open",
    access: "any_vehicle",
    roadQuality: "gravel",
    pulse: {
      summary:
        "Climbers fill the brow sites on weekends; the first-come tent section is the fallback when everything else is booked.",
      crowd: "moderate",
      roadNote: "Last stretch is rough gravel — fine for a car, slow going",
      lastVerified: "2026-08",
      source: "official",
    },
    nearby: [
      { name: "Little River Canyon National Preserve", siteId: "al-little-river-canyon", minutes: 40 },
      { name: "Canyon Mouth Park ($15)", siteId: "al-canyon-mouth-park", minutes: 25 },
    ],
  },
];
