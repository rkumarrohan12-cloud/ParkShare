import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from 'react-leaflet'
import L from 'leaflet'

import DashboardShell from '../../components/common/DashboardShell'
import Icon from '../../components/common/Icon'
import Button from '../../components/common/Button'
import { ownerNavItems } from '../../components/owner/ownerNav'
import { useAppData } from '../../context/AppDataContext'

import {
  PARKING_TYPES,
  VEHICLE_TYPES,
  WEEKDAYS,
  FEATURES,
} from '../../data/mockData'

import 'leaflet/dist/leaflet.css'

// ============================================================
// LEAFLET MARKER ICON FIX
// ============================================================

delete L.Icon.Default.prototype._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',

  iconUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',

  shadowUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// ============================================================
// DEFAULT LOCATION - NOIDA
// ============================================================

const DEFAULT_LOCATION = {
  latitude: 28.6139,
  longitude: 77.391,
}

// ============================================================
// EMPTY FORM
// ============================================================

const emptyForm = {
  title: '',
  society: '',
  address: '',
  city: '',

  contactNumber: '',

  type: PARKING_TYPES[0],

  vehicleTypes: [],

  pricePerHour: '',

  dayPass: '',

  availableDays: [...WEEKDAYS],

  startTime: '06:00',

  endTime: '22:00',

  features: [],

  description: '',

  latitude: DEFAULT_LOCATION.latitude,

  longitude: DEFAULT_LOCATION.longitude,

  // Photo
  image: '',
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function ListSlot() {
  const {
    parkingSpaces,
    addParkingSpace,
    updateParkingSpace,
  } = useAppData()

  const navigate = useNavigate()

  const [params] = useSearchParams()

  const editId = params.get('edit')

  // ============================================================
  // EDITING
  // ============================================================

  const editing = editId
    ? parkingSpaces.find(
        (p) => p.id === editId
      )
    : null

  // ============================================================
  // FORM
  // ============================================================

  const [form, setForm] = useState(() =>
    editing
      ? {
          ...emptyForm,
          ...editing,

          contactNumber:
            editing.contactNumber ||
            editing.contact_number ||
            '',

          vehicleTypes:
            editing.vehicleTypes ||
            (editing.vehicleType
              ? [editing.vehicleType]
              : []),

          features:
            editing.features || [],

          pricePerHour:
            editing.pricePerHour || '',

          latitude:
            editing.latitude ??
            DEFAULT_LOCATION.latitude,

          longitude:
            editing.longitude ??
            DEFAULT_LOCATION.longitude,

          image:
            editing.image || '',
        }
      : emptyForm
  )

  const [errors, setErrors] = useState({})

  const [success, setSuccess] =
    useState(false)

  const [submitting, setSubmitting] =
    useState(false)

  const [locating, setLocating] =
    useState(false)

  // ============================================================
  // TOGGLE ARRAY
  // ============================================================

  const toggleArr = (key, val) => {
    setForm((currentForm) => ({
      ...currentForm,

      [key]: currentForm[key].includes(
        val
      )
        ? currentForm[key].filter(
            (x) => x !== val
          )
        : [
            ...currentForm[key],
            val,
          ],
    }))
  }

  // ============================================================
  // CURRENT LOCATION
  // ============================================================

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrors({
        location:
          'Geolocation is not supported by your browser.',
      })

      return
    }

    setLocating(true)

    setErrors((currentErrors) => ({
      ...currentErrors,
      location: '',
    }))

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const {
          latitude,
          longitude,
        } = position.coords

        setForm((currentForm) => ({
          ...currentForm,

          latitude,
          longitude,
        }))

        setLocating(false)
      },

      (error) => {
        console.error(
          'Location error:',
          error
        )

        let message =
          'Unable to get your current location.'

        if (error.code === 1) {
          message =
            'Location permission denied. Please allow location access in your browser.'
        }

        if (error.code === 2) {
          message =
            'Current location is unavailable. Please try again.'
        }

        if (error.code === 3) {
          message =
            'Location request timed out. Please try again.'
        }

        setErrors((currentErrors) => ({
          ...currentErrors,
          location: message,
        }))

        setLocating(false)
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }

  // ============================================================
  // PHOTO UPLOAD
  // ============================================================

  const handlePhotoUpload = (event) => {
    const file =
      event.target.files?.[0]

    if (!file) {
      return
    }

    // Only image files
    if (!file.type.startsWith('image/')) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        image:
          'Please select an image file.',
      }))

      return
    }

    // Limit size to 5 MB
    if (file.size > 5 * 1024 * 1024) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        image:
          'Image size must be less than 5 MB.',
      }))

      return
    }

    setErrors((currentErrors) => ({
      ...currentErrors,
      image: '',
    }))

    const reader = new FileReader()

    reader.onload = () => {
      setForm((currentForm) => ({
        ...currentForm,
        image: reader.result,
      }))
    }

    reader.readAsDataURL(file)
  }

  // ============================================================
  // REMOVE PHOTO
  // ============================================================

  const removePhoto = () => {
    setForm((currentForm) => ({
      ...currentForm,
      image: '',
    }))
  }

  // ============================================================
  // VALIDATION
  // ============================================================

  const validate = () => {
    const e = {}

    if (!form.title.trim()) {
      e.title = 'Required'
    }

    if (!form.address.trim()) {
      e.address = 'Required'
    }

    if (!form.city.trim()) {
      e.city = 'Required'
    }

    // Contact number
    if (!form.contactNumber.trim()) {
      e.contactNumber =
        'Contact number is required'
    } else if (
      !/^[6-9]\d{9}$/.test(
        form.contactNumber.trim()
      )
    ) {
      e.contactNumber =
        'Enter a valid 10-digit mobile number'
    }

    if (
      !form.pricePerHour ||
      Number(form.pricePerHour) <= 0
    ) {
      e.pricePerHour =
        'Enter a valid price'
    }

    if (
      form.vehicleTypes.length === 0
    ) {
      e.vehicleTypes =
        'Select at least one'
    }

    if (
      form.latitude == null ||
      form.longitude == null
    ) {
      e.location =
        'Please select a parking location on the map'
    }

    return e
  }

  // ============================================================
  // SUBMIT
  // ============================================================

  const submit = async (ev) => {
    ev.preventDefault()

    const validationErrors =
      validate()

    setErrors(validationErrors)

    if (
      Object.keys(validationErrors)
        .length > 0
    ) {
      return
    }

    setSubmitting(true)

    try {
      /*
       * Backend accepts ONE vehicle type.
       */
      const vehicleType =
        form.vehicleTypes[0]

      /*
       * Backend expects amenities
       * instead of features.
       */

      const payload = {
        title: form.title,

        description:
          form.description || '',

        address: form.address,

        city: form.city,

        contactNumber:
          form.contactNumber.trim(),

        pricePerHour:
          Number(form.pricePerHour),

        vehicleType,

        amenities: form.features,

        latitude:
          Number(form.latitude),

        longitude:
          Number(form.longitude),

        // Photo
        image: form.image || '',
      }

      if (editing) {
        await updateParkingSpace(
          editing.id,
          payload
        )
      } else {
        await addParkingSpace(
          payload
        )
      }

      setSuccess(true)

      setTimeout(() => {
        navigate('/owner/slots')
      }, 900)
    } catch (error) {
      console.error(
        'Parking submission error:',
        error
      )

      setErrors({
        submit:
          error.message ||
          'Failed to save parking slot',
      })
    } finally {
      setSubmitting(false)
    }
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <DashboardShell
      portalLabel="Owner Portal"
      navItems={ownerNavItems}
    >
      {/* PAGE TITLE */}

      <h1 className="text-2xl font-extrabold mb-1">
        {editing
          ? 'Edit Parking Slot'
          : 'List Your Parking Slot'}
      </h1>

      <p className="text-navy/50 mb-6">
        Fill in the details below to{' '}
        {editing
          ? 'update'
          : 'publish'}{' '}
        your listing.
      </p>

      {/* SUCCESS */}

      {success && (
        <div className="bg-primary-50 text-primary-700 text-sm rounded-xl px-4 py-2.5 mb-4 flex items-center gap-2">
          <Icon
            name="check_circle"
            size={16}
          />

          Listing{' '}
          {editing
            ? 'updated'
            : 'published'}{' '}
          successfully. Redirecting…
        </div>
      )}

      {/* ERROR */}

      {errors.submit && (
        <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-2.5 mb-4">
          {errors.submit}
        </div>
      )}

      <form
        onSubmit={submit}
        className="bg-white rounded-2xl shadow-card border border-black/5 p-6 max-w-3xl space-y-6"
      >

        {/* =====================================================
            BASIC DETAILS
        ===================================================== */}

        <Section title="Basic Details">

          <div className="grid sm:grid-cols-2 gap-4">

            <Text
              label="Parking Title"
              value={form.title}
              onChange={(value) =>
                setForm({
                  ...form,
                  title: value,
                })
              }
              error={errors.title}
              placeholder="e.g. Green Valley Residency"
            />

            <Text
              label="Society / Building"
              value={form.society}
              onChange={(value) =>
                setForm({
                  ...form,
                  society: value,
                })
              }
              placeholder="e.g. Green Valley Residency"
            />

            <Text
              label="Address"
              value={form.address}
              onChange={(value) =>
                setForm({
                  ...form,
                  address: value,
                })
              }
              error={errors.address}
              placeholder="e.g. Sector 62, Noida"
            />

            <Text
              label="City"
              value={form.city}
              onChange={(value) =>
                setForm({
                  ...form,
                  city: value,
                })
              }
              error={errors.city}
              placeholder="e.g. Noida"
            />

            {/* CONTACT NUMBER */}

            <Text
              label="Contact Number"
              type="tel"
              value={
                form.contactNumber
              }
              onChange={(value) =>
                setForm({
                  ...form,

                  contactNumber:
                    value
                      .replace(
                        /\D/g,
                        ''
                      )
                      .slice(0, 10),
                })
              }
              error={
                errors.contactNumber
              }
              placeholder="e.g. 9876543210"
            />

          </div>

        </Section>

        {/* =====================================================
            PARKING LOCATION
        ===================================================== */}

        <Section
          title="Parking Location"
          error={errors.location}
        >

          <div className="rounded-2xl overflow-hidden border border-black/10">

            <MapLocationPicker
              latitude={
                form.latitude
              }
              longitude={
                form.longitude
              }
              onLocationChange={(
                latitude,
                longitude
              ) => {
                setForm({
                  ...form,
                  latitude,
                  longitude,
                })
              }}
            />

          </div>

          {/* CURRENT LOCATION */}

          <button
            type="button"
            onClick={
              useCurrentLocation
            }
            disabled={locating}
            className="mt-3 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
          >

            <Icon
              name="my_location"
              size={18}
            />

            {locating
              ? 'Getting Location...'
              : 'Use My Current Location'}

          </button>

          {/* COORDINATES */}

          <div className="mt-3 grid sm:grid-cols-2 gap-3">

            <div className="rounded-xl bg-gray-50 border border-black/5 px-3 py-2.5">

              <p className="text-xs text-navy/40">
                Latitude
              </p>

              <p className="text-sm font-semibold text-navy">
                {Number(
                  form.latitude
                ).toFixed(6)}
              </p>

            </div>

            <div className="rounded-xl bg-gray-50 border border-black/5 px-3 py-2.5">

              <p className="text-xs text-navy/40">
                Longitude
              </p>

              <p className="text-sm font-semibold text-navy">
                {Number(
                  form.longitude
                ).toFixed(6)}
              </p>

            </div>

          </div>

          <p className="text-xs text-navy/40 mt-2">
            📍 Click anywhere on the map to
            select the exact parking location,
            or use your current location.
          </p>

        </Section>

        {/* =====================================================
            PARKING TYPE
        ===================================================== */}

        <Section title="Parking Type">

          <div className="flex flex-wrap gap-2">

            {PARKING_TYPES.map(
              (type) => (
                <Chip
                  key={type}
                  active={
                    form.type ===
                    type
                  }
                  onClick={() =>
                    setForm({
                      ...form,
                      type,
                    })
                  }
                >
                  {type}
                </Chip>
              )
            )}

          </div>

        </Section>

        {/* =====================================================
            VEHICLE TYPE
        ===================================================== */}

        <Section
          title="Compatible Vehicle Types"
          error={
            errors.vehicleTypes
          }
        >

          <div className="flex flex-wrap gap-2">

            {VEHICLE_TYPES.map(
              (vehicle) => (
                <Chip
                  key={vehicle.id}
                  active={form.vehicleTypes.includes(
                    vehicle.id
                  )}
                  onClick={() =>
                    toggleArr(
                      'vehicleTypes',
                      vehicle.id
                    )
                  }
                  icon={vehicle.icon}
                >
                  {vehicle.label}
                </Chip>
              )
            )}

          </div>

        </Section>

        {/* =====================================================
            PRICING
        ===================================================== */}

        <Section title="Pricing">

          <div className="grid sm:grid-cols-2 gap-4">

            <Text
              label="Price per Hour (₹)"
              type="number"
              value={
                form.pricePerHour
              }
              onChange={(value) =>
                setForm({
                  ...form,
                  pricePerHour: value,
                })
              }
              error={
                errors.pricePerHour
              }
            />

            <Text
              label="Day Pass Price (₹, optional)"
              type="number"
              value={form.dayPass}
              onChange={(value) =>
                setForm({
                  ...form,
                  dayPass: value,
                })
              }
            />

          </div>

        </Section>

        {/* =====================================================
            AVAILABILITY
        ===================================================== */}

        <Section title="Availability">

          <div className="flex flex-wrap gap-2 mb-4">

            {WEEKDAYS.map(
              (day) => (
                <Chip
                  key={day}
                  active={form.availableDays.includes(
                    day
                  )}
                  onClick={() =>
                    toggleArr(
                      'availableDays',
                      day
                    )
                  }
                >
                  {day.slice(0, 3)}
                </Chip>
              )
            )}

          </div>

          <div className="grid sm:grid-cols-2 gap-4">

            <Text
              label="Start Time"
              type="time"
              value={
                form.startTime
              }
              onChange={(value) =>
                setForm({
                  ...form,
                  startTime: value,
                })
              }
            />

            <Text
              label="End Time"
              type="time"
              value={
                form.endTime
              }
              onChange={(value) =>
                setForm({
                  ...form,
                  endTime: value,
                })
              }
            />

          </div>

        </Section>

        {/* =====================================================
            FEATURES
        ===================================================== */}

        <Section title="Features">

          <div className="flex flex-wrap gap-2">

            {FEATURES.map(
              (feature) => (
                <Chip
                  key={feature.id}
                  active={form.features.includes(
                    feature.id
                  )}
                  onClick={() =>
                    toggleArr(
                      'features',
                      feature.id
                    )
                  }
                  icon={feature.icon}
                >
                  {feature.label}
                </Chip>
              )
            )}

          </div>

        </Section>

        {/* =====================================================
            DESCRIPTION
        ===================================================== */}

        <Section title="Description">

          <textarea
            value={
              form.description
            }
            onChange={(event) =>
              setForm({
                ...form,

                description:
                  event.target.value,
              })
            }
            rows={4}
            placeholder="Describe your parking space — access instructions, nearby landmarks, etc."
            className="w-full rounded-xl border border-black/10 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />

        </Section>

        {/* =====================================================
            PHOTOS
        ===================================================== */}

        <Section
          title="Parking Photo"
          error={errors.image}
        >

          {!form.image ? (

            <label className="block border-2 border-dashed border-black/10 rounded-2xl p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">

              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={
                  handlePhotoUpload
                }
              />

              <Icon
                name="add_photo_alternate"
                size={40}
                className="mx-auto mb-3 text-navy/40"
              />

              <p className="text-sm font-semibold text-navy">
                Click to upload parking photo
              </p>

              <p className="text-xs text-navy/40 mt-1">
                JPG, PNG or WEBP • Maximum 5 MB
              </p>

            </label>

          ) : (

            <div className="relative rounded-2xl overflow-hidden border border-black/10">

              <img
                src={form.image}
                alt="Parking Preview"
                className="w-full h-64 object-cover"
              />

              <button
                type="button"
                onClick={
                  removePhoto
                }
                className="absolute top-3 right-3 bg-white text-red-500 rounded-full w-9 h-9 flex items-center justify-center shadow-md hover:bg-red-50"
              >
                <Icon
                  name="delete"
                  size={18}
                />
              </button>

              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white px-4 py-2 text-xs">
                Parking photo selected
              </div>

            </div>

          )}

        </Section>

        {/* =====================================================
            SUBMIT
        ===================================================== */}

        <Button
          type="submit"
          size="lg"
          full
          disabled={submitting}
        >
          {submitting
            ? 'Saving...'
            : editing
              ? 'Save Changes'
              : 'Publish Parking Slot'}
        </Button>

      </form>

    </DashboardShell>
  )
}

