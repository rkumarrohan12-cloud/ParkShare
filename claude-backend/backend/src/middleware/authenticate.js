const jwt = require('jsonwebtoken')
const ApiError = require('../utils/ApiError')
const { query } = require('../config/db')

const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : null
    if (!token) throw new ApiError(401, 'Authentication token missing.')

    const payload = jwt.verify(token, process.env.JWT_SECRET)

    const { rows } = await query('SELECT id, name, email, role, status FROM users WHERE id = $1', [payload.sub])
    const user = rows[0]
    if (!user) throw new ApiError(401, 'User no longer exists.')
    if (user.status === 'SUSPENDED') throw new ApiError(403, 'This account has been suspended.')

    req.user = user
    next()
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Invalid or expired token.'))
    }
    next(err)
  }
}

module.exports = authenticate
