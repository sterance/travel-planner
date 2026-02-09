import type { ReactElement, ReactNode } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  cancelLabel?: string;
  confirmButtonColor?: "primary" | "error";
}

export const ConfirmDialog = ({ open, onClose, title, message, confirmLabel, onConfirm, cancelLabel = "Cancel", confirmButtonColor = "primary" }: ConfirmDialogProps): ReactElement => (
  // RENDERING
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <DialogContentText component="div">{message}</DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>{cancelLabel}</Button>
      <Button onClick={onConfirm} color={confirmButtonColor} variant="contained">
        {confirmLabel}
      </Button>
    </DialogActions>
  </Dialog>
);
