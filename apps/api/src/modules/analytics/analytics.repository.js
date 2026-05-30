const { pool } = require("../../db/connection");

const getLatestAnalyticsYear = async () => {
  const [rows] = await pool.query(`
    SELECT MAX(year) AS latest_year
    FROM analytics_snapshots
  `);

  return rows[0]?.latest_year || null;
};

const getSummary = async (year) => {
  const [rows] = await pool.query(
    `
    SELECT
      COUNT(DISTINCT a.region_id) AS total_regions,
      COALESCE(SUM(a.total_population), 0) AS total_population,
      COALESCE(SUM(a.total_vulnerable_population), 0) AS total_vulnerable_population,
      COALESCE(AVG(a.vulnerable_ratio), 0) AS avg_vulnerable_ratio,
      COALESCE(SUM(a.total_pip_aid), 0) AS total_pip_aid,
      COALESCE(AVG(a.pip_coverage_pct), 0) AS avg_pip_coverage_pct,
      COALESCE(SUM(a.total_csr_programs), 0) AS total_csr_programs,
      COALESCE(SUM(a.total_csr_value), 0) AS total_csr_value,
      SUM(CASE WHEN a.risk_status = 'Tinggi' THEN 1 ELSE 0 END) AS high_risk_regions,
      SUM(CASE WHEN a.risk_status = 'Sedang' THEN 1 ELSE 0 END) AS medium_risk_regions,
      SUM(CASE WHEN a.risk_status = 'Rendah' THEN 1 ELSE 0 END) AS low_risk_regions
    FROM analytics_snapshots a
    WHERE a.year = ?
    `,
    [year],
  );

  return rows[0];
};

const getSchoolSummary = async () => {
  const [rows] = await pool.query(`
    SELECT
      COUNT(*) AS total_schools,
      COALESCE(SUM(student_count), 0) AS total_students,
      COALESCE(SUM(teacher_count), 0) AS total_teachers,
      COALESCE(SUM(classroom_count), 0) AS total_classrooms
    FROM schools
  `);

  return rows[0];
};

const getPredictionSummary = async () => {
  const [rows] = await pool.query(`
    SELECT
      COUNT(*) AS total_predictions,
      SUM(CASE WHEN needs_human_review = TRUE AND is_human_validated = FALSE THEN 1 ELSE 0 END) AS pending_reviews,
      COALESCE(AVG(confidence_score), 0) AS avg_confidence_score
    FROM predictions
  `);

  return rows[0];
};

const getTopRiskRegions = async (year, limit = 5) => {
  const [rows] = await pool.query(
    `
    SELECT
      r.id,
      r.region_code,
      r.name,
      a.year,
      a.risk_status,
      a.vulnerability_index,
      a.risk_ranking,
      a.total_vulnerable_population,
      a.pip_coverage_pct,
      a.pip_gap
    FROM analytics_snapshots a
    JOIN regions r ON r.id = a.region_id
    WHERE a.year = ?
    ORDER BY a.risk_ranking ASC
    LIMIT ?
    `,
    [year, limit],
  );

  return rows;
};

module.exports = {
  getLatestAnalyticsYear,
  getSummary,
  getSchoolSummary,
  getPredictionSummary,
  getTopRiskRegions,
};
