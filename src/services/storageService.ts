import dayjs from "dayjs";
import { type Trip } from "../types/trip";
import type { Destination, TransportDetails, AccommodationDetails, ActivityDetails } from "../types/destination";
import { calculateTripEndDate } from "../utils/dateCalculation";

const TRIPS_STORAGE_KEY = 'trips';

export const getItem = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) {
      return defaultValue;
    }
    return JSON.parse(stored) as T;
  } catch (error) {
    console.error(`Failed to load ${key} from localStorage:`, error);
    return defaultValue;
  }
};

export const setItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Failed to save ${key} to localStorage:`, error);
  }
};

export const removeItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Failed to remove ${key} from localStorage:`, error);
  }
};

export const getStringItem = (key: string, defaultValue: string = ''): string => {
  try {
    const stored = localStorage.getItem(key);
    return stored ?? defaultValue;
  } catch (error) {
    console.error(`Failed to load ${key} from localStorage:`, error);
    return defaultValue;
  }
};

export const setStringItem = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error(`Failed to save ${key} to localStorage:`, error);
  }
};

const hydrateActivity = (activity: any): ActivityDetails => {
  return {
    ...activity,
    startDateTime: activity.startDateTime ? dayjs(activity.startDateTime) : null,
    endDateTime: activity.endDateTime ? dayjs(activity.endDateTime) : null,
  };
};

const hydrateAccommodation = (accommodation: any): AccommodationDetails => {
  return {
    ...accommodation,
    checkInDateTime: accommodation.checkInDateTime ? dayjs(accommodation.checkInDateTime) : null,
    checkOutDateTime: accommodation.checkOutDateTime ? dayjs(accommodation.checkOutDateTime) : null,
  };
};

const hydrateTransport = (transport: any): TransportDetails => {
  return {
    ...transport,
    mode: transport.mode ?? "unsure", // fallback for safety, though user said no back-compat, this effectively inits new field
    departureDateTime: transport.departureDateTime ? dayjs(transport.departureDateTime) : null,
    arrivalDateTime: transport.arrivalDateTime ? dayjs(transport.arrivalDateTime) : null,
  };
};

const hydrateDestination = (destination: any): Destination => {
  return {
    ...destination,
    arrivalDate: destination.arrivalDate ? dayjs(destination.arrivalDate) : null,
    arrivalTime: destination.arrivalTime ? dayjs(destination.arrivalTime) : null,
    departureDate: destination.departureDate ? dayjs(destination.departureDate) : null,
    transportDetails: destination.transportDetails ? hydrateTransport(destination.transportDetails) : undefined,
    accommodations: destination.accommodations?.map(hydrateAccommodation) ?? [],
    activities: destination.activities?.map(hydrateActivity) ?? [],
  };
};



export const loadTrips = (): Trip[] => {
  const rawTrips = getItem<any[]>(TRIPS_STORAGE_KEY, []);
  return rawTrips.map(hydrateTrip);
};

export const saveTrips = (trips: Trip[]): void => {
  setItem(TRIPS_STORAGE_KEY, trips);
};

export const createTrip = (name?: string): Trip => {
  const now = dayjs();
  return {
    id: generateId(),
    name: name ?? 'New Trip',
    startDate: null,
    endDate: null,
    destinations: [],
    createdAt: now,
    updatedAt: now,
  };
};

export const updateTrip = (trip: Trip): void => {
  const trips = loadTrips();
  const index = trips.findIndex((t) => t.id === trip.id);
  if (index !== -1) {
    trips[index] = { ...trip, updatedAt: dayjs() };
    saveTrips(trips);
  }
};

export const deleteTrip = (id: string): void => {
  const trips = loadTrips();
  const filtered = trips.filter((t) => t.id !== id);
  saveTrips(filtered);
};

export const getTrip = (id: string): Trip | undefined => {
  const trips = loadTrips();
  return trips.find((t) => t.id === id);
};

const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch {
      // fallback for non-secure contexts
    }
  }
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

const hydrateTrip = (trip: any): Trip => {
  const startDate = trip.startDate ? dayjs(trip.startDate) : null;
  const destinations = trip.destinations?.map(hydrateDestination) ?? [];
  const endDate = trip.endDate ? dayjs(trip.endDate) : calculateTripEndDate(startDate, destinations);

  return {
    ...trip,
    startDate,
    endDate,
    destinations,
    createdAt: trip.createdAt ? dayjs(trip.createdAt) : null,
    updatedAt: trip.updatedAt ? dayjs(trip.updatedAt) : null,
  };
};
