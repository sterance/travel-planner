import { useEffect, useRef, useState } from "react";
import { useSwipeable } from "react-swipeable";
import { type ViewMode, type LayoutMode } from "../App";

interface UseTripCarouselParams {
  viewMode: ViewMode;
  layoutMode: LayoutMode;
  isNarrowScreen: boolean;
  onPrevious: () => void;
  onNext: () => void;
  isTextInputElement: (element: HTMLElement | null) => boolean;
}

export const useTripCarousel = ({ viewMode, layoutMode, isNarrowScreen, onPrevious, onNext, isTextInputElement }: UseTripCarouselParams) => {
  const [autoMaxAdjacent, setAutoMaxAdjacent] = useState(2);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: (eventData) => {
      if (viewMode !== "carousel" || layoutMode === "desktop") return;
      const target = (eventData.event?.target as HTMLElement) ?? null;
      if (isTextInputElement(target)) return;
      onNext();
    },
    onSwipedRight: (eventData) => {
      if (viewMode !== "carousel" || layoutMode === "desktop") return;
      const target = (eventData.event?.target as HTMLElement) ?? null;
      if (isTextInputElement(target)) return;
      onPrevious();
    },
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (viewMode !== "carousel") return;

    const container = carouselRef.current;
    if (!container) return;

    const computeMaxAdjacent = (width: number): void => {
      if (isNarrowScreen) {
        const narrowMaxAdjacent = 1;
        setAutoMaxAdjacent((prev) => (prev === narrowMaxAdjacent ? prev : narrowMaxAdjacent));
        return;
      }

      const cardWidth = 420;
      const minSlots = 1;
      const maxSlots = 9;

      const estimatedSlots = Math.max(minSlots, Math.ceil(width / cardWidth));
      const clampedSlots = Math.min(maxSlots, estimatedSlots);
      const oddSlots = clampedSlots % 2 === 0 ? clampedSlots + 1 : clampedSlots;
      const newMaxAdjacent = (oddSlots - 1) / 2;

      setAutoMaxAdjacent((prev) => (prev === newMaxAdjacent ? prev : newMaxAdjacent));
    };

    const initialWidth = container.getBoundingClientRect().width;
    computeMaxAdjacent(initialWidth);

    if (typeof ResizeObserver === "undefined") {
      const handleResize = (): void => {
        const width = container.getBoundingClientRect().width;
        computeMaxAdjacent(width);
      };

      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === container) {
          const width = entry.contentRect.width;
          computeMaxAdjacent(width);
        }
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [viewMode, isNarrowScreen]);

  return {
    autoMaxAdjacent,
    carouselRef,
    swipeHandlers,
  };
};

