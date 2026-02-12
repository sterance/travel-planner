import { type ReactElement, type RefObject } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { type Dayjs } from "dayjs";
import { type Destination as DestinationType } from "../types/destination";
import { type LayoutMode } from "../App";
import { StatusBadge } from "./utility/StatusBadge";
import { TransportIcon } from "./utility/TransportIcon";
import { IconMenu } from "./utility/IconMenu";
import { TRANSPORT_MODES } from "../utils/transportConfig";
import { CalendarNightsIcon } from "./utility/CalendarNightsIcon";
import { type PlaceSuggestion } from "../services/placeService";
import { useDestinationSearch } from "../hooks/useDestinationSearch";

interface DestinationCardHeaderEditProps {
  inputValue: string;
  suggestions: PlaceSuggestion[];
  isLoading: boolean;
  autocompleteRef: RefObject<HTMLDivElement | null>;
  onInputChange: (event: unknown, newValue: string | null) => void;
  onChange: (event: unknown, value: string | PlaceSuggestion | null, reason?: unknown, details?: unknown) => void;
  onBlur: () => void;
}

export const DestinationCardHeaderEdit = ({
  inputValue,
  suggestions,
  isLoading,
  autocompleteRef,
  onInputChange,
  onChange,
  onBlur,
}: DestinationCardHeaderEditProps): ReactElement => {
  return (
    <Box sx={{ position: "relative", width: "100%" }}>
      <Autocomplete
        ref={autocompleteRef}
        freeSolo
        options={suggestions}
        getOptionLabel={(option) => {
          if (typeof option === "string") {
            return option;
          }
          return option.name;
        }}
        inputValue={inputValue}
        onInputChange={onInputChange}
        onChange={onChange}
        onBlur={onBlur}
        loading={isLoading}
        renderInput={(params) => {
          const { InputProps: inputProps, ...textFieldParams } = params;
          return (
            <TextField
              {...textFieldParams}
              placeholder="Destination name"
              variant="standard"
              sx={{
                width: "100%",
                "& .MuiInputBase-input": {
                  textAlign: "center",
                },
                "& .MuiInput-underline:before": {
                  display: "none",
                },
                "& .MuiInput-underline:after": {
                  display: "none",
                },
                "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
                  display: "none",
                },
              }}
              slotProps={{
                input: {
                  ...inputProps,
                },
              }}
            />
          );
        }}
        sx={{
          width: "100%",
          "& .MuiAutocomplete-endAdornment": {
            position: "absolute",
          right: "8px",
          },
          "& .MuiInputBase-root": {
            paddingRight: "0 !important",
          },
          "& .MuiInputBase-input": {
            paddingLeft: "40px !important",
            paddingRight: "40px !important",
          },
        }}
      />
    </Box>
  );
};

interface DestinationCardHeaderDisplayProps {
  destination: DestinationType;
  layoutMode: LayoutMode;
  arrivalDate: Dayjs | null;
  departureDate: Dayjs | null;
  alwaysExpanded: boolean;
  expanded: boolean;
  isFirst: boolean;
  currentTransport?: string | null;
  isTransportSet: boolean;
  calculatedNights: number | null;
  showCustomNights: boolean;
  customNightsValue: string;
  calendarOpen: boolean;
  calendarAnchorEl: HTMLElement | null;
  transportAnchorEl: HTMLElement | null;
  transportOpen: boolean;
  onTransportClick: (event: React.MouseEvent<HTMLElement>) => void;
  onTransportClose: () => void;
  onTransportSelect: (transport: string | "unsure") => void;
  onCalendarClick: (event: React.MouseEvent<HTMLElement>) => void;
  onCalendarClose: () => void;
  onNightSelect: (nights: number | "none" | "more" | "dates" | "unsure") => void;
  onExpandClick: () => void;
  onEditClick: () => void;
  isOnwardsTravelBooked: () => boolean;
  customNightsInputRef: RefObject<HTMLInputElement | null>;
  onCustomNightsChange: (value: string) => void;
  onCustomNightsKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onCustomNightsSubmit: () => void;
  isCarousel?: boolean;
}

