export type SiteType = "developed" | "dispersed" | "private" | "state";

export interface CampSite {
  id: string;
  name: string;
  type: SiteType;
  agency?: string;
  lat: number;
  lng: number;
  elevation?: number;
  driveTimeMinutes?: number; // from a reference point (e.g. Atlanta / Conyers area)
  hikeInMiles?: number;
  hikeInElevationGain?: number;
  reservationRequired: boolean;
  reservationUrl?: string;
  bookingWindow?: string;
  passRequired: string; // e.g. "None", "America the Beautiful (day-use)", "Park entrance fee"
  parkingFee?: string;
  campingFee?: string;
  maxStayDays?: number;
  amenities: string[];
  mustSees: string[];
  description: string;
  notes?: string;
  imageUrl?: string;
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
