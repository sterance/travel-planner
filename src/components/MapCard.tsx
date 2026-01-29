import { useState, useEffect, useMemo, useRef, type ReactElement } from "react";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { type Destination } from "../types/destination";
import { type LayoutMode } from "../App";

interface MapCardProps {
  destinations: Destination[];
  layoutMode: LayoutMode;
  headerOnly?: boolean;
  bodyOnly?: boolean;
  expanded?: boolean;
  onExpandChange?: (expanded: boolean) => void;
}

const STORAGE_KEY = "travel_map_height";
const DEFAULT_HEIGHT = 400;

const MapBounds = ({ bounds }: { bounds: L.LatLngBoundsExpression }): null => {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [20, 20], maxZoom: 13 });
    }
  }, [map, bounds]);
  return null;
};

export const MapCard = ({ destinations, layoutMode, headerOnly = false, bodyOnly = false, expanded: controlledExpanded, onExpandChange }: MapCardProps): ReactElement => {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const expanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;
  const [mapHeight, setMapHeight] = useState(DEFAULT_HEIGHT);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedHeight = parseInt(stored, 10);
        if (!isNaN(parsedHeight) && parsedHeight > 0) {
          setMapHeight(parsedHeight);
        }
      }
    } catch (error) {
      console.error("Failed to load map height from localStorage:", error);
    }
  }, []);

  useEffect(() => {
    if (layoutMode !== "desktop" || !expanded || !mapContainerRef.current) {
      return;
    }

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newHeight = Math.round(entry.contentRect.height);
        if (newHeight >= 200) {
          setMapHeight((prevHeight) => {
            if (newHeight !== prevHeight) {
              try {
                localStorage.setItem(STORAGE_KEY, newHeight.toString());
              } catch (error) {
                console.error("Failed to save map height to localStorage:", error);
              }
              return newHeight;
            }
            return prevHeight;
          });
        }
      }
    });

    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [layoutMode, expanded]);

  useEffect(() => {
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    });
  }, []);


  const destinationsWithCoordinates = useMemo(
    () => destinations.filter((dest) => dest.placeDetails?.coordinates),
    [destinations]
  );

  const polylinePositions = useMemo(() => {
    return destinationsWithCoordinates.map((dest) => {
      const [lon, lat] = dest.placeDetails!.coordinates;
      return [lat, lon] as [number, number];
    });
  }, [destinationsWithCoordinates]);

  const bounds = useMemo(() => {
    if (destinationsWithCoordinates.length === 0) {
      return null;
    }
    return L.latLngBounds(polylinePositions);
  }, [polylinePositions]);

  const handleExpandClick = (): void => {
    const newExpanded = !expanded;
    if (onExpandChange) {
      onExpandChange(newExpanded);
    } else {
      setInternalExpanded(newExpanded);
    }
  };

  const headerContent = (
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
          <Typography variant="h5" component="div" sx={layoutMode === "desktop" ? { py: 1.5 } : undefined}>
            Trip Map
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
  );

  const mapContent = (
    <Box
      ref={mapContainerRef}
      sx={{
        height: mapHeight,
        width: "100%",
        resize: layoutMode === "desktop" ? "vertical" : "none",
        overflow: "hidden",
        minHeight: 200,
        maxHeight: "80vh",
      }}
    >
      <MapContainer
        center={[51.505, -0.09]}
        zoom={2}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {bounds && <MapBounds bounds={bounds} />}
        {polylinePositions.length > 1 && (
          <Polyline positions={polylinePositions} color="#1976d2" weight={3} />
        )}
        {destinationsWithCoordinates.map((destination) => (
          <Marker
            key={destination.id}
            position={[destination.placeDetails!.coordinates[1], destination.placeDetails!.coordinates[0]]}
          >
            <Popup>{destination.displayName || destination.name}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </Box>
  );

  const bodyContent = (
    <Collapse in={expanded} timeout="auto" unmountOnExit>
      <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
        {mapContent}
      </CardContent>
    </Collapse>
  );

  if (headerOnly) {
    return (
      <Card>
        {headerContent}
      </Card>
    );
  }

  if (bodyOnly) {
    return (
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Card>
          <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
            {mapContent}
          </CardContent>
        </Card>
      </Collapse>
    );
  }

  return (
    <Card>
      {headerContent}
      {bodyContent}
    </Card>
  );
};
