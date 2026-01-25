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

export interface Destination {
  id: string;
  name: string;
  displayName: string;
  placeDetails?: PlaceDetails;
}