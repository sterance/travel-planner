import { type ReactElement } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import EditIcon from "@mui/icons-material/Edit";
import { Card } from "@mui/material";

interface ListCardProps {
  primaryText: string;
  secondaryText?: string;
  tertiaryText?: string;
  onEdit?: () => void;
  centerPrimary?: boolean;
}

export const ListCard = ({ primaryText, secondaryText, tertiaryText, onEdit, centerPrimary = false }: ListCardProps): ReactElement => {
  const leftContent = (
    <Box sx={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
      {centerPrimary ? (
        <>
          {secondaryText && (
            <Typography variant="body1" noWrap>
              {secondaryText}
            </Typography>
          )}
          {tertiaryText && (
            <Typography variant="body2" color="text.secondary">
              {tertiaryText}
            </Typography>
          )}
        </>
      ) : (
        <>
          <Typography variant="body1" noWrap>
            {primaryText}
          </Typography>
          {secondaryText && (
            <Typography variant="body2" color="text.secondary" noWrap>
              {secondaryText}
            </Typography>
          )}
          {tertiaryText && (
            <Typography variant="body2" color="text.secondary">
              {tertiaryText}
            </Typography>
          )}
        </>
      )}
    </Box>
  );

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: centerPrimary ? "column" : "row",
        justifyContent: "space-between",
        alignItems: centerPrimary ? "stretch" : "center",
        gap: 1,
        p: 1,
      }}
    >
      {centerPrimary && (
        <Typography variant="body1" sx={{ textAlign: "center" }}>
          {primaryText}
        </Typography>
      )}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1, flex: 1, minWidth: 0 }}>
        {leftContent}
        {onEdit && (
          <Button variant="outlined" size="small" startIcon={<EditIcon />} onClick={onEdit}>
            edit
          </Button>
        )}
      </Box>
    </Card>
  );
};
