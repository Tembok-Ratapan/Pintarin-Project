const { pool } = require("../../db/connection");

const getRegions = async ({ search = "", riskStatus = "" }) => {
  const conditions = [];
  const values = [];

  if (search) {
    conditions.push("r.name LIKE ?");
    values.push(`%${search}%`);
  }

  if (riskStatus) {
    conditions.push("r.dominant_risk_status = ?");
    values.push(riskStatus);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const [rows] = await pool.query(
    `
    SELECT
      r.id,
      r.region_code,
      r.name,
      r.city,
      r.province,
      r.postal_code,
      r.village_count,
      r.area_km2,
      r.center_latitude,
      r.center_longitude,
      r.avg_population,
      r.avg_vulnerable_population,
      r.avg_vulnerable_ratio,
      r.dominant_risk_status,
      COUNT(s.id) AS total_schools
    FROM regions r
    LEFT JOIN schools s ON s.region_id = r.id
    ${whereClause}
    GROUP BY r.id
    ORDER BY r.name ASC
    `,
    values,
  );

  return rows;
};

const getRegionById = async (id) => {
  const [rows] = await pool.query(
    `
    SELECT
      r.id,
      r.region_code,
      r.name,
      r.city,
      r.province,
      r.postal_code,
      r.village_count,
      r.village_list,
      r.area_km2,
      r.center_latitude,
      r.center_longitude,
      r.avg_population,
      r.avg_vulnerable_population,
      r.avg_vulnerable_ratio,
      r.dominant_risk_status,
      COUNT(s.id) AS total_schools
    FROM regions r
    LEFT JOIN schools s ON s.region_id = r.id
    WHERE r.id = ?
    GROUP BY r.id
    LIMIT 1
    `,
    [id],
  );

  return rows[0] || null;
};

module.exports = {
  getRegions,
  getRegionById,
};
