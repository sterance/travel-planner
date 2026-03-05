import { type ReactElement } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export const SummaryPage = (): ReactElement => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Trip Summary
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        This is a placeholder for the summary view.
      </Typography>
    </Box>
  );
};