export const DestinationCardHeaderDisplay = ({
  destination,
  layoutMode,
  arrivalDate,
  departureDate,
  alwaysExpanded,
  expanded,
  isFirst,
  currentTransport,
  isTransportSet,
  calculatedNights,
  showCustomNights,
  customNightsValue,
  calendarOpen,
  calendarAnchorEl,
  transportAnchorEl,
  transportOpen,
  onTransportClick,
  onTransportClose,
  onTransportSelect,
  onCalendarClick,
  onCalendarClose,
  onNightSelect,
  onExpandClick,
  onEditClick,
  isOnwardsTravelBooked,
  customNightsInputRef,
  onCustomNightsChange,
  onCustomNightsKeyDown,
  onCustomNightsSubmit,
  isCarousel = false,
}: DestinationCardHeaderDisplayProps): ReactElement => {
  return (
    <>
      <Box sx={{ position: "relative", width: "100%", display: "flex", alignItems: "center" }}>
        <Box sx={{ position: "absolute", left: 0, pt: 0.5, pl: 0.5 }}>
          <StatusBadge variant="info" visible={!isTransportSet}>
            <IconButton aria-label="transport" size="small" onClick={onTransportClick} sx={{ padding: 0.5 }}>
              <TransportIcon mode={currentTransport} />
            </IconButton>
          </StatusBadge>
        </Box>
        <IconMenu
          anchorEl={transportAnchorEl}
          open={transportOpen}
          onClose={onTransportClose}
          items={[
            {
              value: "unsure",
              label: "Unsure",
              icon: <HelpOutlineIcon sx={{ mr: 1 }} />,
            },
            ...TRANSPORT_MODES.filter((mode) => isFirst || mode.value !== "starting point").map((mode) => {
              const Icon = mode.icon;
              return {
                value: mode.value,
                label: mode.label,
                icon: <Icon sx={{ mr: 1 }} />,
              };
            }),
          ]}
          onSelect={(value) => onTransportSelect(String(value) as string)}
        />
        <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <Typography
            variant="h6"
            component="div"
            onClick={onEditClick}
            sx={{
              textAlign: "center",
              cursor: "text",
              ...(isCarousel && { transform: "translateY(1rem)" }),
            }}
          >
            {destination.displayName || destination.name || "Destination name"}
          </Typography>
        </Box>
        <Box sx={{ position: "absolute", right: 0, pt: 0.5, pr: 0.5 }}>
          <StatusBadge variant="info" visible={!(typeof destination.nights === "number" || (destination.nights === "dates" && destination.arrivalDate && destination.departureDate))}>
            <IconButton aria-label="calendar" size="small" onClick={onCalendarClick} sx={{ padding: 0.5 }}>
              {!expanded && calculatedNights !== null && calculatedNights >= 0 && calculatedNights <= 9 ? <CalendarNightsIcon nights={calculatedNights} /> : <CalendarMonthOutlinedIcon sx={{ fontSize: "2rem" }} />}
            </IconButton>
          </StatusBadge>
        </Box>
        <Menu anchorEl={calendarAnchorEl} open={calendarOpen} onClose={onCalendarClose}>
          <MenuItem onClick={() => onNightSelect("unsure")} sx={{ justifyContent: "flex-end" }}>
            Unsure
            <HelpOutlineIcon sx={{ ml: 1 }} />
          </MenuItem>
          <MenuItem onClick={() => onNightSelect("dates")} sx={{ justifyContent: "flex-end" }}>
            Select dates
            <CalendarMonthOutlinedIcon sx={{ ml: 1 }} />
          </MenuItem>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((nights) => (
            <MenuItem key={nights} onClick={() => onNightSelect(nights)} sx={{ justifyContent: "flex-end" }}>
              {nights} {nights === 1 ? "Night" : "Nights"}
              <Box sx={{ ml: 1 }}>
                <CalendarNightsIcon nights={nights} size={24} />
              </Box>
            </MenuItem>
          ))}
          <MenuItem onClick={() => onNightSelect("more")} sx={{ justifyContent: "flex-end" }}>
            More
            <MoreHorizIcon sx={{ ml: 1 }} />
          </MenuItem>
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
              onChange={(e) => onCustomNightsChange(e.target.value)}
              onKeyDown={onCustomNightsKeyDown}
              onBlur={onCustomNightsSubmit}
              placeholder="Nights"
              type="number"
              size="small"
              sx={{
                width: 80,
                "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
                  WebkitAppearance: "none",
                  margin: 0,
                },
                "& input[type=number]": {
                  MozAppearance: "textfield",
                },
              }}
              slotProps={{
                htmlInput: { min: 1 },
              }}
            />
          </Box>
        )}
      </Box>
      {!alwaysExpanded && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            position: "relative",
            overflow: "visible",
          }}
        >
          <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-start", minWidth: 0 }}>
            {expanded && (
              <Typography variant="body2" sx={{ textTransform: "capitalize", flexShrink: 0 }}>
                {currentTransport || "\u00A0"}
              </Typography>
            )}
            {!expanded && layoutMode === "portrait" && arrivalDate && (
              <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
                {arrivalDate.format("MMM D")}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <IconButton
              onClick={onExpandClick}
              aria-expanded={expanded}
              aria-label="show more"
              sx={{
                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            >
              <ExpandMoreIcon />
            </IconButton>
          </Box>
          <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end", minWidth: 0 }}>
            {expanded && (
              <Typography variant="body2" sx={{ flexShrink: 0 }}>
                {destination.nights === "none"
                  ? "None"
                  : calculatedNights !== null
                  ? `${calculatedNights} ${calculatedNights === 1 ? "Night" : "Nights"}`
                  : "\u00A0"}
              </Typography>
            )}
            {!expanded && layoutMode === "portrait" && departureDate && (
              <StatusBadge variant="info" visible={!isOnwardsTravelBooked()} attachToText>
                <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
                  {departureDate.format("MMM D")}
                </Typography>
              </StatusBadge>
            )}
          </Box>
        </Box>
      )}
      {alwaysExpanded && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            alignItems: "center",
            width: "100%",
            mt: 1,
          }}
        >
          <Box sx={{ justifySelf: "start" }}>
            <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
              {currentTransport || "\u00A0"}
            </Typography>
          </Box>
          <Box sx={{ justifySelf: "end" }}>
            <Typography variant="body2">
              {destination.nights === "none" ? "None" : calculatedNights !== null ? `${calculatedNights} ${calculatedNights === 1 ? "Night" : "Nights"}` : "\u00A0"}
            </Typography>
          </Box>
        </Box>
      )}
    </>
  );
};

