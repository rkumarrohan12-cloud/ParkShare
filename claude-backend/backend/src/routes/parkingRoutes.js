const express = require('express')
const { listParking, getParking } = require('../controllers/parkingController')

const router = express.Router()

router.get('/', listParking)
router.get('/:id', getParking)

module.exports = router
