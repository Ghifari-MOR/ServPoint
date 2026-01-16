import { useContext, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'

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

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative'
    }}>
      {/* Login Card */}
      <div style={{
        background: '#fff',
        borderRadius: 20,
        padding: '48px 40px',
        width: '100%',
        maxWidth: 440,
        boxShadow: '0 10px 40px rgba(0,0,0,0.08)'
      }}>
        {/* Logo & Title */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 20
          }}>
            <div style={{
              width: 40,
              height: 40,
              background: '#4f46e5',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: 20,
              fontWeight: 700
            }}>
              SP
            </div>
            <span style={{
              fontSize: 22,
              fontWeight: 700,
              color: '#0f172a'
            }}>
              ServPoint
            </span>
          </div>
          <h1 style={{
            fontSize: 28,
            fontWeight: 700,
            margin: '0 0 8px',
            color: '#0f172a'
          }}>
            Selamat Datang Kembali
          </h1>
          <p style={{
            fontSize: 14,
            color: '#64748b',
            margin: 0
          }}>
            Masuk untuk menemukan layanan servis terpercaya di sekitar kampus.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit}>
          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '12px 16px',
              borderRadius: 10,
              fontSize: 14,
              marginBottom: 20
            }}>
              {error}
            </div>
          )}

          {/* Email/Username */}
          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'block',
              fontSize: 14,
              fontWeight: 600,
              color: '#1e293b',
              marginBottom: 8
            }}>
              Email atau Username
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={18}
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8'
                }}
              />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
                placeholder="nama@email.com"
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 44px',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  fontSize: 15,
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box',
                  background: '#f8fafc'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#14b8a6'
                  e.target.style.boxShadow = '0 0 0 3px rgba(20, 184, 166, 0.1)'
                  e.target.style.background = '#fff'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0'
                  e.target.style.boxShadow = 'none'
                  e.target.style.background = '#f8fafc'
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: 'block',
              fontSize: 14,
              fontWeight: 600,
              color: '#1e293b',
              marginBottom: 8
            }}>
              Kata Sandi
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                  zIndex: 1
                }}
              />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '12px 44px 12px 44px',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  fontSize: 15,
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box',
                  background: '#f8fafc'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#4f46e5'
                  e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.1)'
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
                  color: '#64748b'
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
            marginBottom: 24
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              fontSize: 14,
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
                  accentColor: '#4f46e5'
                }}
              />
              Ingat saya
            </label>
            <Link
              to="/forgot-password"
              style={{
                fontSize: 14,
                color: '#4f46e5',
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
              padding: '14px',
              background: loading ? '#a5b4fc' : '#4f46e5',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              fontSize: 16,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
            }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#4338ca')}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.background = '#4f46e5')}
          >
            {loading ? 'Memproses...' : (
              <>
                Masuk
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Register Link */}
        <p style={{
          textAlign: 'center',
          marginTop: 24,
          fontSize: 14,
          color: '#64748b'
        }}>
          Belum punya akun?{' '}
          <Link
            to="/register"
            style={{
              color: '#4f46e5',
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
        bottom: 24,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 12,
        color: '#94a3b8'
      }}>
        © 2024 ServPoint. All rights reserved.
      </div>
    </div>
  )
}
