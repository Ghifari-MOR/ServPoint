import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import api from '../services/api'
import { 
  User, 
  Lock, 
  Bell, 
  Globe, 
  Trash2, 
  Save, 
  Eye, 
  EyeOff,
  AlertCircle,
  CheckCircle,
  Info,
  Shield,
  HelpCircle,
  Camera,
  Upload
} from 'lucide-react'

export default function UserSettings() {
  const { user, logout, updateUser } = useContext(AuthContext)
  const navigate = useNavigate()

  // Active tab
  const [activeTab, setActiveTab] = useState('profile')

  // Profile form
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    username: user?.username || ''
  })
  const [profilePicture, setProfilePicture] = useState(null)
  const [profilePicturePreview, setProfilePicturePreview] = useState(user?.profile_picture_url || null)
  const [profileSaving, setProfileSaving] = useState(false)
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
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [passwordError, setPasswordError] = useState('')

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNotif: true,
    pushNotif: false,
    reviewNotif: true,
    promoNotif: true
  })

  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setProfileSaving(true)
    setProfileError('')
    setProfileSuccess('')

    try {
      const formData = new FormData()
      formData.append('name', profileForm.name)
      formData.append('email', profileForm.email)
      formData.append('username', profileForm.username)
      
      if (profilePicture) {
        formData.append('profile_picture', profilePicture)
      }

      const { data } = await api.patch(`/users/${user.user_id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      updateUser(data)
      setProfileSuccess('✓ Profil berhasil diperbarui!')
      setTimeout(() => setProfileSuccess(''), 3000)
    } catch (err) {
      setProfileError(err?.response?.data?.detail || 'Gagal memperbarui profil')
    } finally {
      setProfileSaving(false)
    }
  }

  // Handle profile picture change
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setProfileError('File harus berupa gambar')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setProfileError('Ukuran file maksimal 5MB')
        return
      }
      setProfilePicture(file)
      setProfilePicturePreview(URL.createObjectURL(file))
      setProfileError('')
    }
  }

  // Handle password change
  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordSaving(true)
    setPasswordError('')
    setPasswordSuccess('')

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Password baru tidak cocok!')
      setPasswordSaving(false)
      return
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('Password minimal 8 karakter!')
      setPasswordSaving(false)
      return
    }

    try {
      await api.post('/auth/change-password/', {
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword
      })
      setPasswordSuccess('✓ Password berhasil diubah!')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => setPasswordSuccess(''), 3000)
    } catch (err) {
      setPasswordError(err?.response?.data?.detail || 'Gagal mengubah password')
    } finally {
      setPasswordSaving(false)
    }
  }

  // Handle delete account
  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      '⚠️ PERHATIAN!\n\nApakah Anda yakin ingin menghapus akun?\n\nSemua data Anda akan dihapus permanen dan tidak dapat dikembalikan.'
    )
    
    if (!confirmed) return

    const finalConfirm = window.prompt(
      'Ketik "HAPUS AKUN" untuk konfirmasi penghapusan:'
    )

    if (finalConfirm !== 'HAPUS AKUN') {
      alert('Penghapusan akun dibatalkan')
      return
    }

    try {
      await api.delete(`/users/${user.user_id}/`)
      alert('Akun berhasil dihapus')
      logout()
      navigate('/login')
    } catch (err) {
      alert('Gagal menghapus akun: ' + (err?.response?.data?.detail || err.message))
    }
  }

  const tabs = [
    { id: 'profile', icon: User, label: 'Profil' },
    { id: 'password', icon: Lock, label: 'Keamanan' },
    { id: 'notifications', icon: Bell, label: 'Notifikasi' },
    { id: 'about', icon: Info, label: 'Tentang' }
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <Sidebar />

      <main style={{ flex: 1, marginLeft: 240, padding: '32px 48px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <button
              onClick={() => navigate(-1)}
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
                      color: activeTab === tab.id ? '#4f46e5' : '#64748b',
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
                    {/* Profile Picture Upload */}
                    <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', gap: 24 }}>
                      <div style={{ position: 'relative' }}>
                        {profilePicturePreview ? (
                          <img 
                            src={profilePicturePreview} 
                            alt="Profile"
                            style={{
                              width: 96,
                              height: 96,
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '4px solid #e0e7ff'
                            }}
                          />
                        ) : (
                          <div style={{
                            width: 96,
                            height: 96,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
                            display: 'grid',
                            placeItems: 'center',
                            fontSize: 36,
                            fontWeight: 700,
                            color: '#4f46e5',
                            border: '4px solid #e0e7ff'
                          }}>
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                        )}
                        <label
                          htmlFor="profile-picture-upload"
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: '#4f46e5',
                            display: 'grid',
                            placeItems: 'center',
                            cursor: 'pointer',
                            border: '3px solid #fff',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }}
                        >
                          <Camera size={16} color="#fff" />
                        </label>
                        <input
                          id="profile-picture-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePictureChange}
                          style={{ display: 'none' }}
                        />
                      </div>
                      <div>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: 16, fontWeight: 600, color: '#0f172a' }}>
                          Foto Profil
                        </h3>
                        <p style={{ margin: '0 0 12px 0', fontSize: 13, color: '#64748b' }}>
                          JPG, PNG atau GIF. Maksimal 5MB.
                        </p>
                        <label
                          htmlFor="profile-picture-upload"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '8px 16px',
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 500,
                            color: '#4f46e5',
                            cursor: 'pointer'
                          }}
                        >
                          <Upload size={16} />
                          Upload Foto
                        </label>
                      </div>
                    </div>

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
                      disabled={profileSaving}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '12px 24px',
                        background: profileSaving ? '#94a3b8' : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                        border: 'none',
                        borderRadius: 8,
                        color: '#fff',
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: profileSaving ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <Save size={18} />
                      {profileSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                  </form>
                </div>
              )}

              {/* Password Tab */}
              {activeTab === 'password' && (
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

                    <div style={{ marginBottom: 20 }}>
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
                      disabled={passwordSaving}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '12px 24px',
                        background: passwordSaving ? '#94a3b8' : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                        border: 'none',
                        borderRadius: 8,
                        color: '#fff',
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: passwordSaving ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <Lock size={18} />
                      {passwordSaving ? 'Mengubah...' : 'Ubah Password'}
                    </button>
                  </form>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 style={{ margin: '0 0 8px 0', fontSize: 20, fontWeight: 700, color: '#0f172a' }}>
                    Preferensi Notifikasi
                  </h2>
                  <p style={{ margin: '0 0 24px 0', fontSize: 14, color: '#64748b' }}>
                    Atur notifikasi yang ingin Anda terima
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <NotificationToggle
                      label="Notifikasi Email"
                      description="Terima notifikasi penting melalui email"
                      checked={notifications.emailNotif}
                      onChange={(checked) => setNotifications({ ...notifications, emailNotif: checked })}
                    />
                    <NotificationToggle
                      label="Notifikasi Push"
                      description="Notifikasi langsung ke browser Anda"
                      checked={notifications.pushNotif}
                      onChange={(checked) => setNotifications({ ...notifications, pushNotif: checked })}
                    />
                    <NotificationToggle
                      label="Notifikasi Ulasan"
                      description="Ketika UMKM yang Anda tandai mendapat ulasan baru"
                      checked={notifications.reviewNotif}
                      onChange={(checked) => setNotifications({ ...notifications, reviewNotif: checked })}
                    />
                    <NotificationToggle
                      label="Promosi & Penawaran"
                      description="Dapatkan info promo dari UMKM favorit"
                      checked={notifications.promoNotif}
                      onChange={(checked) => setNotifications({ ...notifications, promoNotif: checked })}
                    />
                  </div>

                  <button
                    style={{
                      marginTop: 24,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '12px 24px',
                      background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                      border: 'none',
                      borderRadius: 8,
                      color: '#fff',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Save size={18} />
                    Simpan Preferensi
                  </button>
                </div>
              )}

              {/* About Tab */}
              {activeTab === 'about' && (
                <div>
                  <h2 style={{ margin: '0 0 24px 0', fontSize: 20, fontWeight: 700, color: '#0f172a' }}>
                    Tentang Aplikasi
                  </h2>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <InfoCard
                      icon={<Info size={20} />}
                      title="Versi Aplikasi"
                      description="LoService v1.0.0"
                    />
                    <InfoCard
                      icon={<Shield size={20} />}
                      title="Kebijakan Privasi"
                      description="Kami melindungi data pribadi Anda"
                      link="#"
                    />
                    <InfoCard
                      icon={<HelpCircle size={20} />}
                      title="Pusat Bantuan"
                      description="FAQ dan panduan penggunaan aplikasi"
                      link="#"
                    />
                    <InfoCard
                      icon={<Globe size={20} />}
                      title="Website"
                      description="www.loservice.com"
                      link="#"
                    />
                  </div>

                  <div style={{
                    marginTop: 32,
                    padding: 20,
                    background: '#fef3c7',
                    border: '1px solid #fde047',
                    borderRadius: 12
                  }}>
                    <h3 style={{ margin: '0 0 12px 0', fontSize: 16, fontWeight: 600, color: '#854d0e', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <AlertCircle size={18} />
                      Zona Bahaya
                    </h3>
                    <p style={{ margin: '0 0 16px 0', fontSize: 14, color: '#a16207' }}>
                      Tindakan ini tidak dapat dibatalkan. Harap berhati-hati.
                    </p>
                    <button
                      onClick={handleDeleteAccount}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
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
                      <Trash2 size={16} />
                      Hapus Akun Permanen
                    </button>
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

function NotificationToggle({ label, description, checked, onChange }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      background: '#f8fafc',
      borderRadius: 12,
      border: '1px solid #e2e8f0'
    }}>
      <div>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
          {label}
        </p>
        <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#64748b' }}>
          {description}
        </p>
      </div>
      <label style={{ position: 'relative', display: 'inline-block', width: 48, height: 24 }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          style={{ opacity: 0, width: 0, height: 0 }}
        />
        <span style={{
          position: 'absolute',
          cursor: 'pointer',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: checked ? '#4f46e5' : '#cbd5e1',
          transition: '0.3s',
          borderRadius: 24
        }}>
          <span style={{
            position: 'absolute',
            content: '',
            height: 18,
            width: 18,
            left: checked ? 26 : 3,
            bottom: 3,
            background: '#fff',
            transition: '0.3s',
            borderRadius: '50%'
          }} />
        </span>
      </label>
    </div>
  )
}

function InfoCard({ icon, title, description, link }) {
  return (
    <div style={{
      padding: 16,
      background: '#f8fafc',
      borderRadius: 12,
      border: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      gap: 16
    }}>
      <div style={{
        width: 40,
        height: 40,
        background: 'linear-gradient(135deg, #4f46e522 0%, #7c3aed22 100%)',
        borderRadius: 10,
        display: 'grid',
        placeItems: 'center',
        color: '#4f46e5'
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
          {title}
        </p>
        <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#64748b' }}>
          {description}
        </p>
      </div>
      {link && (
        <a
          href={link}
          style={{
            color: '#4f46e5',
            fontSize: 14,
            fontWeight: 600,
            textDecoration: 'none'
          }}
        >
          →
        </a>
      )}
    </div>
  )
}
