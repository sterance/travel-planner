import { type ReactElement, useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import dayjs from "dayjs";
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
import { TimezoneSelector } from "./TimezoneSelector";
import type { Destination } from "../types/destination";

function toZonedDateTime(isoString: string, viewZone: string): Temporal.ZonedDateTime {
  return Temporal.Instant.from(isoString).toZonedDateTimeISO(viewZone);
}

function plainTodayInZone(zone: string): Temporal.PlainDate {
  return Temporal.PlainDate.from(dayjs().tz(zone).format("YYYY-MM-DD"));
}

function toScheduleXEvents(
  inputs: CalendarEventInput[],
  viewZone: string,
): Array<{
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
      start: toZonedDateTime(e.start, viewZone),
      end: toZonedDateTime(e.end, viewZone),
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
  destinations: Destination[];
  initialDate?: string | null;
  timeZone: string;
  explicitOverride: string | null;
  onTimeZoneChange: (zone: string) => void;
}

export const Calendar = ({
  events,
  destinations,
  initialDate,
  timeZone,
  explicitOverride,
  onTimeZoneChange,
}: CalendarProps): ReactElement => {
  const { mode } = useThemeMode();
  const isDark = mode === "dark";
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [timezoneHost, setTimezoneHost] = useState<HTMLElement | null>(null);

  const eventsService = useState(() => createEventsServicePlugin())[0];

  const scheduleXEvents = useMemo(() => toScheduleXEvents(events, timeZone), [events, timeZone]);

  const selectedDate = useMemo(() => {
    if (initialDate) {
      try {
        return Temporal.PlainDate.from(initialDate);
      } catch {
        return plainTodayInZone(timeZone);
      }
    }
    return plainTodayInZone(timeZone);
  }, [initialDate, timeZone]);

  const calendar = useCalendarApp({
    views: [createViewDay(), createViewWeek(), createViewMonthGrid(), createViewMonthAgenda()],
    defaultView: createViewMonthGrid().name,
    selectedDate,
    isDark,
    calendars,
    events: scheduleXEvents,
    plugins: [eventsService],
    timezone: timeZone,
  });

  useEffect(() => {
    eventsService.set(scheduleXEvents);
  }, [eventsService, scheduleXEvents]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const selectHeader = (): HTMLElement | null =>
      wrapper.querySelector<HTMLElement>(
        ".sx__calendar-header, .sx__view-header, .sx__week-header, .sx__month-grid-header",
      );

    const selectTimezoneHost = (header: HTMLElement): HTMLElement => {
      const childContainers = Array.from(header.children).filter(
        (el): el is HTMLElement => el instanceof HTMLElement,
      );
      if (childContainers.length === 0) return header;

      const leftCandidate = childContainers.find((el) => {
        const text = el.textContent?.toLowerCase() ?? "";
        return text.includes("today");
      });
      return leftCandidate ?? childContainers[0];
    };

    const attach = () => {
      const header = selectHeader();
      const next = header ? selectTimezoneHost(header) : null;
      setTimezoneHost((prev) => (prev === next ? prev : next));
    };

    attach();

    const observer = new MutationObserver(attach);
    observer.observe(wrapper, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return (
    <Box
      ref={wrapperRef}
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
      {timezoneHost
        ? createPortal(
            <Box sx={{ minWidth: 280, maxWidth: 360, px: 1 }}>
              <TimezoneSelector
                destinations={destinations}
                explicitOverride={explicitOverride}
                effectiveZone={timeZone}
                onChange={onTimeZoneChange}
              />
            </Box>,
            timezoneHost,
          )
        : null}
    </Box>
  );
};
