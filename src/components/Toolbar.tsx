import { createContext, useContext, useMemo, useState, type ReactElement, type ReactNode } from "react";
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
import type { LayoutMode, ViewMode } from "../App";

interface ToolbarActionsContextValue {
  actions: ReactNode;
  setActions: (node: ReactNode) => void;
}

const ToolbarActionsContext = createContext<ToolbarActionsContextValue | undefined>(undefined);

interface ToolbarActionsProviderProps {
  children: ReactNode;
}

export const ToolbarActionsProvider = ({ children }: ToolbarActionsProviderProps): ReactElement => {
  const [actions, setActions] = useState<ReactNode>(null);

  const value = useMemo<ToolbarActionsContextValue>(() => {
    return {
      actions,
      setActions,
    };
  }, [actions]);

  return <ToolbarActionsContext.Provider value={value}>{children}</ToolbarActionsContext.Provider>;
};

export const useToolbarActions = (): ToolbarActionsContextValue => {
  const value = useContext(ToolbarActionsContext);
  if (!value) {
    throw new Error("useToolbarActions must be used within ToolbarActionsProvider");
  }
  return value;
};

interface AppToolbarProps {
  title: string;
  onDrawerToggle: () => void;
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
          <IconButton color="inherit">
            <ArticleIcon />
          </IconButton>
          <IconButton color="inherit" onClick={onViewModeToggle}>
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

