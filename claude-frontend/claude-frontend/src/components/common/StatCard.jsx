import Icon from './Icon'

export default function StatCard({ label, value, icon, trend, tone = 'primary' }) {
  const tones = {
    primary: 'bg-primary-50 text-primary',
    amber: 'bg-amber-50 text-amber-600',
    blue: 'bg-blue-50 text-blue-600',
    rose: 'bg-rose-50 text-rose-600',
  }
  return (
    <div className="bg-white rounded-2xl p-5 shadow-card border border-black/5 flex items-start justify-between">
      <div>
        <p className="text-sm text-navy/50 font-medium">{label}</p>
        <p className="text-2xl font-extrabold mt-1">{value}</p>
        {trend && <p className="text-xs text-primary-600 mt-1 font-medium">{trend}</p>}
      </div>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${tones[tone]}`}>
        <Icon name={icon} />
      </div>
    </div>
  )
}
