import { type ReactElement, type ReactNode, useState } from "react";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { Card } from "@mui/material";

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

  return (
    <Box>
      {!expanded ? (
        <Card
          variant="elevation"
          sx={{
            mb: 0.5,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              minHeight: "1.5rem",
              px: 1,
              py: 0.25,
            }}
          >
            <Typography variant="body2" noWrap sx={{ flex: 1, minWidth: 0, mr: 1 }}>
              {count} {label}
            </Typography>
            <IconButton
              onClick={() => setExpanded(true)}
              aria-expanded={false}
              aria-label="expand list"
              size="small"
            >
              <ExpandMoreIcon />
            </IconButton>
          </Box>
        </Card>
      ) : (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            minHeight: "1.5rem",
          }}
        >
          <IconButton
            onClick={() => setExpanded(false)}
            aria-expanded
            aria-label="collapse list"
            size="small"
          >
            <ExpandLessIcon />
          </IconButton>
        </Box>
      )}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {children}
        </Box>
      </Collapse>
    </Box>
  );
};
