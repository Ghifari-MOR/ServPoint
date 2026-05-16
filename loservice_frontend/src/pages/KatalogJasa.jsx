import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import api from '../services/api'
import { 
  ArrowLeft, 
  Plus, 
  Clock, 
  DollarSign, 
  Edit, 
  Trash2,
  Save,
  X
} from 'lucide-react'

export default function KatalogJasa() {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const [umkm, setUmkm] = useState(null)
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [form, setForm] = useState({
    nama_service: '',
    deskripsi: '',
    harga_min: '',
    harga_max: '',
    estimasi_waktu: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Get UMKM
      const { data: umkmData } = await api.get('/umkm/')
      const myUmkm = umkmData[0]
      setUmkm(myUmkm)

      // Get Services
      if (myUmkm) {
        const { data: servicesData } = await api.get('/umkm-services/', {
          params: { umkm_id: myUmkm.umkm_id }
        })
        setServices(servicesData)
      }
    } catch (e) {
      console.error('Error fetching data:', e)
    } finally {
      setLoading(false)
    }
  }

  const openAddModal = () => {
    setEditingService(null)
    setForm({
      nama_service: '',
      deskripsi: '',
      harga_min: '',
      harga_max: '',
      estimasi_waktu: ''
    })
    setShowModal(true)
  }

  const openEditModal = (service) => {
    setEditingService(service)
    setForm({
      nama_service: service.nama_service,
      deskripsi: service.deskripsi,
      harga_min: service.harga_min || '',
      harga_max: service.harga_max || '',
      estimasi_waktu: service.estimasi_waktu || ''
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...form,
        umkm: umkm.umkm_id,
        harga_min: form.harga_min ? parseFloat(form.harga_min) : null,
        harga_max: form.harga_max ? parseFloat(form.harga_max) : null
      }

      if (editingService) {
        await api.patch(`/umkm-services/${editingService.service_id}/`, payload)
      } else {
        await api.post('/umkm-services/', payload)
      }

      setShowModal(false)
      fetchData()
    } catch (e) {
      console.error('Error saving service:', e)
      alert('Gagal menyimpan jasa: ' + (e.response?.data?.detail || 'Unknown error'))
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus jasa ini?')) return
    try {
      await api.delete(`/umkm-services/${id}/`)
      fetchData()
    } catch (e) {
      console.error('Error deleting service:', e)
    }
  }

  const formatPrice = (min, max) => {
    if (!min && !max) return '-'
    if (min && max) return `Rp ${parseInt(min).toLocaleString()} - ${parseInt(max).toLocaleString()}`
    if (min) return `Mulai Rp ${parseInt(min).toLocaleString()}`
    return `Rp ${parseInt(max).toLocaleString()}`
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    )
  }

  if (!umkm) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>UMKM tidak ditemukan</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px' }}>
      {/* Header */}
      <div style={{ maxWidth: 1200, margin: '0 auto', marginBottom: 32 }}>
        <button
          onClick={() => navigate('/owner')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            color: '#64748b',
            cursor: 'pointer',
            marginBottom: 24
          }}
        >
          <ArrowLeft size={18} />
          Kembali
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700, color: '#0f172a' }}>
              Katalog Jasa
            </h1>
            <p style={{ margin: '8px 0 0 0', color: '#64748b' }}>
              {umkm.nama_umkm}
            </p>
          </div>

          <button
            onClick={openAddModal}
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
            <Plus size={18} />
            Tambah Jasa
          </button>
        </div>
      </div>

      {/* Services Grid */}
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {services.length === 0 ? (
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: 60,
            textAlign: 'center',
            color: '#94a3b8'
          }}>
            <p style={{ margin: 0, fontSize: 16 }}>Belum ada jasa. Klik "Tambah Jasa" untuk memulai.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 20
          }}>
            {services.map(service => (
              <div key={service.service_id} style={{
                background: '#fff',
                borderRadius: 12,
                padding: 24,
                border: '1px solid #e2e8f0',
                position: 'relative'
              }}>
                {/* Service Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: 16,
                  paddingBottom: 16,
                  borderBottom: '1px solid #f1f5f9'
                }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    background: 'linear-gradient(135deg, #3b82f622 0%, #1e40af22 100%)',
                    borderRadius: 10,
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: 20
                  }}>
                    🛠️
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#0f172a' }}>
                      {service.nama_service}
                    </h3>
                  </div>
                </div>

                {/* Description */}
                <p style={{
                  margin: '0 0 16px 0',
                  fontSize: 14,
                  color: '#64748b',
                  lineHeight: 1.6
                }}>
                  {service.deskripsi}
                </p>

                {/* Price */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 12,
                  padding: '8px 12px',
                  background: '#f8fafc',
                  borderRadius: 8
                }}>
                  <DollarSign size={16} color="#10b981" />
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
                    {formatPrice(service.harga_min, service.harga_max)}
                  </span>
                </div>

                {/* Estimasi Waktu */}
                {service.estimasi_waktu && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 16,
                    padding: '8px 12px',
                    background: '#fef3c7',
                    borderRadius: 8
                  }}>
                    <Clock size={16} color="#f59e0b" />
                    <span style={{ fontSize: 13, color: '#92400e' }}>
                      Est. {service.estimasi_waktu}
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => openEditModal(service)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      background: '#eff6ff',
                      border: '1px solid #dbeafe',
                      borderRadius: 6,
                      color: '#3b82f6',
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                  >
                    <Edit size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(service.service_id)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      background: '#fef2f2',
                      border: '1px solid #fee2e2',
                      borderRadius: 6,
                      color: '#ef4444',
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}
                  >
                    <Trash2 size={14} />
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Add/Edit */}
      {showModal && (
        <div
          style={{
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
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: 32,
              width: '90%',
              maxWidth: 600,
              maxHeight: '90vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ margin: '0 0 24px 0', fontSize: 24, fontWeight: 700, color: '#0f172a' }}>
              {editingService ? 'Edit Jasa' : 'Tambah Jasa Baru'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500, color: '#475569' }}>
                  Nama Jasa *
                </label>
                <input
                  type="text"
                  value={form.nama_service}
                  onChange={(e) => setForm({ ...form, nama_service: e.target.value })}
                  required
                  placeholder="Contoh: Ganti LCD Laptop"
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
                  Deskripsi *
                </label>
                <textarea
                  value={form.deskripsi}
                  onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  required
                  placeholder="Jelaskan detail jasa yang ditawarkan..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    fontSize: 14,
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500, color: '#475569' }}>
                    Harga Minimum
                  </label>
                  <input
                    type="number"
                    value={form.harga_min}
                    onChange={(e) => setForm({ ...form, harga_min: e.target.value })}
                    placeholder="50000"
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

                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500, color: '#475569' }}>
                    Harga Maximum
                  </label>
                  <input
                    type="number"
                    value={form.harga_max}
                    onChange={(e) => setForm({ ...form, harga_max: e.target.value })}
                    placeholder="75000"
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
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500, color: '#475569' }}>
                  Estimasi Waktu
                </label>
                <input
                  type="text"
                  value={form.estimasi_waktu}
                  onChange={(e) => setForm({ ...form, estimasi_waktu: e.target.value })}
                  placeholder="Contoh: 60 Menit, 1-2 Jam, Est. 45 Menit"
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

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '12px 24px',
                    border: '1px solid #e2e8f0',
                    background: '#fff',
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 500,
                    color: '#64748b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <X size={16} />
                  Batal
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '12px 24px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
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
            </form>
          </div>
        </div>
      )}
    </div>
  )
}