import { useEffect, useMemo, useState } from 'react'
import DashboardShell from '../../components/common/DashboardShell'
import Icon from '../../components/common/Icon'
import ParkingCard from '../../components/driver/ParkingCard'
import MapPlaceholder from '../../components/driver/MapPlaceholder'
import EmptyState from '../../components/common/EmptyState'
import { driverNavItems } from '../../components/driver/driverNav'
import { useAppData } from '../../context/AppDataContext'
import { VEHICLE_TYPES } from '../../data/mockData'
import { parkingAPI } from '../../services/api'

/* --------------------------------
   Calculate distance
--------------------------------- */
const calculateDistance = (
  lat1,
  lon1,
  lat2,
  lon2
) => {
  const numberLat1 = Number(lat1)
  const numberLon1 = Number(lon1)
  const numberLat2 = Number(lat2)
  const numberLon2 = Number(lon2)

  if (
    !Number.isFinite(numberLat1) ||
    !Number.isFinite(numberLon1) ||
    !Number.isFinite(numberLat2) ||
    !Number.isFinite(numberLon2)
  ) {
    return null
  }

  const earthRadiusKm = 6371

  const dLat =
    ((numberLat2 - numberLat1) * Math.PI) / 180

  const dLon =
    ((numberLon2 - numberLon1) * Math.PI) / 180

  const lat1Rad =
    (numberLat1 * Math.PI) / 180

  const lat2Rad =
    (numberLat2 * Math.PI) / 180

  const a =
    Math.sin(dLat / 2) *
      Math.sin(dLat / 2) +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    )

  return earthRadiusKm * c
}

