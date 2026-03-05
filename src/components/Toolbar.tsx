import { type ReactElement, type ReactNode } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import MenuIcon from "@mui/icons-material/Menu";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewCarouselIcon from "@mui/icons-material/ViewCarousel";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import DesktopWindowsOutlinedIcon from "@mui/icons-material/DesktopWindowsOutlined";
import ArticleIcon from '@mui/icons-material/Article';
import MapIcon from '@mui/icons-material/Map';
import type { LayoutMode, ViewMode } from "../App";

interface AppToolbarProps {
  title: string;
  onDrawerToggle: () => void;
  summaryMode: boolean;
  onSummaryModeToggle: () => void;
  viewMode: ViewMode;
  onViewModeToggle: () => void;
  layoutMode: LayoutMode;
  onLayoutModeToggle: () => void;
  themeMode: "light" | "dark";
  onThemeToggle: () => void;
  actions?: ReactNode;
}

export const AppToolbar = ({
  title,
  onDrawerToggle,
  summaryMode,
  onSummaryModeToggle,
  viewMode,
  onViewModeToggle,
  layoutMode,
  onLayoutModeToggle,
  themeMode,
  onThemeToggle,
  actions,
}: AppToolbarProps): ReactElement => {
  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton color="inherit" edge="start" onClick={onDrawerToggle} sx={{ mr: 2 }}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, minWidth: 0, overflow: "hidden", whiteSpace: "nowrap" }}>
          {title}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {actions}
          {/* layout mode indicator is disabled and hidden for now */}
          <IconButton color="inherit" disabled onClick={onLayoutModeToggle} sx={{ display: "none" }}>
            {layoutMode === "desktop" ? <DesktopWindowsOutlinedIcon /> : <PhoneAndroidIcon />}
          </IconButton>
          <IconButton color="inherit" onClick={onSummaryModeToggle}>
            {summaryMode ? <MapIcon /> : <ArticleIcon />}
          </IconButton>
          <IconButton color="inherit" onClick={onViewModeToggle} disabled={summaryMode}>
            {viewMode === "list" ? <ViewCarouselIcon /> : <ViewListIcon />}
          </IconButton>
          <IconButton color="inherit" onClick={onThemeToggle}>
            {themeMode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

