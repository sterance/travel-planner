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
import MenuItem from "@mui/material/MenuItem";
import RadioGroup from "@mui/material/RadioGroup";
import Radio from "@mui/material/Radio";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { type Dayjs } from "dayjs";
import { type ArrivalWeatherBackgroundMode, type DateFormatPreference, type PassportEntry } from "../App";
import { searchCountries, type Country } from "../services/passportService";
import { currencyList } from "../utils/currency";
import { getThemedScrollbarSx } from "../theme/scrollbarSx";
import { Footer } from "../components/Footer";

interface OutletContext {
  arrivalWeatherBackgroundMode: ArrivalWeatherBackgroundMode;
  setArrivalWeatherBackgroundMode: (value: ArrivalWeatherBackgroundMode) => void;
  showExploreButton: boolean;
  setShowExploreButton: (value: boolean) => void;
  showInfoButton: boolean;
  setShowInfoButton: (value: boolean) => void;
  dateFormat: DateFormatPreference;
  setDateFormat: (value: DateFormatPreference) => void;
  homeCurrency: string;
  setHomeCurrency: (code: string) => void;
  currencyDisplayDecimals: string;
  setCurrencyDisplayDecimals: (value: string) => void;
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
    dateFormat,
    setDateFormat,
    homeCurrency,
    setHomeCurrency,
    currencyDisplayDecimals,
    setCurrencyDisplayDecimals,
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
                        format={dateFormat}
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
                        p: 1,
                        borderRadius: 2,
                        boxShadow: (theme) => theme.shadows[1],
                        bgcolor: (theme) => (theme.palette.mode === "dark" ? "#121212" : "background.default"),
                      }}
                    >
                      <Typography variant="body2" sx={{ minWidth: 160 }}>
                        {entry.countryName}
                      </Typography>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          label="Expiration"
                          value={entry.expirationDate}
                          onChange={(d) => updatePassportExpiration(entry.countryName, d ?? null)}
                          format={dateFormat}
                          minDate={dayjs()}
                          slotProps={{ textField: { size: "small", sx: { minWidth: 100 } } }}
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
                Currency
              </Typography>
            }
          />
          <CardContent>
            <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
              <Autocomplete
                options={currencyList}
                getOptionLabel={(option) => `${option.code} -- ${option.name}`}
                value={currencyList.find((c) => c.code === homeCurrency) ?? null}
                onChange={(_, newValue) => {
                  if (newValue) setHomeCurrency(newValue.code);
                }}
                isOptionEqualToValue={(option, value) => option.code === value.code}
                slotProps={{
                  listbox: {
                    sx: getThemedScrollbarSx,
                  },
                }}
                renderInput={(params) => <TextField {...params} label="Home Currency" size="small" />}
                sx={{ flex: 2, minWidth: 0 }}
              />
              <TextField
                select
                label="Decimal places"
                size="small"
                value={currencyDisplayDecimals}
                onChange={(e) => setCurrencyDisplayDecimals(e.target.value)}
                sx={{ flex: 1, minWidth: 0 }}
              >
                <MenuItem value="auto">Auto</MenuItem>
                <MenuItem value={0}>0</MenuItem>
                <MenuItem value={1}>1</MenuItem>
                <MenuItem value={2}>2</MenuItem>
                <MenuItem value={3}>3</MenuItem>
                <MenuItem value={4}>4</MenuItem>
              </TextField>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardHeader
            title={
              <Typography variant="h5" component="div">
                Date format
              </Typography>
            }
          />
          <CardContent>
            <RadioGroup
              row
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value as DateFormatPreference)}
              sx={{ width: "100%", gap: 2 }}
            >
              <FormControlLabel
                value="DD/MM/YYYY"
                control={<Radio />}
                label={
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                    <Typography variant="body1" component="span" sx={{ display: "flex", alignItems: "center", minHeight: 24, lineHeight: 1.2 }}>
                      DD/MM/YYYY
                    </Typography>
                    <Typography variant="caption" component="span" color="text.secondary" sx={{ lineHeight: 1.2, mt: 0.25 }}>
                      31/12/2026
                    </Typography>
                  </Box>
                }
                sx={{ flex: 1, minWidth: 0, m: 0, alignItems: "center" }}
              />
              <FormControlLabel
                value="MM/DD/YYYY"
                control={<Radio />}
                label={
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                    <Typography variant="body1" component="span" sx={{ display: "flex", alignItems: "center", minHeight: 24, lineHeight: 1.2 }}>
                      MM/DD/YYYY
                    </Typography>
                    <Typography variant="caption" component="span" color="text.secondary" sx={{ lineHeight: 1.2, mt: 0.25 }}>
                      12/31/2026
                    </Typography>
                  </Box>
                }
                sx={{ flex: 1, minWidth: 0, m: 0, alignItems: "center" }}
              />
            </RadioGroup>
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
            <Box sx={{ display: "flex", flexDirection: "row", gap: 1, width: "100%" }}>
              <FormControlLabel
                control={<Checkbox checked={showExploreButton} onChange={(e) => setShowExploreButton(e.target.checked)} />}
                label="Show explore button"
                sx={{ flex: 1, minWidth: 0, m: 0 }}
              />
              <FormControlLabel
                control={<Checkbox checked={showInfoButton} onChange={(e) => setShowInfoButton(e.target.checked)} />}
                label="Show info button"
                sx={{ flex: 1, minWidth: 0, m: 0 }}
              />
            </Box>
          </CardContent>
        </Card>
      </Box>
      <Footer />
    </Box>
  );
};
