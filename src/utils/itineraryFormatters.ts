import type { Dayjs } from "dayjs";
import type { Destination } from "../types/destination";
import type { DateFormatPreference } from "../App";

export const formatTransportMode = (mode: string): string => {
  return mode.replace(/^by\s+/, "").replace(/^\w/, (c) => c.toUpperCase());
};

export const formatNights = (nights: Destination["nights"]): string => {
  if (nights === "none") return "Day visit";
  if (nights === "dates") return "Custom dates";
  if (typeof nights === "number") return nights === 1 ? "1 night" : `${nights} nights`;
  return "Nights not set";
};

export const getTotalNights = (destinations: Destination[]): number | null => {
  let total = 0;
  let allSet = true;
  for (const d of destinations) {
    if (typeof d.nights === "number") {
      total += d.nights;
    } else if (d.nights === "none") {
      // day visit, 0 nights
    } else {
      allSet = false;
    }
  }
  return allSet ? total : null;
};

export const formatDate = ({
  date,
  includeTime,
}: {
  date: Dayjs | null | undefined;
  dateFormat: DateFormatPreference;
  includeTime?: boolean;
}): string => {
  if (!date || !date.isValid()) return "";
  if (includeTime) return date.format("MMM DD, YYYY hh:mm A");
  return date.format("MMM DD, YYYY");
};

export const formatDateRange = ({
  from,
  to,
  dateFormat,
  includeTime,
}: {
  from: Dayjs | null | undefined;
  to: Dayjs | null | undefined;
  dateFormat: DateFormatPreference;
  includeTime?: boolean;
}): string => {
  const f = formatDate({ date: from, dateFormat, includeTime });
  const t = formatDate({ date: to, dateFormat, includeTime });
  if (!f && !t) return "";

  let displayTo = t;
  if (
    includeTime &&
    from &&
    to &&
    from.isValid() &&
    to.isValid() &&
    from.format("YYYY-MM-DD") === to.format("YYYY-MM-DD")
  ) {
    displayTo = to.format("hh:mm A");
  }

  return `${f || "?"} ￫ ${displayTo || "?"}`;
};
