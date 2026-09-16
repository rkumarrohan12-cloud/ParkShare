import { Link } from 'react-router-dom'
import Icon from '../common/Icon'
import Button from '../common/Button'

const STATUS_STYLES = {
  PENDING: 'bg-yellow-50 text-yellow-600',
  CONFIRMED: 'bg-blue-50 text-blue-600',
  ACTIVE: 'bg-primary-50 text-primary-700',
  COMPLETED: 'bg-navy/5 text-navy/60',
  CANCELLED: 'bg-red-50 text-red-500',
}

const STATUS_LABELS = {
  PENDING: 'PAYMENT PENDING',
  CONFIRMED: 'CONFIRMED',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
}

function formatDate(dateString) {
  if (!dateString) return '—'

  return new Date(dateString).toLocaleDateString(
    'en-IN',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }
  )
}

function formatTime(dateString) {
  if (!dateString) return '—'

  return new Date(dateString).toLocaleTimeString(
    'en-IN',
    {
      hour: '2-digit',
      minute: '2-digit',
    }
  )
}

export default function BookingCard({
  booking,
  space,
  onCancel,
}) {
  if (!booking) return null

  return (
    <div className="bg-white rounded-2xl shadow-card border border-black/5 p-5 flex flex-col sm:flex-row gap-4">

      {/* Parking Image */}
      <img
        src={
          space?.image ||
          'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=500&q=80'
        }
        alt={space?.title || booking.title || 'Parking'}
        className="w-full sm:w-32 h-28 object-cover rounded-xl shrink-0"
      />

      <div className="flex-1">

        {/* Title + Status */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-bold">
              {space?.title ||
                booking.title ||
                booking.parking_title ||
                'Parking Space'}
            </h3>

            <p className="text-xs text-navy/50">
              {space?.address ||
                booking.address ||
                'Address unavailable'}
            </p>
          </div>

          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
              STATUS_STYLES[booking.status] ||
              'bg-navy/5 text-navy/60'
            }`}
          >
            {STATUS_LABELS[booking.status] ||
              booking.status}
          </span>
        </div>

        {/* Booking Information */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-navy/50 mt-3">

          <span className="flex items-center gap-1">
            <Icon
              name="calendar_month"
              size={14}
            />
            {formatDate(
              booking.start_time
            )}
          </span>

          <span className="flex items-center gap-1">
            <Icon
              name="schedule"
              size={14}
            />
            {formatTime(
              booking.start_time
            )}
            {' – '}
            {formatTime(
              booking.end_time
            )}
          </span>

          <span className="flex items-center gap-1">
            <Icon
              name="tag"
              size={14}
            />
            {booking.id}
          </span>

        </div>

        {/* Price + Buttons */}
        <div className="flex items-center justify-between mt-4 gap-3">

          <p className="font-bold text-primary-700">
            ₹
            {Number(
              booking.total_amount || 0
            ).toFixed(2)}
          </p>

          <div className="flex gap-2 flex-wrap justify-end">

            <Link
              to={`/booking/${booking.id}`}
            >
              <Button
                size="sm"
                variant="outline"
              >
                View Details
              </Button>
            </Link>

            {/* PENDING and CONFIRMED can be cancelled */}
            {(
              booking.status ===
                'PENDING' ||
              booking.status ===
                'CONFIRMED'
            ) && (
              <Button
                size="sm"
                variant="danger"
                onClick={() =>
                  onCancel(booking.id)
                }
              >
                Cancel
              </Button>
            )}

          </div>
        </div>

        {/* Pending Payment Message */}
        {booking.status === 'PENDING' && (
          <div className="mt-3 rounded-lg bg-yellow-50 border border-yellow-100 px-3 py-2">
            <p className="text-xs text-yellow-700">
              Payment is required to confirm
              this booking.
            </p>
          </div>
        )}

        {/* Confirmed Message */}
        {booking.status === 'CONFIRMED' && (
          <div className="mt-3 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2">
            <p className="text-xs text-blue-700">
              Your payment is successful and
              this parking is confirmed.
            </p>
          </div>
        )}

      </div>
    </div>
  )
}