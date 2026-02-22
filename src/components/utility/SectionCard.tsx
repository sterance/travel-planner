import { type ReactElement, type ReactNode } from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

interface SectionCardProps {
  title: string;
  children: ReactNode;
}

export const SectionCard = ({ title, children }: SectionCardProps): ReactElement => {
  
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        mb: 2,
        mx: 1,
        borderRadius: 2,
        bgcolor: "background.default",
      }}
    >
      <Box sx={{ mb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 500, textAlign: "center" }}>
          {title}
        </Typography>
      </Box>
      {children}
    </Paper>
  );
};
