const express = require('express')
const { listMyGatePasses, createGatePass } = require('../controllers/gatePassController')
const authenticate = require('../middleware/authenticate')
const authorize = require('../middleware/authorize')

const router = express.Router()

router.use(authenticate, authorize('DRIVER'))

router.get('/', listMyGatePasses)
router.post('/', createGatePass)

module.exports = router
