const { pool } = require('../../db/connection')

const getLatestEducationIndicatorYear = async () => {
  const [rows] = await pool.query(`
    SELECT MAX(year) AS latest_year
    FROM education_indicators
  `)

  return rows[0]?.latest_year || null
}

const getEducationIndicatorBatch = async ({ dataYear, limit }) => {
  const [rows] = await pool.query(
    `
    SELECT
      e.region_id,
      r.region_code,
      r.name AS region_name,
      e.kecamatan,
      e.year AS data_year,

      COUNT(*) AS source_record_count,

      AVG(e.total_population) AS total_population,
      AVG(e.total_vulnerable_population) AS total_vulnerable_population,
      AVG(e.total_pip_aid) AS total_pip_aid,
      AVG(e.total_pre_school) AS total_pre_school,
      AVG(e.sd_count) AS sd_count,
      AVG(e.vulnerable_ratio) AS vulnerable_ratio,

      CASE
        WHEN SUM(e.historical_risk_label = 'Tinggi') >= SUM(e.historical_risk_label = 'Sedang')
         AND SUM(e.historical_risk_label = 'Tinggi') >= SUM(e.historical_risk_label = 'Rendah')
          THEN 'Tinggi'
        WHEN SUM(e.historical_risk_label = 'Sedang') >= SUM(e.historical_risk_label = 'Tinggi')
         AND SUM(e.historical_risk_label = 'Sedang') >= SUM(e.historical_risk_label = 'Rendah')
          THEN 'Sedang'
        ELSE 'Rendah'
      END AS historical_risk_label,

      AVG(e.rasio_pip_per_rentan) AS rasio_pip_per_rentan,
      AVG(e.rasio_sd_per_populasi) AS rasio_sd_per_populasi,
      AVG(e.gap_bantuan) AS gap_bantuan,
      AVG(e.urgency_score) AS urgency_score,
      AVG(e.tahun_norm) AS tahun_norm

    FROM education_indicators e
    JOIN regions r ON r.id = e.region_id
    WHERE e.year = ?
      AND e.region_id IS NOT NULL
    GROUP BY
      e.region_id,
      r.region_code,
      r.name,
      e.kecamatan,
      e.year
    ORDER BY AVG(e.urgency_score) DESC, r.name ASC
    LIMIT ?
    `,
    [dataYear, limit]
  )

  return rows
}

const savePredictionBatch = async (predictions) => {
  if (!predictions.length) {
    return {
      affectedRows: 0,
    }
  }

  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    const placeholders = predictions
      .map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .join(', ')

    const values = predictions.flatMap((prediction) => [
      prediction.prediction_code,
      prediction.region_id,
      prediction.data_year,
      prediction.prediction_year,
      prediction.model_version,
      prediction.algorithm,
      JSON.stringify(prediction.input_features),
      JSON.stringify(prediction.ai_response),
      prediction.actual_score,
      prediction.predicted_score,
      prediction.priority_score,
      prediction.actual_label,
      prediction.predicted_label,
      prediction.final_label,
      prediction.confidence_score,
      prediction.confidence_level,
      prediction.recommendation_text,
      prediction.needs_human_review,
      prediction.is_human_validated,
    ])

    const [result] = await connection.query(
      `
      INSERT INTO predictions (
        prediction_code,
        region_id,
        data_year,
        prediction_year,
        model_version,
        algorithm,
        input_features,
        ai_response,
        actual_score,
        predicted_score,
        priority_score,
        actual_label,
        predicted_label,
        final_label,
        confidence_score,
        confidence_level,
        recommendation_text,
        needs_human_review,
        is_human_validated
      )
      VALUES ${placeholders}
      ON DUPLICATE KEY UPDATE
        model_version = VALUES(model_version),
        algorithm = VALUES(algorithm),
        input_features = VALUES(input_features),
        ai_response = VALUES(ai_response),
        actual_score = VALUES(actual_score),
        predicted_score = VALUES(predicted_score),
        priority_score = VALUES(priority_score),
        actual_label = VALUES(actual_label),
        predicted_label = VALUES(predicted_label),
        final_label = IF(is_human_validated = TRUE, final_label, VALUES(final_label)),
        confidence_score = VALUES(confidence_score),
        confidence_level = VALUES(confidence_level),
        recommendation_text = VALUES(recommendation_text),
        needs_human_review = IF(is_human_validated = TRUE, FALSE, VALUES(needs_human_review)),
        updated_at = CURRENT_TIMESTAMP
      `,
      values
    )

    await connection.commit()

    return result
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

module.exports = {
  getLatestEducationIndicatorYear,
  getEducationIndicatorBatch,
  savePredictionBatch,
}