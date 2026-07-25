import { StayExpectations, DEFAULT_NATURE_EXPECTATIONS } from "./trust";
import { CampSite } from "./types";

/**
 * Critical product rule (learned the hard way from bad Airbnb-style experiences):
 *
 * ALL agreements a guest must accept are shown and accepted INSIDE Immerse
 * BEFORE payment. Hosts cannot send side contracts, waivers, or verification
 * after the guest has paid. If a host needs a rule, it belongs on the listing
 * and in the pre-pay checklist.
 */

export const BOOKING_POLICY = {
  /** Hard rule — violation can remove hosting privileges */
  noPostPaymentAgreements:
    "Hosts may not require guests to sign, click, or complete any additional contract, waiver, ID upload, or payment outside Immerse after a booking is confirmed. All requirements must appear in the listing and the pre-payment agreement screen.",
  platformTermsOnly:
    "The only binding stay terms are: (1) Immerse platform terms, (2) the listing’s published house rules / expectations, (3) Immerse Care rules when active. Anything else sent by the host after payment is not enforceable through Immerse and is grounds for guest cancellation with refund path.",
  refundIfSideContract:
    "If a host demands a post-payment side agreement as a condition of the stay, the guest may cancel and request a full refund. The host may lose listing privileges.",
} as const;

export interface BookingDraft {
  siteId: string;
  siteName: string;
  arrivalDate: string;
  nights: number;
  guests: number;
  expectations: StayExpectations;
  /** Snapshot of rules the guest is agreeing to — frozen at checkout */
  agreedRuleSummary: string[];
  totalEstimate?: string;
}

export function buildAgreedRules(site: CampSite): string[] {
  const exp = DEFAULT_NATURE_EXPECTATIONS;
  const host = site.privateHost;

  const rules: string[] = [
    "I understand all stay rules are only those shown in Immerse before payment — no extra host contracts after I pay.",
    `Quiet hours: ${exp.quietHours}`,
    `Max guests for this stay: ${Math.min(exp.maxGuests, host?.maxSites ? host.maxSites * 2 : exp.maxGuests)}`,
    exp.privacyNote,
    ...exp.guestCommitments,
  ];

  if (host?.immersionRules?.length) {
    rules.push(...host.immersionRules.map((r) => `Host rule: ${r}`));
  }

  if (site.notes) {
    rules.push(`Listing note: ${site.notes}`);
  }

  return rules;
}

export function createBookingDraft(
  site: CampSite,
  opts: { arrivalDate: string; nights: number; guests: number }
): BookingDraft {
  return {
    siteId: site.id,
    siteName: site.name,
    arrivalDate: opts.arrivalDate,
    nights: opts.nights,
    guests: opts.guests,
    expectations: DEFAULT_NATURE_EXPECTATIONS,
    agreedRuleSummary: buildAgreedRules(site),
    totalEstimate: site.campingFee,
  };
}
