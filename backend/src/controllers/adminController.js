const { query } = require('../config/db')
const { success } = require('../utils/response')
const ApiError = require('../utils/ApiError')
const asyncHandler = require('../utils/asyncHandler')
const validate = require('../utils/validate')

// GET /api/admin/stats
const getStats = asyncHandler(async (req, res) => {
  const [users, drivers, owners, spaces, bookings, revenue] = await Promise.all([
    query('SELECT COUNT(*) FROM users'),
    query(`SELECT COUNT(*) FROM users WHERE role = 'DRIVER'`),
    query(`SELECT COUNT(*) FROM users WHERE role = 'OWNER'`),
    query('SELECT COUNT(*) FROM parking_spaces'),
    query('SELECT COUNT(*) FROM bookings'),
    query(`SELECT COALESCE(SUM(total_amount), 0) FROM bookings WHERE status != 'CANCELLED'`),
  ])
  success(res, {
    totalUsers: Number(users.rows[0].count),
    drivers: Number(drivers.rows[0].count),
    owners: Number(owners.rows[0].count),
    parkingSpaces: Number(spaces.rows[0].count),
    totalBookings: Number(bookings.rows[0].count),
    revenue: Number(revenue.rows[0].coalesce),
  })
})

// GET /api/admin/users
const listUsers = asyncHandler(async (req, res) => {
  const { rows } = await query('SELECT id, name, email, phone, role, status, created_at FROM users ORDER BY created_at DESC')
  success(res, rows)
})

// PATCH /api/admin/users/:id/status
const updateUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body
  validate.require(req.body, ['status'])
  if (!['ACTIVE', 'SUSPENDED'].includes(status)) throw new ApiError(400, 'status must be ACTIVE or SUSPENDED.')

  const { rows } = await query(
    'UPDATE users SET status = $1 WHERE id = $2 RETURNING id, name, email, role, status',
    [status, req.params.id]
  )
  if (!rows.length) throw new ApiError(404, 'User not found.')
  success(res, rows[0])
})

// GET /api/admin/parking
const listAllParking = asyncHandler(async (req, res) => {
  const { rows } = await query(
    `SELECT p.*, u.name AS owner_name FROM parking_spaces p
     JOIN users u ON u.id = p.owner_id ORDER BY p.created_at DESC`
  )
  success(res, rows)
})

// PATCH /api/admin/parking/:id/status
const updateParkingStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body
  if (isActive === undefined) throw new ApiError(400, 'isActive is required.')

  const { rows } = await query(
    'UPDATE parking_spaces SET is_active = $1 WHERE id = $2 RETURNING *',
    [Boolean(isActive), req.params.id]
  )
  if (!rows.length) throw new ApiError(404, 'Parking space not found.')
  success(res, rows[0])
})

// GET /api/admin/bookings
const listAllBookings = asyncHandler(async (req, res) => {
  const { rows } = await query(
    `SELECT b.*, p.title AS parking_title, u.name AS driver_name
     FROM bookings b
     JOIN parking_spaces p ON p.id = b.parking_space_id
     JOIN users u ON u.id = b.driver_id
     ORDER BY b.created_at DESC`
  )
  success(res, rows)
})

// PATCH /api/admin/bookings/:id/status
const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body
  const allowed = ['PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED']
  validate.require(req.body, ['status'])
  if (!allowed.includes(status)) throw new ApiError(400, `status must be one of: ${allowed.join(', ')}`)

  const { rows } = await query('UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *', [status, req.params.id])
  if (!rows.length) throw new ApiError(404, 'Booking not found.')
  success(res, rows[0])
})

module.exports = {
  getStats, listUsers, updateUserStatus, listAllParking, updateParkingStatus,
  listAllBookings, updateBookingStatus,
}
