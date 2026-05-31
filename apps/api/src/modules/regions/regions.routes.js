const express = require('express')

const regionsController = require('./regions.controller')

const router = express.Router()

router.get('/', regionsController.getRegions)
router.get('/:id', regionsController.getRegionById)

module.exports = router
