import { useEffect, useState, type ReactElement } from "react";
import Box from "@mui/material/Box";
import { type Destination } from "../types/destination";
import { getLocationImage } from "../services/imagesService";

interface DestinationImageProps {
  destination: Destination;
}

export const DestinationImage = ({ destination }: DestinationImageProps): ReactElement | null => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const load = async (): Promise<void> => {
      const searchQuery = destination.displayName || destination.placeDetails?.city || destination.placeDetails?.country || destination.name;
      if (!searchQuery) {
        setImageUrl(null);
        return;
      }

      try {
        const url = await getLocationImage(searchQuery, { width: 800, height: 400 });
        setImageUrl(url);
      } catch {
        setImageUrl(null);
      }
    };

    load().catch(() => {
      setImageUrl(null);
    });
  }, [destination.displayName, destination.placeDetails, destination.name]);

  if (!imageUrl) {
    return null;
  }

  return (
    <Box
      component="img"
      src={imageUrl}
      alt={destination.displayName || destination.name || "Location"}
      sx={(theme) => ({
        width: "100%",
        height: "auto",
        maxHeight: "250px",
        objectFit: "cover",
        borderRadius: 0,
        display: "block",
        boxShadow: theme.palette.mode === "dark" ?  "0 1px 12px #b4b4b4" : "0 4px 10px #121212",
      })}
    />
  );
};