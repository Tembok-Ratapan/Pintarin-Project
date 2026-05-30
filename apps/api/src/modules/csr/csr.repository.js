const { pool } = require('../../db/connection')

const getLatestAnalyticsYear = async () => {
  const [rows] = await pool.query(`
    SELECT MAX(year) AS latest_year
    FROM analytics_snapshots
  `)

  return rows[0]?.latest_year || null
}

const getLatestPredictionYear = async () => {
  const [rows] = await pool.query(`
    SELECT MAX(prediction_year) AS latest_year
    FROM predictions
  `)

  return rows[0]?.latest_year || null
}

const getCsrMatchingCandidates = async ({ analyticsYear, predictionYear }) => {
  const [rows] = await pool.query(
    `
    SELECT
      r.id AS region_id,
      r.region_code,
      r.name AS region_name,
      r.avg_population,

      a.year AS analytics_year,
      a.total_vulnerable_population,
      a.vulnerable_ratio,
      a.total_pip_aid,
      a.pip_coverage_pct,
      a.sd_count,
      a.risk_status,
      a.vulnerability_index,
      a.pip_gap,
      a.risk_ranking,
      a.total_csr_programs,
      a.total_csr_value,

      COALESCE(MAX(p.predicted_score), 0) AS predicted_score,
      COALESCE(AVG(p.confidence_score), 0) AS avg_confidence_score,
      SUM(CASE WHEN p.final_label = 'Tinggi' THEN 1 ELSE 0 END) AS high_prediction_count,
      SUM(CASE WHEN p.final_label = 'Sedang' THEN 1 ELSE 0 END) AS medium_prediction_count,
      SUM(CASE WHEN p.final_label = 'Rendah' THEN 1 ELSE 0 END) AS low_prediction_count
    FROM regions r
    JOIN analytics_snapshots a ON a.region_id = r.id
    LEFT JOIN predictions p
      ON p.region_id = r.id
      AND p.prediction_year = ?
    WHERE a.year = ?
    GROUP BY
      r.id,
      r.region_code,
      r.name,
      r.avg_population,
      a.year,
      a.total_vulnerable_population,
      a.vulnerable_ratio,
      a.total_pip_aid,
      a.pip_coverage_pct,
      a.sd_count,
      a.risk_status,
      a.vulnerability_index,
      a.pip_gap,
      a.risk_ranking,
      a.total_csr_programs,
      a.total_csr_value
    `,
    [predictionYear, analyticsYear]
  )

  return rows
}

const saveMatchLog = async ({ userId = null, focusArea, budgetRange, results }) => {
  const [result] = await pool.query(
    `
    INSERT INTO csr_match_logs
      (user_id, focus_area, budget_range, results_json)
    VALUES (?, ?, ?, ?)
    `,
    [userId, focusArea, budgetRange, JSON.stringify(results)]
  )

  return result.insertId
}

module.exports = {
  getLatestAnalyticsYear,
  getLatestPredictionYear,
  getCsrMatchingCandidates,
  saveMatchLog,
}