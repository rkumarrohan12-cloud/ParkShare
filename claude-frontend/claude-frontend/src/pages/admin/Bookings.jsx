import { useEffect, useState } from 'react'
import DashboardShell from '../../components/common/DashboardShell'
import Icon from '../../components/common/Icon'
import { adminNavItems } from '../../components/admin/adminNav'
import { adminAPI } from '../../services/api'

const STATUS_STYLES = {
  CONFIRMED: 'bg-blue-50 text-blue-600',
  ACTIVE: 'bg-primary-50 text-primary-700',
  COMPLETED: 'bg-navy/5 text-navy/60',
  CANCELLED: 'bg-red-50 text-red-500',
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminAPI.getBookings()
      .then((response) => {
        setBookings(response.data || [])
      })
      .catch((error) => {
        console.error('Failed to load bookings:', error)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])
  const updateStatus = async (bookingId, status) => {
  try {
    await adminAPI.updateBookingStatus(bookingId, status)

    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === bookingId
          ? { ...booking, status }
          : booking
      )
    )
  } catch (error) {
    console.error('Failed to update booking status:', error)
    alert(error.message || 'Failed to update booking status')
  }
}

  const filtered = bookings
    .filter((b) => !statusFilter || b.status === statusFilter)
    .sort(
      (a, b) =>
        new Date(b.created_at || b.createdAt) -
        new Date(a.created_at || a.createdAt)
    )

  return (
    <DashboardShell
      portalLabel="Admin Portal"
      navItems={adminNavItems}
    >
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className="text-2xl font-extrabold">
          Booking Management
        </h1>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm rounded-full border border-black/10 px-3.5 py-2 bg-white"
        >
          <option value="">All statuses</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <p className="text-navy/50">
          Loading bookings...
        </p>
      ) : (
        <div className="bg-white rounded-2xl shadow-card border border-black/5 overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead className="bg-lavender text-navy/50 text-xs uppercase">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">
                  Booking ID
                </th>
                <th className="text-left px-5 py-3 font-semibold">
                  Driver
                </th>
                <th className="text-left px-5 py-3 font-semibold">
                  Parking
                </th>
                <th className="text-left px-5 py-3 font-semibold">
                  Date
                </th>
                <th className="text-left px-5 py-3 font-semibold">
                  Amount
                </th>
                <th className="text-left px-5 py-3 font-semibold">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((b) => {
                const status = b.status || 'CONFIRMED'

                return (
                  <tr
                    key={b.id}
                    className="border-t border-black/5"
                  >
                    <td className="px-5 py-3.5 text-navy/50">
                      {b.id}
                    </td>

                    <td className="px-5 py-3.5 font-medium">
                      {b.driver_name || b.driverName || '—'}
                    </td>

                    <td className="px-5 py-3.5">
                      {b.parking_title || b.parkingTitle || '—'}
                    </td>

                    <td className="px-5 py-3.5 text-navy/50">
                      {b.start_time
                        ? new Date(b.start_time).toLocaleDateString('en-IN')
                        : b.date || '—'}
                    </td>

                    <td className="px-5 py-3.5 font-semibold">
                      ₹{b.total_amount || b.total || 0}
                    </td>

                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                          STATUS_STYLES[status] ||
                          'bg-gray-50 text-gray-600'
                        }`}
                      >
                        <Icon
                          name="fiber_manual_record"
                          size={8}
                        />
                        {status}
                      </span>
                    </td>
                  </tr>
                )
              })}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center text-navy/40 py-8"
                  >
                    No bookings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </DashboardShell>
  )
}