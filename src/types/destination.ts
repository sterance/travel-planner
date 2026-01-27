export interface Destination {
  id: string;
  name: string;
  displayName: string;
  placeDetails?: PlaceDetails;
  transport?: string | null;
  nights?: number | "none" | "dates" | null;
  checkInDate?: string;
  checkOutDate?: string;
  transportDetails?: TransportDetails;
  customArrivalDateTime?: string;
}

export interface PlaceDetails {
  osmId: number;
  osmType: string;
  placeType: string;
  coordinates: [number, number];
  city?: string;
  state?: string;
  country: string;
  countryCode?: string;
  extent?: [number, number, number, number];
}

export interface TransportDetails {
  departureDateTime?: string;
  arrivalDateTime?: string;
  departureLocation?: string;
  arrivalLocation?: string;
  flightNumber?: string;
}