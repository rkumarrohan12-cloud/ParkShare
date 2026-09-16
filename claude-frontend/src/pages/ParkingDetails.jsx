import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import Icon from '../components/common/Icon'
import Button from '../components/common/Button'
import { useAppData } from '../context/AppDataContext'
import { useAuth } from '../context/AuthContext'
import { VEHICLE_TYPES, FEATURES } from '../data/mockData'
import { parkingAPI } from '../services/api'

const PLATFORM_FEE_RATE = 0.08

function formatPrice(value) {
  return Number(value || 0).toFixed(2)
}

function mapParkingSpace(space) {
  if (!space) return null

  let amenities = []

  try {
    if (Array.isArray(space.amenities)) {
      amenities = space.amenities
    } else if (typeof space.amenities === 'string') {
      amenities = JSON.parse(space.amenities)
    }
  } catch {
    amenities = []
  }

  return {
    ...space,

    // Backend → frontend field mapping
    pricePerHour: Number(
      space.price_per_hour ??
        space.pricePerHour ??
        0
    ),

    vehicleTypes:
      space.vehicleTypes ||
      space.vehicle_types ||
      [space.vehicle_type].filter(Boolean),

    features:
      space.features ||
      amenities,

    type:
      space.type ||
      space.parking_type ||
      'Parking',

    image:
      space.image ||
      space.image_url ||
      'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1000&q=80',

    rating:
      space.rating ?? 0,

    reviews:
      space.reviews ?? 0,

    distanceKm:
      space.distanceKm ?? null,

    walkMins:
      space.walkMins ?? null,

    availableHours:
      space.availableHours || 'Available',

    dayPass:
      space.dayPass ??
      Number(space.price_per_hour || 0) * 8,

    host:
      space.host || {
        name: space.owner_name || 'Parking Owner',
        memberSince: 'ParkShare',
        responseRate: '—',
      },
  }
}

