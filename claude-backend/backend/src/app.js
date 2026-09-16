const express = require('express')
const cors = require('cors')

const authRoutes = require('./routes/authRoutes')
const parkingRoutes = require('./routes/parkingRoutes')
const bookingRoutes = require('./routes/bookingRoutes')
const favoriteRoutes = require('./routes/favoriteRoutes')
const paymentRoutes = require('./routes/paymentRoutes')
const gatePassRoutes = require('./routes/gatePassRoutes')
const ownerRoutes = require('./routes/ownerRoutes')
const adminRoutes = require('./routes/adminRoutes')
const { notFound, errorHandler } = require('./middleware/errorHandler')

const app = express()

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }))
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'ParkShare API is running' })
})

app.use('/api/auth', authRoutes)
app.use('/api/parking', parkingRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/favorites', favoriteRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/gate-passes', gatePassRoutes)
app.use('/api/owner', ownerRoutes)
app.use('/api/admin', adminRoutes)

app.use(notFound)
app.use(errorHandler)

module.exports = app
