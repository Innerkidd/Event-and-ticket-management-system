const pool = require('../config/db');

const USER_SAFE_COLUMNS = 'id, name, email, role, created_at, updated_at';

async function findByEmail(email) {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0] || null;
}

async function findById(id) {
  const { rows } = await pool.query(
    `SELECT ${USER_SAFE_COLUMNS} FROM users WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function create({ name, email, passwordHash, role }) {
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING ${USER_SAFE_COLUMNS}`,
    [name, email, passwordHash, role]
  );
  return rows[0];
}

module.exports = {
  findByEmail,
  findById,
  create,
};