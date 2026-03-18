import type { Dayjs } from "dayjs";
import type { Trip } from "../types/trip";
import { computeDestinationTimeline } from "./dateCalculation";

export const CALENDAR_IDS = {
  destination: "destination",
  transport: "transport",
  accommodation: "accommodation",
  activity: "activity",
} as const;

export const CALENDAR_COLORS: Record<(typeof CALENDAR_IDS)[keyof typeof CALENDAR_IDS], { lightColors: { main: string; container: string; onContainer: string }; darkColors: { main: string; container: string; onContainer: string } }> = {
  [CALENDAR_IDS.destination]: {
    lightColors: { main: "#00897b", container: "#b2dfdb", onContainer: "#004d40" },
    darkColors: { main: "#4db6ac", container: "#00695c", onContainer: "#b2dfdb" },
  },
  [CALENDAR_IDS.transport]: {
    lightColors: { main: "#1976d2", container: "#bbdefb", onContainer: "#0d47a1" },
    darkColors: { main: "#64b5f6", container: "#0d47a1", onContainer: "#bbdefb" },
  },
  [CALENDAR_IDS.accommodation]: {
    lightColors: { main: "#7b1fa2", container: "#e1bee7", onContainer: "#4a148c" },
    darkColors: { main: "#ba68c8", container: "#4a148c", onContainer: "#e1bee7" },
  },
  [CALENDAR_IDS.activity]: {
    lightColors: { main: "#e65100", container: "#ffe0b2", onContainer: "#bf360c" },
    darkColors: { main: "#ff8a65", container: "#bf360c", onContainer: "#ffe0b2" },
  },
};

export interface CalendarEventInput {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  calendarId: (typeof CALENDAR_IDS)[keyof typeof CALENDAR_IDS];
}

function toDateString(d: Dayjs): string | null {
  if (!d?.isValid?.()) return null;
  return d.format("YYYY-MM-DD");
}

function toIsoString(d: Dayjs): string | null {
  if (!d?.isValid?.()) return null;
  const iso = d.toISOString();
  return iso || null;
}

export function transformTripToCalendarEvents(trip: Trip | null | undefined): CalendarEventInput[] {
  if (!trip?.destinations?.length) return [];

  const events: CalendarEventInput[] = [];
  const { destinationsWithTimeline } = computeDestinationTimeline(trip.startDate, trip.destinations);

  for (const dest of destinationsWithTimeline) {
    const displayName = dest.displayName || dest.name || "Destination";

    const arrivalStr = dest.arrivalDate ? toDateString(dest.arrivalDate) : null;
    const departureStr = dest.departureDate ? toDateString(dest.departureDate) : null;
    if (arrivalStr && departureStr) {
      events.push({
        id: `destination_${dest.id}`,
        title: displayName,
        start: arrivalStr,
        end: departureStr,
        allDay: true,
        calendarId: CALENDAR_IDS.destination,
      });
    }

    const transport = dest.transportDetails;
    if (transport?.departureDateTime && transport?.arrivalDateTime) {
      const start = toIsoString(transport.departureDateTime);
      const end = toIsoString(transport.arrivalDateTime);
      if (start && end) {
        const title = [transport.departureLocation, transport.arrivalLocation].filter(Boolean).join(" to ") || transport.mode || "Transport";
        events.push({
          id: `transport_${dest.id}`,
          title,
          start,
          end,
          allDay: false,
          calendarId: CALENDAR_IDS.transport,
        });
      }
    }

    for (const acc of dest.accommodations ?? []) {
      const accName = acc.name || "Accommodation";
      const checkIn = acc.checkInDateTime ? toIsoString(acc.checkInDateTime) : null;
      const checkOut = acc.checkOutDateTime ? toIsoString(acc.checkOutDateTime) : null;
      if (checkIn) {
        events.push({
          id: `accommodation_${acc.id}_checkin`,
          title: `Check in - ${accName}`,
          start: checkIn,
          end: checkIn,
          allDay: false,
          calendarId: CALENDAR_IDS.accommodation,
        });
      }
      if (checkOut) {
        events.push({
          id: `accommodation_${acc.id}_checkout`,
          title: `Check out - ${accName}`,
          start: checkOut,
          end: checkOut,
          allDay: false,
          calendarId: CALENDAR_IDS.accommodation,
        });
      }
    }

    for (const act of dest.activities ?? []) {
      if (act.startDateTime && act.endDateTime) {
        const start = toIsoString(act.startDateTime);
        const end = toIsoString(act.endDateTime);
        if (start && end) {
          events.push({
            id: `activity_${act.id}`,
            title: act.name || "Activity",
            start,
            end,
            allDay: false,
            calendarId: CALENDAR_IDS.activity,
          });
        }
      }
    }
  }

  return events;
}
