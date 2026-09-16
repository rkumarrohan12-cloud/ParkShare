import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/common/ProtectedRoute'

import Home from './pages/Home'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import ParkingDetails from './pages/ParkingDetails'
import Booking from './pages/Booking'
import NotFound from './pages/NotFound'

import DriverDashboard from './pages/driver/Dashboard'
import FindParking from './pages/driver/FindParking'
import DriverBookings from './pages/driver/Bookings'
import Favorites from './pages/driver/Favorites'
import Payments from './pages/driver/Payments'
import DriverProfile from './pages/driver/Profile'

import OwnerDashboard from './pages/owner/Dashboard'
import ListSlot from './pages/owner/ListSlot'
import OwnerSlots from './pages/owner/Slots'
import OwnerBookings from './pages/owner/Bookings'
import Earnings from './pages/owner/Earnings'

import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminParking from './pages/admin/Parking'
import AdminBookings from './pages/admin/Bookings'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route path="/parking/:id" element={<ParkingDetails />} />
      <Route path="/booking/:id" element={<Booking />} />

      <Route path="/driver" element={<ProtectedRoute roles={['DRIVER']}><DriverDashboard /></ProtectedRoute>} />
      <Route path="/driver/find-parking" element={<ProtectedRoute roles={['DRIVER']}><FindParking /></ProtectedRoute>} />
      <Route path="/driver/bookings" element={<ProtectedRoute roles={['DRIVER']}><DriverBookings /></ProtectedRoute>} />
      <Route path="/driver/favorites" element={<ProtectedRoute roles={['DRIVER']}><Favorites /></ProtectedRoute>} />
      <Route path="/driver/payments" element={<ProtectedRoute roles={['DRIVER']}><Payments /></ProtectedRoute>} />
      <Route path="/driver/profile" element={<ProtectedRoute roles={['DRIVER']}><DriverProfile /></ProtectedRoute>} />

      <Route path="/owner" element={<ProtectedRoute roles={['OWNER']}><OwnerDashboard /></ProtectedRoute>} />
      <Route path="/owner/list-slot" element={<ProtectedRoute roles={['OWNER']}><ListSlot /></ProtectedRoute>} />
      <Route path="/owner/slots" element={<ProtectedRoute roles={['OWNER']}><OwnerSlots /></ProtectedRoute>} />
      <Route path="/owner/bookings" element={<ProtectedRoute roles={['OWNER']}><OwnerBookings /></ProtectedRoute>} />
      <Route path="/owner/earnings" element={<ProtectedRoute roles={['OWNER']}><Earnings /></ProtectedRoute>} />

      <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute roles={['ADMIN']}><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/parking" element={<ProtectedRoute roles={['ADMIN']}><AdminParking /></ProtectedRoute>} />
      <Route path="/admin/bookings" element={<ProtectedRoute roles={['ADMIN']}><AdminBookings /></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
