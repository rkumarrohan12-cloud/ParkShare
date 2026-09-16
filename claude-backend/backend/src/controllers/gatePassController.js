const crypto = require('crypto')
const { query } = require('../config/db')
const { success } = require('../utils/response')
const ApiError = require('../utils/ApiError')
const asyncHandler = require('../utils/asyncHandler')
const validate = require('../utils/validate')

// GET /api/gate-passes
const listMyGatePasses = asyncHandler(async (req, res) => {
  const { rows } = await query(
    'SELECT * FROM gate_passes WHERE driver_id = $1 ORDER BY created_at DESC',
    [req.user.id]
  )
  success(res, rows)
})

// POST /api/gate-passes
const createGatePass = asyncHandler(async (req, res) => {
  const { bookingId } = req.body
  validate.require(req.body, ['bookingId'])

  const bookingRes = await query('SELECT * FROM bookings WHERE id = $1', [bookingId])
  const booking = bookingRes.rows[0]
  if (!booking) throw new ApiError(404, 'Booking not found.')
  if (booking.driver_id !== req.user.id) throw new ApiError(403, 'You cannot generate a pass for this booking.')
  if (!['CONFIRMED', 'ACTIVE'].includes(booking.status)) {
    throw new ApiError(400, 'A gate pass can only be issued for a confirmed booking.')
  }

  const existing = await query('SELECT * FROM gate_passes WHERE booking_id = $1', [bookingId])
  if (existing.rows.length) return success(res, existing.rows[0])

  const passCode = crypto.randomBytes(4).toString('hex').toUpperCase()
  const { rows } = await query(
    `INSERT INTO gate_passes (booking_id, driver_id, parking_space_id, pass_code, valid_from, valid_until)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [bookingId, req.user.id, booking.parking_space_id, passCode, booking.start_time, booking.end_time]
  )
  success(res, rows[0], 201)
})

module.exports = { listMyGatePasses, createGatePass }
