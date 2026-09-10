/*
# Mine Collapse Monitoring System - Core Schema

## Purpose
Stores sensor data from ESP8266 mesh nodes deployed in a mine, computes collapse
predictions, and tracks zones that have already collapsed. This is a single-tenant
monitoring dashboard (no sign-in) so all policies allow anon + authenticated access.

## New Tables

### 1. nodes
Represents physical ESP8266 mesh nodes deployed in the mine.
- id (uuid, PK)
- node_id (text, unique) — the hardware identifier sent by the ESP8266 (e.g. "NODE-01")
- label (text) — human-readable name (e.g. "Tunnel A - Section 3")
- x (numeric) — X coordinate on the mine map grid
- y (numeric) — Y coordinate on the mine map grid
- zone (text) — mine zone/section identifier
- battery_pct (numeric) — battery level percentage (0-100)
- is_online (boolean) — whether the node is currently reporting
- last_seen (timestamptz) — last heartbeat timestamp
- created_at (timestamptz)

### 2. readings
Time-series sensor data from each node (MPU6050 accel/gyro + SW-420 vibration).
- id (uuid, PK)
- node_id (text) — references nodes.node_id (not FK to keep ingestion resilient)
- accel_x, accel_y, accel_z (numeric) — MPU6050 accelerometer values (m/s^2)
- gyro_x, gyro_y, gyro_z (numeric) — MPU6050 gyroscope values (deg/s)
- vibration (numeric) — SW-420 vibration intensity (analog 0-1023)
- tilt_angle (numeric) — computed tilt in degrees
- created_at (timestamptz)

### 3. predictions
Collapse risk predictions computed from sensor trends.
- id (uuid, PK)
- node_id (text) — which node the prediction relates to
- risk_level (text) — 'safe' | 'moderate' | 'high' | 'critical'
- risk_score (numeric) — 0-100 computed risk score
- confidence (numeric) — 0-100 model confidence
- summary (text) — human-readable explanation
- created_at (timestamptz)

### 4. collapsed_zones
Zones that have already collapsed (reported by mesh network).
- id (uuid, PK)
- zone (text, unique) — the zone identifier
- node_id (text) — node that reported the collapse
- collapsed_at (timestamptz) — when the collapse was detected
- severity (text) — 'partial' | 'full'
- notes (text)
- created_at (timestamptz)

## Security
- RLS enabled on all tables.
- All tables allow anon + authenticated full CRUD (single-tenant public monitoring app).
- USING (true) / WITH CHECK (true) is intentional: this dashboard is intentionally
  public/shared with no sign-in, matching the no-auth decision.
*/

-- nodes
CREATE TABLE IF NOT EXISTS nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id text UNIQUE NOT NULL,
  label text NOT NULL,
  x numeric NOT NULL DEFAULT 0,
  y numeric NOT NULL DEFAULT 0,
  zone text NOT NULL DEFAULT 'Unknown',
  battery_pct numeric NOT NULL DEFAULT 100,
  is_online boolean NOT NULL DEFAULT true,
  last_seen timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_nodes" ON nodes;
CREATE POLICY "anon_select_nodes" ON nodes FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_nodes" ON nodes;
CREATE POLICY "anon_insert_nodes" ON nodes FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_nodes" ON nodes;
CREATE POLICY "anon_update_nodes" ON nodes FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_nodes" ON nodes;
CREATE POLICY "anon_delete_nodes" ON nodes FOR DELETE
  TO anon, authenticated USING (true);

-- readings
CREATE TABLE IF NOT EXISTS readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id text NOT NULL,
  accel_x numeric DEFAULT 0,
  accel_y numeric DEFAULT 0,
  accel_z numeric DEFAULT 0,
  gyro_x numeric DEFAULT 0,
  gyro_y numeric DEFAULT 0,
  gyro_z numeric DEFAULT 0,
  vibration numeric DEFAULT 0,
  tilt_angle numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE readings ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_readings_node_time ON readings (node_id, created_at DESC);

DROP POLICY IF EXISTS "anon_select_readings" ON readings;
CREATE POLICY "anon_select_readings" ON readings FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_readings" ON readings;
CREATE POLICY "anon_insert_readings" ON readings FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_readings" ON readings;
CREATE POLICY "anon_update_readings" ON readings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_readings" ON readings;
CREATE POLICY "anon_delete_readings" ON readings FOR DELETE
  TO anon, authenticated USING (true);

-- predictions
CREATE TABLE IF NOT EXISTS predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id text NOT NULL,
  risk_level text NOT NULL DEFAULT 'safe',
  risk_score numeric NOT NULL DEFAULT 0,
  confidence numeric NOT NULL DEFAULT 0,
  summary text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_predictions_node_time ON predictions (node_id, created_at DESC);

DROP POLICY IF EXISTS "anon_select_predictions" ON predictions;
CREATE POLICY "anon_select_predictions" ON predictions FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_predictions" ON predictions;
CREATE POLICY "anon_insert_predictions" ON predictions FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_predictions" ON predictions;
CREATE POLICY "anon_update_predictions" ON predictions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_predictions" ON predictions;
CREATE POLICY "anon_delete_predictions" ON predictions FOR DELETE
  TO anon, authenticated USING (true);

-- collapsed_zones
CREATE TABLE IF NOT EXISTS collapsed_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone text UNIQUE NOT NULL,
  node_id text NOT NULL,
  collapsed_at timestamptz DEFAULT now(),
  severity text NOT NULL DEFAULT 'full',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE collapsed_zones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_collapsed" ON collapsed_zones;
CREATE POLICY "anon_select_collapsed" ON collapsed_zones FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_collapsed" ON collapsed_zones;
CREATE POLICY "anon_insert_collapsed" ON collapsed_zones FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_collapsed" ON collapsed_zones;
CREATE POLICY "anon_update_collapsed" ON collapsed_zones FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_collapsed" ON collapsed_zones;
CREATE POLICY "anon_delete_collapsed" ON collapsed_zones FOR DELETE
  TO anon, authenticated USING (true);