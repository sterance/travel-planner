import { useState, type ReactElement } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import { getWeatherBackgroundGradient, getWeatherIcon } from "../utils/getWeatherIcon";

type GradientMode = "theme" | "light" | "dark";

interface WeatherExample {
  label: string;
  code: number;
  description: string;
}

const WEATHER_EXAMPLES: WeatherExample[] = [
  { label: "Clear", code: 0, description: "code 0 (clear sky)" },
  { label: "Partly cloudy", code: 2, description: "code 2" },
  { label: "Overcast", code: 3, description: "code 3" },
  { label: "Fog", code: 45, description: "code 45" },
  { label: "Drizzle", code: 51, description: "code 51" },
  { label: "Rain", code: 61, description: "code 61" },
  { label: "Snow", code: 71, description: "code 71" },
  { label: "Thunderstorm", code: 95, description: "code 95" },
];

export const WeatherTestPage = (): ReactElement => {
  const theme = useTheme();
  const [gradientMode, setGradientMode] = useState<GradientMode>("theme");

  const handleGradientModeChange = (_: React.MouseEvent<HTMLElement>, value: GradientMode | null): void => {
    if (!value) return;
    setGradientMode(value);
  };

  const paletteModeForGradient = gradientMode === "theme" ? theme.palette.mode : gradientMode;

  const getTextColors = () => {
    if (paletteModeForGradient === "dark") {
      return {
        main: "#ffffff",
        secondary: "rgba(255, 255, 255, 0.7)",
      };
    }
    return {
      main: "#111111",
      secondary: "rgba(0, 0, 0, 0.6)",
    };
  };

  const textColors = getTextColors();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        px: 2,
        py: 3,
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography variant="h5">Arrival weather gradient test</Typography>
        <Typography variant="body2" color="text.secondary">
          quick page to show one example card for each weather category so you can tweak the gradient colors.
        </Typography>
        <Box sx={{ mt: 1 }}>
          <ToggleButtonGroup
            value={gradientMode}
            exclusive
            onChange={handleGradientModeChange}
            size="small"
          >
            <ToggleButton value="theme">Theme mode ({theme.palette.mode})</ToggleButton>
            <ToggleButton value="light">Force light</ToggleButton>
            <ToggleButton value="dark">Force dark</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 2,
        }}
      >
        {WEATHER_EXAMPLES.map((example) => {
          const backgroundGradient = getWeatherBackgroundGradient(example.code, paletteModeForGradient);

          return (
            <Card
              key={example.label}
              sx={{
                backgroundImage: backgroundGradient,
                bgcolor: backgroundGradient ? "transparent" : "background.default",
                borderRadius: 2,
                border: 1,
                borderColor: backgroundGradient ? "rgba(255, 255, 255, 0.35)" : "divider",
                boxShadow: "none",
                minHeight: 140,
                display: "flex",
              }}
            >
              <CardContent
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 1,
                  width: "100%",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1.5,
                  }}
                >
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                    <Typography variant="subtitle1" sx={{ color: textColors.main }}>
                      {example.label}
                    </Typography>
                    <Typography variant="caption" sx={{ color: textColors.secondary }}>
                      {example.description}
                    </Typography>
                    <Typography variant="caption" sx={{ color: textColors.secondary }}>
                      gradientMode: {paletteModeForGradient}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {getWeatherIcon(example.code, { width: 40, height: 40, color: textColors.main })}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
};

