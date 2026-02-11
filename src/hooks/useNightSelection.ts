import { useState, type RefObject } from "react";
import { type Dayjs } from "dayjs";
import { type Destination as DestinationType } from "../types/destination";

type NightSelectionValue = number | "none" | "more" | "dates" | "unsure";

interface UseNightSelectionParams {
  destination: DestinationType;
  onDestinationChange: (destination: DestinationType) => void;
  customNightsInputRef: RefObject<HTMLInputElement | null>;
  onOpenDatePicker: () => void;
  onCloseCalendar: () => void;
}

export const useNightSelection = ({ destination, onDestinationChange, customNightsInputRef, onOpenDatePicker, onCloseCalendar }: UseNightSelectionParams) => {
  const [showCustomNights, setShowCustomNights] = useState(false);
  const [customNightsValue, setCustomNightsValue] = useState("");

  const handleNightSelect = (nights: NightSelectionValue): void => {
    if (nights === "more") {
      setShowCustomNights(true);
      onCloseCalendar();
      setTimeout(() => {
        customNightsInputRef.current?.focus();
      }, 0);
      return;
    }

    if (nights === "dates") {
      onCloseCalendar();
      onOpenDatePicker();
      return;
    }

    if (nights === "unsure") {
      onDestinationChange({
        ...destination,
        nights: null,
        arrivalDate: undefined,
        departureDate: undefined,
      });
      onCloseCalendar();
      return;
    }

    onDestinationChange({
      ...destination,
      nights,
      arrivalDate: undefined,
      departureDate: undefined,
    });
    onCloseCalendar();
  };

  const handleDateRangeChange = (checkIn: Dayjs | null, checkOut: Dayjs | null): void => {
    onDestinationChange({
      ...destination,
      nights: "dates",
      arrivalDate: checkIn ?? null,
      departureDate: checkOut ?? null,
    });
  };

  const handleCustomNightsSubmit = (): void => {
    const parsed = parseInt(customNightsValue, 10);
    if (!isNaN(parsed) && parsed > 0) {
      onDestinationChange({ ...destination, nights: parsed });
    }
    setShowCustomNights(false);
    setCustomNightsValue("");
  };

  const handleCustomNightsKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "Enter") {
      handleCustomNightsSubmit();
    } else if (event.key === "Escape") {
      setShowCustomNights(false);
      setCustomNightsValue("");
    }
  };

  return {
    showCustomNights,
    customNightsValue,
    setCustomNightsValue,
    handleNightSelect,
    handleDateRangeChange,
    handleCustomNightsSubmit,
    handleCustomNightsKeyDown,
  };
};

