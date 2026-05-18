import dayjs from "dayjs";
import { useCallback, useMemo, useState } from "react";
import { getStringItem, removeItem, setStringItem } from "../services/storageService";

export const CALENDAR_VIEW_ZONE_STORAGE_KEY = "calendar_view_zone";

export const CALENDAR_VIEW_ZONE_BROWSER_DEFAULT = "__browser_default__";

export const useCalendarViewZone = (): [string, (zone: string) => void, { explicitOverride: string | null }] => {
  const [explicitOverride, setExplicitOverride] = useState<string | null>(() => {
    const raw = getStringItem(CALENDAR_VIEW_ZONE_STORAGE_KEY, "").trim();
    return raw.length > 0 ? raw : null;
  });

  const effectiveZone = useMemo(() => explicitOverride ?? dayjs.tz.guess(), [explicitOverride]);

  const setZone = useCallback((zone: string) => {
    if (zone === CALENDAR_VIEW_ZONE_BROWSER_DEFAULT) {
      removeItem(CALENDAR_VIEW_ZONE_STORAGE_KEY);
      setExplicitOverride(null);
      return;
    }
    setStringItem(CALENDAR_VIEW_ZONE_STORAGE_KEY, zone);
    setExplicitOverride(zone);
  }, []);

  return [effectiveZone, setZone, { explicitOverride }];
};
