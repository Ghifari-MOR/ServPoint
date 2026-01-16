import { useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import api from '../services/api'
import { 
  LayoutDashboard, 
  Store, 
  Clock, 
  CheckCircle, 
  Users, 
  FileText, 
  Settings, 
  Search,
  Eye,
  X,
  Check,
  TrendingUp,
  Bell,
  Mail,
  Edit,
  Save,
  Trash2
} from 'lucide-react'

export default function Admin() {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [allItems, setAllItems] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [actionMsg, setActionMsg] = useState('')
  const [actionKind, setActionKind] = useState('success')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeView, setActiveView] = useState('dashboard')
  const [editingUmkm, setEditingUmkm] = useState(null)
  const [editForm, setEditForm] = useState({
    nama_umkm: '',
    deskripsi: '',
    telpon: '',
    alamat: ''
  })

  const pendingCount = useMemo(() => allItems.filter(i => i.status === 'PENDING').length, [allItems])
  const approvedCount = useMemo(() => allItems.filter(i => i.status === 'APPROVED').length, [allItems])
  const totalUsers = allUsers.length

  const refresh = async () => {
    setLoading(true)
    setError('')
    
    try {
      const { data } = await api.get('/umkm/')
      setAllItems(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e?.response?.data?.detail || 'Gagal memuat data UMKM')
      console.error('Error fetching UMKM:', e)
    } finally {
      setLoading(false)
    }
  }

  const refreshUsers = async () => {
    setLoading(true)
    setError('')
    
    try {
      const { data } = await api.get('/users/')
      setAllUsers(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e?.response?.data?.detail || 'Gagal memuat data Users')
      console.error('Error fetching Users:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      refresh()
      refreshUsers()
    }
  }, [user])

  const approve = async (id) => {
    setActionMsg('')
    try {
      await api.post(`/umkm/${id}/approve/`)
      setActionKind('success')
      setActionMsg('UMKM berhasil disetujui.')
      await refresh()
    } catch (e) {
      console.error('Error approving:', e)
      setActionKind('error')
      setActionMsg(e?.response?.data?.detail || 'Gagal menyetujui UMKM')
    }
  }

  const reject = async (id) => {
    setActionMsg('')
    try {
      await api.post(`/umkm/${id}/reject/`)
      setActionKind('success')
      setActionMsg('UMKM ditolak.')
      await refresh()
    } catch (e) {
      console.error('Error rejecting:', e)
      setActionKind('error')
      setActionMsg(e?.response?.data?.detail || 'Gagal menolak UMKM')
    }
  }

  const deleteUmkm = async (id) => {
    if (!window.confirm('Yakin ingin menghapus UMKM ini? Data akan dihapus permanen.')) return
    setActionMsg('')
    try {
      await api.delete(`/umkm/${id}/`)
      setActionKind('success')
      setActionMsg('UMKM berhasil dihapus.')
      setTimeout(() => setActionMsg(''), 3000)
      await refresh()
    } catch (e) {
      console.error('Error deleting:', e)
      setActionKind('error')
      setActionMsg(e?.response?.data?.detail || 'Gagal menghapus UMKM')
    }
  }

  const deleteUser = async (userId, userRole) => {
    // Prevent deleting admin accounts
    if (userRole?.toUpperCase() === 'ADMIN') {
      setActionKind('error')
      setActionMsg('Tidak bisa menghapus akun Admin!')
      setTimeout(() => setActionMsg(''), 3000)
      return
    }

    if (!window.confirm('Yakin ingin menghapus user ini? Data akan dihapus permanen.')) return
    
    setActionMsg('')
    try {
      await api.delete(`/users/${userId}/`)
      setActionKind('success')
      setActionMsg('User berhasil dihapus.')
      setTimeout(() => setActionMsg(''), 3000)
      await refreshUsers()
    } catch (e) {
      console.error('Error deleting user:', e)
      setActionKind('error')
      setActionMsg(e?.response?.data?.detail || 'Gagal menghapus user')
      setTimeout(() => setActionMsg(''), 3000)
    }
  }

  const openEditModal = (item) => {
    setEditingUmkm(item)
    setEditForm({
      nama_umkm: item.nama_umkm || '',
      deskripsi: item.deskripsi || '',
      telpon: item.telpon || '',
      alamat: item.branches?.[0]?.alamat || ''
    })
  }

  const closeEditModal = () => {
    setEditingUmkm(null)
    setEditForm({ nama_umkm: '', deskripsi: '', telpon: '', alamat: '' })
  }

  const saveEdit = async () => {
    if (!editingUmkm) return
    
    setActionMsg('')
    try {
      await api.patch(`/umkm/${editingUmkm.umkm_id}/`, {
        nama_umkm: editForm.nama_umkm,
        deskripsi: editForm.deskripsi,
        telpon: editForm.telpon
      })
      
      if (editingUmkm.branches?.[0]?.branch_id) {
        await api.patch(`/umkm-branches/${editingUmkm.branches[0].branch_id}/`, {
          alamat: editForm.alamat
        })
      }
      
      setActionKind('success')
      setActionMsg('UMKM berhasil diupdate.')
      closeEditModal()
      await refresh()
    } catch (e) {
      console.error('Error updating:', e)
      setActionKind('error')
      setActionMsg(e?.response?.data?.detail || 'Gagal mengupdate UMKM')
    }
  }

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin logout?')) {
      logout()
      navigate('/login', { replace: true })
    }
  }

  const displayItems = useMemo(() => {
    let filtered = allItems
    
    if (activeView === 'pending') {
      filtered = allItems.filter(i => i.status === 'PENDING')
    } else if (activeView === 'verified') {
      filtered = allItems.filter(i => i.status === 'APPROVED')
    }
    
    if (searchQuery && activeView !== 'users') {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(item => 
        item.nama_umkm?.toLowerCase().includes(query) ||
        item.user?.name?.toLowerCase().includes(query) ||
        item.user?.email?.toLowerCase().includes(query)
      )
    }
    
    return filtered
  }, [allItems, activeView, searchQuery])

  const displayUsers = useMemo(() => {
    if (!searchQuery) return allUsers
    
    const query = searchQuery.toLowerCase()
    return allUsers.filter(u => 
      u.name?.toLowerCase().includes(query) ||
      u.email?.toLowerCase().includes(query) ||
      u.username?.toLowerCase().includes(query) ||
      u.role?.toLowerCase().includes(query)
    )
  }, [allUsers, searchQuery])

  const getTableTitle = () => {
    switch(activeView) {
      case 'pending': return 'UMKM Menunggu Verifikasi'
      case 'verified': return 'UMKM Terverifikasi'
      case 'users': return 'Daftar Users'
      default: return 'Semua UMKM'
    }
  }

  const usersByRole = useMemo(() => {
    const counts = { ADMIN: 0, OWNER: 0, USER: 0 }
    allUsers.forEach(u => {
      const role = (u.role || 'USER').toUpperCase()
      if (counts.hasOwnProperty(role)) {
        counts[role]++
      }
    })
    return counts
  }, [allUsers])

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <aside style={{
        width: 260,
        background: '#fff',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        position: 'fixed',
        height: '100vh',
        left: 0,
        top: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
          <div style={{
            width: 40,
            height: 40,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 10,
            display: 'grid',
            placeItems: 'center',
            color: '#fff',
            fontSize: 16,
            fontWeight: 700
          }}>
            SP
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}>ServPoint</p>
            <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Admin Panel</p>
          </div>
        </div>

        <nav style={{ flex: 1 }}>
          <SidebarLink
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
            active={activeView === 'dashboard'}
            onClick={() => setActiveView('dashboard')}
          />
          <SidebarLink
            icon={<Store size={20} />}
            label="UMKM"
            badge={allItems.length}
            onClick={() => setActiveView('dashboard')}
          />
          <SidebarLink
            icon={<Clock size={20} />}
            label="Pending"
            badge={pendingCount}
            badgeColor="#f59e0b"
            active={activeView === 'pending'}
            onClick={() => setActiveView('pending')}
          />
          <SidebarLink
            icon={<CheckCircle size={20} />}
            label="Verified"
            badge={approvedCount}
            badgeColor="#10b981"
            active={activeView === 'verified'}
            onClick={() => setActiveView('verified')}
          />
          <SidebarLink
            icon={<Users size={20} />}
            label="Users"
            badge={totalUsers}
            active={activeView === 'users'}
            onClick={() => setActiveView('users')}
          />
          <SidebarLink
            icon={<FileText size={20} />}
            label="Reports"
          />
          <SidebarLink
            icon={<Settings size={20} />}
            label="Settings"
          />
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px',
            background: '#f8fafc',
            borderRadius: 10,
            marginBottom: 12
          }}>
            <div style={{
              width: 40,
              height: 40,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600
            }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Admin User
              </p>
              <p style={{ margin: 0, fontSize: 12, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email || 'admin@servpoint.id'}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '12px',
              border: '1px solid #fee2e2',
              background: '#fef2f2',
              borderRadius: 10,
              color: '#ef4444',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#fee2e2'
              e.currentTarget.style.borderColor = '#fecaca'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#fef2f2'
              e.currentTarget.style.borderColor = '#fee2e2'
            }}
          >
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      <main style={{ marginLeft: 260, flex: 1, padding: '32px 40px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 32
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#0f172a' }}>
              {activeView === 'pending' ? 'Pending UMKM' : 
               activeView === 'verified' ? 'Verified UMKM' : 
               activeView === 'users' ? 'Users Management' :
               'Overview Admin'}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              width: 280
            }}>
              <Search size={18} color="#94a3b8" />
              <input
                type="text"
                placeholder={activeView === 'users' ? "Search users..." : "Search UMKM or Users..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  width: '100%',
                  fontSize: 14,
                  color: '#0f172a'
                }}
              />
            </div>
            <button style={{
              width: 40,
              height: 40,
              border: '1px solid #e2e8f0',
              background: '#fff',
              borderRadius: 8,
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer',
              position: 'relative'
            }}>
              <Bell size={20} color="#64748b" />
              <div style={{
                position: 'absolute',
                top: 8,
                right: 8,
                width: 8,
                height: 8,
                background: '#ef4444',
                borderRadius: '50%'
              }} />
            </button>
            <button style={{
              width: 40,
              height: 40,
              border: '1px solid #e2e8f0',
              background: '#fff',
              borderRadius: 8,
              display: 'grid',
              placeItems: 'center',
              cursor: 'pointer'
            }}>
              <Mail size={20} color="#64748b" />
            </button>
          </div>
        </div>

        {activeView === 'dashboard' && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: 20,
            marginBottom: 32
          }}>
            <div style={{
              background: '#fff',
              borderRadius: 12,
              padding: 24,
              border: '1px solid #e2e8f0',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 100,
                height: 100,
                background: 'linear-gradient(135deg, #667eea22 0%, #764ba222 100%)',
                borderRadius: '50%'
              }} />
              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <p style={{ margin: 0, fontSize: 14, color: '#64748b', fontWeight: 500 }}>Total UMKM</p>
                  <div style={{
                    width: 48,
                    height: 48,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: 10,
                    display: 'grid',
                    placeItems: 'center',
                    color: '#fff'
                  }}>
                    <Store size={24} />
                  </div>
                </div>
                <h2 style={{ margin: 0, fontSize: 36, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
                  {allItems.length}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <TrendingUp size={14} color="#10b981" />
                  <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>+12%</span>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>from last month</span>
                </div>
              </div>
            </div>

            <div style={{
              background: '#fff',
              borderRadius: 12,
              padding: 24,
              border: '1px solid #e2e8f0',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 100,
                height: 100,
                background: '#3b82f622',
                borderRadius: '50%'
              }} />
              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <p style={{ margin: 0, fontSize: 14, color: '#64748b', fontWeight: 500 }}>Total Users</p>
                  <div style={{
                    width: 48,
                    height: 48,
                    background: '#3b82f6',
                    borderRadius: 10,
                    display: 'grid',
                    placeItems: 'center',
                    color: '#fff'
                  }}>
                    <Users size={24} />
                  </div>
                </div>
                <h2 style={{ margin: 0, fontSize: 36, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
                  {totalUsers}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>
                    Admin: {usersByRole.ADMIN} • Owner: {usersByRole.OWNER} • User: {usersByRole.USER}
                  </span>
                </div>
              </div>
            </div>

            <div style={{
              background: '#fff',
              borderRadius: 12,
              padding: 24,
              border: '1px solid #e2e8f0',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 100,
                height: 100,
                background: '#f59e0b22',
                borderRadius: '50%'
              }} />
              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <p style={{ margin: 0, fontSize: 14, color: '#64748b', fontWeight: 500 }}>Pending Requests</p>
                  <div style={{
                    width: 48,
                    height: 48,
                    background: '#f59e0b',
                    borderRadius: 10,
                    display: 'grid',
                    placeItems: 'center',
                    color: '#fff'
                  }}>
                    <Clock size={24} />
                  </div>
                </div>
                <h2 style={{ margin: 0, fontSize: 36, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
                  {pendingCount}
                </h2>
                <p style={{ margin: 0, fontSize: 12, color: '#f59e0b', fontWeight: 600 }}>
                  Action Needed
                </p>
              </div>
            </div>
          </div>
        )}

        {actionMsg && (
          <div style={{
            padding: 16,
            background: actionKind === 'success' ? '#d1fae5' : '#fee2e2',
            border: `1px solid ${actionKind === 'success' ? '#34d399' : '#f87171'}`,
            borderRadius: 10,
            marginBottom: 24,
            color: actionKind === 'success' ? '#065f46' : '#991b1b',
            fontSize: 14,
            fontWeight: 500
          }}>
            {actionMsg}
          </div>
        )}

        {activeView === 'users' ? (
          <UsersTable 
            users={displayUsers} 
            loading={loading} 
            error={error}
            onRefresh={refreshUsers}
            onDelete={deleteUser}
          />
        ) : (
          <UmkmTable 
            items={displayItems}
            loading={loading}
            error={error}
            title={getTableTitle()}
            onRefresh={refresh}
            onApprove={approve}
            onReject={reject}
            onEdit={openEditModal}
            onDelete={deleteUmkm}
            navigate={navigate}
            activeView={activeView}
          />
        )}
      </main>

      {editingUmkm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }} onClick={closeEditModal}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: 32,
            width: '90%',
            maxWidth: 600,
            maxHeight: '90vh',
            overflow: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: 24, fontWeight: 700, color: '#0f172a' }}>
              Edit UMKM
            </h2>
            
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500, color: '#475569' }}>
                Nama UMKM
              </label>
              <input
                type="text"
                value={editForm.nama_umkm}
                onChange={(e) => setEditForm({ ...editForm, nama_umkm: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  fontSize: 14,
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500, color: '#475569' }}>
                Deskripsi
              </label>
              <textarea
                value={editForm.deskripsi}
                onChange={(e) => setEditForm({ ...editForm, deskripsi: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  fontSize: 14,
                  outline: 'none',
                  minHeight: 100,
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500, color: '#475569' }}>
                Nomor Telepon
              </label>
              <input
                type="text"
                value={editForm.telpon}
                onChange={(e) => setEditForm({ ...editForm, telpon: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  fontSize: 14,
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500, color: '#475569' }}>
                Alamat
              </label>
              <textarea
                value={editForm.alamat}
                onChange={(e) => setEditForm({ ...editForm, alamat: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  fontSize: 14,
                  outline: 'none',
                  minHeight: 80,
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={closeEditModal}
                style={{
                  padding: '12px 24px',
                  border: '1px solid #e2e8f0',
                  background: '#fff',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#64748b',
                  cursor: 'pointer'
                }}
              >
                Batal
              </button>
              <button
                onClick={saveEdit}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <Save size={16} />
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function UmkmTable({ items, loading, error, title, onRefresh, onApprove, onReject, onEdit, onDelete, navigate, activeView }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      border: '1px solid #e2e8f0',
      overflow: 'hidden'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 24px',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#0f172a' }}>
          {title}
        </h3>
        <button
          onClick={onRefresh}
          disabled={loading}
          style={{
            padding: '8px 16px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            color: '#64748b',
            cursor: 'pointer'
          }}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
          Loading...
        </div>
      ) : error ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#ef4444' }}>
          {error}
        </div>
      ) : items.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
          {activeView === 'pending' ? 'Tidak ada UMKM yang menunggu verifikasi' : 
           activeView === 'verified' ? 'Belum ada UMKM terverifikasi' : 
           'Tidak ada data UMKM'}
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Shop Name</th>
              <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Owner Name</th>
              <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Address</th>
              <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '12px 24px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.umkm_id} style={{ 
                borderBottom: index < items.length - 1 ? '1px solid #f1f5f9' : 'none',
                transition: 'background 0.15s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#fafbfc'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: 8,
                      display: 'grid',
                      placeItems: 'center',
                      color: '#fff',
                      fontSize: 14,
                      fontWeight: 600
                    }}>
                      {item.nama_umkm?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                        {item.nama_umkm}
                      </p>
                      <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>
                        {item.kategori?.nama_kategori || 'Uncategorized'}
                      </p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '16px 24px', fontSize: 14, color: '#475569' }}>
                  {item.user?.name || item.user?.email || '-'}
                </td>
                <td style={{ padding: '16px 24px', fontSize: 14, color: '#475569', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.branches?.[0]?.alamat || 'No address'}
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: 12,
                    fontSize: 11,
                    fontWeight: 600,
                    background: item.status === 'APPROVED' ? '#d1fae5' : item.status === 'PENDING' ? '#fef3c7' : '#fee2e2',
                    color: item.status === 'APPROVED' ? '#065f46' : item.status === 'PENDING' ? '#92400e' : '#991b1b'
                  }}>
                    {item.status}
                  </span>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                    <button
                      onClick={() => navigate(`/umkm/${item.umkm_id}`)}
                      style={{
                        width: 36,
                        height: 36,
                        border: '1px solid #e2e8f0',
                        background: '#fff',
                        borderRadius: 8,
                        display: 'grid',
                        placeItems: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                      title="View Details"
                    >
                      <Eye size={18} color="#64748b" />
                    </button>
                    
                    {item.status === 'APPROVED' && (
                      <button
                        onClick={() => onEdit(item)}
                        style={{
                          width: 36,
                          height: 36,
                          border: '1px solid #dbeafe',
                          background: '#eff6ff',
                          borderRadius: 8,
                          display: 'grid',
                          placeItems: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                        title="Edit"
                      >
                        <Edit size={18} color="#3b82f6" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => onDelete(item.umkm_id)}
                      style={{
                        width: 36,
                        height: 36,
                        border: '1px solid #fee2e2',
                        background: '#fef2f2',
                        borderRadius: 8,
                        display: 'grid',
                        placeItems: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                      title="Delete UMKM"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#fee2e2'
                        e.currentTarget.style.borderColor = '#fca5a5'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#fef2f2'
                        e.currentTarget.style.borderColor = '#fee2e2'
                      }}
                    >
                      <Trash2 size={18} color="#ef4444" />
                    </button>
                    
                    {item.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => onReject(item.umkm_id)}
                          style={{
                            width: 36,
                            height: 36,
                            border: '1px solid #fee2e2',
                            background: '#fef2f2',
                            borderRadius: 8,
                            display: 'grid',
                            placeItems: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.15s'
                          }}
                          title="Reject"
                        >
                          <X size={18} color="#ef4444" />
                        </button>
                        <button
                          onClick={() => onApprove(item.umkm_id)}
                          style={{
                            width: 36,
                            height: 36,
                            border: '1px solid #d1fae5',
                            background: '#ecfdf5',
                            borderRadius: 8,
                            display: 'grid',
                            placeItems: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.15s'
                          }}
                          title="Approve"
                        >
                          <Check size={18} color="#10b981" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && !error && items.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          borderTop: '1px solid #e2e8f0',
          fontSize: 13,
          color: '#64748b'
        }}>
          <span>Showing {items.length} items</span>
        </div>
      )}
    </div>
  )
}

