const express = require('express')
const { successResponse } = require('../../utils/apiResponse')

const router = express.Router()

router.get('/', (req, res) => {
  return successResponse(res, {
    message: 'PINTARIN API is running',
    data: {
      service: 'pintarin-api',
      status: 'healthy',
      timestamp: new Date().toISOString(),
    },
  })
})

module.exports = router