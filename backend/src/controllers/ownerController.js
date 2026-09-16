const { query } = require('../config/db')
const { success } = require('../utils/response')
const ApiError = require('../utils/ApiError')
const asyncHandler = require('../utils/asyncHandler')
const validate = require('../utils/validate')

const BOOKING_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'ACTIVE',
  'COMPLETED',
  'CANCELLED',
]

// ============================================================
// CREATE PARKING
// POST /api/owner/parking
// ============================================================
const createParking = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    address,
    city,
    latitude,
    longitude,
    contactNumber,
    pricePerHour,
    vehicleType,
    amenities,
    image,
  } = req.body

  validate.require(req.body, [
    'title',
    'address',
    'city',
    'pricePerHour',
    'vehicleType',
  ])

  if (!validate.isPositiveNumber(Number(pricePerHour))) {
    throw new ApiError(
      400,
      'pricePerHour must be a positive number.'
    )
  }

  const { rows } = await query(
    `INSERT INTO parking_spaces
      (
        owner_id,
        title,
        description,
        address,
        city,
        latitude,
        longitude,
        contact_number,
        price_per_hour,
        vehicle_type,
        amenities,
        image,
        is_active,
        is_deleted
      )
     VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11,
        $12,
        true,
        false
      )
     RETURNING *`,
    [
      req.user.id,
      title,
      description || null,
      address,
      city,
      latitude || null,
      longitude || null,
      contactNumber || null,
      Number(pricePerHour),
      vehicleType,
      JSON.stringify(amenities || []),
      image || null,
    ]
  )

  success(res, rows[0], 201)
})

// ============================================================
// LIST MY PARKING
// GET /api/owner/parking
//
// Deleted parking spaces are hidden.
// Disabled parking spaces remain visible so owner can enable them.
// ============================================================
const listMyParking = asyncHandler(async (req, res) => {
  const { rows } = await query(
    `SELECT *
     FROM parking_spaces
     WHERE owner_id = $1
       AND is_deleted = false
     ORDER BY created_at DESC`,
    [req.user.id]
  )

  success(res, rows)
})

// ============================================================
// FIND OWNED PARKING SPACE
// ============================================================
const findOwnedSpace = async (
  id,
  ownerId
) => {
  const { rows } = await query(
    `SELECT *
     FROM parking_spaces
     WHERE id = $1
       AND owner_id = $2`,
    [id, ownerId]
  )

  const space = rows[0]

  if (!space) {
    throw new ApiError(
      404,
      'Parking space not found.'
    )
  }

  return space
}

// ============================================================
// GET MY PARKING BY ID
// GET /api/owner/parking/:id
// ============================================================
const getMyParkingById = asyncHandler(
  async (req, res) => {
    const space = await findOwnedSpace(
      req.params.id,
      req.user.id
    )

    if (space.is_deleted) {
      throw new ApiError(
        404,
        'Parking space has been deleted.'
      )
    }

    success(res, space)
  }
)

// ============================================================
// UPDATE PARKING
// PUT /api/owner/parking/:id
// ============================================================
const updateParking = asyncHandler(
  async (req, res) => {
    const existingSpace = await findOwnedSpace(
      req.params.id,
      req.user.id
    )

    if (existingSpace.is_deleted) {
      throw new ApiError(
        404,
        'Deleted parking space cannot be updated.'
      )
    }

    const {
      title,
      description,
      address,
      city,
      latitude,
      longitude,
      contactNumber,
      pricePerHour,
      vehicleType,
      amenities,
      image,
      isActive,
    } = req.body

    if (
      pricePerHour !== undefined &&
      !validate.isPositiveNumber(Number(pricePerHour))
    ) {
      throw new ApiError(
        400,
        'pricePerHour must be a positive number.'
      )
    }

    // If image is not sent, keep old image.
    // If image is sent as empty string, remove old image.
    const updatedImage =
      image !== undefined
        ? image || null
        : existingSpace.image

    const { rows } = await query(
      `UPDATE parking_spaces SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        address = COALESCE($3, address),
        city = COALESCE($4, city),
        latitude = COALESCE($5, latitude),
        longitude = COALESCE($6, longitude),
        contact_number = COALESCE($7, contact_number),
        price_per_hour = COALESCE($8, price_per_hour),
        vehicle_type = COALESCE($9, vehicle_type),
        amenities = COALESCE($10, amenities),
        image = $11,
        is_active = COALESCE($12, is_active)
       WHERE id = $13
         AND owner_id = $14
         AND is_deleted = false
       RETURNING *`,
      [
        title,
        description,
        address,
        city,
        latitude,
        longitude,
        contactNumber,
        pricePerHour !== undefined
          ? Number(pricePerHour)
          : null,
        vehicleType,
        amenities !== undefined
          ? JSON.stringify(amenities)
          : null,
        updatedImage,
        isActive !== undefined
          ? Boolean(isActive)
          : null,
        req.params.id,
        req.user.id,
      ]
    )

    if (!rows.length) {
      throw new ApiError(
        404,
        'Parking space not found.'
      )
    }

    success(res, rows[0])
  }
)

