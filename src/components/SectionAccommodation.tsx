import { useState, type ReactElement } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import { buildAccommodationLinks, type TransportLink } from "../utils/externalLinks";
import { type Destination } from "../types/destination";
import { ButtonGrid } from "./utility/ButtonGrid";
import { SectionCard } from "./utility/SectionCard";
import { LinkButton } from "./utility/LinkButton";
import { StatusBadge } from "./utility/StatusBadge";
import { DetailsModal } from "./utility/DetailsModal";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { type Dayjs } from "dayjs";
import { formatDateTime } from "../utils/dateUtils";

const getSafeDayjsValue = (value: Dayjs | null): Dayjs | null => {
  if (!value) return null;
  return value.isValid() ? value : null;
};

interface SectionAccommodationProps {
  destination: Destination;
  onDestinationChange: (destination: Destination) => void;
  arrivalDate?: Dayjs | null;
}

const renderTransportLinks = (links: TransportLink[]): ReactElement | null => {
  if (links.length === 0) {
    return null;
  }

  if (links.length === 1) {
    const link = links[0];
    return (
      <LinkButton site={link.icon ?? ""} url={link.url}>
        {link.label}
      </LinkButton>
    );
  }

  return (
    <ButtonGrid columns={2}>
      {links.map((link) => (
        <LinkButton key={link.label} site={link.icon ?? ""} url={link.url}>
          {link.label}
        </LinkButton>
      ))}
    </ButtonGrid>
  );
};

