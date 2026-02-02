import { useState, useEffect, useRef, type ReactElement } from "react";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import FlightIcon from "@mui/icons-material/Flight";
import OutlinedFlagIcon from "@mui/icons-material/OutlinedFlag";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import TrainIcon from "@mui/icons-material/Train";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import DirectionsBoatIcon from "@mui/icons-material/DirectionsBoat";
import DirectionsWalkIcon from "@mui/icons-material/DirectionsWalk";
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import ModeOfTravelIcon from "@mui/icons-material/ModeOfTravel";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import LocalTaxiIcon from "@mui/icons-material/LocalTaxi";
import dayjs, { type Dayjs } from "dayjs";
import { type Destination as DestinationType } from "../types/destination";
import { type LayoutMode } from "../App";
import { searchPlaces, type PlaceSuggestion } from "../services/placeService";
import { getLocationImage } from "../services/imageService";
import { DestinationSection } from "./DestinationSection";
import { getTransportLinks, buildAccommodationLinks, type TransportLink } from "../utils/externalLinks";
import Button from "@mui/material/Button";
import { TransportDetailsModal } from "./TransportDetailsModal";
import { DoubleDatePicker } from "./DoubleDatePicker";
import { StatusBadge } from "./StatusBadge";
import { ArrivalTimeWeather } from "./ArrivalTimeWeather";
import { ConfirmDialog } from "./ConfirmDialog";
import googleMapsIcon from "../assets/icons/google-maps.svg";
import googleFlightsIcon from "../assets/icons/google-flights.svg";
import skyscannerIcon from "../assets/icons/skyscanner.svg";
import rome2rioIcon from "../assets/icons/rome2rio.svg";
import bookingIcon from "../assets/icons/booking.svg";
import hostelworldIcon from "../assets/icons/hostelworld.svg";
import uberIcon from "../assets/icons/uber.svg";
import tripAdvisorIcon from "../assets/icons/trip-advisor.svg";
import getYourGuideIcon from "../assets/icons/get-your-guide.svg";
import calendar0Icon from "../assets/icons/calendar/calendar-0.svg";
import calendar1Icon from "../assets/icons/calendar/calendar-1.svg";
import calendar2Icon from "../assets/icons/calendar/calendar-2.svg";
import calendar3Icon from "../assets/icons/calendar/calendar-3.svg";
import calendar4Icon from "../assets/icons/calendar/calendar-4.svg";
import calendar5Icon from "../assets/icons/calendar/calendar-5.svg";
import calendar6Icon from "../assets/icons/calendar/calendar-6.svg";
import calendar7Icon from "../assets/icons/calendar/calendar-7.svg";
import calendar8Icon from "../assets/icons/calendar/calendar-8.svg";
import calendar9Icon from "../assets/icons/calendar/calendar-9.svg";

const calendarIcons = [calendar0Icon, calendar1Icon, calendar2Icon, calendar3Icon, calendar4Icon, calendar5Icon, calendar6Icon, calendar7Icon, calendar8Icon, calendar9Icon];

interface DestinationProps {
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
}

