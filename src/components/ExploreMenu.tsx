import { type ReactElement } from "react";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";

export interface ExploreMenuProps {
  index: number;
  show: boolean;
  anchorEl: HTMLElement | null;
  prevDestinationName?: string;
  currentDestinationName: string;
  onOpen: (event: React.MouseEvent<HTMLElement>, index: number) => void;
  onClose: (index: number) => void;
  onSelect: (index: number, option: string) => void;
}

export const ExploreMenu = ({
  index,
  show,
  anchorEl,
  prevDestinationName,
  currentDestinationName,
  onOpen,
  onClose,
  onSelect,
}: ExploreMenuProps): ReactElement => (
  <>
    {show && (
      <IconButton size="small" onClick={(e) => onOpen(e, index)} sx={{ opacity: 0.7 }}>
        <TravelExploreIcon />
      </IconButton>
    )}
    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => onClose(index)}>
      <MenuItem disabled sx={{ opacity: 0.6, fontWeight: 600 }}>
        Explore...
      </MenuItem>
      {prevDestinationName != null && (
        <MenuItem onClick={() => onSelect(index, "near-prev")}>Near {prevDestinationName}</MenuItem>
      )}
      <MenuItem onClick={() => onSelect(index, "near-next")}>Near {currentDestinationName}</MenuItem>
    </Menu>
  </>
);
