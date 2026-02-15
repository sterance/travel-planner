import { type ReactElement } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import GitHubIcon from "@mui/icons-material/GitHub";

const REPO_URL = "https://github.com/sterance/travel-planner";
const ISSUES_URL = "https://github.com/sterance/travel-planner/issues";

export const Footer = (): ReactElement => {
  return (
    <Box
      component="footer"
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        px: 3,
        py: 1.5,
        borderTop: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
      }}
    >
      <Typography variant="body2" color="text.secondary">
        © Chris Smith, {new Date().getFullYear()}
      </Typography>
      <IconButton
        component="a"
        href={REPO_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub repository"
        size="small"
        color="inherit"
      >
        <GitHubIcon />
      </IconButton>
      <Typography variant="body2" color="text.secondary" component="span">
        Issues? Report them {" "}
        <Link href={ISSUES_URL} target="_blank" rel="noopener noreferrer">
          here
        </Link>
      </Typography>
    </Box>
  );
};
