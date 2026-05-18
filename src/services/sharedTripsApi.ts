import { type Trip } from "../types/trip";
import { API_URL } from "../config";
import { hydrateTrip, serializeTrip } from "./tripSerialization";

function authHeaders(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function createShare(token: string, tripId: string): Promise<{ id: string }> {
  if (!API_URL) {
    throw new Error("API_URL is not configured");
  }
  const res = await fetch(`${API_URL}/api/trips/${encodeURIComponent(tripId)}/share`, {
    method: "POST",
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `createShare failed: ${res.status}`);
  }
  return (await res.json()) as { id: string };
}

export async function getSharedTrip(shareId: string): Promise<Trip> {
  if (!API_URL) {
    throw new Error("API_URL is not configured");
  }
  const res = await fetch(`${API_URL}/api/share/${encodeURIComponent(shareId)}`);
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `getSharedTrip failed: ${res.status}`);
  }
  const raw = (await res.json()) as Record<string, unknown>;
  return hydrateTrip(raw);
}

export async function updateSharedTrip(shareId: string, trip: Trip): Promise<Trip> {
  if (!API_URL) {
    throw new Error("API_URL is not configured");
  }
  const body = serializeTrip(trip);
  const res = await fetch(`${API_URL}/api/share/${encodeURIComponent(shareId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error ?? `updateSharedTrip failed: ${res.status}`);
  }
  const raw = (await res.json()) as Record<string, unknown>;
  return hydrateTrip(raw);
}
