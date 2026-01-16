import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin logout?')) {
      const backendLoginUrl = 'http://127.0.0.1:8000/admin/login/'
      logout()
      if (user?.role === 'ADMIN') {
        window.location.replace(backendLoginUrl)
      } else {
        navigate('/login')
      }
    }
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
    </div>
  )
}
