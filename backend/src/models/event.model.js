const pool = require('../config/db');

const EVENT_COLUMNS = `
  e.id,
  e.name,
  e.description,
  e.start_date,
  e.end_date,
  e.venue,
  e.image,
  e.ticket_price,
  e.total_tickets,
  GREATEST(e.total_tickets - COALESCE(s.sold, 0), 0) AS available_tickets,
  COALESCE(s.sold, 0) AS sold_tickets
`;

const SOLD_JOIN = `
  LEFT JOIN LATERAL (
    SELECT COALESCE(SUM(quantity), 0)::int AS sold
    FROM bookings
    WHERE bookings.event_id = e.id AND bookings.status IN ('CONFIRMED', 'PENDING')
  ) s ON true
`;

async function findUpcomingPublished() {
  const { rows } = await pool.query(
    `SELECT ${EVENT_COLUMNS}
     FROM events e
     ${SOLD_JOIN}
     WHERE e.status = 'PUBLISHED'
       AND e.start_date > NOW()
     ORDER BY e.start_date ASC`
  );

  return rows;
}

async function findById(id) {
  const { rows } = await pool.query(
    `SELECT ${EVENT_COLUMNS}
     FROM events e
     ${SOLD_JOIN}
     WHERE e.id = $1`,
    [id]
  );

  return rows[0] || null;
}

module.exports = {
  findUpcomingPublished,
  findById,
};