import { useState, type ReactElement } from "react";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import WarningIcon from "@mui/icons-material/Warning";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { type Dayjs } from "dayjs";

interface SettingsCardProps {
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  onStartDateChange: (date: Dayjs | null) => void;
  hasDateErrors: boolean;
}

export const SettingsCard = ({
  startDate,
  endDate,
  onStartDateChange,
  hasDateErrors,
}: SettingsCardProps): ReactElement => {
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = (): void => {
    setExpanded(!expanded);
  };

  return (
    <Card>
      <CardHeader
        title={
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Typography variant="h5" component="div">
              Trip Settings
            </Typography>
            <IconButton
              onClick={handleExpandClick}
              aria-expanded={expanded}
              aria-label="show more"
              size="large"
              sx={{
                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            >
              <ExpandMoreIcon />
            </IconButton>
          </Box>
        }
        sx={{
          "& .MuiCardHeader-content": {
            width: "100%",
          },
        }}
      />
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Start date"
                  value={startDate}
                  onChange={(newValue) => {
                    onStartDateChange(newValue);
                  }}
                  format="MMM D, YYYY"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                    },
                  }}
                />
              </LocalizationProvider>
              <TextField
                label="End date"
                value={endDate ? endDate.format("MMM D, YYYY") : "--"}
                slotProps={{
                  input: {
                    readOnly: true,
                  },
                }}
                fullWidth
                error={hasDateErrors}
              />
            </Box>
            {hasDateErrors && (
              <Alert severity="warning" icon={<WarningIcon />}>
                Some destination dates have validation errors.
              </Alert>
            )}
          </Box>
        </CardContent>
      </Collapse>
    </Card>
  );
};
