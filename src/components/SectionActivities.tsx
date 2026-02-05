import { useState, type ReactElement } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import { ButtonGrid } from "./utility/ButtonGrid";
import { SectionCard } from "./utility/SectionCard";
import { type Destination } from "../types/destination";
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

interface SectionActivitiesProps {
  destination: Destination;
  onDestinationChange: (destination: Destination) => void;
  arrivalDate?: Dayjs | null;
}

export const SectionActivities = ({ destination, onDestinationChange, arrivalDate }: SectionActivitiesProps): ReactElement => {
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [editingActivityIndex, setEditingActivityIndex] = useState<number | null>(null);
  const [activityName, setActivityName] = useState("");
  const [activityAddress, setActivityAddress] = useState("");
  const [activityStart, setActivityStart] = useState<Dayjs | null>(null);
  const [activityEnd, setActivityEnd] = useState<Dayjs | null>(null);

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

  const latestActivityEnd = activities.reduce<dayjs.Dayjs | null>((latest, activity) => {
    if (!activity.endDateTime) {
      return latest;
    }
    const end = dayjs(activity.endDateTime);
    if (!latest || end.isAfter(latest)) {
      return end;
    }
    return latest;
  }, null);

  const hasCoverageToDestinationEnd = destinationCheckOut !== null && latestActivityEnd !== null && latestActivityEnd.isSame(destinationCheckOut, "day");

  const hasCoveragePastDestinationEnd = destinationCheckOut !== null && latestActivityEnd !== null && latestActivityEnd.isAfter(destinationCheckOut, "day");

  const showAddActivityButton = !hasCoverageToDestinationEnd;

  const handleActivityModalOpen = (index?: number): void => {
    if (index !== undefined && index !== null && activities[index]) {
      const activity = activities[index];
      setEditingActivityIndex(index);
      setActivityName(activity.name ?? "");
      setActivityAddress(activity.address ?? "");
      try {
        const start = activity.startDateTime ? dayjs(activity.startDateTime) : null;
        setActivityStart(start && start.isValid() ? start : null);
        const end = activity.endDateTime ? dayjs(activity.endDateTime) : null;
        setActivityEnd(end && end.isValid() ? end : null);
      } catch (error) {
        setActivityStart(null);
        setActivityEnd(null);
      }
    } else {
      setEditingActivityIndex(null);
      setActivityName("");
      setActivityAddress("");
      setActivityStart(null);
      setActivityEnd(null);
    }

    setActivityModalOpen(true);
  };

  const handleActivityModalClose = (): void => {
    setActivityModalOpen(false);
  };

  const handleActivitySave = (): void => {
    const activities = destination.activities ? [...destination.activities] : [];

    const existing = editingActivityIndex !== null ? activities[editingActivityIndex] : undefined;

    const updated = {
      id: existing?.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: activityName || undefined,
      address: activityAddress || undefined,
      startDateTime: activityStart?.toISOString(),
      endDateTime: activityEnd?.toISOString(),
    };

    if (editingActivityIndex !== null && activities[editingActivityIndex]) {
      activities[editingActivityIndex] = updated;
    } else {
      activities.push(updated);
    }

    onDestinationChange({
      ...destination,
      activities,
    });

    setActivityModalOpen(false);
  };

  const handleActivityClear = (): void => {
    if (!destination.activities || editingActivityIndex === null) {
      setActivityModalOpen(false);
      return;
    }

    const activities = destination.activities.filter((_, index) => index !== editingActivityIndex);

    onDestinationChange({
      ...destination,
      activities,
    });

    setActivityModalOpen(false);
  };

  return (
    <>
      <SectionCard title="Activities">
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Box sx={{ mt: 1 }}>
            {activityButtons.length % 2 === 0 ? (
              <ButtonGrid columns={2}>
                {activityButtons.map((button) => (
                  <LinkButton key={button.label} site={button.site} url={button.url}>
                    {button.label}
                  </LinkButton>
                ))}
              </ButtonGrid>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {activityButtons.map((button) => (
                  <LinkButton key={button.label} site={button.site} url={button.url}>
                    {button.label}
                  </LinkButton>
                ))}
              </Box>
            )}
          </Box>
          {hasCoveragePastDestinationEnd && destinationCheckOut && latestActivityEnd && (
            <StatusBadge variant="warning" visible attachToText>
              <Typography variant="caption" color="text.secondary">
                activity end ({latestActivityEnd.format("MMM D, YYYY")}) is after destination end ({destinationCheckOut.format("MMM D, YYYY")})
              </Typography>
            </StatusBadge>
          )}
          {activities.map((activity, index) => (
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
              <Button variant="outlined" size="small" startIcon={<EditIcon />} onClick={() => handleActivityModalOpen(index)}>
                edit
              </Button>
            </Box>
          ))}
          {showAddActivityButton && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleActivityModalOpen()} fullWidth>
              add activities
            </Button>
          )}
        </Box>
      </SectionCard>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DetailsModal open={activityModalOpen} onClose={handleActivityModalClose} title="Activity Details" onSave={handleActivitySave} onClear={handleActivityClear} hasDetails={editingActivityIndex !== null} saveLabel="Save" cancelLabel="Cancel" clearLabel="Remove">
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField label="Name" value={activityName} onChange={(e) => setActivityName(e.target.value)} fullWidth variant="outlined" />
            <TextField label="Address" value={activityAddress} onChange={(e) => setActivityAddress(e.target.value)} fullWidth variant="outlined" />
            <DateTimePicker
              label="Start date & time"
              value={getSafeDayjsValue(activityStart)}
              onChange={(newValue) => setActivityStart(getSafeDayjsValue(newValue))}
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
              value={getSafeDayjsValue(activityEnd)}
              onChange={(newValue) => setActivityEnd(getSafeDayjsValue(newValue))}
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
