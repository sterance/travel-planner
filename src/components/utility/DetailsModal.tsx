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

export const DetailsModal = ({
  open,
  onClose,
  title,
  children,
  onSave,
  onClear,
  hasDetails = false,
  saveLabel = "Save",
  cancelLabel = "Cancel",
  clearLabel = "Clear",
}: DetailsModalProps): ReactElement => {
  useEffect(() => {
    if (open) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/08b58cc9-c8af-4ac5-80a7-c8ceff160cde',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DetailsModal.tsx:35',message:'DetailsModal opened',data:{title,hasOnSave:!!onSave,hasOnClear:!!onClear},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
      // #endregion
    }
  }, [open, title, onSave, onClear]);

  const handleClose = (): void => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/08b58cc9-c8af-4ac5-80a7-c8ceff160cde',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DetailsModal.tsx:42',message:'DetailsModal onClose called',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
    // #endregion
    try {
      onClose();
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/08b58cc9-c8af-4ac5-80a7-c8ceff160cde',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DetailsModal.tsx:47',message:'DetailsModal onClose error',data:{errorMessage:error instanceof Error?error.message:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
      // #endregion
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
