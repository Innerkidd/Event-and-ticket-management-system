const pool = require('../config/db');

async function listApplications({ status, search, page, limit }) {
  const conditions = [];
  const params = [];

  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    conditions.push(
      `(full_name ILIKE $${params.length} OR email ILIKE $${params.length} OR organization ILIKE $${params.length})`
    );
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (page - 1) * limit;
  params.push(limit, offset);

  const [list, count] = await Promise.all([
    pool.query(
      `SELECT
         id, full_name, email, organization, experience, status, created_at
       FROM organizer_applications
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    ),
    pool.query(
      `SELECT COUNT(*)::int AS total
       FROM organizer_applications
       ${whereClause}`,
      params.slice(0, -2)
    ),
  ]);

  return { applications: list.rows, total: count.rows[0].total };
}

async function findById(id) {
  const { rows } = await pool.query(
    `SELECT
       id, user_id, full_name, email, phone, organization, experience, reason,
       linkedin_url, social_media_url, portfolio_url, document_url,
       status, admin_remarks, created_at, updated_at
     FROM organizer_applications
     WHERE id = $1`,
    [id]
  );

  return rows[0] || null;
}

async function findByUserIdAndPending(userId) {
  const { rows } = await pool.query(
    `SELECT id FROM organizer_applications
     WHERE user_id = $1 AND status = 'PENDING'`,
    [userId]
  );
  return rows[0] || null;
}

async function approveApplication(client, applicationId, adminRemarks) {
  const { rows } = await client.query(
    `UPDATE organizer_applications
     SET status = 'APPROVED',
         admin_remarks = COALESCE($2, admin_remarks),
         updated_at = NOW()
     WHERE id = $1
     RETURNING id, status, admin_remarks`,
    [applicationId, adminRemarks]
  );
  return rows[0] || null;
}

async function rejectApplication(applicationId, adminRemarks) {
  const { rows } = await pool.query(
    `UPDATE organizer_applications
     SET status = 'REJECTED',
         admin_remarks = $2,
         updated_at = NOW()
     WHERE id = $1
     RETURNING id, status, admin_remarks`,
    [applicationId, adminRemarks]
  );
  return rows[0] || null;
}

module.exports = {
  listApplications,
  findById,
  findByUserIdAndPending,
  approveApplication,
  rejectApplication,
};