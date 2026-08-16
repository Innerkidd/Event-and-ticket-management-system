const pool = require('../config/db');

async function listBookings({ search, eventId, organizer, status, from, to, page, limit }) {
  const conditions = [];
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    conditions.push(
      `(u.name ILIKE $${params.length} OR u.email ILIKE $${params.length} OR e.name ILIKE $${params.length})`
    );
  }
  if (eventId) {
    params.push(Number(eventId));
    conditions.push(`b.event_id = $${params.length}`);
  }
  if (organizer) {
    params.push(`%${organizer}%`);
    conditions.push(`(org.name ILIKE $${params.length} OR org.email ILIKE $${params.length})`);
  }
  if (status) {
    params.push(status);
    conditions.push(`b.status = $${params.length}`);
  }
  if (from) {
    params.push(from);
    conditions.push(`b.created_at >= $${params.length}::timestamp`);
  }
  if (to) {
    params.push(to);
    conditions.push(`b.created_at <= $${params.length}::timestamp`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (page - 1) * limit;
  params.push(limit, offset);

  const baseFrom = `
    bookings b
    JOIN users u ON u.id = b.user_id
    JOIN events e ON e.id = b.event_id
    LEFT JOIN users org ON org.id = e.organizer_id
  `;

  const [list, count, summary] = await Promise.all([
    pool.query(
      `SELECT
         b.id, b.quantity, b.unit_price, b.total_amount, b.status, b.created_at,
         u.name AS attendee_name, u.email AS attendee_email,
         e.name AS event_name,
         org.name AS organizer_name
       FROM ${baseFrom}
       ${whereClause}
       ORDER BY b.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    ),
    pool.query(
      `SELECT COUNT(*)::int AS total
       FROM ${baseFrom}
       ${whereClause}`,
      params.slice(0, -2)
    ),
    pool.query(
      `SELECT
         COUNT(*)::int AS total_bookings,
         COALESCE(SUM(quantity), 0)::int AS tickets_sold,
         COUNT(*) FILTER (WHERE status = 'CONFIRMED')::int AS confirmed_bookings,
         COUNT(*) FILTER (WHERE status = 'CANCELLED')::int AS cancelled_bookings
       FROM bookings`
    ),
  ]);

  return {
    bookings: list.rows,
    total: count.rows[0].total,
    summary: {
      totalBookings: summary.rows[0].total_bookings,
      ticketsSold: summary.rows[0].tickets_sold,
      confirmedBookings: summary.rows[0].confirmed_bookings,
      cancelledBookings: summary.rows[0].cancelled_bookings,
    },
  };
}

async function findById(id) {
  const { rows } = await pool.query(
    `SELECT
       b.id, b.quantity, b.unit_price, b.total_amount, b.status, b.created_at, b.updated_at,
       u.id AS attendee_id, u.name AS attendee_name, u.email AS attendee_email,
       e.id AS event_id, e.name AS event_name,
       org.id AS organizer_id, org.name AS organizer_name
     FROM bookings b
     JOIN users u ON u.id = b.user_id
     JOIN events e ON e.id = b.event_id
     LEFT JOIN users org ON org.id = e.organizer_id
     WHERE b.id = $1`,
    [id]
  );

  return rows[0] || null;
}

module.exports = {
  listBookings,
  findById,
};