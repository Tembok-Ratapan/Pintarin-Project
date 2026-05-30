const predictionsRepository = require('./predictions.repository')

const VALID_ACTIONS = ['approve', 'override', 'flag_for_review']
const VALID_LABELS = ['Rendah', 'Sedang', 'Tinggi']

const normalizeLimit = (value, fallback = 10, max = 100) => {
  const parsed = Number(value)

  if (!Number.isInteger(parsed) || parsed < 1) return fallback
  return Math.min(parsed, max)
}

const getLatestPredictions = async ({ year, limit }) => {
  const selectedYear = year
    ? Number(year)
    : await predictionsRepository.getLatestPredictionYear()

  if (!selectedYear) {
    return {
      year: null,
      predictions: [],
    }
  }

  const predictions = await predictionsRepository.getLatestPredictions({
    year: selectedYear,
    limit: normalizeLimit(limit, 10, 50),
  })

  return {
    year: selectedYear,
    predictions,
  }
}

const getPendingReviewPredictions = async ({ limit }) => {
  const predictions = await predictionsRepository.getPendingReviewPredictions({
    limit: normalizeLimit(limit, 20, 100),
  })

  return {
    count: predictions.length,
    predictions,
  }
}

const validatePrediction = async ({
  predictionId,
  officerId,
  action,
  reason,
  correctedLabel,
}) => {
  const numericPredictionId = Number(predictionId)

  if (!Number.isInteger(numericPredictionId) || numericPredictionId < 1) {
    const error = new Error('Invalid prediction id.')
    error.statusCode = 400
    throw error
  }

  if (!VALID_ACTIONS.includes(action)) {
    const error = new Error(`Invalid action. Allowed actions: ${VALID_ACTIONS.join(', ')}.`)
    error.statusCode = 400
    throw error
  }

  if (action === 'override' && !VALID_LABELS.includes(correctedLabel)) {
    const error = new Error(`corrected_label is required for override. Allowed labels: ${VALID_LABELS.join(', ')}.`)
    error.statusCode = 400
    throw error
  }

  if (action === 'flag_for_review' && !reason) {
    const error = new Error('reason is required when flagging a prediction for review.')
    error.statusCode = 400
    throw error
  }

  const updatedPrediction = await predictionsRepository.validatePrediction({
    predictionId: numericPredictionId,
    officerId,
    action,
    reason: reason?.trim() || null,
    correctedLabel: correctedLabel || null,
  })

  return {
    action,
    prediction: updatedPrediction,
  }
}

module.exports = {
  getLatestPredictions,
  getPendingReviewPredictions,
  validatePrediction,
}