export const Destination = ({ destination, nextDestination, previousDestination, onDestinationChange, onRemove, shouldFocus = false, alwaysExpanded = false, isFirst = false, arrivalDate = null, departureDate = null, dateError, layoutMode = "portrait", tripStartDate = null, isListMode = false, onReorderDragStart, onReorderDragEnd }: DestinationProps): ReactElement => {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (alwaysExpanded) {
      setExpanded(true);
    }
  }, [alwaysExpanded]);
  const [inputValue, setInputValue] = useState(destination.name);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(destination.name === "" || shouldFocus);
  const [calendarAnchorEl, setCalendarAnchorEl] = useState<null | HTMLElement>(null);
  const [transportAnchorEl, setTransportAnchorEl] = useState<null | HTMLElement>(null);
  const [showCustomNights, setShowCustomNights] = useState(false);
  const [customNightsValue, setCustomNightsValue] = useState("");
  const [locationImageUrl, setLocationImageUrl] = useState<string | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [datePickerAnchorEl, setDatePickerAnchorEl] = useState<HTMLElement | null>(null);
  const [buttonHover, setButtonHover] = useState<'remove' | 'reorder' | null>(null);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const autocompleteRef = useRef<HTMLDivElement>(null);
  const customNightsInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(destination.name);
  }, [destination.name]);

  useEffect(() => {
    if (shouldFocus) {
      const timeoutId = setTimeout(() => {
        if (autocompleteRef.current) {
          const input = autocompleteRef.current.querySelector("input");
          if (input) {
            input.focus();
            setIsEditing(true);
          }
        }
      }, 50);
      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [shouldFocus]);

  useEffect(() => {
    if (!isEditing || inputValue.length < 2) {
      setSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      const results = await searchPlaces(inputValue);
      setSuggestions(results);
      setIsLoading(false);
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [inputValue, isEditing]);

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

      const imageUrl = await getLocationImage(searchQuery, { width: 800, height: 400 });
      console.log("[Destination] image fetch completed", {
        id: destination.id,
        searchQuery,
        imageUrl,
        hasImage: Boolean(imageUrl),
      });
      setLocationImageUrl(imageUrl);
    };

    fetchImage();
  }, [destination.displayName, destination.placeDetails, destination.name]);

  const handleExpandClick = (): void => {
    setExpanded(!expanded);
  };

  const handleInputChange = (_event: unknown, newValue: string | null): void => {
    const value = newValue || "";
    setInputValue(value);
    if (!value) {
      onDestinationChange({
        ...destination,
        name: "",
        displayName: "",
        placeDetails: undefined,
      });
    }
  };

  const handleChange = (_event: unknown, value: string | PlaceSuggestion | null, _reason?: unknown, _details?: unknown): void => {
    if (value && typeof value !== "string") {
      onDestinationChange({
        ...destination,
        name: value.name,
        displayName: value.displayName,
        placeDetails: value.placeDetails,
      });
      setIsEditing(false);
    } else if (typeof value === "string") {
      const cityName = value.includes(",") ? value.split(",")[0].trim() : value;
      onDestinationChange({
        ...destination,
        name: value,
        displayName: cityName,
        placeDetails: undefined,
      });
    }
  };

  const handleBlur = (): void => {
    if (inputValue && !destination.placeDetails) {
      const cityName = inputValue.includes(",") ? inputValue.split(",")[0].trim() : inputValue;
      onDestinationChange({
        ...destination,
        name: inputValue,
        displayName: cityName,
      });
    }
    setIsEditing(false);
  };

  const handleEditClick = (): void => {
    setIsEditing(true);
    setTimeout(() => {
      const input = autocompleteRef.current?.querySelector("input");
      if (input) {
        input.focus();
      }
    }, 0);
  };

  const handleCalendarClick = (event: React.MouseEvent<HTMLElement>): void => {
    setCalendarAnchorEl(event.currentTarget);
  };

  const handleCalendarClose = (): void => {
    setCalendarAnchorEl(null);
  };

  const handleNightSelect = (nights: number | "none" | "more" | "dates" | "unsure"): void => {
    if (nights === "more") {
      setShowCustomNights(true);
      handleCalendarClose();
      setTimeout(() => {
        customNightsInputRef.current?.focus();
      }, 0);
    } else if (nights === "dates") {
      handleCalendarClose();
      setDatePickerAnchorEl(calendarAnchorEl);
    } else if (nights === "unsure") {
      onDestinationChange({ ...destination, nights: null, checkInDate: undefined, checkOutDate: undefined });
      handleCalendarClose();
    } else {
      onDestinationChange({ ...destination, nights, checkInDate: undefined, checkOutDate: undefined });
      handleCalendarClose();
    }
  };

  const handleDateRangeChange = (checkIn: Dayjs | null, checkOut: Dayjs | null): void => {
    onDestinationChange({
      ...destination,
      nights: "dates",
      checkInDate: checkIn?.toISOString(),
      checkOutDate: checkOut?.toISOString(),
    });
    setDatePickerAnchorEl(null);
  };

  const handleCustomNightsSubmit = (): void => {
    const parsed = parseInt(customNightsValue, 10);
    if (!isNaN(parsed) && parsed > 0) {
      onDestinationChange({ ...destination, nights: parsed });
    }
    setShowCustomNights(false);
    setCustomNightsValue("");
  };

  const handleCustomNightsKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "Enter") {
      handleCustomNightsSubmit();
    } else if (event.key === "Escape") {
      setShowCustomNights(false);
      setCustomNightsValue("");
    }
  };

  const handleTransportClick = (event: React.MouseEvent<HTMLElement>): void => {
    setTransportAnchorEl(event.currentTarget);
  };

  const handleTransportClose = (): void => {
    setTransportAnchorEl(null);
  };

  const handleTransportSelect = (transport: string | "unsure"): void => {
    if (transport === "unsure") {
      onDestinationChange({ ...destination, transport: undefined });
    } else {
      onDestinationChange({ ...destination, transport });
    }
    handleTransportClose();
  };

  const getTransportLabel = (transport: string): string => {
    switch (transport) {
      case "by plane":
        return "flight";
      case "by bus":
        return "bus";
      case "by train":
        return "train";
      case "by boat":
        return "voyage";
      default:
        return "details";
    }
  };

  const handleTransportDetailsSave = (details: DestinationType["transportDetails"]): void => {
    onDestinationChange({ ...destination, transportDetails: details });
  };

  const selfTransportModes = ["by car", "by motorbike", "by bicycle", "on foot", "starting point"];

  const isOnwardsTravelBooked = (): boolean => {
    if (!nextDestination) return true;
    if (!nextDestination.transport) return true;
    if (selfTransportModes.includes(nextDestination.transport)) return true;
    const details = destination.transportDetails;
    return !!(details?.departureDateTime && details?.arrivalDateTime);
  };

  const formatDateTime = (dateTimeString?: string): string => {
    if (!dateTimeString) return "";
    const date = dayjs(dateTimeString);
    return date.format("MMM D, YYYY h:mm A");
  };

  const getCalculatedNights = (): number | null => {
    if (destination.nights === "dates" && destination.checkInDate && destination.checkOutDate) {
      const checkIn = dayjs(destination.checkInDate);
      const checkOut = dayjs(destination.checkOutDate);
      return checkOut.diff(checkIn, "day");
    }
    if (typeof destination.nights === "number") {
      return destination.nights;
    }
    return null;
  };

  const calculatedNights = getCalculatedNights();

  const getTransportIcon = (): ReactElement => {
    switch (destination.transport) {
      case "starting point":
        return <OutlinedFlagIcon sx={{ fontSize: "2rem" }} />;
      case "by plane":
        return <FlightIcon sx={{ fontSize: "2rem" }} />;
      case "by bus":
        return <DirectionsBusIcon sx={{ fontSize: "2rem" }} />;
      case "by train":
        return <TrainIcon sx={{ fontSize: "2rem" }} />;
      case "by boat":
        return <DirectionsBoatIcon sx={{ fontSize: "2rem" }} />;
      case "by car":
        return <DirectionsCarIcon sx={{ fontSize: "2rem" }} />;
      case "on foot":
        return <DirectionsWalkIcon sx={{ fontSize: "2rem" }} />;
      case "by bicycle":
        return <DirectionsBikeIcon sx={{ fontSize: "2rem" }} />;
      case "by motorbike":
        return <TwoWheelerIcon sx={{ fontSize: "2rem" }} />;
      default:
        return <ModeOfTravelIcon sx={{ fontSize: "2rem" }} />;
    }
  };

  const renderTransportLinks = (links: TransportLink[]): ReactElement | null => {
    if (links.length === 0) {
      return null;
    }

    if (links.length === 1) {
      const link = links[0];
      return (
        <Button
          variant="outlined"
          fullWidth
          onClick={() => {
            window.open(link.url, "_blank", "noopener,noreferrer");
          }}
          sx={{
            bgcolor: "white",
            color: "black !important",
            borderColor: "divider",
            "&:hover": {
              bgcolor: "grey.50",
              borderColor: "divider",
              color: "black !important",
            },
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          {link.icon === "google-maps" && (
            <Box
              component="img"
              src={googleMapsIcon}
              alt=""
              sx={{
                height: "1.25rem",
                width: "auto",
                maxWidth: "100%",
                objectFit: "contain",
              }}
            />
          )}
          {link.icon === "google-flights" && (
            <Box
              component="img"
              src={googleFlightsIcon}
              alt=""
              sx={{
                height: "1.25rem",
                width: "auto",
                maxWidth: "100%",
                objectFit: "contain",
              }}
            />
          )}
          {link.icon === "skyscanner" && (
            <Box
              component="img"
              src={skyscannerIcon}
              alt=""
              sx={{
                height: "1.25rem",
                width: "auto",
                maxWidth: "100%",
                objectFit: "contain",
              }}
            />
          )}
          {link.icon === "rome2rio" && (
            <Box
              component="img"
              src={rome2rioIcon}
              alt=""
              sx={{
                height: "1.25rem",
                width: "auto",
                maxWidth: "100%",
                objectFit: "contain",
              }}
            />
          )}
          {link.icon === "booking" && (
            <Box
              component="img"
              src={bookingIcon}
              alt=""
              sx={{
                height: "1.25rem",
                width: "auto",
                maxWidth: "100%",
                objectFit: "contain",
              }}
            />
          )}
          {link.icon === "hostelworld" && (
            <Box
              component="img"
              src={hostelworldIcon}
              alt=""
              sx={{
                height: "1.25rem",
                width: "auto",
                maxWidth: "100%",
                objectFit: "contain",
              }}
            />
          )}
          {link.label}
        </Button>
      );
    }

    return (
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 1,
        }}
      >
        {links.map((link) => (
          <Button
            key={link.label}
            variant="outlined"
            fullWidth
            onClick={() => {
              window.open(link.url, "_blank", "noopener,noreferrer");
            }}
            sx={{
              bgcolor: "white",
              color: "black !important",
              borderColor: "divider",
              "&:hover": {
                bgcolor: "grey.50",
                borderColor: "divider",
                color: "black !important",
              },
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            {link.icon === "google-maps" && (
              <Box
                component="img"
                src={googleMapsIcon}
                alt=""
                sx={{
                  height: "1.25rem",
                  width: "auto",
                  maxWidth: "100%",
                  objectFit: "contain",
                }}
              />
            )}
            {link.icon === "google-flights" && (
              <Box
                component="img"
                src={googleFlightsIcon}
                alt=""
                sx={{
                  height: "1.25rem",
                  width: "auto",
                  maxWidth: "100%",
                  objectFit: "contain",
                }}
              />
            )}
            {link.icon === "skyscanner" && (
              <Box
                component="img"
                src={skyscannerIcon}
                alt=""
                sx={{
                  height: "1.25rem",
                  width: "auto",
                  maxWidth: "100%",
                  objectFit: "contain",
                }}
              />
            )}
            {link.icon === "rome2rio" && (
              <Box
                component="img"
                src={rome2rioIcon}
                alt=""
                sx={{
                  height: "1.25rem",
                  width: "auto",
                  maxWidth: "100%",
                  objectFit: "contain",
                }}
              />
            )}
            {link.icon === "booking" && (
              <Box
                component="img"
                src={bookingIcon}
                alt=""
                sx={{
                  height: "1.25rem",
                  width: "auto",
                  maxWidth: "100%",
                  objectFit: "contain",
                }}
              />
            )}
            {link.icon === "hostelworld" && (
              <Box
                component="img"
                src={hostelworldIcon}
                alt=""
                sx={{
                  height: "1.25rem",
                  width: "auto",
                  maxWidth: "100%",
                  objectFit: "contain",
                }}
              />
            )}
            {link.label}
          </Button>
        ))}
      </Box>
    );
  };
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
          onMouseEnter={() => setButtonHover('remove')}
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
              backgroundColor: theme.palette.mode === "dark" 
                ? "rgba(211, 47, 47, 0.16)"
                : "rgba(211, 47, 47, 0.08)",
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
            onMouseEnter={() => setButtonHover('reorder')}
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
                backgroundColor: theme.palette.mode === "dark" 
                  ? "rgba(25, 118, 210, 0.16)"
                  : "rgba(25, 118, 210, 0.08)",
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
                <Box sx={{ position: "relative", width: "100%" }}>
                  <Autocomplete
                    ref={autocompleteRef}
                    freeSolo
                    options={suggestions}
                    getOptionLabel={(option) => {
                      if (typeof option === "string") {
                        return option;
                      }
                      return option.name;
                    }}
                    inputValue={inputValue}
                    onInputChange={handleInputChange}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    loading={isLoading}
                    renderInput={(params) => {
                      const { InputProps: inputProps, ...textFieldParams } = params;
                      return (
                        <TextField
                          {...textFieldParams}
                          placeholder="Destination name"
                          variant="standard"
                          sx={{
                            width: "100%",
                            "& .MuiInputBase-input": {
                              textAlign: "center",
                            },
                            "& .MuiInput-underline:before": {
                              display: "none",
                            },
                            "& .MuiInput-underline:after": {
                              display: "none",
                            },
                            "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
                              display: "none",
                            },
                          }}
                          slotProps={{
                            input: {
                              ...inputProps,
                            },
                          }}
                        />
                      );
                    }}
                    sx={{
                      width: "100%",
                      "& .MuiAutocomplete-endAdornment": {
                        position: "absolute",
                        right: "8px",
                      },
                      "& .MuiInputBase-root": {
                        paddingRight: "0 !important",
                      },
                      "& .MuiInputBase-input": {
                        paddingLeft: "40px !important",
                        paddingRight: "40px !important",
                      },
                    }}
                  />
                </Box>
              ) : (
                <Box sx={{ position: "relative", width: "100%", display: "flex", alignItems: "center" }}>
                  <Box sx={{ position: "absolute", left: 0, pt: 0.5, pl: 0.5 }}>
                    <StatusBadge variant="info" visible={!destination.transport}>
                      <IconButton aria-label="transport" size="small" onClick={handleTransportClick} sx={{ padding: 0.5 }}>
                        {getTransportIcon()}
                      </IconButton>
                    </StatusBadge>
                  </Box>
                  <Menu anchorEl={transportAnchorEl} open={Boolean(transportAnchorEl)} onClose={handleTransportClose}>
                    <MenuItem onClick={() => handleTransportSelect("unsure")}>
                      <HelpOutlineIcon sx={{ mr: 1 }} />
                      Unsure
                    </MenuItem>
                    {isFirst && (
                      <MenuItem onClick={() => handleTransportSelect("starting point")}>
                        <OutlinedFlagIcon sx={{ mr: 1 }} />
                        Starting point
                      </MenuItem>
                    )}
                    <MenuItem onClick={() => handleTransportSelect("by plane")}>
                      <FlightIcon sx={{ mr: 1 }} />
                      By plane
                    </MenuItem>
                    <MenuItem onClick={() => handleTransportSelect("by bus")}>
                      <DirectionsBusIcon sx={{ mr: 1 }} />
                      By bus
                    </MenuItem>
                    <MenuItem onClick={() => handleTransportSelect("by train")}>
                      <TrainIcon sx={{ mr: 1 }} />
                      By train
                    </MenuItem>
                    <MenuItem onClick={() => handleTransportSelect("by boat")}>
                      <DirectionsBoatIcon sx={{ mr: 1 }} />
                      By boat
                    </MenuItem>
                    <MenuItem onClick={() => handleTransportSelect("by car")}>
                      <DirectionsCarIcon sx={{ mr: 1 }} />
                      By car
                    </MenuItem>
                    <MenuItem onClick={() => handleTransportSelect("by motorbike")}>
                      <TwoWheelerIcon sx={{ mr: 1 }} />
                      By motorbike
                    </MenuItem>
                    <MenuItem onClick={() => handleTransportSelect("by bicycle")}>
                      <DirectionsBikeIcon sx={{ mr: 1 }} />
                      By bicycle
                    </MenuItem>
                    <MenuItem onClick={() => handleTransportSelect("on foot")}>
                      <DirectionsWalkIcon sx={{ mr: 1 }} />
                      On foot
                    </MenuItem>
                  </Menu>
                  <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
                    <Typography
                      variant="h6"
                      component="div"
                      onClick={handleEditClick}
                      sx={{
                        textAlign: "center",
                        cursor: "text",
                      }}
                    >
                      {destination.displayName || destination.name || "Destination name"}
                    </Typography>
                  </Box>
                  <Box sx={{ position: "absolute", right: 0, pt: 0.5, pr: 0.5 }}>
                    <StatusBadge variant="info" visible={!(typeof destination.nights === "number" || (destination.nights === "dates" && destination.checkInDate && destination.checkOutDate))}>
                      <IconButton aria-label="calendar" size="small" onClick={handleCalendarClick} sx={{ padding: 0.5 }}>
                        {!expanded && calculatedNights !== null && calculatedNights >= 0 && calculatedNights <= 9 ? (
                          <Box
                            sx={{
                              width: "2rem",
                              height: "2rem",
                              backgroundColor: "action.active",
                              maskImage: `url(${calendarIcons[calculatedNights]})`,
                              maskSize: "contain",
                              maskRepeat: "no-repeat",
                              maskPosition: "center",
                              WebkitMaskImage: `url(${calendarIcons[calculatedNights]})`,
                              WebkitMaskSize: "contain",
                              WebkitMaskRepeat: "no-repeat",
                              WebkitMaskPosition: "center",
                            }}
                          />
                        ) : (
                          <CalendarMonthOutlinedIcon sx={{ fontSize: "2rem" }} />
                        )}
                      </IconButton>
                    </StatusBadge>
                  </Box>
                  <Menu anchorEl={calendarAnchorEl} open={Boolean(calendarAnchorEl)} onClose={handleCalendarClose}>
                    <MenuItem onClick={() => handleNightSelect("unsure")} sx={{ justifyContent: "flex-end" }}>
                      Unsure
                      <HelpOutlineIcon sx={{ ml: 1 }} />
                    </MenuItem>
                    <MenuItem onClick={() => handleNightSelect("dates")} sx={{ justifyContent: "flex-end" }}>
                      Select dates
                      <CalendarMonthOutlinedIcon sx={{ ml: 1 }} />
                    </MenuItem>
                    {[0, 1, 2, 3, 4, 5, 6, 7].map((nights) => (
                      <MenuItem key={nights} onClick={() => handleNightSelect(nights)} sx={{ justifyContent: "flex-end" }}>
                        {nights} {nights === 1 ? "Night" : "Nights"}
                        <Box
                          sx={{
                            ml: 1,
                            width: 24,
                            height: 24,
                            backgroundColor: "action.active",
                            maskImage: `url(${calendarIcons[nights]})`,
                            maskSize: "contain",
                            maskRepeat: "no-repeat",
                            maskPosition: "center",
                            WebkitMaskImage: `url(${calendarIcons[nights]})`,
                            WebkitMaskSize: "contain",
                            WebkitMaskRepeat: "no-repeat",
                            WebkitMaskPosition: "center",
                          }}
                        />
                      </MenuItem>
                    ))}
                    <MenuItem onClick={() => handleNightSelect("more")} sx={{ justifyContent: "flex-end" }}>
                      More
                      <MoreHorizIcon sx={{ ml: 1 }} />
                    </MenuItem>
                  </Menu>
                  {showCustomNights && (
                    <Box
                      sx={{
                        position: "absolute",
                        right: 0,
                        top: "100%",
                        zIndex: 1,
                        bgcolor: "background.paper",
                        boxShadow: 3,
                        p: 1,
                        borderRadius: 1,
                      }}
                    >
                      <TextField
                        inputRef={customNightsInputRef}
                        value={customNightsValue}
                        onChange={(e) => setCustomNightsValue(e.target.value)}
                        onKeyDown={handleCustomNightsKeyDown}
                        onBlur={handleCustomNightsSubmit}
                        placeholder="Nights"
                        type="number"
                        size="small"
                        sx={{
                          width: 80,
                          "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
                            WebkitAppearance: "none",
                            margin: 0,
                          },
                          "& input[type=number]": {
                            MozAppearance: "textfield",
                          },
                        }}
                        slotProps={{
                          htmlInput: { min: 1 },
                        }}
                      />
                    </Box>
                  )}
                </Box>
              )}
              {!alwaysExpanded && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    position: "relative",
                    overflow: "visible",
                  }}
                >
                  <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-start", minWidth: 0 }}>
                    {expanded && (
                      <Typography variant="body2" sx={{ textTransform: "capitalize", flexShrink: 0 }}>
                        {destination.transport || "\u00A0"}
                      </Typography>
                    )}
                    {!expanded && layoutMode === "portrait" && arrivalDate && (
                      <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
                        {arrivalDate.format("MMM D")}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <IconButton
                      onClick={handleExpandClick}
                      aria-expanded={expanded}
                      aria-label="show more"
                      sx={{
                        transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s",
                      }}
                    >
                      <ExpandMoreIcon />
                    </IconButton>
                  </Box>
                  <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end", minWidth: 0 }}>
                    {expanded && (
                      <Typography variant="body2" sx={{ flexShrink: 0 }}>
                        {destination.nights === "none" ? "None" : calculatedNights !== null ? `${calculatedNights} ${calculatedNights === 1 ? "Night" : "Nights"}` : "\u00A0"}
                      </Typography>
                    )}
                    {!expanded && layoutMode === "portrait" && departureDate && (
                      <StatusBadge variant="info" visible={!isOnwardsTravelBooked()} attachToText>
                        <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
                          {departureDate.format("MMM D")}
                        </Typography>
                      </StatusBadge>
                    )}
                  </Box>
                </Box>
              )}
              {alwaysExpanded && (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    alignItems: "center",
                    width: "100%",
                    mt: 1,
                  }}
                >
                  <Box sx={{ justifySelf: "start" }}>
                    <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
                      {destination.transport || "\u00A0"}
                    </Typography>
                  </Box>
                  <Box sx={{ justifySelf: "end" }}>
                    <Typography variant="body2">{destination.nights === "none" ? "None" : calculatedNights !== null ? `${calculatedNights} ${calculatedNights === 1 ? "Night" : "Nights"}` : "\u00A0"}</Typography>
                  </Box>
                </Box>
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
            ...(buttonHover === 'remove' && {
              backgroundColor: theme.palette.mode === "dark" 
                ? "rgba(211, 47, 47, 0.16)"
                : "rgba(211, 47, 47, 0.08)",
            }),
            ...(buttonHover === 'reorder' && {
              backgroundColor: theme.palette.mode === "dark" 
                ? "rgba(25, 118, 210, 0.16)"
                : "rgba(25, 118, 210, 0.08)",
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
            {destination.transport !== "starting point" && (
              <>
                <DestinationSection title="Arrival">
                  <ArrivalTimeWeather
                    destination={destination}
                    previousDestination={previousDestination}
                    arrivalDate={arrivalDate}
                    onArrivalTimeChange={(dateTime: string | null) => {
                      onDestinationChange({
                        ...destination,
                        customArrivalDateTime: dateTime ?? undefined,
                      });
                    }}
                  />
                  <Box sx={{ mt: 1 }}>
                    {(() => {
                      const arrivalButtons = [
                        {
                          label: "Uber",
                          url: destination.placeDetails?.coordinates ? `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[formatted_address]=${encodeURIComponent(destination.displayName || destination.name)}&dropoff[latitude]=${destination.placeDetails.coordinates[1]}&dropoff[longitude]=${destination.placeDetails.coordinates[0]}` : `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[formatted_address]=${encodeURIComponent(destination.displayName || destination.name)}`,
                          icon: (
                            <Box
                              component="img"
                              src={uberIcon}
                              alt=""
                              sx={{
                                height: "1.25rem",
                                width: "auto",
                                maxWidth: "100%",
                                objectFit: "contain",
                              }}
                            />
                          ),
                        },
                        {
                          label: "Taxi",
                          url: destination.placeDetails?.coordinates ? `https://www.google.com/maps/dir/?api=1&destination=${destination.placeDetails.coordinates[1]},${destination.placeDetails.coordinates[0]}&travelmode=driving` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination.displayName || destination.name)}`,
                          icon: <LocalTaxiIcon />,
                        },
                      ];

                      const isEven = arrivalButtons.length % 2 === 0;

                      if (isEven) {
                        return (
                          <Box
                            sx={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: 1,
                            }}
                          >
                            {arrivalButtons.map((button) => (
                              <Button
                                key={button.label}
                                variant="outlined"
                                fullWidth
                                onClick={() => {
                                  window.open(button.url, "_blank", "noopener,noreferrer");
                                }}
                                sx={{
                                  bgcolor: "white",
                                  color: "black !important",
                                  borderColor: "divider",
                                  "&:hover": {
                                    bgcolor: "grey.50",
                                    borderColor: "divider",
                                    color: "black !important",
                                  },
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                {button.icon}
                                {button.label}
                              </Button>
                            ))}
                          </Box>
                        );
                      }

                      return (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                          {arrivalButtons.map((button) => (
                            <Button
                              key={button.label}
                              variant="outlined"
                              fullWidth
                              onClick={() => {
                                window.open(button.url, "_blank", "noopener,noreferrer");
                              }}
                              sx={{
                                bgcolor: "white",
                                color: "black !important",
                                borderColor: "divider",
                                "&:hover": {
                                  bgcolor: "grey.50",
                                  borderColor: "divider",
                                  color: "black !important",
                                },
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              {button.icon}
                              {button.label}
                            </Button>
                          ))}
                        </Box>
                      );
                    })()}
                  </Box>
                </DestinationSection>
                <DestinationSection title="Accommodation">
                  {(() => {
                    const links = buildAccommodationLinks(destination);
                    return links.length > 0 ? renderTransportLinks(links) : "link to hotel booking";
                  })()}
                </DestinationSection>
                <DestinationSection title="Activities">
                  <Box sx={{ mt: 1 }}>
                    {(() => {
                      const activityButtons = [
                        {
                          label: "TripAdvisor",
                          url: `https://www.tripadvisor.com/Search?q=${encodeURIComponent(destination.displayName || destination.name)}`,
                          icon: (
                            <Box
                              component="img"
                              src={tripAdvisorIcon}
                              alt=""
                              sx={{
                                height: "1.25rem",
                                width: "auto",
                                maxWidth: "100%",
                                objectFit: "contain",
                              }}
                            />
                          ),
                        },
                        {
                          label: "GetYourGuide",
                          url: `https://www.getyourguide.com/s/?q=${encodeURIComponent(destination.displayName || destination.name)}`,
                          icon: (
                            <Box
                              component="img"
                              src={getYourGuideIcon}
                              alt=""
                              sx={{
                                height: "1.25rem",
                                width: "auto",
                                maxWidth: "100%",
                                objectFit: "contain",
                              }}
                            />
                          ),
                        },
                      ];

                      const isEven = activityButtons.length % 2 === 0;

                      if (isEven) {
                        return (
                          <Box
                            sx={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: 1,
                            }}
                          >
                            {activityButtons.map((button) => (
                              <Button
                                key={button.label}
                                variant="outlined"
                                fullWidth
                                onClick={() => {
                                  window.open(button.url, "_blank", "noopener,noreferrer");
                                }}
                                sx={{
                                  bgcolor: "white",
                                  color: "black !important",
                                  borderColor: "divider",
                                  "&:hover": {
                                    bgcolor: "grey.50",
                                    borderColor: "divider",
                                    color: "black !important",
                                  },
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                {button.icon}
                                {button.label}
                              </Button>
                            ))}
                          </Box>
                        );
                      }

                      return (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                          {activityButtons.map((button) => (
                            <Button
                              key={button.label}
                              variant="outlined"
                              fullWidth
                              onClick={() => {
                                window.open(button.url, "_blank", "noopener,noreferrer");
                              }}
                              sx={{
                                bgcolor: "white",
                                color: "black !important",
                                borderColor: "divider",
                                "&:hover": {
                                  bgcolor: "grey.50",
                                  borderColor: "divider",
                                  color: "black !important",
                                },
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              {button.icon}
                              {button.label}
                            </Button>
                          ))}
                        </Box>
                      );
                    })()}
                  </Box>
                </DestinationSection>
              </>
            )}
            {nextDestination && (
              <DestinationSection title="Onwards">
                {nextDestination.transport ? (
                  nextDestination.transport && !selfTransportModes.includes(nextDestination.transport) && destination.transportDetails ? (
                    <Box sx={{ mt: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 1,
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
                          <Typography variant="body1" component="span">
                            {destination.transportDetails.departureLocation || "Origin"}
                          </Typography>
                          <Typography variant="body1" component="span">
                            →
                          </Typography>
                          <Typography variant="body1" component="span">
                            {destination.transportDetails.arrivalLocation || "Destination"}
                          </Typography>
                        </Box>
                        <Button variant="outlined" size="small" startIcon={<EditIcon />} onClick={() => setDetailsModalOpen(true)}>
                          Edit
                        </Button>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {formatDateTime(destination.transportDetails.departureDateTime) || "No departure time"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDateTime(destination.transportDetails.arrivalDateTime) || "No arrival time"}
                        </Typography>
                      </Box>
                      {destination.transportDetails.departureLocation && nextDestination && (
                        <Box sx={{ mt: 1 }}>
                          {(() => {
                            const onwardsButtons = [
                              {
                                label: "Uber",
                                url: nextDestination.placeDetails?.coordinates ? `https://m.uber.com/ul/?action=setPickup&pickup[formatted_address]=${encodeURIComponent(destination.transportDetails.departureLocation)}&dropoff[formatted_address]=${encodeURIComponent(nextDestination.displayName || nextDestination.name)}&dropoff[latitude]=${nextDestination.placeDetails.coordinates[1]}&dropoff[longitude]=${nextDestination.placeDetails.coordinates[0]}` : `https://m.uber.com/ul/?action=setPickup&pickup[formatted_address]=${encodeURIComponent(destination.transportDetails.departureLocation)}&dropoff[formatted_address]=${encodeURIComponent(nextDestination.displayName || nextDestination.name)}`,
                                icon: (
                                  <Box
                                    component="img"
                                    src={uberIcon}
                                    alt=""
                                    sx={{
                                      height: "1.25rem",
                                      width: "auto",
                                      maxWidth: "100%",
                                      objectFit: "contain",
                                    }}
                                  />
                                ),
                              },
                              {
                                label: "Taxi",
                                url: nextDestination.placeDetails?.coordinates ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(destination.transportDetails.departureLocation)}&destination=${nextDestination.placeDetails.coordinates[1]},${nextDestination.placeDetails.coordinates[0]}&travelmode=driving` : `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(destination.transportDetails.departureLocation)}&destination=${encodeURIComponent(nextDestination.displayName || nextDestination.name)}&travelmode=driving`,
                                icon: <LocalTaxiIcon />,
                              },
                            ];

                            const isEven = onwardsButtons.length % 2 === 0;

                            if (isEven) {
                              return (
                                <Box
                                  sx={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: 1,
                                  }}
                                >
                                  {onwardsButtons.map((button) => (
                                    <Button
                                      key={button.label}
                                      variant="outlined"
                                      fullWidth
                                      onClick={() => {
                                        window.open(button.url, "_blank", "noopener,noreferrer");
                                      }}
                                      sx={{
                                        bgcolor: "white",
                                        color: "black !important",
                                        borderColor: "divider",
                                        "&:hover": {
                                          bgcolor: "grey.50",
                                          borderColor: "divider",
                                          color: "black !important",
                                        },
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                      }}
                                    >
                                      {button.icon}
                                      {button.label}
                                    </Button>
                                  ))}
                                </Box>
                              );
                            }

                            return (
                              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                {onwardsButtons.map((button) => (
                                  <Button
                                    key={button.label}
                                    variant="outlined"
                                    fullWidth
                                    onClick={() => {
                                      window.open(button.url, "_blank", "noopener,noreferrer");
                                    }}
                                    sx={{
                                      bgcolor: "white",
                                      color: "black !important",
                                      borderColor: "divider",
                                      "&:hover": {
                                        bgcolor: "grey.50",
                                        borderColor: "divider",
                                        color: "black !important",
                                      },
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                    }}
                                  >
                                    {button.icon}
                                    {button.label}
                                  </Button>
                                ))}
                              </Box>
                            );
                          })()}
                        </Box>
                      )}
                    </Box>
                  ) : (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      {(() => {
                        const links = getTransportLinks(destination, nextDestination, nextDestination.transport || "", undefined);
                        return links.length > 0 ? renderTransportLinks(links) : "link to transport booking";
                      })()}
                      {nextDestination.transport && !selfTransportModes.includes(nextDestination.transport) && (
                        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDetailsModalOpen(true)} fullWidth>
                          Add {getTransportLabel(nextDestination.transport)} details
                        </Button>
                      )}
                    </Box>
                  )
                ) : (
                  "Add a travel method for the next destination to see booking links."
                )}
              </DestinationSection>
            )}
          </CardContent>
        </Collapse>
        {nextDestination?.transport && !selfTransportModes.includes(nextDestination.transport) && (
          <TransportDetailsModal
            open={detailsModalOpen}
            onClose={() => setDetailsModalOpen(false)}
            onSave={handleTransportDetailsSave}
            transportMode={nextDestination.transport}
            initialDetails={destination.transportDetails}
            referenceDate={departureDate}
          />
        )}
        <DoubleDatePicker
          open={Boolean(datePickerAnchorEl)}
          anchorEl={datePickerAnchorEl}
          onClose={() => setDatePickerAnchorEl(null)}
          checkInDate={destination.checkInDate ? dayjs(destination.checkInDate) : arrivalDate}
          checkOutDate={destination.checkOutDate ? dayjs(destination.checkOutDate) : departureDate}
          tripStartDate={tripStartDate}
          calculatedArrivalDate={arrivalDate}
          isFirst={isFirst}
          onDateChange={handleDateRangeChange}
        />
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
