import { useEffect, useState } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Icon from '../common/Icon'

/* --------------------------------
   Fix Leaflet Default Marker Icons
--------------------------------- */
delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const DEFAULT_CENTER = [28.6139, 77.3910]

/* --------------------------------
   Map Controller
--------------------------------- */
function MapController({ selectedSpace, userLocation }) {
  const map = useMap()

  useEffect(() => {
    if (
      selectedSpace?.latitude != null &&
      selectedSpace?.longitude != null
    ) {
      map.flyTo(
        [
          Number(selectedSpace.latitude),
          Number(selectedSpace.longitude),
        ],
        16,
        {
          duration: 0.8,
        }
      )
    }
  }, [selectedSpace, map])

  useEffect(() => {
    if (userLocation) {
      map.flyTo(
        [
          userLocation.latitude,
          userLocation.longitude,
        ],
        14,
        {
          duration: 0.8,
        }
      )
    }
  }, [userLocation, map])

  return null
}

/* --------------------------------
   User Location Marker
--------------------------------- */
function UserLocationMarker({ userLocation }) {
  if (!userLocation) {
    return null
  }

  return (
    <Marker
      position={[
        userLocation.latitude,
        userLocation.longitude,
      ]}
    >
      <Popup>
        <div className="text-center">
          <div className="font-bold text-base">
            📍 Your Location
          </div>

          <p className="text-xs text-gray-500 mt-1">
            You are here
          </p>
        </div>
      </Popup>
    </Marker>
  )
}

/* --------------------------------
   Main Map
--------------------------------- */
export default function MapPlaceholder({
  spaces = [],
  selectedId,
  onSelect,
  onLocationChange,
}) {
  const [userLocation, setUserLocation] = useState(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState('')

  const selectedSpace =
    spaces.find((space) => space.id === selectedId) || null

  const validSpaces = spaces.filter(
    (space) =>
      space.latitude != null &&
      space.longitude != null &&
      !Number.isNaN(Number(space.latitude)) &&
      !Number.isNaN(Number(space.longitude))
  )

  /* --------------------------------
     Get Current Location
  --------------------------------- */
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(
        'Location is not supported by this browser.'
      )
      return
    }

    setLocationLoading(true)
    setLocationError('')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }

        setUserLocation(location)

        // Send location to parent
        onLocationChange?.(location)

        setLocationLoading(false)
      },
      (error) => {
        console.error('Location error:', error)

        let message = 'Unable to get your location.'

        if (error.code === 1) {
          message =
            'Location permission denied. Please allow location access.'
        } else if (error.code === 2) {
          message =
            'Your location could not be determined.'
        } else if (error.code === 3) {
          message =
            'Location request timed out. Please try again.'
        }

        setLocationError(message)
        setLocationLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }

  /* --------------------------------
     Directions
  --------------------------------- */
  const openDirections = (space) => {
    const lat = Number(space.latitude)
    const lng = Number(space.longitude)

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng)
    ) {
      return
    }

    let route

    if (userLocation) {
      route =
        `${userLocation.latitude},${userLocation.longitude};` +
        `${lat},${lng}`
    } else {
      route = `;${lat},${lng}`
    }

    const directionsUrl =
      `https://www.openstreetmap.org/directions` +
      `?engine=fossgis_osrm_car` +
      `&route=${route}`

    window.open(
      directionsUrl,
      '_blank',
      'noopener,noreferrer'
    )
  }

  return (
    <div className="relative w-full h-full min-h-[320px] rounded-2xl overflow-hidden border border-black/5">

      <MapContainer
        center={DEFAULT_CENTER}
        zoom={12}
        scrollWheelZoom={true}
        className="w-full h-full min-h-[320px]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController
          selectedSpace={selectedSpace}
          userLocation={userLocation}
        />

        <UserLocationMarker
          userLocation={userLocation}
        />

        {/* Parking Markers */}
        {validSpaces.map((space) => (
          <Marker
            key={space.id}
            position={[
              Number(space.latitude),
              Number(space.longitude),
            ]}
            eventHandlers={{
              click: () => onSelect?.(space.id),
            }}
          >
            <Popup>
              <div className="min-w-[200px]">

                <h3 className="font-bold text-base">
                  {space.title}
                </h3>

                <p className="text-sm text-gray-600 mt-1">
                  {space.address}
                </p>

                {space.city && (
                  <p className="text-sm text-gray-500">
                    {space.city}
                  </p>
                )}

                <div className="mt-2 font-bold">
                  ₹{space.pricePerHour}/hour
                </div>

                {/* Distance inside popup */}
                {space.distanceKm != null && (
                  <div className="mt-1 text-xs font-semibold text-gray-500">
                    📍 {space.distanceKm} km away
                  </div>
                )}

                <div className="mt-3 flex flex-col gap-2">

                  <button
                    onClick={() => onSelect?.(space.id)}
                    className="px-3 py-1.5 rounded-lg bg-black text-white text-xs font-semibold hover:bg-gray-800 transition"
                  >
                    Select Parking
                  </button>

                  <button
                    onClick={() => openDirections(space)}
                    className="px-3 py-1.5 rounded-lg border border-black/10 bg-white text-black text-xs font-semibold hover:bg-gray-50 transition"
                  >
                    🧭 Get Directions
                  </button>

                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* No parking */}
      {validSpaces.length === 0 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white rounded-xl shadow-md px-4 py-2 text-sm">
          No parking locations available on map
        </div>
      )}

      {/* My Location */}
      <button
        onClick={getCurrentLocation}
        disabled={locationLoading}
        className="absolute top-4 right-4 z-[1000] bg-white shadow-lg rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-60"
      >
        <Icon
          name="my_location"
          size={18}
        />

        {locationLoading
          ? 'Finding you...'
          : 'My Location'}
      </button>

      {/* Location error */}
      {locationError && (
        <div className="absolute top-16 right-4 z-[1000] max-w-[260px] bg-white shadow-lg rounded-xl px-3 py-2 text-xs text-red-600">
          {locationError}
        </div>
      )}

      {/* Map label */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 rounded-xl px-3 py-2 text-xs text-navy/70 flex items-center gap-1.5 shadow">
        <Icon
          name="location_on"
          size={14}
        />

        Live parking map
      </div>

    </div>
  )
}