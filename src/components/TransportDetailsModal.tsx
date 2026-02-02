import { useState, useEffect, type ReactElement } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { type Dayjs } from "dayjs";
import { type TransportDetails } from "../types/destination";
import { searchAirports, formatAirportDisplay, getAirportByIata, type Airport } from "../services/airportService";

interface TransportDetailsModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (details: TransportDetails | undefined) => void;
  transportMode: string;
  initialDetails?: TransportDetails;
  referenceDate?: Dayjs | null;
}

export const TransportDetailsModal = ({
  open,
  onClose,
  onSave,
  transportMode,
  initialDetails,
  referenceDate,
}: TransportDetailsModalProps): ReactElement => {
  const [departureDateTime, setDepartureDateTime] = useState<Dayjs | null>(null);
  const [arrivalDateTime, setArrivalDateTime] = useState<Dayjs | null>(null);
  const [departureLocation, setDepartureLocation] = useState("");
  const [arrivalLocation, setArrivalLocation] = useState("");
  const [departureAirport, setDepartureAirport] = useState<Airport | null>(null);
  const [arrivalAirport, setArrivalAirport] = useState<Airport | null>(null);
  const [departureAirportInput, setDepartureAirportInput] = useState("");
  const [arrivalAirportInput, setArrivalAirportInput] = useState("");
  const [departureAirportOptions, setDepartureAirportOptions] = useState<Airport[]>([]);
  const [arrivalAirportOptions, setArrivalAirportOptions] = useState<Airport[]>([]);

  const isFlight = transportMode === "by plane";
  const fallbackReference = referenceDate ?? dayjs();

  useEffect(() => {
    if (initialDetails) {
      setDepartureDateTime(initialDetails.departureDateTime ? dayjs(initialDetails.departureDateTime) : null);
      setArrivalDateTime(initialDetails.arrivalDateTime ? dayjs(initialDetails.arrivalDateTime) : null);
      setDepartureLocation(initialDetails.departureLocation || "");
      setArrivalLocation(initialDetails.arrivalLocation || "");
      
      if (isFlight) {
        const depAirport = initialDetails.departureLocation ? getAirportByIata(initialDetails.departureLocation) || null : null;
        const arrAirport = initialDetails.arrivalLocation ? getAirportByIata(initialDetails.arrivalLocation) || null : null;
        setDepartureAirport(depAirport);
        setArrivalAirport(arrAirport);
        setDepartureAirportInput(depAirport ? formatAirportDisplay(depAirport) : initialDetails.departureLocation || "");
        setArrivalAirportInput(arrAirport ? formatAirportDisplay(arrAirport) : initialDetails.arrivalLocation || "");
      }
    } else {
      setDepartureDateTime(null);
      setArrivalDateTime(null);
      setDepartureLocation("");
      setArrivalLocation("");
      setDepartureAirport(null);
      setArrivalAirport(null);
      setDepartureAirportInput("");
      setArrivalAirportInput("");
    }
  }, [initialDetails, open, isFlight]);

  useEffect(() => {
    if (isFlight && departureAirportInput) {
      const results = searchAirports(departureAirportInput);
      setDepartureAirportOptions(results);
    } else {
      setDepartureAirportOptions([]);
    }
  }, [departureAirportInput, isFlight]);

  useEffect(() => {
    if (isFlight && arrivalAirportInput) {
      const results = searchAirports(arrivalAirportInput);
      setArrivalAirportOptions(results);
    } else {
      setArrivalAirportOptions([]);
    }
  }, [arrivalAirportInput, isFlight]);

  const handleSave = (): void => {
    const details: TransportDetails = {
      departureDateTime: departureDateTime?.toISOString(),
      arrivalDateTime: arrivalDateTime?.toISOString(),
      departureLocation: isFlight && departureAirport ? departureAirport.iata : (departureLocation || undefined),
      arrivalLocation: isFlight && arrivalAirport ? arrivalAirport.iata : (arrivalLocation || undefined),
    };
    onSave(details);
    onClose();
  };

  const handleClear = (): void => {
    onSave(undefined);
    onClose();
  };

  const handleClose = (): void => {
    onClose();
  };

  const hasDetails = Boolean(
    initialDetails?.departureDateTime ||
    initialDetails?.arrivalDateTime ||
    initialDetails?.departureLocation ||
    initialDetails?.arrivalLocation
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              Add {isFlight ? "flight" : transportMode.replace("by ", "")} details
            </Box>
            <Button
              onClick={handleClear}
              disabled={!hasDetails}
              size="small"
              color="inherit"
            >
              Clear
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {isFlight ? (
              <Autocomplete
                options={departureAirportOptions}
                value={departureAirport}
                inputValue={departureAirportInput}
                onInputChange={(_event, newInputValue) => {
                  setDepartureAirportInput(newInputValue);
                }}
                onChange={(_event, newValue) => {
                  if (newValue && typeof newValue === "object" && "iata" in newValue) {
                    setDepartureAirport(newValue as Airport);
                    setDepartureAirportInput(formatAirportDisplay(newValue as Airport));
                  } else {
                    setDepartureAirport(null);
                  }
                }}
                getOptionLabel={(option) => {
                  if (typeof option === "string") {
                    return option;
                  }
                  return formatAirportDisplay(option);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Departure airport"
                    placeholder="Search by IATA code or airport name"
                    fullWidth
                  />
                )}
                filterOptions={(x) => x}
                freeSolo
                fullWidth
              />
            ) : (
              <TextField
                label="Departure location"
                value={departureLocation}
                onChange={(e) => setDepartureLocation(e.target.value)}
                fullWidth
                placeholder="e.g., Station name, terminal"
              />
            )}
            <DateTimePicker
              label="Departure date and time"
              value={departureDateTime}
              onChange={(newValue) => setDepartureDateTime(newValue)}
              referenceDate={fallbackReference}
              slotProps={{
                textField: {
                  fullWidth: true,
                },
              }}
            />
            {isFlight ? (
              <Autocomplete
                options={arrivalAirportOptions}
                value={arrivalAirport}
                inputValue={arrivalAirportInput}
                onInputChange={(_event, newInputValue) => {
                  setArrivalAirportInput(newInputValue);
                }}
                onChange={(_event, newValue) => {
                  if (newValue && typeof newValue === "object" && "iata" in newValue) {
                    setArrivalAirport(newValue as Airport);
                    setArrivalAirportInput(formatAirportDisplay(newValue as Airport));
                  } else {
                    setArrivalAirport(null);
                  }
                }}
                getOptionLabel={(option) => {
                  if (typeof option === "string") {
                    return option;
                  }
                  return formatAirportDisplay(option);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Arrival airport"
                    placeholder="Search by airport code or name"
                    fullWidth
                  />
                )}
                filterOptions={(x) => x}
                freeSolo
                fullWidth
              />
            ) : (
              <TextField
                label="Arrival location"
                value={arrivalLocation}
                onChange={(e) => setArrivalLocation(e.target.value)}
                fullWidth
                placeholder="e.g., Station name, terminal"
              />
            )}
            <DateTimePicker
              label="Arrival date and time"
              value={arrivalDateTime}
              onChange={(newValue) => setArrivalDateTime(newValue)}
              referenceDate={fallbackReference}
              slotProps={{
                textField: {
                  fullWidth: true,
                },
              }}
            />
            <Box>
              <Button
                variant="outlined"
                fullWidth
                disabled
                sx={{ mt: 1 }}
              >
                Add from confirmation email
              </Button>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};
