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

let airportsPromise: Promise<Airport[]> | null = null;

const loadAirports = async (): Promise<Airport[]> => {
  if (!airportsPromise) {
    airportsPromise = import("airports-json/data/airports.json").then((module) => {
      const data = module.default as AirportData[];
      const airports: Airport[] = [];

      for (const airport of data) {
        if (airport.iata_code && airport.name) {
          airports.push({
            iata: airport.iata_code,
            name: airport.name,
            city: airport.municipality,
          });
        }
      }

      return airports;
    });
  }

  return airportsPromise;
};

export const searchAirports = async (query: string): Promise<Airport[]> => {
  if (!query.trim()) {
    return [];
  }

  const airports = await loadAirports();
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

export const getAirportByIata = async (iata: string): Promise<Airport | undefined> => {
  const airports = await loadAirports();
  return airports.find((airport) => airport.iata.toLowerCase() === iata.toLowerCase());
};

export const formatAirportDisplay = (airport: Airport): string => {
  return `${airport.iata} (${airport.name})`;
};
