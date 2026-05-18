import dayjs, { type Dayjs } from "dayjs";
import type { Destination } from "../types/destination";

export const getDestinationZone = (dest: Destination | null | undefined): string => {
  if (dest?.timeZone) return dest.timeZone;
  return dayjs.tz.guess();
};

export const getTransportZones = (fromDestination: Destination | undefined, toDestination: Destination | undefined): { departure: string; arrival: string } => {
  return {
    departure: getDestinationZone(fromDestination ?? null),
    arrival: getDestinationZone(toDestination ?? null),
  };
};

export const inZone = (value: Dayjs | string | null | undefined, zone: string): Dayjs | null => {
  if (value == null) return null;
  const d = dayjs.isDayjs(value) ? value : dayjs(value);
  if (!d.isValid()) return null;
  return d.tz(zone);
};

export const pickerValueInZone = (stored: Dayjs | null | undefined, zone: string): Dayjs | null => {
  if (!stored?.isValid()) return null;
  return stored.tz(zone);
};

export const storePickerAsZoneWall = (picked: Dayjs | null | undefined, zone: string): Dayjs | null => {
  if (!picked?.isValid()) return null;
  return dayjs.tz(`${picked.format("YYYY-MM-DD")}T${picked.format("HH:mm:ss")}`, zone);
};
