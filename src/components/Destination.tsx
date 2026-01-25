import { useState, useEffect, useRef, type ReactElement } from "react";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import FlightIcon from "@mui/icons-material/Flight";
import OutlinedFlagIcon from "@mui/icons-material/OutlinedFlag";
import FlagIcon from "@mui/icons-material/Flag";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import TrainIcon from "@mui/icons-material/Train";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import DirectionsBoatIcon from "@mui/icons-material/DirectionsBoat";
import DirectionsWalkIcon from "@mui/icons-material/DirectionsWalk";
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { type Destination as DestinationType } from "../types/destination";

interface DestinationProps {
  destination: DestinationType;
  onNameChange: (id: string, name: string) => void;
  shouldFocus?: boolean;
}

export const Destination = ({ destination, onNameChange, shouldFocus = false }: DestinationProps): ReactElement => {
  const [expanded, setExpanded] = useState(false);
  const [name, setName] = useState(destination.name);
  const [isEditing, setIsEditing] = useState(destination.name === "" || shouldFocus);
  const [calendarAnchorEl, setCalendarAnchorEl] = useState<null | HTMLElement>(null);
  const [transportAnchorEl, setTransportAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTransport, setSelectedTransport] = useState<string | null>(null);
  const [selectedNights, setSelectedNights] = useState<number | "none" | null>(null);
  const [showCustomNights, setShowCustomNights] = useState(false);
  const [customNightsValue, setCustomNightsValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const customNightsInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(destination.name);
  }, [destination.name]);

  useEffect(() => {
    if (shouldFocus && inputRef.current) {
      inputRef.current.focus();
      setIsEditing(true);
    }
  }, [shouldFocus]);

  const handleExpandClick = (): void => {
    setExpanded(!expanded);
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const newName = event.target.value;
    setName(newName);
    onNameChange(destination.id, newName);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "Enter") {
      setIsEditing(false);
      inputRef.current?.blur();
    }
  };

  const handleBlur = (): void => {
    setIsEditing(false);
  };

  const handleEditClick = (): void => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleCalendarClick = (event: React.MouseEvent<HTMLElement>): void => {
    setCalendarAnchorEl(event.currentTarget);
  };

  const handleCalendarClose = (): void => {
    setCalendarAnchorEl(null);
  };

  const handleNightSelect = (nights: number | "none" | "more"): void => {
    if (nights === "more") {
      setShowCustomNights(true);
      handleCalendarClose();
      setTimeout(() => {
        customNightsInputRef.current?.focus();
      }, 0);
    } else {
      setSelectedNights(nights);
      handleCalendarClose();
    }
  };

  const handleCustomNightsSubmit = (): void => {
    const parsed = parseInt(customNightsValue, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setSelectedNights(parsed);
    }
    setShowCustomNights(false);
    setCustomNightsValue("");
  };

  const handleCustomNightsKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "Enter") {
      handleCustomNightsSubmit();
    } else if (event.key === "Escape") {
      setShowCustomNights(false);
      setCustomNightsValue("");
    }
  };

  const handleTransportClick = (event: React.MouseEvent<HTMLElement>): void => {
    setTransportAnchorEl(event.currentTarget);
  };

  const handleTransportClose = (): void => {
    setTransportAnchorEl(null);
  };

  const handleTransportSelect = (transport: string): void => {
    setSelectedTransport(transport);
    handleTransportClose();
  };

  const getTransportIcon = (): ReactElement => {
    switch (selectedTransport) {
      case "starting point":
        return <OutlinedFlagIcon sx={{ fontSize: "2rem" }} />;
      case "by plane":
        return <FlightIcon sx={{ fontSize: "2rem" }} />;
      case "by bus":
        return <DirectionsBusIcon sx={{ fontSize: "2rem" }} />;
      case "by train":
        return <TrainIcon sx={{ fontSize: "2rem" }} />;
      case "by car":
        return <DirectionsCarIcon sx={{ fontSize: "2rem" }} />;
      case "by boat":
        return <DirectionsBoatIcon sx={{ fontSize: "2rem" }} />;
      case "on foot":
        return <DirectionsWalkIcon sx={{ fontSize: "2rem" }} />;
      case "by bicycle":
        return <DirectionsBikeIcon sx={{ fontSize: "2rem" }} />;
      case "by motorbike":
        return <TwoWheelerIcon sx={{ fontSize: "2rem" }} />;
      case "unknown":
        return <HelpOutlineIcon sx={{ fontSize: "2rem" }} />;
      case "ending point":
        return <FlagIcon sx={{ fontSize: "2rem" }} />;
      default:
        return <FlightIcon sx={{ fontSize: "2rem" }} />;
    }
  };

  return (
    <Card>
      <CardHeader
        title={
          <Box sx={{ width: "100%" }}>
            {isEditing ? (
              <TextField
                inputRef={inputRef}
                value={name}
                onChange={handleNameChange}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                placeholder="Destination name"
                variant="standard"
                sx={{
                  width: "100%",
                  "& .MuiInputBase-input": {
                    textAlign: "center",
                  },
                }}
                slotProps={{
                  input: {
                    disableUnderline: true,
                  },
                }}
              />
            ) : (
              <Box sx={{ position: "relative", width: "100%", display: "flex", alignItems: "center" }}>
                <IconButton
                  aria-label="transport"
                  size="small"
                  onClick={handleTransportClick}
                  sx={{
                    position: "absolute",
                    left: 0,
                    padding: 0.5,
                  }}
                >
                  {getTransportIcon()}
                </IconButton>
                <Menu anchorEl={transportAnchorEl} open={Boolean(transportAnchorEl)} onClose={handleTransportClose}>
                  <MenuItem onClick={() => handleTransportSelect("starting point")}>
                    <OutlinedFlagIcon sx={{ mr: 1 }} />
                    Starting point
                  </MenuItem>
                  <MenuItem onClick={() => handleTransportSelect("by plane")}>
                    <FlightIcon sx={{ mr: 1 }} />
                    By plane
                  </MenuItem>
                  <MenuItem onClick={() => handleTransportSelect("by bus")}>
                    <DirectionsBusIcon sx={{ mr: 1 }} />
                    By bus
                  </MenuItem>
                  <MenuItem onClick={() => handleTransportSelect("by train")}>
                    <TrainIcon sx={{ mr: 1 }} />
                    By train
                  </MenuItem>
                  <MenuItem onClick={() => handleTransportSelect("by car")}>
                    <DirectionsCarIcon sx={{ mr: 1 }} />
                    By car
                  </MenuItem>
                  <MenuItem onClick={() => handleTransportSelect("by boat")}>
                    <DirectionsBoatIcon sx={{ mr: 1 }} />
                    By boat
                  </MenuItem>
                  <MenuItem onClick={() => handleTransportSelect("on foot")}>
                    <DirectionsWalkIcon sx={{ mr: 1 }} />
                    On foot
                  </MenuItem>
                  <MenuItem onClick={() => handleTransportSelect("by bicycle")}>
                    <DirectionsBikeIcon sx={{ mr: 1 }} />
                    By bicycle
                  </MenuItem>
                  <MenuItem onClick={() => handleTransportSelect("by motorbike")}>
                    <TwoWheelerIcon sx={{ mr: 1 }} />
                    By motorbike
                  </MenuItem>
                  <MenuItem onClick={() => handleTransportSelect("unknown")}>
                    <HelpOutlineIcon sx={{ mr: 1 }} />
                    Unknown
                  </MenuItem>
                  <MenuItem onClick={() => handleTransportSelect("ending point")}>
                    <FlagIcon sx={{ mr: 1 }} />
                    Ending point
                  </MenuItem>
                </Menu>
                <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
                  <Typography
                    variant="h6"
                    component="div"
                    onClick={handleEditClick}
                    sx={{
                      textAlign: "center",
                      cursor: "text",
                    }}
                  >
                    {name || "Destination name"}
                  </Typography>
                </Box>
                <IconButton
                  aria-label="calendar"
                  size="small"
                  onClick={handleCalendarClick}
                  sx={{
                    position: "absolute",
                    right: 0,
                    padding: 0.5,
                  }}
                >
                  <CalendarMonthIcon sx={{ fontSize: "2rem" }} />
                </IconButton>
                <Menu anchorEl={calendarAnchorEl} open={Boolean(calendarAnchorEl)} onClose={handleCalendarClose}>
                  <MenuItem onClick={() => handleNightSelect("none")}>None</MenuItem>
                  {[1, 2, 3, 4, 5, 6, 7].map((nights) => (
                    <MenuItem key={nights} onClick={() => handleNightSelect(nights)}>
                      {nights} {nights === 1 ? "Night" : "Nights"}
                    </MenuItem>
                  ))}
                  <MenuItem onClick={() => handleNightSelect("more")}>More...</MenuItem>
                </Menu>
                {showCustomNights && (
                  <Box
                    sx={{
                      position: "absolute",
                      right: 0,
                      top: "100%",
                      zIndex: 1,
                      bgcolor: "background.paper",
                      boxShadow: 3,
                      p: 1,
                      borderRadius: 1,
                    }}
                  >
                    <TextField
                      inputRef={customNightsInputRef}
                      value={customNightsValue}
                      onChange={(e) => setCustomNightsValue(e.target.value)}
                      onKeyDown={handleCustomNightsKeyDown}
                      onBlur={handleCustomNightsSubmit}
                      placeholder="Nights"
                      type="number"
                      size="small"
                      sx={{ width: 80 }}
                      slotProps={{
                        htmlInput: { min: 1 },
                      }}
                    />
                  </Box>
                )}
              </Box>
            )}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr auto 1fr",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Box sx={{ justifySelf: "start" }}>
                {expanded && selectedTransport && (
                  <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
                    {selectedTransport}
                  </Typography>
                )}
              </Box>
              <IconButton
                onClick={handleExpandClick}
                aria-expanded={expanded}
                aria-label="show more"
                sx={{
                  transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s",
                }}
              >
                <ExpandMoreIcon />
              </IconButton>
              <Box sx={{ justifySelf: "end" }}>
                {expanded && selectedNights !== null && (
                  <Typography variant="body2">
                    {selectedNights === "none"
                      ? "None"
                      : `${selectedNights} ${selectedNights === 1 ? "Night" : "Nights"}`}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        }
        sx={{
          "& .MuiCardHeader-content": {
            width: "100%",
          },
          pb: 0,
        }}
      />
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>{/* destination content will go here */}</CardContent>
      </Collapse>
    </Card>
  );
};
