import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import DashboardShell from '../../components/common/DashboardShell'
import EmptyState from '../../components/common/EmptyState'
import Icon from '../../components/common/Icon'
import Button from '../../components/common/Button'
import { ownerNavItems } from '../../components/owner/ownerNav'
import { ownerAPI } from '../../services/api'

const DEFAULT_PARKING_IMAGE =
  'https://images.unsplash.com/photo-1506521781263-d8422e82f27a'

export default function Slots() {
  const navigate = useNavigate()

  const [mySlots, setMySlots] = useState([])
  const [loading, setLoading] = useState(true)

  // Load owner's parking slots
  const loadSlots = async () => {
    try {
      setLoading(true)

      const response = await ownerAPI.getSlots()

      const slots = Array.isArray(response.data)
        ? response.data.map((p) => ({
            id: p.id,
            title: p.title,
            description: p.description || '',
            address: p.address,
            city: p.city,
            pricePerHour: Number(p.price_per_hour || 0),
            vehicleType: p.vehicle_type,
            amenities: Array.isArray(p.amenities)
              ? p.amenities
              : [],

            // Active / Disabled status
            status: p.is_active ? 'Active' : 'Disabled',

            // IMPORTANT:
            // Use image coming from PostgreSQL.
            // If no image exists, use default image.
            image: p.image || DEFAULT_PARKING_IMAGE,

            availableHours: '24 hours',
          }))
        : []

      setMySlots(slots)
    } catch (error) {
      console.error('Failed to load owner slots:', error)
      setMySlots([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSlots()
  }, [])

  // Enable / Disable parking slot
  const toggleStatus = async (slot) => {
    try {
      await ownerAPI.updateParking(slot.id, {
        isActive: slot.status !== 'Active',
      })

      await loadSlots()
    } catch (error) {
      console.error('Failed to update parking:', error)
      alert(error.message || 'Failed to update parking')
    }
  }

  // Delete parking slot
  const deleteSlot = async (id) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this parking slot?'
    )

    if (!confirmed) return

    try {
      await ownerAPI.deleteParking(id)

      // Immediately remove from UI
      setMySlots((prev) =>
        prev.filter((slot) => slot.id !== id)
      )
    } catch (error) {
      console.error('Failed to delete parking:', error)
      alert(error.message || 'Failed to delete parking')
    }
  }

  // Loading state
  if (loading) {
    return (
      <DashboardShell
        portalLabel="Owner Portal"
        navItems={ownerNavItems}
      >
        <div className="flex justify-center py-20">
          <p className="text-navy/50">
            Loading your parking slots...
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-extrabold">
          My Parking Slots
        </h1>

        <Button
          icon={<Icon name="add" size={18} />}
          onClick={() => navigate('/owner/list-slot')}
        >
          List New Parking
        </Button>
      </div>

      {/* Empty State */}
      {mySlots.length === 0 ? (
        <EmptyState
          icon="garage"
          title="You haven't listed any parking yet"
          subtitle="List your unused parking slot and start earning."
          action={
            <Link to="/owner/list-slot">
              <Button>List Your Parking</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {mySlots.map((slot) => (
            <div
              key={slot.id}
              className="bg-white rounded-2xl shadow-card border border-black/5 overflow-hidden"
            >
              {/* Parking Image */}
              <div className="relative h-36">
                <img
                  src={slot.image}
                  alt={slot.title}
                  className="w-full h-full object-cover"
                  onError={(event) => {
                    // If uploaded image is invalid,
                    // show default image.
                    event.currentTarget.src =
                      DEFAULT_PARKING_IMAGE
                  }}
                />

                {/* Status Badge */}
                <span
                  className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${
                    slot.status === 'Active'
                      ? 'bg-primary text-white'
                      : 'bg-navy/60 text-white'
                  }`}
                >
                  {slot.status}
                </span>
              </div>

              {/* Parking Details */}
              <div className="p-4">
                <p className="font-bold">
                  {slot.title}
                </p>

                <p className="text-xs text-navy/50 mb-2">
                  {slot.address}
                </p>

                <div className="flex items-center justify-between text-sm mb-3">
                  <span className="font-bold text-primary-700">
                    ₹{slot.pricePerHour}/hr
                  </span>

                  <span className="text-xs text-navy/40">
                    {slot.availableHours}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {/* Edit */}
                  <Button
                    size="sm"
                    variant="outline"
                    full
                    onClick={() =>
                      navigate(
                        `/owner/list-slot?edit=${slot.id}`
                      )
                    }
                  >
                    Edit
                  </Button>

                  {/* Enable / Disable */}
                  <Button
                    size="sm"
                    variant={
                      slot.status === 'Active'
                        ? 'subtle'
                        : 'primary'
                    }
                    full
                    onClick={() => toggleStatus(slot)}
                  >
                    {slot.status === 'Active'
                      ? 'Disable'
                      : 'Enable'}
                  </Button>

                  {/* Delete */}
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => deleteSlot(slot.id)}
                  >
                    <Icon
                      name="delete"
                      size={16}
                    />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  )
}