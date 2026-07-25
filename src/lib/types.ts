export type SiteType = "developed" | "dispersed" | "private" | "state" | "wma" | "ohv";

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
