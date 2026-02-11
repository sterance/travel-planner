import { type ReactElement } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import { SectionCard } from "./utility/SectionCard";
import { StatusBadge } from "./utility/StatusBadge";
import { DetailsModal } from "./utility/DetailsModal";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import type { Dayjs } from "dayjs";
import { type Destination, type ActivityDetails } from "../types/destination";
import { formatDateTime, getSafeDayjsValue } from "../utils/dateUtils";
import { ExternalLinksGrid } from "./utility/ExternalLinksGrid";
import { useSectionItemList } from "../hooks/useSectionItemList";

interface SectionActivitiesProps {
  destination: Destination;
  onDestinationChange: (destination: Destination) => void;
  arrivalDate?: Dayjs | null;
}

export const SectionActivities = ({ destination, onDestinationChange, arrivalDate }: SectionActivitiesProps): ReactElement => {
  const activityButtons = [
    {
      label: "TripAdvisor",
      url: `https://www.tripadvisor.com/Search?q=${encodeURIComponent(destination.displayName || destination.name)}`,
      site: "tripadvisor",
    },
    {
      label: "GetYourGuide",
      url: `https://www.getyourguide.com/s/?q=${encodeURIComponent(destination.displayName || destination.name)}`,
      site: "getyourguide",
    },
  ];

  const activities = destination.activities ?? [];

  const destinationCheckOut = destination.departureDate ?? null;

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
  } = useSectionItemList<ActivityDetails>({
    items: activities,
    onItemsChange: (updated) => {
      onDestinationChange({
        ...destination,
        activities: updated,
      });
    },
    destinationEndDate: destination.departureDate ?? null,
    getStartDateTime: (item) => item.startDateTime ?? null,
    getEndDateTime: (item) => item.endDateTime ?? null,
    createOrUpdateItem: (existing, fields) => ({
      id: existing?.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: fields.name || undefined,
      address: fields.address || undefined,
      startDateTime: fields.startDateTime,
      endDateTime: fields.endDateTime,
    }),
  });

  return (
    <>
      <SectionCard title="Activities">
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Box sx={{ mt: 1 }}>
            <ExternalLinksGrid links={activityButtons} />
          </Box>
          {hasCoveragePastDestinationEnd && destinationCheckOut && latestEndDate && (
            <StatusBadge variant="warning" visible attachToText>
              <Typography variant="caption" color="text.secondary">
                activity end ({latestEndDate.format("MMM D, YYYY")}) is after destination end ({destinationCheckOut.format("MMM D, YYYY")})
              </Typography>
            </StatusBadge>
          )}
          {activities.map((activity: ActivityDetails, index: number) => (
            <Box
              key={activity.id}
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
                  {activity.name || "Activity"}
                </Typography>
                {activity.address && (
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {activity.address}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  {formatDateTime(activity.startDateTime) || "No start"} – {formatDateTime(activity.endDateTime) || "No end"}
                </Typography>
              </Box>
              <Button variant="outlined" size="small" startIcon={<EditIcon />} onClick={() => openForEdit(index)}>
                edit
              </Button>
            </Box>
          ))}
          {showAddButton && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={openForNew} fullWidth>
              add activities
            </Button>
          )}
        </Box>
      </SectionCard>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DetailsModal
          open={isModalOpen}
          onClose={closeModal}
          title="Activity Details"
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
              label="Start date & time"
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
              label="End date & time"
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
