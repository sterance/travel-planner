import { useState } from "react";

const GOOGLE_MAPS_SEARCH_BASE = "https://www.google.com/maps/search/";

interface DestinationForExplore {
  name: string;
  displayName?: string;
}

interface UseTripExploreMenuResult {
  exploreAnchorEl: { [key: string]: HTMLElement | null };
  handleExploreClick: (event: React.MouseEvent<HTMLElement>, index: number) => void;
  handleExploreClose: (index: number) => void;
  handleExploreSelect: (index: number, option: string) => void;
}

export const useTripExploreMenu = (destinations: DestinationForExplore[]): UseTripExploreMenuResult => {
  const [exploreAnchorEl, setExploreAnchorEl] = useState<{ [key: string]: HTMLElement | null }>({});

  const handleExploreClick = (event: React.MouseEvent<HTMLElement>, index: number): void => {
    setExploreAnchorEl((prev) => ({ ...prev, [index]: event.currentTarget }));
  };

  const handleExploreClose = (index: number): void => {
    setExploreAnchorEl((prev) => ({ ...prev, [index]: null }));
  };

  const handleExploreSelect = (index: number, option: string): void => {
    const destIndex = option === "near-prev" ? index - 1 : index;
    const dest = destinations[destIndex];
    const name = dest?.displayName ?? dest?.name ?? (option === "near-prev" ? "previous" : "next");
    const url = `${GOOGLE_MAPS_SEARCH_BASE}${encodeURIComponent(name)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    handleExploreClose(index);
  };

  return {
    exploreAnchorEl,
    handleExploreClick,
    handleExploreClose,
    handleExploreSelect,
  };
};

