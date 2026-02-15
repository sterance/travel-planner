import { type ReactElement, type ReactNode } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

export interface IconMenuItem {
  label: string;
  icon: ReactElement;
  value: string | number;
}

interface IconMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  items: IconMenuItem[];
  onSelect: (value: string | number) => void;
  renderItem?: (item: IconMenuItem) => ReactNode;
}

export const IconMenu = ({ anchorEl, open, onClose, items, onSelect, renderItem }: IconMenuProps): ReactElement => {
  return (
    <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
      {items.map((item) => (
        <MenuItem
          key={item.value}
          onClick={() => {
            onSelect(item.value);
            onClose();
          }}
        >
          {renderItem ? (
            renderItem(item)
          ) : (
            <>
              {item.icon}
              {item.label}
            </>
          )}
        </MenuItem>
      ))}
    </Menu>
  );
};

