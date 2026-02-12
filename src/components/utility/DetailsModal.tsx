import { type ReactElement, type ReactNode, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

interface DetailsModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onSave?: () => void;
  onClear?: () => void;
  hasDetails?: boolean;
  saveLabel?: string;
  cancelLabel?: string;
  clearLabel?: string;
}

export const DetailsModal = ({ open, onClose, title, children, onSave, onClear, hasDetails = false, saveLabel = "Save", cancelLabel = "Cancel", clearLabel = "Clear" }: DetailsModalProps): ReactElement => {
  useEffect(() => {
    if (open) {
    }
  }, [open, title, onSave, onClear]);

  const handleClose = (): void => {
    try {
      onClose();
    } catch (error) {
      throw error;
    }
  };

  
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>{title}</Box>
          {onClear && (
            <Button onClick={onClear} disabled={!hasDetails} size="small" color="inherit">
              {clearLabel}
            </Button>
          )}
        </Box>
      </DialogTitle>
      <DialogContent>{children}</DialogContent>
      {onSave && (
        <DialogActions>
          <Button onClick={onClose}>{cancelLabel}</Button>
          <Button onClick={onSave} variant="contained">
            {saveLabel}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};
