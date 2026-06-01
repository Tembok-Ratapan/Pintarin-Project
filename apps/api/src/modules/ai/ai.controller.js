const asyncHandler = require('../../utils/asyncHandler')
const { successResponse } = require('../../utils/apiResponse')
const aiService = require('./ai.service')

const checkAiHealth = asyncHandler(async (req, res) => {
  const data = await aiService.checkAiHealth()

  return successResponse(res, {
    message: 'AI service health retrieved successfully',
    data,
  })
})

const predictOne = asyncHandler(async (req, res) => {
  const data = await aiService.predictOne(req.body)

  return successResponse(res, {
    message: 'AI prediction generated successfully',
    data,
  })
})

const runBatchPrediction = asyncHandler(async (req, res) => {
  const data = await aiService.runBatchPrediction({
    dataYear: req.body.data_year,
    predictionYear: req.body.prediction_year,
    limit: req.body.limit,
  })

  return successResponse(res, {
    message: 'AI batch prediction completed successfully',
    data,
  })
})

module.exports = {
  checkAiHealth,
  predictOne,
  runBatchPrediction,
}