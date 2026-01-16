import { useContext } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

export default function PrivateRoute({ children, allowedRoles, requireStaff = false }) {
  const { user, loading } = useContext(AuthContext)
  const location = useLocation()
  const token = localStorage.getItem('token')

  const getHomePath = (roleRaw) => {
    const role = String(roleRaw || '').toUpperCase()
    if (role === 'ADMIN') return '/admin'
    if (role === 'OWNER') return '/owner'
    if (role === 'USER') return '/user-map'
    return '/user-map'
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
  if (!token || !user) {
    const from = `${location.pathname}${location.search}${location.hash}`
    return <Navigate to="/login" replace state={{ from }} />
  }

  // Cek apakah user punya akses
  const hasRoleAccess = !allowedRoles || allowedRoles.includes(user?.role)
  const hasStaffAccess = !requireStaff || user?.is_staff || user?.is_superuser
  
  if (!hasRoleAccess && !hasStaffAccess) {
    return <Navigate to={getHomePath(user?.role)} replace />
  }

  return children
}