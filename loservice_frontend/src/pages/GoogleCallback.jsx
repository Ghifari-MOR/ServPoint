import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'

export default function GoogleCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [error, setError] = useState(null)

  useEffect(() => {
    const handleGoogleCallback = async () => {
      const code = searchParams.get('code')
      const errorParam = searchParams.get('error')

      if (errorParam) {
        setError('Login dengan Google dibatalkan')
        setTimeout(() => navigate('/login'), 2000)
        return
      }

      if (!code) {
        setError('Kode autentikasi tidak ditemukan')
        setTimeout(() => navigate('/login'), 2000)
        return
      }

      try {
        // Kirim kode ke backend untuk ditukar dengan token
        const response = await axios.post('/api/auth/google/', {
          code: code,
          redirect_uri: window.location.origin + '/auth/google/callback'
        })

        // Simpan token
        localStorage.setItem('token', response.data.access)
        localStorage.setItem('refresh', response.data.refresh)
        localStorage.setItem('user', JSON.stringify(response.data.user))

        // Redirect berdasarkan role
        const role = response.data.user?.role?.toUpperCase()
        const destination = role === 'ADMIN' ? '/admin' : role === 'OWNER' ? '/owner' : '/user-map'
        navigate(destination, { replace: true })
      } catch (err) {
        console.error('Google login error:', err)
        setError(err.response?.data?.detail || 'Login dengan Google gagal')
        setTimeout(() => navigate('/login'), 2000)
      }
    }

    handleGoogleCallback()
  }, [searchParams, navigate])

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
        maxWidth: 440,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        textAlign: 'center'
      }}>
        {error ? (
          <>
            <div style={{
              width: 64,
              height: 64,
              background: '#fee2e2',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              color: '#dc2626',
              fontSize: 32
            }}>
              ✕
            </div>
            <h2 style={{ 
              fontSize: 24, 
              fontWeight: 700, 
              margin: '0 0 12px',
              color: '#0f172a'
            }}>
              Login Gagal
            </h2>
            <p style={{ 
              fontSize: 14, 
              color: '#64748b',
              margin: 0
            }}>
              {error}
            </p>
          </>
        ) : (
          <>
            <div style={{
              width: 64,
              height: 64,
              border: '4px solid #e0e7ff',
              borderTop: '4px solid #4f46e5',
              borderRadius: '50%',
              margin: '0 auto 20px',
              animation: 'spin 1s linear infinite'
            }} />
            <h2 style={{ 
              fontSize: 24, 
              fontWeight: 700, 
              margin: '0 0 12px',
              color: '#0f172a'
            }}>
              Memproses Login
            </h2>
            <p style={{ 
              fontSize: 14, 
              color: '#64748b',
              margin: 0
            }}>
              Mohon tunggu sebentar...
            </p>
          </>
        )}
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
