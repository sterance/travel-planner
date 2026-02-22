import { type ReactElement } from "react";
import Box from "@mui/material/Box";
import calendar0Icon from "../../assets/icons/calendar/calendar-0.svg";
import calendar1Icon from "../../assets/icons/calendar/calendar-1.svg";
import calendar2Icon from "../../assets/icons/calendar/calendar-2.svg";
import calendar3Icon from "../../assets/icons/calendar/calendar-3.svg";
import calendar4Icon from "../../assets/icons/calendar/calendar-4.svg";
import calendar5Icon from "../../assets/icons/calendar/calendar-5.svg";
import calendar6Icon from "../../assets/icons/calendar/calendar-6.svg";
import calendar7Icon from "../../assets/icons/calendar/calendar-7.svg";
import calendar8Icon from "../../assets/icons/calendar/calendar-8.svg";
import calendar9Icon from "../../assets/icons/calendar/calendar-9.svg";

const calendarIcons = [calendar0Icon, calendar1Icon, calendar2Icon, calendar3Icon, calendar4Icon, calendar5Icon, calendar6Icon, calendar7Icon, calendar8Icon, calendar9Icon];

interface CalendarNightsIconProps {
  nights: number;
  size?: number;
}

export const CalendarNightsIcon = ({ nights, size = 32 }: CalendarNightsIconProps): ReactElement | null => {
  if (nights < 0 || nights > 9) {
    return null;
  }

  const icon = calendarIcons[nights];

  return (
    <Box
      sx={{
        width: size,
        height: size,
        backgroundColor: "text.primary",
        maskImage: `url(${icon})`,
        maskSize: "contain",
        maskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskImage: `url(${icon})`,
        WebkitMaskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
      }}
    />
  );
};

