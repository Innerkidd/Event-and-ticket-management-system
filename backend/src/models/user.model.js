const pool = require('../config/db');

const USER_SAFE_COLUMNS = 'id, name, email, role, created_at, updated_at';

async function findByEmail(email) {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0] || null;
}

async function findByGoogleId(googleId) {
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE google_id = $1',
    [googleId]
  );
  return rows[0] || null;
}

async function findById(id) {
  const { rows } = await pool.query(
    `SELECT ${USER_SAFE_COLUMNS} FROM users WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function create({ name, email, passwordHash, role, googleId = null }) {
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password_hash, role, google_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${USER_SAFE_COLUMNS}`,
    [name, email, passwordHash, role, googleId]
  );
  return rows[0];
}

async function linkGoogleId(id, googleId) {
  const { rows } = await pool.query(
    `UPDATE users
     SET google_id = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING ${USER_SAFE_COLUMNS}`,
    [googleId, id]
  );
  return rows[0] || null;
}

module.exports = {
  findByEmail,
  findByGoogleId,
  findById,
  create,
  linkGoogleId,
};