import type { Dayjs } from "dayjs";

export interface Destination {
  id: string;
  name: string;
  displayName: string;
  nights?: number | "none" | "dates" | null;
  arrivalDate?: Dayjs | null;
  arrivalTime?: Dayjs | null;
  departureDate?: Dayjs | null;
  placeDetails?: PlaceDetails;
  transportDetails?: TransportDetails;
  accommodations?: AccommodationDetails[];
  activities?: ActivityDetails[];
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
  mode: string;
  departureLocation?: string;
  arrivalLocation?: string;
  flightNumber?: string;
  departureDateTime?: Dayjs | null;
  arrivalDateTime?: Dayjs | null;
}

export interface AccommodationDetails {
  id: string;
  name?: string;
  address?: string;
  checkInDateTime?: Dayjs | null;
  checkOutDateTime?: Dayjs | null;
}

export interface ActivityDetails {
  id: string;
  name?: string;
  address?: string;
  startDateTime?: Dayjs | null;
  endDateTime?: Dayjs | null;
}