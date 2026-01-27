import { useState, useEffect, type ReactElement } from 'react';
import { Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import DesktopWindowsOutlinedIcon from '@mui/icons-material/DesktopWindowsOutlined';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import { useThemeMode } from './theme/ThemeContext';
import { useTripContext } from './context/TripContext';
import { SidebarTripItem } from './components/SidebarTripItem';
import { TripPage } from './pages/TripPage';
import { SettingsPage } from './pages/SettingsPage';

const DRAWER_WIDTH = 240;
const ASPECT_RATIO_BREAKPOINT = 1;

export type ViewMode = 'list' | 'carousel';
export type LayoutMode = 'portrait' | 'desktop';

function App(): ReactElement {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('portrait');
  const [columns, setColumns] = useState(3);
  const [maxAdjacent, setMaxAdjacent] = useState(2);
  const { mode, toggleTheme } = useThemeMode();
  const { trips, currentTripId, createTrip, setCurrentTrip, renameTrip, deleteTrip, editingTripId, setEditingTripId } = useTripContext();
  const navigate = useNavigate();

  const handleDrawerToggle = (): void => {
    setDrawerOpen(!drawerOpen);
  };

  const handleTripSelect = (tripId: string): void => {
    setCurrentTrip(tripId);
    navigate(`/trip/${tripId}`);
    setDrawerOpen(false);
  };

  const handleNewTrip = (): void => {
    const newTrip = createTrip();
    navigate(`/trip/${newTrip.id}`);
  };

  const handleViewModeToggle = (): void => {
    setViewMode((prev) => (prev === 'list' ? 'carousel' : 'list'));
  };

  const handleLayoutModeToggle = (): void => {
    setLayoutMode((prev) => (prev === 'portrait' ? 'desktop' : 'portrait'));
  };

  const handleSettingsClick = (): void => {
    navigate('/settings');
    setDrawerOpen(false);
  };

  useEffect(() => {
    const updateLayoutMode = (): void => {
      const aspectRatio = window.innerWidth / window.innerHeight;
      if (aspectRatio > ASPECT_RATIO_BREAKPOINT) {
        setLayoutMode('desktop');
      } else {
        setLayoutMode('portrait');
      }
    };

    updateLayoutMode();

    window.addEventListener('resize', updateLayoutMode);
    return () => {
      window.removeEventListener('resize', updateLayoutMode);
    };
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Travel Planner
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton color="inherit" disabled>
              {layoutMode === 'portrait' ? <DesktopWindowsOutlinedIcon /> : <PhoneAndroidIcon />}
            </IconButton>
            <IconButton color="inherit" onClick={handleViewModeToggle}>
              {viewMode === 'list' ? <ViewCarouselIcon /> : <ViewListIcon />}
            </IconButton>
            <IconButton color="inherit" onClick={toggleTheme}>
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <List>
              {trips.map((trip) => (
                <SidebarTripItem
                  key={trip.id}
                  trip={trip}
                  isSelected={currentTripId === trip.id}
                  autoEdit={editingTripId === trip.id}
                  onSelect={() => handleTripSelect(trip.id)}
                  onRename={(name) => renameTrip(trip.id, name)}
                  onDelete={() => deleteTrip(trip.id)}
                  onEditComplete={() => setEditingTripId(null)}
                />
              ))}
              <ListItemButton onClick={handleNewTrip}>
                <ListItemText primary="New Trip" />
                <AddIcon sx={{ ml: 1 }} />
              </ListItemButton>
            </List>
          </Box>
          <Box sx={{ borderTop: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                onClick={handleSettingsClick}
                aria-label="settings"
                sx={{ 
                  backgroundColor: '#42a5f5', 
                  color: 'white', 
                  borderRadius: 0,
                  width: 48,
                  height: 48,
                  padding: 0,
                  '&:hover': { backgroundColor: '#42a5f5' } 
                }}
              >
                <SettingsIcon />
              </IconButton>
              <ListItemButton sx={{ flex: 1, borderLeft: 1, borderColor: 'divider', backgroundColor: '#cf533a', color: 'white', textAlign: 'center' }}>
                <ListItemText primary="Login / Register" />
              </ListItemButton>
            </Box>
          </Box>
        </Box>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          px: 0,
          py: 2,
          mt: '64px',
          minHeight: 0,
        }}
      >
        <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <Routes>
            <Route element={<Outlet context={{ viewMode, layoutMode, columns, setColumns, maxAdjacent, setMaxAdjacent }} />}>
              <Route path="/" element={<TripRedirect />} />
              <Route path="/trip" element={<TripRedirect />} />
              <Route path="/trip/:tripId" element={<TripPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </Box>
      </Box>
    </Box>
  );
}

const TripRedirect = (): ReactElement => {
  const { trips, currentTripId, setCurrentTrip } = useTripContext();

  if (trips.length > 0) {
    const targetId = currentTripId ?? trips[0].id;
    if (currentTripId !== targetId) {
      setCurrentTrip(targetId);
    }
    return <Navigate to={`/trip/${targetId}`} replace />;
  }

  return <Navigate to="/trip" replace />;
};

export default App;
