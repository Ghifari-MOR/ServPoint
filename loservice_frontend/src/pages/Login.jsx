import { useContext, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const { login } = useContext(AuthContext)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const data = await login(email, password)
      const role = (data?.user?.role || '').toUpperCase()
      const roleDestination = role === 'ADMIN' ? '/admin' : role === 'OWNER' ? '/owner' : '/user-map'
      const from = location.state?.from
      const destination = (typeof from === 'string' && from.startsWith('/') && from !== '/login') ? from : roleDestination
      navigate(destination, { replace: true })
    } catch (err) {
      setError(err.response?.data?.detail || 'Login gagal')
    } finally {
      setLoading(false)
    }
  }

  // Responsive styling
  const isMobile = window.innerWidth <= 768
  const isSmallMobile = window.innerWidth <= 480

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f3f4f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isMobile ? '16px' : '24px',
      position: 'relative'
    }}>
      {/* Login Card */}
      <div style={{
        background: '#fff',
        borderRadius: isMobile ? 12 : 16,
        padding: isSmallMobile ? '32px 20px' : isMobile ? '40px 28px' : '48px 40px',
        width: '100%',
        maxWidth: 450,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        {/* Logo & Title */}
        <div style={{ textAlign: 'center', marginBottom: isMobile ? 28 : 32 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: isMobile ? 16 : 20
          }}>
            <div style={{
              width: isSmallMobile ? 40 : 44,
              height: isSmallMobile ? 40 : 44,
              background: '#2563eb',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: isSmallMobile ? 18 : 20,
              fontWeight: 700
            }}>
              SP
            </div>
            <span style={{
              fontSize: isSmallMobile ? 18 : 20,
              fontWeight: 700,
              color: '#0f172a'
            }}>
              ServPoint
            </span>
          </div>
          <h1 style={{
            fontSize: isSmallMobile ? 22 : isMobile ? 24 : 28,
            fontWeight: 700,
            margin: '0 0 8px',
            color: '#0f172a',
            lineHeight: 1.3
          }}>
            Selamat Datang Kembali
          </h1>
          <p style={{
            fontSize: isSmallMobile ? 13 : 14,
            color: '#64748b',
            margin: 0,
            lineHeight: 1.5
          }}>
            Masuk untuk menemukan layanan terpercaya di sekitar Anda
          </p>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit}>
          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: isMobile ? '10px 14px' : '12px 16px',
              borderRadius: 6,
              fontSize: isSmallMobile ? 13 : 14,
              marginBottom: isMobile ? 16 : 20,
              lineHeight: 1.5
            }}>
              {error}
            </div>
          )}

          {/* Email/Username */}
          <div style={{ marginBottom: isMobile ? 15 : 20 }}>
            <label style={{
              display: 'block',
              fontSize: isSmallMobile ? 13 : 14,
              fontWeight: 600,
              color: '#1e293b',
              marginBottom: 8
            }}>
              Email atau Username
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              placeholder="nama@email.com"
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                fontSize: isSmallMobile ? 14 : 14,
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box',
                background: '#f8fafc'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#2563eb'
                e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)'
                e.target.style.background = '#fff'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e2e8f0'
                e.target.style.boxShadow = 'none'
                e.target.style.background = '#f8fafc'
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: isMobile ? 14 : 20 }}>
            <label style={{
              display: 'block',
              fontSize: isSmallMobile ? 13 : 14,
              fontWeight: 600,
              color: '#1e293b',
              marginBottom: 8
            }}>
              Kata Sandi
            </label>
            <div style={{ position: 'relative' }}>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '12px 44px 12px 14px',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  fontSize: isSmallMobile ? 14 : 14,
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box',
                  background: '#f8fafc'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563eb'
                  e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)'
                  e.target.style.background = '#fff'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0'
                  e.target.style.boxShadow = 'none'
                  e.target.style.background = '#f8fafc'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                  color: '#94a3b8'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: isMobile ? 20 : 24,
            flexWrap: isSmallMobile ? 'wrap' : 'nowrap',
            gap: isSmallMobile ? 12 : 0
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              fontSize: isSmallMobile ? 13 : 14,
              color: '#475569'
            }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  width: 16,
                  height: 16,
                  cursor: 'pointer',
                  accentColor: '#2563eb'
                }}
              />
              Ingat saya
            </label>
            <Link
              to="/forgot-password"
              style={{
                fontSize: isSmallMobile ? 13 : 14,
                color: '#2563eb',
                textDecoration: 'none',
                fontWeight: 600
              }}
            >
              Lupa kata sandi?
            </Link>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: isMobile ? '12px' : '14px',
              background: loading ? '#93c5fd' : '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: isSmallMobile ? 15 : 16,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              marginBottom: isMobile ? 16 : 20
            }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#1e40af')}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.background = '#2563eb')}
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        {/* Register Link */}
        <p style={{
          textAlign: 'center',
          marginTop: isMobile ? 20 : 24,
          fontSize: isSmallMobile ? 13 : 14,
          color: '#64748b',
          lineHeight: 1.5
        }}>
          Belum punya akun?{' '}
          <Link
            to="/register"
            style={{
              color: '#2563eb',
              textDecoration: 'none',
              fontWeight: 600
            }}
          >
            Daftar sekarang
          </Link>
        </p>
      </div>

      {/* Footer */}
      <div style={{
        position: 'absolute',
        bottom: isMobile ? 16 : 24,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: isSmallMobile ? 11 : 12,
        color: '#94a3b8',
        padding: '0 16px'
      }}>
        © 2024 ServPoint. All rights reserved.
      </div>
    </div>
  )
}
