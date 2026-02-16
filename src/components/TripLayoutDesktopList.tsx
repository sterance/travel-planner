import { type ReactElement, lazy, Suspense, useState, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import AddIcon from "@mui/icons-material/Add";
import { InfoOutline } from "@mui/icons-material";
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import { type Dayjs } from "dayjs";
import { TripHeader, type TripHeaderProps } from "./TripHeader";
import { type Destination as DestinationType } from "../types/destination";
import { type ViewMode, type LayoutMode, type ArrivalWeatherBackgroundMode } from "../App";
import { getPulsingDropShadowSx } from "./utility/pulsingShadow";

const DestinationCard = lazy(async () => {
  const module = await import("./DestinationCard");
  return { default: module.DestinationCard };
});

interface DestinationDateInfo {
  arrivalDate?: Dayjs | null;
  departureDate?: Dayjs | null;
  error?: string | null;
}

interface TripLayoutDesktopListProps extends TripHeaderProps {
  viewMode: ViewMode;
  layoutMode: LayoutMode;
  destinations: DestinationType[];
  destinationsWithTimeline: DestinationType[];
  destinationDates: DestinationDateInfo[];
  currentIndex: number;
  desktopListColumns: number;
  columns: number;
  reorderDragOverIndex: number | null;
  newlyCreatedId: string | null;
  showExploreButton: boolean;
  showInfoButton: boolean;
  arrivalWeatherBackgroundMode: ArrivalWeatherBackgroundMode;
  exploreAnchorEl: { [key: string]: HTMLElement | null };
  handleAddDestination: (index?: number) => void;
  handleIncreaseColumns: () => void;
  handleDecreaseColumns: () => void;
  handleListPrevious: () => void;
  handleListNext: () => void;
  handleDestinationChange: (destination: DestinationType) => void;
  handleRemoveDestination: (destinationId: string) => void;
  handleReorderDragStart: (e: React.DragEvent, id: string) => void;
  handleReorderDragOver: (e: React.DragEvent, index: number) => void;
  handleReorderDrop: (e: React.DragEvent, toIndex: number) => void;
  handleReorderDragEnd: () => void;
  handleExploreClick: (event: React.MouseEvent<HTMLElement>, index: number) => void;
  handleExploreClose: (index: number) => void;
  handleExploreSelect: (index: number, option: string) => void;
}

export const TripLayoutDesktopList = ({ viewMode, layoutMode, destinations, destinationsWithTimeline, destinationDates, currentIndex, desktopListColumns, columns, reorderDragOverIndex, newlyCreatedId, showExploreButton, showInfoButton, arrivalWeatherBackgroundMode, exploreAnchorEl, handleAddDestination, handleIncreaseColumns, handleDecreaseColumns, handleListPrevious, handleListNext, handleDestinationChange, handleRemoveDestination, handleReorderDragStart, handleReorderDragOver, handleReorderDrop, handleReorderDragEnd, handleExploreClick, handleExploreClose, handleExploreSelect, ...settingsProps
}: TripLayoutDesktopListProps): ReactElement => {
  if (destinations.length === 0) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Stack
          sx={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            gap: 2,
            scrollbarGutter: "stable both-edges",
          }}
        >
          <TripHeader
            layoutMode={layoutMode}
            destinations={destinationsWithTimeline}
            tripStartDate={settingsProps.tripStartDate}
            tripEndDate={settingsProps.tripEndDate}
            dateErrorsExist={settingsProps.dateErrorsExist}
            referenceDateForStart={settingsProps.referenceDateForStart}
            mapExpanded={settingsProps.mapExpanded}
            onMapExpandChange={settingsProps.onMapExpandChange}
            onStartDateChange={settingsProps.onStartDateChange}
          />
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleAddDestination()} sx={{ mt: 2 }} fullWidth>
            New Destination
          </Button>
        </Stack>
      </Box>
    );
  }

  const slots = Array.from({ length: desktopListColumns }, (_, index) => destinationsWithTimeline[currentIndex + index] ?? null);
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
        px: 0.5,
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

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const controlRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [controlPositions, setControlPositions] = useState<Array<{ left: number; width: number }>>([]);

  useEffect(() => {
    const gridContainer = gridContainerRef.current;
    if (!gridContainer) return;

    const updatePositions = () => {
      requestAnimationFrame(() => {
        const positions = controlRefs.current
          .filter((ref) => ref !== null)
          .map((ref) => {
            if (!ref) return { left: 0, width: 0 };
            const rect = ref.getBoundingClientRect();
            return {
              left: rect.left,
              width: rect.width,
            };
          });
        setControlPositions(positions);
      });
    };

    updatePositions();
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", updatePositions, { passive: true });
    }
    window.addEventListener("resize", updatePositions);
    window.addEventListener("scroll", updatePositions, { passive: true, capture: true });

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", updatePositions);
      }
      window.removeEventListener("resize", updatePositions);
      window.removeEventListener("scroll", updatePositions, { capture: true });
    };
  }, [desktopListColumns, currentIndex]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Stack
        ref={scrollContainerRef}
        sx={{
          flex: 1,
          overflow: "auto",
          gap: 2,
          scrollbarGutter: "stable both-edges",
        }}
      >
        <TripHeader
          layoutMode={layoutMode}
          destinations={destinationsWithTimeline}
          tripStartDate={settingsProps.tripStartDate}
          tripEndDate={settingsProps.tripEndDate}
          dateErrorsExist={settingsProps.dateErrorsExist}
          referenceDateForStart={settingsProps.referenceDateForStart}
          mapExpanded={settingsProps.mapExpanded}
          onMapExpandChange={settingsProps.onMapExpandChange}
          onStartDateChange={settingsProps.onStartDateChange}
        />
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
          ref={gridContainerRef}
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
                ref={(el: HTMLDivElement | null) => {
                  controlRefs.current[boundaryIndex] = el;
                }}
                sx={{
                  gridColumn: boundaryIndex * 2 + 1,
                  gridRow: 1,
                  alignSelf: "stretch",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  position: "relative",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    visibility: "hidden",
                    pointerEvents: "none",
                  }}
                >
                  {isAddButtonWithText ? (
                    verticalAddButton
                  ) : hasDestination ? (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      {showExploreButton && (
                        <IconButton size="small" sx={{ opacity: 0.7 }}>
                          <TravelExploreIcon />
                        </IconButton>
                      )}
                      <IconButton color="primary" size="small" aria-label="add destination">
                      <AddIcon sx={{ transform: "scale(1.4)"}}/>
                      </IconButton>
                      {showInfoButton && (
                        <IconButton size="small" sx={{ opacity: 0.7 }}>
                          <InfoOutline />
                        </IconButton>
                      )}
                    </Box>
                  ) : null}
                </Box>
                <Box
                  sx={{
                    position: "fixed",
                    top: "50vh",
                    left: controlPositions[boundaryIndex] ? `${controlPositions[boundaryIndex].left}px` : "auto",
                    width: controlPositions[boundaryIndex] ? `${controlPositions[boundaryIndex].width}px` : "auto",
                    transform: "translateY(-50%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1,
                    pointerEvents: "auto",
                  }}
                >
                  {isAddButtonWithText ? (
                    verticalAddButton
                  ) : hasDestination ? (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                    <>
                      {showExploreButton && (
                        <IconButton size="small" onClick={(e) => handleExploreClick(e, insertIndex)} sx={{ opacity: 0.7 }}>
                          <TravelExploreIcon />
                        </IconButton>
                      )}
                      <Menu anchorEl={exploreAnchorEl[insertIndex]} open={Boolean(exploreAnchorEl[insertIndex])} onClose={() => handleExploreClose(insertIndex)}>
                        <MenuItem disabled sx={{ opacity: 0.6, fontWeight: 600 }}>
                          Explore...
                        </MenuItem>
                        {insertIndex > 0 && <MenuItem onClick={() => handleExploreSelect(insertIndex, `near-prev`)}>Near {destinationsWithTimeline[insertIndex - 1]?.displayName || destinationsWithTimeline[insertIndex - 1]?.name || "previous"}</MenuItem>}
                        <MenuItem onClick={() => handleExploreSelect(insertIndex, `near-next`)}>Near {destinationsWithTimeline[insertIndex]?.displayName || destinationsWithTimeline[insertIndex]?.name || "next"}</MenuItem>
                        {insertIndex > 0 && (
                          <MenuItem onClick={() => handleExploreSelect(insertIndex, `between`)}>
                            Between {destinationsWithTimeline[insertIndex - 1]?.displayName || destinationsWithTimeline[insertIndex - 1]?.name || "previous"} and {destinationsWithTimeline[insertIndex]?.displayName || destinationsWithTimeline[insertIndex]?.name || "next"}
                          </MenuItem>
                        )}
                      </Menu>
                    </>
                    <IconButton
                      onClick={() => handleAddDestination(insertIndex)}
                      color="primary"
                      size="small"
                      aria-label="add destination"
                      sx={(theme) => ({
                        ...getPulsingDropShadowSx({
                          minShadow: `0 1px 4px ${theme.palette.primary.main}80`,
                          maxShadow: `0 2px 8px ${theme.palette.primary.main}CC`,
                        }),
                      })}
                    >
                      <AddIcon sx={{ transform: "scale(1.4)"}}/>
                    </IconButton>
                    {showInfoButton && (
                      <IconButton size="small" sx={{ opacity: 0.7 }}>
                        <InfoOutline />
                      </IconButton>
                    )}
                  </Box>
                  ) : null}
                </Box>
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
                  ...(destination &&
                    reorderDragOverIndex === absoluteIndex && {
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
                  <Suspense
                    fallback={
                      <Box sx={{ p: 2 }}>
                        <Typography variant="body2">Loading destination...</Typography>
                      </Box>
                    }
                  >
                    <DestinationCard
                      destination={destination}
                      nextDestination={destinationsWithTimeline[absoluteIndex + 1]}
                      previousDestination={absoluteIndex > 0 ? destinationsWithTimeline[absoluteIndex - 1] : undefined}
                      onDestinationChange={handleDestinationChange}
                      onRemove={() => handleRemoveDestination(destination.id)}
                      shouldFocus={destination.id === newlyCreatedId}
                      alwaysExpanded
                      isFirst={absoluteIndex === 0}
                      arrivalDate={destinationDates[absoluteIndex]?.arrivalDate ?? null}
                      departureDate={destinationDates[absoluteIndex]?.departureDate ?? null}
                      dateError={destinationDates[absoluteIndex]?.error ?? undefined}
                      layoutMode={layoutMode}
                      tripStartDate={settingsProps.tripStartDate}
                      arrivalWeatherBackgroundMode={arrivalWeatherBackgroundMode}
                      isListMode={viewMode === "list"}
                      onReorderDragStart={(e) => handleReorderDragStart(e, destination.id)}
                      onReorderDragEnd={handleReorderDragEnd}
                    />
                  </Suspense>
                ) : (
                  <Box sx={{ height: 1 }} />
                )}
              </Box>
            );
          })}
          <Box
            ref={(el: HTMLDivElement | null) => {
              controlRefs.current[desktopListColumns] = el;
            }}
            sx={{
              gridColumn: desktopListColumns * 2 + 1,
              gridRow: 1,
              alignSelf: "stretch",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              position: "relative",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                visibility: "hidden",
                pointerEvents: "none",
              }}
            >
              {addButtonWithTextPosition === desktopListColumns ? (
                verticalAddButton
              ) : !showTrailingAsAddCard ? (
                <IconButton color="primary" size="small" aria-label="add destination">
                  <AddIcon sx={{ transform: "scale(1.4)"}}/>
                </IconButton>
              ) : null}
            </Box>
            <Box
              sx={{
                position: "fixed",
                top: "50vh",
                left: controlPositions[desktopListColumns] ? `${controlPositions[desktopListColumns].left}px` : "auto",
                width: controlPositions[desktopListColumns] ? `${controlPositions[desktopListColumns].width}px` : "auto",
                transform: "translateY(-50%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1,
                pointerEvents: "auto",
              }}
            >
              {addButtonWithTextPosition === desktopListColumns ? (
                verticalAddButton
              ) : !showTrailingAsAddCard ? (
                <IconButton onClick={() => handleAddDestination(trailingInsertIndex)} color="primary" size="small" aria-label="add destination">
                  <AddIcon sx={{ transform: "scale(1.4)"}}/>
                </IconButton>
              ) : null}
            </Box>
          </Box>
        </Box>
      </Stack>
    </Box>
  );
};
