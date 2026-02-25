import { useEffect, useRef, useState } from "react";
import { searchPlaces, type PlaceSuggestion } from "../services/placeService";
import { type Destination as DestinationType } from "../types/destination";

interface UseDestinationSearchParams {
  destination: DestinationType;
  onDestinationChange: (destination: DestinationType) => void;
  shouldFocus?: boolean;
}

export const useDestinationSearch = ({ destination, onDestinationChange, shouldFocus = false }: UseDestinationSearchParams) => {
  const [inputValue, setInputValue] = useState(destination.name);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(destination.name === "" || shouldFocus);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(destination.name);
  }, [destination.name]);

  useEffect(() => {
    if (shouldFocus) {
      const timeoutId = setTimeout(() => {
        const input = autocompleteRef.current?.querySelector("input");
        if (input) {
          input.focus();
          setIsEditing(true);
        }
      }, 50);

      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [shouldFocus]);

  useEffect(() => {
    if (!isEditing || inputValue.length < 2) {
      setSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      (async () => {
        try {
          setIsLoading(true);
          const results = await searchPlaces(inputValue);
          setSuggestions(results);
          setIsLoading(false);
        } catch {
          setIsLoading(false);
          setSuggestions([]);
        }
      })().catch(() => {
        setIsLoading(false);
        setSuggestions([]);
      });
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [inputValue, isEditing]);

  const handleInputChange = (_event: unknown, newValue: string | null): void => {
    const value = newValue || "";
    setInputValue(value);
  };

  const handleChange = (_event: unknown, value: string | PlaceSuggestion | null, _reason?: unknown, _details?: unknown): void => {
    if (value && typeof value !== "string") {
      onDestinationChange({
        ...destination,
        name: value.name,
        displayName: value.displayName,
        placeDetails: value.placeDetails,
      });
      setIsEditing(false);
    } else if (typeof value === "string") {
      const cityName = value.includes(",") ? value.split(",")[0].trim() : value;
      onDestinationChange({
        ...destination,
        name: value,
        displayName: cityName,
        placeDetails: undefined,
      });
    }
  };

  const handleBlur = (): void => {
    if (!inputValue) {
      setInputValue(destination.name);
    } else if (!destination.placeDetails) {
      const cityName = inputValue.includes(",") ? inputValue.split(",")[0].trim() : inputValue;
      onDestinationChange({
        ...destination,
        name: inputValue,
        displayName: cityName,
      });
    }
    setIsEditing(false);
  };

  const handleEditClick = (): void => {
    setIsEditing(true);
    setTimeout(() => {
      const input = autocompleteRef.current?.querySelector("input");
      if (input) {
        input.focus();
      }
    }, 0);
  };

  return {
    inputValue,
    suggestions,
    isLoading,
    isEditing,
    autocompleteRef,
    setIsEditing,
    handleInputChange,
    handleChange,
    handleBlur,
    handleEditClick,
  };
};

