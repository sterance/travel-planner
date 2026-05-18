import { db } from "../db.js";

function tryExec(sql: string): void {
  try {
    db.exec(sql);
  } catch {
    // ignore (typically: column already exists)
  }
}

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS trips (
    user_id TEXT NOT NULL REFERENCES users(id),
    id TEXT NOT NULL,
    name TEXT,
    start_date TEXT,
    end_date TEXT,
    created_at TEXT,
    updated_at TEXT,
    is_shared INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, id)
  )
`);

tryExec(`ALTER TABLE trips ADD COLUMN is_shared INTEGER NOT NULL DEFAULT 0`);

db.exec(`
  CREATE TABLE IF NOT EXISTS destinations (
    trip_user_id TEXT NOT NULL,
    trip_id TEXT NOT NULL,
    id TEXT NOT NULL,
    name TEXT,
    display_name TEXT,
    nights TEXT,
    arrival_date TEXT,
    arrival_time TEXT,
    departure_date TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (trip_user_id, trip_id, id),
    FOREIGN KEY (trip_user_id, trip_id) REFERENCES trips(user_id, id) ON DELETE CASCADE
  )
`);

tryExec(`ALTER TABLE destinations ADD COLUMN destination_currency_json TEXT`);
tryExec(`ALTER TABLE destinations ADD COLUMN time_zone TEXT`);

db.exec(`
  CREATE TABLE IF NOT EXISTS place_details (
    trip_user_id TEXT NOT NULL,
    trip_id TEXT NOT NULL,
    destination_id TEXT NOT NULL,
    osm_id INTEGER,
    osm_type TEXT,
    place_type TEXT,
    lat REAL,
    lng REAL,
    city TEXT,
    state TEXT,
    country TEXT,
    country_code TEXT,
    extent_min_x REAL,
    extent_min_y REAL,
    extent_max_x REAL,
    extent_max_y REAL,
    PRIMARY KEY (trip_user_id, trip_id, destination_id),
    FOREIGN KEY (trip_user_id, trip_id, destination_id) REFERENCES destinations(trip_user_id, trip_id, id) ON DELETE CASCADE
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS transport_details (
    trip_user_id TEXT NOT NULL,
    trip_id TEXT NOT NULL,
    destination_id TEXT NOT NULL,
    mode TEXT,
    departure_location TEXT,
    arrival_location TEXT,
    booking_number TEXT,
    departure_date_time TEXT,
    arrival_date_time TEXT,
    PRIMARY KEY (trip_user_id, trip_id, destination_id),
    FOREIGN KEY (trip_user_id, trip_id, destination_id) REFERENCES destinations(trip_user_id, trip_id, id) ON DELETE CASCADE
  )
`);

tryExec(`ALTER TABLE transport_details ADD COLUMN costs_json TEXT`);
tryExec(`ALTER TABLE transport_details ADD COLUMN paid_int INTEGER`);

db.exec(`
  CREATE TABLE IF NOT EXISTS weather_details (
    trip_user_id TEXT NOT NULL,
    trip_id TEXT NOT NULL,
    destination_id TEXT NOT NULL,
    temperature REAL,
    condition TEXT,
    weather_code INTEGER,
    latitude REAL,
    longitude REAL,
    date_time TEXT,
    PRIMARY KEY (trip_user_id, trip_id, destination_id),
    FOREIGN KEY (trip_user_id, trip_id, destination_id) REFERENCES destinations(trip_user_id, trip_id, id) ON DELETE CASCADE
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS accommodations (
    trip_user_id TEXT NOT NULL,
    trip_id TEXT NOT NULL,
    destination_id TEXT NOT NULL,
    id TEXT NOT NULL,
    name TEXT,
    address TEXT,
    check_in_date_time TEXT,
    check_out_date_time TEXT,
    PRIMARY KEY (trip_user_id, trip_id, destination_id, id),
    FOREIGN KEY (trip_user_id, trip_id, destination_id) REFERENCES destinations(trip_user_id, trip_id, id) ON DELETE CASCADE
  )
`);

tryExec(`ALTER TABLE accommodations ADD COLUMN costs_json TEXT`);
tryExec(`ALTER TABLE accommodations ADD COLUMN paid_int INTEGER`);

db.exec(`
  CREATE TABLE IF NOT EXISTS activities (
    trip_user_id TEXT NOT NULL,
    trip_id TEXT NOT NULL,
    destination_id TEXT NOT NULL,
    id TEXT NOT NULL,
    name TEXT,
    address TEXT,
    start_date_time TEXT,
    end_date_time TEXT,
    PRIMARY KEY (trip_user_id, trip_id, destination_id, id),
    FOREIGN KEY (trip_user_id, trip_id, destination_id) REFERENCES destinations(trip_user_id, trip_id, id) ON DELETE CASCADE
  )
`);

tryExec(`ALTER TABLE activities ADD COLUMN costs_json TEXT`);
tryExec(`ALTER TABLE activities ADD COLUMN paid_int INTEGER`);

db.exec(`
  CREATE TABLE IF NOT EXISTS custom_budget_items (
    trip_user_id TEXT NOT NULL,
    trip_id TEXT NOT NULL,
    destination_id TEXT NOT NULL,
    id TEXT NOT NULL,
    label TEXT,
    costs_json TEXT,
    paid_int INTEGER,
    PRIMARY KEY (trip_user_id, trip_id, destination_id, id),
    FOREIGN KEY (trip_user_id, trip_id, destination_id) REFERENCES destinations(trip_user_id, trip_id, id) ON DELETE CASCADE
  )
`);

function migrateLegacySharedTrips(): void {
  const legacySharedTrips = db
    .prepare(`SELECT 1 AS present FROM sqlite_master WHERE type = 'table' AND name = 'shared_trips'`)
    .get() as Record<string, unknown> | undefined;
  if (!legacySharedTrips) return;

  db.exec(`BEGIN IMMEDIATE`);
  try {
    db.exec(`
      INSERT OR IGNORE INTO trips (user_id, id, name, start_date, end_date, created_at, updated_at, is_shared)
      SELECT user_id, id, name, start_date, end_date, created_at, updated_at, 1 FROM shared_trips;

      INSERT OR IGNORE INTO destinations (
        trip_user_id, trip_id, id, name, display_name, nights, arrival_date, arrival_time, departure_date, sort_order, destination_currency_json, time_zone
      )
      SELECT
        trip_user_id, trip_id, id, name, display_name, nights, arrival_date, arrival_time, departure_date, sort_order, destination_currency_json, time_zone
      FROM shared_destinations;

      INSERT OR IGNORE INTO place_details (
        trip_user_id, trip_id, destination_id, osm_id, osm_type, place_type, lat, lng, city, state, country, country_code, extent_min_x, extent_min_y, extent_max_x, extent_max_y
      )
      SELECT
        trip_user_id, trip_id, destination_id, osm_id, osm_type, place_type, lat, lng, city, state, country, country_code, extent_min_x, extent_min_y, extent_max_x, extent_max_y
      FROM shared_place_details;

      INSERT OR IGNORE INTO transport_details (
        trip_user_id, trip_id, destination_id, mode, departure_location, arrival_location, booking_number, departure_date_time, arrival_date_time, costs_json, paid_int
      )
      SELECT
        trip_user_id, trip_id, destination_id, mode, departure_location, arrival_location, booking_number, departure_date_time, arrival_date_time, costs_json, paid_int
      FROM shared_transport_details;

      INSERT OR IGNORE INTO weather_details (
        trip_user_id, trip_id, destination_id, temperature, condition, weather_code, latitude, longitude, date_time
      )
      SELECT
        trip_user_id, trip_id, destination_id, temperature, condition, weather_code, latitude, longitude, date_time
      FROM shared_weather_details;

      INSERT OR IGNORE INTO accommodations (
        trip_user_id, trip_id, destination_id, id, name, address, check_in_date_time, check_out_date_time, costs_json, paid_int
      )
      SELECT
        trip_user_id, trip_id, destination_id, id, name, address, check_in_date_time, check_out_date_time, costs_json, paid_int
      FROM shared_accommodations;

      INSERT OR IGNORE INTO activities (
        trip_user_id, trip_id, destination_id, id, name, address, start_date_time, end_date_time, costs_json, paid_int
      )
      SELECT
        trip_user_id, trip_id, destination_id, id, name, address, start_date_time, end_date_time, costs_json, paid_int
      FROM shared_activities;

      INSERT OR IGNORE INTO custom_budget_items (
        trip_user_id, trip_id, destination_id, id, label, costs_json, paid_int
      )
      SELECT
        trip_user_id, trip_id, destination_id, id, label, costs_json, paid_int
      FROM shared_custom_budget_items;

      DROP TABLE IF EXISTS shared_custom_budget_items;
      DROP TABLE IF EXISTS shared_activities;
      DROP TABLE IF EXISTS shared_accommodations;
      DROP TABLE IF EXISTS shared_weather_details;
      DROP TABLE IF EXISTS shared_transport_details;
      DROP TABLE IF EXISTS shared_place_details;
      DROP TABLE IF EXISTS shared_destinations;
      DROP TABLE IF EXISTS shared_trips;
    `);
    db.exec(`COMMIT`);
  } catch (err) {
    try {
      db.exec(`ROLLBACK`);
    } catch {
      // ignore rollback errors
    }
    throw err;
  }
}

migrateLegacySharedTrips();

console.log("migration complete");
