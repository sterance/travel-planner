import dayjs, { type Dayjs } from "dayjs";

const zoned = (d: Dayjs, zone?: string): Dayjs => (zone ? d.tz(zone) : d);

export const formatDateTime = (date: Dayjs | string | null | undefined, zone?: string): string => {
  if (!date) return "";
  const d = dayjs(date);
  if (!d.isValid()) return "";
  return zoned(d, zone).format("MMM D, h:mm A");
};

export const formatDateTimeRange = (
  start: Dayjs | string | null | undefined,
  end: Dayjs | string | null | undefined,
  fallbackStart = "No start",
  fallbackEnd = "No end",
  startZone?: string,
  endZone?: string
): string => {
  const sRaw = start ? dayjs(start) : null;
  const eRaw = end ? dayjs(end) : null;
  const s = sRaw?.isValid() ? zoned(sRaw, startZone) : null;
  const e = eRaw?.isValid() ? zoned(eRaw, endZone ?? startZone) : null;
  const sValid = s?.isValid();
  const eValid = e?.isValid();
  if (!sValid && !eValid) return `${fallbackStart} ￫ ${fallbackEnd}`;
  if (!sValid) return `${fallbackStart} ￫ ${e!.format("MMM D, h:mm A")}`;
  if (!eValid) return `${s!.format("MMM D, h:mm A")} ￫ ${fallbackEnd}`;
  if (s!.format("YYYY-MM-DD") === e!.format("YYYY-MM-DD")) {
    return `${s!.format("MMM D")}, ${s!.format("h:mm A")} ￫ ${e!.format("h:mm A")}`;
  }
  return `${s!.format("MMM D, h:mm A")} ￫ ${e!.format("MMM D, h:mm A")}`;
};

export const getSafeDayjsValue = (value: Dayjs | null): Dayjs | null => {
  if (!value) return null;
  return value.isValid() ? value : null;
};
