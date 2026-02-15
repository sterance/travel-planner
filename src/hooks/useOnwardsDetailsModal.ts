import { useState } from "react";
import type { Dayjs } from "dayjs";
import type { Destination } from "../types/destination";
import { getSafeDayjsValue } from "../utils/dateUtils";
import { SCHEDULED_TRANSPORT_MODES } from "../utils/transportConfig";
import { useAirportAutocomplete } from "./useAirportAutocomplete";

interface UseOnwardsDetailsModalConfig {
  destination: Destination;
  transportMode?: string | null;
  onDestinationChange: (destination: Destination) => void;
}

export interface OnwardsDetailsModalState {
  isOpen: boolean;
  title: string;
  isScheduledTransport: boolean;
  bookingNumberLabel: string;
  departureDateTime: Dayjs | null;
  arrivalDateTime: Dayjs | null;
  departureLocation: string;
  arrivalLocation: string;
  bookingNumber: string;
  referenceDate: Dayjs | null;
  departureAutocomplete: ReturnType<typeof useAirportAutocomplete>;
  arrivalAutocomplete: ReturnType<typeof useAirportAutocomplete>;
  open: () => void;
  close: () => void;
  setDepartureDateTime: (value: Dayjs | null) => void;
  setArrivalDateTime: (value: Dayjs | null) => void;
  setDepartureLocation: (value: string) => void;
  setArrivalLocation: (value: string) => void;
  setBookingNumber: (value: string) => void;
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

const getBookingNumberLabel = (transport?: string | null): string => {
  if (!transport) return "";
  if (transport === "by plane") return "Flight Number";
  if (transport === "by bus") return "Bus Number";
  if (transport === "by train") return "Train Number";
  if (transport === "by boat") return "Voyage Number";
  return "";
};

export const useOnwardsDetailsModal = ({
  destination,
  transportMode,
  onDestinationChange,
}: UseOnwardsDetailsModalConfig): OnwardsDetailsModalState => {
  const isFlight = transportMode === "by plane";
  const isScheduledTransport =
    !!transportMode && (SCHEDULED_TRANSPORT_MODES as readonly string[]).includes(transportMode);

  const [isOpen, setIsOpen] = useState(false);
  const [departureDateTime, setDepartureDateTime] = useState<Dayjs | null>(null);
  const [arrivalDateTime, setArrivalDateTime] = useState<Dayjs | null>(null);

  const departureAutocomplete = useAirportAutocomplete(isFlight);
  const arrivalAutocomplete = useAirportAutocomplete(isFlight);

  const [bookingNumber, setBookingNumber] = useState("");

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
    setBookingNumber(details?.bookingNumber || "");
    setIsOpen(true);
  };

  const close = (): void => {
    setIsOpen(false);
    setDepartureDateTime(null);
    setArrivalDateTime(null);
    departureAutocomplete.setValue("");
    arrivalAutocomplete.setValue("");
    setBookingNumber("");
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
        bookingNumber: bookingNumber || undefined,
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
    isScheduledTransport,
    bookingNumberLabel: getBookingNumberLabel(transportMode),
    departureDateTime,
    arrivalDateTime,
    departureLocation: departureAutocomplete.value,
    arrivalLocation: arrivalAutocomplete.value,
    bookingNumber,
    referenceDate,
    departureAutocomplete,
    arrivalAutocomplete,
    open,
    close,
    setDepartureDateTime,
    setArrivalDateTime,
    setDepartureLocation: departureAutocomplete.setValue,
    setArrivalLocation: arrivalAutocomplete.setValue,
    setBookingNumber,
    save,
    clear,
  };
};

