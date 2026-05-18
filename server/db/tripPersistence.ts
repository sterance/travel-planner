import tzlookup from "tz-lookup";
import { db } from "../db.js";

export interface TableSet {
  trips: string;
  destinations: string;
  placeDetails: string;
  transportDetails: string;
  weatherDetails: string;
  accommodations: string;
  activities: string;
  customBudgetItems: string;
}

export interface InsertTripOptions {
  isShared?: boolean;
}

export const TRIPS_TABLES: TableSet = {
  trips: "trips",
  destinations: "destinations",
  placeDetails: "place_details",
  transportDetails: "transport_details",
  weatherDetails: "weather_details",
  accommodations: "accommodations",
  activities: "activities",
  customBudgetItems: "custom_budget_items",
};

const uid = (r: Record<string, unknown>, k: string): string => (r[k] as string) ?? "";
const num = (r: Record<string, unknown>, k: string): number | null => {
  const v = r[k];
  if (typeof v === "number" && !Number.isNaN(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  }
  return null;
};
const str = (r: Record<string, unknown>, k: string): string | null => (r[k] != null ? String(r[k]) : null);
const json = (r: Record<string, unknown>, k: string): unknown => {
  const v = r[k];
  if (v == null) return null;
  if (typeof v !== "string" || !v) return null;
  try {
    return JSON.parse(v) as unknown;
  } catch {
    return null;
  }
};
const jsonStr = (value: unknown): string | null => {
  if (value == null) return null;
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
};
const boolInt = (value: unknown): number | null => (value === true ? 1 : value === false ? 0 : null);
const intBool = (value: unknown): boolean | undefined =>
  value === 1 || value === "1" ? true : value === 0 || value === "0" ? false : undefined;

function parseNights(value: unknown): number | "none" | "dates" | null {
  if (value == null || value === "") return null;
  if (value === "none" || value === "dates") return value;
  if (typeof value === "number" && Number.isInteger(value) && value >= 0) return value;
  const s = String(value);
  if (s === "none" || s === "dates") return s;
  const n = Number(s);
  return Number.isInteger(n) && n >= 0 ? n : null;
}

export function getTripsForUser(tables: TableSet, userId: string): Record<string, unknown>[] {
  const tripRows = db
    .prepare(
      `SELECT id, name, start_date, end_date, created_at, updated_at FROM ${tables.trips} WHERE user_id = ? AND is_shared = 0 ORDER BY updated_at DESC, created_at DESC`,
    )
    .all(userId) as Record<string, unknown>[];
  return tripRows.map((row) => assembleTrip(tables, userId, uid(row, "id"), row));
}

export function getTripForUser(tables: TableSet, userId: string, tripId: string): Record<string, unknown> | null {
  const row = db
    .prepare(
      `SELECT id, name, start_date, end_date, created_at, updated_at FROM ${tables.trips} WHERE user_id = ? AND id = ? AND is_shared = 0`,
    )
    .get(userId, tripId) as Record<string, unknown> | undefined;
  if (!row) return null;
  return assembleTrip(tables, userId, tripId, row);
}

export function getTripById(tables: TableSet, tripId: string, sharedOnly = false): Record<string, unknown> | null {
  const row = db
    .prepare(
      `SELECT user_id, id, name, start_date, end_date, created_at, updated_at FROM ${tables.trips} WHERE id = ?${sharedOnly ? " AND is_shared = 1" : ""}`,
    )
    .get(tripId) as Record<string, unknown> | undefined;
  if (!row) return null;
  const userId = uid(row, "user_id");
  return assembleTrip(tables, userId, tripId, row);
}

function assembleTrip(
  tables: TableSet,
  userId: string,
  tripId: string,
  row: Record<string, unknown>,
): Record<string, unknown> {
  const destRows = db
    .prepare(
      `SELECT id, name, display_name, nights, arrival_date, arrival_time, departure_date, destination_currency_json, time_zone FROM ${tables.destinations} WHERE trip_user_id = ? AND trip_id = ? ORDER BY sort_order, arrival_date`,
    )
    .all(userId, tripId) as Record<string, unknown>[];
  const destinations = destRows.map((d) => assembleDestination(tables, userId, tripId, uid(d, "id"), d));
  return {
    id: tripId,
    name: row.name,
    startDate: row.start_date,
    endDate: row.end_date,
    destinations,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function assembleDestination(
  tables: TableSet,
  userId: string,
  tripId: string,
  destId: string,
  row: Record<string, unknown>,
): Record<string, unknown> {
  const pd = db
    .prepare(
      `SELECT osm_id, osm_type, place_type, lat, lng, city, state, country, country_code, extent_min_x, extent_min_y, extent_max_x, extent_max_y FROM ${tables.placeDetails} WHERE trip_user_id = ? AND trip_id = ? AND destination_id = ?`,
    )
    .get(userId, tripId, destId) as Record<string, unknown> | undefined;
  const td = db
    .prepare(
      `SELECT mode, departure_location, arrival_location, booking_number, departure_date_time, arrival_date_time, costs_json, paid_int FROM ${tables.transportDetails} WHERE trip_user_id = ? AND trip_id = ? AND destination_id = ?`,
    )
    .get(userId, tripId, destId) as Record<string, unknown> | undefined;
  const wd = db
    .prepare(
      `SELECT temperature, condition, weather_code, latitude, longitude, date_time FROM ${tables.weatherDetails} WHERE trip_user_id = ? AND trip_id = ? AND destination_id = ?`,
    )
    .get(userId, tripId, destId) as Record<string, unknown> | undefined;
  const accRows = db
    .prepare(
      `SELECT id, name, address, check_in_date_time, check_out_date_time, costs_json, paid_int FROM ${tables.accommodations} WHERE trip_user_id = ? AND trip_id = ? AND destination_id = ?`,
    )
    .all(userId, tripId, destId) as Record<string, unknown>[];
  const actRows = db
    .prepare(
      `SELECT id, name, address, start_date_time, end_date_time, costs_json, paid_int FROM ${tables.activities} WHERE trip_user_id = ? AND trip_id = ? AND destination_id = ?`,
    )
    .all(userId, tripId, destId) as Record<string, unknown>[];
  const otherRows = db
    .prepare(
      `SELECT id, label, costs_json, paid_int FROM ${tables.customBudgetItems} WHERE trip_user_id = ? AND trip_id = ? AND destination_id = ? ORDER BY rowid`,
    )
    .all(userId, tripId, destId) as Record<string, unknown>[];
  let timeZone = str(row, "time_zone") ?? undefined;
  const dest: Record<string, unknown> = {
    id: destId,
    name: row.name,
    displayName: row.display_name,
    nights: parseNights(row.nights),
    arrivalDate: row.arrival_date,
    arrivalTime: row.arrival_time,
    departureDate: row.departure_date,
    accommodations: accRows.map((a) => ({
      id: a.id,
      name: a.name,
      address: a.address,
      checkInDateTime: a.check_in_date_time,
      checkOutDateTime: a.check_out_date_time,
      costs: json(a, "costs_json"),
      paid: intBool(a.paid_int),
    })),
    activities: actRows.map((a) => ({
      id: a.id,
      name: a.name,
      address: a.address,
      startDateTime: a.start_date_time,
      endDateTime: a.end_date_time,
      costs: json(a, "costs_json"),
      paid: intBool(a.paid_int),
    })),
    destinationCurrency: json(row, "destination_currency_json"),
    customBudgetItems: otherRows.map((o) => ({
      id: o.id,
      label: o.label,
      costs: json(o, "costs_json"),
      paid: intBool(o.paid_int) === true,
    })),
  };
  if (pd) {
    const lat = num(pd, "lat");
    const lng = num(pd, "lng");
    if (!timeZone && lat != null && lng != null) {
      try {
        timeZone = tzlookup(lng, lat);
      } catch {
        timeZone = undefined;
      }
    }
    dest.placeDetails = {
      osmId: pd.osm_id,
      osmType: pd.osm_type,
      placeType: pd.place_type,
      coordinates: lat != null && lng != null ? [lat, lng] : undefined,
      city: str(pd, "city"),
      state: str(pd, "state"),
      country: str(pd, "country"),
      countryCode: str(pd, "country_code"),
      extent:
        num(pd, "extent_min_x") != null &&
        num(pd, "extent_min_y") != null &&
        num(pd, "extent_max_x") != null &&
        num(pd, "extent_max_y") != null
          ? [num(pd, "extent_min_x")!, num(pd, "extent_min_y")!, num(pd, "extent_max_x")!, num(pd, "extent_max_y")!]
          : undefined,
    };
    if (timeZone) {
      dest.timeZone = timeZone;
    }
  } else if (timeZone) {
    dest.timeZone = timeZone;
  }
  if (td) {
    dest.transportDetails = {
      mode: td.mode,
      departureLocation: td.departure_location,
      arrivalLocation: td.arrival_location,
      bookingNumber: td.booking_number,
      departureDateTime: td.departure_date_time,
      arrivalDateTime: td.arrival_date_time,
      costs: json(td, "costs_json"),
      paid: intBool(td.paid_int),
    };
  }
  if (wd) {
    dest.weatherDetails = {
      temperature: wd.temperature,
      condition: wd.condition,
      weatherCode: wd.weather_code,
      latitude: wd.latitude,
      longitude: wd.longitude,
      dateTime: wd.date_time,
    };
  }
  return dest;
}

export function insertTrip(tables: TableSet, userId: string, body: Record<string, unknown>, options: InsertTripOptions = {}): void {
  const id = typeof body.id === "string" ? body.id : "";
  const name = typeof body.name === "string" ? body.name : null;
  const start_date = body.startDate != null ? String(body.startDate) : null;
  const end_date = body.endDate != null ? String(body.endDate) : null;
  const created_at = body.createdAt != null ? String(body.createdAt) : null;
  const updated_at = body.updatedAt != null ? String(body.updatedAt) : null;
  db.prepare(
    `INSERT INTO ${tables.trips} (user_id, id, name, start_date, end_date, created_at, updated_at, is_shared) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(userId, id, name, start_date, end_date, created_at, updated_at, options.isShared === true ? 1 : 0);
  const destinations = (body.destinations as Record<string, unknown>[]) ?? [];
  destinations.forEach((d, idx) => insertDestination(tables, userId, id, d, idx));
}

function insertDestination(
  tables: TableSet,
  userId: string,
  tripId: string,
  d: Record<string, unknown>,
  sortOrder: number,
): void {
  const id = typeof d.id === "string" ? d.id : "";
  db.prepare(
    `INSERT INTO ${tables.destinations} (trip_user_id, trip_id, id, name, display_name, nights, arrival_date, arrival_time, departure_date, sort_order, destination_currency_json, time_zone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    userId,
    tripId,
    id,
    d.name != null ? String(d.name) : null,
    d.displayName != null ? String(d.displayName) : null,
    d.nights != null ? String(d.nights) : null,
    d.arrivalDate != null ? String(d.arrivalDate) : null,
    d.arrivalTime != null ? String(d.arrivalTime) : null,
    d.departureDate != null ? String(d.departureDate) : null,
    sortOrder,
    jsonStr((d as { destinationCurrency?: unknown }).destinationCurrency),
    d.timeZone != null ? String(d.timeZone) : null,
  );
  const pd = d.placeDetails as Record<string, unknown> | undefined;
  if (pd) {
    const coords = pd.coordinates as [number, number] | undefined;
    const ext = pd.extent as [number, number, number, number] | undefined;
    db.prepare(
      `INSERT INTO ${tables.placeDetails} (trip_user_id, trip_id, destination_id, osm_id, osm_type, place_type, lat, lng, city, state, country, country_code, extent_min_x, extent_min_y, extent_max_x, extent_max_y) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      userId,
      tripId,
      id,
      pd.osmId != null ? Number(pd.osmId) : null,
      str(pd, "osmType"),
      str(pd, "placeType"),
      coords?.[0] ?? null,
      coords?.[1] ?? null,
      str(pd, "city"),
      str(pd, "state"),
      str(pd, "country"),
      str(pd, "countryCode"),
      ext?.[0] ?? null,
      ext?.[1] ?? null,
      ext?.[2] ?? null,
      ext?.[3] ?? null,
    );
  }
  const td = d.transportDetails as Record<string, unknown> | undefined;
  if (td) {
    db.prepare(
      `INSERT INTO ${tables.transportDetails} (trip_user_id, trip_id, destination_id, mode, departure_location, arrival_location, booking_number, departure_date_time, arrival_date_time, costs_json, paid_int) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      userId,
      tripId,
      id,
      str(td, "mode"),
      str(td, "departureLocation"),
      str(td, "arrivalLocation"),
      str(td, "bookingNumber"),
      td.departureDateTime != null ? String(td.departureDateTime) : null,
      td.arrivalDateTime != null ? String(td.arrivalDateTime) : null,
      jsonStr((td as { costs?: unknown }).costs),
      boolInt((td as { paid?: unknown }).paid),
    );
  }
  const wd = d.weatherDetails as Record<string, unknown> | undefined;
  if (wd) {
    db.prepare(
      `INSERT INTO ${tables.weatherDetails} (trip_user_id, trip_id, destination_id, temperature, condition, weather_code, latitude, longitude, date_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      userId,
      tripId,
      id,
      wd.temperature != null ? Number(wd.temperature) : null,
      str(wd, "condition"),
      wd.weatherCode != null ? Number(wd.weatherCode) : null,
      wd.latitude != null ? Number(wd.latitude) : null,
      wd.longitude != null ? Number(wd.longitude) : null,
      wd.dateTime != null ? String(wd.dateTime) : null,
    );
  }
  ((d.accommodations as Record<string, unknown>[]) ?? []).forEach((a) => {
    const aid = typeof a.id === "string" ? a.id : "";
    db.prepare(
      `INSERT INTO ${tables.accommodations} (trip_user_id, trip_id, destination_id, id, name, address, check_in_date_time, check_out_date_time, costs_json, paid_int) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      userId,
      tripId,
      id,
      aid,
      a.name != null ? String(a.name) : null,
      a.address != null ? String(a.address) : null,
      a.checkInDateTime != null ? String(a.checkInDateTime) : null,
      a.checkOutDateTime != null ? String(a.checkOutDateTime) : null,
      jsonStr((a as { costs?: unknown }).costs),
      boolInt((a as { paid?: unknown }).paid),
    );
  });
  ((d.activities as Record<string, unknown>[]) ?? []).forEach((a) => {
    const aid = typeof a.id === "string" ? a.id : "";
    db.prepare(
      `INSERT INTO ${tables.activities} (trip_user_id, trip_id, destination_id, id, name, address, start_date_time, end_date_time, costs_json, paid_int) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      userId,
      tripId,
      id,
      aid,
      a.name != null ? String(a.name) : null,
      a.address != null ? String(a.address) : null,
      a.startDateTime != null ? String(a.startDateTime) : null,
      a.endDateTime != null ? String(a.endDateTime) : null,
      jsonStr((a as { costs?: unknown }).costs),
      boolInt((a as { paid?: unknown }).paid),
    );
  });

  ((d.customBudgetItems as Record<string, unknown>[]) ?? []).forEach((o) => {
    const oid = typeof o.id === "string" ? o.id : "";
    if (!oid) return;
    db.prepare(
      `INSERT INTO ${tables.customBudgetItems} (trip_user_id, trip_id, destination_id, id, label, costs_json, paid_int) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      userId,
      tripId,
      id,
      oid,
      (o as { label?: unknown }).label != null ? String((o as { label?: unknown }).label) : null,
      jsonStr((o as { costs?: unknown }).costs),
      boolInt((o as { paid?: unknown }).paid),
    );
  });
}

export function updateTrip(
  tables: TableSet,
  userId: string,
  tripId: string,
  body: Record<string, unknown>,
  sharedOnly = false,
): void {
  const row = db
    .prepare(`SELECT * FROM ${tables.trips} WHERE user_id = ? AND id = ? AND is_shared = ${sharedOnly ? 1 : 0}`)
    .get(userId, tripId) as Record<string, unknown> | undefined;
  if (!row) return;
  const name = body.name !== undefined ? (typeof body.name === "string" ? body.name : String(row.name)) : (row.name as string);
  const start_date = body.startDate !== undefined ? String(body.startDate) : (row.start_date as string);
  const end_date = body.endDate !== undefined ? String(body.endDate) : (row.end_date as string);
  const updated_at = body.updatedAt != null ? String(body.updatedAt) : new Date().toISOString();
  db.prepare(
    `UPDATE ${tables.trips} SET name = ?, start_date = ?, end_date = ?, updated_at = ? WHERE user_id = ? AND id = ? AND is_shared = ${sharedOnly ? 1 : 0}`,
  ).run(name, start_date, end_date, updated_at, userId, tripId);
  db.prepare(`DELETE FROM ${tables.destinations} WHERE trip_user_id = ? AND trip_id = ?`).run(userId, tripId);
  const destinations = (body.destinations as Record<string, unknown>[]) ?? [];
  destinations.forEach((d, idx) => insertDestination(tables, userId, tripId, d, idx));
}

export function updateTripById(tables: TableSet, tripId: string, body: Record<string, unknown>, sharedOnly = false): void {
  const row = db.prepare(`SELECT user_id FROM ${tables.trips} WHERE id = ? AND is_shared = ${sharedOnly ? 1 : 0}`).get(tripId) as
    | Record<string, unknown>
    | undefined;
  if (!row) return;
  updateTrip(tables, uid(row, "user_id"), tripId, body, sharedOnly);
}

export function deleteTrip(tables: TableSet, userId: string, tripId: string, sharedOnly = false): number {
  const result = db.prepare(`DELETE FROM ${tables.trips} WHERE user_id = ? AND id = ? AND is_shared = ${sharedOnly ? 1 : 0}`).run(userId, tripId);
  return result.changes;
}
