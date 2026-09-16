import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Icon from '../../components/common/Icon'
import Button from '../../components/common/Button'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.email || !form.password) {
      setError('Please enter both email and password.')
      return
    }

    setLoading(true)

    try {
      const res = await login(form)

      if (!res.ok) {
        setError(res.error)
        return
      }

      const dest =
        res.user.role === 'DRIVER'
          ? '/driver'
          : res.user.role === 'OWNER'
            ? '/owner'
            : '/admin'

      navigate(dest)
    } catch (error) {
      setError('Unable to login. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (role) => {
    if (role === 'DRIVER') {
      setForm({
        email: 'driver1@parkshare.demo',
        password: 'demo1234',
      })
    }

    if (role === 'OWNER') {
      setForm({
        email: 'owner1@parkshare.demo',
        password: 'demo1234',
      })
    }

    if (role === 'ADMIN') {
      setForm({
        email: 'admin@parkshare.demo',
        password: 'demo1234',
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4 py-10">
      <div className="w-full max-w-md">

        <Link
          to="/"
          className="flex items-center justify-center gap-2 font-extrabold text-xl mb-8"
        >
          <span className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center">
            <Icon name="local_parking" size={20} />
          </span>

          ParkShare
        </Link>

        <div className="bg-white rounded-2xl shadow-card border border-black/5 p-7">

          <h1 className="text-2xl font-extrabold mb-1">
            Welcome back
          </h1>

          <p className="text-sm text-navy/50 mb-6">
            Log in to manage your bookings or listings.
          </p>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-2.5 mb-4 flex items-center gap-2">
              <Icon name="error" size={16} />
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">

            <div>
              <label className="text-xs font-semibold text-navy/50">
                Email
              </label>

              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value,
                  })
                }
                className="w-full mt-1 rounded-xl border border-black/10 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-navy/50">
                Password
              </label>

              <input
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm({
                    ...form,
                    password: e.target.value,
                  })
                }
                className="w-full mt-1 rounded-xl border border-black/10 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              full
              size="lg"
              disabled={loading}
            >
              {loading ? 'Logging in…' : 'Log In'}
            </Button>

          </form>

          <div className="mt-5 pt-5 border-t border-black/5">

            <p className="text-xs text-navy/40 mb-2">
              Try a demo account:
            </p>

            <div className="flex gap-2 flex-wrap">

              <button
                onClick={() => fillDemo('DRIVER')}
                className="text-xs px-3 py-1.5 rounded-full bg-lavender hover:bg-black/5"
              >
                Driver demo
              </button>

              <button
                onClick={() => fillDemo('OWNER')}
                className="text-xs px-3 py-1.5 rounded-full bg-lavender hover:bg-black/5"
              >
                Owner demo
              </button>

              <button
                onClick={() => fillDemo('ADMIN')}
                className="text-xs px-3 py-1.5 rounded-full bg-lavender hover:bg-black/5"
              >
                Admin demo
              </button>

            </div>
          </div>

          <p className="text-sm text-center text-navy/50 mt-6">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-primary font-semibold"
            >
              Sign up
            </Link>
          </p>

        </div>

        <p className="text-xs text-center text-navy/30 mt-4">
          Demo authentication only — not a real secure login system.
        </p>

      </div>
    </div>
  )
}