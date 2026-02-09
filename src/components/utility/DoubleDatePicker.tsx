import { useState, useEffect, type ReactElement, type ComponentProps } from "react";
import Popover from "@mui/material/Popover";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import dayjs, { type Dayjs } from "dayjs";

interface DoubleDatePickerProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  checkInDate: Dayjs | null;
  checkOutDate: Dayjs | null;
  tripStartDate: Dayjs | null;
  calculatedArrivalDate: Dayjs | null;
  isFirst: boolean;
  onDateChange: (checkIn: Dayjs | null, checkOut: Dayjs | null) => void;
}

const validateDates = (checkIn: Dayjs | null, checkOut: Dayjs | null, tripStartDate: Dayjs | null, calculatedArrivalDate: Dayjs | null, isFirst: boolean): string[] => {
  const errors: string[] = [];

  if (!checkIn || !checkOut) {
    if (!checkIn && !checkOut) {
      return [];
    }
    return errors;
  }

  if (!checkIn.isValid() || !checkOut.isValid()) {
    errors.push("Invalid date format");
    return errors;
  }

  if (tripStartDate && tripStartDate.isValid() && checkIn.isBefore(tripStartDate, "day")) {
    errors.push("Check-in date is before trip start date");
  }

  if (checkOut.isBefore(checkIn, "day") || checkOut.isSame(checkIn, "day")) {
    errors.push("Check-out date must be after check-in date");
  }

  if (!isFirst && calculatedArrivalDate && calculatedArrivalDate.isValid() && checkIn.isBefore(calculatedArrivalDate, "day")) {
    errors.push("Check-in date is before calculated arrival date");
  }

  return errors;
};

