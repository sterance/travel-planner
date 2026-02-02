import { useState, useEffect, useMemo, type ReactElement } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useSwipeable } from "react-swipeable";
import AddIcon from "@mui/icons-material/Add";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import dayjs, { type Dayjs } from "dayjs";
import { DestinationCard } from "../components/DestinationCard";
import { TripMapCard } from "../components/TripMapCard";
import { TripDateCard } from "../components/TripDateCard";
import { type Destination as DestinationType } from "../types/destination";
import { type ViewMode, type LayoutMode, type ArrivalWeatherBackgroundMode } from "../App";
import { useTripContext } from "../context/TripContext";
import { calculateDestinationDates, calculateTripEndDate, hasDateErrors } from "../utils/dateCalculation";

interface OutletContext {
  viewMode: ViewMode;
  layoutMode: LayoutMode;
  columns: number;
  setColumns: (value: number) => void;
  maxAdjacent: number;
  setMaxAdjacent: (value: number) => void;
  arrivalWeatherBackgroundMode: ArrivalWeatherBackgroundMode;
  setArrivalWeatherBackgroundMode: (value: ArrivalWeatherBackgroundMode) => void;
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
  const { viewMode, layoutMode, columns, setColumns, maxAdjacent, arrivalWeatherBackgroundMode } = useOutletContext<OutletContext>();
  const { tripId } = useParams<{ tripId: string }>();
  const { currentTrip, updateTrip, setCurrentTrip } = useTripContext();
  const [newlyCreatedId, setNewlyCreatedId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mapExpanded, setMapExpanded] = useState(false);
  const [reorderDragOverIndex, setReorderDragOverIndex] = useState<number | null>(null);
  const isNarrowScreen = useMediaQuery(`(max-width: 399px)`);

  useEffect(() => {
    if (tripId && tripId !== currentTrip?.id) {
      setCurrentTrip(tripId);
    }
  }, [tripId, currentTrip?.id, setCurrentTrip]);

  const destinations = currentTrip?.destinations ?? [];
  const tripStartDate = currentTrip?.startDate ? dayjs(currentTrip.startDate) : null;
  const isDesktopList = layoutMode === "desktop" && viewMode === "list";
  const desktopListColumns = isDesktopList ? Math.max(columns, 3) : columns;

  const startDateDayjs = tripStartDate;
  const destinationDates = useMemo(() => calculateDestinationDates(startDateDayjs, destinations), [startDateDayjs, destinations]);
  const tripEndDate = useMemo(() => calculateTripEndDate(startDateDayjs, destinations), [startDateDayjs, destinations]);
  const dateErrorsExist = useMemo(() => hasDateErrors(startDateDayjs, destinations), [startDateDayjs, destinations]);
  const referenceDateForStart = useMemo(() => {
    const candidateDates: Dayjs[] = [];

    destinations.forEach((destination) => {
      if (destination.checkInDate) {
        const date = dayjs(destination.checkInDate);
        if (date.isValid()) {
          candidateDates.push(date);
        }
      }

      if (destination.checkOutDate) {
        const date = dayjs(destination.checkOutDate);
        if (date.isValid()) {
          candidateDates.push(date);
        }
      }
    });

    if (candidateDates.length === 0) {
      return dayjs();
    }

    return candidateDates.reduce((earliest, current) =>
      current.isBefore(earliest, "day") ? current : earliest
    );
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

  if (!currentTrip) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography>No trip selected</Typography>
      </Box>
    );
  }

