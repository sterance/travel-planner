import { type ReactElement } from "react";
import Box from "@mui/material/Box";
import { ArrivalWeather } from "./ArrivalWeather";
import { SectionCard } from "./utility/SectionCard";
import { ExternalLinksGrid } from "./utility/ExternalLinksGrid";
import { type Destination } from "../types/destination";
import { type Dayjs } from "dayjs";

interface SectionArrivalProps {
  destination: Destination;
  previousDestination?: Destination;
  arrivalDate: Dayjs | null;
  onArrivalTimeChange: (dateTime: Dayjs | null) => void;
  arrivalWeatherBackgroundMode?: "default" | "light" | "dark";
}

export const SectionArrival = ({
  destination,
  previousDestination,
  arrivalDate,
  onArrivalTimeChange,
  arrivalWeatherBackgroundMode = "default",
}: SectionArrivalProps): ReactElement => {
  const arrivalButtons = [
    {
      label: "Uber",
      url: destination.placeDetails?.coordinates
        ? `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[formatted_address]=${encodeURIComponent(destination.displayName || destination.name)}&dropoff[latitude]=${destination.placeDetails.coordinates[1]}&dropoff[longitude]=${destination.placeDetails.coordinates[0]}`
        : `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[formatted_address]=${encodeURIComponent(destination.displayName || destination.name)}`,
      site: "uber" as const,
    },
    {
      label: "Taxi",
      url: destination.placeDetails?.coordinates
        ? `https://www.google.com/maps/dir/?api=1&destination=${destination.placeDetails.coordinates[1]},${destination.placeDetails.coordinates[0]}&travelmode=driving`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination.displayName || destination.name)}`,
      site: "taxi" as const,
    },
  ];

  return (
    <SectionCard title="Arrival">
      <ArrivalWeather
        destination={destination}
        previousDestination={previousDestination}
        arrivalDate={arrivalDate}
        onArrivalTimeChange={onArrivalTimeChange}
        backgroundMode={arrivalWeatherBackgroundMode}
      />
      <Box sx={{ mt: 1 }}>
        <ExternalLinksGrid links={arrivalButtons} />
      </Box>
    </SectionCard>
  );
};
