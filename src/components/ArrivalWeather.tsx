import type { ReactElement } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import type { Dayjs } from "dayjs";
import { type Destination, type WeatherDetails } from "../types/destination";
import { getWeatherBackgroundGradient, getWeatherIcon } from "../utils/getWeatherIcon";
import { useArrivalWeather } from "../hooks/useArrivalWeather";
import { ArrivalTimeEditor } from "./ArrivalTimeEditor";

interface ArrivalWeatherProps {
  destination: Destination;
  previousDestination?: Destination;
  arrivalDate: Dayjs | null;
  onArrivalTimeChange: (dateTime: Dayjs | null) => void;
  onWeatherDetailsUpdate?: (details: WeatherDetails) => void;
  backgroundMode?: "default" | "light" | "dark";
}

export const ArrivalWeather = ({ destination, previousDestination, arrivalDate, onArrivalTimeChange, onWeatherDetailsUpdate, backgroundMode = "default" }: ArrivalWeatherProps): ReactElement => {
  const theme = useTheme();
  const {
    isEditing,
    setIsEditing,
    timeValue,
    handleTimeChange,
    handleSave,
    handleCancel,
    handleReset,
    displayTime,
    hasDefault,
    effectiveArrivalTime: _effectiveArrivalTime,
    hasEffectiveArrivalTime,
    weather,
    isLoadingWeather,
    weatherError,
    weatherErrorDateTime,
  } = useArrivalWeather({
    destination,
    previousDestination,
    arrivalDate,
    onArrivalTimeChange,
    onWeatherDetailsUpdate,
  });

  const paletteModeForGradient = backgroundMode === "default" ? theme.palette.mode : backgroundMode;

  const backgroundGradient = getWeatherBackgroundGradient(weather?.weatherCode ?? null, paletteModeForGradient);

  const mainTextColor = backgroundMode === "default" ? theme.palette.text.primary : backgroundMode === "dark" ? "#ffffff" : "#111111";

  const secondaryTextColor = backgroundMode === "default" ? theme.palette.text.secondary : backgroundMode === "dark" ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.6)";

  const iconColor = backgroundMode === "default" ? theme.palette.text.primary : backgroundMode === "dark" ? "#ffffff" : "#111111";

  if (!arrivalDate || !arrivalDate.isValid()) {
    return (
      <Card
        sx={{
          bgcolor: "background.default",
          border: 1,
          borderColor: "divider",
          borderRadius: 2,
          boxShadow: "none",
        }}
      >
        <CardContent sx={{ padding: "8px !important", "&:last-child": { paddingBottom: "8px !important" } }}>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
            Arrival date not set
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        backgroundImage: backgroundGradient,
        bgcolor: backgroundGradient ? "transparent" : "background.default",
        border: 1,
        borderColor: backgroundGradient ? "rgba(255, 255, 255, 0.35)" : "divider",
        borderRadius: 2,
        boxShadow: 1,
      }}
    >
      <CardContent sx={{ padding: "8px !important", "&:last-child": { paddingBottom: "8px !important" } }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, flexWrap: "wrap" }}>
            <ArrivalTimeEditor
              isEditing={isEditing}
              timeValue={timeValue}
              displayTime={displayTime}
              hasDefault={hasDefault}
              hasEffectiveArrivalTime={hasEffectiveArrivalTime}
              backgroundMode={backgroundMode}
              mainTextColor={mainTextColor}
              secondaryTextColor={secondaryTextColor}
              themeTextSecondaryColor={theme.palette.text.secondary}
              onTimeChange={handleTimeChange}
              onSave={handleSave}
              onCancel={handleCancel}
              onReset={handleReset}
              onStartEditing={() => setIsEditing(true)}
            />
          </Box>

          {weather && !isLoadingWeather && (() => {
            const WeatherIcon = getWeatherIcon(weather.weatherCode);
            return (
              <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 4 }}>
                <Typography variant="h3" sx={{ color: mainTextColor }}>
                  {weather.temperature}°C
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "center", gap: 1, alignItems: "center" }}>
                  <WeatherIcon sx={{ width: 48, height: 48, color: iconColor }} />
                  <Typography variant="body1" sx={{ textTransform: "capitalize", color: mainTextColor }}>
                    {weather.condition}
                  </Typography>
                </Box>
              </Box>
            );
          })()}

          {isLoadingWeather && (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 1 }}>
              <CircularProgress size={16} />
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Loading weather...
              </Typography>
            </Box>
          )}
          {weatherError && !isLoadingWeather && (
            <Typography variant="body2" color="error" sx={{ textAlign: "center" }}>
              Unable to load weather forecast
              {weatherErrorDateTime && weatherErrorDateTime.isValid() ? ` for ${weatherErrorDateTime.format("MMM D, YYYY")}` : ""}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
