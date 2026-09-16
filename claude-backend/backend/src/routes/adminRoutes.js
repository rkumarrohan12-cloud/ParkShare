const express = require('express')
const {
  getStats, listUsers, updateUserStatus, listAllParking, updateParkingStatus,
  listAllBookings, updateBookingStatus,
} = require('../controllers/adminController')
const authenticate = require('../middleware/authenticate')
const authorize = require('../middleware/authorize')

const router = express.Router()

router.use(authenticate, authorize('ADMIN'))

router.get('/stats', getStats)

router.get('/users', listUsers)
router.patch('/users/:id/status', updateUserStatus)

router.get('/parking', listAllParking)
router.patch('/parking/:id/status', updateParkingStatus)

router.get('/bookings', listAllBookings)
router.patch('/bookings/:id/status', updateBookingStatus)

module.exports = router
