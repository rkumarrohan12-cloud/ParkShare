const bcrypt = require('bcrypt')
const { query } = require('../config/db')
const { success } = require('../utils/response')
const ApiError = require('../utils/ApiError')
const asyncHandler = require('../utils/asyncHandler')
const validate = require('../utils/validate')
const { signToken, publicUser } = require('../services/authService')

const ROLES = ['DRIVER', 'OWNER', 'ADMIN']

const signup = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body
  validate.require(req.body, ['name', 'email', 'password', 'role'])
  if (!validate.isEmail(email)) throw new ApiError(400, 'Enter a valid email address.')
  if (typeof password !== 'string' || password.length < 6) throw new ApiError(400, 'Password must be at least 6 characters.')
  if (!ROLES.includes(role) || role === 'ADMIN') throw new ApiError(400, 'Role must be DRIVER or OWNER.')

  const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()])
  if (existing.rows.length) throw new ApiError(409, 'An account with that email already exists.')

  const passwordHash = await bcrypt.hash(password, 10)
  const { rows } = await query(
    `INSERT INTO users (name, email, password_hash, phone, role)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [name.trim(), email.toLowerCase(), passwordHash, phone || null, role]
  )
  const user = rows[0]
  const token = signToken(user)
  success(res, { token, user: publicUser(user) }, 201)
})

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  validate.require(req.body, ['email', 'password'])

  const { rows } = await query('SELECT * FROM users WHERE email = $1', [String(email).toLowerCase()])
  const user = rows[0]
  if (!user) throw new ApiError(401, 'Invalid email or password.')

  const match = await bcrypt.compare(password, user.password_hash)
  if (!match) throw new ApiError(401, 'Invalid email or password.')
  if (user.status === 'SUSPENDED') throw new ApiError(403, 'This account has been suspended.')

  const token = signToken(user)
  success(res, { token, user: publicUser(user) })
})

const me = asyncHandler(async (req, res) => {
  success(res, publicUser(req.user))
})

module.exports = { signup, login, me }
