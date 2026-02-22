import { type ReactElement, lazy, Suspense } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import { InfoOutline } from "@mui/icons-material";
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import { type Dayjs } from "dayjs";
import { TripHeader, type TripHeaderProps } from "./TripHeader";
import { type Destination as DestinationType } from "../types/destination";
import { type ViewMode, type LayoutMode, type ArrivalWeatherBackgroundMode } from "../App";
import { getPulsingDropShadowSx } from "./utility/pulsingShadow";

const DestinationCard = lazy(async () => {
  const module = await import("./DestinationCard");
  return { default: module.DestinationCard };
});

interface DestinationDateInfo {
  arrivalDate?: Dayjs | null;
  departureDate?: Dayjs | null;
  error?: string | null;
}

interface TripLayoutPortraitListProps extends TripHeaderProps {
  viewMode: ViewMode;
  layoutMode: LayoutMode;
  destinationsWithTimeline: DestinationType[];
  destinationDates: DestinationDateInfo[];
  currentIndex: number;
  reorderDragOverIndex: number | null;
  newlyCreatedId: string | null;
  showExploreButton: boolean;
  showInfoButton: boolean;
  arrivalWeatherBackgroundMode: ArrivalWeatherBackgroundMode;
  exploreAnchorEl: { [key: string]: HTMLElement | null };
  handleAddDestination: (index?: number) => void;
  handleDestinationChange: (destination: DestinationType) => void;
  handleRemoveDestination: (destinationId: string) => void;
  handleReorderDragStart: (e: React.DragEvent, id: string) => void;
  handleReorderDragOver: (e: React.DragEvent, index: number) => void;
  handleReorderDrop: (e: React.DragEvent, toIndex: number) => void;
  handleReorderDragEnd: () => void;
  handleExploreClick: (event: React.MouseEvent<HTMLElement>, index: number) => void;
  handleExploreClose: (index: number) => void;
  handleExploreSelect: (index: number, option: string) => void;
}

export const TripLayoutPortraitList = ({ viewMode, layoutMode, destinationsWithTimeline, destinationDates, reorderDragOverIndex, newlyCreatedId, showExploreButton, showInfoButton, arrivalWeatherBackgroundMode, exploreAnchorEl, handleAddDestination, handleDestinationChange, handleRemoveDestination, handleReorderDragStart, handleReorderDragOver, handleReorderDrop, handleReorderDragEnd, handleExploreClick, handleExploreClose, handleExploreSelect, ...settingsProps
}: TripLayoutPortraitListProps): ReactElement => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Stack
        sx={{
          flex: 1,
          overflow: "auto",
          gap: 2,
          scrollbarGutter: "stable both-edges",
        }}
      >
        <TripHeader layoutMode={layoutMode} destinations={destinationsWithTimeline} tripStartDate={settingsProps.tripStartDate} tripEndDate={settingsProps.tripEndDate} dateErrorsExist={settingsProps.dateErrorsExist} referenceDateForStart={settingsProps.referenceDateForStart} mapExpanded={settingsProps.mapExpanded} onMapExpandChange={settingsProps.onMapExpandChange} onStartDateChange={settingsProps.onStartDateChange} />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {destinationsWithTimeline.map((destination, index) => (
            <Box
              key={destination.id}
              sx={{
                minWidth: 0,
                overflow: "visible",
                ...(viewMode === "list" &&
                  reorderDragOverIndex === index && {
                    outline: 2,
                    outlineStyle: "dashed",
                    outlineColor: "primary.main",
                    borderRadius: 2,
                  }),
              }}
              {...(viewMode === "list" && {
                onDragOver: (e: React.DragEvent) => handleReorderDragOver(e, index),
                onDrop: (e: React.DragEvent) => handleReorderDrop(e, index),
              })}
            >
              <Box sx={{ display: "flex", justifyContent: "center", mb: 1, gap: 8 }}>
                <>
                  {showExploreButton && (
                    <IconButton size="small" onClick={(e) => handleExploreClick(e, index)} sx={{ opacity: 0.7 }}>
                      <TravelExploreIcon />
                    </IconButton>
                    // import TravelExploreIcon from '@mui/icons-material/TravelExplore';
                  )}
                  <Menu anchorEl={exploreAnchorEl[index]} open={Boolean(exploreAnchorEl[index])} onClose={() => handleExploreClose(index)}>
                    <MenuItem disabled sx={{ opacity: 0.6, fontWeight: 600 }}>
                      Explore...
                    </MenuItem>
                {index > 0 && <MenuItem onClick={() => handleExploreSelect(index, `near-prev`)}>Near {destinationsWithTimeline[index - 1]?.displayName || destinationsWithTimeline[index - 1]?.name || "previous"}</MenuItem>}
                    <MenuItem onClick={() => handleExploreSelect(index, `near-next`)}>Near {destinationsWithTimeline[index]?.displayName || destinationsWithTimeline[index]?.name || "next"}</MenuItem>
                    {/* {index > 0 && (
                      <MenuItem onClick={() => handleExploreSelect(index, `between`)}>
                        Between {destinationsWithTimeline[index - 1]?.displayName || destinationsWithTimeline[index - 1]?.name || "previous"} and {destinationsWithTimeline[index]?.displayName || destinationsWithTimeline[index]?.name || "next"}
                      </MenuItem>
                    )} */}
                  </Menu>
                </>
                <IconButton
                  onClick={() => handleAddDestination(index)}
                  color="primary"
                  size="small"
                >
                  <AddIcon
                    sx={(theme) => ({
                      transform: "scale(1.4)",
                      ...getPulsingDropShadowSx({
                        minShadow: `0 1px 4px ${theme.palette.primary.main}80`,
                        maxShadow: `0 2px 8px ${theme.palette.primary.main}CC`,
                      }),
                    })}
                  />
                </IconButton>
                {showInfoButton && (
                  <IconButton size="small" sx={{ opacity: 0.7 }}>
                    <InfoOutline />
                  </IconButton>
                )}
              </Box>
              <Suspense
                fallback={
                  <Box sx={{ p: 2 }}>
                    <Typography variant="body2">Loading destination...</Typography>
                  </Box>
                }
              >
                <DestinationCard
                  destination={destination}
                  nextDestination={destinationsWithTimeline[index + 1]}
                  previousDestination={index > 0 ? destinationsWithTimeline[index - 1] : undefined}
                  onDestinationChange={handleDestinationChange}
                  onRemove={() => handleRemoveDestination(destination.id)}
                  shouldFocus={destination.id === newlyCreatedId}
                  isFirst={index === 0}
                  arrivalDate={destinationDates[index]?.arrivalDate ?? null}
                  departureDate={destinationDates[index]?.departureDate ?? null}
                  dateError={destinationDates[index]?.error ?? undefined}
                  layoutMode={layoutMode}
                  tripStartDate={settingsProps.tripStartDate}
                  isListMode={viewMode === "list"}
                  onReorderDragStart={viewMode === "list" ? (e: React.DragEvent) => handleReorderDragStart(e, destination.id) : undefined}
                  onReorderDragEnd={viewMode === "list" ? handleReorderDragEnd : undefined}
                  arrivalWeatherBackgroundMode={arrivalWeatherBackgroundMode}
                />
              </Suspense>
            </Box>
          ))}
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleAddDestination()} sx={{ mt: 2 }} fullWidth>
          New Destination
        </Button>
      </Stack>
    </Box>
  );
};
