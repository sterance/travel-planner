import { useEffect, useMemo, useState, type ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { type Dayjs } from "dayjs";
import { type Trip } from "../types/trip";
import { loadDemoTrip } from "../services/demoLoader";
import { calculateTripEndDate, computeDestinationTimeline, hasDateErrors } from "../utils/dateCalculation";
import { TripLayoutDesktopList } from "../components/TripLayoutDesktopList";
import type { ArrivalWeatherBackgroundMode, LayoutMode, ViewMode } from "../App";
import { useTripDestinations } from "../hooks/useTripDestinations";

interface DestinationDateInfo {
  arrivalDate?: Dayjs | null;
  departureDate?: Dayjs | null;
  error?: string | null;
}

const DEMO_VIEW_MODE: ViewMode = "list";
const DEMO_LAYOUT_MODE: LayoutMode = "desktop";
const DEMO_ARRIVAL_WEATHER_MODE: ArrivalWeatherBackgroundMode = "default";

export const DemoPage = (): ReactElement => {
  const [loadedTrip, setLoadedTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    loadDemoTrip()
      .then((trip) => {
        if (cancelled) return;
        setLoadedTrip(trip);
      })
      .catch(() => {
        if (cancelled) return;
        setError("unable to load demo trip");
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 3, display: "flex", alignItems: "center", justifyContent: "center", gap: 1, height: "100%" }}>
        <CircularProgress size={20} />
        <Typography variant="body2" sx={{ color: (theme) => theme.palette.text.secondary }}>
          loading demo itinerary
        </Typography>
      </Box>
    );
  }

  if (error || !loadedTrip) {
    return (
      <Box sx={{ p: 3, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, height: "100%" }}>
        <Typography variant="h6">demo unavailable</Typography>
        <Typography variant="body2" sx={{ color: (theme) => theme.palette.text.secondary, textAlign: "center", maxWidth: 480 }}>
          something went wrong while loading the sample trip. you can still jump straight into the main app and start planning your own trip.
        </Typography>
        <Button variant="contained" onClick={() => navigate("/")}>
          go to my trips
        </Button>
      </Box>
    );
  }

  return <DemoTripContent initialTrip={loadedTrip} onNavigateHome={() => navigate("/")} />;
};

interface DemoTripContentProps {
  initialTrip: Trip;
  onNavigateHome: () => void;
}

