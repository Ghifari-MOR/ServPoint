import { useContext, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { User, Store, Mail, Lock, Eye, EyeOff } from 'lucide-react'

export default function Register() {
  const { register, user, loading: authLoading } = useContext(AuthContext)
  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
    password_confirm: '',
    role: 'USER',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [registerRole, setRegisterRole] = useState(null)
  const navigate = useNavigate()
  
  // Auto-redirect setelah registrasi berhasil
  useEffect(() => {
    if (success && registerRole) {
      console.log('[Register] Success - registerRole:', registerRole)
      const role = String(registerRole).toUpperCase()
      const destination = role === 'OWNER' ? '/owner/register-umkm' : '/user-map'
      console.log('[Register] Redirecting to:', destination, '(role:', role, ')')
      navigate(destination, { replace: true })
    }
  }, [success, registerRole, navigate])
  
  // Responsive
  const isMobile = window.innerWidth <= 768
  const isSmallMobile = window.innerWidth <= 480

  const onChange = (e) => {
    const { name, value} = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    
    if (!agreedToTerms) {
      setError('Anda harus menyetujui Syarat & Ketentuan')
      return
    }
    
    if (form.password !== form.password_confirm) {
      setError('Password tidak sama')
      return
    }
    
    setLoading(true)
    try {
      const result = await register(form)
      console.log('[Register] Registration successful:', result)
      console.log('[Register] User after register:', user)
      console.log('[Register] Token in localStorage:', localStorage.getItem('token'))
      setRegisterRole(form.role)
      setSuccess(true)
    } catch (err) {
      console.error('[Register] Registration error:', err)
      const data = err.response?.data
      const firstError =
        typeof data === 'string'
          ? data
          : data?.detail || Object.values(data || {})?.[0]?.[0] || 'Registrasi gagal'
      setError(firstError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f3f4f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: isMobile ? '16px' : '24px'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: isMobile ? 16 : 20,
        padding: isSmallMobile ? '32px 20px' : isMobile ? '40px 28px' : '48px 40px',
        width: '100%',
        maxWidth: 480,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: isMobile ? 24 : 32 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: isMobile ? 16 : 20
          }}>
            <div style={{
              width: isSmallMobile ? 36 : 40,
              height: isSmallMobile ? 36 : 40,
              background: '#2563eb',
              borderRadius: 10,
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
              fontSize: isSmallMobile ? 20 : 22,
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
            Buat Akun Baru
          </h1>
          <p style={{ 
            fontSize: isSmallMobile ? 13 : 14, 
            color: '#64748b', 
            margin: 0,
            lineHeight: 1.5
          }}>
            Bergabunglah dengan ServPoint untuk menemukan atau menawarkan jasa perbaikan.
          </p>
        </div>

        <form onSubmit={onSubmit}>
          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: isMobile ? '10px 14px' : '12px 16px',
              borderRadius: 10,
              fontSize: isSmallMobile ? 13 : 14,
              marginBottom: isMobile ? 16 : 20,
              lineHeight: 1.5
            }}>
              {error}
            </div>
          )}

          {/* Role Selection */}
          <div style={{ marginBottom: isMobile ? 20 : 24 }}>
            <label style={{
              display: 'block',
              fontSize: isSmallMobile ? 13 : 14,
              fontWeight: 600,
              color: '#1e293b',
              marginBottom: isMobile ? 10 : 12
            }}>
              Pilih Peran Anda
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: isMobile ? 10 : 12 }}>
              {/* User Card */}
              <div
                onClick={() => setForm(prev => ({ ...prev, role: 'USER' }))}
                style={{
                  border: form.role === 'USER' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  borderRadius: isMobile ? 10 : 12,
                  padding: isSmallMobile ? '12px' : '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: form.role === 'USER' ? '#dbeafe' : '#fff',
                  textAlign: 'center'
                }}
              >
                <div style={{
                  width: isSmallMobile ? 40 : 48,
                  height: isSmallMobile ? 40 : 48,
                  background: form.role === 'USER' ? '#2563eb' : '#dbeafe',
                  color: form.role === 'USER' ? '#fff' : '#2563eb',
                  borderRadius: isMobile ? 10 : 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: isSmallMobile ? '0 auto 8px' : '0 auto 12px'
                }}>
                  <User size={isSmallMobile ? 20 : 24} />
                </div>
                <p style={{ 
                  margin: '0 0 4px', 
                  fontSize: isSmallMobile ? 14 : 15, 
                  fontWeight: 700,
                  color: '#0f172a'
                }}>
                  User
                </p>
                <p style={{ 
                  margin: 0, 
                  fontSize: isSmallMobile ? 11 : 12, 
                  color: '#64748b'
                }}>
                  Cari teknisi
                </p>
              </div>

              {/* Owner Card */}
              <div
                onClick={() => setForm(prev => ({ ...prev, role: 'OWNER' }))}
                style={{
                  border: form.role === 'OWNER' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  borderRadius: isMobile ? 10 : 12,
                  padding: isSmallMobile ? '12px' : '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: form.role === 'OWNER' ? '#dbeafe' : '#fff',
                  textAlign: 'center'
                }}
              >
                <div style={{
                  width: isSmallMobile ? 40 : 48,
                  height: isSmallMobile ? 40 : 48,
                  background: form.role === 'OWNER' ? '#2563eb' : '#dbeafe',
                  color: form.role === 'OWNER' ? '#fff' : '#2563eb',
                  borderRadius: isMobile ? 10 : 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: isSmallMobile ? '0 auto 8px' : '0 auto 12px'
                }}>
                  <Store size={isSmallMobile ? 20 : 24} />
                </div>
                <p style={{ 
                  margin: '0 0 4px', 
                  fontSize: isSmallMobile ? 14 : 15, 
                  fontWeight: 700,
                  color: '#0f172a'
                }}>
                  Owner
                </p>
                <p style={{ 
                  margin: 0, 
                  fontSize: isSmallMobile ? 11 : 12, 
                  color: '#64748b'
                }}>
                  Buka jasa servis
                </p>
              </div>
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: isMobile ? 16 : 20 }}>
            <label style={{
              display: 'block',
              fontSize: isSmallMobile ? 13 : 14,
              fontWeight: 600,
              color: '#1e293b',
              marginBottom: 8
            }}>
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail 
                size={isMobile ? 16 : 18} 
                style={{ 
                  position: 'absolute', 
                  left: isMobile ? 12 : 14, 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: '#94a3b8'
                }} 
              />
              <input
                name="email"
                value={form.email}
                onChange={onChange}
                type="email"
                required
                placeholder="nama@email.com"
                style={{
                  width: '100%',
                  padding: isMobile ? '11px 14px 11px 40px' : '12px 16px 12px 44px',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  fontSize: isSmallMobile ? 14 : 15,
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563eb'
                  e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>
          </div>

          {/* Username */}
          <div style={{ marginBottom: isMobile ? 16 : 20 }}>
            <label style={{
              display: 'block',
              fontSize: isSmallMobile ? 13 : 14,
              fontWeight: 600,
              color: '#1e293b',
              marginBottom: 8
            }}>
              Username
            </label>
            <div style={{ position: 'relative' }}>
              <User 
                size={isMobile ? 16 : 18} 
                style={{ 
                  position: 'absolute', 
                  left: isMobile ? 12 : 14, 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: '#94a3b8'
                }} 
              />
              <input
                name="username"
                value={form.username}
                onChange={onChange}
                type="text"
                required
                placeholder="Pilih username unik"
                style={{
                  width: '100%',
                  padding: isMobile ? '11px 14px 11px 40px' : '12px 16px 12px 44px',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  fontSize: isSmallMobile ? 14 : 15,
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563eb'
                  e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>
          </div>

          {/* Password & Confirm Password - Side by Side */}
          <div style={{ display: 'grid', gridTemplateColumns: isSmallMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 10 : 12, marginBottom: isMobile ? 16 : 20 }}>
            {/* Password */}
            <div>
              <label style={{
                display: 'block',
                fontSize: isSmallMobile ? 13 : 14,
                fontWeight: 600,
                color: '#1e293b',
                marginBottom: 8
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock 
                  size={isMobile ? 16 : 18} 
                  style={{ 
                    position: 'absolute', 
                    left: isMobile ? 12 : 14, 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                    zIndex: 1
                  }} 
                />
                <input
                  name="password"
                  value={form.password}
                  onChange={onChange}
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="********"
                  style={{
                    width: '100%',
                    padding: isMobile ? '11px 40px 11px 40px' : '12px 44px 12px 44px',
                    border: '1px solid #e2e8f0',
                    borderRadius: 10,
                    fontSize: isSmallMobile ? 14 : 15,
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2563eb'
                    e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0'
                    e.target.style.boxShadow = 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: isMobile ? 10 : 12,
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
                  {showPassword ? <EyeOff size={isMobile ? 16 : 18} /> : <Eye size={isMobile ? 16 : 18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label style={{
                display: 'block',
                fontSize: isSmallMobile ? 13 : 14,
                fontWeight: 600,
                color: '#1e293b',
                marginBottom: 8
              }}>
                Konfirmasi Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock 
                  size={isMobile ? 16 : 18} 
                  style={{ 
                    position: 'absolute', 
                    left: isMobile ? 12 : 14, 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                    zIndex: 1
                  }} 
                />
                <input
                  name="password_confirm"
                  value={form.password_confirm}
                  onChange={onChange}
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="********"
                  style={{
                    width: '100%',
                    padding: isMobile ? '11px 40px 11px 40px' : '12px 44px 12px 44px',
                    border: '1px solid #e2e8f0',
                    borderRadius: 10,
                    fontSize: isSmallMobile ? 14 : 15,
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2563eb'
                    e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e2e8f0'
                    e.target.style.boxShadow = 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: isMobile ? 10 : 12,
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
                  {showConfirmPassword ? <EyeOff size={isMobile ? 16 : 18} /> : <Eye size={isMobile ? 16 : 18} />}
                </button>
              </div>
            </div>
          </div>

          {/* Terms Checkbox */}
          <div style={{ marginBottom: isMobile ? 20 : 24 }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
              fontSize: isSmallMobile ? 13 : 14,
              color: '#475569',
              lineHeight: 1.5
            }}>
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                style={{
                  width: 18,
                  height: 18,
                  cursor: 'pointer',
                  accentColor: '#2563eb',
                  flexShrink: 0
                }}
              />
              <span>
                Saya setuju dengan{' '}
                <Link to="/terms" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>
                  Syarat & Ketentuan
                </Link>
                {' '}ServPoint.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: isMobile ? '12px' : '14px',
              background: loading ? '#93c5fd' : '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              fontSize: isSmallMobile ? 15 : 16,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              marginBottom: isMobile ? 16 : 20
            }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#1e40af')}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.background = '#2563eb')}
          >
            {loading ? 'Memproses...' : 'Daftar Sekarang'}
          </button>

          {/* Login Link */}
          <p style={{
            textAlign: 'center',
            margin: 0,
            fontSize: isSmallMobile ? 13 : 14,
            color: '#64748b',
            lineHeight: 1.5
          }}>
            Sudah punya akun?{' '}
            <Link
              to="/login"
              style={{
                color: '#2563eb',
                textDecoration: 'none',
                fontWeight: 600
              }}
            >
              Login di sini
            </Link>
          </p>
        </form>
      </div>

      {/* Success Modal */}
      {success && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
          }}
          onClick={() => setSuccess(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              padding: isMobile ? '24px 20px' : '32px',
              borderRadius: isMobile ? 12 : 16,
              minWidth: isMobile ? '280px' : '320px',
              maxWidth: isMobile ? '90%' : '420px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              textAlign: 'center'
            }}
          >
            <div style={{
              width: isSmallMobile ? 56 : 64,
              height: isSmallMobile ? 56 : 64,
              background: '#10b981',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: isMobile ? '0 auto 16px' : '0 auto 20px',
              color: '#fff',
              fontSize: isSmallMobile ? 28 : 32
            }}>
              ✓
            </div>
            <h3 style={{ margin: '0 0 12px', fontSize: isSmallMobile ? 20 : 24, fontWeight: 700, color: '#0f172a' }}>
              Registrasi Berhasil!
            </h3>
            <p style={{ margin: '0 0 24px', color: '#64748b', lineHeight: 1.6 }}>
              Akun kamu sudah dibuat. Lanjut ke dashboard untuk mulai menggunakan aplikasi.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => {
                  const role = user?.role ? String(user.role).toUpperCase() : form.role.toUpperCase()
                  const destination = role === 'OWNER' ? '/owner/register-umkm' : '/user-map'
                  console.log('[Register] Navigating to:', destination, 'Role:', role, 'User:', user)
                  navigate(destination)
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Masuk Dashboard
              </button>
              <button
                onClick={() => setSuccess(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'transparent',
                  color: '#475569',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
