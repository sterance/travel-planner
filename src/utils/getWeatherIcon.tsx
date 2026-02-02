import { type ReactElement } from "react";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import CloudIcon from "@mui/icons-material/Cloud";
import CloudQueueIcon from "@mui/icons-material/CloudQueue";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import ThunderstormIcon from "@mui/icons-material/Thunderstorm";
import FoggyIcon from "@mui/icons-material/Foggy";

interface GetWeatherIconOptions {
  width?: number | string;
  height?: number | string;
}

const WEATHER_GRADIENTS = {
  clear: {
    dark: "linear-gradient(135deg, #0d47a1, #1976d2, #fbc02d)",
    light: "linear-gradient(135deg, #fff8e1, #ffe082, #ffb74d)",
  },
  partlyCloudy: {
    dark: "linear-gradient(135deg, #1f2933, #3e4c59)",
    light: "linear-gradient(135deg, #e3f2fd, #bbdefb)",
  },
  overcast: {
    dark: "linear-gradient(135deg, #263238, #37474f)",
    light: "linear-gradient(135deg, #eceff1, #cfd8dc)",
  },
  fog: {
    dark: "linear-gradient(135deg, #37474f, #546e7a)",
    light: "linear-gradient(135deg, #f5f5f5, #e0e0e0)",
  },
  drizzle: {
    dark: "linear-gradient(135deg, #1e3a5f, #4a6572)",
    light: "linear-gradient(135deg, #e3f2fd, #90caf9)",
  },
  rain: {
    dark: "linear-gradient(135deg, #102a43, #243b53, #334e68)",
    light: "linear-gradient(135deg, #e1f5fe, #81d4fa, #4fc3f7)",
  },
  snow: {
    dark: "linear-gradient(135deg, #004d40, #00695c, #80deea)",
    light: "linear-gradient(135deg, #e0f7fa, #e1f5fe, #ffffff)",
  },
  thunderstorm: {
    dark: "linear-gradient(135deg, #000000, #1a237e, #311b92)",
    light: "linear-gradient(135deg, #311b92, #0d47a1, #263238)",
  },
} as const;

type WeatherVisualCategory = keyof typeof WEATHER_GRADIENTS;

const getWeatherCategory = (weatherCode: number): WeatherVisualCategory => {
  if (weatherCode === 0 || weatherCode === 1) {
    return "clear";
  }
  if (weatherCode === 2) {
    return "partlyCloudy";
  }
  if (weatherCode === 3) {
    return "overcast";
  }
  if (weatherCode === 45 || weatherCode === 48) {
    return "fog";
  }
  if (weatherCode >= 51 && weatherCode <= 57) {
    return "drizzle";
  }
  if ((weatherCode >= 61 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82)) {
    return "rain";
  }
  if ((weatherCode >= 71 && weatherCode <= 77) || (weatherCode >= 85 && weatherCode <= 86)) {
    return "snow";
  }
  if (weatherCode >= 95 && weatherCode <= 99) {
    return "thunderstorm";
  }
  return "overcast";
};

export const getWeatherBackgroundGradient = (weatherCode: number | null | undefined, mode: string): string | undefined => {
  if (weatherCode == null || Number.isNaN(weatherCode)) {
    return undefined;
  }

  const isDark = mode === "dark";
  const themeKey = isDark ? "dark" : "light";

  const category = getWeatherCategory(weatherCode);

  return WEATHER_GRADIENTS[category][themeKey];
};

export const getWeatherIcon = (weatherCode: number, options?: GetWeatherIconOptions): ReactElement => {
  const iconProps = options ? { sx: { width: options.width, height: options.height } } : {};

  const category = getWeatherCategory(weatherCode);

  switch (category) {
    case "clear":
      return <WbSunnyIcon {...iconProps} />;
    case "partlyCloudy":
      return <CloudQueueIcon {...iconProps} />;
    case "overcast":
      return <CloudIcon {...iconProps} />;
    case "fog":
      return <FoggyIcon {...iconProps} />;
    case "drizzle":
    case "rain":
      return <WaterDropIcon {...iconProps} />;
    case "snow":
      return <AcUnitIcon {...iconProps} />;
    case "thunderstorm":
      return <ThunderstormIcon {...iconProps} />;
    default:
      return <CloudIcon {...iconProps} />;
  }
};
