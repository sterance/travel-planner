import { useState, useEffect, useMemo, type ReactElement } from "react";
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

interface MapCardProps {
  destinations: Destination[];
}

const MapBounds = ({ bounds }: { bounds: L.LatLngBoundsExpression }): null => {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [20, 20], maxZoom: 13 });
    }
  }, [map, bounds]);
  return null;
};

export const MapCard = ({ destinations }: MapCardProps): ReactElement => {
  const [expanded, setExpanded] = useState(false);

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
            <Typography variant="h5" component="div" sx={{ py: 1.5}}>
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
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
          <Box sx={{ height: 400, width: "100%" }}>
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
        </CardContent>
      </Collapse>
    </Card>
  );
};
