import { type Destination } from './destination';

export interface TripSettings {
  startDate: string | null;
}

export interface Trip {
  id: string;
  name: string;
  startDate: string | null;
  destinations: Destination[];
  createdAt: string;
  updatedAt: string;
}
