import DashboardShell from '../../components/common/DashboardShell'
import EmptyState from '../../components/common/EmptyState'
import Icon from '../../components/common/Icon'
import { driverNavItems } from '../../components/driver/driverNav'
import { useAppData } from '../../context/AppDataContext'
import { useAuth } from '../../context/AuthContext'

export default function Payments() {
  const { user } = useAuth()
  const { bookings, payments, parkingSpaces } = useAppData()

  const myBookingIds = bookings.filter((b) => b.driverId === user.id).map((b) => b.id)
  const myPayments = payments.filter((p) => myBookingIds.includes(p.bookingId)).sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <DashboardShell portalLabel="Driver Portal" navItems={driverNavItems}>
      <h1 className="text-2xl font-extrabold mb-6">Payment History</h1>

      {myPayments.length === 0 ? (
        <EmptyState icon="receipt_long" title="No payments yet" subtitle="Your booking payments will appear here." />
      ) : (
        <div className="bg-white rounded-2xl shadow-card border border-black/5 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-lavender text-navy/50 text-xs uppercase">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">Booking</th>
                <th className="text-left px-5 py-3 font-semibold">Date</th>
                <th className="text-left px-5 py-3 font-semibold">Transaction ID</th>
                <th className="text-left px-5 py-3 font-semibold">Amount</th>
                <th className="text-left px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {myPayments.map((p) => {
                const booking = bookings.find((b) => b.id === p.bookingId)
                const space = parkingSpaces.find((s) => s.id === booking?.parkingId)
                return (
                  <tr key={p.id} className="border-t border-black/5">
                    <td className="px-5 py-3.5 font-medium">{space?.title || '—'}</td>
                    <td className="px-5 py-3.5 text-navy/50">{new Date(p.date).toLocaleDateString()}</td>
                    <td className="px-5 py-3.5 text-navy/50">{p.id}</td>
                    <td className="px-5 py-3.5 font-semibold">₹{p.amount}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-full">
                        <Icon name="check_circle" size={14} /> {p.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </DashboardShell>
  )
}
