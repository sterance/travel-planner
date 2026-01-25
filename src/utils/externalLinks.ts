import { type Destination } from "../types/destination";

export interface TransportLink {
  label: string;
  url: string;
  icon?: string;
}

export interface TravelDates {
  departure: Date;
  return?: Date;
}

interface LocationInfo {
  accommodation?: string;
  placeName: string;
}

function getLocationFromDestination(dest: Destination): LocationInfo {
  return {
    accommodation: undefined,
    placeName: dest.displayName || dest.name || "",
  };
}

function formatLocationForUrl(location: LocationInfo): string {
  if (location.accommodation) {
    return encodeURIComponent(location.accommodation);
  }
  return encodeURIComponent(location.placeName);
}

function getCityName(dest: Destination): string {
  if (dest.placeDetails?.city) {
    return dest.placeDetails.city;
  }
  return dest.displayName || dest.name || "";
}

function formatDateForGoogleFlights(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateForSkyscanner(date: Date): string {
  const year = String(date.getFullYear()).slice(-2);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

export function buildFlightLinks(
  origin: Destination,
  destination: Destination,
  dates?: TravelDates
): TransportLink[] {
  const originCity = getCityName(origin);
  const destCity = getCityName(destination);

  if (!originCity || !destCity) {
    return [];
  }

  const links: TransportLink[] = [];

  const originEncoded = encodeURIComponent(originCity);
  const destEncoded = encodeURIComponent(destCity);

  if (dates) {
    const departureDate = formatDateForGoogleFlights(dates.departure);
    let googleFlightsUrl = `https://www.google.com/travel/flights?q=flights+from+${originEncoded}+to+${destEncoded}+on+${departureDate}`;
    if (dates.return) {
      const returnDate = formatDateForGoogleFlights(dates.return);
      googleFlightsUrl += `+returning+on+${returnDate}`;
    }
    links.push({
      label: "Google Flights",
      url: googleFlightsUrl,
      icon: "google-flights",
    });

    const skyscannerDate = formatDateForSkyscanner(dates.departure);
    links.push({
      label: "Skyscanner",
      url: `https://www.skyscanner.com/transport/flights/${originEncoded}/${destEncoded}/${skyscannerDate}/`,
      icon: "skyscanner",
    });
  } else {
    links.push({
      label: "Google Flights",
      url: `https://www.google.com/travel/flights?q=flights+from+${originEncoded}+to+${destEncoded}`,
      icon: "google-flights",
    });

    links.push({
      label: "Skyscanner",
      url: `https://www.skyscanner.com/transport/flights/${originEncoded}/${destEncoded}/`,
      icon: "skyscanner",
    });
  }

  return links;
}

function mapTransportToTravelMode(transport: string): string | null {
  switch (transport) {
    case "by car":
    case "by motorbike":
      return "driving";
    case "by bicycle":
      return "bicycling";
    case "on foot":
      return "walking";
    default:
      return null;
  }
}

export function buildMapsDirectionsLinks(
  origin: Destination,
  destination: Destination,
  transport: string
): TransportLink[] {
  const travelMode = mapTransportToTravelMode(transport);
  if (!travelMode) {
    return [];
  }

  const originLocation = getLocationFromDestination(origin);
  const destLocation = getLocationFromDestination(destination);

  if (!originLocation.placeName && !originLocation.accommodation) {
    return [];
  }
  if (!destLocation.placeName && !destLocation.accommodation) {
    return [];
  }

  const originParam = formatLocationForUrl(originLocation);
  const destParam = formatLocationForUrl(destLocation);

  return [
    {
      label: "Google Maps",
      url: `https://www.google.com/maps/dir/?api=1&origin=${originParam}&destination=${destParam}&travelmode=${travelMode}`,
      icon: "google-maps",
    },
  ];
}

export function buildRome2RioLinks(
  origin: Destination,
  destination: Destination
): TransportLink[] {
  const originCity = getCityName(origin);
  const destCity = getCityName(destination);

  if (!originCity || !destCity) {
    return [];
  }

  return [
    {
      label: "Rome2Rio",
      url: `https://www.rome2rio.com/map/${encodeURIComponent(originCity)}/${encodeURIComponent(destCity)}`,
      icon: "rome2rio",
    },
  ];
}

export function getTransportLinks(
  origin: Destination,
  destination: Destination,
  transport: string,
  dates?: TravelDates
): TransportLink[] {
  switch (transport) {
    case "by plane":
      return buildFlightLinks(origin, destination, dates);
    case "by car":
    case "by motorbike":
    case "by bicycle":
    case "on foot":
      return buildMapsDirectionsLinks(origin, destination, transport);
    case "by bus":
    case "by train":
    case "by boat":
      return buildRome2RioLinks(origin, destination);
    default:
      return [];
  }
}

export function buildAccommodationLinks(destination: Destination): TransportLink[] {
  const cityName = getCityName(destination);

  if (!cityName) {
    return [];
  }

  const encodedCity = encodeURIComponent(cityName);

  return [
    {
      label: "Booking.com",
      url: `https://www.booking.com/searchresults.html?ss=${encodedCity}`,
      icon: "booking",
    },
    {
      label: "Hostelworld",
      url: `https://www.hostelworld.com/s?q=${encodedCity}`,
      icon: "hostelworld",
    },
  ];
}
