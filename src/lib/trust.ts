/**
 * Trust stack for private nature stays.
 * Goal: host keeps land + home safe; visitor gets privacy, quiet, and what was promised.
 * Some harm (e.g. killing wildlife) cannot be made whole — we prevent, ban, and support reporting.
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
  overall: number;
  guestRespectLand?: number;
  guestNoise?: number;
  guestCommunication?: number;
  accuracy?: number;
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
  tags: string[];
  note?: string;
  createdAt: string;
  published: boolean;
}

export interface StayExpectations {
  quietHours: string;
  maxGuests: number;
  maxVehicles: number;
  dogsAllowed: "no" | "yes_approved" | "yes";
  generatorsAllowed: boolean;
  dronesAllowed: boolean;
  musicPolicy: string;
  privacyNote: string;
  experiencePromise: string[];
  guestCommitments: string[];
  /** Non-negotiable — always required on private stays */
  wildlifeRule: string;
}

export interface ProtectionSummary {
  name: string;
  hostCoverage: string[];
  guestCoverage: string[];
  depositNote: string;
  exclusions: string[];
  /** Explicit: money cannot restore irreversible loss */
  irreversibleHarmNote: string;
  status: "planned" | "pilot" | "active";
}

/** Required wildlife commitment — checkbox on every private booking */
export const WILDLIFE_PROTECTION_RULE =
  "I will not hunt, trap, harm, kill, or harass wildlife (including fish taken outside host-allowed fishing rules) on this property. Wildlife on the host’s land is not mine to take.";

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
  wildlifeRule: WILDLIFE_PROTECTION_RULE,
  experiencePromise: [
    "Listing photos and description match the actual site",
    "Quiet, nature-first feel — not a party or commercial campground",
    "Clear access instructions before arrival",
    "Host reachable for genuine issues",
  ],
  guestCommitments: [
    WILDLIFE_PROTECTION_RULE,
    "Leave No Trace — pack out all trash",
    "Stay only in the designated site area",
    "Respect quiet hours and neighbors",
    "No fires outside the provided ring / local burn bans",
    "Report damage or problems promptly",
  ],
};

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
    "Normal wear of natural ground, weather, or wildlife activity",
    "Damage from ignoring posted rules or local burn bans",
    "Items never listed or photographed as part of the stay",
    "Disputes without photos / messages in the Immerse stay record",
    "Killing, injuring, or cruelty to animals — not a Care payout matter; see Severe Abuse policy",
  ],
  irreversibleHarmNote:
    "Immerse Care does not claim to make anyone whole for irreversible harm — including killed wildlife, destroyed heritage trees, or similar losses. In those cases our role is: immediate account ban for the responsible guest, help preserving evidence, and clear guidance to contact law enforcement and wildlife/conservation officers. Money is not a substitute for what was lost.",
};

/** Severe land / wildlife abuse — not a normal dispute */
export const SEVERE_ABUSE_POLICY = {
  title: "Severe abuse of land or wildlife",
  summary:
    "Trash can be cleaned. Some harm cannot. Killing or cruelly harming animals, wanton destruction of the land, or threats to the host’s safety are treated as severe abuse — not a two-sided review dispute.",
  examples: [
    "Killing, trapping, or cruelly harming wildlife on the host’s property",
    "Deliberate large-scale trash dumping or toxic dumping",
    "Arson or intentional severe property destruction",
    "Threats or violence toward the host or household",
  ],
  platformResponse: [
    "Immediate suspension of the guest account pending review",
    "Permanent ban when abuse is substantiated",
    "Preserve stay record, messages, and any photos the host provides",
    "Do not force the host to ‘work it out’ with the guest",
    "Point the host to local law enforcement and state wildlife / conservation agencies when animals or crimes may be involved",
    "Never send that guest to another Immerse host",
  ],
  hostRights: [
    "Close or pause listings at any time with no penalty for protecting themselves or their land",
    "Refuse future guests after a severe incident",
    "Document the scene (photos, dates, vehicle/description notes) for authorities",
    "Expect Immerse not to treat wildlife killing as a cleaning-fee conversation",
  ],
  honesty:
    "No platform can restore animals that were killed or fully repair a host’s trust. Prevention, bans, and real-world reporting are the limits of what we can do — and we will not pretend otherwise.",
} as const;

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
