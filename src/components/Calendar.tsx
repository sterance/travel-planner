import { type ReactElement, useState, useMemo, useEffect } from "react";
import { useCalendarApp, ScheduleXCalendar } from "@schedule-x/react";
import {
  createViewDay,
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewWeek,
} from "@schedule-x/calendar";
import { createEventsServicePlugin } from "@schedule-x/events-service";
import "temporal-polyfill/global";
import "@schedule-x/theme-default/dist/index.css";
import { useThemeMode } from "../theme/ThemeContext";
import {
  type CalendarEventInput,
  CALENDAR_COLORS,
  CALENDAR_IDS,
} from "../utils/calendarTransform";
import Box from "@mui/material/Box";

function toZonedDateTime(isoString: string): Temporal.ZonedDateTime {
  return Temporal.Instant.from(isoString).toZonedDateTimeISO("UTC");
}

function toScheduleXEvents(inputs: CalendarEventInput[]): Array<{
  id: string;
  title: string;
  start: Temporal.PlainDate | Temporal.ZonedDateTime;
  end: Temporal.PlainDate | Temporal.ZonedDateTime;
  calendarId: string;
}> {
  return inputs.map((e) => {
    if (e.allDay) {
      return {
        id: e.id,
        title: e.title,
        start: Temporal.PlainDate.from(e.start),
        end: Temporal.PlainDate.from(e.end),
        calendarId: e.calendarId,
      };
    }
    return {
      id: e.id,
      title: e.title,
      start: toZonedDateTime(e.start),
      end: toZonedDateTime(e.end),
      calendarId: e.calendarId,
    };
  });
}

const calendars = {
  [CALENDAR_IDS.destination]: {
    colorName: CALENDAR_IDS.destination,
    ...CALENDAR_COLORS[CALENDAR_IDS.destination],
  },
  [CALENDAR_IDS.transport]: {
    colorName: CALENDAR_IDS.transport,
    ...CALENDAR_COLORS[CALENDAR_IDS.transport],
  },
  [CALENDAR_IDS.accommodation]: {
    colorName: CALENDAR_IDS.accommodation,
    ...CALENDAR_COLORS[CALENDAR_IDS.accommodation],
  },
  [CALENDAR_IDS.activity]: {
    colorName: CALENDAR_IDS.activity,
    ...CALENDAR_COLORS[CALENDAR_IDS.activity],
  },
};

interface CalendarProps {
  events: CalendarEventInput[];
  initialDate?: string | null;
}

export const Calendar = ({ events, initialDate }: CalendarProps): ReactElement => {
  const { mode } = useThemeMode();
  const isDark = mode === "dark";

  const eventsService = useState(() => createEventsServicePlugin())[0];

  const scheduleXEvents = useMemo(() => toScheduleXEvents(events), [events]);

  const selectedDate = useMemo(() => {
    if (initialDate) {
      try {
        return Temporal.PlainDate.from(initialDate);
      } catch {
        return Temporal.Now.plainDateISO();
      }
    }
    return Temporal.Now.plainDateISO();
  }, [initialDate]);

  const calendar = useCalendarApp({
    views: [createViewDay(), createViewWeek(), createViewMonthGrid(), createViewMonthAgenda()],
    defaultView: createViewMonthGrid().name,
    selectedDate,
    isDark,
    calendars,
    events: scheduleXEvents,
    plugins: [eventsService],
  });

  useEffect(() => {
    eventsService.set(scheduleXEvents);
  }, [eventsService, scheduleXEvents]);

  return (
    <Box
      className="sx-react-calendar-wrapper"
      sx={{
        width: "100%",
        maxWidth: "100%",
        height: 600,
        minHeight: 400,
        maxHeight: "80vh",
        "& .sx__time-grid-event": {
          minHeight: "1.75rem",
        },
      }}
    >
      <ScheduleXCalendar calendarApp={calendar} />
    </Box>
  );
};
