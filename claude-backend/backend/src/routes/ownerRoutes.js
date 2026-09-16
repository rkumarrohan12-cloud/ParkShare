const express = require('express')

const {
  getDashboard,
  createParking,
  listMyParking,
  getMyParkingById,
  updateParking,
  deleteParking,
  listBookingsOnMySpaces,
  updateBookingStatus,
  getEarnings,
} = require('../controllers/ownerController')

const authenticate = require('../middleware/authenticate')
const authorize = require('../middleware/authorize')

const router = express.Router()

// All owner routes require authentication + OWNER role
router.use(authenticate, authorize('OWNER'))

// Dashboard
router.get('/dashboard', getDashboard)

// Parking
router.post('/parking', createParking)
router.get('/parking', listMyParking)
router.get('/parking/:id', getMyParkingById)
router.put('/parking/:id', updateParking)
router.delete('/parking/:id', deleteParking)

// Bookings
router.get('/bookings', listBookingsOnMySpaces)
router.patch('/bookings/:id/status', updateBookingStatus)

// Earnings
router.get('/earnings', getEarnings)

module.exports = router