import type { ReactElement } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import { type Dayjs } from "dayjs";
import { getTransportLinks } from "../utils/externalLinks";
import { SectionCard } from "./utility/SectionCard";
import { type Destination } from "../types/destination";
import { formatDateTime } from "../utils/dateUtils";
import { ExternalLinksGrid } from "./utility/ExternalLinksGrid";
import { SELF_TRANSPORT_MODES } from "../utils/transportConfig";
import { useOnwardsDetailsModal } from "../hooks/useOnwardsDetailsModal";
import { OnwardsDetailsModal } from "./OnwardsDetailsModal";

interface SectionOnwardsProps {
  destination: Destination;
  nextDestination?: Destination;
  onDestinationChange: (destination: Destination) => void;
  departureDate?: Dayjs | null;
}

const getTransportLabel = (transport: string): string => {
  switch (transport) {
    case "by plane":
      return "flight";
    case "by bus":
      return "bus";
    case "by train":
      return "train";
    case "by boat":
      return "voyage";
    default:
      return "details";
  }
};

const extractIataCode = (location: string | undefined): string => {
  if (!location) return "";
  const match = location.match(/^([A-Z]{3})\s*\(/);
  if (match) {
    return match[1];
  }
  const threeLetterMatch = location.match(/^([A-Z]{3})\b/);
  if (threeLetterMatch) {
    return threeLetterMatch[1];
  }
  return location;
};

const formatLocationDisplay = (location: string | undefined, transport?: string | null): string => {
  if (!location) return "";
  if (transport === "by plane") {
    return extractIataCode(location);
  }
  return location;
};

export const SectionOnwards = ({ destination, nextDestination, onDestinationChange }: SectionOnwardsProps): ReactElement => {
  if (!nextDestination) {
    return <></>;
  }

  const nextMode = nextDestination.transportDetails?.mode;

  if (!nextMode) {
    return (
      <SectionCard title="Onwards">
        <Typography variant="body2" color="text.secondary">
          Add a travel method for the next destination to see booking links.
        </Typography>
      </SectionCard>
    );
  }

  const isFlight = nextMode === "by plane";

  const modalState = useOnwardsDetailsModal({
    destination,
    transportMode: nextMode,
    isFlight,
    onDestinationChange,
  });

  const hasBookedDetails =
    !SELF_TRANSPORT_MODES.includes(nextMode as (typeof SELF_TRANSPORT_MODES)[number]) &&
    !!destination.transportDetails?.departureDateTime &&
    !!destination.transportDetails?.arrivalDateTime;

  if (hasBookedDetails && destination.transportDetails) {
    const onwardsButtons = [
      {
        label: "Uber",
        site: "uber",
        url: nextDestination.placeDetails?.coordinates ? `https://m.uber.com/ul/?action=setPickup&pickup[formatted_address]=${encodeURIComponent(destination.transportDetails.departureLocation || "")}&dropoff[formatted_address]=${encodeURIComponent(nextDestination.displayName || nextDestination.name)}&dropoff[latitude]=${nextDestination.placeDetails.coordinates[1]}&dropoff[longitude]=${nextDestination.placeDetails.coordinates[0]}` : `https://m.uber.com/ul/?action=setPickup&pickup[formatted_address]=${encodeURIComponent(destination.transportDetails.departureLocation || "")}&dropoff[formatted_address]=${encodeURIComponent(nextDestination.displayName || nextDestination.name)}`,
      },
      {
        label: "Taxi",
        site: "taxi",
        url: nextDestination.placeDetails?.coordinates ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(destination.transportDetails.departureLocation || "")}&destination=${nextDestination.placeDetails.coordinates[1]},${nextDestination.placeDetails.coordinates[0]}&travelmode=driving` : `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(destination.transportDetails.departureLocation || "")}&destination=${encodeURIComponent(nextDestination.displayName || nextDestination.name)}&travelmode=driving`,
      },
    ];

    return (
      <>
        <SectionCard title="Onwards">
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
              <Typography variant="body1" component="span">
                {formatLocationDisplay(destination.transportDetails.departureLocation, nextMode) || "Origin"}
              </Typography>
              <Typography variant="body1" component="span">
                →
              </Typography>
              <Typography variant="body1" component="span">
                {formatLocationDisplay(destination.transportDetails.arrivalLocation, nextMode) || "Destination"}
              </Typography>
            </Box>
            <Button variant="outlined" size="small" startIcon={<EditIcon />} onClick={modalState.open}>
              Edit
            </Button>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {formatDateTime(destination.transportDetails.departureDateTime) || "No departure time"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatDateTime(destination.transportDetails.arrivalDateTime) || "No arrival time"}
            </Typography>
          </Box>
          {destination.transportDetails.departureLocation && (
            <Box sx={{ mt: 1 }}>
              <ExternalLinksGrid links={onwardsButtons} />
            </Box>
          )}
        </SectionCard>
        <OnwardsDetailsModal state={modalState} />
      </>
    );
  }

  const links = getTransportLinks(destination, nextDestination, nextMode || "", undefined);

  return (
    <>
      <SectionCard title="Onwards">
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {links.length > 0 ? (
            <ExternalLinksGrid
              links={links.map((link) => ({
                label: link.label,
                url: link.url,
                site: link.icon ?? "",
              }))}
            />
          ) : (
            "link to transport booking"
          )}
          {!SELF_TRANSPORT_MODES.includes((nextMode || "") as (typeof SELF_TRANSPORT_MODES)[number]) && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={modalState.open} fullWidth>
              Add {getTransportLabel(nextMode || "")} details
            </Button>
          )}
        </Box>
      </SectionCard>
      <OnwardsDetailsModal state={modalState} />
      </>
    );
  }
