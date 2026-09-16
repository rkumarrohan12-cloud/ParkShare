import { useEffect, useState } from 'react'
import DashboardShell from '../../components/common/DashboardShell'
import Button from '../../components/common/Button'
import { adminNavItems } from '../../components/admin/adminNav'
import { adminAPI } from '../../services/api'

const ROLE_STYLES = {
  DRIVER: 'bg-blue-50 text-blue-600',
  OWNER: 'bg-amber-50 text-amber-600',
  ADMIN: 'bg-primary-50 text-primary-700',
}

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminAPI.getUsers()
      .then((response) => {
        setUsers(response.data || [])
      })
      .catch((error) => {
        console.error('Failed to load users:', error)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const filtered = users.filter((u) => {
    if (roleFilter && u.role !== roleFilter) return false

    if (
      query &&
      !`${u.name} ${u.email}`
        .toLowerCase()
        .includes(query.toLowerCase())
    ) {
      return false
    }

    return true
  })

  const toggleSuspend = async (user) => {
  const newStatus =
    user.status === 'SUSPENDED'
      ? 'ACTIVE'
      : 'SUSPENDED'

  try {
    await adminAPI.updateUserStatus(user.id, newStatus)

    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id
          ? { ...u, status: newStatus }
          : u
      )
    )
  } catch (error) {
    console.error('Failed to update user status:', error)
    alert(error.message || 'Failed to update user status')
  }
}

  return (
    <DashboardShell
      portalLabel="Admin Portal"
      navItems={adminNavItems}
    >
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className="text-2xl font-extrabold">
          User Management
        </h1>

        <div className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or email"
            className="text-sm rounded-full border border-black/10 px-4 py-2 bg-white w-56"
          />

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-sm rounded-full border border-black/10 px-3.5 py-2 bg-white"
          >
            <option value="">All roles</option>
            <option value="DRIVER">Driver</option>
            <option value="OWNER">Owner</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-navy/50">
          Loading users...
        </p>
      ) : (
        <div className="bg-white rounded-2xl shadow-card border border-black/5 overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-lavender text-navy/50 text-xs uppercase">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">
                  Name
                </th>
                <th className="text-left px-5 py-3 font-semibold">
                  Email
                </th>
                <th className="text-left px-5 py-3 font-semibold">
                  Role
                </th>
                <th className="text-left px-5 py-3 font-semibold">
                  Status
                </th>
                <th className="text-left px-5 py-3 font-semibold">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((u) => (
                <tr
                  key={u.id}
                  className="border-t border-black/5"
                >
                  <td className="px-5 py-3.5 font-medium">
                    {u.name}
                  </td>

                  <td className="px-5 py-3.5 text-navy/50">
                    {u.email}
                  </td>

                  <td className="px-5 py-3.5">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        ROLE_STYLES[u.role]
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>

                  <td className="px-5 py-3.5 text-navy/60">
                    {u.status || 'ACTIVE'}
                  </td>

                  <td className="px-5 py-3.5">
                    <Button
                      size="sm"
                      variant={
                        u.status === 'SUSPENDED'
                          ? 'primary'
                          : 'danger'
                      }
                      onClick={() => toggleSuspend(u)}
                    >
                      {u.status === 'SUSPENDED'
                        ? 'Reinstate'
                        : 'Suspend'}
                    </Button>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center text-navy/40 py-8"
                  >
                    No users match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </DashboardShell>
  )
}