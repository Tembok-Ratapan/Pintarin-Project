const express = require('express')

const authMiddleware = require('../../middlewares/authMiddleware')
const roleGuard = require('../../middlewares/roleGuard')
const { ROLES } = require('../../constants/roles')
const csrController = require('./csr.controller')

const router = express.Router()

router.post(
  '/match',
  authMiddleware,
  roleGuard([ROLES.ADMIN, ROLES.OFFICER, ROLES.CSR_PARTNER]),
  csrController.matchCsrRegions
)

module.exports = router
