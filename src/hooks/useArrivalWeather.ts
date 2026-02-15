import { useEffect, useMemo, useState } from "react";
import dayjs, { type Dayjs } from "dayjs";
import type { Destination, WeatherDetails } from "../types/destination";
import { getWeatherForecast, peekWeatherForecast, type WeatherForecast } from "../services/weatherService";

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

    const stored = destination.weatherDetails;
    if (
      stored &&
      stored.latitude === latitude &&
      stored.longitude === longitude &&
      stored.dateTime.isValid() &&
      stored.dateTime.format("YYYY-MM-DD-HH") === dateTimeToFetch.format("YYYY-MM-DD-HH")
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

    const [hours, minutes] = timeValue.split(":").map(Number);
    const newDateTime = arrivalDate.hour(hours).minute(minutes).second(0).millisecond(0);
    onArrivalTimeChange(newDateTime);
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

