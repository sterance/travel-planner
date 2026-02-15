import { type ReactElement, type ReactNode, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

interface CollapsibleListProps {
  count: number;
  labelSingular: string;
  labelPlural: string;
  children: ReactNode;
  defaultExpanded?: boolean;
}

export const CollapsibleList = ({ count, labelSingular, labelPlural, children, defaultExpanded = false }: CollapsibleListProps): ReactElement => {
  const label = count === 1 ? labelSingular : labelPlural;
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (expanded) {
    return (
      <Box>
        <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", minHeight: "1.5rem" }}>
          <IconButton onClick={() => setExpanded(false)} aria-expanded={true} aria-label="collapse list" size="small">
            <ExpandLessIcon />
          </IconButton>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {children}
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        minHeight: "1.5rem"
      }}
    >
      <Typography variant="body2" noWrap sx={{ flex: 1, minWidth: 0 }}>
        {count} {label}
      </Typography>
      <IconButton onClick={() => setExpanded(true)} aria-expanded={false} aria-label="expand list" size="small">
        <ExpandMoreIcon />
      </IconButton>
    </Box>
  );
};