const DemoTripContent = ({ initialTrip, onNavigateHome }: DemoTripContentProps): ReactElement => {
  const [demoTrip, setDemoTrip] = useState<Trip>(initialTrip);
  const [mapExpanded, setMapExpanded] = useState(false);
  const [columns, setColumns] = useState(3);

  const updateDemoTrip = (trip: Trip): void => {
    setDemoTrip(trip);
  };

  const {
    destinations,
    newlyCreatedId,
    currentIndex,
    setCurrentIndex,
    reorderDragOverIndex,
    handleAddDestination,
    handleRemoveDestination,
    handleDestinationChange,
    handleReorderDragStart,
    handleReorderDragOver,
    handleReorderDrop,
    handleReorderDragEnd,
    handleStartDateChange,
  } = useTripDestinations({
    currentTrip: demoTrip,
    updateTrip: updateDemoTrip,
    viewMode: DEMO_VIEW_MODE,
    layoutMode: DEMO_LAYOUT_MODE,
    columns,
  });

  const handleListPrevious = (): void => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleListNext = (): void => {
    const destinationCount = destinations.length;
    const desktopListColumns = Math.min(Math.max(3, columns), Math.max(3, destinationCount || 3));
    const maxStartIndex = Math.max(0, destinationCount - desktopListColumns);
    setCurrentIndex((prev) => Math.min(maxStartIndex, prev + 1));
  };

  const handleReset = (): void => {
    setDemoTrip(initialTrip);
    setMapExpanded(false);
    setCurrentIndex(0);
    setColumns(3);
  };

  const tripStartDate = demoTrip.startDate ?? null;

  const { infos: destinationDates, destinationsWithTimeline } = useMemo(
    () => computeDestinationTimeline(tripStartDate, destinations),
    [tripStartDate, destinations],
  );

  const tripEndDate = useMemo(
    () => calculateTripEndDate(tripStartDate, destinations),
    [tripStartDate, destinations],
  );

  const dateErrorsExist = useMemo(
    () => hasDateErrors(tripStartDate, destinations),
    [tripStartDate, destinations],
  );

  const referenceDateForStart = useMemo<Dayjs>(() => {
    const candidateDates: Dayjs[] = [];

    (destinationDates as DestinationDateInfo[]).forEach((info) => {
      if (info.arrivalDate) {
        candidateDates.push(info.arrivalDate);
      }
      if (info.departureDate) {
        candidateDates.push(info.departureDate);
      }
    });

    if (candidateDates.length === 0) {
      return tripStartDate ?? destinations[0]?.arrivalDate ?? destinations[0]?.departureDate ?? destinations[0]?.activities?.[0]?.startDateTime ?? tripStartDate!;
    }

    return candidateDates.reduce((earliest, current) => (current.isBefore(earliest, "day") ? current : earliest));
  }, [destinationDates]);

  const desktopListColumns = Math.min(Math.max(3, columns), Math.max(3, destinations.length || 3));

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        p: 3,
        gap: 2,
      }}
    >
      <Box sx={{ maxWidth: 720 }}>
        {/* <Typography variant="h5" sx={{ mb: 1 }}>
          Explore a sample trip
        </Typography> */}
        {/* <Typography variant="body2" sx={{ color: (theme) => theme.palette.text.secondary }}>
          this is a fully prefilled example itinerary for a week in japan, with real-world style flights, hotels, and activities. you can browse around to see how everything fits together.
        </Typography> */}
        <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1.5 }}>
          <Button variant="contained" color="primary" onClick={onNavigateHome}>
            click here to try!
          </Button>
          <Button variant="outlined" onClick={handleReset}>
            reset
          </Button>
        </Box>
      </Box>
      <Box sx={{ flex: 1, minHeight: 0, mt: 1 }}>
        <TripLayoutDesktopList
          viewMode={DEMO_VIEW_MODE}
          layoutMode={DEMO_LAYOUT_MODE}
          destinations={destinations}
          destinationsWithTimeline={destinationsWithTimeline}
          destinationDates={destinationDates}
          currentIndex={currentIndex}
          desktopListColumns={desktopListColumns}
          columns={columns}
          setColumns={setColumns}
          reorderDragOverIndex={reorderDragOverIndex}
          newlyCreatedId={newlyCreatedId}
          showExploreButton={false}
          showInfoButton
          arrivalWeatherBackgroundMode={DEMO_ARRIVAL_WEATHER_MODE}
          exploreAnchorEl={{}}
          handleAddDestination={handleAddDestination}
          handleListPrevious={handleListPrevious}
          handleListNext={handleListNext}
          handleDestinationChange={handleDestinationChange}
          handleRemoveDestination={handleRemoveDestination}
          handleReorderDragStart={handleReorderDragStart}
          handleReorderDragOver={handleReorderDragOver}
          handleReorderDrop={handleReorderDrop}
          handleReorderDragEnd={handleReorderDragEnd}
          handleExploreClick={() => {}}
          handleExploreClose={() => {}}
          handleExploreSelect={() => {}}
          tripStartDate={tripStartDate}
          tripEndDate={tripEndDate}
          dateErrorsExist={dateErrorsExist}
          referenceDateForStart={referenceDateForStart}
          mapExpanded={mapExpanded}
          onMapExpandChange={setMapExpanded}
          onStartDateChange={handleStartDateChange}
        />
      </Box>
    </Box>
  );
};

