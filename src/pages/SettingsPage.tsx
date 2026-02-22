import { type ReactElement, useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { type Dayjs } from "dayjs";
import { type ArrivalWeatherBackgroundMode, type PassportEntry } from "../App";
import { searchCountries, type Country } from "../services/passportService";
import { Footer } from "../components/Footer";

interface OutletContext {
  arrivalWeatherBackgroundMode: ArrivalWeatherBackgroundMode;
  setArrivalWeatherBackgroundMode: (value: ArrivalWeatherBackgroundMode) => void;
  showExploreButton: boolean;
  setShowExploreButton: (value: boolean) => void;
  showInfoButton: boolean;
  setShowInfoButton: (value: boolean) => void;
  passports: PassportEntry[];
  addPassport: (countryName: string, expirationDate?: Dayjs | null) => void;
  removePassport: (countryName: string) => void;
  updatePassportExpiration: (countryName: string, expirationDate: Dayjs | null) => void;
}

export const SettingsPage = (): ReactElement => {
  const {
    showExploreButton,
    setShowExploreButton,
    showInfoButton,
    setShowInfoButton,
    passports,
    addPassport,
    removePassport,
    updatePassportExpiration,
  } = useOutletContext<OutletContext>();

  const [countryOptions, setCountryOptions] = useState<Country[]>([]);
  const [countryInputValue, setCountryInputValue] = useState("");
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [pendingCountry, setPendingCountry] = useState<Country | null>(null);
  const [pendingExpiration, setPendingExpiration] = useState<Dayjs | null>(null);

  useEffect(() => {
    let active = true;

    if (countryInputValue === "") {
      setCountryOptions([]);
      return;
    }

    setLoadingCountries(true);
    searchCountries(countryInputValue)
      .then((countries) => {
        if (active) {
          setCountryOptions(countries);
          setLoadingCountries(false);
        }
      })
      .catch((error) => {
        console.error("Error searching countries:", error);
        if (active) {
          setLoadingCountries(false);
        }
      });

    return () => {
      active = false;
    };
  }, [countryInputValue]);

  return (
    <Box sx={{ p: 3, pb: 10 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>
      <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 2 }}>
        <Card>
          <CardHeader
            title={
              <Typography variant="h5" component="div">
                Passports
              </Typography>
            }
          />
          <CardContent>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Autocomplete
                  options={countryOptions}
                  getOptionLabel={(option) => `${option.flag} ${option.name}`}
                  inputValue={countryInputValue}
                  onInputChange={(_, newInputValue) => {
                    setCountryInputValue(newInputValue);
                  }}
                  onChange={(_, newValue) => {
                    setPendingCountry(newValue ?? null);
                  }}
                  value={pendingCountry}
                  loading={loadingCountries}
                  renderInput={(params) => <TextField {...params} label="Search for a country" placeholder="Type to search..." size="small" />}
                  noOptionsText={countryInputValue ? "No countries found" : "Start typing to search"}
                  filterOptions={(x) => x}
                />
                {pendingCountry && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Expiration date"
                        value={pendingExpiration}
                        onChange={(d) => setPendingExpiration(d)}
                        minDate={dayjs()}
                        slotProps={{ textField: { size: "small", sx: { minWidth: 160 } } }}
                      />
                    </LocalizationProvider>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => {
                          if (pendingCountry && !passports.some((p) => p.countryName === pendingCountry.name)) {
                            addPassport(pendingCountry.name, pendingExpiration ?? null);
                            setPendingCountry(null);
                            setPendingExpiration(null);
                            setCountryInputValue("");
                          }
                        }}
                      >
                        Add
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          setPendingCountry(null);
                          setPendingExpiration(null);
                          setCountryInputValue("");
                        }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
              {passports.length > 0 ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {passports.map((entry) => (
                    <Box
                      key={entry.countryName}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        flexWrap: "wrap",
                        p: 1,
                        borderRadius: 2,
                        boxShadow: (theme) => theme.shadows[1],
                        bgcolor: (theme) => (theme.palette.mode === "dark" ? "#121212" : "background.default"),
                      }}
                    >
                      <Typography variant="body2" sx={{ minWidth: 100 }}>
                        {entry.countryName}
                      </Typography>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          label="Expiration"
                          value={entry.expirationDate}
                          onChange={(d) => updatePassportExpiration(entry.countryName, d ?? null)}
                          minDate={dayjs()}
                          slotProps={{ textField: { size: "small", sx: { minWidth: 160 } } }}
                        />
                      </LocalizationProvider>
                      <IconButton size="small" onClick={() => removePassport(entry.countryName)} aria-label={`Remove ${entry.countryName}`}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No passports added yet
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardHeader
            title={
              <Typography variant="h5" component="div">
                Button visibility
              </Typography>
            }
          />
          <CardContent>
            <Box sx={{ display: "flex", flexDirection: "row", gap: 1 }}>
              <FormControlLabel control={<Checkbox checked={showExploreButton} onChange={(e) => setShowExploreButton(e.target.checked)} />} label="Show explore button" />
              <FormControlLabel control={<Checkbox checked={showInfoButton} onChange={(e) => setShowInfoButton(e.target.checked)} />} label="Show info button" />
            </Box>
          </CardContent>
        </Card>
      </Box>
      <Footer />
    </Box>
  );
};
