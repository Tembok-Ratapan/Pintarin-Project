const { pool } = require('../../db/connection')

const getLatestPredictionYear = async () => {
  const [rows] = await pool.query(`
    SELECT MAX(prediction_year) AS latest_year
    FROM predictions
  `)

  return rows[0]?.latest_year || null
}

const getLatestPredictions = async ({ year, limit = 10 }) => {
  const [rows] = await pool.query(
    `
    SELECT
      p.id,
      p.prediction_code,
      p.data_year,
      p.prediction_year,
      p.model_version,
      p.algorithm,
      p.predicted_score,
      p.actual_score,
      p.predicted_label,
      p.actual_label,
      p.final_label,
      p.confidence_score,
      p.confidence_level,
      p.needs_human_review,
      p.is_human_validated,
      p.validation_note,
      p.created_at,
      r.id AS region_id,
      r.region_code,
      r.name AS region_name
    FROM predictions p
    JOIN regions r ON r.id = p.region_id
    WHERE p.prediction_year = ?
    ORDER BY p.predicted_score DESC
    LIMIT ?
    `,
    [year, limit]
  )

  return rows
}

const getPendingReviewPredictions = async ({ limit = 20 }) => {
  const [rows] = await pool.query(
    `
    SELECT
      p.id,
      p.prediction_code,
      p.data_year,
      p.prediction_year,
      p.model_version,
      p.algorithm,
      p.predicted_score,
      p.predicted_label,
      p.final_label,
      p.confidence_score,
      p.confidence_level,
      p.needs_human_review,
      p.is_human_validated,
      p.validation_note,
      p.created_at,
      r.id AS region_id,
      r.region_code,
      r.name AS region_name
    FROM predictions p
    JOIN regions r ON r.id = p.region_id
    WHERE p.needs_human_review = TRUE
      AND p.is_human_validated = FALSE
    ORDER BY p.confidence_score ASC, p.predicted_score DESC
    LIMIT ?
    `,
    [limit]
  )

  return rows
}

const getPredictionById = async (id, connection = pool) => {
  const [rows] = await connection.query(
    `
    SELECT
      p.id,
      p.prediction_code,
      p.data_year,
      p.prediction_year,
      p.model_version,
      p.algorithm,
      p.predicted_score,
      p.actual_score,
      p.predicted_label,
      p.actual_label,
      p.final_label,
      p.confidence_score,
      p.confidence_level,
      p.needs_human_review,
      p.is_human_validated,
      p.validation_note,
      p.created_at,
      p.updated_at,
      r.id AS region_id,
      r.region_code,
      r.name AS region_name
    FROM predictions p
    JOIN regions r ON r.id = p.region_id
    WHERE p.id = ?
    LIMIT 1
    `,
    [id]
  )

  return rows[0] || null
}

const validatePrediction = async ({
  predictionId,
  officerId,
  action,
  reason = null,
  correctedLabel = null,
}) => {
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    const [predictionRows] = await connection.query(
      `
      SELECT
        id,
        predicted_label,
        final_label,
        is_human_validated
      FROM predictions
      WHERE id = ?
      FOR UPDATE
      `,
      [predictionId]
    )

    const prediction = predictionRows[0]

    if (!prediction) {
      const error = new Error('Prediction not found.')
      error.statusCode = 404
      throw error
    }

    await connection.query(
      `
      INSERT INTO prediction_validations
        (prediction_id, officer_id, action, reason, corrected_label)
      VALUES (?, ?, ?, ?, ?)
      `,
      [predictionId, officerId, action, reason, correctedLabel]
    )

    if (action === 'approve') {
      await connection.query(
        `
        UPDATE predictions
        SET
          final_label = predicted_label,
          is_human_validated = TRUE,
          needs_human_review = FALSE,
          validation_note = ?
        WHERE id = ?
        `,
        [reason, predictionId]
      )
    }

    if (action === 'override') {
      await connection.query(
        `
        UPDATE predictions
        SET
          final_label = ?,
          is_human_validated = TRUE,
          needs_human_review = FALSE,
          validation_note = ?
        WHERE id = ?
        `,
        [correctedLabel, reason, predictionId]
      )
    }

    if (action === 'flag_for_review') {
      await connection.query(
        `
        UPDATE predictions
        SET
          needs_human_review = TRUE,
          is_human_validated = FALSE,
          validation_note = ?
        WHERE id = ?
        `,
        [reason, predictionId]
      )
    }

    const updatedPrediction = await getPredictionById(predictionId, connection)

    await connection.commit()

    return updatedPrediction
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

module.exports = {
  getLatestPredictionYear,
  getLatestPredictions,
  getPendingReviewPredictions,
  getPredictionById,
  validatePrediction,
}