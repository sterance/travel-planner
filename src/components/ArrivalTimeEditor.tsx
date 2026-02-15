import type { ReactElement } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import RefreshIcon from "@mui/icons-material/Refresh";

interface ArrivalTimeEditorProps {
  isEditing: boolean;
  timeValue: string;
  displayTime: string;
  hasDefault: boolean;
  hasEffectiveArrivalTime: boolean;
  backgroundMode: "default" | "light" | "dark";
  mainTextColor: string;
  secondaryTextColor: string;
  themeTextSecondaryColor: string;
  onTimeChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
  onCancel: () => void;
  onReset: () => void;
  onStartEditing: () => void;
}

export const ArrivalTimeEditor = ({
  isEditing,
  timeValue,
  displayTime,
  hasDefault,
  hasEffectiveArrivalTime,
  backgroundMode,
  mainTextColor,
  secondaryTextColor,
  themeTextSecondaryColor,
  onTimeChange,
  onSave,
  onCancel,
  onReset,
  onStartEditing,
}: ArrivalTimeEditorProps): ReactElement => {
  const theme = useTheme();
  const useOverrideEditStyling = backgroundMode !== "default" && hasEffectiveArrivalTime;

  if (isEditing) {
    return (
      <>
        <TextField
          type="time"
          value={timeValue}
          onChange={onTimeChange}
          size="small"
          sx={{
            width: 140,
            "& input": {
              color: useOverrideEditStyling ? mainTextColor : undefined,
            },
            "& input[type='time']::-webkit-calendar-picker-indicator": {
              ...(theme.palette.mode === "dark" && { filter: "invert(1)" }),
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
        <Button
          size="small"
          onClick={onSave}
          variant="contained"
          sx={
            useOverrideEditStyling
              ? {
                  color: backgroundMode === "dark" ? "#ffffff" : "#111111",
                  backgroundColor: backgroundMode === "dark" ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.85)",
                  "&:hover": {
                    backgroundColor: backgroundMode === "dark" ? "rgba(0, 0, 0, 0.7)" : "rgba(255, 255, 255, 0.95)",
                  },
                }
              : undefined
          }
        >
          Save
        </Button>
        <Button size="small" onClick={onCancel} sx={useOverrideEditStyling ? { color: mainTextColor } : undefined}>
          Cancel
        </Button>
        {hasDefault && (
          <Button size="small" onClick={onReset} startIcon={<RefreshIcon />} sx={useOverrideEditStyling ? { color: mainTextColor } : undefined}>
            Reset
          </Button>
        )}
      </>
    );
  }

  return (
    <Typography
      variant="h5"
      component="span"
      onClick={onStartEditing}
      sx={{
        cursor: "pointer",
        color: hasEffectiveArrivalTime ? secondaryTextColor : themeTextSecondaryColor,
        "&:hover": {
          opacity: 0.7,
        },
      }}
    >
      {displayTime}
    </Typography>
  );
};

