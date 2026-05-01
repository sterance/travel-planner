import { type ReactElement, useMemo } from "react";
import dayjs from "dayjs";
import tzlookup from "tz-lookup";
import Autocomplete, { type AutocompleteRenderGroupParams } from "@mui/material/Autocomplete";
import Divider from "@mui/material/Divider";
import ListSubheader from "@mui/material/ListSubheader";
import TextField from "@mui/material/TextField";
import { CALENDAR_VIEW_ZONE_BROWSER_DEFAULT } from "../hooks/useCalendarViewZone";
import type { Destination } from "../types/destination";

function destinationZone(destination: Destination): string | null {
  const explicit = destination.timeZone?.trim();
  if (explicit) return explicit;
  const coords = destination.placeDetails?.coordinates;
  if (!coords || coords.length < 2) return null;
  const [lng, lat] = coords;
  try {
    return tzlookup(lat, lng);
  } catch {
    return null;
  }
}

type ZoneSection = "default" | "destination" | "other";
type ZoneOption = { value: string; label: string; section: ZoneSection };

function supportedIanaTimeZones(): string[] {
  try {
    const fn = (Intl as unknown as { supportedValuesOf?: (key: string) => string[] }).supportedValuesOf;
    if (typeof fn === "function") {
      return fn.call(Intl, "timeZone");
    }
  } catch {
    // ignore
  }
  return ["UTC", "Pacific/Auckland", "Australia/Sydney", "Asia/Tokyo", "Asia/Singapore", "Europe/London", "America/New_York", "America/Los_Angeles"];
}

function zoneLabel(zone: string): string {
  const d = dayjs.tz(dayjs(), zone);
  if (!d.isValid()) return zone;
  const offset = d.format("Z");
  return `${zone} (UTC${offset})`;
}

function browserZoneLabel(): string {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (zone) return zone;
  } catch {
    // ignore
  }
  return "UTC";
}

export interface TimezoneSelectorProps {
  destinations: Destination[];
  explicitOverride: string | null;
  effectiveZone: string;
  onChange: (zone: string) => void;
}

const sectionLabel: Record<ZoneSection, string> = {
  default: "Default",
  destination: "Trip destinations",
  other: "Other timezones",
};

export const TimezoneSelector = ({
  destinations,
  explicitOverride,
  effectiveZone: _effectiveZone,
  onChange,
}: TimezoneSelectorProps): ReactElement => {
  const supportedZones = useMemo(() => {
    return [...supportedIanaTimeZones()].sort((a, b) => a.localeCompare(b));
  }, []);

  const destinationZones = useMemo((): string[] => {
    const supportedSet = new Set(supportedZones);
    const sortedDestinations = destinations
      .map((destination, index) => {
        const zone = destinationZone(destination);
        const arrivalSortValue = destination.arrivalDate?.isValid() ? destination.arrivalDate.valueOf() : Number.POSITIVE_INFINITY;
        return { zone, arrivalSortValue, index };
      })
      .filter((item): item is { zone: string; arrivalSortValue: number; index: number } => item.zone != null && supportedSet.has(item.zone))
      .sort((a, b) => {
        if (a.arrivalSortValue !== b.arrivalSortValue) return a.arrivalSortValue - b.arrivalSortValue;
        return a.index - b.index;
      });

    const seen = new Set<string>();
    const orderedZones: string[] = [];
    for (const item of sortedDestinations) {
      if (seen.has(item.zone)) continue;
      seen.add(item.zone);
      orderedZones.push(item.zone);
    }
    return orderedZones;
  }, [destinations, supportedZones]);

  const options = useMemo((): ZoneOption[] => {
    const browser: ZoneOption = {
      value: CALENDAR_VIEW_ZONE_BROWSER_DEFAULT,
      label: `Current (${browserZoneLabel()})`,
      section: "default",
    };
    const destinationOptions: ZoneOption[] = destinationZones.map((zone) => ({
      value: zone,
      label: zoneLabel(zone),
      section: "destination",
    }));
    const destinationSet = new Set(destinationZones);
    const otherOptions: ZoneOption[] = supportedZones
      .filter((zone) => !destinationSet.has(zone))
      .map((zone) => ({
        value: zone,
        label: zoneLabel(zone),
        section: "other",
      }));
    return [browser, ...destinationOptions, ...otherOptions];
  }, [destinationZones, supportedZones]);

  const value = useMemo<ZoneOption>(() => {
    if (explicitOverride == null) {
      return options[0] ?? { value: CALENDAR_VIEW_ZONE_BROWSER_DEFAULT, label: "Browser default", section: "default" };
    }
    return (
      options.find((o) => o.value === explicitOverride) ?? {
        value: explicitOverride,
        label: zoneLabel(explicitOverride),
        section: "other",
      }
    );
  }, [explicitOverride, options]);

  const renderGroup = ({ key, group, children }: AutocompleteRenderGroupParams): ReactElement => {
    const section = group as ZoneSection;
    return (
      <li key={key}>
        {section !== "default" ? <Divider /> : null}
        <ListSubheader disableSticky>{sectionLabel[section]}</ListSubheader>
        <ul style={{ margin: 0, padding: 0 }}>{children}</ul>
      </li>
    );
  };

  return (
    <Autocomplete<ZoneOption, false, false, false>
      size="small"
      options={options}
      value={value}
      groupBy={(option) => option.section}
      renderGroup={renderGroup}
      onChange={(_, next) => {
        if (next) onChange(next.value);
      }}
      getOptionLabel={(o) => o.label}
      isOptionEqualToValue={(a, b) => a.value === b.value}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Timezone"
          // helperText={explicitOverride == null ? `Using ${effectiveZone}` : undefined}
        />
      )}
      sx={{ minWidth: 280, maxWidth: 480 }}
    />
  );
};