interface DestinationCardHeaderLazyProps {
  destination: DestinationType;
  layoutMode: LayoutMode;
  arrivalDate: Dayjs | null;
  departureDate: Dayjs | null;
  alwaysExpanded: boolean;
  expanded: boolean;
  isFirst: boolean;
  currentTransport?: string | null;
  isTransportSet: boolean;
  calculatedNights: number | null;
  showCustomNights: boolean;
  customNightsValue: string;
  calendarOpen: boolean;
  calendarAnchorEl: HTMLElement | null;
  transportAnchorEl: HTMLElement | null;
  transportOpen: boolean;
  onTransportClick: (event: React.MouseEvent<HTMLElement>) => void;
  onTransportClose: () => void;
  onTransportSelect: (transport: string | "unsure") => void;
  onCalendarClick: (event: React.MouseEvent<HTMLElement>) => void;
  onCalendarClose: () => void;
  onNightSelect: (nights: number | "none" | "more" | "dates" | "unsure") => void;
  onExpandClick: () => void;
  isOnwardsTravelBooked: () => boolean;
  customNightsInputRef: RefObject<HTMLInputElement | null>;
  onCustomNightsChange: (value: string) => void;
  onCustomNightsKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onCustomNightsSubmit: () => void;
  onDestinationChange: (destination: DestinationType) => void;
  shouldFocus: boolean;
  isCarousel?: boolean;
}

export const DestinationCardHeaderLazy = ({
  destination,
  layoutMode,
  arrivalDate,
  departureDate,
  alwaysExpanded,
  expanded,
  isFirst,
  currentTransport,
  isTransportSet,
  calculatedNights,
  showCustomNights,
  customNightsValue,
  calendarOpen,
  calendarAnchorEl,
  transportAnchorEl,
  transportOpen,
  onTransportClick,
  onTransportClose,
  onTransportSelect,
  onCalendarClick,
  onCalendarClose,
  onNightSelect,
  onExpandClick,
  isOnwardsTravelBooked,
  customNightsInputRef,
  onCustomNightsChange,
  onCustomNightsKeyDown,
  onCustomNightsSubmit,
  onDestinationChange,
  shouldFocus,
  isCarousel = false,
}: DestinationCardHeaderLazyProps): ReactElement => {
  const { inputValue, suggestions, isLoading, isEditing, autocompleteRef, handleInputChange, handleChange, handleBlur, handleEditClick } = useDestinationSearch({
    destination,
    onDestinationChange,
    shouldFocus,
  });

  return (
    <>
      <Box sx={{ width: "100%" }}>
        {isEditing ? (
          <DestinationCardHeaderEdit
            inputValue={inputValue}
            suggestions={suggestions}
            isLoading={isLoading}
            autocompleteRef={autocompleteRef}
            onInputChange={handleInputChange}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        ) : (
          <DestinationCardHeaderDisplay
            destination={destination}
            layoutMode={layoutMode}
            arrivalDate={arrivalDate}
            departureDate={departureDate}
            alwaysExpanded={alwaysExpanded}
            expanded={expanded}
            isFirst={isFirst}
            currentTransport={currentTransport}
            isTransportSet={isTransportSet}
            calculatedNights={calculatedNights}
            showCustomNights={showCustomNights}
            customNightsValue={customNightsValue}
            calendarOpen={calendarOpen}
            calendarAnchorEl={calendarAnchorEl}
            transportAnchorEl={transportAnchorEl}
            transportOpen={transportOpen}
            onTransportClick={onTransportClick}
            onTransportClose={onTransportClose}
            onTransportSelect={onTransportSelect}
            onCalendarClick={onCalendarClick}
            onCalendarClose={onCalendarClose}
            onNightSelect={onNightSelect}
            onExpandClick={onExpandClick}
            onEditClick={handleEditClick}
            isOnwardsTravelBooked={isOnwardsTravelBooked}
            customNightsInputRef={customNightsInputRef}
            onCustomNightsChange={onCustomNightsChange}
            onCustomNightsKeyDown={onCustomNightsKeyDown}
            onCustomNightsSubmit={onCustomNightsSubmit}
            isCarousel={isCarousel}
          />
        )}
      </Box>
    </>
  );
};

export default DestinationCardHeaderLazy;

