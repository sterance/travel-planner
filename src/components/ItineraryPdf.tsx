import { Document, Page, View, Text, Font } from "@react-pdf/renderer";
import type { Trip } from "../types/trip";
import type { DateFormatPreference } from "../App";
import type { Destination, TransportDetails, AccommodationDetails, ActivityDetails } from "../types/destination";
import { computeDestinationTimeline } from "../utils/dateCalculation";
import {
  formatTransportMode,
  formatNights,
  getTotalNights,
  formatDateRange,
} from "../utils/itineraryFormatters";
import { styles } from "../theme/ItineraryPdf.styles";

/** Replace characters unsupported by Helvetica with PDF-safe equivalents */
const pdfSafe = (text: string) => text.replace(/￫/g, "→");

Font.register({
  family: "DejaVuSans",
  fonts: [
    {
      src: "/fonts/DejaVuSans.ttf",
      fontWeight: "normal",
    },
    {
      src: "/fonts/DejaVuSans-Bold.ttf",
      fontWeight: "bold",
    },
  ],
});
Font.register({
  family: "DejaVuSans-Bold",
  src: "/fonts/DejaVuSans-Bold.ttf",
  fontWeight: "bold",
});

const PdfTransportSection = ({
  transport,
  dateFormat,
  modeOverride,
}: {
  transport: TransportDetails;
  dateFormat: DateFormatPreference;
  modeOverride?: string;
}) => {
  const displayMode = modeOverride ?? transport.mode;
  const dateRange = pdfSafe(formatDateRange({
    from: transport.departureDateTime,
    to: transport.arrivalDateTime,
    dateFormat,
    includeTime: true,
  }));

  return (
    <View style={styles.transportSection}>
      <View style={styles.transportHeaderRow}>
        <Text style={styles.transportMode}>{formatTransportMode(displayMode)}</Text>
        {transport.bookingNumber && (
          <Text style={styles.transportDetail}>Ref: {transport.bookingNumber}</Text>
        )}
      </View>
      {(transport.departureLocation || transport.arrivalLocation) && (
        <Text style={styles.transportDetail}>
          {transport.departureLocation || "?"} → {transport.arrivalLocation || "?"}
        </Text>
      )}
      {dateRange && <Text style={styles.transportDetail}>{dateRange}</Text>}
    </View>
  );
};

const PdfAccommodationSection = ({
  accommodations,
  dateFormat,
}: {
  accommodations: AccommodationDetails[];
  dateFormat: DateFormatPreference;
}) => (
  <View>
    <View style={styles.subSectionHeader}>
      <Text style={styles.subSectionTitle}>Accommodation</Text>
    </View>
    {accommodations.map((acc) => {
      const dateRange = pdfSafe(formatDateRange({
        from: acc.checkInDateTime,
        to: acc.checkOutDateTime,
        dateFormat,
        includeTime: true,
      }));
      return (
        <View key={acc.id} style={styles.itemBlock}>
          {acc.name && <Text style={styles.itemName}>{acc.name}</Text>}
          {acc.address && <Text style={styles.itemDetail}>{acc.address}</Text>}
          {dateRange && <Text style={styles.itemDetail}>{dateRange}</Text>}
        </View>
      );
    })}
  </View>
);

const PdfActivitiesSection = ({
  activities,
  dateFormat,
}: {
  activities: ActivityDetails[];
  dateFormat: DateFormatPreference;
}) => (
  <View>
    <View style={styles.subSectionHeader}>
      <Text style={styles.subSectionTitle}>Activities</Text>
    </View>
    {activities.map((act) => {
      const dateRange = pdfSafe(formatDateRange({
        from: act.startDateTime,
        to: act.endDateTime,
        dateFormat,
        includeTime: true,
      }));
      return (
        <View key={act.id} style={styles.itemBlock}>
          {act.name && <Text style={styles.itemName}>{act.name}</Text>}
          {act.address && <Text style={styles.itemDetail}>{act.address}</Text>}
          {dateRange && <Text style={styles.itemDetail}>{dateRange}</Text>}
        </View>
      );
    })}
  </View>
);

