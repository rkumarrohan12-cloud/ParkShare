-- ParkShare database schema

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(120) NOT NULL,
  email           VARCHAR(160) UNIQUE NOT NULL,
  password_hash   TEXT NOT NULL,
  phone           VARCHAR(20),
  role            VARCHAR(10) NOT NULL CHECK (role IN ('DRIVER', 'OWNER', 'ADMIN')),
  status          VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS parking_spaces (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title           VARCHAR(160) NOT NULL,
  description     TEXT,
  address         VARCHAR(240) NOT NULL,
  city            VARCHAR(100) NOT NULL,
  latitude        DOUBLE PRECISION,
  longitude       DOUBLE PRECISION,
  price_per_hour  NUMERIC(10, 2) NOT NULL CHECK (price_per_hour > 0),
  vehicle_type    VARCHAR(30) NOT NULL,
  amenities       JSONB NOT NULL DEFAULT '[]',
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_parking_owner ON parking_spaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_parking_city ON parking_spaces(city);
CREATE INDEX IF NOT EXISTS idx_parking_vehicle_type ON parking_spaces(vehicle_type);
CREATE INDEX IF NOT EXISTS idx_parking_active ON parking_spaces(is_active);

CREATE TABLE IF NOT EXISTS bookings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parking_space_id  UUID NOT NULL REFERENCES parking_spaces(id) ON DELETE CASCADE,
  driver_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_time        TIMESTAMPTZ NOT NULL,
  end_time          TIMESTAMPTZ NOT NULL,
  total_amount      NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
  status            VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                      CHECK (status IN ('PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_bookings_parking ON bookings(parking_space_id);
CREATE INDEX IF NOT EXISTS idx_bookings_driver ON bookings(driver_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
-- Speeds up overlap checks against a given space
CREATE INDEX IF NOT EXISTS idx_bookings_space_time ON bookings(parking_space_id, start_time, end_time);

CREATE TABLE IF NOT EXISTS favorites (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parking_space_id  UUID NOT NULL REFERENCES parking_spaces(id) ON DELETE CASCADE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, parking_space_id)
);

CREATE TABLE IF NOT EXISTS payments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id        UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  amount            NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
  status            VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                      CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED')),
  payment_method    VARCHAR(30) NOT NULL DEFAULT 'SANDBOX',
  transaction_id    VARCHAR(60) UNIQUE NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);

CREATE TABLE IF NOT EXISTS gate_passes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id        UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  driver_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parking_space_id  UUID NOT NULL REFERENCES parking_spaces(id) ON DELETE CASCADE,
  pass_code         VARCHAR(20) UNIQUE NOT NULL,
  status            VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                      CHECK (status IN ('ACTIVE', 'USED', 'EXPIRED', 'CANCELLED')),
  valid_from        TIMESTAMPTZ NOT NULL,
  valid_until       TIMESTAMPTZ NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gate_passes_booking ON gate_passes(booking_id);
CREATE INDEX IF NOT EXISTS idx_gate_passes_driver ON gate_passes(driver_id);
