import { type PlaceDetails } from "../types/destination";

interface PhotonFeature {
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number];
  };
  properties: {
    osm_type?: string;
    osm_id?: number;
    osm_key?: string;
    osm_value?: string;
    type?: string;
    countrycode?: string;
    name: string;
    country: string;
    state?: string;
    city?: string;
    extent?: [number, number, number, number];
  };
}

interface PhotonResponse {
  type: string;
  features: PhotonFeature[];
}

export interface PlaceSuggestion {
  name: string;
  displayName: string;
  placeDetails: PlaceDetails;
}

const formatCityName = (feature: PhotonFeature): string => {
  const { name, city } = feature.properties;
  return city || name;
};

const formatCityCountry = (feature: PhotonFeature): string => {
  const { name, city, country } = feature.properties;
  const primaryName = city || name;
  return `${primaryName}, ${country}`;
};

const mapPhotonFeatureToPlaceDetails = (feature: PhotonFeature): PlaceDetails => {
  const { properties, geometry } = feature;
  return {
    osmId: properties.osm_id ?? 0,
    osmType: properties.osm_type ?? "",
    placeType: properties.type ?? properties.osm_value ?? "",
    coordinates: geometry.coordinates,
    city: properties.city,
    state: properties.state,
    country: properties.country,
    countryCode: properties.countrycode,
    extent: properties.extent,
  };
};

export const searchPlaces = async (query: string): Promise<PlaceSuggestion[]> => {
  if (!query.trim()) {
    return [];
  }

  const encodedQuery = encodeURIComponent(query);
  const url = `https://photon.komoot.io/api/?q=${encodedQuery}&limit=5`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: PhotonResponse = await response.json();

    const suggestions = data.features.map((feature) => ({
      name: formatCityCountry(feature),
      displayName: formatCityName(feature),
      placeDetails: mapPhotonFeatureToPlaceDetails(feature),
    }));

    const seen = new Set<string>();
    return suggestions.filter((s) => {
      if (seen.has(s.name)) return false;
      seen.add(s.name);
      return true;
    });
  } catch (error) {
    console.error("Error fetching places:", error);
    return [];
  }
};
