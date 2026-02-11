import type { ReactElement } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { getWeatherIcon } from "../utils/getWeatherIcon";
import type { WeatherForecast } from "../services/weatherService";

interface ArrivalWeatherSummaryProps {
  weather: WeatherForecast;
  mainTextColor: string;
  iconColor: string;
}

export const ArrivalWeatherSummary = ({ weather, mainTextColor, iconColor }: ArrivalWeatherSummaryProps): ReactElement => {
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
};

