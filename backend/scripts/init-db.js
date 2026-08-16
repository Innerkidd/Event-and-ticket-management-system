require('dotenv').config();

const bcrypt = require('bcrypt');

const pool = require('../src/config/db');

const CREATE_EVENTS_TABLE = `
  CREATE TABLE IF NOT EXISTS events (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(255)   NOT NULL,
    description   TEXT,
    start_date    TIMESTAMP      NOT NULL,
    end_date      TIMESTAMP,
    venue         VARCHAR(255),
    image         VARCHAR(500),
    ticket_price  NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total_tickets INTEGER        NOT NULL DEFAULT 0,
    status        VARCHAR(20)    NOT NULL DEFAULT 'DRAFT'
                  CHECK (status IN ('DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED')),
    created_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW()
  );
`;

const CREATE_USERS_TABLE = `
  CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(255)   NOT NULL,
    email         VARCHAR(255)   UNIQUE NOT NULL,
    password_hash TEXT           NOT NULL,
    role          VARCHAR(20)    NOT NULL DEFAULT 'ATTENDEE'
                  CHECK (role IN ('ADMIN', 'ORGANIZER', 'ATTENDEE')),
    google_id     VARCHAR(255)   UNIQUE,
    created_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW()
  );
`;

const ADD_GOOGLE_ID_COLUMN = `
  ALTER TABLE users
    ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;
`;

const ADD_EVENTS_ORGANIZER_ID_COLUMN = `
  ALTER TABLE events
    ADD COLUMN IF NOT EXISTS organizer_id INTEGER REFERENCES users(id);
`;

const CREATE_ORGANIZER_APPLICATIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS organizer_applications (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name       VARCHAR(255)   NOT NULL,
    email           VARCHAR(255)   NOT NULL,
    phone           VARCHAR(50),
    organization    VARCHAR(255),
    experience      TEXT,
    reason          TEXT,
    linkedin_url    VARCHAR(500),
    social_media_url VARCHAR(500),
    portfolio_url   VARCHAR(500),
    document_url    VARCHAR(500),
    status          VARCHAR(20)    NOT NULL DEFAULT 'PENDING'
                    CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    admin_remarks   TEXT,
    created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW()
  );
`;

const CREATE_BOOKINGS_TABLE = `
  CREATE TABLE IF NOT EXISTS bookings (
    id           SERIAL PRIMARY KEY,
    user_id      INTEGER        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id     INTEGER        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    quantity     INTEGER        NOT NULL DEFAULT 1,
    unit_price   NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    status       VARCHAR(20)    NOT NULL DEFAULT 'PENDING'
                 CHECK (status IN ('PENDING', 'CONFIRMED', 'CANCELLED')),
    created_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW()
  );
`;

const CREATE_PAYMENTS_TABLE = `
  CREATE TABLE IF NOT EXISTS payments (
    id                  SERIAL PRIMARY KEY,
    booking_id          INTEGER        NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    razorpay_order_id   VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    razorpay_signature  VARCHAR(500),
    amount              NUMERIC(10, 2) NOT NULL DEFAULT 0,
    status              VARCHAR(20)    NOT NULL DEFAULT 'PENDING'
                        CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED')),
    method              VARCHAR(20)    NOT NULL DEFAULT 'OTHER'
                        CHECK (method IN ('CARD', 'UPI', 'NETBANKING', 'OTHER')),
    created_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    paid_at             TIMESTAMPTZ
  );
