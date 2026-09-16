const { query } = require('../config/db')
const { success } = require('../utils/response')
const ApiError = require('../utils/ApiError')
const asyncHandler = require('../utils/asyncHandler')
const { hasOverlap } = require('../services/bookingService')

// GET /api/parking?city=&vehicleType=&maxPrice=&start=&end=
const listParking = asyncHandler(async (req, res) => {
  const { city, vehicleType, maxPrice, start, end } = req.query

  const conditions = ['is_active = true']
  const params = []

  if (city) {
    params.push(`%${city}%`)
    conditions.push(`city ILIKE $${params.length}`)
  }
  if (vehicleType) {
    params.push(vehicleType)
    conditions.push(`vehicle_type = $${params.length}`)
  }
  if (maxPrice) {
    params.push(Number(maxPrice))
    conditions.push(`price_per_hour <= $${params.length}`)
  }

  let sql = `SELECT * FROM parking_spaces WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`
  const { rows } = await query(sql, params)

  // Optional availability filter: exclude spaces with an overlapping active booking
  if (start && end) {
    const startTime = new Date(start)
    const endTime = new Date(end)
    if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime()) || endTime <= startTime) {
      throw new ApiError(400, 'Invalid start/end date-time range.')
    }
    const available = []
    for (const space of rows) {
      const overlap = await hasOverlap(space.id, startTime, endTime)
      if (!overlap) available.push(space)
    }
    return success(res, available)
  }

  success(res, rows)
})

// GET /api/parking/:id
const getParking = asyncHandler(async (req, res) => {
  const { rows } = await query('SELECT * FROM parking_spaces WHERE id = $1', [req.params.id])
  if (!rows.length) throw new ApiError(404, 'Parking space not found.')
  success(res, rows[0])
})

module.exports = { listParking, getParking }
