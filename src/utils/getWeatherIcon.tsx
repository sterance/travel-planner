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

export const getWeatherIcon = (weatherCode: number, options?: GetWeatherIconOptions): ReactElement => {
  const iconProps = options ? { sx: { width: options.width, height: options.height } } : {};

  if (weatherCode === 0 || weatherCode === 1) {
    return <WbSunnyIcon {...iconProps} />;
  }
  if (weatherCode === 2) {
    return <CloudQueueIcon {...iconProps} />;
  }
  if (weatherCode === 3) {
    return <CloudIcon {...iconProps} />;
  }
  if (weatherCode === 45 || weatherCode === 48) {
    return <FoggyIcon {...iconProps} />;
  }
  if (weatherCode >= 51 && weatherCode <= 57) {
    return <WaterDropIcon {...iconProps} />;
  }
  if (weatherCode >= 61 && weatherCode <= 67) {
    return <WaterDropIcon {...iconProps} />;
  }
  if (weatherCode >= 71 && weatherCode <= 77) {
    return <AcUnitIcon {...iconProps} />;
  }
  if (weatherCode >= 80 && weatherCode <= 82) {
    return <WaterDropIcon {...iconProps} />;
  }
  if (weatherCode >= 85 && weatherCode <= 86) {
    return <AcUnitIcon {...iconProps} />;
  }
  if (weatherCode >= 95 && weatherCode <= 99) {
    return <ThunderstormIcon {...iconProps} />;
  }
  return <CloudIcon {...iconProps} />;
};
