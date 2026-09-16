import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import Icon from './Icon'
import Button from './Button'
import { useAuth } from '../../context/AuthContext'

export default function DashboardShell({ portalLabel, navItems, statusCard, bottomExtra, children }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const doLogout = () => {
    logout()
    navigate('/')
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-6 pb-4">
        <Link to="/" className="flex items-center gap-2 font-extrabold text-lg text-white">
          <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Icon name="local_parking" size={18} />
          </span>
          ParkShare
        </Link>
        <p className="text-xs text-white/40 mt-1 ml-10">{portalLabel}</p>
      </div>

      {statusCard && <div className="mx-4 mb-4">{statusCard}</div>}

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto thin-scroll">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setDrawerOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive ? 'bg-primary text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Icon name={item.icon} size={20} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-5 pt-3 border-t border-white/10 space-y-1">
        {bottomExtra}
        <button
          onClick={doLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white w-full"
        >
          <Icon name="logout" size={20} />
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-navy shrink-0 sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-navy">
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 bg-white border-b border-black/5 h-16 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 -ml-2" onClick={() => setDrawerOpen(true)}>
              <Icon name="menu" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm text-navy/50">
              <Icon name="location_on" size={18} className="text-primary" />
              Noida, Uttar Pradesh
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full hover:bg-black/5 relative">
              <Icon name="notifications" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary" />
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-black/10">
              <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="hidden sm:block leading-tight">
                <p className="text-sm font-semibold">{user?.name}</p>
                <p className="text-xs text-navy/40">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  )
}
