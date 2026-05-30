const asyncHandler = require('../../utils/asyncHandler')
const { successResponse } = require('../../utils/apiResponse')
const predictionsService = require('./predictions.service')

const getLatestPredictions = asyncHandler(async (req, res) => {
  const data = await predictionsService.getLatestPredictions({
    year: req.query.year,
    limit: req.query.limit,
  })

  return successResponse(res, {
    message: 'Latest predictions retrieved successfully',
    data,
  })
})

const getPendingReviewPredictions = asyncHandler(async (req, res) => {
  const data = await predictionsService.getPendingReviewPredictions({
    limit: req.query.limit,
  })

  return successResponse(res, {
    message: 'Pending review predictions retrieved successfully',
    data,
  })
})

const validatePrediction = asyncHandler(async (req, res) => {
  const data = await predictionsService.validatePrediction({
    predictionId: req.params.id,
    officerId: req.user.id,
    action: req.body.action,
    reason: req.body.reason,
    correctedLabel: req.body.corrected_label,
  })

  return successResponse(res, {
    message: `Prediction successfully ${data.action}.`,
    data,
  })
})

module.exports = {
  getLatestPredictions,
  getPendingReviewPredictions,
  validatePrediction,
}