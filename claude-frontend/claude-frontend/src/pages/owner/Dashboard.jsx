import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import DashboardShell from '../../components/common/DashboardShell'
import StatCard from '../../components/common/StatCard'
import Icon from '../../components/common/Icon'
import Button from '../../components/common/Button'
import EmptyState from '../../components/common/EmptyState'
import { ownerNavItems } from '../../components/owner/ownerNav'
import { useAuth } from '../../context/AuthContext'
import { ownerAPI } from '../../services/api'

export default function OwnerDashboard() {
  const { user, switchRole } = useAuth()
  const navigate = useNavigate()

  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await ownerAPI.getDashboard()
        setDashboard(response.data)
      } catch (error) {
        console.error('Failed to load owner dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const stats = dashboard?.stats || dashboard || {}

  const totalEarnings = Number(
    stats.totalEarnings ||
    stats.total_earnings ||
    0
  )

  const activeSlots =
    stats.activeSlots ??
    stats.active_slots ??
    0

  const totalBookings =
    stats.totalBookings ??
    stats.total_bookings ??
    0

  const occupancy =
    stats.occupancyRate ??
    stats.occupancy_rate ??
    0

  const recentBookings =
    dashboard?.recentBookings ||
    dashboard?.recent_bookings ||
    []

  const totalSlots =
    stats.totalSlots ??
    stats.total_slots ??
    0

  const bottomExtra = (
    <button
      onClick={() => {
        switchRole('DRIVER')
        navigate('/driver')
      }}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white w-full"
    >
      <Icon name="swap_horiz" size={20} />
      Switch to Driver Mode
    </button>
  )

  if (loading) {
    return (
      <DashboardShell
        portalLabel="Owner Portal"
        navItems={ownerNavItems}
        bottomExtra={bottomExtra}
      >
        <div className="flex items-center justify-center py-20">
          <p className="text-navy/50">Loading dashboard...</p>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell
      portalLabel="Owner Portal"
      navItems={ownerNavItems}
      bottomExtra={bottomExtra}
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold">
            Owner Dashboard
          </h1>

          <p className="text-navy/50">
            Welcome back, {user?.name?.split(' ')[0]}.
          </p>
        </div>

        <Button
          icon={<Icon name="add" size={18} />}
          onClick={() => navigate('/owner/list-slot')}
        >
          List New Parking
        </Button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

        <StatCard
          label="Total Earnings"
          value={`₹${totalEarnings.toLocaleString('en-IN')}`}
          icon="payments"
        />

        <StatCard
          label="Active Slots"
          value={activeSlots}
          icon="garage"
          tone="blue"
        />

        <StatCard
          label="Total Bookings"
          value={totalBookings}
          icon="event_note"
          tone="amber"
        />

        <StatCard
          label="Occupancy Rate"
          value={`${occupancy}%`}
          icon="pie_chart"
          tone="rose"
        />

      </div>

      {/* My Parking Slots */}
      <div className="bg-white rounded-2xl shadow-card border border-black/5 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">
            My Parking Slots
          </h2>

          <Link
            to="/owner/slots"
            className="text-sm font-semibold text-primary-700"
          >
            View All
          </Link>
        </div>

        <p className="text-sm text-navy/50">
          You currently have{' '}
          <span className="font-semibold text-navy">
            {totalSlots}
          </span>{' '}
          parking slot(s) listed.
        </p>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-2xl shadow-card border border-black/5 p-6">
        <h2 className="font-bold mb-4">
          Recent Bookings
        </h2>

        {recentBookings.length === 0 ? (
          <EmptyState
            icon="event_busy"
            title="No bookings yet"
            subtitle="Bookings on your parking slots will show up here."
          />
        ) : (
          <div className="space-y-3">

            {recentBookings.slice(0, 5).map((booking) => (
              <div
                key={booking.id}
                className="flex items-center justify-between text-sm border-b border-black/5 pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-semibold">
                    {booking.parking_title ||
                      booking.parkingTitle ||
                      'Parking Slot'}
                  </p>

                  <p className="text-navy/40 text-xs">
                    {booking.start_time
                      ? new Date(
                          booking.start_time
                        ).toLocaleDateString('en-IN')
                      : '—'}
                  </p>
                </div>

                <span className="font-bold text-primary-700">
                  ₹
                  {Number(
                    booking.total_amount ||
                    booking.totalAmount ||
                    0
                  )}
                </span>
              </div>
            ))}

          </div>
        )}
      </div>

      {/* No slots */}
      {totalSlots === 0 && (
        <div className="mt-6">
          <Link to="/owner/list-slot">
            <Button
              size="lg"
              icon={
                <Icon
                  name="add_location_alt"
                  size={18}
                />
              }
            >
              List Your First Parking Slot
            </Button>
          </Link>
        </div>
      )}

    </DashboardShell>
  )
}