import { Link } from 'react-router-dom'
import Icon from '../common/Icon'
import Button from '../common/Button'
import { useAppData } from '../../context/AppDataContext'

export default function ParkingCard({ space }) {
  const { favorites, toggleFavorite } = useAppData()
  const isFav = favorites.includes(space.id)

  // Support both frontend and backend field names
  const contactNumber =
    space.contactNumber ||
    space.contact_number ||
    ''

  return (
    <div className="bg-white rounded-2xl shadow-card hover:shadow-cardHover transition-shadow border border-black/5 overflow-hidden flex flex-col sm:flex-row">
      
      {/* IMAGE */}
      <div className="relative sm:w-56 h-44 sm:h-auto shrink-0">
        <img
          src={space.image}
          alt={space.title}
          className="w-full h-full object-cover"
        />

        <span className="absolute top-3 left-3 bg-primary text-white text-xs font-semibold px-2.5 py-1 rounded-full">
          Available
        </span>

        <button
          onClick={() => toggleFavorite(space.id)}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center"
        >
          <Icon
            name={
              isFav
                ? 'favorite'
                : 'favorite_border'
            }
            className={
              isFav
                ? 'text-red-500'
                : 'text-navy/60'
            }
            size={18}
          />
        </button>
      </div>

      {/* DETAILS */}
      <div className="flex-1 p-5 flex flex-col">

        {/* TITLE + RATING */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-bold text-lg leading-tight">
              {space.title}
            </h3>

            <p className="text-sm text-navy/50">
              {space.address}
            </p>
          </div>

          <div className="flex items-center gap-1 text-sm font-semibold shrink-0">
            <Icon
              name="star"
              size={16}
              className="text-amber-500"
            />

            {space.rating}

            <span className="text-navy/40 font-normal">
              ({space.reviews})
            </span>
          </div>
        </div>

        {/* PARKING INFO */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-navy/50 mt-3">

          <span className="flex items-center gap-1">
            <Icon
              name="near_me"
              size={14}
            />
            {space.distanceKm} km away
          </span>

          <span className="flex items-center gap-1">
            <Icon
              name="directions_walk"
              size={14}
            />
            {space.walkMins} min walk
          </span>

          <span className="flex items-center gap-1">
            <Icon
              name="garage"
              size={14}
            />
            {space.type}
          </span>

          <span className="flex items-center gap-1">
            <Icon
              name="schedule"
              size={14}
            />
            {space.availableHours}
          </span>

        </div>

        {/* FEATURES */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {space.features?.map((f) => (
            <span
              key={f}
              className="text-[11px] bg-lavender text-navy/60 px-2 py-1 rounded-full"
            >
              {f.replace('_', ' ')}
            </span>
          ))}
        </div>

        {/* CONTACT OWNER */}
        {contactNumber && (
          <div className="mt-3 flex items-center gap-2">
            <a
              href={`tel:${contactNumber}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-700 hover:text-primary transition-colors"
            >
              <Icon
                name="phone"
                size={15}
              />
              Contact Owner
            </a>

            <span className="text-xs text-navy/40">
              {contactNumber}
            </span>
          </div>
        )}

        {/* PRICE + BUTTON */}
        <div className="mt-auto pt-4 flex items-center justify-between">

          <div>
            <p className="font-extrabold text-lg text-primary-700">
              ₹{space.pricePerHour}
              <span className="text-sm font-medium text-navy/40">
                /hour
              </span>
            </p>

            <p className="text-xs text-navy/40">
              ₹{space.dayPass} day pass
            </p>
          </div>

          <Link
            to={`/parking/${space.id}`}
          >
            <Button size="sm">
              View & Reserve
            </Button>
          </Link>

        </div>

      </div>
    </div>
  )
}