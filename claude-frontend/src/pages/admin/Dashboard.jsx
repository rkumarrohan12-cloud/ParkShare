import { useEffect, useState } from 'react'
import DashboardShell from '../../components/common/DashboardShell'
import StatCard from '../../components/common/StatCard'
import Icon from '../../components/common/Icon'
import { adminNavItems } from '../../components/admin/adminNav'
import { adminAPI } from '../../services/api'

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminAPI.getStats()
      .then((response) => {
        setDashboard(response.data)
      })
      .catch((error) => {
        console.error('Failed to load admin dashboard:', error)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <DashboardShell
        portalLabel="Admin Portal"
        navItems={adminNavItems}
      >
        <p>Loading dashboard...</p>
      </DashboardShell>
    )
  }

  const stats = dashboard?.stats || dashboard || {}

  return (
    <DashboardShell
      portalLabel="Admin Portal"
      navItems={adminNavItems}
    >
      <h1 className="text-2xl font-extrabold mb-6">
        Admin Dashboard
      </h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Total Users"
          value={stats.totalUsers || 0}
          icon="group"
        />

        <StatCard
          label="Drivers"
          value={stats.drivers || 0}
          icon="directions_car"
          tone="blue"
        />

        <StatCard
          label="Owners"
          value={stats.owners || 0}
          icon="storefront"
          tone="amber"
        />

        <StatCard
          label="Parking Spaces"
          value={stats.parkingSpaces || 0}
          icon="garage"
        />

        <StatCard
          label="Total Bookings"
          value={stats.totalBookings || 0}
          icon="event_note"
          tone="rose"
        />

        <StatCard
          label="Revenue"
          value={`₹${Number(
            stats.revenue || 0
          ).toLocaleString('en-IN')}`}
          icon="payments"
          tone="blue"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-black/5 p-6">
        <h2 className="font-bold mb-4">
          Recent Activity
        </h2>

        <div className="flex items-center gap-2 text-sm">
          <Icon
            name="event_available"
            size={18}
            className="text-primary"
          />
          <span>
            Dashboard data loaded from backend.
          </span>
        </div>
      </div>
    </DashboardShell>
  )
}