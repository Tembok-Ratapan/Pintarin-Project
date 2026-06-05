const { pool } = require("../../db/connection");

const AI_ALGORITHM = "FastAPI-Keras-Risk-Hybrid";

const latestAnalyticsJoin = `
  LEFT JOIN analytics_snapshots a
    ON a.region_id = r.id
    AND a.year = (
      SELECT MAX(year)
      FROM analytics_snapshots
    )
`;

const latestPredictionJoin = `
  LEFT JOIN predictions p
    ON p.region_id = r.id
    AND p.algorithm = ?
    AND p.prediction_code LIKE 'AI-%'
    AND p.prediction_year = (
      SELECT MAX(prediction_year)
      FROM predictions
      WHERE algorithm = ?
        AND prediction_code LIKE 'AI-%'
    )
`;

const schoolCountJoin = `
  LEFT JOIN (
    SELECT region_id, COUNT(*) AS total_schools
    FROM schools
    GROUP BY region_id
  ) sc ON sc.region_id = r.id
`;

const regionSelect = `
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

  COALESCE(sc.total_schools, 0) AS total_schools,

  a.year AS analytics_year,
  a.total_population,
  a.total_vulnerable_population,
  a.vulnerable_ratio,
  a.total_pip_aid,
  a.pip_coverage_pct,
  a.pip_gap,
  a.risk_ranking,
  a.vulnerability_index,
  a.total_csr_programs,
  a.total_csr_value,

  p.id AS prediction_id,
  p.prediction_code,
  p.data_year,
  p.prediction_year,
  p.model_version,
  p.algorithm,
  p.predicted_score,
  p.priority_score,
  p.predicted_label,
  p.final_label,
  p.confidence_score,
  p.confidence_level,
  p.needs_human_review,
  p.is_human_validated,
  p.recommendation_text,

  COALESCE(
    p.final_label,
    p.predicted_label,
    a.risk_status,
    r.dominant_risk_status
  ) AS risk_status
`;

const getRegions = async ({ search = "", riskStatus = "" }) => {
  const conditions = [];
  const values = [AI_ALGORITHM, AI_ALGORITHM];

  if (search) {
    conditions.push("r.name LIKE ?");
    values.push(`%${search}%`);
  }

  if (riskStatus) {
    conditions.push(`
      COALESCE(
        p.final_label,
        p.predicted_label,
        a.risk_status,
        r.dominant_risk_status
      ) = ?
    `);
    values.push(riskStatus);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const [rows] = await pool.query(
    `
    SELECT
      ${regionSelect}
    FROM regions r
    ${schoolCountJoin}
    ${latestAnalyticsJoin}
    ${latestPredictionJoin}
    ${whereClause}
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
      ${regionSelect},
      r.village_list
    FROM regions r
    ${schoolCountJoin}
    ${latestAnalyticsJoin}
    ${latestPredictionJoin}
    WHERE r.id = ?
    LIMIT 1
    `,
    [AI_ALGORITHM, AI_ALGORITHM, id],
  );

  return rows[0] || null;
};

module.exports = {
  getRegions,
  getRegionById,
};
