const express = require('express')

const authMiddleware = require('../../middlewares/authMiddleware')
const roleGuard = require('../../middlewares/roleGuard')
const { ROLES } = require('../../constants/roles')
const aiController = require('./ai.controller')

const router = express.Router()

router.get(
  '/health',
  authMiddleware,
  roleGuard([ROLES.ADMIN, ROLES.OFFICER, ROLES.ANALYST]),
  aiController.checkAiHealth
)

router.post(
  '/predict-one',
  authMiddleware,
  roleGuard([ROLES.ADMIN, ROLES.OFFICER, ROLES.ANALYST]),
  aiController.predictOne
)

router.post(
  '/run-batch-prediction',
  authMiddleware,
  roleGuard([ROLES.ADMIN, ROLES.OFFICER]),
  aiController.runBatchPrediction
)

module.exports = router