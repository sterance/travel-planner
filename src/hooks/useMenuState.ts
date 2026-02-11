import { useState } from "react";

interface AnchorMenuState<T extends HTMLElement | null = HTMLElement | null> {
  anchorEl: T;
  isOpen: boolean;
  open: (element: NonNullable<T>) => void;
  close: () => void;
}

function useAnchorMenu<T extends HTMLElement | null = HTMLElement | null>(): AnchorMenuState<T> {
  const [anchorEl, setAnchorEl] = useState<T>(null as T);

  const open = (element: NonNullable<T>): void => {
    setAnchorEl(element as T);
  };

  const close = (): void => {
    setAnchorEl(null as T);
  };

  return {
    anchorEl,
    isOpen: Boolean(anchorEl),
    open,
    close,
  };
}

export const useMenuState = () => {
  const calendar = useAnchorMenu<HTMLElement | null>();
  const transport = useAnchorMenu<HTMLElement | null>();
  const datePicker = useAnchorMenu<HTMLElement | null>();

  return {
    calendar,
    transport,
    datePicker,
  };
};

