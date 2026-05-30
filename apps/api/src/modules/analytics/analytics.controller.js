const asyncHandler = require('../../utils/asyncHandler')
const { successResponse } = require('../../utils/apiResponse')
const analyticsService = require('./analytics.service')

const getDashboardSummary = asyncHandler(async (req, res) => {
  const data = await analyticsService.getDashboardSummary()

  return successResponse(res, {
    message: 'Dashboard summary retrieved successfully',
    data,
  })
})

module.exports = {
  getDashboardSummary,
}