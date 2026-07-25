/**
 * Trust stack for private nature stays.
 * Goal: host keeps land + home safe; visitor gets privacy, quiet, and what was promised.
 * Not a full insurance product yet — product contract + data model so we can plug carriers later.
 */

export type VerificationLevel =
  | "unverified"
  | "email_phone"
  | "id_verified"
  | "id_plus_address";

export type TrustBadge =
  | "id_verified"
  | "responsive_host"
  | "quiet_stay"
  | "leave_no_trace"
  | "super_guest"
  | "property_care"
  | "accurate_listing";

export interface RatingBreakdown {
  overall: number; // 1–5
  /** Host-rated dimensions about the guest */
  guestRespectLand?: number;
  guestNoise?: number;
  guestCommunication?: number;
  /** Guest-rated dimensions about the host / stay */
  accuracy?: number; // matched photos & description
  privacy?: number;
  quiet?: number;
  safetyFeel?: number;
  hostCommunication?: number;
  cleanlinessCare?: number;
}

export interface PublicReview {
  id: string;
  stayId: string;
  fromRole: "guest" | "host";
  toRole: "guest" | "host";
  rating: RatingBreakdown;
  /** Short structured tags — not a comment wall */
  tags: string[];
  /** Optional short note (max ~280 chars in product rules) */
  note?: string;
  createdAt: string;
  /** Visible only after both sides submit or window closes — reduces revenge reviews */
  published: boolean;
}

export interface StayExpectations {
  /** What quiet means here */
  quietHours: string;
  maxGuests: number;
  maxVehicles: number;
  dogsAllowed: "no" | "yes_approved" | "yes";
  generatorsAllowed: boolean;
  dronesAllowed: boolean;
  musicPolicy: string;
  privacyNote: string;
  /** What the host commits the site will feel like */
  experiencePromise: string[];
  /** What the guest commits to */
  guestCommitments: string[];
}

export interface ProtectionSummary {
  /** Marketing/product name for the protection layer */
  name: string;
  hostCoverage: string[];
  guestCoverage: string[];
  /** Security deposit or hold description */
  depositNote: string;
  /** What is NOT covered — honesty reduces disputes */
  exclusions: string[];
  /** Status until a real carrier is integrated */
  status: "planned" | "pilot" | "active";
}

/** Default expectations every private nature stay inherits unless host tightens them */
export const DEFAULT_NATURE_EXPECTATIONS: StayExpectations = {
  quietHours: "10:00 PM – 7:00 AM (voices low, no amplified sound)",
  maxGuests: 4,
  maxVehicles: 2,
  dogsAllowed: "yes_approved",
  generatorsAllowed: false,
  dronesAllowed: false,
  musicPolicy: "No amplified music. Acoustic only if neighbors (and host) cannot hear it.",
  privacyNote:
    "Sites are spaced for solitude. Host will not enter the site area during your stay except for emergency or agreed check-in.",
  experiencePromise: [
    "Listing photos and description match the actual site",
    "Quiet, nature-first feel — not a party or commercial campground",
    "Clear access instructions before arrival",
    "Host reachable for genuine issues",
  ],
  guestCommitments: [
    "Leave No Trace — pack out all trash",
    "Stay only in the designated site area",
    "Respect quiet hours and neighbors",
    "No fires outside the provided ring / local burn bans",
    "Report damage or problems promptly",
  ],
};

/** Protection product framing — integrate a real carrier before marking active */
export const IMMERSE_PROTECTION: ProtectionSummary = {
  name: "Immerse Care",
  status: "planned",
  hostCoverage: [
    "Damage to listed structures, gates, fencing, and site fixtures during a booked stay (subject to policy limits)",
    "Extra cleaning when a guest leaves the site outside Leave No Trace standards",
    "Support path for unresolved guest issues after the stay",
  ],
  guestCoverage: [
    "Stay does not materially match the listing (accuracy claim path)",
    "Host cancellation after booking (rebooking / refund path)",
    "Safety issue that makes the site unusable on arrival",
  ],
  depositNote:
    "A refundable security hold may be placed before arrival and released after the host confirms the site is in good condition (typically within a few days of checkout).",
  exclusions: [
    "Normal wear of natural ground, weather, or wildlife",
    "Damage from ignoring posted rules or local burn bans",
    "Items never listed or photographed as part of the stay",
    "Disputes without photos / messages in the Immerse stay record",
  ],
};

export function verificationLabel(level: VerificationLevel): string {
  switch (level) {
    case "id_plus_address":
      return "ID + address verified";
    case "id_verified":
      return "ID verified";
    case "email_phone":
      return "Email & phone verified";
    default:
      return "Not yet verified";
  }
}

export function badgeLabel(badge: TrustBadge): string {
  switch (badge) {
    case "id_verified":
      return "ID verified";
    case "responsive_host":
      return "Responsive host";
    case "quiet_stay":
      return "Quiet stay";
    case "leave_no_trace":
      return "Leave No Trace";
    case "super_guest":
      return "Trusted guest";
    case "property_care":
      return "Cares for property";
    case "accurate_listing":
      return "Accurate listing";
  }
}

/** Mutual review: neither side sees the other's review until both submit or window ends */
export const REVIEW_WINDOW_DAYS = 14;

export const RATING_DIMENSIONS_GUEST_ABOUT_HOST = [
  { key: "accuracy", label: "Matched the listing" },
  { key: "privacy", label: "Privacy" },
  { key: "quiet", label: "Quiet / nature feel" },
  { key: "safetyFeel", label: "Felt safe" },
  { key: "hostCommunication", label: "Host communication" },
] as const;

export const RATING_DIMENSIONS_HOST_ABOUT_GUEST = [
  { key: "guestRespectLand", label: "Respected the land" },
  { key: "guestNoise", label: "Respected quiet" },
  { key: "guestCommunication", label: "Communication" },
  { key: "cleanlinessCare", label: "Left site in good condition" },
] as const;