export default function FindParking() {
  const {
    parkingSpaces: contextParkingSpaces,
  } = useAppData()

  const [parkingSpaces, setParkingSpaces] =
    useState([])

  const [vehicle, setVehicle] =
    useState('')

  const [maxPrice, setMaxPrice] =
    useState('')

  const [covered, setCovered] =
    useState(false)

  const [selectedId, setSelectedId] =
    useState(null)

  const [date, setDate] =
    useState('')

  const [startTime, setStartTime] =
    useState('')

  const [endTime, setEndTime] =
    useState('')

  const [searched, setSearched] =
    useState(false)

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState('')

  /* --------------------------------
     User Location
  --------------------------------- */
  const [userLocation, setUserLocation] =
    useState(null)

  /* --------------------------------
     Nearby Parking Filter
  --------------------------------- */
  const [nearbyOnly, setNearbyOnly] =
    useState(false)

  const [nearbyLoading, setNearbyLoading] =
    useState(false)

  /* --------------------------------
     Load all active parking
  --------------------------------- */
  useEffect(() => {
    const loadParking = async () => {
      try {
        setLoading(true)
        setError('')

        const response =
          await parkingAPI.getAll()

        setParkingSpaces(
          response.data || []
        )
      } catch (err) {
        console.error(
          'Failed to load parking:',
          err
        )

        setParkingSpaces(
          contextParkingSpaces || []
        )

        setError(
          'Could not load parking from server. Showing available local data.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadParking()
  }, [contextParkingSpaces])

  /* --------------------------------
     Get current location for
     Parking Near Me
  --------------------------------- */
  const getLocationForNearby = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(
          new Error(
            'Location is not supported by this browser.'
          )
        )
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude:
              position.coords.latitude,
            longitude:
              position.coords.longitude,
          })
        },
        (locationError) => {
          if (locationError.code === 1) {
            reject(
              new Error(
                'Location permission denied. Please allow location access.'
              )
            )
          } else if (locationError.code === 2) {
            reject(
              new Error(
                'Your location could not be determined.'
              )
            )
          } else if (locationError.code === 3) {
            reject(
              new Error(
                'Location request timed out. Please try again.'
              )
            )
          } else {
            reject(
              new Error(
                'Unable to get your location.'
              )
            )
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      )
    })
  }

  /* --------------------------------
     Parking Near Me button
  --------------------------------- */
  const handleNearbyParking = async () => {
    /* If already active, turn it off */
    if (nearbyOnly) {
      setNearbyOnly(false)
      setSelectedId(null)
      setError('')
      return
    }

    try {
      setNearbyLoading(true)
      setError('')

      let location = userLocation

      /* Get GPS if location is not available */
      if (!location) {
        location =
          await getLocationForNearby()

        setUserLocation(location)
      }

      setNearbyOnly(true)
      setSelectedId(null)
    } catch (err) {
      console.error(
        'Failed to get nearby parking:',
        err
      )

      setError(
        err.message ||
          'Unable to find parking near you.'
      )
    } finally {
      setNearbyLoading(false)
    }
  }

  /* --------------------------------
     Availability Search
  --------------------------------- */
  const handleSearch = async () => {
    if (!date || !startTime || !endTime) {
      setError(
        'Please select date, start time and end time.'
      )
      return
    }

    const start =
      new Date(`${date}T${startTime}`)

    const end =
      new Date(`${date}T${endTime}`)

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      setError(
        'Please enter a valid date and time.'
      )
      return
    }

    if (end <= start) {
      setError(
        'End time must be after start time.'
      )
      return
    }

    if (
      start <
      new Date(
        Date.now() - 5 * 60 * 1000
      )
    ) {
      setError(
        'Start time cannot be in the past.'
      )
      return
    }

    try {
      setLoading(true)
      setError('')

      const response =
        await parkingAPI.getAllWithAvailability(
          start.toISOString(),
          end.toISOString()
        )

      setParkingSpaces(
        response.data || []
      )

      setSearched(true)
      setSelectedId(null)
    } catch (err) {
      console.error(
        'Failed to search parking availability:',
        err
      )

      setError(
        err.message ||
          'Failed to check parking availability.'
      )
    } finally {
      setLoading(false)
    }
  }

  /* --------------------------------
     Clear availability search
  --------------------------------- */
  const clearAvailabilitySearch =
    async () => {
      setDate('')
      setStartTime('')
      setEndTime('')
      setSearched(false)
      setError('')

      try {
        setLoading(true)

        const response =
          await parkingAPI.getAll()

        setParkingSpaces(
          response.data || []
        )

        setSelectedId(null)
      } catch (err) {
        console.error(
          'Failed to reload parking:',
          err
        )
      } finally {
        setLoading(false)
      }
    }

  /* --------------------------------
     Filter + Calculate Distance
  --------------------------------- */
  const results = useMemo(() => {
    const filtered =
      parkingSpaces.filter((s) => {
        const price =
          Number(
            s.price_per_hour ??
              s.pricePerHour ??
              0
          )

        const vehicleTypes =
          s.vehicleTypes ||
          s.vehicle_types ||
          []

        const parkingType =
          s.type ||
          s.parking_type ||
          ''

        /* Vehicle filter */
        if (
          vehicle &&
          !vehicleTypes.includes(vehicle)
        ) {
          return false
        }

        /* Price filter */
        if (
          maxPrice &&
          price > Number(maxPrice)
        ) {
          return false
        }

        /* Covered filter */
        if (
          covered &&
          parkingType !== 'Covered'
        ) {
          return false
        }

        return true
      })

    const withDistance =
      filtered.map((space) => {
        let distanceKm = null

        if (
          userLocation &&
          space.latitude != null &&
          space.longitude != null
        ) {
          const distance =
            calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              space.latitude,
              space.longitude
            )

          if (distance != null) {
            distanceKm =
              Number(
                distance.toFixed(2)
              )
          }
        }

        return {
          ...space,
          distanceKm,
        }
      })

    /* --------------------------------
       2 KM FILTER
    --------------------------------- */
    if (nearbyOnly) {
      return withDistance.filter(
        (space) =>
          space.distanceKm !== null &&
          space.distanceKm <= 2
      )
    }

    return withDistance
  }, [
    parkingSpaces,
    vehicle,
    maxPrice,
    covered,
    userLocation,
    nearbyOnly,
  ])

  return (
    <DashboardShell
      portalLabel="Driver Portal"
      navItems={driverNavItems}
    >
      {/* --------------------------------
          Header
      --------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold">
            Available Parking Near You
          </h1>

          <p className="text-navy/50 text-sm">
            {results.length} spaces found

            {userLocation && (
              <span className="ml-2 text-primary font-semibold">
                • Location detected
              </span>
            )}
          </p>
        </div>

        {/* --------------------------------
            Filters
        --------------------------------- */}
        <div className="flex flex-wrap gap-2">

          {/* Parking Near Me */}
          <button
            onClick={handleNearbyParking}
            disabled={nearbyLoading}
            className={`text-sm px-4 py-2 rounded-full border flex items-center gap-1.5 font-semibold transition ${
              nearbyOnly
                ? 'bg-primary text-white border-primary'
                : 'border-primary/30 text-primary bg-primary/5 hover:bg-primary/10'
            } ${
              nearbyLoading
                ? 'opacity-60 cursor-not-allowed'
                : ''
            }`}
          >
            <Icon
              name="near_me"
              size={16}
            />

            {nearbyLoading
              ? 'Finding nearby...'
              : nearbyOnly
              ? 'Nearby Parking: ON'
              : 'Parking Near Me'}
          </button>

          {/* Vehicle */}
          <select
            value={vehicle}
            onChange={(e) =>
              setVehicle(e.target.value)
            }
            className="text-sm rounded-full border border-black/10 px-3.5 py-2 bg-white"
          >
            <option value="">
              All vehicles
            </option>

            {VEHICLE_TYPES.map((v) => (
              <option
                key={v.id}
                value={v.id}
              >
                {v.label}
              </option>
            ))}
          </select>

          {/* Max Price */}
          <input
            value={maxPrice}
            onChange={(e) =>
              setMaxPrice(e.target.value)
            }
            type="number"
            placeholder="Max ₹/hour"
            className="text-sm rounded-full border border-black/10 px-3.5 py-2 w-32 bg-white"
          />

          {/* Covered */}
          <button
            onClick={() =>
              setCovered(!covered)
            }
            className={`text-sm px-3.5 py-2 rounded-full border flex items-center gap-1.5 ${
              covered
                ? 'bg-primary text-white border-primary'
                : 'border-black/10 text-navy/60 bg-white'
            }`}
          >
            <Icon
              name="garage"
              size={16}
            />

            Covered only
          </button>
        </div>
      </div>

      {/* --------------------------------
          Nearby Info
      --------------------------------- */}
      {nearbyOnly && (
        <div className="bg-primary-50 border border-primary/20 rounded-xl px-4 py-3 mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Icon
              name="near_me"
              size={18}
            />

            <div>
              <p className="text-sm font-semibold text-primary-700">
                Parking within 2 km
              </p>

              <p className="text-xs text-primary-700/70">
                Showing only parking spaces within
                a 2 km radius of your location.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setNearbyOnly(false)
              setSelectedId(null)
            }}
            className="text-xs font-semibold text-primary-700 underline whitespace-nowrap"
          >
            Show all
          </button>
        </div>
      )}

      {/* --------------------------------
          Availability Search
      --------------------------------- */}
      <div className="bg-white rounded-2xl border border-black/5 shadow-card p-5 mb-6">

        <div className="flex items-center gap-2 mb-4">
          <Icon
            name="event"
            size={20}
          />

          <div>
            <h2 className="font-bold">
              Check Parking Availability
            </h2>

            <p className="text-xs text-navy/45">
              Select when you want to park
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-navy/60 mb-1.5">
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
              onChange={(e) =>
                setDate(e.target.value)
              }
              className="w-full text-sm rounded-xl border border-black/10 px-3.5 py-2.5 bg-white"
            />
          </div>

          {/* Start Time */}
          <div>
            <label className="block text-xs font-semibold text-navy/60 mb-1.5">
              Start Time
            </label>

            <input
              type="time"
              value={startTime}
              onChange={(e) =>
                setStartTime(e.target.value)
              }
              className="w-full text-sm rounded-xl border border-black/10 px-3.5 py-2.5 bg-white"
            />
          </div>

          {/* End Time */}
          <div>
            <label className="block text-xs font-semibold text-navy/60 mb-1.5">
              End Time
            </label>

            <input
              type="time"
              value={endTime}
              onChange={(e) =>
                setEndTime(e.target.value)
              }
              className="w-full text-sm rounded-xl border border-black/10 px-3.5 py-2.5 bg-white"
            />
          </div>

          {/* Search */}
          <div className="flex items-end gap-2">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? 'Checking...'
                : 'Search Parking'}
            </button>

            {searched && (
              <button
                onClick={
                  clearAvailabilitySearch
                }
                disabled={loading}
                className="px-4 py-2.5 rounded-xl border border-black/10 text-sm font-semibold text-navy/60 bg-white disabled:opacity-50"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {searched && !error && (
          <div className="mt-4 rounded-xl bg-primary-50 border border-primary/20 px-4 py-3 text-sm text-primary-700">
            Showing parking spaces available for{' '}
            {date} from {startTime} to{' '}
            {endTime}.
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
      </div>

      {/* --------------------------------
          Parking + Map
      --------------------------------- */}
      <div className="grid lg:grid-cols-5 gap-6">

        {/* Parking List */}
        <div className="lg:col-span-3 space-y-4">

          {loading ? (
            <div className="flex justify-center py-16">
              <p className="text-navy/50">
                Checking parking availability...
              </p>
            </div>
          ) : results.length === 0 ? (
            <EmptyState
              icon="search_off"
              title={
                nearbyOnly
                  ? 'No parking found within 2 km'
                  : searched
                  ? 'No parking available for this time'
                  : 'No parking spaces match your filters'
              }
              subtitle={
                nearbyOnly
                  ? 'Try showing all parking spaces or move to another location.'
                  : searched
                  ? 'Try another date or time range.'
                  : 'Try adjusting your filters to see more results.'
              }
            />
          ) : (
            results.map((s) => (
              <div
                key={s.id}
                onMouseEnter={() =>
                  setSelectedId(s.id)
                }
              >
                <ParkingCard
                  space={s}
                />
              </div>
            ))
          )}
        </div>

        {/* Map */}
        <div className="lg:col-span-2 h-[400px] lg:h-auto lg:sticky lg:top-24">
          <MapPlaceholder
            spaces={results}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onLocationChange={
              setUserLocation
            }
          />
        </div>

      </div>
    </DashboardShell>
  )
}