  const generateId = (): string => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      try {
        return crypto.randomUUID();
      } catch {
        // fallback for non-secure contexts
      }
    }
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  };

  const handleAddDestination = (index?: number): void => {
    if (!currentTrip) return;
    const newDestination: DestinationType = {
      id: generateId(),
      name: "",
      displayName: "",
      nights: null,
    };
    setNewlyCreatedId(newDestination.id);
    const newDestinations = [...destinations];
    if (index !== undefined) {
      newDestinations.splice(index, 0, newDestination);
      if (viewMode === "carousel") {
        setCurrentIndex(index);
      }
    } else {
      newDestinations.push(newDestination);
      if (viewMode === "carousel") {
        setCurrentIndex(destinations.length);
      }
    }
    updateTrip({
      ...currentTrip,
      destinations: newDestinations,
    });
  };

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

  const handleDestinationChange = (updatedDestination: DestinationType): void => {
    if (!currentTrip) return;
    const updatedDestinations = destinations.map((dest) => (dest.id === updatedDestination.id ? updatedDestination : dest));
    updateTrip({
      ...currentTrip,
      destinations: updatedDestinations,
    });
    if (updatedDestination.id === newlyCreatedId) {
      setNewlyCreatedId(null);
    }
  };

  const handleRemoveDestination = (destinationId: string): void => {
    if (!currentTrip) return;
    const removedIndex = destinations.findIndex((d) => d.id === destinationId);
    if (removedIndex === -1) return;
    const newDestinations = destinations.filter((d) => d.id !== destinationId);
    if (currentIndex === removedIndex) {
      setCurrentIndex(Math.max(0, removedIndex - 1));
    } else if (currentIndex > removedIndex) {
      setCurrentIndex((prev) => prev - 1);
    }
    updateTrip({
      ...currentTrip,
      destinations: newDestinations,
    });
  };

  const handleReorderDragStart = (e: React.DragEvent, id: string): void => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleReorderDragOver = (e: React.DragEvent, index: number): void => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setReorderDragOverIndex(index);
  };

  const handleReorderDrop = (e: React.DragEvent, toIndex: number): void => {
    e.preventDefault();
    setReorderDragOverIndex(null);
    const id = e.dataTransfer.getData("text/plain");
    if (!id || !currentTrip) return;
    const fromIndex = destinations.findIndex((d) => d.id === id);
    if (fromIndex === -1 || fromIndex === toIndex) return;
    const newDestinations = [...destinations];
    newDestinations[fromIndex] = newDestinations[toIndex];
    newDestinations[toIndex] = destinations[fromIndex];
    updateTrip({ ...currentTrip, destinations: newDestinations });
  };

  const handleReorderDragEnd = (): void => {
    setReorderDragOverIndex(null);
  };

  const handleStartDateChange = (date: Dayjs | null): void => {
    if (!currentTrip) return;
    updateTrip({
      ...currentTrip,
      startDate: date?.toISOString() ?? null,
    });
  };

  useEffect(() => {
    if (viewMode !== "carousel" || layoutMode !== "desktop" || destinations.length === 0) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      const target = event.target as HTMLElement | null;
      if (isTextInputElement(target)) return;

      if (event.key === "ArrowLeft") {
        handlePrevious();
      } else if (event.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [viewMode, layoutMode, destinations.length]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: (eventData) => {
      if (viewMode !== "carousel" || layoutMode === "desktop") return;
      const target = (eventData.event?.target as HTMLElement) ?? null;
      if (isTextInputElement(target)) return;
      handleNext();
    },
    onSwipedRight: (eventData) => {
      if (viewMode !== "carousel" || layoutMode === "desktop") return;
      const target = (eventData.event?.target as HTMLElement) ?? null;
      if (isTextInputElement(target)) return;
      handlePrevious();
    },
  });

  const renderSettingsAndMap = (): ReactElement => {
    if (layoutMode === "desktop") {
      return (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gridTemplateRows: "auto auto",
            columnGap: 2,
            rowGap: 0,
            alignItems: "start",
          }}
        >
          <Box sx={{ gridColumn: "1", gridRow: "1" }}>
            <TripDateCard
              startDate={tripStartDate}
              endDate={tripEndDate}
              onStartDateChange={handleStartDateChange}
              hasDateErrors={dateErrorsExist}
              referenceDateForStart={referenceDateForStart}
            />
          </Box>
          <Box sx={{ gridColumn: "2", gridRow: "1" }}>
            <TripMapCard destinations={destinations} layoutMode={layoutMode} headerOnly={true} expanded={mapExpanded} onExpandChange={setMapExpanded} />
          </Box>
          <Box sx={{ gridColumn: "1 / -1", gridRow: "2" }}>
            <TripMapCard destinations={destinations} layoutMode={layoutMode} bodyOnly={true} expanded={mapExpanded} onExpandChange={setMapExpanded} />
          </Box>
        </Box>
      );
    }
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <TripDateCard
          startDate={tripStartDate}
          endDate={tripEndDate}
          onStartDateChange={handleStartDateChange}
          hasDateErrors={dateErrorsExist}
          referenceDateForStart={referenceDateForStart}
        />
        <TripMapCard destinations={destinations} layoutMode={layoutMode} headerOnly={false} bodyOnly={false} expanded={mapExpanded} onExpandChange={setMapExpanded} />
      </Box>
    );
  };

  if (viewMode === "carousel") {
    const hasDestinations = destinations.length > 0;
    const totalSlots = maxAdjacent * 2 + 1;

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
          {renderSettingsAndMap()}
          {hasDestinations && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 2,
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
                const relativeIndex = slotIndex - maxAdjacent;
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
                      destination={destinations[absoluteIndex]}
                      nextDestination={destinations[absoluteIndex + 1]}
                      previousDestination={absoluteIndex > 0 ? destinations[absoluteIndex - 1] : undefined}
                      onDestinationChange={handleDestinationChange}
                      onRemove={() => handleRemoveDestination(destinations[absoluteIndex].id)}
                      shouldFocus={destinations[absoluteIndex].id === newlyCreatedId}
                      alwaysExpanded
                      isFirst={absoluteIndex === 0}
                      arrivalDate={destinationDates[absoluteIndex]?.arrivalDate ?? null}
                      departureDate={destinationDates[absoluteIndex]?.departureDate ?? null}
                      dateError={destinationDates[absoluteIndex]?.error}
                      layoutMode={layoutMode}
                      tripStartDate={tripStartDate}
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
  }

  if (layoutMode === "desktop" && viewMode === "list") {
    if (destinations.length === 0) {
      return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <Stack sx={{ flex: 1, overflowY: "auto", overflowX: "hidden", gap: 2, scrollbarGutter: "stable both-edges" }}>
            {renderSettingsAndMap()}
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleAddDestination()} sx={{ mt: 2 }} fullWidth>
              New Destination
            </Button>
          </Stack>
        </Box>
      );
    }

    const slots = Array.from({ length: desktopListColumns }, (_, index) => destinations[currentIndex + index] ?? null);
    const gridTemplateColumns = [...Array.from({ length: desktopListColumns }).flatMap(() => ["auto", "minmax(0, 1fr)"]), "auto"].join(" ");
    const hasVisibleDestinations = slots.some((destination) => destination !== null);
    const lastVisibleIndex = hasVisibleDestinations ? Math.min(destinations.length - 1, currentIndex + desktopListColumns - 1) : null;
    const lastVisibleRelativeIndex = lastVisibleIndex !== null ? lastVisibleIndex - currentIndex : -1;
    const showTrailingAsAddCard = lastVisibleIndex === destinations.length - 1;
    const addButtonWithTextPosition = showTrailingAsAddCard ? lastVisibleRelativeIndex + 1 : -1;
    const trailingInsertIndex = lastVisibleIndex !== null ? lastVisibleIndex + 1 : destinations.length;
    const rangeStart = currentIndex + 1;
    const rangeEnd = Math.min(currentIndex + desktopListColumns, destinations.length);

    const verticalAddButton = (
      <Button
        variant="contained"
        onClick={() => handleAddDestination()}
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: 0.5,
          px: 1,
          whiteSpace: "nowrap",
          writingMode: "vertical-lr",
          textOrientation: "upright",
          minWidth: 0,
        }}
      >
        <AddIcon sx={{ mb: 0.5 }} />
        New Destination
      </Button>
    );

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
            overflow: "auto",
            gap: 2,
            scrollbarGutter: "stable both-edges",
          }}
        >
          {renderSettingsAndMap()}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                flex: 1,
                mx: 5,
                mb: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <IconButton onClick={handleIncreaseColumns} disabled={columns >= 7 || columns >= destinations.length} color="primary" size="small" aria-label="increase columns">
                  <ZoomOutIcon fontSize="small" />
                </IconButton>
                <Typography variant="body2" component="span">
                  /
                </Typography>
                <IconButton onClick={handleDecreaseColumns} disabled={columns <= 3} color="primary" size="small" aria-label="decrease columns">
                  <ZoomInIcon fontSize="small" />
                </IconButton>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <IconButton onClick={handleListPrevious} disabled={currentIndex === 0} color="primary">
                  <ChevronLeftIcon />
                </IconButton>
                <Typography variant="body2">
                  {rangeStart}-{rangeEnd} / {destinations.length}
                </Typography>
                <IconButton onClick={handleListNext} disabled={currentIndex + desktopListColumns >= destinations.length} color="primary">
                  <ChevronRightIcon />
                </IconButton>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <IconButton onClick={handleIncreaseColumns} disabled={columns >= 7 || columns >= destinations.length} color="primary" size="small" aria-label="increase columns">
                  <ZoomOutIcon fontSize="small" />
                </IconButton>
                <Typography variant="body2" component="span">
                  /
                </Typography>
                <IconButton onClick={handleDecreaseColumns} disabled={columns <= 3} color="primary" size="small" aria-label="decrease columns">
                  <ZoomInIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Box>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns,
              columnGap: 1,
              alignItems: "stretch",
            }}
          >
            {Array.from({ length: desktopListColumns }).map((_, boundaryIndex) => {
              const insertIndex = currentIndex + boundaryIndex;
              const hasDestination = slots[boundaryIndex] !== null;
              const isAddButtonWithText = boundaryIndex === addButtonWithTextPosition;
              return (
                <Box
                  key={`before-${boundaryIndex}`}
                  sx={{
                    gridColumn: boundaryIndex * 2 + 1,
                    gridRow: 1,
                    alignSelf: "stretch",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                  }}
                >
                  {isAddButtonWithText ? (
                    verticalAddButton
                  ) : hasDestination ? (
                    <IconButton onClick={() => handleAddDestination(insertIndex)} color="primary" size="small" aria-label="add destination">
                      <AddIcon />
                    </IconButton>
                  ) : null}
                </Box>
              );
            })}
            {slots.map((destination, relativeIndex) => {
              const absoluteIndex = currentIndex + relativeIndex;
              return (
                <Box
                  key={destination?.id ?? `empty-${absoluteIndex}`}
                  sx={{
                    minWidth: 0,
                    overflow: "visible",
                    gridColumn: relativeIndex * 2 + 2,
                    gridRow: 1,
                    ...(destination && reorderDragOverIndex === absoluteIndex && {
                      outline: 2,
                      outlineStyle: "dashed",
                      outlineColor: "primary.main",
                      borderRadius: 1,
                    }),
                  }}
                  {...(destination && {
                    onDragOver: (e: React.DragEvent) => handleReorderDragOver(e, absoluteIndex),
                    onDrop: (e: React.DragEvent) => handleReorderDrop(e, absoluteIndex),
                  })}
                >
                  {destination ? (
                    <DestinationCard
                      destination={destination}
                      nextDestination={destinations[absoluteIndex + 1]}
                      previousDestination={absoluteIndex > 0 ? destinations[absoluteIndex - 1] : undefined}
                      onDestinationChange={handleDestinationChange}
                      onRemove={() => handleRemoveDestination(destination.id)}
                      shouldFocus={destination.id === newlyCreatedId}
                      alwaysExpanded
                      isFirst={absoluteIndex === 0}
                      arrivalDate={destinationDates[absoluteIndex]?.arrivalDate ?? null}
                      departureDate={destinationDates[absoluteIndex]?.departureDate ?? null}
                      dateError={destinationDates[absoluteIndex]?.error}
                      layoutMode={layoutMode}
                      tripStartDate={tripStartDate}
                      arrivalWeatherBackgroundMode={arrivalWeatherBackgroundMode}
                      isListMode={viewMode === "list"}
                      onReorderDragStart={(e) => handleReorderDragStart(e, destination.id)}
                      onReorderDragEnd={handleReorderDragEnd}
                    />
                  ) : (
                    <Box sx={{ height: 1 }} />
                  )}
                </Box>
              );
            })}
            <Box
              sx={{
                gridColumn: desktopListColumns * 2 + 1,
                gridRow: 1,
                alignSelf: "stretch",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}
            >
              {addButtonWithTextPosition === desktopListColumns ? (
                verticalAddButton
              ) : !showTrailingAsAddCard ? (
                <IconButton onClick={() => handleAddDestination(trailingInsertIndex)} color="primary" size="small" aria-label="add destination">
                  <AddIcon />
                </IconButton>
              ) : null}
            </Box>
          </Box>
        </Stack>
      </Box>
    );
  }

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
          overflow: "auto",
          gap: 2,
          scrollbarGutter: "stable both-edges",
        }}
      >
        {renderSettingsAndMap()}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {destinations.map((destination, index) => (
            <Box
              key={destination.id}
              sx={{
                minWidth: 0,
                overflow: "visible",
                ...(viewMode === "list" && reorderDragOverIndex === index && {
                  outline: 2,
                  outlineStyle: "dashed",
                  outlineColor: "primary.main",
                  borderRadius: 1,
                }),
              }}
              {...(viewMode === "list" && {
                onDragOver: (e: React.DragEvent) => handleReorderDragOver(e, index),
                onDrop: (e: React.DragEvent) => handleReorderDrop(e, index),
              })}
            >
              <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
                <IconButton onClick={() => handleAddDestination(index)} color="primary" size="small">
                  <AddIcon />
                </IconButton>
              </Box>
              <DestinationCard
                destination={destination}
                nextDestination={destinations[index + 1]}
                previousDestination={index > 0 ? destinations[index - 1] : undefined}
                onDestinationChange={handleDestinationChange}
                onRemove={() => handleRemoveDestination(destination.id)}
                shouldFocus={destination.id === newlyCreatedId}
                isFirst={index === 0}
                arrivalDate={destinationDates[index]?.arrivalDate ?? null}
                departureDate={destinationDates[index]?.departureDate ?? null}
                dateError={destinationDates[index]?.error}
                layoutMode={layoutMode}
                tripStartDate={tripStartDate}
                isListMode={viewMode === "list"}
                onReorderDragStart={viewMode === "list" ? (e: React.DragEvent) => handleReorderDragStart(e, destination.id) : undefined}
                onReorderDragEnd={viewMode === "list" ? handleReorderDragEnd : undefined}
                arrivalWeatherBackgroundMode={arrivalWeatherBackgroundMode}
              />
            </Box>
          ))}
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleAddDestination()} sx={{ mt: 2 }} fullWidth>
          New Destination
        </Button>
      </Stack>
    </Box>
  );
};
