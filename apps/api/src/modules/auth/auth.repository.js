const { pool } = require('../../db/connection')

const baseUserSelect = `
  SELECT
    u.id,
    u.user_code,
    u.username,
    u.email,
    u.full_name,
    u.role,
    u.source_role,
    u.institution,
    u.region_id,
    r.name AS region_name,
    u.is_active,
    u.last_login,
    u.created_at,
    u.updated_at
  FROM users u
  LEFT JOIN regions r ON r.id = u.region_id
`

const findUserByIdentifier = async (identifier) => {
  const [rows] = await pool.query(
    `
    SELECT
      u.id,
      u.user_code,
      u.username,
      u.email,
      u.full_name,
      u.role,
      u.source_role,
      u.institution,
      u.region_id,
      r.name AS region_name,
      u.is_active,
      u.last_login,
      u.password_hash,
      u.created_at,
      u.updated_at
    FROM users u
    LEFT JOIN regions r ON r.id = u.region_id
    WHERE u.email = ? OR u.username = ?
    LIMIT 1
    `,
    [identifier, identifier]
  )

  return rows[0] || null
}

const findUserById = async (id) => {
  const [rows] = await pool.query(
    `
    ${baseUserSelect}
    WHERE u.id = ?
    LIMIT 1
    `,
    [id]
  )

  return rows[0] || null
}

const updateLastLogin = async (id) => {
  await pool.query(
    `
    UPDATE users
    SET last_login = NOW()
    WHERE id = ?
    `,
    [id]
  )
}

module.exports = {
  findUserByIdentifier,
  findUserById,
  updateLastLogin,
}