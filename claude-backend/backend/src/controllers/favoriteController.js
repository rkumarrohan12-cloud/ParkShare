const { query } = require('../config/db')
const { success } = require('../utils/response')
const ApiError = require('../utils/ApiError')
const asyncHandler = require('../utils/asyncHandler')

// GET /api/favorites
const listFavorites = asyncHandler(async (req, res) => {
  const { rows } = await query(
    `SELECT p.* FROM favorites f
     JOIN parking_spaces p ON p.id = f.parking_space_id
     WHERE f.user_id = $1 ORDER BY f.created_at DESC`,
    [req.user.id]
  )
  success(res, rows)
})

// POST /api/favorites/:parkingId
const addFavorite = asyncHandler(async (req, res) => {
  const { parkingId } = req.params
  const spaceRes = await query('SELECT id FROM parking_spaces WHERE id = $1', [parkingId])
  if (!spaceRes.rows.length) throw new ApiError(404, 'Parking space not found.')

  const existing = await query('SELECT id FROM favorites WHERE user_id = $1 AND parking_space_id = $2', [req.user.id, parkingId])
  if (existing.rows.length) throw new ApiError(409, 'This parking space is already in your favorites.')

  const { rows } = await query(
    'INSERT INTO favorites (user_id, parking_space_id) VALUES ($1, $2) RETURNING *',
    [req.user.id, parkingId]
  )
  success(res, rows[0], 201)
})

// DELETE /api/favorites/:parkingId
const removeFavorite = asyncHandler(async (req, res) => {
  const { rows } = await query(
    'DELETE FROM favorites WHERE user_id = $1 AND parking_space_id = $2 RETURNING id',
    [req.user.id, req.params.parkingId]
  )
  if (!rows.length) throw new ApiError(404, 'Favorite not found.')
  success(res, { removed: true })
})

module.exports = { listFavorites, addFavorite, removeFavorite }
