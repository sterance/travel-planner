import { useState, useEffect, useMemo, type ReactElement } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { useTheme } from "@mui/material/styles";
import RefreshIcon from "@mui/icons-material/Refresh";
import dayjs, { type Dayjs } from "dayjs";
import { type Destination } from "../types/destination";
import { getWeatherForecast, peekWeatherForecast, type WeatherForecast } from "../services/weatherService";
import { getWeatherIcon, getWeatherBackgroundGradient } from "../utils/getWeatherIcon";

interface ArrivalTimeWeatherProps {
  destination: Destination;
  previousDestination?: Destination;
  arrivalDate: Dayjs | null;
  onArrivalTimeChange: (dateTime: string | null) => void;
}

export const ArrivalTimeWeather = ({ destination, previousDestination, arrivalDate, onArrivalTimeChange }: ArrivalTimeWeatherProps): ReactElement => {
  const theme = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [timeValue, setTimeValue] = useState("");
  const [weather, setWeather] = useState<WeatherForecast | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState(false);
  const [weatherErrorDateTime, setWeatherErrorDateTime] = useState<Dayjs | null>(null);

  const defaultArrivalTime = useMemo(() => {
    return previousDestination?.transportDetails?.arrivalDateTime ? dayjs(previousDestination.transportDetails.arrivalDateTime) : null;
  }, [previousDestination?.transportDetails?.arrivalDateTime]);

  const customArrivalTime = useMemo(() => {
    return destination.customArrivalDateTime ? dayjs(destination.customArrivalDateTime) : null;
  }, [destination.customArrivalDateTime]);

  const effectiveArrivalTime = useMemo(() => {
    return customArrivalTime || defaultArrivalTime;
  }, [customArrivalTime, defaultArrivalTime]);

  const backgroundGradient = useMemo(
    () => getWeatherBackgroundGradient(weather?.weatherCode ?? null, theme.palette.mode),
    [weather?.weatherCode, theme.palette.mode]
  );

  useEffect(() => {
    if (!isEditing) {
      if (effectiveArrivalTime && effectiveArrivalTime.isValid()) {
        const timeStr = effectiveArrivalTime.format("HH:mm");
        setTimeValue(timeStr);
      } else {
        setTimeValue("");
      }
    }
  }, [effectiveArrivalTime, isEditing]);

  const latitude = useMemo(() => {
    return destination.placeDetails?.coordinates?.[1];
  }, [destination.placeDetails?.coordinates?.[1]]);

  const longitude = useMemo(() => {
    return destination.placeDetails?.coordinates?.[0];
  }, [destination.placeDetails?.coordinates?.[0]]);

  const dateTimeToFetch = useMemo(() => {
    if (!arrivalDate || !arrivalDate.isValid() || !effectiveArrivalTime || !effectiveArrivalTime.isValid()) {
      return null;
    }

    return arrivalDate.hour(effectiveArrivalTime.hour()).minute(effectiveArrivalTime.minute()).second(0).millisecond(0);
  }, [arrivalDate?.valueOf() ?? null, effectiveArrivalTime?.valueOf() ?? null]);

  useEffect(() => {
    if (!dateTimeToFetch || !dateTimeToFetch.isValid()) {
      setWeather(null);
      setIsLoadingWeather(false);
      setWeatherError(false);
      setWeatherErrorDateTime(null);
      return;
    }

    if (latitude === undefined || longitude === undefined) {
      setWeather(null);
      setIsLoadingWeather(false);
      setWeatherError(false);
      setWeatherErrorDateTime(null);
      return;
    }

    const cached = peekWeatherForecast(latitude, longitude, dateTimeToFetch);
    if (cached !== undefined) {
      setWeather(cached);
      setIsLoadingWeather(false);
      setWeatherError(cached === null);
      setWeatherErrorDateTime(cached === null ? dateTimeToFetch : null);
      return;
    }

    setIsLoadingWeather(true);
    setWeatherError(false);
    setWeatherErrorDateTime(null);

    let cancelled = false;

    getWeatherForecast(latitude, longitude, dateTimeToFetch)
      .then((forecast) => {
        if (cancelled) return;
        setWeather(forecast);
        setIsLoadingWeather(false);
        if (!forecast) {
          setWeatherError(true);
          setWeatherErrorDateTime(dateTimeToFetch);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setWeather(null);
        setIsLoadingWeather(false);
        setWeatherError(true);
        setWeatherErrorDateTime(dateTimeToFetch);
      });

    return () => {
      cancelled = true;
    };
  }, [dateTimeToFetch?.valueOf() ?? null, latitude, longitude]);

  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setTimeValue(event.target.value);
  };

  const handleSave = (): void => {
    if (!arrivalDate || !arrivalDate.isValid() || !timeValue) {
      return;
    }

    const [hours, minutes] = timeValue.split(":").map(Number);
    const newDateTime = arrivalDate.hour(hours).minute(minutes).second(0).millisecond(0);
    onArrivalTimeChange(newDateTime.toISOString());
    setIsEditing(false);
  };

  const handleCancel = (): void => {
    if (effectiveArrivalTime && effectiveArrivalTime.isValid()) {
      const timeStr = effectiveArrivalTime.format("HH:mm");
      setTimeValue(timeStr);
    }
    setIsEditing(false);
  };

  const handleReset = (): void => {
    if (defaultArrivalTime && defaultArrivalTime.isValid()) {
      const timeStr = defaultArrivalTime.format("HH:mm");
      setTimeValue(timeStr);
    }
  };

  const displayTime = effectiveArrivalTime && effectiveArrivalTime.isValid() ? effectiveArrivalTime.format("h:mm A") : "??:??";

  const hasDefault = defaultArrivalTime !== null && defaultArrivalTime.isValid();

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
            {isEditing ? (
              <>
                <TextField
                  type="time"
                  value={timeValue}
                  onChange={handleTimeChange}
                  size="small"
                  sx={{
                    width: 140,
                    "& input[type='time']::-webkit-calendar-picker-indicator": {
                      filter: theme.palette.mode === "dark" ? "invert(1)" : "invert(0)",
                      cursor: "pointer",
                    },
                    "& input[type='time']::-webkit-calendar-picker-indicator:hover": {
                      opacity: 0.7,
                    },
                  }}
                  slotProps={{
                    htmlInput: {
                      step: 300,
                    },
                  }}
                />
                <Button size="small" onClick={handleSave} variant="contained">
                  Save
                </Button>
                <Button size="small" onClick={handleCancel}>
                  Cancel
                </Button>
                {hasDefault && (
                  <Button size="small" onClick={handleReset} startIcon={<RefreshIcon />}>
                    Reset
                  </Button>
                )}
              </>
            ) : (
              <Typography
                variant="h5"
                color="text.secondary"
                component="span"
                onClick={() => {
                  if (effectiveArrivalTime && effectiveArrivalTime.isValid()) {
                    const timeStr = effectiveArrivalTime.format("HH:mm");
                    setTimeValue(timeStr);
                  } else {
                    setTimeValue("");
                  }
                  setIsEditing(true);
                }}
                sx={{
                  cursor: "pointer",
                  "&:hover": {
                    opacity: 0.7,
                  },
                }}
              >
                {displayTime}
              </Typography>
            )}
          </Box>

          {weather && !isLoadingWeather && (
            <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 4 }}>
              <Typography variant="h3" color="text.primary">
                {weather.temperature}°C
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "center", gap: 1, alignItems: "center" }}>
                {getWeatherIcon(weather.weatherCode, { width: 48, height: 48 })}
                <Typography variant="body1" color="text.primary" sx={{ textTransform: "capitalize" }}>
                  {weather.condition}
                </Typography>
              </Box>
            </Box>
          )}

          {isLoadingWeather && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={16} />
              <Typography variant="body2" color="text.secondary">
                Loading weather...
              </Typography>
            </Box>
          )}

          {weatherError && !isLoadingWeather && (
            <Typography variant="body2" color="error">
              Unable to load weather forecast{weatherErrorDateTime && weatherErrorDateTime.isValid() ? ` for ${weatherErrorDateTime.format("MMM D, YYYY")}` : ""}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
