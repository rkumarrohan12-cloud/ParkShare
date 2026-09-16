import Icon from './Icon'

export default function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-cardHover w-full max-w-md max-h-[85vh] overflow-y-auto thin-scroll">
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 sticky top-0 bg-white">
          <h3 className="font-bold text-lg">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-black/5">
            <Icon name="close" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-black/5">{footer}</div>}
      </div>
    </div>
  )
}