// ============================================================
// DELETE PARKING
// DELETE /api/owner/parking/:id
//
// IMPORTANT:
// This is a SOFT DELETE.
//
// is_active  -> Disable / Enable
// is_deleted -> Delete
//
// We do NOT physically delete the row.
// This keeps old bookings/payments safe.
// ============================================================
const deleteParking = asyncHandler(
  async (req, res) => {
    const existingSpace = await findOwnedSpace(
      req.params.id,
      req.user.id
    )

    if (existingSpace.is_deleted) {
      throw new ApiError(
        404,
        'Parking space has already been deleted.'
      )
    }

    const { rows } = await query(
      `UPDATE parking_spaces
       SET
         is_deleted = true,
         is_active = false
       WHERE id = $1
         AND owner_id = $2
         AND is_deleted = false
       RETURNING *`,
      [
        req.params.id,
        req.user.id,
      ]
    )

    if (!rows.length) {
      throw new ApiError(
        404,
        'Parking space could not be deleted.'
      )
    }

    success(res, {
      deleted: true,
      parking: rows[0],
    })
  }
)

// ============================================================
// LIST BOOKINGS ON MY PARKING SPACES
// GET /api/owner/bookings
// ============================================================
const listBookingsOnMySpaces =
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      `SELECT
        b.*,
        p.title AS parking_title,
        u.name AS driver_name
       FROM bookings b
       JOIN parking_spaces p
         ON p.id = b.parking_space_id
       JOIN users u
         ON u.id = b.driver_id
       WHERE p.owner_id = $1
       ORDER BY b.created_at DESC`,
      [req.user.id]
    )

    success(res, rows)
  })

