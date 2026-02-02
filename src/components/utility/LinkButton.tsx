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

export interface LinkButtonProps {
  site: string;
  url: string;
  children: ReactNode;
}

export const LinkButton = ({ site, url, children }: LinkButtonProps): ReactElement => {
  const renderIcon = (): ReactElement | null => {
    switch (site) {
      case "google-maps":
        return (
          <Box
            component="img"
            src={googleMapsIcon}
            alt=""
            sx={{
              height: "1.25rem",
              width: "auto",
              maxWidth: "100%",
              objectFit: "contain",
            }}
          />
        );
      case "google-flights":
        return (
          <Box
            component="img"
            src={googleFlightsIcon}
            alt=""
            sx={{
              height: "1.25rem",
              width: "auto",
              maxWidth: "100%",
              objectFit: "contain",
            }}
          />
        );
      case "skyscanner":
        return (
          <Box
            component="img"
            src={skyscannerIcon}
            alt=""
            sx={{
              height: "1.25rem",
              width: "auto",
              maxWidth: "100%",
              objectFit: "contain",
            }}
          />
        );
      case "rome2rio":
        return (
          <Box
            component="img"
            src={rome2rioIcon}
            alt=""
            sx={{
              height: "1.25rem",
              width: "auto",
              maxWidth: "100%",
              objectFit: "contain",
            }}
          />
        );
      case "booking":
        return (
          <Box
            component="img"
            src={bookingIcon}
            alt=""
            sx={{
              height: "1.25rem",
              width: "auto",
              maxWidth: "100%",
              objectFit: "contain",
            }}
          />
        );
      case "hostelworld":
        return (
          <Box
            component="img"
            src={hostelworldIcon}
            alt=""
            sx={{
              height: "1.25rem",
              width: "auto",
              maxWidth: "100%",
              objectFit: "contain",
            }}
          />
        );
      case "uber":
        return (
          <Box
            component="img"
            src={uberIcon}
            alt=""
            sx={{
              height: "1.25rem",
              width: "auto",
              maxWidth: "100%",
              objectFit: "contain",
            }}
          />
        );
      case "tripadvisor":
        return (
          <Box
            component="img"
            src={tripAdvisorIcon}
            alt=""
            sx={{
              height: "1.25rem",
              width: "auto",
              maxWidth: "100%",
              objectFit: "contain",
            }}
          />
        );
      case "getyourguide":
        return (
          <Box
            component="img"
            src={getYourGuideIcon}
            alt=""
            sx={{
              height: "1.25rem",
              width: "auto",
              maxWidth: "100%",
              objectFit: "contain",
            }}
          />
        );
      case "taxi":
        return <LocalTaxiIcon />;
      default:
        return null;
    }
  };

  return (
    <Button
      variant="outlined"
      fullWidth
      onClick={() => {
        window.open(url, "_blank", "noopener,noreferrer");
      }}
      sx={{
        bgcolor: "white",
        color: "black !important",
        borderColor: "divider",
        "&:hover": {
          bgcolor: "grey.50",
          borderColor: "divider",
          color: "black !important",
        },
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      {renderIcon()}
      {children}
    </Button>
  );
};
