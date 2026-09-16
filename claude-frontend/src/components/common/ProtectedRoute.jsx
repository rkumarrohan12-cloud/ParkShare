import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ProtectedRoute({ roles, children }) {
  const { user, loading } = useAuth()

  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) {
    const fallback = user.role === 'DRIVER' ? '/driver' : user.role === 'OWNER' ? '/owner' : '/admin'
    return <Navigate to={fallback} replace />
  }
  return children
}
