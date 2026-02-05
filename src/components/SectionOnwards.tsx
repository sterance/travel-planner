import { useState, useEffect, type ReactElement } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import dayjs, { type Dayjs } from "dayjs";
import { getTransportLinks, type TransportLink } from "../utils/externalLinks";
import { ButtonGrid } from "./utility/ButtonGrid";
import { SectionCard } from "./utility/SectionCard";
import { type Destination } from "../types/destination";
import { LinkButton } from "./utility/LinkButton";
import { DetailsModal } from "./utility/DetailsModal";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { searchAirports, formatAirportDisplay } from "../services/airportService";
import { type PlaceSuggestion } from "../services/placeService";
import { formatDateTime } from "../utils/dateUtils";

interface SectionOnwardsProps {
  destination: Destination;
  nextDestination?: Destination;
  onDestinationChange: (destination: Destination) => void;
  departureDate?: Dayjs | null;
}

const selfTransportModes = ["by car", "by motorbike", "by bicycle", "on foot", "starting point"];

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

const extractIataCode = (location: string | undefined): string => {
  if (!location) return "";
  const match = location.match(/^([A-Z]{3})\s*\(/);
  if (match) {
    return match[1];
  }
  const threeLetterMatch = location.match(/^([A-Z]{3})\b/);
  if (threeLetterMatch) {
    return threeLetterMatch[1];
  }
  return location;
};

const formatLocationDisplay = (location: string | undefined, transport?: string | null): string => {
  if (!location) return "";
  if (transport === "by plane") {
    return extractIataCode(location);
  }
  return location;
};

const renderTransportLinks = (links: TransportLink[]): ReactElement | null => {
  if (links.length === 0) {
    return null;
  }

  if (links.length === 1) {
    const link = links[0];
    return (
      <LinkButton site={link.icon ?? ""} url={link.url}>
        {link.label}
      </LinkButton>
    );
  }

  return (
    <ButtonGrid columns={2}>
      {links.map((link) => (
        <LinkButton key={link.label} site={link.icon ?? ""} url={link.url}>
          {link.label}
        </LinkButton>
      ))}
    </ButtonGrid>
  );
};

const getTransportDetailsModalTitle = (transport?: string | null): string => {
  if (!transport) return "Transport Details";
  if (transport === "by plane") return "Flight Details";
  if (transport === "by bus") return "Bus Details";
  if (transport === "by train") return "Train Details";
  if (transport === "by boat") return "Voyage Details";
  return "Transport Details";
};

const getSafeDayjsValue = (value: Dayjs | null): Dayjs | null => {
  if (!value) return null;
  return value.isValid() ? value : null;
};

export const SectionOnwards = ({ destination, nextDestination, onDestinationChange }: SectionOnwardsProps): ReactElement => {
  const [transportDetailsModalOpen, setTransportDetailsModalOpen] = useState(false);
  const [departureDateTime, setDepartureDateTime] = useState<Dayjs | null>(null);
  const [arrivalDateTime, setArrivalDateTime] = useState<Dayjs | null>(null);
  const [departureLocation, setDepartureLocation] = useState("");
  const [arrivalLocation, setArrivalLocation] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [departureLocationSuggestions, setDepartureLocationSuggestions] = useState<PlaceSuggestion[]>([]);
  const [arrivalLocationSuggestions, setArrivalLocationSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isLoadingDepartureLocation, setIsLoadingDepartureLocation] = useState(false);
  const [isLoadingArrivalLocation, setIsLoadingArrivalLocation] = useState(false);

  const isFlight = nextDestination?.transport === "by plane";

  useEffect(() => {
    if (!isFlight || departureLocation.length < 2) {
      setDepartureLocationSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      setIsLoadingDepartureLocation(true);
      const results = searchAirports(departureLocation);
      setDepartureLocationSuggestions(
        results.map((airport) => ({
          name: formatAirportDisplay(airport),
          displayName: formatAirportDisplay(airport),
          placeDetails: {
            osmId: 0,
            osmType: "",
            placeType: "airport",
            coordinates: [0, 0],
            country: "",
          },
        })),
      );
      setIsLoadingDepartureLocation(false);
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [departureLocation, isFlight]);

  useEffect(() => {
    if (!isFlight || arrivalLocation.length < 2) {
      setArrivalLocationSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      setIsLoadingArrivalLocation(true);
      const results = searchAirports(arrivalLocation);
      setArrivalLocationSuggestions(
        results.map((airport) => ({
          name: formatAirportDisplay(airport),
          displayName: formatAirportDisplay(airport),
          placeDetails: {
            osmId: 0,
            osmType: "",
            placeType: "airport",
            coordinates: [0, 0],
            country: "",
          },
        })),
      );
      setIsLoadingArrivalLocation(false);
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [arrivalLocation, isFlight]);

  useEffect(() => {
    if (transportDetailsModalOpen && !destination.transportDetails?.departureDateTime && departureDateTime === null) {
      try {
        let defaultDepartureDate: Dayjs | null = null;

        if (destination.departureDate) {
          defaultDepartureDate = destination.departureDate.startOf("day").hour(12).minute(0);
        } else if (destination.arrivalDate && typeof destination.nights === "number") {
          defaultDepartureDate = destination.arrivalDate
            .add(destination.nights, "day")
            .startOf("day")
            .hour(12)
            .minute(0);
        }

        if (defaultDepartureDate) {
          setDepartureDateTime(defaultDepartureDate);
        }
      } catch (error) {
        setDepartureDateTime(null);
      }
    }
  }, [transportDetailsModalOpen, destination.arrivalDate, destination.departureDate, destination.nights, destination.transportDetails?.departureDateTime]);

  const handleTransportDetailsModalOpen = (): void => {
    const details = destination.transportDetails;
    
    try {
      if (details?.departureDateTime) {
        const parsed = dayjs(details.departureDateTime);
        if (parsed.isValid()) {
          setDepartureDateTime(parsed);
        } else {
          setDepartureDateTime(null);
        }
      } else {
        let defaultDepartureDate: Dayjs | null = null;
        
        if (destination.departureDate) {
          defaultDepartureDate = destination.departureDate.startOf("day").hour(12).minute(0);
        } else if (destination.arrivalDate && typeof destination.nights === "number") {
          defaultDepartureDate = destination.arrivalDate
            .add(destination.nights, "day")
            .startOf("day")
            .hour(12)
            .minute(0);
        }
        
        setDepartureDateTime(defaultDepartureDate);
      }

      if (details?.arrivalDateTime) {
        const parsed = dayjs(details.arrivalDateTime);
        if (parsed.isValid()) {
          setArrivalDateTime(parsed);
        } else {
          setArrivalDateTime(null);
        }
      } else {
        setArrivalDateTime(null);
      }
    } catch (error) {
      setDepartureDateTime(null);
      setArrivalDateTime(null);
    }

    setDepartureLocation(details?.departureLocation || "");
    setArrivalLocation(details?.arrivalLocation || "");
    setFlightNumber(details?.flightNumber || "");
    setTransportDetailsModalOpen(true);
  };

  const handleTransportDetailsModalClose = (): void => {
    setTransportDetailsModalOpen(false);
    setDepartureDateTime(null);
    setArrivalDateTime(null);
    setDepartureLocation("");
    setArrivalLocation("");
    setFlightNumber("");
  };

  const handleTransportDetailsSave = (): void => {
    onDestinationChange({
      ...destination,
      transportDetails: {
        departureDateTime: departureDateTime?.toISOString(),
        arrivalDateTime: arrivalDateTime?.toISOString(),
        departureLocation: departureLocation || undefined,
        arrivalLocation: arrivalLocation || undefined,
        flightNumber: flightNumber || undefined,
      },
    });
    setTransportDetailsModalOpen(false);
  };

  const handleTransportDetailsClear = (): void => {
    onDestinationChange({
      ...destination,
      transportDetails: undefined,
    });
    setTransportDetailsModalOpen(false);
  };

  if (!nextDestination) {
    return <></>;
  }

  if (!nextDestination.transport) {
    return (
      <SectionCard title="Onwards">
        <Typography variant="body2" color="text.secondary">
          Add a travel method for the next destination to see booking links.
        </Typography>
      </SectionCard>
    );
  }

  const hasBookedDetails = !selfTransportModes.includes(nextDestination.transport) && !!destination.transportDetails;

  if (hasBookedDetails && destination.transportDetails) {
    const onwardsButtons = [
      {
        label: "Uber",
        site: "uber",
        url: nextDestination.placeDetails?.coordinates ? `https://m.uber.com/ul/?action=setPickup&pickup[formatted_address]=${encodeURIComponent(destination.transportDetails.departureLocation || "")}&dropoff[formatted_address]=${encodeURIComponent(nextDestination.displayName || nextDestination.name)}&dropoff[latitude]=${nextDestination.placeDetails.coordinates[1]}&dropoff[longitude]=${nextDestination.placeDetails.coordinates[0]}` : `https://m.uber.com/ul/?action=setPickup&pickup[formatted_address]=${encodeURIComponent(destination.transportDetails.departureLocation || "")}&dropoff[formatted_address]=${encodeURIComponent(nextDestination.displayName || nextDestination.name)}`,
      },
      {
        label: "Taxi",
        site: "taxi",
        url: nextDestination.placeDetails?.coordinates ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(destination.transportDetails.departureLocation || "")}&destination=${nextDestination.placeDetails.coordinates[1]},${nextDestination.placeDetails.coordinates[0]}&travelmode=driving` : `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(destination.transportDetails.departureLocation || "")}&destination=${encodeURIComponent(nextDestination.displayName || nextDestination.name)}&travelmode=driving`,
      },
    ];

    return (
      <>
        <SectionCard title="Onwards">
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
                {formatLocationDisplay(destination.transportDetails.departureLocation, nextDestination?.transport) || "Origin"}
              </Typography>
              <Typography variant="body1" component="span">
                →
              </Typography>
              <Typography variant="body1" component="span">
                {formatLocationDisplay(destination.transportDetails.arrivalLocation, nextDestination?.transport) || "Destination"}
              </Typography>
            </Box>
            <Button variant="outlined" size="small" startIcon={<EditIcon />} onClick={handleTransportDetailsModalOpen}>
              Edit
            </Button>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {formatDateTime(destination.transportDetails.departureDateTime) || "No departure time"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatDateTime(destination.transportDetails.arrivalDateTime) || "No arrival time"}
            </Typography>
          </Box>
          {destination.transportDetails.departureLocation && (
            <Box sx={{ mt: 1 }}>
              {onwardsButtons.length % 2 === 0 ? (
                <ButtonGrid columns={2}>
                  {onwardsButtons.map((button) => (
                    <LinkButton key={button.label} site={button.site} url={button.url}>
                      {button.label}
                    </LinkButton>
                  ))}
                </ButtonGrid>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {onwardsButtons.map((button) => (
                    <LinkButton key={button.label} site={button.site} url={button.url}>
                      {button.label}
                    </LinkButton>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </SectionCard>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DetailsModal open={transportDetailsModalOpen} onClose={handleTransportDetailsModalClose} title={getTransportDetailsModalTitle(nextDestination.transport)} onSave={handleTransportDetailsSave} onClear={handleTransportDetailsClear} hasDetails={!!destination.transportDetails} saveLabel="Save" cancelLabel="Cancel" clearLabel="Clear">
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
              {isFlight ? (
                <>
                  <TextField label="Flight Number" value={flightNumber} onChange={(e) => setFlightNumber(e.target.value)} fullWidth variant="outlined" />
                  <Autocomplete
                    freeSolo
                    options={departureLocationSuggestions}
                    getOptionLabel={(option) => {
                      if (typeof option === "string") {
                        return option;
                      }
                      return option.name;
                    }}
                    inputValue={departureLocation}
                    onInputChange={(_event, newValue) => {
                      setDepartureLocation(newValue);
                    }}
                    onChange={(_event, value) => {
                      if (value && typeof value !== "string") {
                        setDepartureLocation(value.name);
                      } else if (typeof value === "string") {
                        setDepartureLocation(value);
                      }
                    }}
                    loading={isLoadingDepartureLocation}
                    renderInput={(params) => <TextField {...params} label="Departure Airport" variant="outlined" fullWidth />}
                  />
                  <DateTimePicker
                    label="Departure Date & Time"
                    value={getSafeDayjsValue(departureDateTime)}
                    onChange={(newValue) => setDepartureDateTime(getSafeDayjsValue(newValue))}
                    referenceDate={destination.departureDate ?? destination.arrivalDate ?? undefined}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: "outlined",
                      },
                    }}
                  />
                  <Autocomplete
                    freeSolo
                    options={arrivalLocationSuggestions}
                    getOptionLabel={(option) => {
                      if (typeof option === "string") {
                        return option;
                      }
                      return option.name;
                    }}
                    inputValue={arrivalLocation}
                    onInputChange={(_event, newValue) => {
                      setArrivalLocation(newValue);
                    }}
                    onChange={(_event, value) => {
                      if (value && typeof value !== "string") {
                        setArrivalLocation(value.name);
                      } else if (typeof value === "string") {
                        setArrivalLocation(value);
                      }
                    }}
                    loading={isLoadingArrivalLocation}
                    renderInput={(params) => <TextField {...params} label="Arrival Airport" variant="outlined" fullWidth />}
                  />
                  <DateTimePicker
                    label="Arrival Date & Time"
                    value={getSafeDayjsValue(arrivalDateTime)}
                    onChange={(newValue) => setArrivalDateTime(getSafeDayjsValue(newValue))}
                    referenceDate={destination.departureDate ?? destination.arrivalDate ?? undefined}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: "outlined",
                      },
                    }}
                  />
                </>
              ) : (
                <>
                  <TextField label="Departure Location" value={departureLocation} onChange={(e) => setDepartureLocation(e.target.value)} fullWidth variant="outlined" />
                  <DateTimePicker
                    label="Departure Date & Time"
                    value={getSafeDayjsValue(departureDateTime)}
                    onChange={(newValue) => setDepartureDateTime(getSafeDayjsValue(newValue))}
                    referenceDate={destination.departureDate ?? destination.arrivalDate ?? undefined}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: "outlined",
                      },
                    }}
                  />
                  <TextField label="Arrival Location" value={arrivalLocation} onChange={(e) => setArrivalLocation(e.target.value)} fullWidth variant="outlined" />
                  <DateTimePicker
                    label="Arrival Date & Time"
                    value={getSafeDayjsValue(arrivalDateTime)}
                    onChange={(newValue) => setArrivalDateTime(getSafeDayjsValue(newValue))}
                    referenceDate={destination.departureDate ?? destination.arrivalDate ?? undefined}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: "outlined",
                      },
                    }}
                  />
                </>
              )}
            </Box>
          </DetailsModal>
        </LocalizationProvider>
      </>
    );
  }

  const links = getTransportLinks(destination, nextDestination, nextDestination.transport || "", undefined);

  return (
    <>
      <SectionCard title="Onwards">
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {links.length > 0 ? renderTransportLinks(links) : "link to transport booking"}
          {!selfTransportModes.includes(nextDestination.transport || "") && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleTransportDetailsModalOpen} fullWidth>
              Add {getTransportLabel(nextDestination.transport || "")} details
            </Button>
          )}
        </Box>
      </SectionCard>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DetailsModal open={transportDetailsModalOpen} onClose={handleTransportDetailsModalClose} title={getTransportDetailsModalTitle(nextDestination.transport)} onSave={handleTransportDetailsSave} onClear={handleTransportDetailsClear} hasDetails={!!destination.transportDetails} saveLabel="Save" cancelLabel="Cancel" clearLabel="Clear">
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            {isFlight ? (
              <>
                <TextField label="Flight Number" value={flightNumber} onChange={(e) => setFlightNumber(e.target.value)} fullWidth variant="outlined" />
                <Autocomplete
                  freeSolo
                  options={departureLocationSuggestions}
                  getOptionLabel={(option) => {
                    if (typeof option === "string") {
                      return option;
                    }
                    return option.name;
                  }}
                  inputValue={departureLocation}
                  onInputChange={(_event, newValue) => {
                    setDepartureLocation(newValue);
                  }}
                  onChange={(_event, value) => {
                    if (value && typeof value !== "string") {
                      setDepartureLocation(value.name);
                    } else if (typeof value === "string") {
                      setDepartureLocation(value);
                    }
                  }}
                  loading={isLoadingDepartureLocation}
                  renderInput={(params) => <TextField {...params} label="Departure Airport" variant="outlined" fullWidth />}
                />
                <DateTimePicker
                  label="Departure Date & Time"
                  value={getSafeDayjsValue(departureDateTime)}
                  onChange={(newValue) => setDepartureDateTime(getSafeDayjsValue(newValue))}
                  referenceDate={destination.departureDate ?? destination.arrivalDate ?? undefined}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: "outlined",
                    },
                  }}
                />
                <Autocomplete
                  freeSolo
                  options={arrivalLocationSuggestions}
                  getOptionLabel={(option) => {
                    if (typeof option === "string") {
                      return option;
                    }
                    return option.name;
                  }}
                  inputValue={arrivalLocation}
                  onInputChange={(_event, newValue) => {
                    setArrivalLocation(newValue);
                  }}
                  onChange={(_event, value) => {
                    if (value && typeof value !== "string") {
                      setArrivalLocation(value.name);
                    } else if (typeof value === "string") {
                      setArrivalLocation(value);
                    }
                  }}
                  loading={isLoadingArrivalLocation}
                  renderInput={(params) => <TextField {...params} label="Arrival Airport" variant="outlined" fullWidth />}
                />
                <DateTimePicker
                  label="Arrival Date & Time"
                  value={getSafeDayjsValue(arrivalDateTime)}
                  onChange={(newValue) => setArrivalDateTime(getSafeDayjsValue(newValue))}
                  referenceDate={destination.departureDate ?? destination.arrivalDate ?? undefined}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: "outlined",
                    },
                  }}
                />
                <Button variant="outlined" fullWidth disabled>
                  add from confirmation email{" "}
                </Button>
              </>
            ) : (
              <>
                <TextField label="Departure Location" value={departureLocation} onChange={(e) => setDepartureLocation(e.target.value)} fullWidth variant="outlined" />
                <DateTimePicker
                  label="Departure Date & Time"
                  value={getSafeDayjsValue(departureDateTime)}
                  onChange={(newValue) => setDepartureDateTime(getSafeDayjsValue(newValue))}
                  referenceDate={destination.departureDate ?? destination.arrivalDate ?? undefined}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: "outlined",
                    },
                  }}
                />
                <TextField label="Arrival Location" value={arrivalLocation} onChange={(e) => setArrivalLocation(e.target.value)} fullWidth variant="outlined" />
                <DateTimePicker
                  label="Arrival Date & Time"
                  value={getSafeDayjsValue(arrivalDateTime)}
                  onChange={(newValue) => setArrivalDateTime(getSafeDayjsValue(newValue))}
                  referenceDate={destination.departureDate ?? destination.arrivalDate ?? undefined}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: "outlined",
                    },
                  }}
                />
                <Button variant="outlined" fullWidth disabled>
                  add from confirmation email{" "}
                </Button>
              </>
            )}
          </Box>
        </DetailsModal>
      </LocalizationProvider>
    </>
  );
};
