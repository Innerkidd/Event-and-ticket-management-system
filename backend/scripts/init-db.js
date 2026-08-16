require('dotenv').config();

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

async function init() {
  try {
    await pool.query(CREATE_EVENTS_TABLE);
    console.log('Table "events" is ready.');

    const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM events');
    if (rows[0].count > 0) {
      console.log(`Table already has ${rows[0].count} row(s). Skipping seed.`);
      return;
    }

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
  } catch (error) {
    console.error('Database init failed:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

init();