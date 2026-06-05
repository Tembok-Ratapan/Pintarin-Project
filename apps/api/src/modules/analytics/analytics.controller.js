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

const getOfficerOperationalAnalytics = asyncHandler(async (req, res) => {
  const data = await analyticsService.getOfficerOperationalAnalytics({
    range: req.query.range,
    fromDate: req.query.from_date,
    toDate: req.query.to_date,
  })

  return successResponse(res, {
    message: 'Officer operational analytics retrieved successfully',
    data,
  })
})

module.exports = {
  getDashboardSummary,
  getOfficerOperationalAnalytics,
}
