import { useState, type ReactElement } from "react";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export const SettingsCard = (): ReactElement => {
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = (): void => {
    setExpanded(!expanded);
  };

  return (
    <Card>
      <CardHeader
        title={
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Typography variant="h5" component="div">
              Trip Settings
            </Typography>
            <IconButton
              onClick={handleExpandClick}
              aria-expanded={expanded}
              aria-label="show more"
              size="large"
              sx={{
                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            >
              <ExpandMoreIcon />
            </IconButton>
          </Box>
        }
        sx={{
          "& .MuiCardHeader-content": {
            width: "100%",
          },
        }}
      />
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Typography variant="body1" component="div">
            <ul>
              <li>start date</li>
              <li>end date</li>
            </ul>
          </Typography>
        </CardContent>
      </Collapse>
    </Card>
  );
};
