const { pool } = require('../../db/connection')

const AI_ALGORITHM = 'FastAPI-Keras-Risk-Hybrid'

const getLatestAnalyticsYear = async () => {
  const [rows] = await pool.query(`
    SELECT MAX(year) AS latest_year
    FROM analytics_snapshots
  `)

  return rows[0]?.latest_year || null
}

const getLatestAiPredictionMeta = async () => {
  const [rows] = await pool.query(
    `
    SELECT
      data_year,
      prediction_year,
      model_version
    FROM predictions
    WHERE algorithm = ?
      AND prediction_code LIKE 'AI-%'
    ORDER BY prediction_year DESC, data_year DESC, updated_at DESC
    LIMIT 1
    `,
    [AI_ALGORITHM],
  )

  return rows[0] || null
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
      p.recommendation_text
    FROM predictions p
    JOIN regions r ON r.id = p.region_id
    LEFT JOIN analytics_snapshots a
      ON a.region_id = p.region_id
      AND a.year = ?
    WHERE p.prediction_year = ?
      AND p.algorithm = ?
      AND p.prediction_code LIKE 'AI-%'
    ORDER BY
      COALESCE(p.priority_score, p.predicted_score) DESC,
      p.predicted_score DESC,
      r.name ASC
    `,
    [analyticsYear, predictionYear, AI_ALGORITHM],
  )

  return rows
}

const saveMatchLog = async ({
  userId = null,
  focusArea,
  budgetRange,
  results,
}) => {
  const [result] = await pool.query(
    `
    INSERT INTO csr_match_logs
      (user_id, focus_area, budget_range, results_json)
    VALUES (?, ?, ?, ?)
    `,
    [userId, focusArea, budgetRange, JSON.stringify(results)],
  )

  return result.insertId
}

module.exports = {
  getLatestAnalyticsYear,
  getLatestAiPredictionMeta,
  getCsrMatchingCandidates,
  saveMatchLog,
}