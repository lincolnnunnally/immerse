export type SiteType =
  | "developed"
  | "dispersed"
  | "private"
  | "state"
  | "wma"
  | "ohv"
  /** A park / canyon / waterfall area you go TO — day use, no camping on the spot */
  | "destination";

export type LandManager =
  | "USFS"
  | "NPS"
  | "BLM"
  | "USACE"
  | "FWS"
  | "State Parks"
  | "State DNR / WMA"
  | "Private"
  | "Other";

/** Structured status — no comment-wall required */
export type SiteStatus = "open" | "seasonal" | "closed" | "unknown";

/** Who / what can realistically reach the site */
export type AccessLevel =
  | "any_vehicle"
  | "high_clearance"
  | "4x4"
  | "hike_in"
  | "ohv_only";

export type RoadQuality = "paved" | "gravel" | "rough" | "technical" | "unknown";

export type CrowdLevel = "quiet" | "moderate" | "busy" | "unknown";

export interface CommunityPulse {
  /** One-line summary — never a wall of comments */
  summary: string;
  crowd?: CrowdLevel;
  roadNote?: string;
  lastVerified?: string; // ISO date or human "2026-06"
  source?: "curated" | "community" | "official";
}

/** Private host listings — nature-first, anti-commercialization */
export interface PrivateHostInfo {
  hostName?: string;
  maxSites: number; // hard cap to prevent campground conversion
  naturePledge: boolean; // host agrees to keep it natural
  amenitiesAllowed: string[]; // limited set only
  contactNote?: string;
  nightlyRate?: string;
  /** Explicit rules that keep it from becoming a commercial campground */
  immersionRules: string[];
}

export interface CampSite {
  id: string;
  name: string;
  type: SiteType;
  agency?: string;
  landManager?: LandManager;
  lat: number;
  lng: number;
  elevation?: number;
  driveTimeMinutes?: number; // from reference point (metro Atlanta / Conyers)
  hikeInMiles?: number;
  hikeInElevationGain?: number;
  reservationRequired: boolean;
  reservationUrl?: string;
  bookingWindow?: string;
  passRequired: string;
  parkingFee?: string;
  campingFee?: string;
  maxStayDays?: number;
  amenities: string[];
  mustSees: string[];
  description: string;
  notes?: string;
  imageUrl?: string;
  activities?: string[];
  ohvFriendly?: boolean;
  dataSource?: "ridb" | "curated" | "community" | "state" | "private_host";

  // ── Clarity fields (anti-guessing) ───────────────────────────────────
  status?: SiteStatus;
  access?: AccessLevel;
  roadQuality?: RoadQuality;
  pulse?: CommunityPulse;

  // ── Private nature stays ─────────────────────────────────────────────
  privateHost?: PrivateHostInfo;

  // ── Trip-planning enrichment ─────────────────────────────────────────
  /** Two-letter state this site is in (curated + live) */
  state?: string;
  /** Official info page (park site) when different from the reservation page */
  officialUrl?: string;
  /** Phone for the office / ranger station */
  phone?: string;
  /** NPS unit code (e.g. "liri") — enables live park alerts on the site page */
  npsParkCode?: string;
  /** Straight-line miles from the searched place; set per-request by the search API */
  distanceMiles?: number;
  /** Nearby places worth pairing with this site (camp here → go there) */
  nearby?: { name: string; siteId?: string; minutes?: number; note?: string }[];
}

export interface TripItinerary {
  site: CampSite;
  arrivalDate: string;
  nights: number;
  days: ItineraryDay[];
}

export interface ItineraryDay {
  day: number;
  title: string;
  items: string[];
}

/** Hard rules for private listings on Immerse — keep nature, not commerce */
export const PRIVATE_HOST_LIMITS = {
  maxSitesPerProperty: 4,
  bannedAmenities: [
    "RV hookups",
    "electric pedestals",
    "dump station",
    "pool",
    "gift shop",
    "event pavilion",
    "permanent cabins for rent as primary use",
  ],
  requiredPledge:
    "I will keep this land feeling like nature, not a commercial campground. No permanent infrastructure that turns the site into a developed park. Guests leave no trace.",
} as const;
