const express = require('express')
const { createPayment, listMyPayments } = require('../controllers/paymentController')
const authenticate = require('../middleware/authenticate')
const authorize = require('../middleware/authorize')

const router = express.Router()

router.use(authenticate, authorize('DRIVER'))

router.post('/', createPayment)
router.get('/', listMyPayments)

module.exports = router
