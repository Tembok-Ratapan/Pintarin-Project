const asyncHandler = require('../../utils/asyncHandler')
const { successResponse } = require('../../utils/apiResponse')
const csrService = require('./csr.service')

const matchCsrRegions = asyncHandler(async (req, res) => {
  const data = await csrService.matchCsrRegions({
    focusArea: req.body.focus_area,
    budgetRange: req.body.budget_range,
    userId: req.user?.id || null,
  })

  return successResponse(res, {
    message: 'CSR matching recommendations retrieved successfully',
    data,
  })
})

module.exports = {
  matchCsrRegions,
}