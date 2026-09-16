import {
  useEffect,
  useState,
} from 'react'

import {
  useParams,
  useLocation,
  useNavigate,
  Link,
} from 'react-router-dom'

import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import Icon from '../components/common/Icon'
import Button from '../components/common/Button'

import { useAppData } from '../context/AppDataContext'
import { useAuth } from '../context/AuthContext'

import {
  VEHICLE_TYPES,
} from '../data/mockData'

import {
  bookingAPI,
  parkingAPI,
} from '../services/api'


function formatDate(dateString) {
  if (!dateString) return '—'

  return new Date(
    dateString
  ).toLocaleDateString(
    'en-IN',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }
  )
}


function formatTime(dateString) {
  if (!dateString) return '—'

  return new Date(
    dateString
  ).toLocaleTimeString(
    'en-IN',
    {
      hour: '2-digit',
      minute: '2-digit',
    }
  )
}


function formatMoney(value) {
  return Number(
    value || 0
  ).toFixed(2)
}


export default function Booking() {
  const { id } = useParams()

  const location = useLocation()

  const navigate = useNavigate()

  const {
    parkingSpaces,
  } = useAppData()

  const { user } = useAuth()

  const isNew = id === 'new'

  const draft = location.state


  const [booking, setBooking] =
    useState(null)

  const [space, setSpace] =
    useState(null)

  const [loading, setLoading] =
    useState(true)

  const [creating, setCreating] =
    useState(false)

  const [vehicleNumber, setVehicleNumber] =
    useState('')

  const [error, setError] =
    useState('')


  /*
   * Existing booking:
   * Load booking directly from backend.
   */
  useEffect(() => {
    const loadExistingBooking =
      async () => {
        if (isNew) {
          setLoading(false)
          return
        }

        try {
          setLoading(true)
          setError('')

          const response =
            await bookingAPI.getById(id)

          const backendBooking =
            response.data

          setBooking(
            backendBooking
          )

          /*
           * Load the related parking
           * space from backend.
           */
          const parkingResponse =
            await parkingAPI.getById(
              backendBooking.parking_space_id
            )

          setSpace(
            parkingResponse.data
          )
        } catch (err) {
          console.error(
            'Failed to load booking:',
            err
          )

          setError(
            err.message ||
              'Failed to load booking.'
          )
        } finally {
          setLoading(false)
        }
      }

    loadExistingBooking()
  }, [id, isNew])


  /*
   * New booking validation.
   */
  useEffect(() => {
    if (!isNew) return

    if (!draft) {
      setError(
        'No booking details found. Please start again from a parking listing.'
      )

      setLoading(false)

      return
    }

    const loadDraftParking =
      async () => {
        try {
          setLoading(true)
          setError('')

          /*
           * First try backend.
           */
          const response =
            await parkingAPI.getById(
              draft.parkingId
            )

          setSpace(
            response.data
          )
        } catch (err) {
          console.error(
            'Failed to load parking:',
            err
          )

          /*
           * Fallback to context data
           * so existing UI doesn't break.
           */
          const localSpace =
            parkingSpaces.find(
              (item) =>
                item.id ===
                draft.parkingId
            )

          if (localSpace) {
            setSpace(
              localSpace
            )
          } else {
            setError(
              err.message ||
                'Parking space not found.'
            )
          }
        } finally {
          setLoading(false)
        }
      }

    loadDraftParking()
  }, [
    isNew,
    draft,
    parkingSpaces,
  ])


  /*
   * Create actual backend booking.
   */
  const confirm = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    if (!draft) {
      setError(
        'Booking details are missing.'
      )
      return
    }

    if (!space) {
      setError(
        'Parking space not found.'
      )
      return
    }

    /*
     * Prevent owner from booking
     * their own parking.
     */
    if (
      space.owner_id &&
      space.owner_id === user.id
    ) {
      setError(
        'You cannot book your own parking space.'
      )
      return
    }

    if (
      !draft.date ||
      !draft.startTime ||
      !draft.endTime
    ) {
      setError(
        'Date and time information is missing.'
      )
      return
    }

    const start = new Date(
      `${draft.date}T${draft.startTime}`
    )

    const end = new Date(
      `${draft.date}T${draft.endTime}`
    )

    if (
      Number.isNaN(
        start.getTime()
      ) ||
      Number.isNaN(
        end.getTime()
      )
    ) {
      setError(
        'Invalid booking date or time.'
      )
      return
    }

    if (end <= start) {
      setError(
        'End time must be after start time.'
      )
      return
    }


    /*
     * ========================================
     * VEHICLE NUMBER VALIDATION
     * ========================================
     */

    const cleanVehicleNumber =
      vehicleNumber
        .trim()
        .toUpperCase()

    if (!cleanVehicleNumber) {
      setError(
        'Please enter your vehicle number.'
      )
      return
    }

    /*
     * Basic Indian vehicle number format.
     *
     * Examples:
     * UP16AB1234
     * DL01CA4567
     * HR26DK7890
     */
    if (
      !/^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{1,4}$/.test(
        cleanVehicleNumber
      )
    ) {
      setError(
        'Please enter a valid vehicle number, e.g. UP16AB1234.'
      )
      return
    }


    try {
      setCreating(true)
      setError('')

      /*
       * REAL BACKEND BOOKING
       */
      const response =
        await bookingAPI.create({
          parkingSpaceId:
            draft.parkingId,

          startTime:
            start.toISOString(),

          endTime:
            end.toISOString(),

          /*
           * Vehicle number sent
           * to backend.
           */
          vehicleNumber:
            cleanVehicleNumber,
        })

      const createdBooking =
        response.data

      /*
       * Move to the newly-created
       * booking details page.
       */
      navigate(
        `/booking/${createdBooking.id}`,
        {
          replace: true,
        }
      )
    } catch (err) {
      console.error(
        'Booking failed:',
        err
      )

      setError(
        err.message ||
          'Booking failed. Please try again.'
      )
    } finally {
      setCreating(false)
    }
  }


  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">

        <Navbar />

        <div className="flex-1 flex items-center justify-center">

          <p className="text-navy/50">
            Loading booking...
          </p>

        </div>

        <Footer />

      </div>
    )
  }


  if (
    error &&
    !space &&
    !booking
  ) {
    return (
      <RedirectMessage
        message={error}
      />
    )
  }


  /*
   * New booking uses draft data.
   * Existing booking uses backend data.
   */
  const isExisting =
    !isNew && booking


  const vehicleValue =
    isExisting
      ? null
      : draft?.vehicle


  const vehicleLabel =
    VEHICLE_TYPES.find(
      (v) =>
        v.id === vehicleValue
    )?.label ||
    vehicleValue ||
    '—'


  /*
   * Backend booking already has
   * final total amount.
   */
  const backendTotal =
    Number(
      booking?.total_amount || 0
    )


  /*
   * New booking uses frontend
   * estimate until backend creates it.
   */
  const estimatedParkingCharge =
    Number(
      draft?.parkingCharge || 0
    )


  const estimatedPlatformFee =
    Number(
      draft?.platformFee || 0
    )


  const estimatedTotal =
    Number(
      draft?.total || 0
    )


  const displayTotal =
    isExisting
      ? backendTotal
      : estimatedTotal


  return (
    <div className="min-h-screen flex flex-col">

      <Navbar />


      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}

        {isExisting ? (

          <div className="text-center mb-8">

            <div className="w-16 h-16 rounded-full bg-primary-50 text-primary flex items-center justify-center mx-auto mb-4">

              <Icon
                name={
                  booking.status ===
                  'CANCELLED'
                    ? 'cancel'
                    : 'check_circle'
                }
                size={36}
              />

            </div>


            <h1 className="text-2xl font-extrabold">

              {booking.status ===
              'CANCELLED'
                ? 'Booking Cancelled'
                : booking.status ===
                  'PENDING'
                ? 'Booking Created'
                : 'Booking Confirmed'}

            </h1>


            <p className="text-navy/50 mt-1">

              Booking ID{' '}

              <span className="font-semibold text-navy">

                {booking.id}

              </span>

            </p>

          </div>

        ) : (

          <div className="mb-6">

            <h1 className="text-2xl font-extrabold">

              Confirm your booking

            </h1>


            <p className="text-sm text-navy/50 mt-1">

              Review your parking details before confirming.

            </p>

          </div>

        )}


        {/* Error */}

        {error && (

          <div className="mb-5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">

            {error}

          </div>

        )}


        <div className="bg-white rounded-2xl shadow-card border border-black/5 p-6">


          {/* Parking */}

          <div className="flex items-center gap-4 pb-5 border-b border-black/5">

            <img
              src={
                space?.image ||
                space?.image_url ||
                'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=500&q=80'
              }
              alt={
                space?.title ||
                'Parking'
              }
              className="w-20 h-20 rounded-xl object-cover"
            />


            <div>

              <p className="font-bold">

                {space?.title ||
                  'Parking Space'}

              </p>


              <p className="text-sm text-navy/50">

                {space?.address ||
                  booking?.address ||
                  'Address unavailable'}

              </p>

            </div>

          </div>


          {/* Booking Information */}

          <div className="py-5 space-y-2.5 text-sm border-b border-black/5">

            <Row
              label="Date"
              value={
                isExisting
                  ? formatDate(
                      booking.start_time
                    )
                  : draft?.date ||
                    '—'
              }
            />


            <Row
              label="Time"
              value={
                isExisting
                  ? `${formatTime(
                      booking.start_time
                    )} – ${formatTime(
                      booking.end_time
                    )}`
                  : `${draft?.startTime || '—'} – ${
                      draft?.endTime ||
                      '—'
                    }`
              }
            />


            <Row
              label="Duration"
              value={
                isExisting
                  ? `${(
                      (new Date(
                        booking.end_time
                      ) -
                        new Date(
                          booking.start_time
                        )) /
                      (1000 * 60 * 60)
                    ).toFixed(2)} hour(s)`
                  : `${draft?.hours || '—'} hour(s)`
              }
            />


            {!isExisting && (

              <Row
                label="Vehicle"
                value={
                  vehicleLabel
                }
              />

            )}


            {/* Existing booking vehicle number */}

            {isExisting &&
              booking.vehicle_number && (

              <Row
                label="Vehicle Number"
                value={
                  booking.vehicle_number
                }
              />

            )}


            <Row
              label="Hourly rate"
              value={`₹${formatMoney(
                space?.price_per_hour ??
                  space?.pricePerHour
              )}/hour`}
            />

          </div>


          {/* Price */}

          <div className="py-5 space-y-2 text-sm border-b border-black/5">

            {isExisting ? (

              <Row
                label="Booking amount"
                value={`₹${formatMoney(
                  backendTotal
                )}`}
              />

            ) : (

              <>

                <Row
                  label="Parking charge"
                  value={`₹${formatMoney(
                    estimatedParkingCharge
                  )}`}
                />


                <Row
                  label="Platform fee"
                  value={`₹${formatMoney(
                    estimatedPlatformFee
                  )}`}
                />

              </>

            )}


            <Row
              label="Total"
              value={`₹${formatMoney(
                displayTotal
              )}`}
              bold
            />

          </div>


          {/* Existing booking */}

          {isExisting ? (

            <div className="pt-5">


              {/* Status */}

              <div className="flex justify-center">

                <span
                  className={`inline-block text-xs font-semibold px-3 py-1.5 rounded-full ${
                    booking.status ===
                    'CANCELLED'
                      ? 'bg-red-50 text-red-600'
                      : booking.status ===
                        'PENDING'
                      ? 'bg-yellow-50 text-yellow-600'
                      : booking.status ===
                        'ACTIVE'
                      ? 'bg-primary-50 text-primary-700'
                      : 'bg-blue-50 text-blue-600'
                  }`}
                >

                  Status:{' '}

                  {booking.status}

                </span>

              </div>


              {/* Pending payment */}

              {booking.status ===
                'PENDING' && (

                <div className="mt-5 rounded-xl bg-yellow-50 border border-yellow-100 px-4 py-3">

                  <p className="font-semibold text-sm text-yellow-700">

                    Payment required

                  </p>


                  <p className="text-xs text-yellow-600 mt-1">

                    Complete payment from My
                    Bookings to confirm this
                    reservation.

                  </p>


                  <Link
                    to="/driver/bookings"
                    className="block mt-3"
                  >

                    <Button full>

                      Go to My Bookings

                    </Button>

                  </Link>

                </div>

              )}


              {/* Confirmed */}

              {booking.status ===
                'CONFIRMED' && (

                <div className="mt-5">

                  <div className="rounded-xl bg-primary-50 border border-primary/20 px-4 py-3 text-center">

                    <p className="font-semibold text-sm text-primary-700">

                      Payment successful

                    </p>


                    <p className="text-xs text-primary-600 mt-1">

                      Your parking reservation
                      is confirmed.

                    </p>

                  </div>


                  {/* QR */}

                  <div className="flex flex-col items-center mt-6">

                    <div className="w-36 h-36 bg-lavender rounded-xl grid grid-cols-5 grid-rows-5 gap-1 p-3 mb-3">

                      {Array.from({
                        length: 25,
                      }).map(
                        (_, i) => (

                          <span
                            key={i}
                            className={`rounded-sm ${
                              (i * 7) %
                                3 ===
                              0
                                ? 'bg-navy'
                                : 'bg-transparent'
                            }`}
                          />

                        )
                      )}

                    </div>


                    <p className="text-xs text-navy/40">

                      Show this QR code at
                      the entrance

                    </p>

                  </div>

                </div>

              )}


              {/* Active */}

              {booking.status ===
                'ACTIVE' && (

                <div className="mt-5 rounded-xl bg-primary-50 border border-primary/20 px-4 py-3 text-center">

                  <p className="font-semibold text-sm text-primary-700">

                    Parking session is active

                  </p>

                </div>

              )}


              {/* Completed */}

              {booking.status ===
                'COMPLETED' && (

                <div className="mt-5 rounded-xl bg-navy/5 px-4 py-3 text-center">

                  <p className="font-semibold text-sm text-navy">

                    Parking session completed

                  </p>

                </div>

              )}


              {/* Navigation */}

              <div className="flex gap-3 mt-6">

                <Link
                  to="/driver/bookings"
                  className="flex-1"
                >

                  <Button
                    full
                    variant="outline"
                  >

                    My Bookings

                  </Button>

                </Link>


                <Link
                  to="/driver/find-parking"
                  className="flex-1"
                >

                  <Button full>

                    Find More Parking

                  </Button>

                </Link>

              </div>

            </div>

          ) : (

            /* New booking */

            <div>


              <div className="mt-5 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">

                <p className="font-semibold text-sm text-blue-700">

                  Booking request

                </p>


                <p className="text-xs text-blue-600 mt-1">

                  Your booking will be created as
                  pending. Payment will confirm
                  the reservation.

                </p>

              </div>


              {/* ======================================
                   VEHICLE NUMBER
                 ====================================== */}

              <div className="mt-5">

                <label
                  htmlFor="vehicleNumber"
                  className="block text-sm font-semibold text-navy mb-2"
                >

                  Vehicle Number

                </label>


                <input
                  id="vehicleNumber"
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) =>
                    setVehicleNumber(
                      e.target.value
                        .toUpperCase()
                        .replace(/\s/g, '')
                    )
                  }
                  placeholder="e.g. UP16AB1234"
                  maxLength={20}
                  autoComplete="off"
                  className="w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />


                <p className="text-xs text-navy/40 mt-2">

                  Enter your registered vehicle number.

                </p>

              </div>


              {/* Confirm Button */}

              <Button
                full
                size="lg"
                className="mt-5"
                onClick={confirm}
                disabled={creating}
              >

                {creating
                  ? 'Creating Booking...'
                  : 'Confirm Booking'}

              </Button>

            </div>

          )}

        </div>

      </main>


      <Footer />

    </div>
  )
}


function Row({
  label,
  value,
  bold,
}) {
  return (

    <div
      className={`flex justify-between gap-4 ${
        bold
          ? 'font-bold text-base pt-2'
          : 'text-navy/60'
      }`}
    >

      <span>

        {label}

      </span>


      <span
        className={
          bold
            ? 'text-navy text-right'
            : 'font-medium text-navy text-right'
        }
      >

        {value}

      </span>

    </div>

  )
}


function RedirectMessage({
  message,
}) {
  return (

    <div className="min-h-screen flex flex-col">

      <Navbar />


      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">

        <p className="text-navy/50 mb-4">

          {message}

        </p>


        <Link to="/driver/find-parking">

          <Button>

            Find Parking

          </Button>

        </Link>

      </div>


      <Footer />

    </div>

  )
}