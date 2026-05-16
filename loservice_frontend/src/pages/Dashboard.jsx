import { useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import LogoutConfirmModal from '../components/LogoutConfirmModal'

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  // Auto-redirect based on role
  useEffect(() => {
    if (user) {
      const role = user.role?.toUpperCase()
      console.log('[Dashboard] User role:', user.role, 'Uppercase:', role, 'Full user:', user)
      if (role === 'USER') {
        console.log('[Dashboard] Redirecting to /user-map')
        navigate('/user-map', { replace: true })
      } else if (role === 'OWNER') {
        console.log('[Dashboard] Redirecting to /owner')
        navigate('/owner', { replace: true })
      } else if (role === 'ADMIN') {
        console.log('[Dashboard] Redirecting to /admin')
        navigate('/admin', { replace: true })
      } else {
        console.log('[Dashboard] Unknown role, defaulting to /user-map')
        navigate('/user-map', { replace: true })
      }
    }
  }, [user, navigate])

  const handleLogout = () => {
    setShowLogoutModal(true)
  }

  const handleLogoutConfirm = () => {
    const backendLoginUrl = 'http://127.0.0.1:8000/admin/login/'
    logout()
    if (user?.role === 'ADMIN') {
      window.location.replace(backendLoginUrl)
    } else {
      navigate('/login')
    }
  }

  const handleLogoutCancel = () => {
    setShowLogoutModal(false)
  }

  return (
    <div className="dashboard">
      <header>
        <h1>Dashboard</h1>
        <button className="btn" onClick={handleLogout}>
          Logout
        </button>
      </header>
      <section className="card">
        <h2>Profile</h2>
        <p><strong>Email:</strong> {user?.email || '-'}</p>
        <p><strong>Username:</strong> {user?.username || '-'}</p>
        <p><strong>Role:</strong> {user?.role || '-'}</p>
        {(user?.role === 'OWNER' || user?.role === 'ADMIN') && (
          <button
            className="btn"
            style={{ marginTop: '12px' }}
            onClick={() => navigate('/owner')}
          >
            Buka Halaman Owner
          </button>
        )}

        {(user?.role === 'USER' || user?.role === 'ADMIN') && (
          <button
            className="btn"
            style={{ marginTop: '12px' }}
            onClick={() => navigate('/user/map')}
          >
            Buka Halaman User
          </button>
        )}
      </section>
      <LogoutConfirmModal 
        isOpen={showLogoutModal}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />
    </div>
  )
}
