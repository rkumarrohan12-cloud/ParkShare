const VARIANTS = {
  primary: 'bg-primary text-white hover:bg-primary-600 shadow-sm',
  outline: 'border border-primary text-primary hover:bg-primary-50 bg-white',
  ghost: 'text-navy hover:bg-black/5',
  danger: 'bg-red-50 text-red-600 hover:bg-red-100',
  subtle: 'bg-lavender text-navy hover:bg-black/5',
}

const SIZES = {
  sm: 'text-sm px-3 py-1.5',
  md: 'text-sm px-4 py-2.5',
  lg: 'text-base px-6 py-3',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon,
  full = false,
  disabled = false,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${full ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  )
}
