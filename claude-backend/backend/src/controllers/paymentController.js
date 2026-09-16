const crypto = require('crypto')
const {
  query,
  getClient,
} = require('../config/db')

const { success } =
  require('../utils/response')

const ApiError =
  require('../utils/ApiError')

const asyncHandler =
  require('../utils/asyncHandler')

const validate =
  require('../utils/validate')

// POST /api/payments
//
// Current implementation is a SANDBOX
// payment flow.
//
// Later this same structure can be
// connected to PhonePe / UPI / Card
// gateway verification.
const createPayment =
  asyncHandler(async (req, res) => {
    const {
      bookingId,
      paymentMethod,
    } = req.body

    validate.require(
      req.body,
      ['bookingId']
    )

    const allowedMethods = [
      'SANDBOX',
      'UPI',
      'PHONEPE',
      'CARD',
    ]

    const method =
      paymentMethod || 'SANDBOX'

    if (
      !allowedMethods.includes(
        method
      )
    ) {
      throw new ApiError(
        400,
        `paymentMethod must be one of: ${allowedMethods.join(', ')}`
      )
    }

    const client =
      await getClient()

    try {
      await client.query('BEGIN')

      /*
       * Lock the booking row.
       *
       * This prevents two payment
       * requests from processing the
       * same booking simultaneously.
       */
      const bookingRes =
        await client.query(
          `SELECT *
           FROM bookings
           WHERE id = $1
           FOR UPDATE`,
          [bookingId]
        )

      const booking =
        bookingRes.rows[0]

      if (!booking) {
        throw new ApiError(
          404,
          'Booking not found.'
        )
      }

      /*
       * Only the driver who created
       * the booking can pay for it.
       */
      if (
        booking.driver_id !==
        req.user.id
      ) {
        throw new ApiError(
          403,
          'You cannot pay for this booking.'
        )
      }

      /*
       * Payment is allowed only for
       * pending or confirmed bookings.
       */
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
          `Cannot pay for a booking with status ${booking.status}.`
        )
      }

      /*
       * Check whether this booking
       * already has a successful
       * payment.
       */
      const existingPaid =
        await client.query(
          `SELECT *
           FROM payments
           WHERE booking_id = $1
             AND status = 'SUCCESS'
           LIMIT 1`,
          [bookingId]
        )

      if (
        existingPaid.rows.length
      ) {
        throw new ApiError(
          409,
          'This booking has already been paid for.'
        )
      }

      /*
       * IMPORTANT:
       *
       * Never trust amount coming from
       * the frontend.
       *
       * The amount is taken directly
       * from the booking stored in DB.
       */
      const amount =
        Number(
          booking.total_amount
        )

      if (
        !Number.isFinite(amount) ||
        amount < 0
      ) {
        throw new ApiError(
          400,
          'Invalid booking amount.'
        )
      }

      /*
       * Generate unique transaction ID.
       */
      const transactionId =
        `TXN-${crypto
          .randomBytes(8)
          .toString('hex')
          .toUpperCase()}`

      /*
       * Create successful sandbox
       * payment.
       *
       * Real gateway integration will
       * replace this section later.
       */
      const paymentRes =
        await client.query(
          `INSERT INTO payments
            (
              booking_id,
              amount,
              status,
              payment_method,
              transaction_id
            )
           VALUES
            (
              $1,
              $2,
              'SUCCESS',
              $3,
              $4
            )
           RETURNING *`,
          [
            bookingId,
            amount,
            method,
            transactionId,
          ]
        )

      /*
       * Payment successfully completed.
       *
       * Convert PENDING booking to
       * CONFIRMED.
       */
      let updatedBooking =
        booking

      if (
        booking.status ===
        'PENDING'
      ) {
        const bookingUpdate =
          await client.query(
            `UPDATE bookings
             SET status = 'CONFIRMED'
             WHERE id = $1
             RETURNING *`,
            [bookingId]
          )

        updatedBooking =
          bookingUpdate.rows[0]
      }

      await client.query(
        'COMMIT'
      )

      success(
        res,
        {
          payment:
            paymentRes.rows[0],

          booking:
            updatedBooking,
        },
        201
      )
    } catch (err) {
      await client.query(
        'ROLLBACK'
      )

      throw err
    } finally {
      client.release()
    }
  })

// GET /api/payments
const listMyPayments =
  asyncHandler(async (req, res) => {
    const { rows } =
      await query(
        `SELECT
           pay.*,
           b.start_time,
           b.end_time,
           b.status AS booking_status,
           p.title AS parking_title
         FROM payments pay

         JOIN bookings b
           ON b.id = pay.booking_id

         JOIN parking_spaces p
           ON p.id =
              b.parking_space_id

         WHERE b.driver_id = $1

         ORDER BY
           pay.created_at DESC`,
        [req.user.id]
      )

    success(res, rows)
  })

module.exports = {
  createPayment,
  listMyPayments,
}