import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Icon from './Icon'
import Button from './Button'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  const { user } = useAuth()
  const navigate = useNavigate()

  // Load saved theme when Navbar loads
  useEffect(() => {
    const savedTheme = localStorage.getItem('ps_theme')

    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark')
      setDarkMode(true)
    } else {
      document.documentElement.classList.remove('dark')
      setDarkMode(false)
    }
  }, [])

  // Toggle Light / Dark mode
  const toggleTheme = () => {
    const nextDarkMode = !darkMode

    setDarkMode(nextDarkMode)

    if (nextDarkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('ps_theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('ps_theme', 'light')
    }
  }

  const homeForUser = () => {
    if (!user) return '/'

    if (user.role === 'DRIVER') {
      return '/driver'
    }

    if (user.role === 'OWNER') {
      return '/owner'
    }

    return '/admin'
  }

  return (
    <header
      className="
        sticky top-0 z-40
        bg-white/95 dark:bg-[#0f2027]/95
        backdrop-blur
        border-b border-black/5 dark:border-white/10
        transition-colors duration-300
      "
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* ================= LOGO ================= */}
        <Link
          to="/"
          className="
            flex items-center gap-2
            font-extrabold text-xl
            text-navy dark:text-white
            transition-colors duration-300
          "
        >
          <span
            className="
              w-8 h-8 rounded-lg
              bg-primary
              text-white
              flex items-center justify-center
            "
          >
            <Icon name="local_parking" size={20} />
          </span>

          ParkShare
        </Link>


        {/* ================= DESKTOP NAVIGATION ================= */}
        <nav
          className="
            hidden md:flex
            items-center gap-8
            text-sm font-medium
            text-navy/80 dark:text-white/80
          "
        >
          <Link
            to="/driver/find-parking"
            className="
              hover:text-primary
              transition-colors duration-200
            "
          >
            Find Parking
          </Link>

          <Link
            to="/owner/list-slot"
            className="
              hover:text-primary
              transition-colors duration-200
            "
          >
            List Your Slot
          </Link>
        </nav>


        {/* ================= DESKTOP RIGHT SIDE ================= */}
        <div className="hidden md:flex items-center gap-3">

          {/* ===== THEME TOGGLE ===== */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="
              flex items-center gap-1
              p-1
              rounded-full
              border border-black/10 dark:border-white/10
              bg-gray-100 dark:bg-white/10
              shadow-sm
              transition-all duration-300
              hover:shadow-md
            "
          >
            {/* Light */}
            <span
              className={`
                flex items-center gap-1
                px-2.5 py-1.5
                rounded-full
                text-xs font-semibold
                transition-all duration-300
                ${
                  !darkMode
                    ? 'bg-white text-navy shadow-sm'
                    : 'text-white/60'
                }
              `}
            >
              <Icon name="light_mode" size={16} />
              Light
            </span>

            {/* Dark */}
            <span
              className={`
                flex items-center gap-1
                px-2.5 py-1.5
                rounded-full
                text-xs font-semibold
                transition-all duration-300
                ${
                  darkMode
                    ? 'bg-[#263f48] text-white shadow-sm'
                    : 'text-navy/50'
                }
              `}
            >
              <Icon name="dark_mode" size={16} />
              Dark
            </span>
          </button>


          {/* ===== USER ACTIONS ===== */}
          {user ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(homeForUser())}
            >
              Go to Dashboard
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/login')}
              >
                Login
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/signup')}
              >
                Sign Up
              </Button>
            </>
          )}
        </div>


        {/* ================= MOBILE RIGHT SIDE ================= */}
        <div className="md:hidden flex items-center gap-2">

          {/* Mobile Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="
              flex items-center justify-center
              w-10 h-10
              rounded-full
              border border-black/10 dark:border-white/10
              bg-gray-100 dark:bg-white/10
              text-navy dark:text-white
              transition-all duration-300
            "
          >
            <Icon
              name={darkMode ? 'light_mode' : 'dark_mode'}
              size={20}
            />
          </button>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="
              p-2
              text-navy dark:text-white
              transition-colors
            "
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <Icon name={open ? 'close' : 'menu'} />
          </button>
        </div>
      </div>


      {/* ================= MOBILE MENU ================= */}
      {open && (
        <div
          className="
            md:hidden
            border-t border-black/5 dark:border-white/10
            px-4 py-4
            space-y-3
            bg-white dark:bg-[#0f2027]
            text-navy dark:text-white
            transition-colors duration-300
          "
        >

          <Link
            to="/driver/find-parking"
            onClick={() => setOpen(false)}
            className="
              block
              font-medium
              hover:text-primary
              transition-colors
            "
          >
            Find Parking
          </Link>

          <Link
            to="/owner/list-slot"
            onClick={() => setOpen(false)}
            className="
              block
              font-medium
              hover:text-primary
              transition-colors
            "
          >
            List Your Slot
          </Link>


          {/* Mobile Login / Dashboard */}
          <div className="flex gap-3 pt-2">

            {user ? (
              <Button
                full
                variant="primary"
                onClick={() => {
                  setOpen(false)
                  navigate(homeForUser())
                }}
              >
                Dashboard
              </Button>
            ) : (
              <>
                <Button
                  full
                  variant="outline"
                  onClick={() => {
                    setOpen(false)
                    navigate('/login')
                  }}
                >
                  Login
                </Button>

                <Button
                  full
                  variant="primary"
                  onClick={() => {
                    setOpen(false)
                    navigate('/signup')
                  }}
                >
                  Sign Up
                </Button>
              </>
            )}

          </div>
        </div>
      )}
    </header>
  )
}