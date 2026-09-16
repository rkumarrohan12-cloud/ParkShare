import { useState } from 'react'
import DashboardShell from '../../components/common/DashboardShell'
import Icon from '../../components/common/Icon'
import Button from '../../components/common/Button'
import { driverNavItems } from '../../components/driver/driverNav'
import { useAuth } from '../../context/AuthContext'

export default function Profile() {
  const { user, updateProfile } = useAuth()
  const [form, setForm] = useState({
    name: user.name || '', email: user.email || '', phone: user.phone || '',
    vehicle: user.vehicle || '', vehicleNumber: user.vehicleNumber || '',
  })
  const [saved, setSaved] = useState(false)

  const save = (e) => {
    e.preventDefault()
    updateProfile(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <DashboardShell portalLabel="Driver Portal" navItems={driverNavItems}>
      <h1 className="text-2xl font-extrabold mb-6">Driver Profile</h1>

      <div className="bg-white rounded-2xl shadow-card border border-black/5 p-6 max-w-xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-extrabold text-2xl">
            {user.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-lg">{user.name}</p>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-full mt-1">
              <Icon name="verified" size={14} /> {user.status || 'Verified'}
            </span>
          </div>
        </div>

        {saved && (
          <div className="bg-primary-50 text-primary-700 text-sm rounded-xl px-4 py-2.5 mb-4 flex items-center gap-2">
            <Icon name="check_circle" size={16} /> Profile updated.
          </div>
        )}

        <form onSubmit={save} className="space-y-4">
          <FormField label="Full Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <FormField label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} type="email" />
          <FormField label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          <FormField label="Vehicle" value={form.vehicle} onChange={(v) => setForm({ ...form, vehicle: v })} placeholder="e.g. Hyundai i20" />
          <FormField label="Vehicle Number" value={form.vehicleNumber} onChange={(v) => setForm({ ...form, vehicleNumber: v })} placeholder="e.g. DL 4C AB 1234" />
          <Button type="submit" size="lg">Save Changes</Button>
        </form>
      </div>
    </DashboardShell>
  )
}

function FormField({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div>
      <label className="text-xs font-semibold text-navy/50">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 rounded-xl border border-black/10 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>
  )
}
