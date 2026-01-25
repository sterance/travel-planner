import { type Destination } from "../types/destination";

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

export function buildGoogleMapsDirectionsUrl(
  origin: Destination,
  destination: Destination,
  transport: string
): string | null {
  const travelMode = mapTransportToTravelMode(transport);
  if (!travelMode) {
    return null;
  }

  const originLocation = getLocationFromDestination(origin);
  const destLocation = getLocationFromDestination(destination);

  if (!originLocation.placeName && !originLocation.accommodation) {
    return null;
  }
  if (!destLocation.placeName && !destLocation.accommodation) {
    return null;
  }

  const originParam = formatLocationForUrl(originLocation);
  const destParam = formatLocationForUrl(destLocation);

  return `https://www.google.com/maps/dir/?api=1&origin=${originParam}&destination=${destParam}&travelmode=${travelMode}`;
}
