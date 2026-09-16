const { query } = require('../config/db')

// Returns true if an active (CONFIRMED/ACTIVE) booking overlaps the given range.
const hasOverlap = async (parkingSpaceId, startTime, endTime, excludeBookingId = null) => {
  const params = [parkingSpaceId, startTime, endTime]
  let sql = `
    SELECT 1 FROM bookings
    WHERE parking_space_id = $1
      AND status IN ('CONFIRMED', 'ACTIVE')
      AND start_time < $3
      AND end_time > $2
  `
  if (excludeBookingId) {
    params.push(excludeBookingId)
    sql += ` AND id != $4`
  }
  sql += ' LIMIT 1'

  const { rows } = await query(sql, params)
  return rows.length > 0
}

module.exports = { hasOverlap }
