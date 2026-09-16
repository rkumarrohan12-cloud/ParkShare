import DashboardShell from '../../components/common/DashboardShell'
import Icon from '../../components/common/Icon'
import Button from '../../components/common/Button'
import { adminNavItems } from '../../components/admin/adminNav'
import { useEffect, useState } from 'react'
import { adminAPI } from '../../services/api'

export default function AdminParking() {
  const [parkingSpaces, setParkingSpaces] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminAPI.getParking()
      .then((response) => {
        const spaces = (response.data || []).map((p) => ({
          id: p.id,
          title: p.title,
          address: p.address,
          pricePerHour: Number(p.price_per_hour || 0),
          status: p.is_active ? 'Active' : 'Disabled',
          rating: Number(p.rating || 0),
          image:
            'https://images.unsplash.com/photo-1506521781263-d8422e82f27a',
        }))

        setParkingSpaces(spaces)
      })
      .catch((error) => {
        console.error('Failed to load parking:', error)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const toggleStatus = async (s) => {
    const newStatus = s.status !== 'Active'

    try {
      await adminAPI.updateParkingStatus(s.id, newStatus)

      setParkingSpaces((prev) =>
        prev.map((space) =>
          space.id === s.id
            ? {
                ...space,
                status: newStatus ? 'Active' : 'Disabled',
              }
            : space
        )
      )
    } catch (error) {
      console.error('Failed to update parking status:', error)
      alert(error.message || 'Failed to update parking status')
    }
  }
  if (loading) {
  return (
    <DashboardShell
      portalLabel="Admin Portal"
      navItems={adminNavItems}
    >
      <div className="flex justify-center py-20">
        <p className="text-navy/50">
          Loading parking spaces...
        </p>
      </div>
    </DashboardShell>
  )
}

  return (
    <DashboardShell portalLabel="Admin Portal" navItems={adminNavItems}>
      <h1 className="text-2xl font-extrabold mb-6">Parking Management</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {parkingSpaces.map((s) => (
          <div key={s.id} className="bg-white rounded-2xl shadow-card border border-black/5 overflow-hidden">
            <div className="relative h-32">
              <img src={s.image} alt={s.title} className="w-full h-full object-cover" />
              <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${s.status === 'Active' ? 'bg-primary text-white' : 'bg-navy/60 text-white'}`}>
                {s.status}
              </span>
            </div>
            <div className="p-4">
              <p className="font-bold">{s.title}</p>
              <p className="text-xs text-navy/50 mb-2">{s.address}</p>
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="font-bold text-primary-700">₹{s.pricePerHour}/hr</span>
                <span className="flex items-center gap-1 text-xs text-navy/40"><Icon name="star" size={14} className="text-amber-500" />{s.rating}</span>
              </div>
              <Button size="sm" variant={s.status === 'Active' ? 'danger' : 'primary'} full onClick={() => toggleStatus(s)}>
                {s.status === 'Active' ? 'Deactivate Listing' : 'Activate Listing'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </DashboardShell>
  )
}
