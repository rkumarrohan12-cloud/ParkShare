import { Link } from 'react-router-dom'
import Icon from './Icon'

const COLS = [
  { title: 'Platform', links: [['Find Parking', '/driver/find-parking'], ['List Your Slot', '/owner/list-slot'], ['How it works', '/']] },
  { title: 'For Drivers', links: [['Search Parking', '/driver/find-parking'], ['My Bookings', '/driver/bookings'], ['Favorites', '/driver/favorites']] },
  { title: 'For Owners', links: [['List Parking', '/owner/list-slot'], ['My Slots', '/owner/slots'], ['Earnings', '/owner/earnings']] },
  { title: 'Support', links: [['Help Center', '/'], ['Privacy Policy', '/'], ['Terms of Service', '/']] },
]

export default function Footer() {
  return (
    <footer className="bg-navy text-white/80 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 font-extrabold text-lg text-white mb-3">
            <span className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Icon name="local_parking" size={16} />
            </span>
            ParkShare
          </div>
          <p className="text-sm text-white/50">India's peer-to-peer parking marketplace. Demo product for illustration only.</p>
        </div>
        {COLS.map((col) => (
          <div key={col.title}>
            <h4 className="font-semibold text-white mb-3 text-sm">{col.title}</h4>
            <ul className="space-y-2 text-sm">
              {col.links.map(([label, to]) => (
                <li key={label}><Link to={to} className="hover:text-white">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/40">
        © {new Date().getFullYear()} ParkShare. Demo application — no real payments or verification are performed.
      </div>
    </footer>
  )
}
