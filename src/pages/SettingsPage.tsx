import { type ReactElement, useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
// import TextField from "@mui/material/TextField";
// import MenuItem from "@mui/material/MenuItem";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import { type ArrivalWeatherBackgroundMode } from "../App";
import { searchCountries, type Country } from "../services/passportService";
import { Footer } from "../components/Footer";

interface OutletContext {
  arrivalWeatherBackgroundMode: ArrivalWeatherBackgroundMode;
  setArrivalWeatherBackgroundMode: (value: ArrivalWeatherBackgroundMode) => void;
  showExploreButton: boolean;
  setShowExploreButton: (value: boolean) => void;
  showInfoButton: boolean;
  setShowInfoButton: (value: boolean) => void;
  passports: string[];
  addPassport: (countryName: string) => void;
  removePassport: (countryName: string) => void;
}

export const SettingsPage = (): ReactElement => {
  const {
    // arrivalWeatherBackgroundMode,
    // setArrivalWeatherBackgroundMode,
    showExploreButton,
    setShowExploreButton,
    showInfoButton,
    setShowInfoButton,
    passports,
    addPassport,
    removePassport,
  } = useOutletContext<OutletContext>();

  const [countryOptions, setCountryOptions] = useState<Country[]>([]);
  const [countryInputValue, setCountryInputValue] = useState("");
  const [loadingCountries, setLoadingCountries] = useState(false);

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
        {/* <Card>
          <CardHeader
            title={
              <Typography variant="h5" component="div">
                Arrival weather
              </Typography>
            }
          />
          <CardContent>
            <TextField select label="Background gradient" value={arrivalWeatherBackgroundMode} onChange={(e) => setArrivalWeatherBackgroundMode(e.target.value as ArrivalWeatherBackgroundMode)} size="small" sx={{ width: 260 }}>
              <MenuItem value="default">Default (follow page theme)</MenuItem>
              <MenuItem value="light">Force light</MenuItem>
              <MenuItem value="dark">Force dark</MenuItem>
            </TextField>
          </CardContent>
        </Card> */}
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
              <Autocomplete
                options={countryOptions}
                getOptionLabel={(option) => `${option.flag} ${option.name}`}
                inputValue={countryInputValue}
                onInputChange={(_, newInputValue) => {
                  setCountryInputValue(newInputValue);
                }}
                onChange={(_, newValue) => {
                  if (newValue) {
                    addPassport(newValue.name);
                    setCountryInputValue("");
                  }
                }}
                loading={loadingCountries}
                renderInput={(params) => <TextField {...params} label="Search for a country" placeholder="Type to search..." size="small" />}
                noOptionsText={countryInputValue ? "No countries found" : "Start typing to search"}
                filterOptions={(x) => x}
              />
              {passports.length > 0 ? (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {passports.map((passport) => (
                    <Chip key={passport} label={passport} onDelete={() => removePassport(passport)} color="primary" variant="outlined" />
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
