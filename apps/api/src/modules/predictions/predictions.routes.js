const express = require('express')
const predictionsController = require('./predictions.controller')
const authMiddleware = require('../../middlewares/authMiddleware')
const roleGuard = require('../../middlewares/roleGuard')
const { ROLES } = require('../../constants/roles')

const router = express.Router()

router.get('/latest', predictionsController.getLatestPredictions)

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