const asyncHandler = require('../../utils/asyncHandler')
const { successResponse } = require('../../utils/apiResponse')
const regionsService = require('./regions.service')

const getRegions = asyncHandler(async (req, res) => {
  const data = await regionsService.getRegions({
    search: req.query.search,
    riskStatus: req.query.risk_status,
  })

  return successResponse(res, {
    message: 'Regions retrieved successfully',
    data,
    meta: {
      count: data.length,
    },
  })
})

const getRegionById = asyncHandler(async (req, res) => {
  const data = await regionsService.getRegionById(Number(req.params.id))

  return successResponse(res, {
    message: 'Region detail retrieved successfully',
    data,
  })
})

module.exports = {
  getRegions,
  getRegionById,
}