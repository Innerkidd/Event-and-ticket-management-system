const pool = require('../config/db');

const EVENT_COLUMNS = `
  id,
  name,
  description,
  start_date,
  end_date,
  venue,
  image,
  ticket_price,
  total_tickets,
  total_tickets AS available_tickets
`;

async function findUpcomingPublished() {
  const { rows } = await pool.query(
    `SELECT ${EVENT_COLUMNS}
     FROM events
     WHERE status = 'PUBLISHED'
       AND start_date > NOW()
     ORDER BY start_date ASC`
  );

  return rows;
}

module.exports = {
  findUpcomingPublished,
};