import airportsData from "airports-json/data/airports.json";

export interface Airport {
  iata: string;
  name: string;
  city?: string;
}

interface AirportData {
  iata_code: string;
  name: string;
  municipality?: string;
}

let airportsCache: Airport[] | null = null;

const loadAirports = (): Airport[] => {
  if (airportsCache) {
    return airportsCache;
  }

  const airports: Airport[] = [];
  const data = airportsData as AirportData[];

  for (const airport of data) {
    if (airport.iata_code && airport.name) {
      airports.push({
        iata: airport.iata_code,
        name: airport.name,
        city: airport.municipality,
      });
    }
  }

  airportsCache = airports;
  return airports;
};

export const searchAirports = (query: string): Airport[] => {
  if (!query.trim()) {
    return [];
  }

  const airports = loadAirports();
  const lowerQuery = query.toLowerCase().trim();
  const queryLength = lowerQuery.length;

  return airports
    .filter((airport) => {
      const iataMatch = airport.iata.toLowerCase().includes(lowerQuery);
      
      if (queryLength <= 3) {
        return iataMatch;
      }
      
      const nameMatch = airport.name.toLowerCase().includes(lowerQuery);
      const cityMatch = airport.city?.toLowerCase().includes(lowerQuery);
      return iataMatch || nameMatch || cityMatch;
    })
    .slice(0, 50);
};

export const getAirportByIata = (iata: string): Airport | undefined => {
  const airports = loadAirports();
  return airports.find((airport) => airport.iata.toLowerCase() === iata.toLowerCase());
};

export const formatAirportDisplay = (airport: Airport): string => {
  return `${airport.iata} (${airport.name})`;
};
