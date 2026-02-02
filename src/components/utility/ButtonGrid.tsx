import { type ReactElement, type ReactNode } from "react";
import Box from "@mui/material/Box";

interface ButtonGridProps {
  children: ReactNode;
  columns?: number;
  gap?: number;
}

export const ButtonGrid = ({ children, columns = 2, gap = 1 }: ButtonGridProps): ReactElement => {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap,
      }}
    >
      {children}
    </Box>
  );
};
