const express = require('express')
const { createBooking, listMyBookings, getBooking, cancelBooking } = require('../controllers/bookingController')
const authenticate = require('../middleware/authenticate')
const authorize = require('../middleware/authorize')

const router = express.Router()

router.use(authenticate)

router.post('/', authorize('DRIVER'), createBooking)
router.get('/', authorize('DRIVER'), listMyBookings)
router.get('/:id', authorize('DRIVER', 'ADMIN'), getBooking)
router.patch('/:id/cancel', authorize('DRIVER'), cancelBooking)

module.exports = router
