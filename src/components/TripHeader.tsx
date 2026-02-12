import { type ReactElement, lazy, Suspense } from "react";
import Box from "@mui/material/Box";
import { type Dayjs } from "dayjs";
import { type Destination as DestinationType } from "../types/destination";
import { type LayoutMode } from "../App";
import { TripCardDate } from "./TripCardDate";

const TripCardMap = lazy(async () => {
  const module = await import("./TripCardMap");
  return { default: module.TripCardMap };
});

export interface TripHeaderProps {
  layoutMode: LayoutMode;
  tripStartDate: Dayjs | null;
  tripEndDate: Dayjs | null;
  dateErrorsExist: boolean;
  referenceDateForStart: Dayjs;
  destinations: DestinationType[];
  mapExpanded: boolean;
  onMapExpandChange: (expanded: boolean) => void;
  onStartDateChange: (date: Dayjs | null) => void;
}

export const TripHeader = ({
  layoutMode,
  tripStartDate,
  tripEndDate,
  dateErrorsExist,
  referenceDateForStart,
  destinations,
  mapExpanded,
  onMapExpandChange,
  onStartDateChange,
}: TripHeaderProps): ReactElement => {
  if (layoutMode === "desktop") {
    return (
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gridTemplateRows: "auto auto",
          columnGap: 2,
          rowGap: 0,
          alignItems: "start",
        }}
      >
        <Box sx={{ gridColumn: "1", gridRow: "1" }}>
          <TripCardDate startDate={tripStartDate} endDate={tripEndDate} onStartDateChange={onStartDateChange} hasDateErrors={dateErrorsExist} referenceDateForStart={referenceDateForStart} />
        </Box>
        <Box sx={{ gridColumn: "2", gridRow: "1" }}>
          <Suspense fallback={null}>
            <TripCardMap destinations={destinations} layoutMode={layoutMode} headerOnly expanded={mapExpanded} onExpandChange={onMapExpandChange} />
          </Suspense>
        </Box>
        <Box sx={{ gridColumn: "1 / -1", gridRow: "2" }}>
          <Suspense fallback={null}>
            <TripCardMap destinations={destinations} layoutMode={layoutMode} bodyOnly expanded={mapExpanded} onExpandChange={onMapExpandChange} />
          </Suspense>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <TripCardDate startDate={tripStartDate} endDate={tripEndDate} onStartDateChange={onStartDateChange} hasDateErrors={dateErrorsExist} referenceDateForStart={referenceDateForStart} />
      <Suspense fallback={null}>
        <TripCardMap destinations={destinations} layoutMode={layoutMode} headerOnly={false} bodyOnly={false} expanded={mapExpanded} onExpandChange={onMapExpandChange} />
      </Suspense>
    </Box>
  );
};
