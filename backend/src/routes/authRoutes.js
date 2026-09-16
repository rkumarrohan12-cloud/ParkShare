const express = require('express')
const { signup, login, me } = require('../controllers/authController')
const authenticate = require('../middleware/authenticate')

const router = express.Router()

router.post('/signup', signup)
router.post('/login', login)
router.get('/me', authenticate, me)

module.exports = router
