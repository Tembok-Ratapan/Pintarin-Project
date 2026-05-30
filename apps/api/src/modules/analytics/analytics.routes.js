const express = require('express')
const analyticsController = require('./analytics.controller')

const router = express.Router()

router.get('/summary', analyticsController.getDashboardSummary)

module.exports = router