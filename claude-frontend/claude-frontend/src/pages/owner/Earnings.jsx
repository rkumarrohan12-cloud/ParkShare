import { useEffect, useState } from 'react'
import DashboardShell from '../../components/common/DashboardShell'
import StatCard from '../../components/common/StatCard'
import { ownerNavItems } from '../../components/owner/ownerNav'
import { ownerAPI } from '../../services/api'

export default function Earnings() {
  const [earnings, setEarnings] = useState({
    total: 0,
    month: 0,
    week: 0,
    pending: 0,
    completed: 0,
  })

  const [loading, setLoading] = useState(true)

  const loadEarnings = async () => {
    try {
      setLoading(true)

      const response = await ownerAPI.getEarnings()

      console.log('OWNER EARNINGS:', response)

      const data = response.data || {}

      setEarnings({
        total: Number(data.total || 0),
        month: Number(data.month || 0),
        week: Number(data.week || 0),
        pending: Number(data.pending || 0),
        completed: Number(data.completed || 0),
      })
    } catch (error) {
      console.error('Failed to load earnings:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEarnings()
  }, [])

  const formatMoney = (value) =>
    `₹${Number(value || 0).toLocaleString('en-IN')}`

  const maxVal = Math.max(earnings.total, 1)

  const bars = [
    ['Total', earnings.total, 'bg-primary'],
    ['This Month', earnings.month, 'bg-blue-500'],
    ['This Week', earnings.week, 'bg-amber-500'],
    ['Pending', earnings.pending, 'bg-rose-400'],
    ['Completed', earnings.completed, 'bg-navy/60'],
  ]

  if (loading) {
    return (
      <DashboardShell
        portalLabel="Owner Portal"
        navItems={ownerNavItems}
      >
        <div className="flex justify-center py-20">
          <p className="text-navy/50">
            Loading earnings...
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
        Earnings
      </h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard
          label="Total Earnings"
          value={formatMoney(earnings.total)}
          icon="account_balance_wallet"
        />

        <StatCard
          label="This Month"
          value={formatMoney(earnings.month)}
          icon="calendar_month"
          tone="blue"
        />

        <StatCard
          label="This Week"
          value={formatMoney(earnings.week)}
          icon="date_range"
          tone="amber"
        />

        <StatCard
          label="Pending"
          value={formatMoney(earnings.pending)}
          icon="hourglass_top"
          tone="rose"
        />

        <StatCard
          label="Completed"
          value={formatMoney(earnings.completed)}
          icon="task_alt"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-black/5 p-6">
        <h2 className="font-bold mb-6">
          Earnings Overview
        </h2>

        <div className="space-y-4">
          {bars.map(([label, value, color]) => (
            <div key={label}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-navy/60">
                  {label}
                </span>

                <span className="font-semibold">
                  {formatMoney(value)}
                </span>
              </div>

              <div className="h-2.5 rounded-full bg-lavender overflow-hidden">
                <div
                  className={`h-full rounded-full ${color}`}
                  style={{
                    width: `${(value / maxVal) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  )
}