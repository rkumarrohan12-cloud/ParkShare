const ApiError = require('../utils/ApiError')

const isEmail = (v) => typeof v === 'string' && /^\S+@\S+\.\S+$/.test(v)
const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0
const isPositiveNumber = (v) => typeof v === 'number' && !Number.isNaN(v) && v > 0
const isISODate = (v) => typeof v === 'string' && !Number.isNaN(Date.parse(v))

const require_ = (body, fields) => {
  const missing = fields.filter((f) => body[f] === undefined || body[f] === null || body[f] === '')
  if (missing.length) throw new ApiError(400, `Missing required field(s): ${missing.join(', ')}`)
}

module.exports = { isEmail, isNonEmptyString, isPositiveNumber, isISODate, require: require_ }