export const SectionAccommodation = ({ destination, onDestinationChange, arrivalDate }: SectionAccommodationProps): ReactElement => {
  const [accommodationModalOpen, setAccommodationModalOpen] = useState(false);
  const [editingAccommodationIndex, setEditingAccommodationIndex] = useState<number | null>(null);
  const [accommodationName, setAccommodationName] = useState("");
  const [accommodationAddress, setAccommodationAddress] = useState("");
  const [accommodationCheckIn, setAccommodationCheckIn] = useState<Dayjs | null>(null);
  const [accommodationCheckOut, setAccommodationCheckOut] = useState<Dayjs | null>(null);

  const links = buildAccommodationLinks(destination);

  const accommodations = destination.accommodations ?? [];

  const destinationCheckOut = destination.departureDate ?? null;

  const latestAccommodationCheckOut = accommodations.reduce<dayjs.Dayjs | null>((latest, accommodation) => {
    if (!accommodation.checkOutDateTime) {
      return latest;
    }
    const checkOut = accommodation.checkOutDateTime;
    if (!latest || checkOut.isAfter(latest)) {
      return checkOut;
    }
    return latest;
  }, null);

  const hasCoverageToDestinationEnd = destinationCheckOut !== null && latestAccommodationCheckOut !== null && latestAccommodationCheckOut.isSame(destinationCheckOut, "day");

  const hasCoveragePastDestinationEnd = destinationCheckOut !== null && latestAccommodationCheckOut !== null && latestAccommodationCheckOut.isAfter(destinationCheckOut, "day");

  const showAddAccommodationButton = !hasCoverageToDestinationEnd;

  const handleAccommodationModalOpen = (index?: number): void => {
    if (index !== undefined && index !== null && accommodations[index]) {
      const accommodation = accommodations[index];
      setEditingAccommodationIndex(index);
      setAccommodationName(accommodation.name ?? "");
      setAccommodationAddress(accommodation.address ?? "");
      
      const checkIn = accommodation.checkInDateTime ?? null;
      setAccommodationCheckIn(checkIn && checkIn.isValid() ? checkIn : null);
      
      const checkOut = accommodation.checkOutDateTime ?? null;
      setAccommodationCheckOut(checkOut && checkOut.isValid() ? checkOut : null);
    } else {
      setEditingAccommodationIndex(null);
      setAccommodationName("");
      setAccommodationAddress("");
      setAccommodationCheckIn(null);
      setAccommodationCheckOut(null);
    }

    setAccommodationModalOpen(true);
  };

  const handleAccommodationModalClose = (): void => {
    setAccommodationModalOpen(false);
  };

  const handleAccommodationSave = (): void => {
    const accommodations = destination.accommodations ? [...destination.accommodations] : [];

    const existing = editingAccommodationIndex !== null ? accommodations[editingAccommodationIndex] : undefined;

    const updated = {
      id: existing?.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: accommodationName || undefined,
      address: accommodationAddress || undefined,
      checkInDateTime: accommodationCheckIn,
      checkOutDateTime: accommodationCheckOut,
    };

    if (editingAccommodationIndex !== null && accommodations[editingAccommodationIndex]) {
      accommodations[editingAccommodationIndex] = updated;
    } else {
      accommodations.push(updated);
    }

    onDestinationChange({
      ...destination,
      accommodations,
    });

    setAccommodationModalOpen(false);
  };

  const handleAccommodationClear = (): void => {
    if (!destination.accommodations || editingAccommodationIndex === null) {
      setAccommodationModalOpen(false);
      return;
    }

    const accommodations = destination.accommodations.filter((_, index) => index !== editingAccommodationIndex);

    onDestinationChange({
      ...destination,
      accommodations,
    });

    setAccommodationModalOpen(false);
  };

  return (
    <>
      <SectionCard title="Accommodation">
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {links.length > 0 ? renderTransportLinks(links) : "link to hotel booking"}
          {hasCoveragePastDestinationEnd && destinationCheckOut && latestAccommodationCheckOut && (
            <StatusBadge variant="warning" visible attachToText>
              <Typography variant="caption" color="text.secondary">
                accommodation checkout ({latestAccommodationCheckOut.format("MMM D, YYYY")}) is after destination end ({destinationCheckOut.format("MMM D, YYYY")})
              </Typography>
            </StatusBadge>
          )}
          {accommodations.map((accommodation, index) => (
            <Box
              key={accommodation.id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
                gap: 1,
              }}
            >
              <Box sx={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
                <Typography variant="body1" noWrap>
                  {accommodation.name || "Accommodation"}
                </Typography>
                {accommodation.address && (
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {accommodation.address}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  {formatDateTime(accommodation.checkInDateTime) || "No check in"} – {formatDateTime(accommodation.checkOutDateTime) || "No check out"}
                </Typography>
              </Box>
              <Button variant="outlined" size="small" startIcon={<EditIcon />} onClick={() => handleAccommodationModalOpen(index)}>
                edit
              </Button>
            </Box>
          ))}
          {showAddAccommodationButton && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleAccommodationModalOpen()} fullWidth>
              add accommodation
            </Button>
          )}
        </Box>
      </SectionCard>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DetailsModal open={accommodationModalOpen} onClose={handleAccommodationModalClose} title="Accommodation Details" onSave={handleAccommodationSave} onClear={handleAccommodationClear} hasDetails={editingAccommodationIndex !== null} saveLabel="Save" cancelLabel="Cancel" clearLabel="Remove">
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField label="Name" value={accommodationName} onChange={(e) => setAccommodationName(e.target.value)} fullWidth variant="outlined" />
            <TextField label="Address" value={accommodationAddress} onChange={(e) => setAccommodationAddress(e.target.value)} fullWidth variant="outlined" />
            <DateTimePicker
              label="Check-in date & time"
              value={getSafeDayjsValue(accommodationCheckIn)}
              onChange={(newValue) => setAccommodationCheckIn(getSafeDayjsValue(newValue))}
              referenceDate={arrivalDate ?? undefined}
              slotProps={{
                textField: {
                  fullWidth: true,
                  variant: "outlined",
                },
              }}
            />
            <DateTimePicker
              label="Check-out date & time"
              value={getSafeDayjsValue(accommodationCheckOut)}
              onChange={(newValue) => setAccommodationCheckOut(getSafeDayjsValue(newValue))}
              referenceDate={arrivalDate ?? undefined}
              slotProps={{
                textField: {
                  fullWidth: true,
                  variant: "outlined",
                },
              }}
            />
            <Button variant="outlined" fullWidth disabled>
              add from confirmation email{" "}
            </Button>
          </Box>
        </DetailsModal>
      </LocalizationProvider>
    </>
  );
};
