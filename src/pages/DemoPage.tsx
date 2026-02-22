import { useCallback, useEffect, useState, type ReactElement } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { type Trip } from "../types/trip";
import { loadDemoTrip } from "../services/demoLoader";
import type { ArrivalWeatherBackgroundMode, LayoutMode, ViewMode } from "../App";
import { TripView } from "./TripPage";
import { useToolbarActions } from "../components/Toolbar";

interface OutletContext {
  viewMode: ViewMode;
  layoutMode: LayoutMode;
  columns: number;
  setColumns: (value: number) => void;
  arrivalWeatherBackgroundMode: ArrivalWeatherBackgroundMode;
  setArrivalWeatherBackgroundMode: (value: ArrivalWeatherBackgroundMode) => void;
  showExploreButton: boolean;
  setShowExploreButton: (value: boolean) => void;
  showInfoButton: boolean;
  setShowInfoButton: (value: boolean) => void;
}

export const DemoPage = (): ReactElement => {
  const { viewMode, layoutMode, columns, setColumns, arrivalWeatherBackgroundMode, showExploreButton, showInfoButton } = useOutletContext<OutletContext>();
  const [demoTrip, setDemoTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tripInstance, setTripInstance] = useState(0);

  const navigate = useNavigate();
  const { setActions } = useToolbarActions();

  const reloadDemoTrip = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const trip = await loadDemoTrip();
      setDemoTrip(trip);
      setTripInstance((prev) => prev + 1);
    } catch {
      setError("unable to load demo trip");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    loadDemoTrip()
      .then((trip) => {
        if (cancelled) return;
        setDemoTrip(trip);
        setTripInstance((prev) => prev + 1);
      })
      .catch(() => {
        if (cancelled) return;
        setError("unable to load demo trip");
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setActions(
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mr: 1 }}>
        <Button
          size="small"
          variant="contained"
          onClick={() => navigate("/")}
          sx={(theme) =>
            theme.palette.mode === "light"
              ? {
                  backgroundColor: theme.palette.common.white,
                  color: theme.palette.primary.main,
                  "&:hover": { backgroundColor: theme.palette.grey[100] },
                }
              : {}
          }
        >
          try it!
        </Button>
        <Button size="small" variant="outlined" color="inherit" onClick={reloadDemoTrip} disabled={loading}>
          reset
        </Button>
      </Box>,
    );

    return () => {
      setActions(null);
    };
  }, [setActions, navigate, reloadDemoTrip, loading]);

  if (loading) {
    return (
      <Box sx={{ p: 3, display: "flex", alignItems: "center", justifyContent: "center", gap: 1, height: "100%" }}>
        <CircularProgress size={20} />
        <Typography variant="body2" sx={{ color: (theme) => theme.palette.text.secondary }}>
          loading demo itinerary
        </Typography>
      </Box>
    );
  }

  if (error || !demoTrip) {
    return (
      <Box sx={{ p: 3, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, height: "100%" }}>
        <Typography variant="h6">demo unavailable</Typography>
        <Typography variant="body2" sx={{ color: (theme) => theme.palette.text.secondary, textAlign: "center", maxWidth: 480 }}>
          something went wrong while loading the sample trip. you can still jump straight into the main app and start planning your own trip.
        </Typography>
        <Typography variant="body2" sx={{ color: (theme) => theme.palette.text.secondary }}>
          go to <span role="link" tabIndex={0} onClick={() => navigate("/")} style={{ textDecoration: "underline", cursor: "pointer" }}>my trips</span>
        </Typography>
      </Box>
    );
  }

  return (
    <TripView
      key={tripInstance}
      trip={demoTrip}
      updateTrip={(t) => setDemoTrip(t)}
      viewMode={viewMode}
      layoutMode={layoutMode}
      columns={columns}
      setColumns={setColumns}
      arrivalWeatherBackgroundMode={arrivalWeatherBackgroundMode}
      showExploreButton={showExploreButton}
      showInfoButton={showInfoButton}
    />
  );
};

