import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import Button from '../components/common/Button'
import Icon from '../components/common/Icon'
import { VEHICLE_TYPES } from '../data/mockData'

const DRIVER_STEPS = [
  ['search', 'Search', 'Enter your destination, date and time to see nearby parking.'],
  ['checklist', 'Choose a parking space', 'Compare price, distance and ratings to pick the right fit.'],
  ['event_available', 'Reserve', 'Lock in your slot in seconds with instant confirmation.'],
  ['directions_car', 'Park', 'Arrive, park and go — no more circling the block.'],
]

const OWNER_STEPS = [
  ['add_location_alt', 'List your slot', 'Add your unused parking space in a few minutes.'],
  ['event', 'Set availability', 'Choose the days and hours it\'s free for drivers to book.'],
  ['task_alt', 'Receive bookings', 'Get notified whenever a driver reserves your slot.'],
  ['payments', 'Earn', 'Track your earnings right from your owner dashboard.'],
]

const TRUST = [
  ['verified_user', 'Verified profiles', 'Every host and driver profile is reviewed before going live.'],
  ['sell', 'Transparent pricing', 'See the full price breakdown before you reserve — no surprises.'],
  ['history', 'Booking history', 'Every reservation is logged so you always have a record.'],
  ['lock', 'Secure account system', 'Your account is protected with modern authentication practices.'],
]

export default function Home() {
  const navigate = useNavigate()
  const [vehicle, setVehicle] = useState(VEHICLE_TYPES[0].id)

  const handleSearch = (e) => {
    e.preventDefault()
    navigate('/driver/find-parking')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-b from-primary-50/60 to-surface px-4 sm:px-6 lg:px-8 pt-16 pb-20">
        <div className="max-w-5xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 bg-white text-primary text-xs font-semibold px-3 py-1.5 rounded-full shadow-card mb-6">
            <Icon name="bolt" size={14} /> Now live across Noida & Delhi NCR
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-navy leading-tight">
            Find parking. <span className="text-primary">Park smarter.</span>
          </h1>
          <p className="mt-5 text-lg text-navy/60 max-w-2xl mx-auto">
            Discover convenient parking spaces near your destination or earn from your unused parking slot.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" onClick={() => navigate('/driver/find-parking')} icon={<Icon name="search" size={18} />}>
              Find Parking
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/owner/list-slot')} icon={<Icon name="add_location_alt" size={18} />}>
              List My Parking Slot
            </Button>
          </div>
        </div>

        {/* Search preview */}
        <form onSubmit={handleSearch} className="max-w-4xl mx-auto mt-12 bg-white rounded-2xl shadow-cardHover border border-black/5 p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="lg:col-span-1">
              <label className="text-xs font-semibold text-navy/50">Location</label>
              <input placeholder="Sector 62, Noida" className="w-full mt-1 rounded-xl border border-black/10 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-xs font-semibold text-navy/50">Date</label>
              <input type="date" className="w-full mt-1 rounded-xl border border-black/10 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-xs font-semibold text-navy/50">Start Time</label>
              <input type="time" className="w-full mt-1 rounded-xl border border-black/10 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-xs font-semibold text-navy/50">End Time</label>
              <input type="time" className="w-full mt-1 rounded-xl border border-black/10 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-xs font-semibold text-navy/50">Vehicle Type</label>
              <select value={vehicle} onChange={(e) => setVehicle(e.target.value)} className="w-full mt-1 rounded-xl border border-black/10 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                {VEHICLE_TYPES.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
              </select>
            </div>
          </div>
          <Button type="submit" full size="lg" className="mt-4" icon={<Icon name="search" size={18} />}>
            Search Available Slots
          </Button>
        </form>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <h2 className="text-3xl font-extrabold text-center mb-2">How ParkShare works</h2>
        <p className="text-center text-navy/50 mb-12">Whether you're driving or hosting, getting started takes minutes.</p>

        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <h3 className="font-bold text-lg mb-5 flex items-center gap-2"><Icon name="directions_car" className="text-primary" /> For Drivers</h3>
            <div className="space-y-5">
              {DRIVER_STEPS.map(([icon, title, desc], i) => (
                <div key={title} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-50 text-primary flex items-center justify-center font-bold shrink-0">{i + 1}</div>
                  <div>
                    <p className="font-semibold">{title}</p>
                    <p className="text-sm text-navy/50">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-5 flex items-center gap-2"><Icon name="storefront" className="text-primary" /> For Owners</h3>
            <div className="space-y-5">
              {OWNER_STEPS.map(([icon, title, desc], i) => (
                <div key={title} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-50 text-primary flex items-center justify-center font-bold shrink-0">{i + 1}</div>
                  <div>
                    <p className="font-semibold">{title}</p>
                    <p className="text-sm text-navy/50">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 bg-primary rounded-2xl p-6 text-white flex items-center justify-between gap-4 flex-wrap">
              <p className="font-bold text-lg">Your empty parking slot could be earning.</p>
              <Button variant="subtle" onClick={() => navigate('/owner/list-slot')}>List My Slot</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="bg-lavender py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-center mb-12">Built on trust</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TRUST.map(([icon, title, desc]) => (
              <div key={title} className="bg-white rounded-2xl p-6 shadow-card border border-black/5">
                <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary flex items-center justify-center mb-4">
                  <Icon name={icon} />
                </div>
                <p className="font-bold mb-1">{title}</p>
                <p className="text-sm text-navy/50">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
