import type { ReactElement } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import type { Dayjs } from "dayjs";

interface ArrivalWeatherStatusProps {
  isLoadingWeather: boolean;
  weatherError: boolean;
  weatherErrorDateTime: Dayjs | null;
  textSecondaryColor: string;
}

export const ArrivalWeatherStatus = ({
  isLoadingWeather,
  weatherError,
  weatherErrorDateTime,
  textSecondaryColor,
}: ArrivalWeatherStatusProps): ReactElement | null => {
  if (isLoadingWeather) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <CircularProgress size={16} />
        <Typography
          variant="body2"
          sx={{
            color: textSecondaryColor,
          }}
        >
          Loading weather...
        </Typography>
      </Box>
    );
  }

  if (weatherError) {
    return (
      <Typography variant="body2" color="error">
        Unable to load weather forecast
        {weatherErrorDateTime && weatherErrorDateTime.isValid() ? ` for ${weatherErrorDateTime.format("MMM D, YYYY")}` : ""}
      </Typography>
    );
  }

  return null;
};

