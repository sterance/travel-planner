import { type ReactElement, type ReactNode } from "react";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import LocalTaxiIcon from "@mui/icons-material/LocalTaxi";
import googleMapsIcon from "../../assets/icons/google-maps.svg";
import googleFlightsIcon from "../../assets/icons/google-flights.svg";
import skyscannerIcon from "../../assets/icons/skyscanner.svg";
import rome2rioIcon from "../../assets/icons/rome2rio.svg";
import bookingIcon from "../../assets/icons/booking.svg";
import hostelworldIcon from "../../assets/icons/hostelworld.svg";
import uberIcon from "../../assets/icons/uber.svg";
import tripAdvisorIcon from "../../assets/icons/trip-advisor.svg";
import getYourGuideIcon from "../../assets/icons/get-your-guide.svg";

const imageIconSx = {
  height: "1.25rem",
  width: "auto",
  maxWidth: "100%",
  objectFit: "contain",
  flex: "0 0 auto",
};

const SITE_ICONS: Record<string, ReactElement> = {
  "google-maps": <Box component="img" src={googleMapsIcon} alt="" sx={imageIconSx} />,
  "google-flights": <Box component="img" src={googleFlightsIcon} alt="" sx={imageIconSx} />,
  skyscanner: <Box component="img" src={skyscannerIcon} alt="" sx={imageIconSx} />,
  rome2rio: <Box component="img" src={rome2rioIcon} alt="" sx={imageIconSx} />,
  booking: <Box component="img" src={bookingIcon} alt="" sx={imageIconSx} />,
  hostelworld: <Box component="img" src={hostelworldIcon} alt="" sx={imageIconSx} />,
  uber: <Box component="img" src={uberIcon} alt="" sx={imageIconSx} />,
  tripadvisor: <Box component="img" src={tripAdvisorIcon} alt="" sx={imageIconSx} />,
  getyourguide: <Box component="img" src={getYourGuideIcon} alt="" sx={imageIconSx} />,
  taxi: <LocalTaxiIcon sx={{ flex: "0 0 auto" }} />,
};

export interface LinkButtonProps {
  site: string;
  url: string;
  children: ReactNode;
}

export const LinkButton = ({ site, url, children }: LinkButtonProps): ReactElement => {
  const renderIcon = (): ReactElement | null => SITE_ICONS[site] ?? null;

  return (
    <Button
      variant="outlined"
      fullWidth
      onClick={() => {
        window.open(url, "_blank", "noopener,noreferrer");
      }}
      sx={(theme) => ({
        borderColor: "divider",
        color: "black !important",
        transition: "background-color 0.2s ease",
        ...(theme.palette.mode === "dark"
          ? {
              bgcolor: "white",
              "&:hover": { bgcolor: "grey.200", borderColor: "divider", color: "black !important" },
            }
          : {
              bgcolor: "background.paper",
              "&:hover": { bgcolor: "grey.200", borderColor: "divider", color: "black !important" },
            }),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: 1,
        lineHeight: 1.6,
        height: "1.5lh",
        overflow: "hidden",
      })}
    >
      {renderIcon()}
      <Box
        component="span"
        sx={{
          flex: "0 1 auto",
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </Box>
    </Button>
  );
};
