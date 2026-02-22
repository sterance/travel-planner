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
import AddIcon from "@mui/icons-material/Add";
import { InfoOutline } from "@mui/icons-material";
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import { type Dayjs } from "dayjs";
import { TripHeader, type TripHeaderProps } from "./TripHeader";
import { MagnificationControls } from "./MagnificationControls";
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
  setColumns: (value: number) => void;
  reorderDragOverIndex: number | null;
  newlyCreatedId: string | null;
  showExploreButton: boolean;
  showInfoButton: boolean;
  arrivalWeatherBackgroundMode: ArrivalWeatherBackgroundMode;
  exploreAnchorEl: { [key: string]: HTMLElement | null };
  handleAddDestination: (index?: number) => void;
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

export const TripLayoutDesktopList = ({ viewMode, layoutMode, destinations, destinationsWithTimeline, destinationDates, currentIndex, desktopListColumns, columns, setColumns, reorderDragOverIndex, newlyCreatedId, showExploreButton, showInfoButton, arrivalWeatherBackgroundMode, exploreAnchorEl, handleAddDestination, handleListPrevious, handleListNext, handleDestinationChange, handleRemoveDestination, handleReorderDragStart, handleReorderDragOver, handleReorderDrop, handleReorderDragEnd, handleExploreClick, handleExploreClose, handleExploreSelect, ...settingsProps
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

  const clampColumnsForSet = (nextRaw: number | null): void => {
    if (nextRaw === null) return;
    if (!Number.isFinite(nextRaw)) return;

    const nextRounded = Math.round(nextRaw);
    const nextClampedToHardBounds = Math.min(7, Math.max(3, nextRounded));

    if (nextClampedToHardBounds <= columns) {
      setColumns(nextClampedToHardBounds);
      return;
    }

    const destinationCap = destinations.length;
    const nextClamped = Math.min(nextClampedToHardBounds, destinationCap);

    if (nextClamped <= columns) {
      return;
    }

    setColumns(nextClamped);
  };

  const verticalAddButton = (
    <Button
      variant="contained"
      onClick={() => handleAddDestination()}
      sx={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 0,
        px: 0.5,
        whiteSpace: "nowrap",
        writingMode: "vertical-lr",
        textOrientation: "upright",
        minWidth: 0,
        transition: "gap 0.3s ease, transform 0.3s ease",
        "& .add-label": {
          maxHeight: 0,
          overflow: "hidden",
          opacity: 0,
          transition: "max-height 0.3s ease, opacity 0.3s ease",
        },
        "&:hover": {
          gap: 0.5,
          transform: "translateY(-50%)",
        },
        "&:hover .add-label": {
          maxHeight: 400,
          opacity: 1,
        },
      }}
    >
      <AddIcon sx={{ flexShrink: 0 }} />
      <span className="add-label">New Destination</span>
    </Button>
  );

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const controlRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const buttonStackRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [controlPositions, setControlPositions] = useState<Array<{ left: number; width: number; clampedTop: number | null }>>([]);

  useEffect(() => {
    const gridContainer = gridContainerRef.current;
    if (!gridContainer) return;

    const RIBBON_OFFSET_PX = 35;
    const viewportCenterY = () => window.innerHeight / 2;

    const updatePositions = () => {
      requestAnimationFrame(() => {
        const positions: Array<{ left: number; width: number; clampedTop: number | null }> = [];
        for (let i = 0; i <= desktopListColumns; i++) {
          const controlEl = controlRefs.current[i];
          const left = controlEl?.getBoundingClientRect().left ?? 0;
          const width = controlEl?.getBoundingClientRect().width ?? 0;

          const leftCard = i > 0 ? cardRefs.current[i - 1] : null;
          const rightCard = i < desktopListColumns ? cardRefs.current[i] : null;
          const leftRect = leftCard?.getBoundingClientRect();
          const rightRect = rightCard?.getBoundingClientRect();
          const leftContentRect = leftCard?.firstElementChild?.getBoundingClientRect();
          const rightContentRect = rightCard?.firstElementChild?.getBoundingClientRect();

          const stackEl = buttonStackRefs.current[i];
          const stackHeight = stackEl?.getBoundingClientRect().height ?? 0;

          let clampedTop: number | null = null;
          if (stackHeight > 0) {
            let topBound = -Infinity;
            if (leftRect) topBound = Math.max(topBound, leftRect.top - RIBBON_OFFSET_PX);
            if (rightRect) topBound = Math.max(topBound, rightRect.top - RIBBON_OFFSET_PX);

            let bottomBound = -Infinity;
            if (leftContentRect) bottomBound = Math.max(bottomBound, leftContentRect.bottom);
            if (rightContentRect) bottomBound = Math.max(bottomBound, rightContentRect.bottom);
            if (bottomBound === -Infinity) bottomBound = Infinity;

            const hasBounds = leftRect != null || rightRect != null;
            if (hasBounds) {
              let top = viewportCenterY() - stackHeight / 2;
              if (top < topBound) top = topBound;
              if (top + stackHeight > bottomBound) top = bottomBound - stackHeight;
              if (top < topBound) top = topBound;
              clampedTop = top;
            }
          }

          positions.push({ left, width, clampedTop });
        }
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
    const resizeObserver = new ResizeObserver(updatePositions);
    resizeObserver.observe(gridContainer);
    const deferredUpdate = () => {
      const rafId = requestAnimationFrame(() => {
        requestAnimationFrame(updatePositions);
      });
      const timeoutId = setTimeout(updatePositions, 350);
      return () => {
        cancelAnimationFrame(rafId);
        clearTimeout(timeoutId);
      };
    };
    const cancelDeferred = deferredUpdate();

    return () => {
      cancelDeferred();
      resizeObserver.disconnect();
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", updatePositions);
      }
      window.removeEventListener("resize", updatePositions);
      window.removeEventListener("scroll", updatePositions, { capture: true });
    };
  }, [desktopListColumns, currentIndex, settingsProps.mapExpanded]);

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
              justifyContent: "center",
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
                        <AddIcon sx={{ transform: "scale(1.4)" }} />
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
                  ref={(el: HTMLDivElement | null) => {
                    buttonStackRefs.current[boundaryIndex] = el;
                  }}
                  sx={{
                    position: "fixed",
                    top: controlPositions[boundaryIndex]?.clampedTop != null ? `${controlPositions[boundaryIndex].clampedTop}px` : "50vh",
                    left: controlPositions[boundaryIndex] ? `${controlPositions[boundaryIndex].left}px` : "auto",
                    width: controlPositions[boundaryIndex] ? `${controlPositions[boundaryIndex].width}px` : "auto",
                    transform: controlPositions[boundaryIndex]?.clampedTop != null ? "none" : "translateY(-50%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1,
                    pointerEvents: "auto",
                    overflow: "visible",
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
                          {/* {insertIndex > 0 && (
                            <MenuItem onClick={() => handleExploreSelect(insertIndex, `between`)}>
                              Between {destinationsWithTimeline[insertIndex - 1]?.displayName || destinationsWithTimeline[insertIndex - 1]?.name || "previous"} and {destinationsWithTimeline[insertIndex]?.displayName || destinationsWithTimeline[insertIndex]?.name || "next"}
                            </MenuItem>
                          )} */}
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
                        <AddIcon sx={{ transform: "scale(1.4)" }} />
                      </IconButton>
                      {showInfoButton && (
                        <IconButton size="small" sx={{ opacity: 0.7 }}>
                          <InfoOutline />
                        </IconButton>
                      )}
                    </Box>
                  ) : null}
                </Box>

                {boundaryIndex === 0 && !isAddButtonWithText && (
                  <Box
                    sx={{
                      position: "fixed",
                      bottom: 16,
                      left: controlPositions[boundaryIndex] ? `${controlPositions[boundaryIndex].left}px` : "auto",
                      width: controlPositions[boundaryIndex] ? `${controlPositions[boundaryIndex].width}px` : "auto",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 1,
                      pointerEvents: "auto",
                    }}
                  >
                    <MagnificationControls columns={columns} destinationCount={destinations.length} onColumnsChange={clampColumnsForSet} />
                  </Box>
                )}
              </Box>
            );
          })}
          {slots.map((destination, relativeIndex) => {
            const absoluteIndex = currentIndex + relativeIndex;
            return (
              <Box
                key={destination?.id ?? `empty-${absoluteIndex}`}
                ref={(el: HTMLDivElement | null) => {
                  cardRefs.current[relativeIndex] = el;
                }}
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
                      borderRadius: 2,
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
                  <AddIcon sx={{ transform: "scale(1.4)" }} />
                </IconButton>
              ) : null}
            </Box>
            <Box
              ref={(el: HTMLDivElement | null) => {
                buttonStackRefs.current[desktopListColumns] = el;
              }}
              sx={{
                position: "fixed",
                top: controlPositions[desktopListColumns]?.clampedTop != null ? `${controlPositions[desktopListColumns].clampedTop}px` : "50vh",
                left: controlPositions[desktopListColumns] ? `${controlPositions[desktopListColumns].left}px` : "auto",
                width: controlPositions[desktopListColumns] ? `${controlPositions[desktopListColumns].width}px` : "auto",
                transform: controlPositions[desktopListColumns]?.clampedTop != null ? "none" : "translateY(-50%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1,
                pointerEvents: "auto",
                overflow: "visible",
              }}
            >
              {addButtonWithTextPosition === desktopListColumns ? (
                verticalAddButton
              ) : !showTrailingAsAddCard ? (
                <IconButton
                onClick={() => handleAddDestination(trailingInsertIndex)} 
                color="primary" 
                size="small" 
                aria-label="add destination" 
                sx={(theme) => ({
                  ...getPulsingDropShadowSx({
                    minShadow: `0 1px 4px ${theme.palette.primary.main}80`,
                    maxShadow: `0 2px 8px ${theme.palette.primary.main}CC`,
                  }),
                })}>
                  <AddIcon sx={{ transform: "scale(1.4)" }} />
                </IconButton>
              ) : null}
            </Box>
          </Box>
        </Box>
      </Stack>
    </Box>
  );
};
