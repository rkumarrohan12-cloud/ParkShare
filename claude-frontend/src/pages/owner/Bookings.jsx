import { useEffect, useState } from 'react'
import DashboardShell from '../../components/common/DashboardShell'
import EmptyState from '../../components/common/EmptyState'
import Icon from '../../components/common/Icon'
import { ownerNavItems } from '../../components/owner/ownerNav'
import { ownerAPI } from '../../services/api'

const STATUS_STYLES = {
  PENDING: 'bg-yellow-50 text-yellow-600',
  CONFIRMED: 'bg-blue-50 text-blue-600',
  ACTIVE: 'bg-primary-50 text-primary-700',
  COMPLETED: 'bg-navy/5 text-navy/60',
  CANCELLED: 'bg-red-50 text-red-500',
}

export default function OwnerBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  const loadBookings = async () => {
    try {
      setLoading(true)

      const response = await ownerAPI.getBookings()

      console.log('OWNER BOOKINGS:', response)

      setBookings(response.data || [])
    } catch (error) {
      console.error('Failed to load owner bookings:', error)
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBookings()
  }, [])

  const updateStatus = async (bookingId, status) => {
    try {
      await ownerAPI.updateBookingStatus(bookingId, status)

      await loadBookings()
    } catch (error) {
      console.error('Failed to update booking:', error)
      alert(error.message || 'Failed to update booking')
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'

    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatTime = (dateString) => {
    if (!dateString) return '-'

    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <DashboardShell
        portalLabel="Owner Portal"
        navItems={ownerNavItems}
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
      portalLabel="Owner Portal"
      navItems={ownerNavItems}
    >
      <h1 className="text-2xl font-extrabold mb-6">
        Bookings on My Slots
      </h1>

      {bookings.length === 0 ? (
        <EmptyState
          icon="event_busy"
          title="No bookings yet"
          subtitle="Once a driver reserves your parking, it will show up here."
        />
      ) : (
        <div className="bg-white rounded-2xl shadow-card border border-black/5 overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead className="bg-lavender text-navy/50 text-xs uppercase">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">
                  Driver
                </th>

                <th className="text-left px-5 py-3 font-semibold">
                  Parking
                </th>

                <th className="text-left px-5 py-3 font-semibold">
                  Date / Time
                </th>

                <th className="text-left px-5 py-3 font-semibold">
                  Amount
                </th>

                <th className="text-left px-5 py-3 font-semibold">
                  Status
                </th>

                <th className="text-left px-5 py-3 font-semibold">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {bookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="border-t border-black/5"
                >
                  {/* Driver */}
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="font-medium">
                        {booking.driver_name || 'Driver'}
                      </p>

                      {booking.driver_email && (
                        <p className="text-xs text-navy/40">
                          {booking.driver_email}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Parking */}
                  <td className="px-5 py-3.5 font-medium">
                    {booking.parking_title || 'Parking'}
                  </td>

                  {/* Date / Time */}
                  <td className="px-5 py-3.5 text-navy/50">
                    <div>
                      <p>
                        {formatDate(booking.start_time)}
                      </p>

                      <p className="text-xs">
                        {formatTime(booking.start_time)}
                        {' – '}
                        {formatTime(booking.end_time)}
                      </p>
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="px-5 py-3.5 font-semibold">
                    ₹{Number(booking.total_amount || 0)}
                  </td>

                  {/* Status */}
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        STATUS_STYLES[booking.status] ||
                        'bg-navy/5 text-navy/60'
                      }`}
                    >
                      <Icon
                        name="fiber_manual_record"
                        size={8}
                      />

                      {booking.status}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="px-5 py-3.5">
                    {booking.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            updateStatus(
                              booking.id,
                              'CONFIRMED'
                            )
                          }
                          className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold"
                        >
                          Confirm
                        </button>

                        <button
                          onClick={() =>
                            updateStatus(
                              booking.id,
                              'CANCELLED'
                            )
                          }
                          className="px-3 py-1.5 rounded-lg bg-red-50 text-red-500 text-xs font-semibold"
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    {booking.status === 'CONFIRMED' && (
                      <button
                        onClick={() =>
                          updateStatus(
                            booking.id,
                            'ACTIVE'
                          )
                        }
                        className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold"
                      >
                        Mark Active
                      </button>
                    )}

                    {booking.status === 'ACTIVE' && (
                      <button
                        onClick={() =>
                          updateStatus(
                            booking.id,
                            'COMPLETED'
                          )
                        }
                        className="px-3 py-1.5 rounded-lg bg-navy text-white text-xs font-semibold"
                      >
                        Complete
                      </button>
                    )}

                    {(booking.status === 'COMPLETED' ||
                      booking.status === 'CANCELLED') && (
                      <span className="text-xs text-navy/40">
                        No action
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardShell>
  )
}