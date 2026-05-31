const { pool } = require("../../db/connection");

const listSchools = async ({ search, regionId, limit = 50 }) => {
  const values = [];
  const conditions = [];

  if (search) {
    conditions.push("s.name LIKE ?");
    values.push(`%${search}%`);
  }

  if (regionId) {
    conditions.push("s.region_id = ?");
    values.push(regionId);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  values.push(Math.min(Number(limit) || 50, 100));

  const [rows] = await pool.query(
    `
    SELECT
      s.id,
      s.name,
      s.region_id,
      r.name AS region_name
    FROM schools s
    LEFT JOIN regions r ON r.id = s.region_id
    ${whereClause}
    ORDER BY s.name ASC
    LIMIT ?
    `,
    values,
  );

  return rows;
};

module.exports = {
  listSchools,
};