const pool = require('../config/db');

async function listPayments({ type, status, search, from, to, page, limit }) {
  const conditions = [];
  const params = [];

  if (type) {
    params.push(type);
    conditions.push(`p.method = $${params.length}`);
  }
  if (status) {
    params.push(status);
    conditions.push(`p.status = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    conditions.push(
      `(u.name ILIKE $${params.length} OR u.email ILIKE $${params.length} OR e.name ILIKE $${params.length})`
    );
  }
  if (from) {
    params.push(from);
    conditions.push(`p.created_at >= $${params.length}::timestamp`);
  }
  if (to) {
    params.push(to);
    conditions.push(`p.created_at <= $${params.length}::timestamp`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (page - 1) * limit;
  params.push(limit, offset);

  const baseFrom = `
    payments p
    JOIN bookings b ON b.id = p.booking_id
    JOIN users u ON u.id = b.user_id
    JOIN events e ON e.id = b.event_id
  `;

  const [list, count] = await Promise.all([
    pool.query(
      `SELECT
         p.id, p.booking_id, p.amount, p.method, p.status, p.created_at, p.paid_at,
         u.name AS attendee_name, u.email AS attendee_email,
         e.name AS event_name
       FROM ${baseFrom}
       ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    ),
    pool.query(
      `SELECT COUNT(*)::int AS total
       FROM ${baseFrom}
       ${whereClause}`,
      params.slice(0, -2)
    ),
  ]);

  return { payments: list.rows, total: count.rows[0].total };
}

async function findById(id) {
  const { rows } = await pool.query(
    `SELECT
       p.id, p.booking_id, p.razorpay_order_id, p.razorpay_payment_id,
       p.amount, p.method, p.status, p.created_at, p.paid_at,
       u.name AS attendee_name, u.email AS attendee_email,
       e.id AS event_id, e.name AS event_name
     FROM payments p
     JOIN bookings b ON b.id = p.booking_id
     JOIN users u ON u.id = b.user_id
     JOIN events e ON e.id = b.event_id
     WHERE p.id = $1`,
    [id]
  );

  return rows[0] || null;
}

module.exports = {
  listPayments,
  findById,
};