// ============================================================
// UPDATE BOOKING STATUS
// PATCH /api/owner/bookings/:id/status
// ============================================================
const updateBookingStatus =
  asyncHandler(async (req, res) => {
    const { status } = req.body

    validate.require(req.body, [
      'status',
    ])

    if (!BOOKING_STATUSES.includes(status)) {
      throw new ApiError(
        400,
        `status must be one of: ${BOOKING_STATUSES.join(', ')}`
      )
    }

    const { rows } = await query(
      `SELECT
        b.*
       FROM bookings b
       JOIN parking_spaces p
         ON p.id = b.parking_space_id
       WHERE b.id = $1
         AND p.owner_id = $2`,
      [
        req.params.id,
        req.user.id,
      ]
    )

    if (!rows.length) {
      throw new ApiError(
        404,
        'Booking not found for your parking spaces.'
      )
    }

    const booking = rows[0]

    // Owner cannot confirm an unpaid booking
    if (
      booking.status === 'PENDING' &&
      status === 'CONFIRMED'
    ) {
      throw new ApiError(
        400,
        'This booking must be paid before it can be confirmed.'
      )
    }

    // Valid owner status transitions
    const allowedTransitions = {
      PENDING: [
        'CANCELLED',
      ],

      CONFIRMED: [
        'ACTIVE',
        'CANCELLED',
      ],

      ACTIVE: [
        'COMPLETED',
      ],

      COMPLETED: [],

      CANCELLED: [],
    }

    if (
      !allowedTransitions[
        booking.status
      ].includes(status)
    ) {
      throw new ApiError(
        400,
        `Cannot change booking status from ${booking.status} to ${status}.`
      )
    }

    const updated = await query(
      `UPDATE bookings
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [
        status,
        req.params.id,
      ]
    )

    success(
      res,
      updated.rows[0]
    )
  })

// ============================================================
// GET OWNER EARNINGS
// GET /api/owner/earnings
// ============================================================
const getEarnings = asyncHandler(
  async (req, res) => {
    /*
     * Earnings are calculated only from
     * successful payments.
     *
     * Deleted parking is intentionally NOT
     * filtered here because old bookings/payments
     * must remain part of owner's earnings.
     */

    const { rows } = await query(
      `SELECT
        COALESCE(
          SUM(pay.amount),
          0
        ) AS total,

        COALESCE(
          SUM(pay.amount)
          FILTER (
            WHERE pay.created_at >=
            date_trunc('month', now())
          ),
          0
        ) AS this_month,

        COALESCE(
          SUM(pay.amount)
          FILTER (
            WHERE pay.created_at >=
            now() - interval '7 days'
          ),
          0
        ) AS this_week,

        COALESCE(
          SUM(pay.amount)
          FILTER (
            WHERE b.status IN (
              'CONFIRMED',
              'ACTIVE'
            )
          ),
          0
        ) AS pending,

        COALESCE(
          SUM(pay.amount)
          FILTER (
            WHERE b.status = 'COMPLETED'
          ),
          0
        ) AS completed

       FROM payments pay

       JOIN bookings b
         ON b.id = pay.booking_id

       JOIN parking_spaces p
         ON p.id = b.parking_space_id

       WHERE p.owner_id = $1
         AND pay.status = 'SUCCESS'
         AND b.status != 'CANCELLED'`,
      [req.user.id]
    )

    success(res, {
      total: Number(
        rows[0].total || 0
      ),

      this_month: Number(
        rows[0].this_month || 0
      ),

      this_week: Number(
        rows[0].this_week || 0
      ),

      pending: Number(
        rows[0].pending || 0
      ),

      completed: Number(
        rows[0].completed || 0
      ),
    })
  }
)

// ============================================================
// GET OWNER DASHBOARD
// GET /api/owner/dashboard
// ============================================================
const getDashboard = asyncHandler(
  async (req, res) => {
    /*
     * Only non-deleted parking spaces are counted
     * in current owner dashboard slot statistics.
     *
     * Earnings are taken from successful payments
     * so deleting a parking space does not erase
     * historical earnings.
     */

    const { rows } = await query(
      `
      SELECT
        COUNT(DISTINCT p.id)
          FILTER (
            WHERE p.is_active = true
              AND p.is_deleted = false
          ) AS active_slots,

        COUNT(b.id)
          FILTER (
            WHERE b.status != 'CANCELLED'
              AND p.is_deleted = false
          ) AS total_bookings,

        COALESCE(
          (
            SELECT SUM(pay.amount)
            FROM payments pay
            JOIN bookings pb
              ON pb.id = pay.booking_id
            JOIN parking_spaces pp
              ON pp.id = pb.parking_space_id
            WHERE pp.owner_id = $1
              AND pay.status = 'SUCCESS'
              AND pb.status != 'CANCELLED'
          ),
          0
        ) AS total_earnings,

        COUNT(DISTINCT p.id)
          FILTER (
            WHERE p.is_deleted = false
          ) AS total_slots

      FROM parking_spaces p

      LEFT JOIN bookings b
        ON b.parking_space_id = p.id

      WHERE p.owner_id = $1
      `,
      [req.user.id]
    )

    const recentBookings =
      await query(
        `
        SELECT
          b.id,
          b.start_time,
          b.end_time,
          b.total_amount,
          b.vehicle_number,
          b.status,
          p.title AS parking_title,
          u.name AS driver_name

        FROM bookings b

        JOIN parking_spaces p
          ON p.id = b.parking_space_id

        JOIN users u
          ON u.id = b.driver_id

        WHERE p.owner_id = $1
          AND p.is_deleted = false

        ORDER BY b.created_at DESC

        LIMIT 5
        `,
        [req.user.id]
      )

    const stats = rows[0]

    const totalSlots =
      Number(
        stats.total_slots || 0
      )

    const totalBookings =
      Number(
        stats.total_bookings || 0
      )

    const occupancyRate =
      totalSlots
        ? Math.min(
            100,
            Math.round(
              (
                totalBookings /
                (totalSlots * 4)
              ) * 100
            )
          )
        : 0

    success(res, {
      stats: {
        totalEarnings: Number(
          stats.total_earnings || 0
        ),

        activeSlots: Number(
          stats.active_slots || 0
        ),

        totalBookings,

        totalSlots,

        occupancyRate,
      },

      recentBookings:
        recentBookings.rows,
    })
  }
)

// ============================================================
// EXPORTS
// ============================================================
module.exports = {
  createParking,
  listMyParking,
  getMyParkingById,
  updateParking,
  deleteParking,
  listBookingsOnMySpaces,
  updateBookingStatus,
  getEarnings,
  getDashboard,
}