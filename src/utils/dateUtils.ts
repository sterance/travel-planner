import dayjs from "dayjs";

export const formatDateTime = (dateTimeString?: string): string => {
  if (!dateTimeString) return "";
  const date = dayjs(dateTimeString);
  return date.format("MMM D, YYYY h:mm A");
};