const PdfDestinationSection = ({
  destination,
  index,
  total,
  outboundTransport,
  outboundModeOverride,
  dateFormat,
}: {
  destination: Destination;
  index: number;
  total: number;
  outboundTransport: TransportDetails | undefined;
  outboundModeOverride?: string;
  dateFormat: DateFormatPreference;
}) => {
  const label = destination.displayName || destination.name;
  const country = destination.placeDetails?.country;
  const hasAccommodations = destination.accommodations && destination.accommodations.length > 0;
  const hasActivities = destination.activities && destination.activities.length > 0;

  const dateRange = pdfSafe(formatDateRange({
    from: destination.arrivalDate,
    to: destination.departureDate,
    dateFormat,
  }));

  return (
    <View style={styles.destinationBlock} wrap={false}>
      {/* Destination header */}
      <View style={styles.destinationHeader}>
        <Text style={styles.destinationName}>
          {index + 1}. {label}
        </Text>
        {country && <Text style={styles.destinationCountry}>, {country}</Text>}
      </View>

      {/* Date range & nights */}
      <View style={styles.dateNightsBlock}>
        {dateRange && <Text style={styles.dateText}>{dateRange}</Text>}
        <Text style={styles.nightsText}>{formatNights(destination.nights)}</Text>
      </View>

      {/* Accommodation */}
      {hasAccommodations && (
        <PdfAccommodationSection accommodations={destination.accommodations!} dateFormat={dateFormat} />
      )}

      {/* Activities */}
      {hasActivities && (
        <PdfActivitiesSection activities={destination.activities!} dateFormat={dateFormat} />
      )}

      {/* Outbound transport */}
      {outboundTransport && (
        <View style={styles.outboundTransportBlock}>
          <View style={styles.sectionDivider} />
          <PdfTransportSection
            transport={outboundTransport}
            dateFormat={dateFormat}
            modeOverride={outboundModeOverride}
          />
        </View>
      )}

      {/* Separator unless last */}
      {index < total - 1 && <View style={styles.sectionDivider} />}
    </View>
  );
};

interface ItineraryPdfDocumentProps {
  trip: Trip;
  dateFormat: DateFormatPreference;
}

export const ItineraryPdfDocument = ({ trip, dateFormat }: ItineraryPdfDocumentProps) => {
  const { destinations } = trip;
  const { destinationsWithTimeline } = computeDestinationTimeline(trip.startDate, destinations);
  const totalNights = getTotalNights(destinations);

  const tripDateRange = pdfSafe(formatDateRange({
    from: trip.startDate,
    to: trip.endDate,
    dateFormat,
  }));

  return (
    <Document title={`${trip.name} — Itinerary`} author="Travel Planner">
      <Page size="A4" style={styles.page}>
        {/* Trip header */}
        <Text style={styles.tripName}>{trip.name}</Text>
        {tripDateRange && <Text style={styles.tripDates}>{tripDateRange}</Text>}
        <Text style={styles.tripStats}>
          {destinations.length} {destinations.length === 1 ? "destination" : "destinations"}
          {totalNights !== null && ` · ${totalNights} ${totalNights === 1 ? "night" : "nights"}`}
        </Text>

        <View style={styles.headerDivider} />

        {/* Destinations */}
        {destinationsWithTimeline.length === 0 ? (
          <Text style={styles.emptyMessage}>No destinations added yet</Text>
        ) : (
          destinationsWithTimeline.map((dest, i) => (
            <PdfDestinationSection
              key={dest.id}
              destination={dest}
              index={i}
              total={destinationsWithTimeline.length}
              outboundTransport={i < destinationsWithTimeline.length - 1 ? dest.transportDetails : undefined}
              outboundModeOverride={i < destinationsWithTimeline.length - 1 ? destinationsWithTimeline[i + 1]?.transportDetails?.mode : undefined}
              dateFormat={dateFormat}
            />
          ))
        )}
      </Page>
    </Document>
  );
};