`;

const SEED_EVENTS = [
  {
    name: 'AI Workshop',
    description: 'Hands-on workshop covering the fundamentals of AI and machine learning.',
    start_date: '2026-08-25 09:00:00',
    end_date: '2026-08-25 13:00:00',
    venue: 'Lab 3, CS Block',
    image: '/uploads/events/ai-workshop.jpg',
    ticket_price: 150,
    total_tickets: 100,
    status: 'PUBLISHED',
  },
  {
    name: 'TechFest 2026',
    description: 'Annual technical festival with competitions, exhibits and guest talks.',
    start_date: '2026-09-20 10:00:00',
    end_date: '2026-09-20 18:00:00',
    venue: 'GCET Auditorium',
    image: '/uploads/events/techfest.jpg',
    ticket_price: 200,
    total_tickets: 500,
    status: 'PUBLISHED',
  },
  {
    name: 'Startup Summit',
    description: 'A day-long summit with founders, investors and startup showcases.',
    start_date: '2026-10-05 09:00:00',
    end_date: '2026-10-05 17:00:00',
    venue: 'Main Conference Hall',
    image: '/uploads/events/startup-summit.jpg',
    ticket_price: 500,
    total_tickets: 300,
    status: 'PUBLISHED',
  },
  {
    name: 'Web Development Bootcamp',
    description: 'Full-stack web development bootcamp for beginners.',
    start_date: '2026-11-15 09:00:00',
    end_date: '2026-11-17 17:00:00',
    venue: 'Seminar Hall B',
    image: '/uploads/events/web-bootcamp.jpg',
    ticket_price: 250,
    total_tickets: 150,
    status: 'DRAFT',
  },
  {
    name: 'Hackathon 2026',
    description: '24-hour hackathon for student teams.',
    start_date: '2026-09-01 09:00:00',
    end_date: '2026-09-02 09:00:00',
    venue: 'Innovation Center',
    image: '/uploads/events/hackathon.jpg',
    ticket_price: 100,
    total_tickets: 200,
    status: 'CANCELLED',
  },
  {
    name: 'Community Meetup',
    description: 'A past meetup used to verify past/completed events are excluded.',
    start_date: '2026-07-10 17:00:00',
    end_date: '2026-07-10 20:00:00',
    venue: 'Library Lounge',
    image: '/uploads/events/meetup.jpg',
    ticket_price: 0,
    total_tickets: 80,
    status: 'COMPLETED',
  },
];

const SEED_USERS = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'Admin@123',
    role: 'ADMIN',
  },
  {
    name: 'Organizer User',
    email: 'organizer@example.com',
    password: 'Organizer@123',
    role: 'ORGANIZER',
  },
];

async function init() {
  try {
    await pool.query(CREATE_EVENTS_TABLE);
    console.log('Table "events" is ready.');

    const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM events');
    if (rows[0].count > 0) {
      console.log(`Table already has ${rows[0].count} row(s). Skipping seed.`);
    } else {
      for (const event of SEED_EVENTS) {
        await pool.query(
          `INSERT INTO events
             (name, description, start_date, end_date, venue, image, ticket_price, total_tickets, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            event.name,
            event.description,
            event.start_date,
            event.end_date,
            event.venue,
            event.image,
            event.ticket_price,
            event.total_tickets,
            event.status,
          ]
        );
      }
      console.log(`Seeded ${SEED_EVENTS.length} test events.`);
    }

    await pool.query(CREATE_USERS_TABLE);
    console.log('Table "users" is ready.');

    await pool.query(ADD_GOOGLE_ID_COLUMN);
    console.log('Column "users.google_id" is ready.');

    await pool.query(ADD_EVENTS_ORGANIZER_ID_COLUMN);
    console.log('Column "events.organizer_id" is ready.');

    await pool.query(CREATE_ORGANIZER_APPLICATIONS_TABLE);
    console.log('Table "organizer_applications" is ready.');

    await pool.query(CREATE_BOOKINGS_TABLE);
    console.log('Table "bookings" is ready.');

    await pool.query(CREATE_PAYMENTS_TABLE);
    console.log('Table "payments" is ready.');

    for (const user of SEED_USERS) {
      const exists = await pool.query('SELECT 1 FROM users WHERE email = $1', [user.email]);
      if (exists.rowCount > 0) {
        console.log(`Seed user ${user.email} already exists. Skipping.`);
        continue;
      }
      const passwordHash = await bcrypt.hash(user.password, 10);
      await pool.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, $4)`,
        [user.name, user.email, passwordHash, user.role]
      );
      console.log(`Seeded user ${user.email} (${user.role}).`);
    }
  } catch (error) {
    console.error('Database init failed:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

init();