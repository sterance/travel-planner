import { useState, useEffect, useMemo, lazy, Suspense, type ReactElement } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import dayjs, { type Dayjs } from "dayjs";
import { type ViewMode, type LayoutMode, type ArrivalWeatherBackgroundMode } from "../App";
import { useTripContext } from "../hooks/useTripContext";
import { calculateTripEndDate, computeDestinationTimeline, hasDateErrors } from "../utils/dateCalculation";
import { useTripDestinations } from "../hooks/useTripDestinations";
import { useTripLayout } from "../hooks/useTripLayout";
import { useTripExploreMenu } from "../hooks/useTripExploreMenu";
import { useTripCarousel } from "../hooks/useTripCarousel";
import { type TripHeaderProps } from "../components/TripHeader";

const TripLayoutCarousel = lazy(async () => {
  const module = await import("../components/TripLayoutCarousel");
  return { default: module.TripLayoutCarousel };
});

const TripLayoutDesktopList = lazy(async () => {
  const module = await import("../components/TripLayoutDesktopList");
  return { default: module.TripLayoutDesktopList };
});

const TripLayoutPortraitList = lazy(async () => {
  const module = await import("../components/TripLayoutPortraitList");
  return { default: module.TripLayoutPortraitList };
});

interface OutletContext {
  viewMode: ViewMode;
  layoutMode: LayoutMode;
  columns: number;
  setColumns: (value: number) => void;
  arrivalWeatherBackgroundMode: ArrivalWeatherBackgroundMode;
  setArrivalWeatherBackgroundMode: (value: ArrivalWeatherBackgroundMode) => void;
  showExploreButton: boolean;
  setShowExploreButton: (value: boolean) => void;
  showInfoButton: boolean;
  setShowInfoButton: (value: boolean) => void;
}

const isTextInputElement = (element: HTMLElement | null): boolean => {
  if (!element) return false;

  const tagName = element.tagName;
  if (tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT") {
    return true;
  }

  if (element.isContentEditable) {
    return true;
  }

  const role = element.getAttribute("role");
  if (role === "textbox") {
    return true;
  }

  return false;
};

