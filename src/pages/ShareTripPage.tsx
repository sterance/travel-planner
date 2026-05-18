import { useCallback, useEffect, useState, type ReactElement } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import dayjs from "dayjs";
import { type Trip } from "../types/trip";
import { type ViewMode, type LayoutMode, type ArrivalWeatherBackgroundMode } from "../App";
import { TripView } from "./TripPage";
import { getSharedTrip, updateSharedTrip } from "../services/sharedTripsApi";
import { calculateTripEndDate, computeDestinationTimeline } from "../utils/dateCalculation";

interface OutletContext {
  viewMode: ViewMode;
  layoutMode: LayoutMode;
  columns: number;
  setColumns: (value: number) => void;
  arrivalWeatherBackgroundMode: ArrivalWeatherBackgroundMode;
  showExploreButton: boolean;
  showInfoButton: boolean;
  setDisplayTrip: (trip: Trip | null) => void;
  setUpdateDisplayTrip: (updateTrip: ((trip: Trip) => void) | null) => void;
}

export const ShareTripPage = (): ReactElement => {
  const {
    viewMode,
    layoutMode,
    columns,
    setColumns,
    arrivalWeatherBackgroundMode,
    showExploreButton,
    showInfoButton,
    setDisplayTrip,
    setUpdateDisplayTrip,
  } = useOutletContext<OutletContext>();
  const { shareId } = useParams<{ shareId: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!shareId) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setNotFound(false);
    getSharedTrip(shareId)
      .then((loaded) => {
        setTrip(loaded);
        setNotFound(false);
      })
      .catch(() => {
        setTrip(null);
        setNotFound(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [shareId]);

  const updateTrip = useCallback(
    (updated: Trip): void => {
      const { destinationsWithTimeline } = computeDestinationTimeline(updated.startDate, updated.destinations);
      const endDate = calculateTripEndDate(updated.startDate, destinationsWithTimeline);
      const withTimeline: Trip = {
        ...updated,
        destinations: destinationsWithTimeline,
        endDate,
        updatedAt: dayjs(),
      };
      setTrip(withTimeline);
      if (!shareId) return;
      updateSharedTrip(shareId, withTimeline)
        .then((saved) => setTrip(saved))
        .catch(() => {
          setTrip(updated);
        });
    },
    [shareId],
  );

  useEffect(() => {
    setDisplayTrip(trip);
  }, [trip, setDisplayTrip]);

  useEffect(() => {
    setUpdateDisplayTrip(updateTrip);
    return () => {
      setUpdateDisplayTrip(null);
    };
  }, [setUpdateDisplayTrip, updateTrip]);

  if (loading) {
    return (
      <Box sx={{ p: 3, display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
        <CircularProgress size={16} />
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Loading shared trip...
        </Typography>
      </Box>
    );
  }

  if (notFound || !trip) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="body1">Shared trip not found.</Typography>
      </Box>
    );
  }

  return (
    <TripView
      trip={trip}
      updateTrip={updateTrip}
      viewMode={viewMode}
      layoutMode={layoutMode}
      columns={columns}
      setColumns={setColumns}
      arrivalWeatherBackgroundMode={arrivalWeatherBackgroundMode}
      showExploreButton={showExploreButton}
      showInfoButton={showInfoButton}
    />
  );
};
