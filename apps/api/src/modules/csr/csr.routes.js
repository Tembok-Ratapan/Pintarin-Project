const express = require('express')
const csrController = require('./csr.controller')

const router = express.Router()

router.post('/match', csrController.matchCsrRegions)

module.exports = router