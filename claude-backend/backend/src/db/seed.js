const bcrypt = require('bcrypt')
const { pool } = require('../config/db')

const DEMO_PASSWORD = 'demo1234'

async function seed() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // Wipe existing demo data (order matters due to FKs)
    await client.query('TRUNCATE gate_passes, payments, favorites, bookings, parking_spaces, users RESTART IDENTITY CASCADE')

    const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10)

    const users = [
      { name: 'System Admin', email: 'admin@parkshare.demo', phone: '+91 90000 00000', role: 'ADMIN' },
      { name: 'Priya Nair', email: 'owner1@parkshare.demo', phone: '+91 91234 56789', role: 'OWNER' },
      { name: 'Rohit Sharma', email: 'owner2@parkshare.demo', phone: '+91 91234 00001', role: 'OWNER' },
      { name: 'Aditya Rao', email: 'driver1@parkshare.demo', phone: '+91 98765 43210', role: 'DRIVER' },
      { name: 'Meera Iyer', email: 'driver2@parkshare.demo', phone: '+91 98765 00002', role: 'DRIVER' },
      { name: 'Karan Verma', email: 'driver3@parkshare.demo', phone: '+91 98765 00003', role: 'DRIVER' },
    ]

    const userIds = {}
    for (const u of users) {
      const res = await client.query(
        `INSERT INTO users (name, email, password_hash, phone, role)
         VALUES ($1, $2, $3, $4, $5) RETURNING id, email`,
        [u.name, u.email, passwordHash, u.phone, u.role]
      )
      userIds[u.email] = res.rows[0].id
    }

    const owner1 = userIds['owner1@parkshare.demo']
    const owner2 = userIds['owner2@parkshare.demo']
    const driver1 = userIds['driver1@parkshare.demo']
    const driver2 = userIds['driver2@parkshare.demo']

    const spaces = [
      {
        owner_id: owner1, title: 'Green Valley Residency', description: 'Secure covered parking inside a gated residency.',
        address: 'Sector 62, Noida', city: 'Noida', latitude: 28.6274, longitude: 77.3716,
        price_per_hour: 30, vehicle_type: 'SUV', amenities: ['covered', 'cctv', 'security'],
      },
      {
        owner_id: owner1, title: 'Tech Heights', description: 'Basement parking with EV charging, available 24/7.',
        address: 'Sector 63, Noida', city: 'Noida', latitude: 28.6142, longitude: 77.3910,
        price_per_hour: 40, vehicle_type: 'EV', amenities: ['covered', 'cctv', 'ev_charging', 'well_lit'],
      },
      {
        owner_id: owner2, title: 'Park Avenue', description: 'Open-air parking spot, ideal for bikes and small cars.',
        address: 'Sector 61, Noida', city: 'Noida', latitude: 28.6088, longitude: 77.3623,
        price_per_hour: 25, vehicle_type: 'HATCHBACK', amenities: ['well_lit'],
      },
      {
        owner_id: owner2, title: 'Sunshine Society', description: 'Stilt parking with weekend security.',
        address: 'Sector 50, Noida', city: 'Noida', latitude: 28.5751, longitude: 77.3568,
        price_per_hour: 35, vehicle_type: 'SEDAN', amenities: ['covered', 'security'],
      },
    ]

    const spaceIds = []
    for (const s of spaces) {
      const res = await client.query(
        `INSERT INTO parking_spaces
           (owner_id, title, description, address, city, latitude, longitude, price_per_hour, vehicle_type, amenities)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
        [s.owner_id, s.title, s.description, s.address, s.city, s.latitude, s.longitude, s.price_per_hour, s.vehicle_type, JSON.stringify(s.amenities)]
      )
      spaceIds.push(res.rows[0].id)
    }

    // Sample bookings: one upcoming (confirmed), one completed, one cancelled
    const now = new Date()
    const inTwoDays = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)
    const inTwoDaysPlus3h = new Date(inTwoDays.getTime() + 3 * 60 * 60 * 1000)
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const lastWeekPlus2h = new Date(lastWeek.getTime() + 2 * 60 * 60 * 1000)
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const yesterdayPlus1h = new Date(yesterday.getTime() + 60 * 60 * 1000)

    const bookings = [
      { parking_space_id: spaceIds[0], driver_id: driver1, start_time: inTwoDays, end_time: inTwoDaysPlus3h, total_amount: 90, status: 'CONFIRMED' },
      { parking_space_id: spaceIds[1], driver_id: driver1, start_time: lastWeek, end_time: lastWeekPlus2h, total_amount: 80, status: 'COMPLETED' },
      { parking_space_id: spaceIds[2], driver_id: driver2, start_time: yesterday, end_time: yesterdayPlus1h, total_amount: 25, status: 'CANCELLED' },
    ]

    const bookingIds = []
    for (const b of bookings) {
      const res = await client.query(
        `INSERT INTO bookings (parking_space_id, driver_id, start_time, end_time, total_amount, status)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [b.parking_space_id, b.driver_id, b.start_time, b.end_time, b.total_amount, b.status]
      )
      bookingIds.push(res.rows[0].id)
    }

    // Payment for the completed booking
    await client.query(
      `INSERT INTO payments (booking_id, amount, status, payment_method, transaction_id)
       VALUES ($1, $2, 'SUCCESS', 'SANDBOX', $3)`,
      [bookingIds[1], 80, `TXN-${bookingIds[1].slice(0, 8)}`]
    )

    // Favorite
    await client.query(
      `INSERT INTO favorites (user_id, parking_space_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [driver1, spaceIds[1]]
    )

    await client.query('COMMIT')
    console.log('Seed complete.')
    console.log(`Demo password for all seeded users: ${DEMO_PASSWORD}`)
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Seed failed:', err.message)
    process.exitCode = 1
  } finally {
    client.release()
    await pool.end()
  }
}

seed()
