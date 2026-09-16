const { query } = require('../config/db')
const { success } = require('../utils/response')
const ApiError = require('../utils/ApiError')
const asyncHandler = require('../utils/asyncHandler')
const validate = require('../utils/validate')
const { hasOverlap } = require('../services/bookingService')

const PLATFORM_FEE_RATE = 0.08

// POST /api/bookings
const createBooking = asyncHandler(async (req, res) => {
  const {
    parkingSpaceId,
    startTime,
    endTime,
    vehicleNumber,
  } = req.body

  validate.require(req.body, [
    'parkingSpaceId',
    'startTime',
    'endTime',
    'vehicleNumber',
  ])

  // =========================================
  // VEHICLE NUMBER VALIDATION
  // =========================================

  const cleanVehicleNumber =
    String(vehicleNumber).trim().toUpperCase()

  if (
    cleanVehicleNumber.length < 6 ||
    cleanVehicleNumber.length > 20
  ) {
    throw new ApiError(
      400,
      'Vehicle number must be between 6 and 20 characters.'
    )
  }

  // Basic Indian vehicle number format
  if (
    !/^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{1,4}$/.test(
      cleanVehicleNumber
    )
  ) {
    throw new ApiError(
      400,
      'Please enter a valid vehicle number, e.g. UP16AB1234.'
    )
  }

  // =========================================
  // DATE VALIDATION
  // =========================================

  if (
    !validate.isISODate(startTime) ||
    !validate.isISODate(endTime)
  ) {
    throw new ApiError(
      400,
      'startTime/endTime must be valid date-times.'
    )
  }

  const start = new Date(startTime)
  const end = new Date(endTime)

  // Validate time range
  if (end <= start) {
    throw new ApiError(
      400,
      'endTime must be after startTime.'
    )
  }

  // Prevent past bookings
  if (
    start <
    new Date(Date.now() - 5 * 60 * 1000)
  ) {
    throw new ApiError(
      400,
      'startTime cannot be in the past.'
    )
  }

  // =========================================
  // GET PARKING SPACE
  // =========================================

  const spaceRes = await query(
    `SELECT *
     FROM parking_spaces
     WHERE id = $1`,
    [parkingSpaceId]
  )

  const space = spaceRes.rows[0]

  if (!space) {
    throw new ApiError(
      404,
      'Parking space not found.'
    )
  }

  // Parking must be active
  if (!space.is_active) {
    throw new ApiError(
      400,
      'This parking space is not currently active.'
    )
  }

  // Owner cannot book own parking
  if (space.owner_id === req.user.id) {
    throw new ApiError(
      403,
      'You cannot book your own parking space.'
    )
  }

  // =========================================
  // CHECK OVERLAPPING BOOKINGS
  // =========================================

  const overlap = await hasOverlap(
    parkingSpaceId,
    start,
    end
  )

  if (overlap) {
    throw new ApiError(
      409,
      'This parking space is already booked for the selected time range.'
    )
  }

  // =========================================
  // PRICE CALCULATION
  // =========================================

  // Calculate duration in hours
  const hours =
    (end - start) /
    (1000 * 60 * 60)

  // Get hourly parking price
  const pricePerHour =
    Number(space.price_per_hour)

  if (
    !Number.isFinite(pricePerHour) ||
    pricePerHour <= 0
  ) {
    throw new ApiError(
      400,
      'Invalid parking price.'
    )
  }

  // Parking charge
  const parkingCharge =
    Math.round(
      hours *
        pricePerHour *
        100
    ) / 100

  // Platform fee = 8%
  const platformFee =
    Math.round(
      parkingCharge *
        PLATFORM_FEE_RATE *
        100
    ) / 100

  // Final amount
  const totalAmount =
    Math.round(
      (
        parkingCharge +
        platformFee
      ) *
        100
    ) / 100

  // =========================================
  // DEBUG
  // =========================================

  console.log(
    '========================================'
  )

  console.log(
    'BOOKING PRICE DEBUG'
  )

  console.log({
    bookingId: 'NEW',
    parkingSpaceId,
    vehicleNumber: cleanVehicleNumber,
    hours,
    pricePerHour,
    parkingCharge,
    platformFee,
    totalAmount,
  })

  console.log(
    '========================================'
  )

  // =========================================
  // CREATE BOOKING
  // =========================================

  const { rows } = await query(
    `INSERT INTO bookings
      (
        parking_space_id,
        driver_id,
        start_time,
        end_time,
        vehicle_number,
        total_amount,
        status
      )
     VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        'PENDING'
      )
     RETURNING *`,
    [
      parkingSpaceId,
      req.user.id,
      start,
      end,
      cleanVehicleNumber,
      totalAmount,
    ]
  )

  const booking = rows[0]

  // Return booking with complete price breakdown
  success(
    res,
    {
      ...booking,

      parking_charge:
        parkingCharge,

      platform_fee:
        platformFee,

      total_amount:
        totalAmount,
    },
    201
  )
})