export const DoubleDatePicker = ({ open, anchorEl, onClose, checkInDate, checkOutDate, tripStartDate, calculatedArrivalDate, isFirst, onDateChange }: DoubleDatePickerProps): ReactElement => {
  const [localCheckIn, setLocalCheckIn] = useState<Dayjs | null>(checkInDate);
  const [localCheckOut, setLocalCheckOut] = useState<Dayjs | null>(checkOutDate);
  const [selectedStart, setSelectedStart] = useState<Dayjs | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<Dayjs | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Dayjs>(checkInDate || checkOutDate || dayjs());

  useEffect(() => {
    setLocalCheckIn(checkInDate);
    setLocalCheckOut(checkOutDate);
    setSelectedStart(checkInDate);
    setSelectedEnd(checkOutDate);
    if (checkInDate) {
      setCurrentMonth(checkInDate);
    } else if (checkOutDate) {
      setCurrentMonth(checkOutDate);
    }
  }, [checkInDate, checkOutDate, open]);

  const validationErrors = validateDates(localCheckIn, localCheckOut, tripStartDate, calculatedArrivalDate, isFirst);

  const handleDateSelect = (date: Dayjs): void => {
    if (!selectedStart || (selectedStart && selectedEnd)) {
      setSelectedStart(date);
      setSelectedEnd(null);
      setLocalCheckIn(date);
      setLocalCheckOut(null);
    } else if (selectedStart && !selectedEnd) {
      if (date.isBefore(selectedStart, "day")) {
        setSelectedStart(date);
        setSelectedEnd(null);
        setLocalCheckIn(date);
        setLocalCheckOut(null);
      } else if (date.isSame(selectedStart, "day")) {
        setSelectedEnd(null);
        setLocalCheckOut(null);
      } else {
        setSelectedEnd(date);
        setLocalCheckOut(date);
        setLocalCheckIn(selectedStart);
      }
    }
  };

  const handleCheckInAdjust = (delta: number): void => {
    if (localCheckIn) {
      const newCheckIn = localCheckIn.add(delta, "day");
      setLocalCheckIn(newCheckIn);
      setSelectedStart(newCheckIn);
      if (localCheckOut && newCheckIn.isAfter(localCheckOut, "day")) {
        setLocalCheckOut(newCheckIn.add(1, "day"));
        setSelectedEnd(newCheckIn.add(1, "day"));
      }
    }
  };

  const handleCheckOutAdjust = (delta: number): void => {
    if (localCheckOut) {
      const newCheckOut = localCheckOut.add(delta, "day");
      if (!localCheckIn || newCheckOut.isAfter(localCheckIn, "day")) {
        setLocalCheckOut(newCheckOut);
        setSelectedEnd(newCheckOut);
      }
    }
  };

  const handleSave = (): void => {
    onDateChange(localCheckIn, localCheckOut);
    onClose();
  };

  const handleCancel = (): void => {
    setLocalCheckIn(checkInDate);
    setLocalCheckOut(checkOutDate);
    setSelectedStart(checkInDate);
    setSelectedEnd(checkOutDate);
    onClose();
  };

  const isDateInRange = (date: Dayjs): boolean => {
    if (!selectedStart || !selectedEnd) return false;
    return date.isAfter(selectedStart, "day") && date.isBefore(selectedEnd, "day");
  };

  const isStartDate = (date: Dayjs): boolean => {
    return selectedStart?.isSame(date, "day") ?? false;
  };

  const isEndDate = (date: Dayjs): boolean => {
    return selectedEnd?.isSame(date, "day") ?? false;
  };

  type CustomDayProps = ComponentProps<typeof PickersDay>;

  const CustomDay = (props: CustomDayProps): ReactElement => {
    const { day, onClick, ...other } = props;
    const date = dayjs(day as Dayjs);
    const inRange = isDateInRange(date);
    const isStart = isStartDate(date);
    const isEnd = isEndDate(date);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
      event.stopPropagation();
      handleDateSelect(date);
      if (onClick) {
        onClick(event);
      }
    };

    return (
      <PickersDay
        {...other}
        day={day}
        onClick={handleClick}
        sx={{
          ...(inRange && {
            backgroundColor: "action.selected",
            borderRadius: 0,
            "&:first-of-type": {
              borderTopLeftRadius: "50%",
              borderBottomLeftRadius: "50%",
            },
            "&:last-of-type": {
              borderTopRightRadius: "50%",
              borderBottomRightRadius: "50%",
            },
          }),
          ...(isStart && {
            backgroundColor: "primary.main",
            color: "primary.contrastText",
            borderRadius: "50% 0 0 50%",
            "&:hover": {
              backgroundColor: "primary.dark",
            },
            ...(isEnd && {
              borderRadius: "50%",
            }),
          }),
          ...(isEnd &&
            !isStart && {
              backgroundColor: "primary.main",
              color: "primary.contrastText",
              borderRadius: "0 50% 50% 0",
              "&:hover": {
                backgroundColor: "primary.dark",
              },
            }),
        }}
      />
    );
  };
  // RENDERING
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={handleCancel}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
    >
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box sx={{ p: 2, minWidth: 350 }}>
          <Stack spacing={2}>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 0.5, border: 1, borderColor: "divider", borderRadius: 1, px: 1, py: 0.5 }}>
                <CalendarMonthIcon sx={{ fontSize: 20, color: "action.active" }} />
                <Typography variant="body2" sx={{ flex: 1 }}>
                  {localCheckIn ? localCheckIn.format("ddd D MMM") : "Check-in"}
                </Typography>
                {localCheckIn && (
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <IconButton size="small" onClick={() => handleCheckInAdjust(-1)}>
                      <ChevronLeftIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleCheckInAdjust(1)}>
                      <ChevronRightIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </Box>
              <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 0.5, border: 1, borderColor: "divider", borderRadius: 1, px: 1, py: 0.5 }}>
                <CalendarMonthIcon sx={{ fontSize: 20, color: "action.active" }} />
                <Typography variant="body2" sx={{ flex: 1 }}>
                  {localCheckOut ? localCheckOut.format("ddd D MMM") : "Check-out"}
                </Typography>
                {localCheckOut && (
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <IconButton size="small" onClick={() => handleCheckOutAdjust(-1)}>
                      <ChevronLeftIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleCheckOutAdjust(1)}>
                      <ChevronRightIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </Box>
            </Box>

            {validationErrors.length > 0 && (
              <Alert severity="warning" sx={{ py: 0.5 }}>
                {validationErrors.map((error, index) => (
                  <Typography key={index} variant="body2">
                    {error}
                  </Typography>
                ))}
              </Alert>
            )}

            <DateCalendar
              value={selectedStart || selectedEnd || currentMonth}
              onChange={() => {}}
              onMonthChange={(newValue) => {
                if (newValue) {
                  setCurrentMonth(newValue);
                }
              }}
              slots={{
                day: CustomDay,
              }}
            />

            <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
              <Button onClick={handleCancel}>Cancel</Button>
              <Button onClick={handleSave} variant="contained">
                Save
              </Button>
            </Box>
          </Stack>
        </Box>
      </LocalizationProvider>
    </Popover>
  );
};
