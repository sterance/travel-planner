import { type ReactElement } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import HotelIcon from "@mui/icons-material/Hotel";
import PlaceIcon from "@mui/icons-material/Place";
import EventIcon from "@mui/icons-material/Event";
import { TransportIcon } from "../components/utility/TransportIcon";
import type { Dayjs } from "dayjs";
import type { Destination, TransportDetails, AccommodationDetails, ActivityDetails } from "../types/destination";
import type { Trip } from "../types/trip";
import type { DateFormatPreference } from "../App";
import { useTripContext } from "../hooks/useTripContext";
import { useDateFormat } from "../hooks/useDateFormat";
import { computeDestinationTimeline } from "../utils/dateCalculation";

const formatTransportMode = (mode: string): string => {
  return mode.replace(/^by\s+/, "").replace(/^\w/, (c) => c.toUpperCase());
};

const formatNights = (nights: Destination["nights"]): string => {
  if (nights === "none") return "Day visit";
  if (nights === "dates") return "Custom dates";
  if (typeof nights === "number") return nights === 1 ? "1 night" : `${nights} nights`;
  return "Nights not set";
};

const getTotalNights = (destinations: Destination[]): number | null => {
  let total = 0;
  let allSet = true;
  for (const d of destinations) {
    if (typeof d.nights === "number") {
      total += d.nights;
    } else if (d.nights === "none") {
      // day visit, 0 nights
    } else {
      allSet = false;
    }
  }
  return allSet ? total : null;
};

interface DateDisplayProps {
  date: Dayjs | null | undefined;
  dateFormat: DateFormatPreference;
  includeTime?: boolean;
}

const formatDate = ({ date, includeTime }: DateDisplayProps): string => {
  if (!date || !date.isValid()) return "";
  if (includeTime) return date.format("MMM DD, YYYY hh:mm A");
  return date.format("MMM DD, YYYY");
};

const DateRange = ({
  from,
  to,
  dateFormat,
  includeTime,
}: {
  from: Dayjs | null | undefined;
  to: Dayjs | null | undefined;
  dateFormat: DateFormatPreference;
  includeTime?: boolean;
}): ReactElement | null => {
  const f = formatDate({ date: from, dateFormat, includeTime });
  const t = formatDate({ date: to, dateFormat, includeTime });
  if (!f && !t) return null;

  // If both dates fall on the same day and time is shown, omit the repeated date from "to"
  let displayTo = t;
  if (
    includeTime &&
    from &&
    to &&
    from.isValid() &&
    to.isValid() &&
    from.format("YYYY-MM-DD") === to.format("YYYY-MM-DD")
  ) {
    displayTo = to.format("hh:mm A");
  }

  return (
    <Typography variant="body2" color="text.secondary">
      {f || "?"} ￫ {displayTo || "?"}
    </Typography>
  );
};

const TransportSection = ({
  transport,
  dateFormat,
  modeOverride,
}: {
  transport: TransportDetails;
  dateFormat: DateFormatPreference;
  modeOverride?: string;
}): ReactElement => {
  const displayMode = modeOverride ?? transport.mode;
  return (
    <Box sx={{ pl: 3, mt: 1 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
        <Chip
          icon={<TransportIcon mode={displayMode} sx={{ fontSize: "16px !important" }} />}
          label={formatTransportMode(displayMode)}
          size="small"
          variant="outlined"
          sx={{pl:1}}
        />
        {transport.bookingNumber && (
          <Typography variant="caption" color="text.secondary">
            Ref: {transport.bookingNumber}
          </Typography>
        )}
      </Stack>
      {(transport.departureLocation || transport.arrivalLocation) && (
        <Typography variant="body2" color="text.secondary" sx={{ pl: 0.5 }}>
          {transport.departureLocation || "?"} ￫ {transport.arrivalLocation || "?"}
        </Typography>
      )}
      {(transport.departureDateTime || transport.arrivalDateTime) && (
        <Box sx={{ pl: 0.5 }}>
          <DateRange
            from={transport.departureDateTime}
            to={transport.arrivalDateTime}
            dateFormat={dateFormat}
            includeTime
          />
        </Box>
      )}
    </Box>
  );
};

const AccommodationSection = ({
  accommodations,
  dateFormat,
}: {
  accommodations: AccommodationDetails[];
  dateFormat: DateFormatPreference;
}): ReactElement => (
  <Box sx={{ pl: 3.5, mt: 1.5 }}>
    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.5 }}>
      <HotelIcon sx={{ fontSize: 18, color: "text.secondary" }} />
      <Typography variant="subtitle1">Accommodation</Typography>
    </Stack>
    {accommodations.map((acc) => (
      <Box key={acc.id} sx={{ pl: 2.5, mb: 1 }}>
        {acc.name && (
          <Typography variant="body2" fontWeight={500}>
            {acc.name}
          </Typography>
        )}
        {acc.address && (
          <Typography variant="caption" color="text.secondary" display="block">
            {acc.address}
          </Typography>
        )}
        {(acc.checkInDateTime || acc.checkOutDateTime) && (
          <DateRange from={acc.checkInDateTime} to={acc.checkOutDateTime} dateFormat={dateFormat} includeTime />
        )}
      </Box>
    ))}
  </Box>
);

