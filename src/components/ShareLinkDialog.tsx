import { useState, type ReactElement } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

interface ShareLinkDialogProps {
  open: boolean;
  shareId: string | null;
  onClose: () => void;
}

export const ShareLinkDialog = ({ open, shareId, onClose }: ShareLinkDialogProps): ReactElement => {
  const [copied, setCopied] = useState(false);
  const shareUrl = shareId ? `${window.location.origin}/share/${shareId}` : "";

  const handleCopy = async (): Promise<void> => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleClose = (): void => {
    setCopied(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Share link</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
          Anyone with this link can view and edit a shared copy of your trip.
        </Typography>
        <TextField fullWidth value={shareUrl} slotProps={{ input: { readOnly: true } }} />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
        <Button variant="contained" onClick={() => void handleCopy()} disabled={!shareUrl}>
          {copied ? "Copied" : "Copy"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
