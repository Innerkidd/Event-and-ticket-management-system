-- Organizer platform-fee payment support on payments
ALTER TABLE payments ALTER COLUMN booking_id DROP NOT NULL;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS event_id INTEGER REFERENCES events(id) ON DELETE CASCADE;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS type VARCHAR(30) NOT NULL DEFAULT 'TICKET_PAYMENT';

-- Staff management (organizer-assigned)
CREATE TABLE IF NOT EXISTS staff (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  email       VARCHAR(255) NOT NULL,
  phone       VARCHAR(50),
  role        VARCHAR(30) NOT NULL DEFAULT 'SUPPORT'
              CHECK (role IN ('REGISTRATION', 'CHECK_IN', 'EVENT_COORDINATOR', 'SUPPORT')),
  status      VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
              CHECK (status IN ('ACTIVE', 'INACTIVE')),
  event_id    INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_event ON staff(event_id);

-- Attendance check-in records
CREATE TABLE IF NOT EXISTS attendance (
  id             SERIAL PRIMARY KEY,
  booking_id     INTEGER NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  event_id       INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  checked_in_by  INTEGER REFERENCES users(id),
  status         VARCHAR(20) NOT NULL DEFAULT 'NOT_CHECKED_IN'
                 CHECK (status IN ('CHECKED_IN', 'NOT_CHECKED_IN')),
  checked_in_at  TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attendance_event ON attendance(event_id);
CREATE INDEX IF NOT EXISTS idx_attendance_booking ON attendance(booking_id);