function UsersTable({ users, loading, error, onRefresh, onDelete }) {
  const getRoleBadgeColor = (role) => {
    switch(role?.toUpperCase()) {
      case 'ADMIN': return { bg: '#fef2f2', color: '#991b1b', border: '#fee2e2' }
      case 'OWNER': return { bg: '#eff6ff', color: '#1e40af', border: '#dbeafe' }
      case 'USER': return { bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' }
      default: return { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' }
    }
  }

  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      border: '1px solid #e2e8f0',
      overflow: 'hidden'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 24px',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#0f172a' }}>
          Daftar Users
        </h3>
        <button
          onClick={onRefresh}
          disabled={loading}
          style={{
            padding: '8px 16px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            color: '#64748b',
            cursor: 'pointer'
          }}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
          Loading users...
        </div>
      ) : error ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#ef4444' }}>
          {error}
        </div>
      ) : users.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
          Tidak ada data users
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Name</th>
              <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Email</th>
              <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Username</th>
              <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Role</th>
              <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Registered</th>
              <th style={{ padding: '12px 24px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, index) => {
              const roleColors = getRoleBadgeColor(u.role)
              return (
                <tr key={u.user_id} style={{ 
                  borderBottom: index < users.length - 1 ? '1px solid #f1f5f9' : 'none',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#fafbfc'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 40,
                        height: 40,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '50%',
                        display: 'grid',
                        placeItems: 'center',
                        color: '#fff',
                        fontSize: 14,
                        fontWeight: 600
                      }}>
                        {(u.name || u.email || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                          {u.name || '-'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: 14, color: '#475569' }}>
                    {u.email}
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: 14, color: '#475569' }}>
                    {u.username || '-'}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: 12,
                      fontSize: 11,
                      fontWeight: 600,
                      background: roleColors.bg,
                      color: roleColors.color,
                      border: `1px solid ${roleColors.border}`
                    }}>
                      {u.role || 'USER'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: 14, color: '#475569' }}>
                    {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                    {u.role?.toUpperCase() === 'ADMIN' ? (
                      <button
                        disabled
                        style={{
                          padding: '6px 12px',
                          borderRadius: 6,
                          border: '1px solid #e2e8f0',
                          background: '#f1f5f9',
                          color: '#94a3b8',
                          fontSize: 12,
                          fontWeight: 500,
                          cursor: 'not-allowed'
                        }}
                      >
                        Protected
                      </button>
                    ) : (
                      <button
                        onClick={() => onDelete(u.user_id, u.role)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 6,
                          border: '1px solid #fee2e2',
                          background: '#fef2f2',
                          color: '#dc2626',
                          fontSize: 12,
                          fontWeight: 500,
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#fee2e2'
                          e.currentTarget.style.borderColor = '#fca5a5'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#fef2f2'
                          e.currentTarget.style.borderColor = '#fee2e2'
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}

      {!loading && !error && users.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          borderTop: '1px solid #e2e8f0',
          fontSize: 13,
          color: '#64748b'
        }}>
          <span>Showing {users.length} users</span>
        </div>
      )}
    </div>
  )
}

function SidebarLink({ icon, label, active, badge, badgeColor, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: '12px 16px',
        marginBottom: 4,
        border: 'none',
        background: active ? '#f8fafc' : 'transparent',
        color: active ? '#667eea' : '#64748b',
        borderRadius: 10,
        fontSize: 14,
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.15s',
        textAlign: 'left',
        borderLeft: active ? '3px solid #667eea' : '3px solid transparent'
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = '#f8fafc'
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = 'transparent'
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {icon}
        <span>{label}</span>
      </div>
      {badge !== undefined && (
        <div style={{
          padding: '2px 8px',
          background: badgeColor || '#e2e8f0',
          color: badgeColor ? '#fff' : '#64748b',
          borderRadius: 12,
          fontSize: 11,
          fontWeight: 600
        }}>
          {badge}
        </div>
      )}
    </button>
  )
}