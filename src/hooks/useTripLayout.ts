import { useMemo } from "react";
import { type ViewMode, type LayoutMode } from "../App";

interface UseTripLayoutParams {
  viewMode: ViewMode;
  layoutMode: LayoutMode;
  columns: number;
}

export const useTripLayout = ({ viewMode, layoutMode, columns }: UseTripLayoutParams) => {
  const isDesktopList = layoutMode === "desktop" && viewMode === "list";
  const desktopListColumns = useMemo(() => (isDesktopList ? Math.max(columns, 3) : columns), [isDesktopList, columns]);

  return {
    isDesktopList,
    desktopListColumns,
  };
};

