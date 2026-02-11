import { type ReactElement } from "react";
import Box from "@mui/material/Box";
import { ButtonGrid } from "./ButtonGrid";
import { LinkButton } from "./LinkButton";

export interface ExternalLink {
  label: string;
  url: string;
  site: string;
}

interface ExternalLinksGridProps {
  links: ExternalLink[];
  columns?: number;
}

export const ExternalLinksGrid = ({ links, columns = 2 }: ExternalLinksGridProps): ReactElement | null => {
  if (links.length === 0) {
    return null;
  }

  const useGridLayout = links.length % columns === 0;

  if (useGridLayout) {
    return (
      <ButtonGrid columns={columns}>
        {links.map((link) => (
          <LinkButton key={link.label} site={link.site} url={link.url}>
            {link.label}
          </LinkButton>
        ))}
      </ButtonGrid>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {links.map((link) => (
        <LinkButton key={link.label} site={link.site} url={link.url}>
          {link.label}
        </LinkButton>
      ))}
    </Box>
  );
};

