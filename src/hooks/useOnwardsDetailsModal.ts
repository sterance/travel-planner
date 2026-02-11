import { useState } from "react";
import type { Dayjs } from "dayjs";
import type { Destination } from "../types/destination";
import { getSafeDayjsValue } from "../utils/dateUtils";
import { useAirportAutocomplete } from "./useAirportAutocomplete";

interface UseOnwardsDetailsModalConfig {
  destination: Destination;
  transportMode?: string | null;
  isFlight: boolean;
  onDestinationChange: (destination: Destination) => void;
}

export interface OnwardsDetailsModalState {
  isOpen: boolean;
  title: string;
  isFlight: boolean;
  departureDateTime: Dayjs | null;
  arrivalDateTime: Dayjs | null;
  departureLocation: string;
  arrivalLocation: string;
  flightNumber: string;
  referenceDate: Dayjs | null;
  departureAutocomplete: ReturnType<typeof useAirportAutocomplete>;
  arrivalAutocomplete: ReturnType<typeof useAirportAutocomplete>;
  open: () => void;
  close: () => void;
  setDepartureDateTime: (value: Dayjs | null) => void;
  setArrivalDateTime: (value: Dayjs | null) => void;
  setDepartureLocation: (value: string) => void;
  setArrivalLocation: (value: string) => void;
  setFlightNumber: (value: string) => void;
  save: () => void;
  clear: () => void;
}

const getTransportDetailsModalTitle = (transport?: string | null): string => {
  if (!transport) return "Transport Details";
  if (transport === "by plane") return "Flight Details";
  if (transport === "by bus") return "Bus Details";
  if (transport === "by train") return "Train Details";
  if (transport === "by boat") return "Voyage Details";
  return "Transport Details";
};

export const useOnwardsDetailsModal = ({
  destination,
  transportMode,
  isFlight,
  onDestinationChange,
}: UseOnwardsDetailsModalConfig): OnwardsDetailsModalState => {
  const [isOpen, setIsOpen] = useState(false);
  const [departureDateTime, setDepartureDateTime] = useState<Dayjs | null>(null);
  const [arrivalDateTime, setArrivalDateTime] = useState<Dayjs | null>(null);

  const departureAutocomplete = useAirportAutocomplete(isFlight);
  const arrivalAutocomplete = useAirportAutocomplete(isFlight);

  const [flightNumber, setFlightNumber] = useState("");

  const referenceDate = destination.departureDate ?? destination.arrivalDate ?? null;

  const open = (): void => {
    const details = destination.transportDetails;

    try {
      if (details?.departureDateTime) {
        const parsed = details.departureDateTime;
        setDepartureDateTime(getSafeDayjsValue(parsed));
      } else {
        let defaultDepartureDate: Dayjs | null = null;

        if (destination.departureDate) {
          defaultDepartureDate = destination.departureDate.startOf("day").hour(12).minute(0);
        } else if (destination.arrivalDate && typeof destination.nights === "number") {
          defaultDepartureDate = destination.arrivalDate
            .add(destination.nights, "day")
            .startOf("day")
            .hour(12)
            .minute(0);
        }

        setDepartureDateTime(defaultDepartureDate);
      }

      if (details?.arrivalDateTime) {
        const parsed = details.arrivalDateTime;
        setArrivalDateTime(getSafeDayjsValue(parsed));
      } else {
        setArrivalDateTime(null);
      }
    } catch {
      setDepartureDateTime(null);
      setArrivalDateTime(null);
    }

    departureAutocomplete.setValue(details?.departureLocation || "");
    arrivalAutocomplete.setValue(details?.arrivalLocation || "");
    setFlightNumber(details?.flightNumber || "");
    setIsOpen(true);
  };

  const close = (): void => {
    setIsOpen(false);
    setDepartureDateTime(null);
    setArrivalDateTime(null);
    departureAutocomplete.setValue("");
    arrivalAutocomplete.setValue("");
    setFlightNumber("");
  };

  const save = (): void => {
    onDestinationChange({
      ...destination,
      transportDetails: {
        mode: destination.transportDetails?.mode ?? "unsure",
        departureDateTime,
        arrivalDateTime,
        departureLocation: departureAutocomplete.value || undefined,
        arrivalLocation: arrivalAutocomplete.value || undefined,
        flightNumber: flightNumber || undefined,
      },
    });
    setIsOpen(false);
  };

  const clear = (): void => {
    onDestinationChange({
      ...destination,
      transportDetails: undefined,
    });
    setIsOpen(false);
  };

  return {
    isOpen,
    title: getTransportDetailsModalTitle(transportMode),
    isFlight,
    departureDateTime,
    arrivalDateTime,
    departureLocation: departureAutocomplete.value,
    arrivalLocation: arrivalAutocomplete.value,
    flightNumber,
    referenceDate,
    departureAutocomplete,
    arrivalAutocomplete,
    open,
    close,
    setDepartureDateTime,
    setArrivalDateTime,
    setDepartureLocation: departureAutocomplete.setValue,
    setArrivalLocation: arrivalAutocomplete.setValue,
    setFlightNumber,
    save,
    clear,
  };
};

