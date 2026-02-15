import { useState } from "react";

interface UseTripExploreMenuResult {
  exploreAnchorEl: { [key: string]: HTMLElement | null };
  handleExploreClick: (event: React.MouseEvent<HTMLElement>, index: number) => void;
  handleExploreClose: (index: number) => void;
  handleExploreSelect: (index: number, option: string) => void;
}

export const useTripExploreMenu = (): UseTripExploreMenuResult => {
  const [exploreAnchorEl, setExploreAnchorEl] = useState<{ [key: string]: HTMLElement | null }>({});

  const handleExploreClick = (event: React.MouseEvent<HTMLElement>, index: number): void => {
    setExploreAnchorEl((prev) => ({ ...prev, [index]: event.currentTarget }));
  };

  const handleExploreClose = (index: number): void => {
    setExploreAnchorEl((prev) => ({ ...prev, [index]: null }));
  };

  const handleExploreSelect = (index: number, option: string): void => {
    console.log(`Explore option selected for destination ${index}: ${option}`);
    handleExploreClose(index);
  };

  return {
    exploreAnchorEl,
    handleExploreClick,
    handleExploreClose,
    handleExploreSelect,
  };
};

