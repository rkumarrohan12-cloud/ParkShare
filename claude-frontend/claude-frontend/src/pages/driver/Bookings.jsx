import { useEffect, useState } from 'react'
import DashboardShell from '../../components/common/DashboardShell'
import EmptyState from '../../components/common/EmptyState'
import BookingCard from '../../components/driver/BookingCard'
import { driverNavItems } from '../../components/driver/driverNav'
import { useAppData } from '../../context/AppDataContext'
import { useAuth } from '../../context/AuthContext'
import {
  bookingAPI,
  paymentAPI,
} from '../../services/api'

const TABS = [
  'Upcoming',
  'Active',
  'Completed',
  'Cancelled',
]

export default function Bookings() {
  const { user } = useAuth()

  const {
    bookings: contextBookings,
    parkingSpaces,
    updateBookingStatus,
  } = useAppData()

  const [bookings, setBookings] = useState([])

  const [tab, setTab] =
    useState('Upcoming')

  const [payments, setPayments] =
    useState([])

  const [payingId, setPayingId] =
    useState(null)

  const [paymentMessage, setPaymentMessage] =
    useState('')

  const [loadingBookings, setLoadingBookings] =
    useState(true)

  const [loadingPayments, setLoadingPayments] =
    useState(true)

  /*
   * Load latest bookings from backend.
   */
  const loadBookings = async () => {
    try {
      setLoadingBookings(true)

      const response =
        await bookingAPI.getMyBookings()

      const data =
        Array.isArray(response?.data)
          ? response.data
          : []

      setBookings(data)
    } catch (error) {
      console.error(
        'Failed to load bookings:',
        error
      )

      /*
       * Fallback to context data
       * if backend request fails.
       */
      setBookings(
        Array.isArray(contextBookings)
          ? contextBookings
          : []
      )
    } finally {
      setLoadingBookings(false)
    }
  }

  /*
   * Load latest payments from backend.
   */
  const loadPayments = async () => {
    try {
      setLoadingPayments(true)

      const response =
        await paymentAPI.getAll()

      const data =
        Array.isArray(response?.data)
          ? response.data.filter(
              Boolean
            )
          : []

      setPayments(data)
    } catch (error) {
      console.error(
        'Failed to load payments:',
        error
      )

      setPayments([])
    } finally {
      setLoadingPayments(false)
    }
  }

  /*
   * Initial load.
   */
  useEffect(() => {
    if (user?.id) {
      loadBookings()
      loadPayments()
    }
  }, [user?.id])

  /*
   * Only show bookings belonging
   * to currently logged-in driver.
   */
  const myBookings =
    bookings.filter(
      (booking) =>
        booking &&
        booking.driver_id ===
          user?.id
    )

  /*
   * Decide which tab a booking
   * belongs to.
   */
  const getTabStatus = (booking) => {
    switch (booking.status) {
      case 'PENDING':
        return 'Upcoming'

      case 'CONFIRMED':
        return 'Upcoming'

      case 'ACTIVE':
        return 'Active'

      case 'COMPLETED':
        return 'Completed'

      case 'CANCELLED':
        return 'Cancelled'

      default:
        return 'Upcoming'
    }
  }

  /*
   * Filter and sort bookings.
   */
  const filtered =
    myBookings
      .filter(
        (booking) =>
          getTabStatus(
            booking
          ) === tab
      )
      .sort(
        (a, b) =>
          new Date(
            b.created_at || 0
          ) -
          new Date(
            a.created_at || 0
          )
      )

  /*
   * Find successful payment
   * for a booking.
   *
   * The `payment &&` check prevents
   * undefined objects from crashing
   * the page.
   */
  const getPayment = (
    bookingId
  ) => {
    return payments.find(
      (payment) =>
        payment &&
        payment.booking_id ===
          bookingId &&
        payment.status ===
          'SUCCESS'
    )
  }

  /*
   * Pay for booking.
   *
   * Backend response:
   *
   * {
   *   success: true,
   *   data: {
   *     payment: {...},
   *     booking: {...}
   *   }
   * }
   */
  const handlePayment =
    async (booking) => {
      try {
        setPayingId(
          booking.id
        )

        setPaymentMessage('')

        /*
         * Send payment request.
         */
        const response =
          await paymentAPI.create({
            bookingId:
              booking.id,

            paymentMethod:
              'SANDBOX',
          })

        console.log(
          'Payment response:',
          response
        )

        /*
         * Extract payment safely.
         */
        const payment =
          response?.data?.payment

        /*
         * The backend has already
         * processed the payment.
         *
         * We do not manually modify
         * booking/payment state here.
         */

        /*
         * Reload both resources from
         * the database.
         */
        await Promise.all([
          loadBookings(),
          loadPayments(),
        ])

        /*
         * Show success message.
         */
        if (
          payment?.transaction_id
        ) {
          setPaymentMessage(
            `Payment successful! Transaction ID: ${payment.transaction_id}`
          )
        } else {
          setPaymentMessage(
            'Payment successful! Your booking is now confirmed.'
          )
        }
      } catch (error) {
        console.error(
          'Payment failed:',
          error
        )

        setPaymentMessage(
          error.message ||
            'Payment failed. Please try again.'
        )
      } finally {
        setPayingId(null)
      }
    }

  /*
   * Cancel booking.
   */
  const handleCancel =
    async (bookingId) => {
      try {
        setPaymentMessage('')

        await updateBookingStatus(
          bookingId,
          'CANCELLED'
        )

        await loadBookings()

        setPaymentMessage(
          'Booking cancelled successfully.'
        )
      } catch (error) {
        console.error(
          'Failed to cancel booking:',
          error
        )

        setPaymentMessage(
          error.message ||
            'Failed to cancel booking.'
        )
      }
    }

  /*
   * Loading state.
   */
  if (loadingBookings) {
    return (
      <DashboardShell
        portalLabel="Driver Portal"
        navItems={driverNavItems}
      >
        <div className="flex justify-center py-20">
          <p className="text-navy/50">
            Loading bookings...
          </p>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell
      portalLabel="Driver Portal"
      navItems={driverNavItems}
    >
      <h1 className="text-2xl font-extrabold mb-6">
        My Bookings
      </h1>

      {/* Payment / booking message */}
      {paymentMessage && (
        <div className="mb-6 rounded-xl bg-primary-50 border border-primary/20 px-4 py-3 text-sm text-primary-700">
          {paymentMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() =>
              setTab(t)
            }
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${
              tab === t
                ? 'bg-primary text-white'
                : 'bg-white text-navy/60 border border-black/10'
            }`}
          >
            {t} (
            {
              myBookings.filter(
                (booking) =>
                  getTabStatus(
                    booking
                  ) === t
              ).length
            }
            )
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="event_busy"
          title={`No ${tab.toLowerCase()} bookings`}
          subtitle="Bookings you make will show up here."
        />
      ) : (
        <div className="space-y-4">
          {filtered.map(
            (booking) => {
              if (!booking) {
                return null
              }

              const payment =
                getPayment(
                  booking.id
                )

              return (
                <div
                  key={booking.id}
                  className="space-y-2"
                >
                  {/* Booking Card */}
                  <BookingCard
                    booking={
                      booking
                    }
                    space={parkingSpaces.find(
                      (space) =>
                        space.id ===
                        booking.parking_space_id
                    )}
                    onCancel={
                      handleCancel
                    }
                  />

                  {/* Payment Section */}
                  {(booking.status ===
                    'PENDING' ||
                    booking.status ===
                      'CONFIRMED') && (
                    <div className="bg-white rounded-xl border border-black/5 shadow-card px-5 py-4 flex items-center justify-between gap-4 flex-wrap">

                      {/* Payment information */}
                      <div>
                        <p className="font-semibold text-sm">
                          Payment
                        </p>

                        {loadingPayments ? (
                          <p className="text-xs text-navy/40 mt-1">
                            Checking payment status...
                          </p>
                        ) : payment ? (
                          <p className="text-xs text-primary-700 mt-1">
                            Paid successfully
                          </p>
                        ) : (
                          <p className="text-xs text-navy/40 mt-1">
                            Payment required
                          </p>
                        )}
                      </div>

                      {/* Payment success */}
                      {payment ? (
                        <div className="text-right">

                          <p className="text-sm font-semibold text-primary-700">
                            ₹
                            {Number(
                              payment.amount ||
                                0
                            ).toFixed(2)}
                          </p>

                          <p className="text-xs text-navy/40">
                            {
                              payment.transaction_id
                            }
                          </p>

                        </div>
                      ) : (
                        /* Pay button */
                        <button
                          onClick={() =>
                            handlePayment(
                              booking
                            )
                          }
                          disabled={
                            payingId ===
                            booking.id
                          }
                          className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {payingId ===
                          booking.id
                            ? 'Processing...'
                            : `Pay ₹${Number(
                                booking.total_amount ||
                                  0
                              ).toFixed(2)}`}
                        </button>
                      )}

                    </div>
                  )}
                </div>
              )
            }
          )}
        </div>
      )}
    </DashboardShell>
  )
}