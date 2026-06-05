const express = require('express')

const authMiddleware = require('../../middlewares/authMiddleware')
const roleGuard = require('../../middlewares/roleGuard')
const { ROLES } = require('../../constants/roles')
const analyticsController = require('./analytics.controller')

const router = express.Router()

router.get('/summary', analyticsController.getDashboardSummary)
router.get(
  '/officer/operations',
  authMiddleware,
  roleGuard([ROLES.ADMIN, ROLES.OFFICER]),
  analyticsController.getOfficerOperationalAnalytics,
)

module.exports = router
