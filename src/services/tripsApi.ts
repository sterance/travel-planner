import { type Trip } from "../types/trip";
import { API_URL } from "../config";
import { hydrateTrip, serializeTrip } from "./tripSerialization";

function authHeaders(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function getTrips(token: string): Promise<Trip[]> {
  if (!API_URL) {
    throw new Error("API_URL is not configured");
  }
  const res = await fetch(`${API_URL}/api/trips`, { headers: authHeaders(token) });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `getTrips failed: ${res.status}`);
  }
  const raw = (await res.json()) as Record<string, unknown>[];
  return raw.map((t) => hydrateTrip(t));
}

export async function createTripApi(token: string, trip: Trip): Promise<Trip> {
  if (!API_URL) {
    throw new Error("API_URL is not configured");
  }
  const body = serializeTrip(trip);
  const res = await fetch(`${API_URL}/api/trips`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `createTrip failed: ${res.status}`);
  }
  const raw = (await res.json()) as Record<string, unknown>;
  return hydrateTrip(raw);
}

export async function updateTripApi(token: string, trip: Trip): Promise<Trip> {
  if (!API_URL) {
    throw new Error("API_URL is not configured");
  }
  const body = serializeTrip(trip);
  const res = await fetch(`${API_URL}/api/trips/${encodeURIComponent(trip.id)}`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `updateTrip failed: ${res.status}`);
  }
  const raw = (await res.json()) as Record<string, unknown>;
  return hydrateTrip(raw);
}

export async function deleteTripApi(token: string, id: string): Promise<void> {
  if (!API_URL) {
    throw new Error("API_URL is not configured");
  }
  const res = await fetch(`${API_URL}/api/trips/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok && res.status !== 204) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `deleteTrip failed: ${res.status}`);
  }
}
