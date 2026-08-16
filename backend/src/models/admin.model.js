const pool = require('../config/db');

async function getDashboardStats() {
  const queries = {
    totalUsers: 'SELECT COUNT(*)::int AS count FROM users',
    totalOrganizers: "SELECT COUNT(*)::int AS count FROM users WHERE role = 'ORGANIZER'",
    publishedEvents: "SELECT COUNT(*)::int AS count FROM events WHERE status = 'PUBLISHED'",
    totalBookings: 'SELECT COUNT(*)::int AS count FROM bookings',
    pendingOrganizerApplications: "SELECT COUNT(*)::int AS count FROM organizer_applications WHERE status = 'PENDING'",
  };

  const results = {};
  for (const [key, sql] of Object.entries(queries)) {
    const { rows } = await pool.query(sql);
    results[key] = rows[0].count;
  }

  const recentEvents = await pool.query(
    `SELECT id, name, start_date, status
     FROM events
     ORDER BY start_date DESC
     LIMIT 5`
  );

  return { stats: results, recentEvents: recentEvents.rows };
}

function buildListQuery({ baseSelect, baseFrom, filters, orderBy, page, limit, extraSelect = '' }) {
  const conditions = [];
  const params = [];

  for (const filter of filters) {
    if (filter.value !== undefined && filter.value !== null && filter.value !== '') {
      params.push(filter.value);
      conditions.push(filter.sql.replaceAll('$N', `$${params.length}`));
    }
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (page - 1) * limit;
  params.push(limit, offset);

  const listSql = `
    SELECT ${baseSelect}${extraSelect}
    FROM ${baseFrom}
    ${whereClause}
    ${orderBy}
    LIMIT $${params.length - 1} OFFSET $${params.length}
  `;

  const countSql = `
    SELECT COUNT(*)::int AS total
    FROM ${baseFrom}
    ${whereClause}
  `;

  return { listSql, countSql, listParams: params, countParams: params.slice(0, -2) };
}

async function listUsers({ search, role, page, limit }) {
  const filters = [];
  if (search) {
    filters.push({
      sql: '(name ILIKE $N OR email ILIKE $N)',
      value: `%${search}%`,
    });
  }
  if (role) {
    filters.push({ sql: 'role = $N', value: role });
  }

  const { listSql, countSql, listParams, countParams } = buildListQuery({
    baseSelect: 'id, name, email, role, created_at',
    baseFrom: 'users',
    filters,
    orderBy: 'ORDER BY created_at DESC',
    page,
    limit,
  });

  const [list, count] = await Promise.all([
    pool.query(listSql, listParams),
    pool.query(countSql, countParams),
  ]);

  return { users: list.rows, total: count.rows[0].total };
}

async function listOrganizers() {
  const { rows } = await pool.query(
    `SELECT
       u.id,
       u.name,
       u.email,
       u.created_at,
       (SELECT COUNT(*)::int FROM events e WHERE e.organizer_id = u.id) AS event_count,
       u.role AS status
     FROM users u
     WHERE u.role = 'ORGANIZER'
     ORDER BY u.created_at DESC`
  );

  return rows;
}

async function listEvents({ search, status, organizer, from, to, page, limit }) {
  const filters = [];
  if (search) {
    filters.push({ sql: 'e.name ILIKE $N', value: `%${search}%` });
  }
  if (status) {
    filters.push({ sql: 'e.status = $N', value: status });
  }
  if (organizer) {
    filters.push({
      sql: '(u.name ILIKE $N OR u.email ILIKE $N)',
      value: `%${organizer}%`,
    });
  }
  if (from) {
    filters.push({ sql: 'e.start_date >= $N::timestamp', value: from });
  }
  if (to) {
    filters.push({ sql: 'e.start_date <= $N::timestamp', value: to });
  }

  const { listSql, countSql, listParams, countParams } = buildListQuery({
    baseSelect: `e.id, e.name, e.start_date, e.venue, e.ticket_price, e.total_tickets, e.status`,
    extraSelect: `,
       u.name AS organizer_name,
       (SELECT COALESCE(SUM(b.quantity), 0)::int
        FROM bookings b
        WHERE b.event_id = e.id AND b.status = 'CONFIRMED') AS sold_tickets`,
    baseFrom: 'events e LEFT JOIN users u ON u.id = e.organizer_id',
    filters,
    orderBy: 'ORDER BY e.start_date DESC',
    page,
    limit,
  });

  const [list, count] = await Promise.all([
    pool.query(listSql, listParams),
    pool.query(countSql, countParams),
  ]);

  return {
    events: list.rows.map((e) => ({
      ...e,
      available_tickets: e.total_tickets - e.sold_tickets,
    })),
    total: count.rows[0].total,
  };
}

async function findEventById(id) {
  const { rows } = await pool.query(
    `SELECT
       e.id, e.name, e.description, e.start_date, e.end_date, e.venue, e.image,
       e.ticket_price, e.total_tickets, e.status, e.created_at, e.updated_at,
       u.id AS organizer_id,
       u.name AS organizer_name,
       (SELECT COALESCE(SUM(b.quantity), 0)::int
        FROM bookings b
        WHERE b.event_id = e.id AND b.status = 'CONFIRMED') AS sold_tickets
     FROM events e
     LEFT JOIN users u ON u.id = e.organizer_id
     WHERE e.id = $1`,
    [id]
  );

  return rows[0] || null;
}

async function getReports() {
  const [users, events, bookings, payments] = await Promise.all([
    pool.query(
      `SELECT
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE role = 'ATTENDEE')::int AS attendees,
         COUNT(*) FILTER (WHERE role = 'ORGANIZER')::int AS organizers,
         COUNT(*) FILTER (WHERE role = 'ADMIN')::int AS admins
       FROM users`
    ),
    pool.query(
      `SELECT
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE status = 'PUBLISHED')::int AS published,
         COUNT(*) FILTER (WHERE status = 'CANCELLED')::int AS cancelled,
         COUNT(*) FILTER (WHERE status = 'COMPLETED')::int AS completed
       FROM events`
    ),
    pool.query(
      `SELECT
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE status = 'CONFIRMED')::int AS confirmed,
         COUNT(*) FILTER (WHERE status = 'CANCELLED')::int AS cancelled,
         COALESCE(SUM(quantity), 0)::int AS tickets_sold
       FROM bookings`
    ),
    pool.query(
      `SELECT
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE status = 'SUCCESS')::int AS successful,
         COALESCE(SUM(amount) FILTER (WHERE status = 'SUCCESS'), 0)::numeric AS revenue
       FROM payments`
    ),
  ]);

  return {
    users: users.rows[0],
    events: events.rows[0],
    bookings: bookings.rows[0],
    payments: payments.rows[0],
  };
}

module.exports = {
  getDashboardStats,
  listUsers,
  listOrganizers,
  listEvents,
  findEventById,
  getReports,
};