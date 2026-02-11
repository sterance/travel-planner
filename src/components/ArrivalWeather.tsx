import type { ReactElement } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import type { Dayjs } from "dayjs";
import { type Destination } from "../types/destination";
import { getWeatherBackgroundGradient } from "../utils/getWeatherIcon";
import { useArrivalWeather } from "../hooks/useArrivalWeather";
import { ArrivalTimeEditor } from "./ArrivalTimeEditor";
import { ArrivalWeatherSummary } from "./ArrivalWeatherSummary";
import { ArrivalWeatherStatus } from "./ArrivalWeatherStatus";

interface ArrivalWeatherProps {
  destination: Destination;
  previousDestination?: Destination;
  arrivalDate: Dayjs | null;
  onArrivalTimeChange: (dateTime: Dayjs | null) => void;
  backgroundMode?: "default" | "light" | "dark";
}

export const ArrivalWeather = ({ destination, previousDestination, arrivalDate, onArrivalTimeChange, backgroundMode = "default" }: ArrivalWeatherProps): ReactElement => {
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
        boxShadow: "none",
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
              paletteModeForGradient={paletteModeForGradient}
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

          {weather && !isLoadingWeather && <ArrivalWeatherSummary weather={weather} mainTextColor={mainTextColor} iconColor={iconColor} />}

          <ArrivalWeatherStatus
            isLoadingWeather={isLoadingWeather}
            weatherError={weatherError}
            weatherErrorDateTime={weatherErrorDateTime}
            textSecondaryColor={theme.palette.text.secondary}
          />
        </Box>
      </CardContent>
    </Card>
  );
};
