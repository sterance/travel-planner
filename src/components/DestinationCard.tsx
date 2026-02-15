import { useState, useEffect, useRef, lazy, Suspense, type ReactElement } from "react";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import dayjs, { type Dayjs } from "dayjs";
import { type Destination as DestinationType } from "../types/destination";
import { type LayoutMode } from "../App";
import { StatusBadge } from "./utility/StatusBadge";
import { ConfirmDialog } from "./utility/ConfirmDialog";

const DestinationCardHeaderLazy = lazy(async () => {
  const module = await import("./DestinationCardHeader");
  return { default: module.DestinationCardHeaderLazy };
});
const DestinationImage = lazy(async () => {
  const module = await import("./DestinationImage");
  return { default: module.DestinationImage };
});
const SectionArrival = lazy(async () => {
  const module = await import("./SectionArrival");
  return { default: module.SectionArrival };
});
const SectionAccommodation = lazy(() => import("./SectionAccommodation"));
const SectionActivities = lazy(() => import("./SectionActivities"));
const DoubleDatePicker = lazy(async () => {
  const module = await import("./utility/DoubleDatePicker");
  return { default: module.DoubleDatePicker };
});
import { SectionOnwards } from "./SectionOnwards";
import { useMenuState } from "../hooks/useMenuState";
import { useNightSelection } from "../hooks/useNightSelection";
import { SELF_TRANSPORT_MODES } from "../utils/transportConfig";

interface DestinationCardProps {
  destination: DestinationType;
  nextDestination?: DestinationType;
  previousDestination?: DestinationType;
  onDestinationChange: (destination: DestinationType) => void;
  onRemove: () => void;
  shouldFocus?: boolean;
  alwaysExpanded?: boolean;
  isFirst?: boolean;
  arrivalDate?: Dayjs | null;
  departureDate?: Dayjs | null;
  dateError?: string;
  layoutMode?: LayoutMode;
  tripStartDate?: Dayjs | null;
  isListMode?: boolean;
  onReorderDragStart?: (e: React.DragEvent) => void;
  onReorderDragEnd?: () => void;
  arrivalWeatherBackgroundMode?: "default" | "light" | "dark";
  isCarousel?: boolean;
}