export const TripPage = (): ReactElement => {
  const { viewMode, layoutMode, columns, setColumns, arrivalWeatherBackgroundMode, showExploreButton, showInfoButton } = useOutletContext<OutletContext>();
  const { tripId } = useParams<{ tripId: string }>();
  const { currentTrip, updateTrip, setCurrentTrip } = useTripContext();
  const [mapExpanded, setMapExpanded] = useState(false);
  const isNarrowScreen = useMediaQuery(`(max-width: 399px)`);

  useEffect(() => {
    if (tripId && tripId !== currentTrip?.id) {
      setCurrentTrip(tripId);
    }
  }, [tripId, currentTrip?.id, setCurrentTrip]);

  const { destinations, newlyCreatedId, currentIndex, setCurrentIndex, reorderDragOverIndex, handleAddDestination, handleRemoveDestination, handleDestinationChange, handleReorderDragStart, handleReorderDragOver, handleReorderDrop, handleReorderDragEnd, handleStartDateChange } = useTripDestinations({
    currentTrip,
    updateTrip,
    viewMode,
    layoutMode,
    columns,
  });

  const tripStartDate = currentTrip?.startDate ?? null;
  const { isDesktopList, desktopListColumns } = useTripLayout({ viewMode, layoutMode, columns });

  const startDateDayjs = tripStartDate;
  const { infos: destinationDates, destinationsWithTimeline } = useMemo(() => computeDestinationTimeline(startDateDayjs, destinations), [startDateDayjs, destinations]);
  const tripEndDate = useMemo(() => calculateTripEndDate(startDateDayjs, destinations), [startDateDayjs, destinations]);
  const dateErrorsExist = useMemo(() => hasDateErrors(startDateDayjs, destinations), [startDateDayjs, destinations]);
  const referenceDateForStart = useMemo(() => {
    const candidateDates: Dayjs[] = [];

    destinationDates.forEach((info) => {
      if (info.arrivalDate) {
        candidateDates.push(info.arrivalDate);
      }

      if (info.departureDate) {
        candidateDates.push(info.departureDate);
      }
    });

    if (candidateDates.length === 0) {
      return dayjs();
    }

    return candidateDates.reduce((earliest, current) => (current.isBefore(earliest, "day") ? current : earliest));
  }, [destinations]);

  useEffect(() => {
    const destinationCount = destinations.length;

    if (destinationCount === 0) {
      if (currentIndex !== 0) {
        setCurrentIndex(0);
      }
      return;
    }

    if (viewMode === "carousel") {
      const maxIndex = destinationCount - 1;
      if (currentIndex > maxIndex) {
        setCurrentIndex(maxIndex);
      }
      return;
    }

    if (isDesktopList) {
      const maxStartIndex = Math.max(0, destinationCount - desktopListColumns);
      if (currentIndex > maxStartIndex) {
        setCurrentIndex(maxStartIndex);
      }
    }
  }, [destinations.length, viewMode, currentIndex, isDesktopList, desktopListColumns]);

  const handlePrevious = (): void => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = (): void => {
    if (layoutMode === "desktop" && viewMode === "list") {
      setCurrentIndex((prev) => Math.min(Math.max(0, destinations.length - desktopListColumns), prev + 1));
    } else {
      setCurrentIndex((prev) => Math.min(destinations.length - 1, prev + 1));
    }
  };

  const handleListPrevious = (): void => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleListNext = (): void => {
    setCurrentIndex((prev) => Math.min(Math.max(0, destinations.length - desktopListColumns), prev + 1));
  };

  const handleIncreaseColumns = (): void => {
    if (!isDesktopList) return;
    if (columns >= 7) return;
    setColumns(columns + 1);
  };

  const handleDecreaseColumns = (): void => {
    if (!isDesktopList) return;
    if (columns <= 3) return;
    setColumns(columns - 1);
  };

  const { exploreAnchorEl, handleExploreClick, handleExploreClose, handleExploreSelect } = useTripExploreMenu();

  const { autoMaxAdjacent, carouselRef, swipeHandlers } = useTripCarousel({
    viewMode,
    layoutMode,
    destinationsLength: destinations.length,
    isNarrowScreen,
    onPrevious: handlePrevious,
    onNext: handleNext,
    isTextInputElement,
  });

  const tripHeaderProps: TripHeaderProps = {
    layoutMode,
    tripStartDate,
    tripEndDate,
    dateErrorsExist,
    referenceDateForStart,
    destinations,
    mapExpanded,
    onMapExpandChange: setMapExpanded,
    onStartDateChange: handleStartDateChange,
  };

  if (!currentTrip) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography>No trip selected</Typography>
      </Box>
    );
  }

  if (viewMode === "carousel") {
    return (
      <Suspense
        fallback={
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography>Loading trip view...</Typography>
          </Box>
        }
      >
        <TripLayoutCarousel
          viewMode={viewMode}
          destinationsWithTimeline={destinationsWithTimeline}
          destinationDates={destinationDates}
          currentIndex={currentIndex}
          autoMaxAdjacent={autoMaxAdjacent}
          isNarrowScreen={isNarrowScreen}
          newlyCreatedId={newlyCreatedId}
          arrivalWeatherBackgroundMode={arrivalWeatherBackgroundMode}
          handleAddDestination={handleAddDestination}
          handlePrevious={handlePrevious}
          handleNext={handleNext}
          handleDestinationChange={handleDestinationChange}
          handleRemoveDestination={handleRemoveDestination}
          carouselRef={carouselRef}
          swipeHandlers={swipeHandlers}
          {...tripHeaderProps}
        />
      </Suspense>
    );
  }

  if (layoutMode === "desktop" && viewMode === "list") {
    return (
      <Suspense
        fallback={
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography>Loading trip view...</Typography>
          </Box>
        }
      >
        <TripLayoutDesktopList
          viewMode={viewMode}
          destinationsWithTimeline={destinationsWithTimeline}
          destinationDates={destinationDates}
          currentIndex={currentIndex}
          desktopListColumns={desktopListColumns}
          columns={columns}
          reorderDragOverIndex={reorderDragOverIndex}
          newlyCreatedId={newlyCreatedId}
          showExploreButton={showExploreButton}
          showInfoButton={showInfoButton}
          arrivalWeatherBackgroundMode={arrivalWeatherBackgroundMode}
          exploreAnchorEl={exploreAnchorEl}
          handleAddDestination={handleAddDestination}
          handleIncreaseColumns={handleIncreaseColumns}
          handleDecreaseColumns={handleDecreaseColumns}
          handleListPrevious={handleListPrevious}
          handleListNext={handleListNext}
          handleDestinationChange={handleDestinationChange}
          handleRemoveDestination={handleRemoveDestination}
          handleReorderDragStart={handleReorderDragStart}
          handleReorderDragOver={handleReorderDragOver}
          handleReorderDrop={handleReorderDrop}
          handleReorderDragEnd={handleReorderDragEnd}
          handleExploreClick={handleExploreClick}
          handleExploreClose={handleExploreClose}
          handleExploreSelect={handleExploreSelect}
          {...tripHeaderProps}
        />
      </Suspense>
    );
  }

  return (
    <Suspense
      fallback={
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography>Loading trip view...</Typography>
        </Box>
      }
    >
      <TripLayoutPortraitList
        viewMode={viewMode}
        destinationsWithTimeline={destinationsWithTimeline}
        destinationDates={destinationDates}
        currentIndex={currentIndex}
        reorderDragOverIndex={reorderDragOverIndex}
        newlyCreatedId={newlyCreatedId}
        showExploreButton={showExploreButton}
        showInfoButton={showInfoButton}
        arrivalWeatherBackgroundMode={arrivalWeatherBackgroundMode}
        exploreAnchorEl={exploreAnchorEl}
        handleAddDestination={handleAddDestination}
        handleDestinationChange={handleDestinationChange}
        handleRemoveDestination={handleRemoveDestination}
        handleReorderDragStart={handleReorderDragStart}
        handleReorderDragOver={handleReorderDragOver}
        handleReorderDrop={handleReorderDrop}
        handleReorderDragEnd={handleReorderDragEnd}
        handleExploreClick={handleExploreClick}
        handleExploreClose={handleExploreClose}
        handleExploreSelect={handleExploreSelect}
        {...tripHeaderProps}
      />
    </Suspense>
  );
};
