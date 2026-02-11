import FlightIcon from "@mui/icons-material/Flight";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import TrainIcon from "@mui/icons-material/Train";
import DirectionsBoatIcon from "@mui/icons-material/DirectionsBoat";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import DirectionsWalkIcon from "@mui/icons-material/DirectionsWalk";
import OutlinedFlagIcon from "@mui/icons-material/OutlinedFlag";

export const TRANSPORT_MODES = [
  { value: "starting point", icon: OutlinedFlagIcon, label: "Starting point" },
  { value: "by plane", icon: FlightIcon, label: "By plane" },
  { value: "by bus", icon: DirectionsBusIcon, label: "By bus" },
  { value: "by train", icon: TrainIcon, label: "By train" },
  { value: "by boat", icon: DirectionsBoatIcon, label: "By boat" },
  { value: "by car", icon: DirectionsCarIcon, label: "By car" },
  { value: "by motorbike", icon: TwoWheelerIcon, label: "By motorbike" },
  { value: "by bicycle", icon: DirectionsBikeIcon, label: "By bicycle" },
  { value: "on foot", icon: DirectionsWalkIcon, label: "On foot" },
] as const;

export const SELF_TRANSPORT_MODES = ["by car", "by motorbike", "by bicycle", "on foot", "starting point"] as const;