export const DestinationCard = ({ destination, nextDestination, previousDestination, onDestinationChange, onRemove, shouldFocus = false, alwaysExpanded = false, isFirst = false, arrivalDate = null, departureDate = null, dateError, layoutMode = "portrait", tripStartDate = null, isListMode = false, onReorderDragStart, onReorderDragEnd, arrivalWeatherBackgroundMode = "default", isCarousel = false }: DestinationCardProps): ReactElement => {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (alwaysExpanded) {
      setExpanded(true);
    }
  }, [alwaysExpanded]);
  const [buttonHover, setButtonHover] = useState<"remove" | "reorder" | null>(null);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const customNightsInputRef = useRef<HTMLInputElement>(null);
  const { calendar, transport, datePicker } = useMenuState();

  const openDatePickerFromCalendar = (): void => {
    if (calendar.anchorEl) {
      datePicker.open(calendar.anchorEl);
    }
  };

  const {
    showCustomNights,
    customNightsValue,
    setCustomNightsValue,
    handleNightSelect,
    handleDateRangeChange: handleNightDateRangeChange,
    handleCustomNightsSubmit,
    handleCustomNightsKeyDown,
  } = useNightSelection({
    destination,
    onDestinationChange,
    customNightsInputRef,
    onOpenDatePicker: openDatePickerFromCalendar,
    onCloseCalendar: calendar.close,
  });

  const handleExpandClick = (): void => {
    setExpanded(!expanded);
  };

  const handleCalendarClick = (event: React.MouseEvent<HTMLElement>): void => {
    calendar.open(event.currentTarget);
  };

  const handleCalendarClose = (): void => {
    calendar.close();
  };

  const handleDateRangeChange = (checkIn: Dayjs | null, checkOut: Dayjs | null): void => {
    handleNightDateRangeChange(checkIn, checkOut);
    datePicker.close();
  };

  const handleTransportClick = (event: React.MouseEvent<HTMLElement>): void => {
    transport.open(event.currentTarget);
  };

  const handleTransportClose = (): void => {
    transport.close();
  };

  const handleTransportSelect = (transport: string | "unsure"): void => {
    if (transport === "unsure") {
      onDestinationChange({
        ...destination,
        transportDetails: {
          ...destination.transportDetails,
          mode: "unsure",
        },
      });
    } else {
      onDestinationChange({
        ...destination,
        transportDetails: {
          ...destination.transportDetails,
          mode: transport,
        },
      });
    }
    handleTransportClose();
  };

  const currentTransport = destination.transportDetails?.mode;
  const isTransportSet = currentTransport && currentTransport !== "unsure";

  const isOnwardsTravelBooked = (): boolean => {
    if (!nextDestination) return true;
    const nextTransport = nextDestination.transportDetails?.mode;
    if (!nextTransport) return true;
    if (SELF_TRANSPORT_MODES.includes(nextTransport as (typeof SELF_TRANSPORT_MODES)[number])) return true;
    const details = destination.transportDetails;
    return !!(details?.departureDateTime && details?.arrivalDateTime);
  };

  const getCalculatedNights = (): number | null => {
    if (destination.nights === "dates" && destination.arrivalDate && destination.departureDate) {
      const checkIn = dayjs(destination.arrivalDate);
      const checkOut = dayjs(destination.departureDate);
      if (checkIn.isValid() && checkOut.isValid()) {
        return checkOut.diff(checkIn, "day");
      }
      return null;
    }
    if (typeof destination.nights === "number") {
      return destination.nights;
    }
    return null;
  };

  const calculatedNights = getCalculatedNights();

  return (
    <>
      <Box
        sx={{
          maxWidth: "100%",
          overflow: "visible",
        }}
      >
        <Card
          sx={(theme) => ({
            position: "relative",
            overflow: "visible",
            maxWidth: "100%",
            borderTopLeftRadius: isListMode ? 0 : theme.shape.borderRadius,
            borderTopRightRadius: 0,
            borderBottomLeftRadius: theme.shape.borderRadius,
            borderBottomRightRadius: theme.shape.borderRadius,
          })}
        >
          <Paper
            component={IconButton}
            elevation={1}
            aria-label="remove destination"
            onClick={() => setRemoveDialogOpen(true)}
            onMouseEnter={() => setButtonHover("remove")}
            onMouseLeave={() => setButtonHover(null)}
            sx={(theme) => ({
              position: "absolute",
              top: -34,
              ...(isCarousel
                ? {
                    left: "50%",
                    transform: "translateX(-50%)",
                    borderTopLeftRadius: theme.shape.borderRadius,
                    borderTopRightRadius: theme.shape.borderRadius,
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      right: "100%",
                      top: 0,
                      width: "100%",
                      height: "100%",
                      backgroundColor: "inherit",
                      backgroundImage: "inherit",
                      clipPath: "polygon(100% 0, 0% 100%, 100% 100%)",
                    },
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      left: "100%",
                      top: 0,
                      width: "100%",
                      height: "100%",
                      backgroundColor: "inherit",
                      backgroundImage: "inherit",
                      clipPath: "polygon(0% 0, 0% 100%, 100% 100%)",
                    },
                    "& .MuiSvgIcon-root": {
                      transform: "translateY(0.5rem)",
                    },
                  }
                : {
                    right: 0,
                    borderTopRightRadius: theme.shape.borderRadius,
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      right: "100%",
                      top: 0,
                      width: "100%",
                      height: "100%",
                      backgroundColor: "inherit",
                      backgroundImage: "inherit",
                      clipPath: "polygon(100% 0, 0% 100%, 100% 100%)",
                    },
                  }),
              zIndex: 0,
              boxShadow: "none",
              borderRadius: 0,
              padding: 0,
              "&:hover": {
                backgroundColor: theme.palette.mode === "dark" ? "rgba(211, 47, 47, 0.16)" : "rgba(211, 47, 47, 0.08)",
              },
            })}
          >
            <DeleteOutlineIcon fontSize="large" />
          </Paper>
          {isListMode && (
            <Paper
              component={IconButton}
              elevation={1}
              aria-label="reorder destination"
              draggable={!!onReorderDragStart}
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = "move";
                onReorderDragStart?.(e);
              }}
              onDragEnd={() => onReorderDragEnd?.()}
              onMouseEnter={() => setButtonHover("reorder")}
              onMouseLeave={() => setButtonHover(null)}
              sx={(theme) => ({
                position: "absolute",
                top: -34,
                left: 0,
                zIndex: 0,
                boxShadow: "none",
                borderRadius: 0,
                borderTopLeftRadius: theme.shape.borderRadius,
                cursor: onReorderDragStart ? "grab" : undefined,
                "&:active": onReorderDragStart ? { cursor: "grabbing" } : undefined,
                padding: 0,
                "&:hover": {
                  backgroundColor: theme.palette.mode === "dark" ? "rgba(25, 118, 210, 0.16)" : "rgba(25, 118, 210, 0.08)",
                },
                "&::after": {
                  content: '""',
                  position: "absolute",
                  left: "100%",
                  top: 0,
                  width: "100%",
                  height: "100%",
                  backgroundColor: "inherit",
                  backgroundImage: "inherit",
                  clipPath: "polygon(0 0, 0% 100%, 100% 100%)",
                },
              })}
            >
              <DragIndicatorIcon fontSize="large" sx={{ transform: "rotate(90deg)" }} />
            </Paper>
          )}
          <CardHeader
            title={
              <Suspense fallback={<Box sx={{ width: "100%" }} />}>
                <DestinationCardHeaderLazy destination={destination} layoutMode={layoutMode} arrivalDate={arrivalDate} departureDate={departureDate} alwaysExpanded={alwaysExpanded} expanded={expanded} isFirst={isFirst} currentTransport={currentTransport} isTransportSet={Boolean(isTransportSet)} calculatedNights={calculatedNights} showCustomNights={showCustomNights} customNightsValue={customNightsValue} calendarOpen={calendar.isOpen} calendarAnchorEl={calendar.anchorEl} transportAnchorEl={transport.anchorEl} transportOpen={transport.isOpen} onTransportClick={handleTransportClick} onTransportClose={handleTransportClose} onTransportSelect={handleTransportSelect} onCalendarClick={handleCalendarClick} onCalendarClose={handleCalendarClose} onNightSelect={handleNightSelect} onExpandClick={handleExpandClick} isOnwardsTravelBooked={isOnwardsTravelBooked} customNightsInputRef={customNightsInputRef as React.RefObject<HTMLInputElement | null>} onCustomNightsChange={setCustomNightsValue} onCustomNightsKeyDown={handleCustomNightsKeyDown} onCustomNightsSubmit={handleCustomNightsSubmit} onDestinationChange={onDestinationChange} shouldFocus={shouldFocus}
                />
              </Suspense>
            }
            sx={(theme) => ({
              "& .MuiCardHeader-content": {
                width: "100%",
                overflow: "visible",
              },
              pb: alwaysExpanded ? "1rem" : 0,
              overflow: "visible",
              ...(buttonHover === "remove" && {
                backgroundColor: theme.palette.mode === "dark" ? "rgba(211, 47, 47, 0.16)" : "rgba(211, 47, 47, 0.08)",
              }),
              ...(buttonHover === "reorder" && {
                backgroundColor: theme.palette.mode === "dark" ? "rgba(25, 118, 210, 0.16)" : "rgba(25, 118, 210, 0.08)",
              }),
            })}
          />
          <Collapse in={alwaysExpanded || expanded} timeout="auto" unmountOnExit sx={{ overflow: "visible" }}>
            <CardContent
              sx={{
                padding: 0,
                "&:last-child": { pb: 0 },
                overflow: "hidden",
              }}
            >
              <Suspense fallback={null}>
                <DestinationImage destination={destination} />
              </Suspense>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: arrivalDate && departureDate ? "space-between" : arrivalDate ? "flex-start" : "flex-end", py: 1.5, px: 2, position: "relative", overflow: "visible" }}>
                {arrivalDate && (
                  <StatusBadge variant="warning" visible={!!dateError} attachToText>
                    <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
                      {arrivalDate.format("MMM D, YYYY")}
                    </Typography>
                  </StatusBadge>
                )}
                {departureDate && (
                  <StatusBadge variant="info" visible={!isOnwardsTravelBooked()} attachToText>
                    <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
                      {departureDate.format("MMM D, YYYY")}
                    </Typography>
                  </StatusBadge>
                )}
              </Box>
              {currentTransport !== "starting point" && (
                <>
                  <Suspense fallback={null}>
                    <SectionArrival
                      destination={destination}
                      previousDestination={previousDestination}
                      arrivalDate={arrivalDate}
                      onArrivalTimeChange={(dateTime: Dayjs | null) => {
                        onDestinationChange({
                          ...destination,
                          arrivalTime: dateTime,
                        });
                      }}
                      onDestinationChange={onDestinationChange}
                      arrivalWeatherBackgroundMode={arrivalWeatherBackgroundMode}
                    />
                  </Suspense>
                  <Suspense fallback={null}>
                    <SectionAccommodation destination={destination} onDestinationChange={onDestinationChange} arrivalDate={arrivalDate} />
                  </Suspense>
                  <Suspense fallback={null}>
                    <SectionActivities destination={destination} onDestinationChange={onDestinationChange} arrivalDate={arrivalDate} />
                  </Suspense>
                </>
              )}
              {nextDestination && <SectionOnwards destination={destination} nextDestination={nextDestination} onDestinationChange={onDestinationChange} departureDate={departureDate} />}
            </CardContent>
          </Collapse>
          {datePicker.isOpen && (
            <Suspense fallback={null}>
              <DoubleDatePicker open={datePicker.isOpen} anchorEl={datePicker.anchorEl} onClose={datePicker.close} checkInDate={destination.arrivalDate ?? arrivalDate} checkOutDate={destination.departureDate ?? departureDate} tripStartDate={tripStartDate} calculatedArrivalDate={arrivalDate} isFirst={isFirst} onDateChange={handleDateRangeChange} />
            </Suspense>
          )}
        </Card>
      </Box>
      <ConfirmDialog
        open={removeDialogOpen}
        onClose={() => setRemoveDialogOpen(false)}
        title="Remove Destination"
        message={<>Are you sure you want to remove &quot;{destination.displayName || destination.name || "this destination"}&quot;?</>}
        confirmLabel="Remove"
        onConfirm={() => {
          setRemoveDialogOpen(false);
          onRemove();
        }}
        confirmButtonColor="error"
      />
    </>
  );
};
