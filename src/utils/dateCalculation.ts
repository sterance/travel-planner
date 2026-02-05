import dayjs, { type Dayjs } from "dayjs";
import { type Destination } from "../types/destination";

export interface DestinationDateInfo {
  arrivalDate: Dayjs | null;
  departureDate: Dayjs | null;
  error?: string;
}

export function calculateDestinationDates(
  startDate: Dayjs | null,
  destinations: Destination[]
): DestinationDateInfo[] {
  if (!startDate || !startDate.isValid() || destinations.length === 0) {
    return destinations.map(() => ({
      arrivalDate: null,
      departureDate: null,
    }));
  }

  const results: DestinationDateInfo[] = [];
  let currentDate = startDate.startOf("day");

  for (let i = 0; i < destinations.length; i++) {
    const destination = destinations[i];
    const errors: string[] = [];

    let arrivalDate = currentDate;
    let departureDate: Dayjs | null = null;

    if (destination.nights === "dates") {
      if (destination.arrivalDate && destination.departureDate) {
        const checkIn = dayjs(destination.arrivalDate).startOf("day");
        const checkOut = dayjs(destination.departureDate).startOf("day");

        if (checkIn.isValid() && checkOut.isValid()) {
          arrivalDate = checkIn;
          departureDate = checkOut;

          if (checkIn.isBefore(startDate, "day")) {
            errors.push("Check-in date is before trip start date");
          }

          if (checkOut.isBefore(checkIn, "day") || checkOut.isSame(checkIn, "day")) {
            errors.push("Check-out date must be after check-in date");
          }

          if (i > 0 && checkIn.isBefore(currentDate, "day")) {
            errors.push("Check-in date is before calculated arrival date");
          }
        } else {
          errors.push("Invalid date format");
        }
      } else {
        errors.push("Check-in and check-out dates are required");
      }
    } else if (destination.nights === "none") {
      departureDate = arrivalDate;
    } else if (typeof destination.nights === "number" && destination.nights >= 0) {
      departureDate = arrivalDate.add(destination.nights, "day");
    } else {
      departureDate = null;
    }

    if (departureDate && departureDate.isBefore(arrivalDate, "day")) {
      errors.push("Departure date cannot be before arrival date");
    }

    results.push({
      arrivalDate,
      departureDate,
      error: errors.length > 0 ? errors.join("; ") : undefined,
    });

    if (departureDate && i < destinations.length - 1) {
      if (destination.transportDetails) {
        const depTime = destination.transportDetails.departureDateTime
          ? dayjs(destination.transportDetails.departureDateTime)
          : null;
        const arrTime = destination.transportDetails.arrivalDateTime
          ? dayjs(destination.transportDetails.arrivalDateTime)
          : null;

        if (depTime && arrTime && depTime.isValid() && arrTime.isValid()) {
          const depDate = depTime.startOf("day");
          const arrDate = arrTime.startOf("day");

          if (arrDate.isAfter(depDate, "day")) {
            currentDate = arrDate;
          } else {
            currentDate = departureDate;
          }
        } else {
          currentDate = departureDate;
        }
      } else {
        currentDate = departureDate;
      }
    }
  }

  return results;
}

export function calculateTripEndDate(
  startDate: Dayjs | null,
  destinations: Destination[]
): Dayjs | null {
  if (!startDate || !startDate.isValid() || destinations.length === 0) {
    return null;
  }

  const dateInfos = calculateDestinationDates(startDate, destinations);
  const lastDestination = dateInfos[dateInfos.length - 1];

  if (lastDestination.departureDate) {
    return lastDestination.departureDate;
  }

  return null;
}

export function hasDateErrors(
  startDate: Dayjs | null,
  destinations: Destination[]
): boolean {
  if (!startDate || !startDate.isValid()) {
    return false;
  }

  const dateInfos = calculateDestinationDates(startDate, destinations);
  return dateInfos.some((info) => Boolean(info.error));
}

export function computeDestinationTimeline(
  startDate: Dayjs | null,
  destinations: Destination[]
): { infos: DestinationDateInfo[]; destinationsWithTimeline: Destination[] } {
  const infos = calculateDestinationDates(startDate, destinations);

  const destinationsWithTimeline = destinations.map((destination, index) => {
    const info = infos[index];

    return {
      ...destination,
      arrivalDate: info.arrivalDate,
      departureDate: info.departureDate,
    };
  });

  return { infos, destinationsWithTimeline };
}
