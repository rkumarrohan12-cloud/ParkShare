const ApiError = require('../utils/ApiError')

const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return next(new ApiError(401, 'Authentication required.'))
  if (!roles.includes(req.user.role)) return next(new ApiError(403, 'You do not have access to this resource.'))
  next()
}

module.exports = authorize
