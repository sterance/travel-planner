import { useEffect } from "react";

interface UseTripKeyNavParams {
  active: boolean;
  onPrevious: () => void;
  onNext: () => void;
  isTextInputElement: (element: HTMLElement | null) => boolean;
}

export const useTripKeyNav = ({ active, onPrevious, onNext, isTextInputElement }: UseTripKeyNavParams): void => {
  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (event: KeyboardEvent): void => {
      const target = event.target as HTMLElement | null;
      if (isTextInputElement(target)) return;

      if (event.key === "ArrowLeft") {
        onPrevious();
      } else if (event.key === "ArrowRight") {
        onNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [active, onPrevious, onNext, isTextInputElement]);
};
