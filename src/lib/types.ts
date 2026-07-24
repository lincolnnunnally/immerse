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
  /** Activities available (camping, hiking, OHV, fishing, etc.) */
  activities?: string[];
  /** True when the site or immediate area supports OHV / 4x4 use */
  ohvFriendly?: boolean;
  /** Source of the data for transparency */
  dataSource?: "ridb" | "curated" | "community" | "state";
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
