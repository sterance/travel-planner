import dayjs, { type Dayjs } from "dayjs";

export const formatDateTime = (date: Dayjs | string | null | undefined): string => {
  if (!date) return "";
  const d = dayjs(date);
  return d.isValid() ? d.format("MMM D, h:mm A") : "";
};