export default function ParkingDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const {
    favorites,
    toggleFavorite,
  } = useAppData()

  const { user } = useAuth()

  const [space, setSpace] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [vehicle, setVehicle] = useState(
    VEHICLE_TYPES[0]?.id || ''
  )

  const [formError, setFormError] =
    useState('')

  const [checkingAvailability, setCheckingAvailability] =
    useState(false)

  const [availabilityMessage, setAvailabilityMessage] =
    useState('')

  const [isAvailable, setIsAvailable] =
    useState(null)

  /*
   * Load parking space directly
   * from backend.
   */
  useEffect(() => {
    const loadParking = async () => {
      try {
        setLoading(true)
        setLoadError('')

        const response =
          await parkingAPI.getById(id)

        const parking =
          mapParkingSpace(response.data)

        setSpace(parking)

        // Select first supported vehicle
        if (
          parking?.vehicleTypes?.length
        ) {
          setVehicle(
            parking.vehicleTypes[0]
          )
        }
      } catch (error) {
        console.error(
          'Failed to load parking:',
          error
        )

        setLoadError(
          error.message ||
            'Failed to load parking space.'
        )
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadParking()
    }
  }, [id])

  /*
   * Calculate duration.
   */
  const hours = (() => {
    if (!startTime || !endTime) {
      return 0
    }

    const [sh, sm] =
      startTime.split(':').map(Number)

    const [eh, em] =
      endTime.split(':').map(Number)

    const diff =
      (eh * 60 +
        em -
        (sh * 60 + sm)) /
      60

    return diff > 0 ? diff : 0
  })()

  /*
   * Frontend estimate only.
   *
   * Backend remains the final
   * source of truth for booking amount.
   */
  const parkingCharge = Math.round(
    hours *
      Number(
        space?.pricePerHour || 0
      ) *
      100
  ) / 100

  const platformFee = Math.round(
    parkingCharge *
      PLATFORM_FEE_RATE *
      100
  ) / 100

  const total =
    parkingCharge + platformFee

  const isFav =
    favorites.includes(id)

  /*
   * Check whether this parking
   * is available for selected time.
   */
  const checkAvailability = async () => {
    setFormError('')
    setAvailabilityMessage('')
    setIsAvailable(null)

    if (
      !date ||
      !startTime ||
      !endTime
    ) {
      setFormError(
        'Please select date, start time and end time.'
      )
      return false
    }

    const start = new Date(
      `${date}T${startTime}`
    )

    const end = new Date(
      `${date}T${endTime}`
    )

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      setFormError(
        'Please enter a valid date and time.'
      )
      return false
    }

    if (end <= start) {
      setFormError(
        'End time must be after start time.'
      )
      return false
    }

    if (
      start <
      new Date(
        Date.now() -
          5 * 60 * 1000
      )
    ) {
      setFormError(
        'Start time cannot be in the past.'
      )
      return false
    }

    try {
      setCheckingAvailability(true)

      /*
       * Ask backend for parking spaces
       * available during this period.
       */
      const response =
        await parkingAPI.getAllWithAvailability(
          start.toISOString(),
          end.toISOString()
        )

      const availableSpaces =
        response.data || []

      const found =
        availableSpaces.some(
          (parking) =>
            parking.id === id
        )

      if (found) {
        setIsAvailable(true)

        setAvailabilityMessage(
          'This parking space is available for your selected time.'
        )

        return true
      }

      setIsAvailable(false)

      setAvailabilityMessage(
        'This parking space is already booked for the selected time.'
      )

      return false
    } catch (error) {
      console.error(
        'Availability check failed:',
        error
      )

      setFormError(
        error.message ||
          'Could not check availability.'
      )

      return false
    } finally {
      setCheckingAvailability(false)
    }
  }

  /*
   * Reserve parking.
   */
  const handleReserve = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    setFormError('')

    // Owner cannot book own parking
    if (
      space?.owner_id &&
      space.owner_id === user.id
    ) {
      setFormError(
        'You cannot book your own parking space.'
      )
      return
    }

    if (
      !date ||
      !startTime ||
      !endTime ||
      hours <= 0
    ) {
      setFormError(
        'Please select a valid date and time range.'
      )
      return
    }

    const available =
      await checkAvailability()

    if (!available) {
      return
    }

    /*
     * Booking.jsx will create the
     * actual backend booking.
     */
    navigate('/booking/new', {
      state: {
        parkingId: space.id,
        date,
        startTime,
        endTime,
        vehicle,

        // These are only UI estimates.
        parkingCharge,
        platformFee,
        total,
        hours,
      },
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <div className="flex-1 flex items-center justify-center">
          <p className="text-navy/50">
            Loading parking details...
          </p>
        </div>

        <Footer />
      </div>
    )
  }

  if (loadError || !space) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <p className="text-navy/50 mb-4">
            {loadError ||
              'Parking space not found.'}
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

        <div className="grid lg:grid-cols-3 gap-8">

          {/* LEFT SIDE */}
          <div className="lg:col-span-2">

            {/* Parking Image */}
            <div className="relative rounded-2xl overflow-hidden h-72 sm:h-96">

              <img
                src={space.image}
                alt={space.title}
                className="w-full h-full object-cover"
              />

              <button
                onClick={() =>
                  toggleFavorite(space.id)
                }
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center"
              >
                <Icon
                  name={
                    isFav
                      ? 'favorite'
                      : 'favorite_border'
                  }
                  className={
                    isFav
                      ? 'text-red-500'
                      : 'text-navy/60'
                  }
                />
              </button>

            </div>

            <div className="mt-6">

              {/* Title */}
              <div className="flex items-start justify-between gap-4 flex-wrap">

                <div>
                  <h1 className="text-2xl font-extrabold">
                    {space.title}
                  </h1>

                  <p className="text-navy/50 mt-1 flex items-center gap-1">
                    <Icon
                      name="location_on"
                      size={16}
                    />

                    {space.address}
                  </p>
                </div>

                <div className="flex items-center gap-1 font-bold text-lg">
                  <Icon
                    name="star"
                    className="text-amber-500"
                  />

                  {space.rating}

                  <span className="text-navy/40 font-normal text-sm">
                    ({space.reviews} reviews)
                  </span>
                </div>

              </div>

              {/* Info */}
              <div className="flex flex-wrap gap-3 mt-5">

                {space.distanceKm !== null && (
                  <Info
                    icon="near_me"
                    label={`${space.distanceKm} km away`}
                  />
                )}

                <Info
                  icon="garage"
                  label={space.type}
                />

                <Info
                  icon="schedule"
                  label={space.availableHours}
                />

                {space.features.includes(
                  'cctv'
                ) && (
                  <Info
                    icon="videocam"
                    label="CCTV"
                  />
                )}

                {space.features.includes(
                  'ev_charging'
                ) && (
                  <Info
                    icon="ev_station"
                    label="EV Charging"
                  />
                )}

              </div>

              {/* Vehicle Types */}
              {space.vehicleTypes.length >
                0 && (
                <div className="flex flex-wrap gap-2 mt-4">

                  {space.vehicleTypes.map(
                    (v) => {
                      const vt =
                        VEHICLE_TYPES.find(
                          (x) =>
                            x.id === v
                        )

                      return (
                        <span
                          key={v}
                          className="text-xs bg-lavender px-3 py-1.5 rounded-full flex items-center gap-1"
                        >
                          {vt?.icon && (
                            <Icon
                              name={
                                vt.icon
                              }
                              size={14}
                            />
                          )}

                          {vt?.label ||
                            v}
                        </span>
                      )
                    }
                  )}

                </div>
              )}

              {/* Description */}
              <p className="text-navy/60 mt-5 leading-relaxed">
                {space.description ||
                  'No description provided.'}
              </p>

              {/* Features */}
              {space.features.length >
                0 && (
                <div className="mt-6 grid sm:grid-cols-2 gap-3">

                  {space.features.map(
                    (f) => {
                      const feat =
                        FEATURES.find(
                          (x) =>
                            x.id === f
                        )

                      return (
                        <div
                          key={f}
                          className="flex items-center gap-2 text-sm bg-white border border-black/5 rounded-xl px-3 py-2.5"
                        >
                          <Icon
                            name={
                              feat?.icon ||
                              'check_circle'
                            }
                            size={18}
                            className="text-primary"
                          />

                          {feat?.label ||
                            f.replace(
                              '_',
                              ' '
                            )}
                        </div>
                      )
                    }
                  )}

                </div>
              )}

              {/* Host */}
              <div className="mt-6 bg-white rounded-2xl border border-black/5 p-5">

                <p className="text-xs font-semibold text-navy/40 mb-2">
                  HOSTED BY
                </p>

                <div className="flex items-center gap-3">

                  <div className="w-11 h-11 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                    {space.host?.name?.[0] ||
                      'O'}
                  </div>

                  <div>
                    <p className="font-semibold">
                      {space.host?.name ||
                        'Parking Owner'}
                    </p>

                    <p className="text-xs text-navy/40">
                      Host since{' '}
                      {space.host?.memberSince ||
                        'ParkShare'}
                      {' · '}
                      {space.host?.responseRate ||
                        '—'}{' '}
                      response rate
                    </p>
                  </div>

                </div>

              </div>

            </div>
          </div>

          {/* RIGHT SIDE — BOOKING */}
          <div>

            <div className="bg-white rounded-2xl shadow-card border border-black/5 p-6 sticky top-24">

              <p className="text-2xl font-extrabold text-primary-700">
                ₹
                {formatPrice(
                  space.pricePerHour
                )}

                <span className="text-sm text-navy/40 font-medium">
                  /hour
                </span>
              </p>

              <p className="text-xs text-navy/40 mb-4">
                or ₹
                {formatPrice(
                  space.dayPass
                )}{' '}
                for a full day pass
              </p>

              {formError && (
                <div className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2 mb-3">
                  {formError}
                </div>
              )}

              {availabilityMessage && (
                <div
                  className={`text-xs rounded-xl px-3 py-2 mb-3 ${
                    isAvailable
                      ? 'text-primary-700 bg-primary-50 border border-primary/20'
                      : 'text-red-600 bg-red-50 border border-red-100'
                  }`}
                >
                  {availabilityMessage}
                </div>
              )}

              <div className="space-y-3">

                {/* Date */}
                <div>
                  <label className="text-xs font-semibold text-navy/50">
                    Date
                  </label>

                  <input
                    type="date"
                    value={date}
                    min={
                      new Date()
                        .toISOString()
                        .split('T')[0]
                    }
                    onChange={(e) => {
                      setDate(
                        e.target.value
                      )
                      setIsAvailable(null)
                      setAvailabilityMessage('')
                    }}
                    className="w-full mt-1 rounded-xl border border-black/10 px-3 py-2.5 text-sm"
                  />
                </div>

                {/* Time */}
                <div className="grid grid-cols-2 gap-3">

                  <div>
                    <label className="text-xs font-semibold text-navy/50">
                      Start
                    </label>

                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => {
                        setStartTime(
                          e.target.value
                        )
                        setIsAvailable(null)
                        setAvailabilityMessage('')
                      }}
                      className="w-full mt-1 rounded-xl border border-black/10 px-3 py-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-navy/50">
                      End
                    </label>

                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => {
                        setEndTime(
                          e.target.value
                        )
                        setIsAvailable(null)
                        setAvailabilityMessage('')
                      }}
                      className="w-full mt-1 rounded-xl border border-black/10 px-3 py-2.5 text-sm"
                    />
                  </div>

                </div>

                {/* Vehicle */}
                <div>
                  <label className="text-xs font-semibold text-navy/50">
                    Vehicle
                  </label>

                  <select
                    value={vehicle}
                    onChange={(e) =>
                      setVehicle(
                        e.target.value
                      )
                    }
                    className="w-full mt-1 rounded-xl border border-black/10 px-3 py-2.5 text-sm"
                  >
                    {(
                      space.vehicleTypes.length
                        ? space.vehicleTypes
                        : VEHICLE_TYPES.map(
                            (v) => v.id
                          )
                    ).map((v) => {
                      const vt =
                        VEHICLE_TYPES.find(
                          (x) =>
                            x.id === v
                        )

                      return (
                        <option
                          key={v}
                          value={v}
                        >
                          {vt?.label || v}
                        </option>
                      )
                    })}
                  </select>
                </div>

              </div>

              {/* Price */}
              <div className="mt-5 pt-4 border-t border-black/5 space-y-2 text-sm">

                <div className="flex justify-between text-navy/60">
                  <span>
                    Parking charge (
                    {hours || 0}h)
                  </span>

                  <span>
                    ₹
                    {formatPrice(
                      parkingCharge
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-navy/60">
                  <span>
                    Platform fee
                  </span>

                  <span>
                    ₹
                    {formatPrice(
                      platformFee
                    )}
                  </span>
                </div>

                <div className="flex justify-between font-bold text-base pt-2 border-t border-black/5">

                  <span>Total</span>

                  <span>
                    ₹
                    {formatPrice(total)}
                  </span>

                </div>

              </div>

              <Button
                full
                size="lg"
                className="mt-5"
                onClick={handleReserve}
                disabled={checkingAvailability}
              >
                {checkingAvailability
                  ? 'Checking availability...'
                  : 'Reserve Parking'}
              </Button>

              {!user && (
                <p className="text-xs text-center text-navy/40 mt-2">
                  You'll need to{' '}

                  <Link
                    to="/login"
                    className="text-primary font-semibold"
                  >
                    log in
                  </Link>{' '}
                  first.
                </p>
              )}

            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}

function Info({ icon, label }) {
  return (
    <span className="flex items-center gap-1.5 text-sm bg-lavender px-3 py-1.5 rounded-full text-navy/60">
      <Icon
        name={icon}
        size={16}
      />

      {label}
    </span>
  )
}