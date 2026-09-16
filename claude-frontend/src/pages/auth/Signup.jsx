import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Icon from '../../components/common/Icon'
import Button from '../../components/common/Button'
import { useAuth } from '../../context/AuthContext'

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'DRIVER' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Name is required.'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email.'
    if (!/^[\d+\s-]{7,15}$/.test(form.phone)) e.phone = 'Enter a valid phone number.'
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters.'
    return e
  }

  const submit = (ev) => {
    ev.preventDefault()
    const e = validate()
    setErrors(e)
    if (Object.keys(e).length) return
    setLoading(true)
    setTimeout(() => {
      const res = signup(form)
      setLoading(false)
      if (!res.ok) {
        setErrors({ form: res.error })
        return
      }
      navigate(form.role === 'DRIVER' ? '/driver' : '/owner')
    }, 400)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 font-extrabold text-xl mb-8">
          <span className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center">
            <Icon name="local_parking" size={20} />
          </span>
          ParkShare
        </Link>

        <div className="bg-white rounded-2xl shadow-card border border-black/5 p-7">
          <h1 className="text-2xl font-extrabold mb-1">Create your account</h1>
          <p className="text-sm text-navy/50 mb-6">Join as a driver or list your own parking slot.</p>

          {errors.form && (
            <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-2.5 mb-4 flex items-center gap-2">
              <Icon name="error" size={16} /> {errors.form}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setForm({ ...form, role: 'DRIVER' })}
                className={`rounded-xl border px-3 py-3 text-sm font-semibold flex flex-col items-center gap-1 ${form.role === 'DRIVER' ? 'border-primary bg-primary-50 text-primary' : 'border-black/10 text-navy/50'}`}>
                <Icon name="directions_car" /> Driver
              </button>
              <button type="button" onClick={() => setForm({ ...form, role: 'OWNER' })}
                className={`rounded-xl border px-3 py-3 text-sm font-semibold flex flex-col items-center gap-1 ${form.role === 'OWNER' ? 'border-primary bg-primary-50 text-primary' : 'border-black/10 text-navy/50'}`}>
                <Icon name="storefront" /> Owner
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-navy/50">Full Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full mt-1 rounded-xl border border-black/10 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Aditya Rao" />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold text-navy/50">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full mt-1 rounded-xl border border-black/10 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="you@example.com" />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold text-navy/50">Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full mt-1 rounded-xl border border-black/10 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="+91 98765 43210" />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold text-navy/50">Password</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full mt-1 rounded-xl border border-black/10 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="••••••••" />
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            <Button type="submit" full size="lg" disabled={loading}>
              {loading ? 'Creating account…' : 'Sign Up'}
            </Button>
          </form>

          <p className="text-sm text-center text-navy/50 mt-6">
            Already have an account? <Link to="/login" className="text-primary font-semibold">Log in</Link>
          </p>
        </div>
        <p className="text-xs text-center text-navy/30 mt-4">Demo signup only — no identity or Aadhaar verification is performed.</p>
      </div>
    </div>
  )
}
