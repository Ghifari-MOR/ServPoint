import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { User, Lock, Bell, Info, Eye, EyeOff, AlertCircle } from 'lucide-react'
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

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      display: 'flex'
    }}>
      {/* Sidebar */}
      <aside style={{
        width: 280,
        background: '#fff',
        borderRight: '1px solid #e2e8f0',
        padding: '32px 0'
      }}>
        <div style={{ padding: '0 24px', marginBottom: 32 }}>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#0f172a' }}>
            Pengaturan
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#64748b' }}>
            Kelola akun owner Anda
          </p>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column' }}>
          <TabButton
            icon={<User size={18} />}
            label="Profil"
            active={activeTab === 'profile'}
            onClick={() => setActiveTab('profile')}
          />
          <TabButton
            icon={<Lock size={18} />}
            label="Keamanan"
            active={activeTab === 'security'}
            onClick={() => setActiveTab('security')}
          />
          <TabButton
            icon={<Bell size={18} />}
            label="Notifikasi"
            active={activeTab === 'notifications'}
            onClick={() => setActiveTab('notifications')}
          />
          <TabButton
            icon={<Info size={18} />}
            label="Tentang"
            active={activeTab === 'about'}
            onClick={() => setActiveTab('about')}
          />
        </nav>

        <div style={{ padding: '0 24px', marginTop: 'auto', paddingTop: 32 }}>
          <button
            onClick={() => navigate('/owner')}
            style={{
              width: '100%',
              padding: '10px 16px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              color: '#64748b',
              cursor: 'pointer'
            }}
          >
            ← Kembali ke Dashboard
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: 48 }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          {activeTab === 'profile' && (
            <div>
              <h1 style={{ margin: '0 0 8px 0', fontSize: 28, fontWeight: 700, color: '#0f172a' }}>
                Informasi Profil
              </h1>
              <p style={{ margin: '0 0 32px 0', fontSize: 14, color: '#64748b' }}>
                Perbarui informasi profil dan email Anda
              </p>

              <form onSubmit={handleUpdateProfile} style={{
                background: '#fff',
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                padding: 32
              }}>
                {profileSuccess && (
                  <div style={{
                    padding: 12,
                    background: '#f0fdf4',
                    border: '1px solid #86efac',
                    borderRadius: 8,
                    color: '#16a34a',
                    fontSize: 14,
                    marginBottom: 20
                  }}>
                    {profileSuccess}
                  </div>
                )}

                {profileError && (
                  <div style={{
                    padding: 12,
                    background: '#fef2f2',
                    border: '1px solid #fca5a5',
                    borderRadius: 8,
                    color: '#dc2626',
                    fontSize: 14,
                    marginBottom: 20
                  }}>
                    {profileError}
                  </div>
                )}

                <div style={{ marginBottom: 24 }}>
                  <label style={{
                    display: 'block',
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#0f172a',
                    marginBottom: 8
                  }}>
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      fontSize: 14
                    }}
                  />
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{
                    display: 'block',
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#0f172a',
                    marginBottom: 8
                  }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      fontSize: 14
                    }}
                  />
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{
                    display: 'block',
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#0f172a',
                    marginBottom: 8
                  }}>
                    Username
                  </label>
                  <input
                    type="text"
                    value={profileForm.username}
                    onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      fontSize: 14
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    padding: '10px 24px',
                    background: '#4f46e5',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  Simpan Perubahan
                </button>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <h1 style={{ margin: '0 0 8px 0', fontSize: 28, fontWeight: 700, color: '#0f172a' }}>
                Keamanan Akun
              </h1>
              <p style={{ margin: '0 0 32px 0', fontSize: 14, color: '#64748b' }}>
                Kelola password dan keamanan akun Anda
              </p>

              <form onSubmit={handleChangePassword} style={{
                background: '#fff',
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                padding: 32
              }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: 16, fontWeight: 600, color: '#0f172a' }}>
                  Ganti Password
                </h3>

                {passwordSuccess && (
                  <div style={{
                    padding: 12,
                    background: '#f0fdf4',
                    border: '1px solid #86efac',
                    borderRadius: 8,
                    color: '#16a34a',
                    fontSize: 14,
                    marginBottom: 20
                  }}>
                    {passwordSuccess}
                  </div>
                )}

                {passwordError && (
                  <div style={{
                    padding: 12,
                    background: '#fef2f2',
                    border: '1px solid #fca5a5',
                    borderRadius: 8,
                    color: '#dc2626',
                    fontSize: 14,
                    marginBottom: 20
                  }}>
                    {passwordError}
                  </div>
                )}

                <div style={{ marginBottom: 24 }}>
                  <label style={{
                    display: 'block',
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#0f172a',
                    marginBottom: 8
                  }}>
                    Password Lama
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 40px 10px 14px',
                        border: '1px solid #e2e8f0',
                        borderRadius: 8,
                        fontSize: 14
                      }}
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

                <div style={{ marginBottom: 24 }}>
                  <label style={{
                    display: 'block',
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#0f172a',
                    marginBottom: 8
                  }}>
                    Password Baru
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 40px 10px 14px',
                        border: '1px solid #e2e8f0',
                        borderRadius: 8,
                        fontSize: 14
                      }}
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
                  <label style={{
                    display: 'block',
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#0f172a',
                    marginBottom: 8
                  }}>
                    Konfirmasi Password Baru
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 40px 10px 14px',
                        border: '1px solid #e2e8f0',
                        borderRadius: 8,
                        fontSize: 14
                      }}
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
                    padding: '10px 24px',
                    background: '#4f46e5',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  Ubah Password
                </button>
              </form>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h1 style={{ margin: '0 0 8px 0', fontSize: 28, fontWeight: 700, color: '#0f172a' }}>
                Notifikasi
              </h1>
              <p style={{ margin: '0 0 32px 0', fontSize: 14, color: '#64748b' }}>
                Kelola preferensi notifikasi Anda
              </p>

              <div style={{
                background: '#fff',
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                padding: 32
              }}>
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
            </div>
          )}

          {activeTab === 'about' && (
            <div>
              <h1 style={{ margin: '0 0 8px 0', fontSize: 28, fontWeight: 700, color: '#0f172a' }}>
                Tentang
              </h1>
              <p style={{ margin: '0 0 32px 0', fontSize: 14, color: '#64748b' }}>
                Informasi aplikasi dan akun
              </p>

              <div style={{
                background: '#fff',
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                padding: 32,
                marginBottom: 24
              }}>
                <InfoCard label="Versi Aplikasi" value="1.0.0" />
                <InfoCard label="Role Akun" value="Owner" />
                <InfoCard label="Terdaftar Sejak" value={new Date().toLocaleDateString('id-ID')} />
                <InfoCard label="Kebijakan Privasi" value="Lihat kebijakan →" isLink />
                <InfoCard label="Pusat Bantuan" value="Hubungi support →" isLink />
                <InfoCard label="Website" value="servpoint.com" isLast isLink />
              </div>

              <div style={{
                background: '#fff',
                borderRadius: 12,
                border: '1px solid #fee2e2',
                padding: 32
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <AlertCircle size={20} color="#dc2626" />
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#dc2626' }}>
                    Danger Zone
                  </h3>
                </div>
                <p style={{ margin: '0 0 16px 0', fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>
                  Menghapus akun akan menghapus semua data UMKM, produk, jasa, dan ulasan Anda secara permanen.
                  Tindakan ini tidak dapat dibatalkan.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  style={{
                    padding: '10px 24px',
                    background: '#dc2626',
                    border: 'none',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  Hapus Akun
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function TabButton({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 24px',
        background: active ? '#f8fafc' : 'transparent',
        border: 'none',
        borderLeft: active ? '3px solid #4f46e5' : '3px solid transparent',
        fontSize: 14,
        fontWeight: 500,
        color: active ? '#4f46e5' : '#64748b',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all 0.2s'
      }}
    >
      {icon}
      {label}
    </button>
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
          background: checked ? '#4f46e5' : '#cbd5e1',
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
        color: isLink ? '#4f46e5' : '#0f172a',
        cursor: isLink ? 'pointer' : 'default'
      }}>
        {value}
      </p>
    </div>
  )
}
