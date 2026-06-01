const env = require('../../config/env')
const aiClient = require('../../integrations/ai/aiClient')
const aiRepository = require('./ai.repository')

const VALID_LABELS = ['Rendah', 'Sedang', 'Tinggi']

const normalizeNumber = (value, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const normalizeNullableNumber = (value) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const normalizeLimit = (value, fallback = env.ai.batchSize, max = 500) => {
  const parsed = Number(value)

  if (!Number.isInteger(parsed) || parsed < 1) return fallback
  return Math.min(parsed, max)
}

const normalizeYear = (value) => {
  const parsed = Number(value)

  if (!Number.isInteger(parsed) || parsed < 2000 || parsed > 2100) {
    return null
  }

  return parsed
}

const normalizeRiskLabel = (value) => {
  const label = String(value || '').trim()

  if (VALID_LABELS.includes(label)) return label

  return 'Sedang'
}

const getConfidenceLevel = (confidenceScore) => {
  if (confidenceScore === null || confidenceScore === undefined) return 'Rendah'
  if (confidenceScore >= 0.85) return 'Tinggi'
  if (confidenceScore >= env.ai.reviewThreshold) return 'Sedang'
  return 'Rendah'
}

const normalizeAiPrediction = (rawPrediction) => {
  const prediction = rawPrediction?.data || rawPrediction

  const confidenceScore = normalizeNullableNumber(prediction.confidence_score)

  return {
    kecamatan: prediction.kecamatan,
    predicted_label: normalizeRiskLabel(prediction.predicted_label),
    predicted_class: normalizeNullableNumber(prediction.predicted_class),
    risk_score_pct: normalizeNumber(prediction.risk_score_pct),
    confidence_score: confidenceScore,
    confidence_level: getConfidenceLevel(confidenceScore),
    priority_score: normalizeNullableNumber(prediction.priority_score),
    priority_score_pct: normalizeNullableNumber(prediction.priority_score_pct),
    probabilities: prediction.probabilities || null,
    recommendation: prediction.recommendation || null,
    model_version: prediction.model_version || 'unknown',
    raw: prediction,
  }
}

const buildAiPayload = (sourceRow) => {
  return {
    kecamatan: sourceRow.kecamatan,
    rasio_pip_per_rentan: normalizeNumber(sourceRow.rasio_pip_per_rentan),
    rasio_sd_per_populasi: normalizeNumber(sourceRow.rasio_sd_per_populasi),
    gap_bantuan: normalizeNumber(sourceRow.gap_bantuan),
    urgency_score: normalizeNumber(sourceRow.urgency_score),
    total_pra_sekolah: normalizeNumber(sourceRow.total_pre_school),
    tahun_norm: normalizeNumber(sourceRow.tahun_norm),
  }
}

const buildPredictionCode = ({ regionId, dataYear, predictionYear }) => {
  return `AI-${regionId}-${dataYear}-${predictionYear}`
}

const buildStoredPrediction = ({
  sourceRow,
  aiPrediction,
  aiPayload,
  predictionYear,
}) => {
  const confidenceScore = aiPrediction.confidence_score
  const needsHumanReview =
    confidenceScore === null || confidenceScore < env.ai.reviewThreshold

  return {
    prediction_code: buildPredictionCode({
      regionId: sourceRow.region_id,
      dataYear: sourceRow.data_year,
      predictionYear,
    }),
    region_id: sourceRow.region_id,
    data_year: sourceRow.data_year,
    prediction_year: predictionYear,
    model_version: aiPrediction.model_version,
    algorithm: 'FastAPI-Keras-Risk-Hybrid',
    input_features: {
      source: 'education_indicators',
      source_record_count: normalizeNumber(sourceRow.source_record_count),
      region_code: sourceRow.region_code,
      region_name: sourceRow.region_name,
      payload: aiPayload,
      aggregates: {
        total_population: normalizeNumber(sourceRow.total_population),
        total_vulnerable_population: normalizeNumber(sourceRow.total_vulnerable_population),
        total_pip_aid: normalizeNumber(sourceRow.total_pip_aid),
        sd_count: normalizeNumber(sourceRow.sd_count),
        vulnerable_ratio: normalizeNumber(sourceRow.vulnerable_ratio),
      },
    },
    ai_response: aiPrediction.raw,
    actual_score: null,
    predicted_score: aiPrediction.risk_score_pct,
    priority_score: aiPrediction.priority_score_pct,
    actual_label: normalizeRiskLabel(sourceRow.historical_risk_label),
    predicted_label: aiPrediction.predicted_label,
    final_label: aiPrediction.predicted_label,
    confidence_score: confidenceScore,
    confidence_level: aiPrediction.confidence_level,
    recommendation_text: aiPrediction.recommendation,
    needs_human_review: needsHumanReview,
    is_human_validated: false,
  }
}

const checkAiHealth = async () => {
  return aiClient.checkAiHealth()
}

const predictOne = async (payload) => {
  const aiResponse = await aiClient.predictOne(payload)
  const prediction = normalizeAiPrediction(aiResponse)

  return {
    input: payload,
    prediction,
  }
}

const runBatchPrediction = async ({ dataYear, predictionYear, limit }) => {
  const selectedDataYear =
    normalizeYear(dataYear) || await aiRepository.getLatestEducationIndicatorYear()

  if (!selectedDataYear) {
    const error = new Error('No education indicator data found.')
    error.statusCode = 404
    throw error
  }

  const selectedPredictionYear =
    normalizeYear(predictionYear) || selectedDataYear + 1

  const selectedLimit = normalizeLimit(limit)

  const sourceRows = await aiRepository.getEducationIndicatorBatch({
    dataYear: selectedDataYear,
    limit: selectedLimit,
  })

  if (!sourceRows.length) {
    const error = new Error(`No education indicator records found for year ${selectedDataYear}.`)
    error.statusCode = 404
    throw error
  }

  const aiPayloads = sourceRows.map(buildAiPayload)
  const aiResponse = await aiClient.predictBatch(aiPayloads)
  const aiPredictions = aiResponse?.data || []

  if (!Array.isArray(aiPredictions)) {
    const error = new Error('Invalid AI batch response format. Expected data to be an array.')
    error.statusCode = 502
    throw error
  }

  if (aiPredictions.length !== sourceRows.length) {
    const error = new Error(
      `AI batch response count mismatch. Sent ${sourceRows.length}, received ${aiPredictions.length}.`
    )
    error.statusCode = 502
    throw error
  }

  const normalizedPredictions = aiPredictions.map(normalizeAiPrediction)

  const storedPredictions = normalizedPredictions.map((aiPrediction, index) =>
    buildStoredPrediction({
      sourceRow: sourceRows[index],
      aiPrediction,
      aiPayload: aiPayloads[index],
      predictionYear: selectedPredictionYear,
    })
  )

  await aiRepository.savePredictionBatch(storedPredictions)

  return {
    data_year: selectedDataYear,
    prediction_year: selectedPredictionYear,
    model_version: normalizedPredictions[0]?.model_version || 'unknown',
    total_source_records: sourceRows.length,
    total_predictions_saved: storedPredictions.length,
    needs_human_review_count: storedPredictions.filter(
      (prediction) => prediction.needs_human_review
    ).length,
    predictions: storedPredictions.map((prediction) => ({
      prediction_code: prediction.prediction_code,
      region_id: prediction.region_id,
      region_name: prediction.input_features.region_name,
      data_year: prediction.data_year,
      prediction_year: prediction.prediction_year,
      predicted_score: prediction.predicted_score,
      priority_score: prediction.priority_score,
      predicted_label: prediction.predicted_label,
      confidence_score: prediction.confidence_score,
      confidence_level: prediction.confidence_level,
      needs_human_review: prediction.needs_human_review,
      recommendation_text: prediction.recommendation_text,
    })),
  }
}

module.exports = {
  checkAiHealth,
  predictOne,
  runBatchPrediction,
}