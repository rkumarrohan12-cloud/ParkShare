import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import DashboardShell from '../../components/common/DashboardShell'
import Icon from '../../components/common/Icon'
import Button from '../../components/common/Button'
import { driverNavItems } from '../../components/driver/driverNav'
import { useAuth } from '../../context/AuthContext'
import { useAppData } from '../../context/AppDataContext'
import { VEHICLE_TYPES } from '../../data/mockData'

const FILTERS = [
  { id: 'covered', label: 'Covered parking' },
  { id: 'ev_charging', label: 'EV charging' },
  { id: '24_7', label: '24/7 access' },
  { id: 'nearby', label: 'Nearby' },
]

export default function DriverDashboard() {
  const { user, switchRole } = useAuth()
  const { bookings } = useAppData()
  const navigate = useNavigate()
  const [vehicle, setVehicle] = useState(VEHICLE_TYPES[0].id)
  const [filters, setFilters] = useState([])

  const myBookings = bookings.filter((b) => b.driverId === user.id)
  const upcoming = myBookings.filter((b) => b.status === 'Upcoming')

  const toggleFilter = (id) => setFilters((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]))

  const statusCard = (
    <div className="bg-white/5 rounded-xl p-3">
      <p className="text-xs font-semibold text-primary-300 flex items-center gap-1"><Icon name="verified" size={14} /> Driver {user.status || 'Verified'}</p>
      <p className="text-xs text-white/40 mt-0.5">Active</p>
    </div>
  )

  const bottomExtra = (
    <button onClick={() => { switchRole('OWNER'); navigate('/owner') }} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white w-full">
      <Icon name="swap_horiz" size={20} /> Switch to Owner Mode
    </button>
  )

  return (
    <DashboardShell portalLabel="Driver Portal" navItems={driverNavItems} statusCard={statusCard} bottomExtra={bottomExtra}>
      <h1 className="text-2xl font-extrabold mb-1">Find & Reserve Parking</h1>
      <p className="text-navy/50 mb-6">Welcome back, {user.name.split(' ')[0]}. You have {upcoming.length} upcoming booking(s).</p>

      <div className="bg-white rounded-2xl shadow-card border border-black/5 p-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Current Location" icon="my_location" placeholder="Sector 62, Noida" />
          <Field label="Destination / Society / Landmark" icon="location_on" placeholder="Search a society or landmark" />
          <Field label="Date" icon="calendar_month" type="date" />
          <Field label="Start Time" icon="schedule" type="time" />
          <Field label="End Time" icon="schedule" type="time" />
          <div>
            <label className="text-xs font-semibold text-navy/50">Vehicle Type</label>
            <select value={vehicle} onChange={(e) => setVehicle(e.target.value)} className="w-full mt-1 rounded-xl border border-black/10 px-3 py-2.5 text-sm">
              {VEHICLE_TYPES.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-5">
          <p className="text-xs font-semibold text-navy/50 mb-2">Additional Filters</p>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => toggleFilter(f.id)}
                className={`text-xs font-medium px-3.5 py-2 rounded-full border transition-colors ${
                  filters.includes(f.id) ? 'bg-primary text-white border-primary' : 'border-black/10 text-navy/60 hover:border-primary/40'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <Button full size="lg" className="mt-6" icon={<Icon name="search" size={18} />} onClick={() => navigate('/driver/find-parking')}>
          Search Available Slots
        </Button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mt-8">
        <QuickLink to="/driver/bookings" icon="event_note" label="My Bookings" count={myBookings.length} />
        <QuickLink to="/driver/favorites" icon="favorite" label="Favorites" />
        <QuickLink to="/driver/payments" icon="payments" label="Payment History" />
      </div>
    </DashboardShell>
  )
}

function Field({ label, icon, type = 'text', placeholder }) {
  return (
    <div>
      <label className="text-xs font-semibold text-navy/50 flex items-center gap-1"><Icon name={icon} size={14} />{label}</label>
      <input type={type} placeholder={placeholder} className="w-full mt-1 rounded-xl border border-black/10 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
    </div>
  )
}

function QuickLink({ to, icon, label, count }) {
  return (
    <Link to={to} className="bg-white rounded-2xl border border-black/5 shadow-card p-5 flex items-center justify-between hover:shadow-cardHover transition-shadow">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary flex items-center justify-center"><Icon name={icon} /></div>
        <p className="font-semibold">{label}</p>
      </div>
      {count !== undefined && <span className="text-sm font-bold text-navy/40">{count}</span>}
    </Link>
  )
}
