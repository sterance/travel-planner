import { useEffect, useState } from "react";
import type { PlaceSuggestion } from "../services/placeService";
import { searchAirports, formatAirportDisplay } from "../services/airportService";

interface UseAirportAutocompleteResult {
  value: string;
  setValue: (value: string) => void;
  suggestions: PlaceSuggestion[];
  isLoading: boolean;
}

export const useAirportAutocomplete = (enabled: boolean): UseAirportAutocompleteResult => {
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!enabled || value.length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      setIsLoading(true);
      const results = searchAirports(value);
      setSuggestions(
        results.map((airport) => ({
          name: formatAirportDisplay(airport),
          displayName: formatAirportDisplay(airport),
          placeDetails: {
            osmId: 0,
            osmType: "",
            placeType: "airport",
            coordinates: [0, 0],
            country: "",
          },
        })),
      );
      setIsLoading(false);
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [enabled, value]);

  return {
    value,
    setValue,
    suggestions,
    isLoading,
  };
};

