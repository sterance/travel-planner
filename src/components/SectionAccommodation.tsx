import { type ReactElement } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import { buildAccommodationLinks } from "../utils/externalLinks";
import { type Destination, type AccommodationDetails } from "../types/destination";
import { SectionCard } from "./utility/SectionCard";
import { StatusBadge } from "./utility/StatusBadge";
import { DetailsModal } from "./utility/DetailsModal";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import type { Dayjs } from "dayjs";
import { formatDateTime, getSafeDayjsValue } from "../utils/dateUtils";
import { ExternalLinksGrid } from "./utility/ExternalLinksGrid";
import { useSectionItemList } from "../hooks/useSectionItemList";

interface SectionAccommodationProps {
  destination: Destination;
  onDestinationChange: (destination: Destination) => void;
  arrivalDate?: Dayjs | null;
}

export const SectionAccommodation = ({ destination, onDestinationChange, arrivalDate }: SectionAccommodationProps): ReactElement => {
  const links = buildAccommodationLinks(destination);

  const accommodations = destination.accommodations ?? [];

  const {
    isModalOpen,
    editingIndex,
    name,
    address,
    startDateTime,
    endDateTime,
    latestEndDate,
    hasCoveragePastDestinationEnd,
    showAddButton,
    openForNew,
    openForEdit,
    closeModal,
    saveCurrent,
    clearCurrent,
    setName,
    setAddress,
    setStartDateTime,
    setEndDateTime,
  } = useSectionItemList<AccommodationDetails>({
    items: accommodations,
    onItemsChange: (updated) => {
      onDestinationChange({
        ...destination,
        accommodations: updated,
      });
    },
    destinationEndDate: destination.departureDate ?? null,
    getStartDateTime: (item) => item.checkInDateTime ?? null,
    getEndDateTime: (item) => item.checkOutDateTime ?? null,
    createOrUpdateItem: (existing, fields) => ({
      id: existing?.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: fields.name || undefined,
      address: fields.address || undefined,
      checkInDateTime: fields.startDateTime,
      checkOutDateTime: fields.endDateTime,
    }),
  });

  const destinationCheckOut = destination.departureDate ?? null;

  return (
    <>
      <SectionCard title="Accommodation">
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
            "link to hotel booking"
          )}
          {hasCoveragePastDestinationEnd && destinationCheckOut && latestEndDate && (
            <StatusBadge variant="warning" visible attachToText>
              <Typography variant="caption" color="text.secondary">
                accommodation checkout ({latestEndDate.format("MMM D, YYYY")}) is after destination end ({destinationCheckOut.format("MMM D, YYYY")})
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
              <Button variant="outlined" size="small" startIcon={<EditIcon />} onClick={() => openForEdit(index)}>
                edit
              </Button>
            </Box>
          ))}
          {showAddButton && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={openForNew} fullWidth>
              add accommodation
            </Button>
          )}
        </Box>
      </SectionCard>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DetailsModal
          open={isModalOpen}
          onClose={closeModal}
          title="Accommodation Details"
          onSave={saveCurrent}
          onClear={clearCurrent}
          hasDetails={editingIndex !== null}
          saveLabel="Save"
          cancelLabel="Cancel"
          clearLabel="Remove"
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth variant="outlined" />
            <TextField label="Address" value={address} onChange={(e) => setAddress(e.target.value)} fullWidth variant="outlined" />
            <DateTimePicker
              label="Check-in date & time"
              value={getSafeDayjsValue(startDateTime)}
              onChange={(newValue) => setStartDateTime(getSafeDayjsValue(newValue))}
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
              value={getSafeDayjsValue(endDateTime)}
              onChange={(newValue) => setEndDateTime(getSafeDayjsValue(newValue))}
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
