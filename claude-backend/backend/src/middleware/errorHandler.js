const ApiError = require('../utils/ApiError')

const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`))
}

const errorHandler = (err, req, res, next) => {
  const status = err instanceof ApiError ? err.status : err.status || 500

  // Postgres unique_violation / foreign_key_violation -> friendlier messages
  let message = err.message || 'Internal server error.'
  if (err.code === '23505') message = 'This record already exists.'
  if (err.code === '23503') message = 'Related record not found.'
  if (err.code === '23514') message = 'Data failed a validation constraint.'

  if (status >= 500) {
    console.error(err)
  }

  res.status(status).json({ success: false, message })
}

module.exports = { notFound, errorHandler }
