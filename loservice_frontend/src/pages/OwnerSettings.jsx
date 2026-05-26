import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { User, Lock, Bell, Info, Eye, EyeOff, AlertCircle, Save, CheckCircle } from 'lucide-react'
import api from '../services/api'

export default function OwnerSettings() {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('profile')

  // Profile form
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    username: user?.username || ''
  })
  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileError, setProfileError] = useState('')

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [passwordError, setPasswordError] = useState('')

  // Notifications
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    reviews: true,
    orders: true
  })

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setProfileSuccess('')
    setProfileError('')

    try {
      await api.patch(`/users/${user.user_id}/`, profileForm)
      setProfileSuccess('Profil berhasil diperbarui!')
      setTimeout(() => setProfileSuccess(''), 3000)
    } catch (error) {
      setProfileError('Gagal memperbarui profil. ' + (error.response?.data?.message || ''))
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordSuccess('')
    setPasswordError('')

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Password baru dan konfirmasi tidak cocok')
      return
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('Password baru minimal 8 karakter')
      return
    }

    try {
      await api.post('/auth/change-password/', {
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword
      })
      setPasswordSuccess('Password berhasil diubah!')
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setTimeout(() => setPasswordSuccess(''), 3000)
    } catch (error) {
      setPasswordError('Gagal mengubah password. ' + (error.response?.data?.message || 'Periksa password lama Anda.'))
    }
  }

  const handleDeleteAccount = async () => {
    const confirm1 = window.confirm('Apakah Anda yakin ingin menghapus akun? Semua data UMKM Anda akan hilang!')
    if (!confirm1) return

    const confirm2 = window.confirm('PERINGATAN: Tindakan ini tidak dapat dibatalkan. Lanjutkan?')
    if (!confirm2) return

    try {
      await api.delete(`/users/${user.user_id}/`)
      logout()
      navigate('/login')
    } catch (error) {
      alert('Gagal menghapus akun. Silakan coba lagi.')
    }
  }

  const tabs = [
    { id: 'profile', icon: User, label: 'Profil' },
    { id: 'security', icon: Lock, label: 'Keamanan' },
    { id: 'notifications', icon: Bell, label: 'Notifikasi' },
    { id: 'about', icon: Info, label: 'Tentang' }
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <main style={{ flex: 1, padding: '32px 48px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <button
              onClick={() => navigate('/owner')}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                fontSize: 14,
                cursor: 'pointer',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              ← Kembali
            </button>
            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700, color: '#0f172a' }}>
              Pengaturan Akun
            </h1>
            <p style={{ margin: '8px 0 0 0', fontSize: 16, color: '#64748b' }}>
              Kelola informasi akun dan preferensi Anda
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 24 }}>
            {/* Sidebar Tabs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 16px',
                      background: activeTab === tab.id ? '#fff' : 'transparent',
                      border: activeTab === tab.id ? '1px solid #e2e8f0' : '1px solid transparent',
                      borderRadius: 12,
                      fontSize: 14,
                      fontWeight: activeTab === tab.id ? 600 : 500,
                      color: activeTab === tab.id ? '#3b82f6' : '#64748b',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* Content Area */}
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 32 }}>
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <h2 style={{ margin: '0 0 24px 0', fontSize: 20, fontWeight: 700, color: '#0f172a' }}>
                    Informasi Profil
                  </h2>

                  {profileSuccess && (
                    <div style={{
                      padding: 16,
                      background: '#d1fae5',
                      border: '1px solid #a7f3d0',
                      borderRadius: 12,
                      marginBottom: 24,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      color: '#065f46'
                    }}>
                      <CheckCircle size={20} />
                      {profileSuccess}
                    </div>
                  )}

                  {profileError && (
                    <div style={{
                      padding: 16,
                      background: '#fee2e2',
                      border: '1px solid #fecaca',
                      borderRadius: 12,
                      marginBottom: 24,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      color: '#991b1b'
                    }}>
                      <AlertCircle size={20} />
                      {profileError}
                    </div>
                  )}

                  <form onSubmit={handleUpdateProfile}>
                    <div style={{ marginBottom: 20 }}>
                      <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#334155' }}>
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid #cbd5e1',
                          borderRadius: 8,
                          fontSize: 14
                        }}
                        placeholder="Masukkan nama lengkap"
                      />
                    </div>

                    <div style={{ marginBottom: 20 }}>
                      <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#334155' }}>
                        Email
                      </label>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid #cbd5e1',
                          borderRadius: 8,
                          fontSize: 14
                        }}
                        placeholder="email@example.com"
                      />
                    </div>

                    <div style={{ marginBottom: 20 }}>
                      <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#334155' }}>
                        Username
                      </label>
                      <input
                        type="text"
                        value={profileForm.username}
                        onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          border: '1px solid #cbd5e1',
                          borderRadius: 8,
                          fontSize: 14
                        }}
                        placeholder="username"
                      />
                    </div>

                    <button
                      type="submit"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                        border: 'none',
                        borderRadius: 8,
                        color: '#fff',
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      <Save size={18} />
                      Simpan Perubahan
                    </button>
                  </form>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div>
                  <h2 style={{ margin: '0 0 8px 0', fontSize: 20, fontWeight: 700, color: '#0f172a' }}>
                    Ubah Password
                  </h2>
                  <p style={{ margin: '0 0 24px 0', fontSize: 14, color: '#64748b' }}>
                    Pastikan password Anda kuat dan aman
                  </p>

                  {passwordSuccess && (
                    <div style={{
                      padding: 16,
                      background: '#d1fae5',
                      border: '1px solid #a7f3d0',
                      borderRadius: 12,
                      marginBottom: 24,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      color: '#065f46'
                    }}>
                      <CheckCircle size={20} />
                      {passwordSuccess}
                    </div>
                  )}

                  {passwordError && (
                    <div style={{
                      padding: 16,
                      background: '#fee2e2',
                      border: '1px solid #fecaca',
                      borderRadius: 12,
                      marginBottom: 24,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      color: '#991b1b'
                    }}>
                      <AlertCircle size={20} />
                      {passwordError}
                    </div>
                  )}

                  <form onSubmit={handleChangePassword}>
                    <div style={{ marginBottom: 20 }}>
                      <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#334155' }}>
                        Password Saat Ini
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showPasswords.current ? 'text' : 'password'}
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                          required
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            paddingRight: 48,
                            border: '1px solid #cbd5e1',
                            borderRadius: 8,
                            fontSize: 14
                          }}
                          placeholder="Masukkan password saat ini"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                          style={{
                            position: 'absolute',
                            right: 12,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#64748b'
                          }}
                        >
                          {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div style={{ marginBottom: 20 }}>
                      <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#334155' }}>
                        Password Baru
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showPasswords.new ? 'text' : 'password'}
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          required
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            paddingRight: 48,
                            border: '1px solid #cbd5e1',
                            borderRadius: 8,
                            fontSize: 14
                          }}
                          placeholder="Minimal 8 karakter"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                          style={{
                            position: 'absolute',
                            right: 12,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#64748b'
                          }}
                        >
                          {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div style={{ marginBottom: 24 }}>
                      <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#334155' }}>
                        Konfirmasi Password Baru
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showPasswords.confirm ? 'text' : 'password'}
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          required
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            paddingRight: 48,
                            border: '1px solid #cbd5e1',
                            borderRadius: 8,
                            fontSize: 14
                          }}
                          placeholder="Ketik ulang password baru"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                          style={{
                            position: 'absolute',
                            right: 12,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#64748b'
                          }}
                        >
                          {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                        border: 'none',
                        borderRadius: 8,
                        color: '#fff',
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      <Lock size={18} />
                      Ubah Password
                    </button>
                  </form>

                  {/* Delete Account */}
                  <div style={{
                    marginTop: 48,
                    padding: 24,
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: 12
                  }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: 16, fontWeight: 700, color: '#991b1b' }}>
                      Zona Berbahaya
                    </h3>
                    <p style={{ margin: '0 0 16px 0', fontSize: 14, color: '#7f1d1d' }}>
                      Hapus akun dan semua data UMKM Anda secara permanen. Tindakan ini tidak dapat dibatalkan!
                    </p>
                    <button
                      onClick={handleDeleteAccount}
                      style={{
                        padding: '10px 20px',
                        background: '#dc2626',
                        border: 'none',
                        borderRadius: 8,
                        color: '#fff',
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Hapus Akun
                    </button>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 style={{ margin: '0 0 8px 0', fontSize: 20, fontWeight: 700, color: '#0f172a' }}>
                    Pengaturan Notifikasi
                  </h2>
                  <p style={{ margin: '0 0 24px 0', fontSize: 14, color: '#64748b' }}>
                    Kelola preferensi notifikasi Anda
                  </p>

                  <NotificationToggle
                    label="Notifikasi Email"
                    description="Terima notifikasi melalui email"
                    checked={notifications.email}
                    onChange={(checked) => setNotifications({ ...notifications, email: checked })}
                  />
                  <NotificationToggle
                    label="Notifikasi Push"
                    description="Terima notifikasi push browser"
                    checked={notifications.push}
                    onChange={(checked) => setNotifications({ ...notifications, push: checked })}
                  />
                  <NotificationToggle
                    label="Ulasan Baru"
                    description="Notifikasi saat ada ulasan baru"
                    checked={notifications.reviews}
                    onChange={(checked) => setNotifications({ ...notifications, reviews: checked })}
                  />
                  <NotificationToggle
                    label="Pesanan & Pertanyaan"
                    description="Notifikasi untuk pertanyaan pelanggan"
                    checked={notifications.orders}
                    onChange={(checked) => setNotifications({ ...notifications, orders: checked })}
                    isLast
                  />
                </div>
              )}

              {/* About Tab */}
              {activeTab === 'about' && (
                <div>
                  <h2 style={{ margin: '0 0 24px 0', fontSize: 20, fontWeight: 700, color: '#0f172a' }}>
                    Informasi Aplikasi
                  </h2>

                  <div style={{ marginBottom: 32 }}>
                    <InfoCard label="Versi Aplikasi" value="1.0.0" />
                    <InfoCard label="Role Akun" value="Owner" />
                    <InfoCard label="Terdaftar Sejak" value={new Date().toLocaleDateString('id-ID')} />
                    <InfoCard label="Kebijakan Privasi" value="Lihat kebijakan →" isLink />
                    <InfoCard label="Pusat Bantuan" value="Hubungi support →" isLink />
                    <InfoCard label="Website" value="servicepoint.com" isLast isLink />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function NotificationToggle({ label, description, checked, onChange, isLast }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: isLast ? 0 : 20,
      marginBottom: isLast ? 0 : 20,
      borderBottom: isLast ? 'none' : '1px solid #f1f5f9'
    }}>
      <div>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: '#0f172a' }}>
          {label}
        </p>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
          {description}
        </p>
      </div>
      <label style={{
        position: 'relative',
        display: 'inline-block',
        width: 48,
        height: 24,
        cursor: 'pointer'
      }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          style={{ display: 'none' }}
        />
        <span style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: checked ? '#3b82f6' : '#cbd5e1',
          borderRadius: 24,
          transition: 'all 0.2s'
        }}>
          <span style={{
            position: 'absolute',
            height: 18,
            width: 18,
            left: checked ? 27 : 3,
            bottom: 3,
            background: '#fff',
            borderRadius: '50%',
            transition: 'all 0.2s'
          }} />
        </span>
      </label>
    </div>
  )
}

function InfoCard({ label, value, isLink, isLast }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: isLast ? 0 : 16,
      marginBottom: isLast ? 0 : 16,
      borderBottom: isLast ? 'none' : '1px solid #f1f5f9'
    }}>
      <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: '#64748b' }}>
        {label}
      </p>
      <p style={{
        margin: 0,
        fontSize: 14,
        fontWeight: 500,
        color: isLink ? '#3b82f6' : '#0f172a',
        cursor: isLink ? 'pointer' : 'default'
      }}>
        {value}
      </p>
    </div>
  )
}
