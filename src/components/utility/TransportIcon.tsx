import { type ReactElement } from "react";
import FlightIcon from "@mui/icons-material/Flight";
import OutlinedFlagIcon from "@mui/icons-material/OutlinedFlag";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import TrainIcon from "@mui/icons-material/Train";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import DirectionsBoatIcon from "@mui/icons-material/DirectionsBoat";
import DirectionsWalkIcon from "@mui/icons-material/DirectionsWalk";
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import ModeOfTravelIcon from "@mui/icons-material/ModeOfTravel";
import type { SxProps } from "@mui/material/styles";

const TRANSPORT_ICON_MAP = {
  "starting point": OutlinedFlagIcon,
  "by plane": FlightIcon,
  "by bus": DirectionsBusIcon,
  "by train": TrainIcon,
  "by boat": DirectionsBoatIcon,
  "by car": DirectionsCarIcon,
  "on foot": DirectionsWalkIcon,
  "by bicycle": DirectionsBikeIcon,
  "by motorbike": TwoWheelerIcon,
} as const;

interface TransportIconProps {
  mode?: string | null;
  sx?: SxProps;
}

export const TransportIcon = ({ mode, sx }: TransportIconProps): ReactElement => {
  const IconComponent = mode && mode in TRANSPORT_ICON_MAP ? TRANSPORT_ICON_MAP[mode as keyof typeof TRANSPORT_ICON_MAP] : ModeOfTravelIcon;
  return <IconComponent sx={{ fontSize: "2rem", ...sx }} />;
};