// GET /api/bookings
const listMyBookings = asyncHandler(
  async (req, res) => {
    const { rows } = await query(
      `SELECT
         b.*,
         p.title,
         p.address,
         p.city,
         p.price_per_hour
       FROM bookings b
       JOIN parking_spaces p
         ON p.id = b.parking_space_id
       WHERE b.driver_id = $1
       ORDER BY b.created_at DESC`,
      [req.user.id]
    )

    /*
     * Add parking charge and platform fee
     * to every booking returned to frontend.
     */
    const formattedBookings =
      rows.map((booking) => {
        const hours =
          (
            new Date(
              booking.end_time
            ) -
            new Date(
              booking.start_time
            )
          ) /
          (1000 * 60 * 60)

        const parkingCharge =
          Math.round(
            hours *
              Number(
                booking.price_per_hour
              ) *
              100
          ) / 100

        const platformFee =
          Math.round(
            parkingCharge *
              PLATFORM_FEE_RATE *
              100
          ) / 100

        return {
          ...booking,

          parking_charge:
            parkingCharge,

          platform_fee:
            platformFee,

          total_amount:
            Number(
              booking.total_amount
            ),
        }
      })

    success(
      res,
      formattedBookings
    )
  }
)

// GET /api/bookings/:id
const getBooking = asyncHandler(
  async (req, res) => {
    const { rows } = await query(
      `SELECT
         b.*,
         p.title,
         p.address,
         p.city,
         p.price_per_hour
       FROM bookings b
       JOIN parking_spaces p
         ON p.id = b.parking_space_id
       WHERE b.id = $1`,
      [req.params.id]
    )

    const booking = rows[0]

    if (!booking) {
      throw new ApiError(
        404,
        'Booking not found.'
      )
    }

    // Driver can access own booking.
    // Admin can access any booking.
    if (
      booking.driver_id !== req.user.id &&
      req.user.role !== 'ADMIN'
    ) {
      throw new ApiError(
        403,
        'You do not have access to this booking.'
      )
    }

    // Calculate duration
    const hours =
      (
        new Date(
          booking.end_time
        ) -
        new Date(
          booking.start_time
        )
      ) /
      (1000 * 60 * 60)

    // Calculate parking charge
    const parkingCharge =
      Math.round(
        hours *
          Number(
            booking.price_per_hour
          ) *
          100
      ) / 100

    // Calculate platform fee
    const platformFee =
      Math.round(
        parkingCharge *
          PLATFORM_FEE_RATE *
          100
      ) / 100

    // Return complete price breakdown
    success(
      res,
      {
        ...booking,

        parking_charge:
          parkingCharge,

        platform_fee:
          platformFee,

        total_amount:
          Number(
            booking.total_amount
          ),
      }
    )
  }
)

// PATCH /api/bookings/:id/cancel
const cancelBooking = asyncHandler(
  async (req, res) => {
    const { rows } = await query(
      `SELECT *
       FROM bookings
       WHERE id = $1`,
      [req.params.id]
    )

    const booking = rows[0]

    if (!booking) {
      throw new ApiError(
        404,
        'Booking not found.'
      )
    }

    if (
      booking.driver_id !==
      req.user.id
    ) {
      throw new ApiError(
        403,
        'You cannot modify this booking.'
      )
    }

    if (
      ![
        'PENDING',
        'CONFIRMED',
      ].includes(
        booking.status
      )
    ) {
      throw new ApiError(
        400,
        `Booking with status ${booking.status} cannot be cancelled.`
      )
    }

    const updated =
      await query(
        `UPDATE bookings
         SET status = 'CANCELLED'
         WHERE id = $1
         RETURNING *`,
        [booking.id]
      )

    success(
      res,
      updated.rows[0]
    )
  }
)

module.exports = {
  createBooking,
  listMyBookings,
  getBooking,
  cancelBooking,
}