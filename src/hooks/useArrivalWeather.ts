import { useEffect, useMemo, useState } from "react";
import dayjs, { type Dayjs } from "dayjs";
import type { Destination, WeatherDetails } from "../types/destination";
import { getWeatherForecast, peekWeatherForecast, type WeatherForecast } from "../services/weatherService";
import { getDestinationZone } from "../utils/timeZone";

interface UseArrivalWeatherConfig {
  destination: Destination;
  previousDestination?: Destination;
  arrivalDate: Dayjs | null;
  onArrivalTimeChange: (dateTime: Dayjs | null) => void;
  onWeatherDetailsUpdate?: (details: WeatherDetails) => void;
}

interface UseArrivalWeatherResult {
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  timeValue: string;
  handleTimeChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSave: () => void;
  handleCancel: () => void;
  handleReset: () => void;
  displayTime: string;
  hasDefault: boolean;
  effectiveArrivalTime: Dayjs | null;
  hasEffectiveArrivalTime: boolean;
  weather: WeatherForecast | null;
  isLoadingWeather: boolean;
  weatherError: boolean;
  weatherErrorDateTime: Dayjs | null;
}

export const useArrivalWeather = ({
  destination,
  previousDestination,
  arrivalDate,
  onArrivalTimeChange,
  onWeatherDetailsUpdate,
}: UseArrivalWeatherConfig): UseArrivalWeatherResult => {
  const destZone = getDestinationZone(destination);
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
    return destination.arrivalTime || null;
  }, [destination.arrivalTime]);

  const effectiveArrivalTime = useMemo(() => {
    return customArrivalTime || defaultArrivalTime;
  }, [customArrivalTime, defaultArrivalTime]);

  const hasEffectiveArrivalTime = !!(effectiveArrivalTime && effectiveArrivalTime.isValid());

  useEffect(() => {
    if (!isEditing) {
      if (effectiveArrivalTime && effectiveArrivalTime.isValid()) {
        setTimeValue(effectiveArrivalTime.tz(destZone).format("HH:mm"));
      } else {
        setTimeValue("");
      }
    }
  }, [effectiveArrivalTime, isEditing, destZone]);

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

    const dateStr = arrivalDate.format("YYYY-MM-DD");
    const wall = effectiveArrivalTime.tz(destZone);
    return dayjs.tz(`${dateStr}T${wall.format("HH:mm:ss")}`, destZone);
  }, [arrivalDate?.valueOf() ?? null, effectiveArrivalTime?.valueOf() ?? null, destZone]);

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

    const stored = destination.weatherDetails;
    if (
      stored &&
      stored.latitude === latitude &&
      stored.longitude === longitude &&
      stored.dateTime.isValid() &&
      stored.dateTime.utc().format("YYYY-MM-DD-HH") === dateTimeToFetch.utc().format("YYYY-MM-DD-HH")
    ) {
      setWeather(stored);
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
      if (cached && onWeatherDetailsUpdate) {
        onWeatherDetailsUpdate({
          ...cached,
          latitude,
          longitude,
          dateTime: dateTimeToFetch,
        });
      }
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
          return;
        }
        if (onWeatherDetailsUpdate) {
          onWeatherDetailsUpdate({
            ...forecast,
            latitude,
            longitude,
            dateTime: dateTimeToFetch,
          });
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

    const dateStr = arrivalDate.format("YYYY-MM-DD");
    const newDateTime = dayjs.tz(`${dateStr}T${timeValue}:00`, destZone);
    onArrivalTimeChange(newDateTime);
    setIsEditing(false);
  };

  const handleCancel = (): void => {
    if (effectiveArrivalTime && effectiveArrivalTime.isValid()) {
      setTimeValue(effectiveArrivalTime.tz(destZone).format("HH:mm"));
    }
    setIsEditing(false);
  };

  const handleReset = (): void => {
    if (defaultArrivalTime && defaultArrivalTime.isValid()) {
      setTimeValue(defaultArrivalTime.tz(destZone).format("HH:mm"));
    }
  };

  const displayTime =
    effectiveArrivalTime && effectiveArrivalTime.isValid() ? effectiveArrivalTime.tz(destZone).format("h:mm A") : "??:??";

  const hasDefault = defaultArrivalTime !== null && defaultArrivalTime.isValid();

  return {
    isEditing,
    setIsEditing,
    timeValue,
    handleTimeChange,
    handleSave,
    handleCancel,
    handleReset,
    displayTime,
    hasDefault,
    effectiveArrivalTime,
    hasEffectiveArrivalTime,
    weather,
    isLoadingWeather,
    weatherError,
    weatherErrorDateTime,
  };
};

