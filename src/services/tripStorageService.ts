import { type Trip } from '../types/trip';

const STORAGE_KEY = 'travel_trips';

export const loadTrips = (): Trip[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    return JSON.parse(stored) as Trip[];
  } catch (error) {
    console.error('Failed to load trips from localStorage:', error);
    return [];
  }
};

export const saveTrips = (trips: Trip[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
  } catch (error) {
    console.error('Failed to save trips to localStorage:', error);
  }
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
