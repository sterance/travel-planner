import { type ReactElement, useId, useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Popover from "@mui/material/Popover";
import SearchIcon from "@mui/icons-material/Search";
import { NumberField } from "./utility/NumberField";

export interface MagnificationControlsProps {
  columns: number;
  destinationCount: number;
  onColumnsChange: (next: number | null) => void;
}

export const MagnificationControls = ({ columns, destinationCount, onColumnsChange }: MagnificationControlsProps): ReactElement => {
  const popoverId = useId();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const open = Boolean(anchorEl);
  const nextIncreaseValue = columns + 1;
  const nextDecreaseValue = columns - 1;
  const canIncrease = nextIncreaseValue <= 7 && nextIncreaseValue <= destinationCount;
  const canDecrease = nextDecreaseValue >= 3;

  const handleOpen = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (): void => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        onClick={handleOpen}
        color="primary"
        size="medium"
        aria-label="magnification controls"
        aria-haspopup="dialog"
        aria-expanded={open ? "true" : "false"}
        aria-controls={open ? popoverId : undefined}
      >
        <SearchIcon fontSize="medium" />
      </IconButton>
      <Popover
        id={open ? popoverId : undefined}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
          <NumberField
            value={columns}
            onValueChange={onColumnsChange}
            min={3}
            max={7}
            step={1}
            snapOnStep
            inputAriaLabel="magnification columns"
            decrementProps={{ disabled: !canDecrease }}
            incrementProps={{ disabled: !canIncrease }}
            scrubAreaProps={{ style: { display: "none" } }}
          />
        </Box>
      </Popover>
    </>
  );
};

