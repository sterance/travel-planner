import { type DateFormatPreference } from "../App";
import { getStringItem } from "../services/storageService";

export const useDateFormat = (): DateFormatPreference => {
  const stored = getStringItem("dateFormat", "DD/MM/YYYY");
  if (stored === "MM/DD/YYYY" || stored === "DD/MM/YYYY") {
    return stored;
  }
  return "DD/MM/YYYY";
};

export const getDateTimeFormat = (dateFormat: DateFormatPreference): string => {
  return `${dateFormat} hh:mm A`;
};
