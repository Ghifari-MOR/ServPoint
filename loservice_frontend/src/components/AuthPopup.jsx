import { useContext, useEffect, useMemo, useState } from 'react'
import { AuthContext } from '../context/AuthContext'

export default function AuthPopup({
  open,
  mode,
  from,
  onModeChange,
  onClose,
  onAuthed,
}) {
  const { login, register } = useContext(AuthContext)
  const safeMode = mode === 'register' ? 'register' : 'login'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [username, setUsername] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')

  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const title = useMemo(() => (safeMode === 'login' ? 'Login' : 'Register'), [safeMode])

  useEffect(() => {
    if (!open) {
      setError(null)
      setLoading(false)
    }
  }, [open])

  if (!open) return null

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (safeMode === 'login') {
        await login(email, password)
        onAuthed?.()
        return
      }

      if (password !== passwordConfirm) {
        setError('Password tidak sama')
        return
      }

      await register({
        email,
        username,
        password,
        password_confirm: passwordConfirm,
        role: 'USER',
      })

      onAuthed?.()
    } catch (err) {
      const data = err?.response?.data
      const message =
        typeof data === 'string'
          ? data
          : data?.detail || Object.values(data || {})?.[0]?.[0] || 'Autentikasi gagal'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setError(null)
    onModeChange?.(safeMode === 'login' ? 'register' : 'login')
  }

  return (
    <div
      className="modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        zIndex: 3000,
      }}
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
    >
      <div
        className="auth-box"
        style={{
          width: '100%',
          maxWidth: 420,
          position: 'relative',
        }}
      >
        <button
          type="button"
          aria-label="Tutup"
          onClick={() => onClose?.()}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            width: 36,
            height: 36,
            borderRadius: 10,
            border: '1px solid #e5e7eb',
            background: '#fff',
            cursor: 'pointer',
            fontSize: 18,
            lineHeight: '34px',
          }}
        >
          ×
        </button>

        <h1 style={{ marginBottom: 6 }}>{title}</h1>
        {from ? (
          <p style={{ marginTop: 0, marginBottom: 18, color: '#64748b', textAlign: 'center' }}>
            Login dulu untuk membuka halaman yang kamu pilih.
          </p>
        ) : null}

        <form onSubmit={submit}>
          {error && <div className="error-message">{error}</div>}

          <label>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            autoComplete="email"
          />

          {safeMode === 'register' ? (
            <>
              <label>Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                type="text"
                required
                autoComplete="username"
              />
            </>
          ) : null}

          <label>Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            autoComplete={safeMode === 'login' ? 'current-password' : 'new-password'}
          />

          {safeMode === 'register' ? (
            <>
              <label>Confirm Password</label>
              <input
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                type="password"
                required
                autoComplete="new-password"
              />
            </>
          ) : null}

          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Memproses...' : safeMode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>

        <p style={{ marginBottom: 0 }}>
          {safeMode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
          <button
            type="button"
            onClick={switchMode}
            style={{
              border: 'none',
              background: 'transparent',
              color: '#5a67d8',
              cursor: 'pointer',
              fontWeight: 700,
              padding: 0,
            }}
          >
            {safeMode === 'login' ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  )
}
