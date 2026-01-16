import { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { User, Store, Mail, Lock, Eye, EyeOff } from 'lucide-react'

export default function Register() {
  const { register } = useContext(AuthContext)
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
  const navigate = useNavigate()

  const onChange = (e) => {
    const { name, value } = e.target
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
      await register(form)
      setSuccess(true)
    } catch (err) {
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
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 20,
        padding: '48px 40px',
        width: '100%',
        maxWidth: 480,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Logo */}
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
            Buat Akun Baru
          </h1>
          <p style={{ 
            fontSize: 14, 
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
              padding: '12px 16px',
              borderRadius: 10,
              fontSize: 14,
              marginBottom: 20
            }}>
              {error}
            </div>
          )}

          {/* Role Selection */}
          <div style={{ marginBottom: 24 }}>
            <label style={{
              display: 'block',
              fontSize: 14,
              fontWeight: 600,
              color: '#1e293b',
              marginBottom: 12
            }}>
              Pilih Peran Anda
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {/* User Card */}
              <div
                onClick={() => setForm(prev => ({ ...prev, role: 'USER' }))}
                style={{
                  border: form.role === 'USER' ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: form.role === 'USER' ? '#f0f9ff' : '#fff',
                  textAlign: 'center'
                }}
              >
                <div style={{
                  width: 48,
                  height: 48,
                  background: form.role === 'USER' ? '#4f46e5' : '#e0e7ff',
                  color: form.role === 'USER' ? '#fff' : '#4f46e5',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px'
                }}>
                  <User size={24} />
                </div>
                <p style={{ 
                  margin: '0 0 4px', 
                  fontSize: 15, 
                  fontWeight: 700,
                  color: '#0f172a'
                }}>
                  User
                </p>
                <p style={{ 
                  margin: 0, 
                  fontSize: 12, 
                  color: '#64748b'
                }}>
                  Cari teknisi
                </p>
              </div>

              {/* Owner Card */}
              <div
                onClick={() => setForm(prev => ({ ...prev, role: 'OWNER' }))}
                style={{
                  border: form.role === 'OWNER' ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: form.role === 'OWNER' ? '#f0f9ff' : '#fff',
                  textAlign: 'center'
                }}
              >
                <div style={{
                  width: 48,
                  height: 48,
                  background: form.role === 'OWNER' ? '#4f46e5' : '#e0e7ff',
                  color: form.role === 'OWNER' ? '#fff' : '#4f46e5',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px'
                }}>
                  <Store size={24} />
                </div>
                <p style={{ 
                  margin: '0 0 4px', 
                  fontSize: 15, 
                  fontWeight: 700,
                  color: '#0f172a'
                }}>
                  Owner
                </p>
                <p style={{ 
                  margin: 0, 
                  fontSize: 12, 
                  color: '#64748b'
                }}>
                  Buka jasa servik
                </p>
              </div>
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'block',
              fontSize: 14,
              fontWeight: 600,
              color: '#1e293b',
              marginBottom: 8
            }}>
              Email
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
                name="email"
                value={form.email}
                onChange={onChange}
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
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#4f46e5'
                  e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>
          </div>

          {/* Username */}
          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'block',
              fontSize: 14,
              fontWeight: 600,
              color: '#1e293b',
              marginBottom: 8
            }}>
              Username
            </label>
            <div style={{ position: 'relative' }}>
              <User 
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
                name="username"
                value={form.username}
                onChange={onChange}
                type="text"
                required
                placeholder="Pilih username unik"
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 44px',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  fontSize: 15,
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#4f46e5'
                  e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>
          </div>

          {/* Password & Confirm Password - Side by Side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            {/* Password */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 600,
                color: '#1e293b',
                marginBottom: 8
              }}>
                Password
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
                  name="password"
                  value={form.password}
                  onChange={onChange}
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="********"
                  style={{
                    width: '100%',
                    padding: '12px 44px 12px 44px',
                    border: '1px solid #e2e8f0',
                    borderRadius: 10,
                    fontSize: 15,
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4f46e5'
                    e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.1)'
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

            {/* Confirm Password */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 600,
                color: '#1e293b',
                marginBottom: 8
              }}>
                Konfirmasi Password
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
                  name="password_confirm"
                  value={form.password_confirm}
                  onChange={onChange}
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="********"
                  style={{
                    width: '100%',
                    padding: '12px 44px 12px 44px',
                    border: '1px solid #e2e8f0',
                    borderRadius: 10,
                    fontSize: 15,
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4f46e5'
                    e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.1)'
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
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {/* Terms Checkbox */}
          <div style={{ marginBottom: 24 }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
              fontSize: 14,
              color: '#475569'
            }}>
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                style={{
                  width: 18,
                  height: 18,
                  cursor: 'pointer',
                  accentColor: '#4f46e5'
                }}
              />
              <span>
                Saya setuju dengan{' '}
                <Link to="/terms" style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>
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
              padding: '14px',
              background: loading ? '#a5b4fc' : '#4f46e5',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              fontSize: 16,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              marginBottom: 20
            }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#4338ca')}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.background = '#4f46e5')}
          >
            {loading ? 'Memproses...' : 'Daftar Sekarang'}
          </button>

          {/* Login Link */}
          <p style={{
            textAlign: 'center',
            margin: 0,
            fontSize: 14,
            color: '#64748b'
          }}>
            Sudah punya akun?{' '}
            <Link
              to="/login"
              style={{
                color: '#4f46e5',
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
              padding: '32px',
              borderRadius: 16,
              minWidth: '320px',
              maxWidth: '420px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              textAlign: 'center'
            }}
          >
            <div style={{
              width: 64,
              height: 64,
              background: '#10b981',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              color: '#fff',
              fontSize: 32
            }}>
              ✓
            </div>
            <h3 style={{ margin: '0 0 12px', fontSize: 24, fontWeight: 700, color: '#0f172a' }}>
              Registrasi Berhasil!
            </h3>
            <p style={{ margin: '0 0 24px', color: '#64748b', lineHeight: 1.6 }}>
              Akun kamu sudah dibuat. Lanjut ke dashboard untuk mulai menggunakan aplikasi.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => {
                  const role = form.role.toUpperCase()
                  const destination = role === 'OWNER' ? '/owner' : '/user-map'
                  navigate(destination)
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#4f46e5',
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
