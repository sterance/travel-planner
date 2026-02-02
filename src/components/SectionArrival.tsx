import { type ReactElement } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import LocalTaxiIcon from "@mui/icons-material/LocalTaxi";
import { ArrivalWeather } from "./ArrivalWeather";
import { ButtonGrid } from "./utility/ButtonGrid";
import { SectionCard } from "./utility/SectionCard";
import { type Destination } from "../types/destination";
import { type Dayjs } from "dayjs";
import uberIcon from "../assets/icons/uber.svg";

interface SectionArrivalProps {
  destination: Destination;
  previousDestination?: Destination;
  arrivalDate: Dayjs | null;
  onArrivalTimeChange: (dateTime: string | null) => void;
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
      icon: (
        <Box
          component="img"
          src={uberIcon}
          alt=""
          sx={{
            height: "1.25rem",
            width: "auto",
            maxWidth: "100%",
            objectFit: "contain",
          }}
        />
      ),
    },
    {
      label: "Taxi",
      url: destination.placeDetails?.coordinates
        ? `https://www.google.com/maps/dir/?api=1&destination=${destination.placeDetails.coordinates[1]},${destination.placeDetails.coordinates[0]}&travelmode=driving`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination.displayName || destination.name)}`,
      icon: <LocalTaxiIcon />,
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
        {arrivalButtons.length % 2 === 0 ? (
          <ButtonGrid columns={2}>
            {arrivalButtons.map((button) => (
              <Button
                key={button.label}
                variant="outlined"
                fullWidth
                onClick={() => {
                  window.open(button.url, "_blank", "noopener,noreferrer");
                }}
                sx={{
                  bgcolor: "white",
                  color: "black !important",
                  borderColor: "divider",
                  "&:hover": {
                    bgcolor: "grey.50",
                    borderColor: "divider",
                    color: "black !important",
                  },
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                {button.icon}
                {button.label}
              </Button>
            ))}
          </ButtonGrid>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {arrivalButtons.map((button) => (
              <Button
                key={button.label}
                variant="outlined"
                fullWidth
                onClick={() => {
                  window.open(button.url, "_blank", "noopener,noreferrer");
                }}
                sx={{
                  bgcolor: "white",
                  color: "black !important",
                  borderColor: "divider",
                  "&:hover": {
                    bgcolor: "grey.50",
                    borderColor: "divider",
                    color: "black !important",
                  },
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                {button.icon}
                {button.label}
              </Button>
            ))}
          </Box>
        )}
      </Box>
    </SectionCard>
  );
};