const ActivitiesSection = ({
  activities,
  dateFormat,
}: {
  activities: ActivityDetails[];
  dateFormat: DateFormatPreference;
}): ReactElement => (
  <Box sx={{ pl: 3.5, mt: 1.5 }}>
    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.5 }}>
      <EventIcon sx={{ fontSize: 18, color: "text.secondary" }} />
      <Typography variant="subtitle1">Activities</Typography>
    </Stack>
    {activities.map((act) => (
      <Box key={act.id} sx={{ pl: 2.5, mb: 1 }}>
        {act.name && (
          <Typography variant="body2" fontWeight={500}>
            {act.name}
          </Typography>
        )}
        {act.address && (
          <Typography variant="caption" color="text.secondary" display="block">
            {act.address}
          </Typography>
        )}
        {(act.startDateTime || act.endDateTime) && (
          <DateRange from={act.startDateTime} to={act.endDateTime} dateFormat={dateFormat} includeTime />
        )}
      </Box>
    ))}
  </Box>
);

const DestinationSection = ({
  destination,
  index,
  total,
  inboundTransport,
  dateFormat,
}: {
  destination: Destination;
  index: number;
  total: number;
  inboundTransport: TransportDetails | undefined;
  dateFormat: DateFormatPreference;
}): ReactElement => {
  const label = destination.displayName || destination.name;
  const country = destination.placeDetails?.country;
  const hasAccommodations = destination.accommodations && destination.accommodations.length > 0;
  const hasActivities = destination.activities && destination.activities.length > 0;

  return (
    <Box sx={{ mb: 2 }}>
      {/* Inbound transport (how you get here) */}
      {inboundTransport && (
        <Box sx={{ mb: 1.5 }}>
          <TransportSection transport={inboundTransport} dateFormat={dateFormat} modeOverride={destination.transportDetails?.mode} />
          <Divider sx={{ mt: 1.5 }} />
        </Box>
      )}

      {/* Destination header */}
      <Stack direction="row" spacing={1} alignItems="center">
        <PlaceIcon sx={{ fontSize: 20, color: "primary.main" }} />
        <Typography variant="h6" component="h3">
          {index + 1}. {label}
          {country && (
            <Typography component="span" variant="h6" color="text.secondary">
              {", "}
              {country}
            </Typography>
          )}
        </Typography>
      </Stack>

      {/* Date range & nights */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ pl: 3.5, mt: 0.25 }}>
        <DateRange from={destination.arrivalDate} to={destination.departureDate} dateFormat={dateFormat} />
        <Chip label={formatNights(destination.nights)} size="small" variant="outlined" />
      </Stack>

      {/* Accommodation */}
      {hasAccommodations && (
        <AccommodationSection accommodations={destination.accommodations!} dateFormat={dateFormat} />
      )}

      {/* Activities */}
      {hasActivities && <ActivitiesSection activities={destination.activities!} dateFormat={dateFormat} />}

      {/* Separator unless last */}
      {index < total - 1 && <Divider sx={{ mt: 2 }} />}
    </Box>
  );
};

interface ItineraryPageProps {
  trip?: Trip | null;
}

export const ItineraryPage = ({ trip: tripProp }: ItineraryPageProps): ReactElement => {
  const { currentTrip, tripsLoading } = useTripContext();
  const trip = tripProp ?? currentTrip;
  const dateFormat = useDateFormat();

  if (tripsLoading) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  if (!trip) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="body1" color="text.secondary">
          No trip selected
        </Typography>
      </Box>
    );
  }

  const { destinations } = trip;
  const { destinationsWithTimeline } = computeDestinationTimeline(trip.startDate, destinations);
  const totalNights = getTotalNights(destinations);

  return (
    <Card sx={{ p: 1, my: 2, maxWidth: 600, mx: "auto" }}>
      {/* Trip header */}
      <Box sx={{ mb: 2, textAlign: "center" }}>
        <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
          {trip.name}
        </Typography>
        {(trip.startDate || trip.endDate) && (
          <DateRange from={trip.startDate} to={trip.endDate} dateFormat={dateFormat} />
        )}
        <Stack direction="column" sx={{ mt: 1 }} justifyContent="center">
          <Typography variant="body2" color="text.secondary">
            {destinations.length} {destinations.length === 1 ? "destination" : "destinations"}
          </Typography>
          {totalNights !== null && (
            <>
              <Typography variant="body2" color="text.secondary">
                {totalNights} {totalNights === 1 ? "night" : "nights"}
              </Typography>
            </>
          )}
        </Stack>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Destinations */}
      {destinationsWithTimeline.length === 0 ? (
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
          No destinations added yet
        </Typography>
      ) : (
        destinationsWithTimeline.map((dest, i) => (
          <DestinationSection
            key={dest.id}
            destination={dest}
            index={i}
            total={destinationsWithTimeline.length}
            inboundTransport={i > 0 ? destinations[i - 1].transportDetails : undefined}
            dateFormat={dateFormat}
          />
        ))
      )}
    </Card>
  );
};
