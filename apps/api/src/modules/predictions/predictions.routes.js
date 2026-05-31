const express = require('express')

const authMiddleware = require('../../middlewares/authMiddleware')
const roleGuard = require('../../middlewares/roleGuard')
const { ALL_ROLES, ROLES } = require('../../constants/roles')
const predictionsController = require('./predictions.controller')

const router = express.Router()

router.get(
  '/latest',
  authMiddleware,
  roleGuard(ALL_ROLES),
  predictionsController.getLatestPredictions
)

router.get(
  '/pending-review',
  authMiddleware,
  roleGuard([ROLES.ADMIN, ROLES.OFFICER]),
  predictionsController.getPendingReviewPredictions
)

router.post(
  '/:id/validate',
  authMiddleware,
  roleGuard([ROLES.ADMIN, ROLES.OFFICER]),
  predictionsController.validatePrediction
)

module.exports = router
