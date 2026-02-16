import dayjs, { type Dayjs } from "dayjs";

export const formatDateTime = (date: Dayjs | string | null | undefined): string => {
  if (!date) return "";
  const d = dayjs(date);
  return d.isValid() ? d.format("MMM D, h:mm A") : "";
};

export const formatDateTimeRange = (
  start: Dayjs | string | null | undefined,
  end: Dayjs | string | null | undefined,
  fallbackStart = "No start",
  fallbackEnd = "No end"
): string => {
  const s = start ? dayjs(start) : null;
  const e = end ? dayjs(end) : null;
  const sValid = s?.isValid();
  const eValid = e?.isValid();
  if (!sValid && !eValid) return `${fallbackStart} ￫ ${fallbackEnd}`;
  if (!sValid) return `${fallbackStart} ￫ ${e!.format("MMM D, h:mm A")}`;
  if (!eValid) return `${s!.format("MMM D, h:mm A")} ￫ ${fallbackEnd}`;
  if (s!.isSame(e!, "day")) {
    return `${s!.format("MMM D")}, ${s!.format("h:mm A")} ￫ ${e!.format("h:mm A")}`;
  }
  return `${s!.format("MMM D, h:mm A")} ￫ ${e!.format("MMM D, h:mm A")}`;
};

export const getSafeDayjsValue = (value: Dayjs | null): Dayjs | null => {
  if (!value) return null;
  return value.isValid() ? value : null;
};
