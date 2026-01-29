import dayjs, { type Dayjs } from "dayjs";

export interface WeatherForecast {
  temperature: number;
  condition: string;
  weatherCode: number;
}

const weatherCache = new Map<string, WeatherForecast | null>();

export const peekWeatherForecast = (
  latitude: number,
  longitude: number,
  dateTime: Dayjs
): WeatherForecast | null | undefined => {
  if (!dateTime.isValid()) {
    return undefined;
  }

  const cacheKey = `${latitude},${longitude},${dateTime.format("YYYY-MM-DD-HH")}`;
  if (!weatherCache.has(cacheKey)) {
    return undefined;
  }

  return weatherCache.get(cacheKey) ?? null;
};

const calculateMode = (values: number[]): number => {
  if (values.length === 0) return 0;
  
  const frequency: Record<number, number> = {};
  for (const value of values) {
    frequency[value] = (frequency[value] || 0) + 1;
  }
  
  let maxCount = 0;
  let modes: number[] = [];
  
  for (const [value, count] of Object.entries(frequency)) {
    const numValue = Number(value);
    if (count > maxCount) {
      maxCount = count;
      modes = [numValue];
    } else if (count === maxCount) {
      modes.push(numValue);
    }
  }
  
  if (modes.length === 1) {
    return modes[0];
  }
  
  return Math.max(...modes);
};

