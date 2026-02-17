import { type Trip } from "../types/trip";
import { hydrateTrip } from "./tripSerialization";

interface DemoFile {
  trip: Record<string, unknown>;
}

export const loadDemoTrip = async (): Promise<Trip> => {
  const response = await fetch("/demo.json", {
    cache: "no-cache",
  });

  if (!response.ok) {
    throw new Error(`failed to load demo trip (status ${response.status})`);
  }

  const data = (await response.json()) as DemoFile | null;

  if (!data || typeof data !== "object" || !("trip" in data)) {
    throw new Error("demo.json is missing a top-level `trip` field");
  }

  const rawTrip = data.trip as Record<string, unknown>;
  return hydrateTrip(rawTrip);
};

