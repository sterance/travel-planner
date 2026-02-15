export interface Country {
  name: string;
  cca2: string;
  flag: string;
}

interface RestCountriesResponse {
  name: {
    common: string;
  };
  cca2: string;
  flag: string;
}

let countriesCache: Country[] | null = null;

async function fetchAllCountries(): Promise<Country[]> {
  if (countriesCache) {
    return countriesCache;
  }

  try {
    const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,flag');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch countries: ${response.status}`);
    }

    const data: RestCountriesResponse[] = await response.json();
    
    countriesCache = data.map((country) => ({
      name: country.name.common,
      cca2: country.cca2,
      flag: country.flag,
    })).sort((a, b) => a.name.localeCompare(b.name));

    return countriesCache;
  } catch (error) {
    console.error('Error fetching countries:', error);
    throw error;
  }
}

export async function searchCountries(query: string): Promise<Country[]> {
  const allCountries = await fetchAllCountries();
  
  if (!query.trim()) {
    return allCountries;
  }

  const lowerQuery = query.toLowerCase();
  return allCountries.filter((country) =>
    country.name.toLowerCase().includes(lowerQuery)
  );
}
