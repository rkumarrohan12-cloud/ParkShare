import { createContext, useContext, useEffect, useState } from 'react'
import {
  parkingAPI,
  bookingAPI,
  favoriteAPI,
  paymentAPI,
  ownerAPI,
} from '../services/api'

const AppDataContext = createContext(null)

export function AppDataProvider({ children }) {
  const [parkingSpaces, setParkingSpaces] = useState([])
  const [bookings, setBookings] = useState([])
  const [favorites, setFavorites] = useState([])
  const [payments, setPayments] = useState([])

  // LOAD DATA
  useEffect(() => {
    const loadData = async () => {
      try {
        // Public parking
        const parkingResponse = await parkingAPI.getAll()
        const rawParking = parkingResponse.data || []

        const formattedParking = rawParking.map((p) => ({
          id: p.id,
          ownerId: p.owner_id,
          title: p.title,
          description: p.description,
          address: p.address,
          city: p.city,

          pricePerHour: Number(p.price_per_hour),

          vehicleTypes: [p.vehicle_type],
          features: p.amenities || [],
          type: p.vehicle_type,

          latitude: p.latitude,
          longitude: p.longitude,

          rating: 0,
          reviews: 0,
          distanceKm: 0,

          availableHours: '24 hours',

          dayPass: Number(p.price_per_hour) * 8,

          image:
            'https://images.unsplash.com/photo-1506521781263-d8422e82f27a',

          host: {
            name: 'ParkShare Host',
            memberSince: '2026',
            responseRate: '100%',
          },

          // Backend status
          status: p.is_active ? 'Active' : 'Disabled',
          isActive: p.is_active,
        }))

        setParkingSpaces(formattedParking)

        // Logged-in user data
        if (localStorage.getItem('ps_token')) {
          const [bookingsRes, favoritesRes, paymentsRes] =
            await Promise.all([
              bookingAPI.getMyBookings(),
              favoriteAPI.getAll(),
              paymentAPI.getAll(),
            ])

          setBookings(bookingsRes.data || [])
          setFavorites(favoritesRes.data || [])
          setPayments(paymentsRes.data || [])
        }
      } catch (error) {
        console.error('Failed to load app data:', error)
      }
    }

    loadData()
  }, [])

  // ADD PARKING
  const addParkingSpace = async (space) => {
    try {
      const response = await ownerAPI.createParking(space)

      const p = response.data

      const formattedParking = {
        id: p.id,
        ownerId: p.owner_id,
        title: p.title,
        description: p.description,
        address: p.address,
        city: p.city,
        pricePerHour: Number(p.price_per_hour),
        vehicleTypes: [p.vehicle_type],
        features: p.amenities || [],
        type: p.vehicle_type,
        latitude: p.latitude,
        longitude: p.longitude,
        rating: 0,
        reviews: 0,
        distanceKm: 0,
        availableHours: '24 hours',
        dayPass: Number(p.price_per_hour) * 8,
        image:
          'https://images.unsplash.com/photo-1506521781263-d8422e82f27a',
        host: {
          name: 'ParkShare Host',
          memberSince: '2026',
          responseRate: '100%',
        },
        status: p.is_active ? 'Active' : 'Disabled',
        isActive: p.is_active,
      }

      setParkingSpaces((prev) => [
        formattedParking,
        ...prev,
      ])

      return formattedParking
    } catch (error) {
      console.error('Add parking error:', error)
      throw error
    }
  }

  // UPDATE PARKING
  const updateParkingSpace = async (id, patch) => {
    try {
      const backendPatch = {
        ...patch,
      }

      // Convert frontend status to backend isActive
      if (patch.status !== undefined) {
        backendPatch.isActive = patch.status === 'Active'
        delete backendPatch.status
      }

      const response = await ownerAPI.updateParking(
        id,
        backendPatch
      )

      const p = response.data

      setParkingSpaces((prev) =>
        prev.map((space) =>
          space.id === id
            ? {
                ...space,
                title: p.title,
                description: p.description,
                address: p.address,
                city: p.city,
                pricePerHour: Number(p.price_per_hour),
                vehicleTypes: [p.vehicle_type],
                features: p.amenities || [],
                latitude: p.latitude,
                longitude: p.longitude,
                status: p.is_active
                  ? 'Active'
                  : 'Disabled',
                isActive: p.is_active,
              }
            : space
        )
      )

      return response.data
    } catch (error) {
      console.error('Update parking error:', error)
      throw error
    }
  }

  // DELETE PARKING
  const deleteParkingSpace = async (id) => {
    try {
      await ownerAPI.deleteParking(id)

      setParkingSpaces((prev) =>
        prev.filter((space) => space.id !== id)
      )
    } catch (error) {
      console.error('Delete parking error:', error)
      alert(error.message || 'Failed to delete parking')
    }
  }

  // FAVORITE
  const toggleFavorite = async (parkingId) => {
    try {
      const exists = favorites.includes(parkingId)

      if (exists) {
        await favoriteAPI.remove(parkingId)

        setFavorites((prev) =>
          prev.filter((id) => id !== parkingId)
        )
      } else {
        await favoriteAPI.add(parkingId)

        setFavorites((prev) => [
          ...prev,
          parkingId,
        ])
      }
    } catch (error) {
      console.error('Favorite error:', error)
    }
  }

  // CREATE BOOKING
  const createBooking = async ({
    parkingId,
    driverId,
    date,
    startTime,
    endTime,
    vehicle,
    parkingCharge,
    platformFee,
    total,
  }) => {
    try {
      const startDateTime = new Date(
        `${date}T${startTime}`
      ).toISOString()

      const endDateTime = new Date(
        `${date}T${endTime}`
      ).toISOString()

      const response = await bookingAPI.create({
        parkingSpaceId: parkingId,
        startTime: startDateTime,
        endTime: endDateTime,
      })

      const newBooking = response.data

      setBookings((prev) => [
        ...prev,
        newBooking,
      ])

      return newBooking
    } catch (error) {
      console.error('Booking error:', error)
      throw error
    }
  }

  // CANCEL BOOKING
  const updateBookingStatus = async (
    bookingId,
    status
  ) => {
    try {
      if (status === 'CANCELLED') {
        await bookingAPI.cancel(bookingId)

        setBookings((prev) =>
          prev.map((booking) =>
            booking.id === bookingId
              ? {
                  ...booking,
                  status: 'CANCELLED',
                }
              : booking
          )
        )
      }
    } catch (error) {
      console.error(
        'Cancel booking error:',
        error
      )

      alert(
        error.message ||
          'Failed to cancel booking'
      )
    }
  }

  return (
    <AppDataContext.Provider
      value={{
        parkingSpaces,
        bookings,
        favorites,
        payments,

        addParkingSpace,
        updateParkingSpace,
        deleteParkingSpace,

        toggleFavorite,
        createBooking,
        updateBookingStatus,
      }}
    >
      {children}
    </AppDataContext.Provider>
  )
}

export const useAppData = () =>
  useContext(AppDataContext)