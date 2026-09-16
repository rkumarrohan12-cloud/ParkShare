import Icon from './Icon'

export default function EmptyState({ icon = 'inbox', title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 bg-white rounded-2xl shadow-card border border-black/5">
      <div className="w-14 h-14 rounded-full bg-primary-50 text-primary flex items-center justify-center mb-4">
        <Icon name={icon} size={28} />
      </div>
      <h3 className="font-bold text-lg mb-1">{title}</h3>
      {subtitle && <p className="text-sm text-navy/50 max-w-sm mb-4">{subtitle}</p>}
      {action}
    </div>
  )
}
