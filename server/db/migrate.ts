import { db } from "../db.js";

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
    PRIMARY KEY (user_id, id)
  )
`);

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

console.log("migration complete");
