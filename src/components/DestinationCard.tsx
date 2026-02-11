import { useState, useEffect, useRef, type ReactElement } from "react";
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
import { getLocationImage } from "../services/imagesService";
import { DoubleDatePicker } from "./utility/DoubleDatePicker";
import { StatusBadge } from "./utility/StatusBadge";
import { ConfirmDialog } from "./utility/ConfirmDialog";
import { SectionArrival } from "./SectionArrival";
import { SectionAccommodation } from "./SectionAccommodation";
import { SectionActivities } from "./SectionActivities";
import { SectionOnwards } from "./SectionOnwards";
import { useMenuState } from "../hooks/useMenuState";
import { useDestinationSearch } from "../hooks/useDestinationSearch";
import { useNightSelection } from "../hooks/useNightSelection";
import { DestinationCardHeaderDisplay, DestinationCardHeaderEdit } from "./DestinationCardHeader";
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
}

export const DestinationCard = ({ destination, nextDestination, previousDestination, onDestinationChange, onRemove, shouldFocus = false, alwaysExpanded = false, isFirst = false, arrivalDate = null, departureDate = null, dateError, layoutMode = "portrait", tripStartDate = null, isListMode = false, onReorderDragStart, onReorderDragEnd, arrivalWeatherBackgroundMode = "default" }: DestinationCardProps): ReactElement => {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (alwaysExpanded) {
      setExpanded(true);
    }
  }, [alwaysExpanded]);
  const [locationImageUrl, setLocationImageUrl] = useState<string | null>(null);
  const [buttonHover, setButtonHover] = useState<"remove" | "reorder" | null>(null);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const customNightsInputRef = useRef<HTMLInputElement>(null);
  const { calendar, transport, datePicker } = useMenuState();
  const { inputValue, suggestions, isLoading, isEditing, autocompleteRef, handleInputChange, handleChange, handleBlur, handleEditClick } = useDestinationSearch({
    destination,
    onDestinationChange,
    shouldFocus,
  });

  const openDatePickerFromCalendar = (): void => {
    if (calendar.anchorEl) {
      datePicker.open(calendar.anchorEl);
    }
  };

  const { showCustomNights, customNightsValue, setCustomNightsValue, handleNightSelect, handleDateRangeChange: handleNightDateRangeChange, handleCustomNightsSubmit, handleCustomNightsKeyDown } = useNightSelection({
    destination,
    onDestinationChange,
    customNightsInputRef,
    onOpenDatePicker: openDatePickerFromCalendar,
    onCloseCalendar: calendar.close,
  });

  useEffect(() => {
    const fetchImage = async (): Promise<void> => {
      if (!destination.placeDetails && !destination.displayName && !destination.name) {
        console.log("[Destination] skipping image fetch, no destination details", {
          id: destination.id,
          name: destination.name,
          displayName: destination.displayName,
          placeDetails: destination.placeDetails,
        });
        setLocationImageUrl(null);
        return;
      }

      const searchQuery = destination.displayName || destination.placeDetails?.city || destination.placeDetails?.country || destination.name;

      if (!searchQuery) {
        console.log("[Destination] no search query derived from destination, clearing image", {
          id: destination.id,
          name: destination.name,
          displayName: destination.displayName,
          placeDetails: destination.placeDetails,
        });
        setLocationImageUrl(null);
        return;
      }

      console.log("[Destination] fetching image for destination", {
        id: destination.id,
        searchQuery,
      });

      try {
        const imageUrl = await getLocationImage(searchQuery, { width: 800, height: 400 });
        console.log("[Destination] image fetch completed", {
          id: destination.id,
          searchQuery,
          imageUrl,
          hasImage: Boolean(imageUrl),
        });
        setLocationImageUrl(imageUrl);
      } catch {
        setLocationImageUrl(null);
      }
    };

    fetchImage().catch(() => {});
  }, [destination.displayName, destination.placeDetails, destination.name]);

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

  // RENDERING
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
              right: 0,
              zIndex: 0,
              boxShadow: "none",
              borderRadius: 0,
              borderTopRightRadius: theme.shape.borderRadius,
              padding: 0,
              "&:hover": {
                backgroundColor: theme.palette.mode === "dark" ? "rgba(211, 47, 47, 0.16)" : "rgba(211, 47, 47, 0.08)",
              },
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
              <Box sx={{ width: "100%" }}>
                {isEditing ? (
                  <DestinationCardHeaderEdit inputValue={inputValue} suggestions={suggestions} isLoading={isLoading} autocompleteRef={autocompleteRef as React.RefObject<HTMLDivElement | null>} onInputChange={handleInputChange} onChange={handleChange} onBlur={handleBlur} />
                ) : (
                  <DestinationCardHeaderDisplay
                    destination={destination}
                    layoutMode={layoutMode}
                    arrivalDate={arrivalDate}
                    departureDate={departureDate}
                    alwaysExpanded={alwaysExpanded}
                    expanded={expanded}
                    isFirst={isFirst}
                    currentTransport={currentTransport}
                    isTransportSet={Boolean(isTransportSet)}
                    calculatedNights={calculatedNights}
                    showCustomNights={showCustomNights}
                    customNightsValue={customNightsValue}
                    calendarOpen={calendar.isOpen}
                    calendarAnchorEl={calendar.anchorEl}
                    transportAnchorEl={transport.anchorEl}
                    transportOpen={transport.isOpen}
                    onTransportClick={handleTransportClick}
                    onTransportClose={handleTransportClose}
                    onTransportSelect={handleTransportSelect}
                    onCalendarClick={handleCalendarClick}
                    onCalendarClose={handleCalendarClose}
                    onNightSelect={handleNightSelect}
                    onExpandClick={handleExpandClick}
                    onEditClick={handleEditClick}
                    isOnwardsTravelBooked={isOnwardsTravelBooked}
                    customNightsInputRef={customNightsInputRef as React.RefObject<HTMLInputElement | null>}
                    onCustomNightsChange={setCustomNightsValue}
                    onCustomNightsKeyDown={handleCustomNightsKeyDown}
                    onCustomNightsSubmit={handleCustomNightsSubmit}
                  />
                )}
              </Box>
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
              {locationImageUrl && (
                <Box
                  component="img"
                  src={locationImageUrl}
                  alt={destination.displayName || destination.name || "Location"}
                  sx={{
                    width: "100%",
                    height: "auto",
                    maxHeight: "250px",
                    objectFit: "cover",
                    borderRadius: 0,
                    display: "block",
                  }}
                  onError={() => {
                    setLocationImageUrl(null);
                  }}
                />
              )}
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
                    arrivalWeatherBackgroundMode={arrivalWeatherBackgroundMode}
                  />
                  <SectionAccommodation destination={destination} onDestinationChange={onDestinationChange} arrivalDate={arrivalDate} />
                  <SectionActivities destination={destination} onDestinationChange={onDestinationChange} arrivalDate={arrivalDate} />
                </>
              )}
              {nextDestination && <SectionOnwards destination={destination} nextDestination={nextDestination} onDestinationChange={onDestinationChange} departureDate={departureDate} />}
            </CardContent>
          </Collapse>
          <DoubleDatePicker open={datePicker.isOpen} anchorEl={datePicker.anchorEl} onClose={datePicker.close} checkInDate={destination.arrivalDate ?? arrivalDate} checkOutDate={destination.departureDate ?? departureDate} tripStartDate={tripStartDate} calculatedArrivalDate={arrivalDate} isFirst={isFirst} onDateChange={handleDateRangeChange} />
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
