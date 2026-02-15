import dayjs from "dayjs";
import { type Trip } from "../types/trip";
import type { Destination, TransportDetails, AccommodationDetails, ActivityDetails } from "../types/destination";
import { calculateTripEndDate } from "../utils/dateCalculation";

function toIso(value: unknown): string | null {
  if (value == null) return null;
  if (dayjs.isDayjs(value) && value.isValid()) return value.toISOString();
  if (typeof value === "string") return value;
  return null;
}

export function serializeTrip(trip: Trip): Record<string, unknown> {
  return {
    id: trip.id,
    name: trip.name,
    startDate: toIso(trip.startDate),
    endDate: toIso(trip.endDate),
    destinations: trip.destinations.map(serializeDestination),
    createdAt: toIso(trip.createdAt),
    updatedAt: toIso(trip.updatedAt),
  };
}

function serializeDestination(d: Destination): Record<string, unknown> {
  const out: Record<string, unknown> = {
    id: d.id,
    name: d.name,
    displayName: d.displayName,
    nights: d.nights,
    arrivalDate: toIso(d.arrivalDate),
    arrivalTime: toIso(d.arrivalTime),
    departureDate: toIso(d.departureDate),
    placeDetails: d.placeDetails,
    weatherDetails: d.weatherDetails
      ? { ...d.weatherDetails, dateTime: toIso(d.weatherDetails.dateTime) }
      : undefined,
    accommodations: d.accommodations?.map(serializeAccommodation),
    activities: d.activities?.map(serializeActivity),
  };
  if (d.transportDetails) {
    out.transportDetails = {
      ...d.transportDetails,
      departureDateTime: toIso(d.transportDetails.departureDateTime),
      arrivalDateTime: toIso(d.transportDetails.arrivalDateTime),
    };
  }
  return out;
}

function serializeAccommodation(a: AccommodationDetails): Record<string, unknown> {
  return {
    ...a,
    checkInDateTime: toIso(a.checkInDateTime),
    checkOutDateTime: toIso(a.checkOutDateTime),
  };
}

function serializeActivity(a: ActivityDetails): Record<string, unknown> {
  return {
    ...a,
    startDateTime: toIso(a.startDateTime),
    endDateTime: toIso(a.endDateTime),
  };
}

function hydrateActivity(activity: Record<string, unknown>): ActivityDetails {
  return {
    ...activity,
    startDateTime: activity.startDateTime ? dayjs(activity.startDateTime as string) : null,
    endDateTime: activity.endDateTime ? dayjs(activity.endDateTime as string) : null,
  } as ActivityDetails;
}

function hydrateAccommodation(accommodation: Record<string, unknown>): AccommodationDetails {
  return {
    ...accommodation,
    checkInDateTime: accommodation.checkInDateTime ? dayjs(accommodation.checkInDateTime as string) : null,
    checkOutDateTime: accommodation.checkOutDateTime ? dayjs(accommodation.checkOutDateTime as string) : null,
  } as AccommodationDetails;
}

function hydrateTransport(transport: Record<string, unknown>): TransportDetails {
  return {
    ...transport,
    mode: (transport.mode as string) ?? "unsure",
    departureDateTime: transport.departureDateTime ? dayjs(transport.departureDateTime as string) : null,
    arrivalDateTime: transport.arrivalDateTime ? dayjs(transport.arrivalDateTime as string) : null,
  } as TransportDetails;
}

function hydrateDestination(destination: Record<string, unknown>): Destination {
  const weatherDetails = destination.weatherDetails as Record<string, unknown> | undefined;
  return {
    ...destination,
    arrivalDate: destination.arrivalDate ? dayjs(destination.arrivalDate as string) : null,
    arrivalTime: destination.arrivalTime ? dayjs(destination.arrivalTime as string) : null,
    departureDate: destination.departureDate ? dayjs(destination.departureDate as string) : null,
    transportDetails: destination.transportDetails ? hydrateTransport(destination.transportDetails as Record<string, unknown>) : undefined,
    weatherDetails: weatherDetails
      ? { ...weatherDetails, dateTime: dayjs(weatherDetails.dateTime as string) }
      : undefined,
    accommodations: (destination.accommodations as Record<string, unknown>[] | undefined)?.map(hydrateAccommodation) ?? [],
    activities: (destination.activities as Record<string, unknown>[] | undefined)?.map(hydrateActivity) ?? [],
  } as Destination;
}

export function hydrateTrip(trip: Record<string, unknown>): Trip {
  const startDate = trip.startDate ? dayjs(trip.startDate as string) : null;
  const destinations = ((trip.destinations as Record<string, unknown>[]) ?? []).map(hydrateDestination);
  const endDate = trip.endDate ? dayjs(trip.endDate as string) : calculateTripEndDate(startDate, destinations);

  return {
    ...trip,
    startDate,
    endDate,
    destinations,
    createdAt: trip.createdAt ? dayjs(trip.createdAt as string) : null,
    updatedAt: trip.updatedAt ? dayjs(trip.updatedAt as string) : null,
  } as Trip;
}
