import { type ReactElement } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export const CalendarPage = (): ReactElement => {
  return (
    <Box sx={{ p: 3, textAlign: "center" }}>
      <Typography variant="h5" color="text.secondary">
        Calendar
      </Typography>
    </Box>
  );
};
