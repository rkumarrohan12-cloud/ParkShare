import { Link } from 'react-router-dom'
import DashboardShell from '../../components/common/DashboardShell'
import EmptyState from '../../components/common/EmptyState'
import Button from '../../components/common/Button'
import ParkingCard from '../../components/driver/ParkingCard'
import { driverNavItems } from '../../components/driver/driverNav'
import { useAppData } from '../../context/AppDataContext'

export default function Favorites() {
  const { parkingSpaces, favorites } = useAppData()
  const favSpaces = parkingSpaces.filter((p) => favorites.includes(p.id))

  return (
    <DashboardShell portalLabel="Driver Portal" navItems={driverNavItems}>
      <h1 className="text-2xl font-extrabold mb-6">Favorite Parking Spaces</h1>

      {favSpaces.length === 0 ? (
        <EmptyState
          icon="favorite_border"
          title="No favorites yet"
          subtitle="Tap the heart icon on any parking space to save it here for quick access."
          action={<Link to="/driver/find-parking"><Button>Browse Parking</Button></Link>}
        />
      ) : (
        <div className="space-y-4">
          {favSpaces.map((s) => <ParkingCard key={s.id} space={s} />)}
        </div>
      )}
    </DashboardShell>
  )
}
