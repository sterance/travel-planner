import { type ReactElement, useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import { useTripContext } from "../hooks/useTripContext";
import { transformTripToCalendarEvents } from "../utils/calendarTransform";
import { Calendar } from "../components/Calendar";
import type { Trip } from "../types/trip";

interface CalendarPageProps {
  trip?: Trip | null;
  onUpdateTrip?: (trip: Trip) => void;
}

export const CalendarPage = ({ trip: tripProp, onUpdateTrip: _onUpdateTrip }: CalendarPageProps): ReactElement => {
  const { currentTrip, tripsLoading } = useTripContext();
  const trip = tripProp ?? currentTrip;

  const events = useMemo(() => transformTripToCalendarEvents(trip), [trip]);
  const initialDate = trip?.startDate?.isValid() ? trip.startDate.format("YYYY-MM-DD") : null;

  if (tripsLoading) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  if (!trip) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="body1" color="text.secondary">
          No trip selected
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1, my: 2 }}>
      <Calendar events={events} initialDate={initialDate} />
    </Box>
  );
};