// ============================================================
// MAP LOCATION PICKER
// ============================================================

function MapLocationPicker({
  latitude,
  longitude,
  onLocationChange,
}) {
  const position = [
    Number(latitude),
    Number(longitude),
  ]

  function LocationMarker() {
    useMapEvents({
      click(event) {
        onLocationChange(
          event.latlng.lat,
          event.latlng.lng
        )
      },
    })

    return (
      <Marker
        position={position}
      />
    )
  }

  return (
    <MapContainer
      center={position}
      zoom={15}
      scrollWheelZoom={true}
      className="w-full h-[350px]"
    >

      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapCenterUpdater
        latitude={latitude}
        longitude={longitude}
      />

      <LocationMarker />

    </MapContainer>
  )
}

// ============================================================
// MAP CENTER UPDATER
// ============================================================

function MapCenterUpdater({
  latitude,
  longitude,
}) {
  const map = useMap()

  const lat = Number(latitude)
  const lng = Number(longitude)

  if (
    Number.isFinite(lat) &&
    Number.isFinite(lng)
  ) {
    map.setView(
      [lat, lng],
      map.getZoom(),
      {
        animate: true,
      }
    )
  }

  return null
}

// ============================================================
// SECTION
// ============================================================

function Section({
  title,
  children,
  error,
}) {
  return (
    <div>

      <h3 className="font-semibold text-sm mb-2.5">
        {title}
      </h3>

      {children}

      {error && (
        <p className="text-xs text-red-500 mt-2">
          {error}
        </p>
      )}

    </div>
  )
}

// ============================================================
// TEXT INPUT
// ============================================================

function Text({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  error,
}) {
  return (
    <div>

      <label className="text-xs font-semibold text-navy/50">
        {label}
      </label>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="w-full mt-1 rounded-xl border border-black/10 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      />

      {error && (
        <p className="text-xs text-red-500 mt-1">
          {error}
        </p>
      )}

    </div>
  )
}

// ============================================================
// CHIP
// ============================================================

function Chip({
  active,
  onClick,
  icon,
  children,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-xs font-medium px-3.5 py-2 rounded-full border flex items-center gap-1.5 transition-colors ${
        active
          ? 'bg-primary text-white border-primary'
          : 'border-black/10 text-navy/60 hover:border-primary/40'
      }`}
    >

      {icon && (
        <Icon
          name={icon}
          size={14}
        />
      )}

      {children}

    </button>
  )
}