import type { ReactElement } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Autocomplete from "@mui/material/Autocomplete";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DetailsModal } from "./utility/DetailsModal";
import type { OnwardsDetailsModalState } from "../hooks/useOnwardsDetailsModal";
import { getSafeDayjsValue } from "../utils/dateUtils";

interface OnwardsDetailsModalProps {
  state: OnwardsDetailsModalState;
}

export const OnwardsDetailsModal = ({ state }: OnwardsDetailsModalProps): ReactElement => {
  const {
    isOpen,
    title,
    isFlight,
    departureDateTime,
    arrivalDateTime,
    referenceDate,
    departureAutocomplete,
    arrivalAutocomplete,
    flightNumber,
    close,
    setDepartureDateTime,
    setArrivalDateTime,
    setDepartureLocation,
    setArrivalLocation,
    setFlightNumber,
    save,
    clear,
  } = state;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DetailsModal
        open={isOpen}
        onClose={close}
        title={title}
        onSave={save}
        onClear={clear}
        hasDetails={!!flightNumber || !!departureDateTime || !!arrivalDateTime || !!departureAutocomplete.value || !!arrivalAutocomplete.value}
        saveLabel="Save"
        cancelLabel="Cancel"
        clearLabel="Clear"
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          {isFlight ? (
            <>
              <TextField label="Flight Number" value={flightNumber} onChange={(e) => setFlightNumber(e.target.value)} fullWidth variant="outlined" />
              <Autocomplete
                freeSolo
                options={departureAutocomplete.suggestions}
                getOptionLabel={(option) => {
                  if (typeof option === "string") {
                    return option;
                  }
                  return option.name;
                }}
                inputValue={departureAutocomplete.value}
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
                loading={departureAutocomplete.isLoading}
                renderInput={(params) => <TextField {...params} label="Departure Airport" variant="outlined" fullWidth />}
              />
              <DateTimePicker
                label="Departure Date & Time"
                value={getSafeDayjsValue(departureDateTime)}
                onChange={(newValue) => setDepartureDateTime(getSafeDayjsValue(newValue))}
                referenceDate={referenceDate ?? undefined}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: "outlined",
                  },
                }}
              />
              <Autocomplete
                freeSolo
                options={arrivalAutocomplete.suggestions}
                getOptionLabel={(option) => {
                  if (typeof option === "string") {
                    return option;
                  }
                  return option.name;
                }}
                inputValue={arrivalAutocomplete.value}
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
                loading={arrivalAutocomplete.isLoading}
                renderInput={(params) => <TextField {...params} label="Arrival Airport" variant="outlined" fullWidth />}
              />
              <DateTimePicker
                label="Arrival Date & Time"
                value={getSafeDayjsValue(arrivalDateTime)}
                onChange={(newValue) => setArrivalDateTime(getSafeDayjsValue(newValue))}
                referenceDate={referenceDate ?? undefined}
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
              <TextField
                label="Departure Location"
                value={departureAutocomplete.value}
                onChange={(e) => setDepartureLocation(e.target.value)}
                fullWidth
                variant="outlined"
              />
              <DateTimePicker
                label="Departure Date & Time"
                value={getSafeDayjsValue(departureDateTime)}
                onChange={(newValue) => setDepartureDateTime(getSafeDayjsValue(newValue))}
                referenceDate={referenceDate ?? undefined}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: "outlined",
                  },
                }}
              />
              <TextField
                label="Arrival Location"
                value={arrivalAutocomplete.value}
                onChange={(e) => setArrivalLocation(e.target.value)}
                fullWidth
                variant="outlined"
              />
              <DateTimePicker
                label="Arrival Date & Time"
                value={getSafeDayjsValue(arrivalDateTime)}
                onChange={(newValue) => setArrivalDateTime(getSafeDayjsValue(newValue))}
                referenceDate={referenceDate ?? undefined}
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
  );
};

