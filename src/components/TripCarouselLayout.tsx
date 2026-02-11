import { type ReactElement } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AddIcon from "@mui/icons-material/Add";
import { type Dayjs } from "dayjs";
import { type SwipeableHandlers } from "react-swipeable";
import { DestinationCard } from "./DestinationCard";
import { TripSettingsAndMap, type TripSettingsAndMapProps } from "./TripSettingsAndMap";
import { type Destination as DestinationType } from "../types/destination";
import { type ViewMode, type LayoutMode, type ArrivalWeatherBackgroundMode } from "../App";

interface DestinationDateInfo {
  arrivalDate?: Dayjs | null;
  departureDate?: Dayjs | null;
  error?: string | null;
}

interface TripCarouselLayoutProps extends TripSettingsAndMapProps {
  viewMode: ViewMode;
  layoutMode: LayoutMode;
  destinations: DestinationType[];
  destinationsWithTimeline: DestinationType[];
  destinationDates: DestinationDateInfo[];
  currentIndex: number;
  autoMaxAdjacent: number;
  isNarrowScreen: boolean;
  newlyCreatedId: string | null;
  arrivalWeatherBackgroundMode: ArrivalWeatherBackgroundMode;
  handleAddDestination: (index?: number) => void;
  handlePrevious: () => void;
  handleNext: () => void;
  handleDestinationChange: (destination: DestinationType) => void;
  handleRemoveDestination: (destinationId: string) => void;
  carouselRef: React.RefObject<HTMLDivElement | null>;
  swipeHandlers: SwipeableHandlers;
}

export const TripCarouselLayout = ({
  viewMode,
  layoutMode,
  destinations,
  destinationsWithTimeline,
  destinationDates,
  currentIndex,
  autoMaxAdjacent,
  isNarrowScreen,
  newlyCreatedId,
  arrivalWeatherBackgroundMode,
  handleAddDestination,
  handlePrevious,
  handleNext,
  handleDestinationChange,
  handleRemoveDestination,
  carouselRef,
  swipeHandlers,
  ...settingsProps
}: TripCarouselLayoutProps): ReactElement => {
  const hasDestinations = destinations.length > 0;
  const totalSlots = autoMaxAdjacent * 2 + 1;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Stack
        sx={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          gap: 2,
          scrollbarGutter: "stable both-edges",
        }}
      >
        <TripSettingsAndMap layoutMode={layoutMode} destinations={destinationsWithTimeline} tripStartDate={settingsProps.tripStartDate} tripEndDate={settingsProps.tripEndDate} dateErrorsExist={settingsProps.dateErrorsExist} referenceDateForStart={settingsProps.referenceDateForStart} mapExpanded={settingsProps.mapExpanded} onMapExpandChange={settingsProps.onMapExpandChange} onStartDateChange={settingsProps.onStartDateChange} />
        {hasDestinations && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 4,
            }}
          >
            <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton onClick={() => handleAddDestination(currentIndex)} color="primary" size="small">
                <AddIcon />
                <span style={{ fontSize: "0.9rem" }}>Before</span>
              </IconButton>
            </Box>
            <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
              <IconButton onClick={handlePrevious} disabled={currentIndex === 0} color="primary">
                <ChevronLeftIcon />
              </IconButton>
              <Typography variant="body2">
                {currentIndex + 1} / {destinations.length}
              </Typography>
              <IconButton onClick={handleNext} disabled={currentIndex >= destinations.length - 1} color="primary">
                <ChevronRightIcon />
              </IconButton>
            </Box>
            <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 1 }}>
              {currentIndex === destinations.length - 1 ? (
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleAddDestination(currentIndex + 1)} sx={{ fontSize: "0.8rem" }}>
                  New
                </Button>
              ) : (
                <IconButton onClick={() => handleAddDestination(currentIndex + 1)} color="primary" size="small">
                  <span style={{ fontSize: "0.9rem" }}>After</span>
                  <AddIcon />
                </IconButton>
              )}
            </Box>
          </Box>
        )}
        {hasDestinations ? (
          <Box
            ref={carouselRef}
            sx={{
              display: "flex",
              alignItems: "stretch",
              gap: 2,
              justifyContent: "center",
              overflow: "visible",
            }}
            {...(viewMode === "carousel" && layoutMode !== "desktop" ? swipeHandlers : undefined)}
          >
            {Array.from({ length: totalSlots }).map((_, slotIndex) => {
              const relativeIndex = slotIndex - autoMaxAdjacent;
              const absoluteIndex = currentIndex + relativeIndex;

              if (absoluteIndex < 0 || absoluteIndex >= destinations.length) {
                return (
                  <Box
                    key={`empty-${slotIndex}`}
                    sx={{
                      width: isNarrowScreen ? "100vw" : "420px",
                      flexShrink: 0,
                    }}
                  />
                );
              }

              const isCurrent = absoluteIndex === currentIndex;

              return (
                <Box
                  key={destinations[absoluteIndex].id}
                  sx={{
                    width: isNarrowScreen && isCurrent ? "100vw" : isCurrent ? "450px" : "420px",
                    minWidth: isNarrowScreen && isCurrent ? "100vw" : undefined,
                    flexShrink: 0,
                    opacity: isCurrent ? 1 : 0.6,
                    transform: isCurrent ? "scale(1)" : "scale(0.9)",
                    transition: "all 0.3s ease",
                  }}
                >
                  <DestinationCard
                    destination={destinationsWithTimeline[absoluteIndex]}
                    nextDestination={destinationsWithTimeline[absoluteIndex + 1]}
                    previousDestination={absoluteIndex > 0 ? destinationsWithTimeline[absoluteIndex - 1] : undefined}
                    onDestinationChange={handleDestinationChange}
                    onRemove={() => handleRemoveDestination(destinations[absoluteIndex].id)}
                    shouldFocus={destinations[absoluteIndex].id === newlyCreatedId}
                    alwaysExpanded
                    isFirst={absoluteIndex === 0}
                    arrivalDate={destinationDates[absoluteIndex]?.arrivalDate ?? null}
                    departureDate={destinationDates[absoluteIndex]?.departureDate ?? null}
                    dateError={destinationDates[absoluteIndex]?.error ?? undefined}
                    layoutMode={layoutMode}
                    tripStartDate={settingsProps.tripStartDate}
                    arrivalWeatherBackgroundMode={arrivalWeatherBackgroundMode}
                  />
                </Box>
              );
            })}
          </Box>
        ) : (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleAddDestination()} sx={{ mt: 2 }} fullWidth>
            New Destination
          </Button>
        )}
      </Stack>
    </Box>
  );
};

