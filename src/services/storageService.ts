import { type Trip } from '../types/trip';

const TRIPS_STORAGE_KEY = 'travel_trips';

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

export const loadTrips = (): Trip[] => {
  return getItem<Trip[]>(TRIPS_STORAGE_KEY, []);
};

export const saveTrips = (trips: Trip[]): void => {
  setItem(TRIPS_STORAGE_KEY, trips);
};

export const createTrip = (name?: string): Trip => {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    name: name ?? 'New Trip',
    startDate: null,
    destinations: [],
    createdAt: now,
    updatedAt: now,
  };
};

export const updateTrip = (trip: Trip): void => {
  const trips = loadTrips();
  const index = trips.findIndex((t) => t.id === trip.id);
  if (index !== -1) {
    trips[index] = { ...trip, updatedAt: new Date().toISOString() };
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
