import { StyleSheet } from "@react-pdf/renderer";

export const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "DejaVuSans",
    fontSize: 10,
    color: "#222",
    lineHeight: 1.5,
  },
  tripName: {
    fontSize: 20,
    fontFamily: "DejaVuSans-Bold",
    textAlign: "center",
    marginBottom: 4,
  },
  tripDates: {
    fontSize: 10,
    textAlign: "center",
    color: "#555",
    marginBottom: 2,
  },
  tripStats: {
    fontSize: 9,
    textAlign: "center",
    color: "#777",
    marginBottom: 2,
  },
  headerDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginTop: 10,
    marginBottom: 14,
  },
  destinationBlock: {
    marginBottom: 10,
  },
  transportSection: {
    paddingLeft: 12,
    marginBottom: 6,
  },
  transportHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  transportMode: {
    fontSize: 9,
    fontFamily: "DejaVuSans-Bold",
    color: "#444",
    marginBottom: 2,
  },
  transportDetail: {
    fontSize: 9,
    color: "#666",
    paddingLeft: 4,
    marginBottom: 1,
  },
  sectionDivider: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#e0e0e0",
    marginTop: 6,
    marginBottom: 8,
  },
  destinationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  destinationNumber: {
    fontSize: 12,
    fontFamily: "DejaVuSans-Bold",
    color: "#1976d2",
    marginRight: 4,
  },
  destinationName: {
    fontSize: 12,
    fontFamily: "DejaVuSans-Bold",
  },
  destinationCountry: {
    fontSize: 12,
    color: "#777",
  },
  dateNightsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 14,
    marginBottom: 4,
    gap: 8,
  },
  dateText: {
    fontSize: 9,
    color: "#666",
  },
  nightsBadge: {
    fontSize: 8,
    color: "#555",
    borderWidth: 0.5,
    borderColor: "#ccc",
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  subSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 14,
    marginTop: 6,
    marginBottom: 2,
  },
  subSectionIcon: {
    fontSize: 9,
    color: "#888",
    marginRight: 4,
  },
  subSectionTitle: {
    fontSize: 10,
    fontFamily: "DejaVuSans-Bold",
  },
  itemBlock: {
    paddingLeft: 28,
    marginBottom: 4,
  },
  itemName: {
    fontSize: 9,
    fontFamily: "DejaVuSans-Bold",
  },
  itemDetail: {
    fontSize: 8,
    color: "#666",
  },
  outboundTransportBlock: {
    marginTop: 4,
  },
  emptyMessage: {
    textAlign: "center",
    color: "#999",
    fontSize: 11,
    marginTop: 20,
  },
});