const getHistoricalWeatherAverage = async (
  latitude: number,
  longitude: number,
  dateTime: Dayjs
): Promise<WeatherForecast | null> => {
  if (!dateTime.isValid()) {
    return null;
  }

  const historicalCacheKey = `historical-${latitude},${longitude},${dateTime.format("YYYY-MM-DD-HH")}`;
  if (weatherCache.has(historicalCacheKey)) {
    return weatherCache.get(historicalCacheKey) ?? null;
  }

  const month = dateTime.month() + 1;
  const day = dateTime.date();
  const hour = dateTime.hour();
  const currentDate = dayjs();
  const minYear = 1940;
  
  const years: number[] = [];
  for (let i = 1; i <= 5; i++) {
    const year = currentDate.year() - i;
    if (year >= minYear) {
      const testDate = dayjs(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
      if (testDate.isValid() && testDate.isBefore(currentDate.subtract(5, "day"))) {
        years.push(year);
      }
    }
  }

  if (years.length === 0) {
    weatherCache.set(historicalCacheKey, null);
    return null;
  }

  const startDate = `${years[years.length - 1]}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const endDate = `${years[0]}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  try {
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=${startDate}&end_date=${endDate}&hourly=temperature_2m,weather_code&timezone=auto`;

    const response = await fetch(url);

    if (!response.ok) {
      weatherCache.set(historicalCacheKey, null);
      return null;
    }

    const data = await response.json();

    if (!data.hourly || !data.hourly.temperature_2m || !data.hourly.weather_code) {
      weatherCache.set(historicalCacheKey, null);
      return null;
    }

    const times = data.hourly.time as string[];
    const temperatures = data.hourly.temperature_2m as number[];
    const weatherCodes = data.hourly.weather_code as number[];

    if (times.length !== temperatures.length || times.length !== weatherCodes.length) {
      weatherCache.set(historicalCacheKey, null);
      return null;
    }

    const hourValues: { temp: number; code: number }[] = [];

    for (let i = 0; i < times.length; i++) {
      const timeStr = times[i];
      const timeDate = dayjs(timeStr);
      if (timeDate.isValid() && timeDate.month() + 1 === month && timeDate.date() === day && timeDate.hour() === hour) {
        const temp = temperatures[i];
        const code = weatherCodes[i];
        if (temp !== null && temp !== undefined && !isNaN(temp) && code !== null && code !== undefined && !isNaN(code)) {
          hourValues.push({
            temp,
            code,
          });
        }
      }
    }

    if (hourValues.length === 0) {
      weatherCache.set(historicalCacheKey, null);
      return null;
    }

    const avgTemperature = hourValues.reduce((sum, v) => sum + v.temp, 0) / hourValues.length;
    const modeWeatherCode = calculateMode(hourValues.map((v) => v.code));
    const condition = WEATHER_CODE_MAP[modeWeatherCode] || "unknown";

    const forecast: WeatherForecast = {
      temperature: Math.round(avgTemperature),
      condition,
      weatherCode: modeWeatherCode,
    };

    weatherCache.set(historicalCacheKey, forecast);
    return forecast;
  } catch (error) {
    console.error("Error fetching historical weather:", error);
    weatherCache.set(historicalCacheKey, null);
    return null;
  }
};

const WEATHER_CODE_MAP: Record<number, string> = {
  0: "clear sky",
  1: "mainly clear",
  2: "partly cloudy",
  3: "overcast",
  45: "foggy",
  48: "depositing rime fog",
  51: "light drizzle",
  53: "moderate drizzle",
  55: "dense drizzle",
  56: "light freezing drizzle",
  57: "dense freezing drizzle",
  61: "slight rain",
  63: "moderate rain",
  65: "heavy rain",
  66: "light freezing rain",
  67: "heavy freezing rain",
  71: "slight snow",
  73: "moderate snow",
  75: "heavy snow",
  77: "snow grains",
  80: "slight rain showers",
  81: "moderate rain showers",
  82: "violent rain showers",
  85: "slight snow showers",
  86: "heavy snow showers",
  95: "thunderstorm",
  96: "thunderstorm with slight hail",
  99: "thunderstorm with heavy hail",
};

export const getWeatherForecast = async (
  latitude: number,
  longitude: number,
  dateTime: Dayjs
): Promise<WeatherForecast | null> => {
  if (!dateTime.isValid()) {
    return null;
  }

  const cacheKey = `${latitude},${longitude},${dateTime.format("YYYY-MM-DD-HH")}`;
  if (weatherCache.has(cacheKey)) {
    return weatherCache.get(cacheKey) ?? null;
  }

  try {
    const startDate = dateTime.format("YYYY-MM-DD");
    const endDate = dateTime.format("YYYY-MM-DD");
    const hour = dateTime.hour();

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weather_code&start_date=${startDate}&end_date=${endDate}&timezone=auto`;

    const response = await fetch(url);

    if (!response.ok) {
      const historicalForecast = await getHistoricalWeatherAverage(latitude, longitude, dateTime);
      if (historicalForecast) {
        return historicalForecast;
      }
      weatherCache.set(cacheKey, null);
      return null;
    }

    const data = await response.json();

    if (!data.hourly || !data.hourly.temperature_2m || !data.hourly.weather_code) {
      const historicalForecast = await getHistoricalWeatherAverage(latitude, longitude, dateTime);
      if (historicalForecast) {
        return historicalForecast;
      }
      weatherCache.set(cacheKey, null);
      return null;
    }

    const temperatures = data.hourly.temperature_2m as number[];
    const weatherCodes = data.hourly.weather_code as number[];

    if (hour < 0 || hour >= temperatures.length) {
      const historicalForecast = await getHistoricalWeatherAverage(latitude, longitude, dateTime);
      if (historicalForecast) {
        return historicalForecast;
      }
      weatherCache.set(cacheKey, null);
      return null;
    }

    const temperature = temperatures[hour];
    const weatherCode = weatherCodes[hour];
    const condition = WEATHER_CODE_MAP[weatherCode] || "unknown";

    const forecast: WeatherForecast = {
      temperature: Math.round(temperature),
      condition,
      weatherCode,
    };

    weatherCache.set(cacheKey, forecast);
    return forecast;
  } catch (error) {
    console.error("Error fetching weather forecast:", error);
    const historicalForecast = await getHistoricalWeatherAverage(latitude, longitude, dateTime);
    if (historicalForecast) {
      return historicalForecast;
    }
    weatherCache.set(cacheKey, null);
    return null;
  }
};
