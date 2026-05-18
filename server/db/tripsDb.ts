import { randomUUID } from "node:crypto";
import {
  TRIPS_TABLES,
  getTripsForUser as getTripsForUserImpl,
  getTripForUser as getTripForUserImpl,
  insertTrip as insertTripImpl,
  getTripById as getTripByIdImpl,
  updateTripById as updateTripByIdImpl,
  updateTrip as updateTripImpl,
  deleteTrip as deleteTripImpl,
} from "./tripPersistence.js";

export function getTripsForUser(userId: string): Record<string, unknown>[] {
  return getTripsForUserImpl(TRIPS_TABLES, userId);
}

export function getTripForUser(userId: string, tripId: string): Record<string, unknown> | null {
  return getTripForUserImpl(TRIPS_TABLES, userId, tripId);
}

export function insertTrip(userId: string, body: Record<string, unknown>): void {
  insertTripImpl(TRIPS_TABLES, userId, body);
}

export function createSharedTripFromTrip(ownerUserId: string, sourceTripId: string): string | null {
  const source = getTripForUser(ownerUserId, sourceTripId);
  if (!source) return null;

  const newId = randomUUID();
  const now = new Date().toISOString();
  insertTripImpl(
    TRIPS_TABLES,
    ownerUserId,
    {
      ...source,
      id: newId,
      createdAt: now,
      updatedAt: now,
    },
    { isShared: true },
  );
  return newId;
}

export function getSharedTripById(shareId: string): Record<string, unknown> | null {
  return getTripByIdImpl(TRIPS_TABLES, shareId, true);
}

export function updateSharedTrip(shareId: string, body: Record<string, unknown>): void {
  updateTripByIdImpl(TRIPS_TABLES, shareId, body, true);
}

export function updateTrip(userId: string, tripId: string, body: Record<string, unknown>): void {
  updateTripImpl(TRIPS_TABLES, userId, tripId, body);
}

export function deleteTrip(userId: string, tripId: string): number {
  return deleteTripImpl(TRIPS_TABLES, userId, tripId);
}
