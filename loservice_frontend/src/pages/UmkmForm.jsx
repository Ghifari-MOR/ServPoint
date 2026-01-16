import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { MapPin, Check, ExternalLink } from 'lucide-react'
import api from '../services/api'

export default function UmkmForm() {
  const { user } = useContext(AuthContext)
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [gettingLocation, setGettingLocation] = useState(false)
  const [locationSuccess, setLocationSuccess] = useState(false)
  const [showManualInput, setShowManualInput] = useState(false)
  const [form, setForm] = useState({
    name: '',
    address: '',
    category: '',
    description: '',
    contact: '',
    latitude: '',
    longitude: '',
    jam_buka: '08:00',
    jam_tutup: '20:00',
    hari_operasional: 'Senin - Sabtu',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Browser Anda tidak mendukung GPS')
      return
    }

    setGettingLocation(true)
    setError('')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        setForm((prev) => ({
          ...prev,
          latitude: String(lat),
          longitude: String(lng),
        }))
        setLocationSuccess(true)
        setGettingLocation(false)
      },
      (err) => {
        setGettingLocation(false)
        if (err.code === 1) {
          setError('Akses lokasi ditolak. Silakan izinkan akses lokasi di browser.')
        } else if (err.code === 2) {
          setError('Lokasi tidak tersedia. Pastikan GPS aktif.')
        } else {
          setError('Gagal mendapatkan lokasi. Coba lagi.')
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    console.log('=== FORM SUBMIT START ===')
    console.log('Form data:', form)
    
    // Validasi semua field required
    if (!form.name.trim()) {
      setError('Nama UMKM harus diisi')
      alert('Nama UMKM harus diisi')
      return
    }
    
    if (!form.address.trim()) {
      setError('Alamat harus diisi')
      alert('Alamat harus diisi')
      return
    }
    
    if (!form.category.trim()) {
      setError('Kategori harus diisi')
      alert('Kategori harus diisi')
      return
    }
    
    if (!form.description.trim()) {
      setError('Deskripsi harus diisi')
      alert('Deskripsi harus diisi')
      return
    }
    
    if (!form.contact.trim()) {
      setError('Kontak harus diisi')
      alert('Kontak harus diisi')
      return
    }
    
    if (!form.jam_buka.trim()) {
      setError('Jam buka harus diisi')
      alert('Jam buka harus diisi')
      return
    }
    
    if (!form.jam_tutup.trim()) {
      setError('Jam tutup harus diisi')
      alert('Jam tutup harus diisi')
      return
    }
    
    if (!form.hari_operasional.trim()) {
      setError('Hari operasional harus diisi')
      alert('Hari operasional harus diisi')
      return
    }
    
    if (!form.latitude || !form.longitude) {
      setError('Lokasi harus diisi. Gunakan GPS atau input manual.')
      alert('Lokasi harus diisi. Klik tombol "Lokasi Berkali Didapat!" terlebih dahulu!')
      return
    }
    
    setSubmitting(true)

    try {
      // Validasi data
      const lat = parseFloat(form.latitude)
      const lng = parseFloat(form.longitude)
      
      if (isNaN(lat) || isNaN(lng)) {
        setError('Koordinat tidak valid. Gunakan GPS atau input manual dengan benar.')
        alert('Koordinat tidak valid!')
        setSubmitting(false)
        return
      }

      const payload = {
        name: form.name.trim(),
        address: form.address.trim(),
        category: form.category.trim(),
        description: form.description.trim(),
        contact: form.contact.trim(),
        maps_url: `https://www.google.com/maps?q=${lat},${lng}`,
        latitude: lat,
        longitude: lng,
        jam_buka: form.jam_buka.trim(),
        jam_tutup: form.jam_tutup.trim(),
        hari_operasional: form.hari_operasional.trim(),
      }

      console.log('=== SENDING TO BACKEND ===')
      console.log('Payload:', payload)

      const response = await api.post('/umkm/', payload)
      
      console.log('=== BACKEND SUCCESS ===')
      console.log('Response:', response.data)
      console.log('Status:', response.status)
      
      alert('UMKM berhasil didaftarkan! Redirecting to owner page...')
      
      // Gunakan setTimeout untuk memastikan alert dibaca
      setTimeout(() => {
        console.log('=== REDIRECTING NOW ===')
        window.location.href = '/owner?success=true&message=' + encodeURIComponent('UMKM berhasil didaftarkan! Menunggu verifikasi admin.')
      }, 500)
      
    } catch (e2) {
      console.error('=== ERROR OCCURRED ===')
      console.error('Full error:', e2)
      console.error('Response:', e2?.response)
      console.error('Response data:', e2?.response?.data)
      console.error('Response status:', e2?.response?.status)
      
      const data = e2?.response?.data
      let errorMsg = ''
      
      if (data?.detail) {
        errorMsg = `Error: ${data.detail}`
      } else if (typeof data === 'string') {
        errorMsg = `Error: ${data}`
      } else if (data && typeof data === 'object') {
        const parts = Object.entries(data).flatMap(([field, msgs]) => {
          const arr = Array.isArray(msgs) ? msgs : [msgs]
          return arr.map((m) => `${field}: ${String(m)}`)
        })
        errorMsg = parts.join(' | ') || 'Gagal mendaftarkan UMKM. Cek console untuk detail.'
      } else {
        errorMsg = `Gagal mendaftarkan UMKM (Status: ${e2?.response?.status}). Periksa backend log.`
      }
      
      setError(errorMsg)
      alert('GAGAL: ' + errorMsg)
      setSubmitting(false)
    }
  }

  const getMapsUrl = () => {
    if (form.latitude && form.longitude) {
      return `https://www.google.com/maps?q=${form.latitude},${form.longitude}`
    }
    return '#'
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: 600,
        width: '100%',
        background: '#fff',
        borderRadius: 20,
        boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
        padding: '48px 40px'
      }}>
        {/* Logo & Header */}
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
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
            color: '#1e293b',
            margin: '0 0 8px'
          }}>
            Daftarkan UMKM Anda
          </h1>
          <p style={{
            fontSize: 14,
            color: '#64748b',
            lineHeight: 1.6,
            margin: 0
          }}>
            Lengkapi data UMKM secara lengkap dan akurat untuk dicatat di sistem ServPoint.
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '2px solid #e2e8f0',
          marginBottom: 32
        }}>
          <div style={{
            padding: '12px 24px',
            fontSize: 14,
            fontWeight: 600,
            color: '#64748b',
            cursor: 'pointer',
            borderBottom: '2px solid transparent',
            marginBottom: -2
          }}>
            DATA UMKM
          </div>
          <div style={{
            padding: '12px 24px',
            fontSize: 14,
            fontWeight: 600,
            color: '#4f46e5',
            cursor: 'pointer',
            borderBottom: '2px solid #4f46e5',
            marginBottom: -2
          }}>
            Form Pendaftaran
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '12px 16px',
            borderRadius: 10,
            fontSize: 14,
            marginBottom: 24
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Nama UMKM */}
          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'block',
              fontSize: 14,
              fontWeight: 600,
              color: '#1e293b',
              marginBottom: 8
            }}>
              Nama UMKM
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Masukkan nama usaha Anda"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                fontSize: 14,
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Alamat Lengkap */}
          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'block',
              fontSize: 14,
              fontWeight: 600,
              color: '#1e293b',
              marginBottom: 8
            }}>
              Alamat Lengkap
            </label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              required
              placeholder="Masukkan alamat lengkap lokasi usaha"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                fontSize: 14,
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Kategori */}
          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'block',
              fontSize: 14,
              fontWeight: 600,
              color: '#1e293b',
              marginBottom: 8
            }}>
              Kategori
            </label>
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              placeholder="Kuliner / Fashion / Jasa"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                fontSize: 14,
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Deskripsi Singkat */}
          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'block',
              fontSize: 14,
              fontWeight: 600,
              color: '#1e293b',
              marginBottom: 8
            }}>
              Deskripsi Singkat
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              placeholder="Ceritakan UMKM Anda"
              rows={3}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                fontSize: 14,
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Kontak */}
          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'block',
              fontSize: 14,
              fontWeight: 600,
              color: '#1e293b',
              marginBottom: 8
            }}>
              Kontak (Whatsapp / Email)
            </label>
            <input
              name="contact"
              value={form.contact}
              onChange={handleChange}
              required
              placeholder="No. WA / email"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                fontSize: 14,
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Jam Operasional */}
          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'block',
              fontSize: 14,
              fontWeight: 600,
              color: '#1e293b',
              marginBottom: 8
            }}>
              Jam Operasional
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: '#64748b', marginBottom: 4, display: 'block' }}>
                  Jam Buka
                </label>
                <input
                  type="time"
                  name="jam_buka"
                  value={form.jam_buka}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    fontSize: 14,
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#64748b', marginBottom: 4, display: 'block' }}>
                  Jam Tutup
                </label>
                <input
                  type="time"
                  name="jam_tutup"
                  value={form.jam_tutup}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                    fontSize: 14,
                    outline: 'none',
                    transition: 'all 0.2s',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Hari Operasional */}
          <div style={{ marginBottom: 32 }}>
            <label style={{
              display: 'block',
              fontSize: 14,
              fontWeight: 600,
              color: '#1e293b',
              marginBottom: 8
            }}>
              Hari Operasional
            </label>
            <select
              name="hari_operasional"
              value={form.hari_operasional}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                fontSize: 14,
                outline: 'none',
                transition: 'all 0.2s',
                boxSizing: 'border-box',
                background: 'white'
              }}
            >
              <option value="Senin - Minggu">Senin - Minggu (Buka Setiap Hari)</option>
              <option value="Senin - Sabtu">Senin - Sabtu</option>
              <option value="Senin - Jumat">Senin - Jumat</option>
              <option value="Sabtu - Minggu">Sabtu - Minggu (Weekend Only)</option>
            </select>
          </div>

          {/* Lokasi UMKM Section */}
          <div style={{
            background: '#f8f9fa',
            padding: 24,
            borderRadius: 12,
            marginBottom: 32
          }}>
            <h3 style={{
              fontSize: 16,
              fontWeight: 600,
              color: '#1e293b',
              margin: '0 0 16px'
            }}>
              Lokasi UMKM
            </h3>

            {/* Map Preview */}
            {form.latitude && form.longitude ? (
              <div style={{
                background: '#e2e8f0',
                borderRadius: 8,
                height: 200,
                marginBottom: 16,
                position: 'relative',
                overflow: 'hidden'
              }}>
                <iframe
                  src={`https://www.google.com/maps?q=${form.latitude},${form.longitude}&output=embed`}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none'
                  }}
                  loading="lazy"
                />
              </div>
            ) : (
              <div style={{
                background: '#e2e8f0',
                borderRadius: 8,
                height: 200,
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b',
                fontSize: 14
              }}>
                <MapPin size={24} style={{ marginRight: 8 }} />
                Lokasi belum diatur
              </div>
            )}

            {/* Get Location Button */}
            {!locationSuccess ? (
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={gettingLocation}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: gettingLocation ? '#a5b4fc' : '#10b981',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: gettingLocation ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  marginBottom: 12
                }}
              >
                <MapPin size={18} />
                {gettingLocation ? 'Mendapatkan lokasi...' : 'Lokasi Berkali Didapat!'}
              </button>
            ) : (
              <div style={{
                background: '#d1fae5',
                border: '1px solid #10b981',
                borderRadius: 8,
                padding: '12px 16px',
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <Check size={18} style={{ color: '#10b981' }} />
                <span style={{ fontSize: 14, color: '#065f46', fontWeight: 500 }}>
                  Lokasi berhasil didapat!
                </span>
              </div>
            )}

            {/* Location Info */}
            {form.latitude && form.longitude && (
              <>
                <p style={{
                  fontSize: 13,
                  color: '#475569',
                  margin: '0 0 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <Check size={16} style={{ color: '#10b981' }} />
                  Lokasi saat ini: Akurat (GPS: {form.latitude}, {form.longitude})
                </p>

                <div style={{
                  background: '#fff',
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 12
                }}>
                  <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>
                    Koordinat Terdeteksi:
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 13 }}>
                    <div>
                      <span style={{ color: '#64748b' }}>Latitude:</span>{' '}
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{form.latitude}</span>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Longitude:</span>{' '}
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{form.longitude}</span>
                    </div>
                  </div>
                </div>

                <a
                  href={getMapsUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    color: '#4f46e5',
                    fontSize: 13,
                    fontWeight: 500,
                    textDecoration: 'none',
                    marginBottom: 8
                  }}
                >
                  <ExternalLink size={14} />
                  Lihat di Google Maps
                </a>
              </>
            )}

            {/* Manual Input Toggle */}
            <div style={{ marginTop: 12 }}>
              <button
                type="button"
                onClick={() => setShowManualInput(!showManualInput)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#4f46e5',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline'
                }}
              >
                Atur lokasi secara manual
              </button>

              {showManualInput && (
                <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: 13,
                      fontWeight: 500,
                      color: '#475569',
                      marginBottom: 6
                    }}>
                      Latitude
                    </label>
                    <input
                      name="latitude"
                      type="number"
                      step="any"
                      value={form.latitude}
                      onChange={handleChange}
                      placeholder="-6.200000"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: 6,
                        fontSize: 13,
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: 13,
                      fontWeight: 500,
                      color: '#475569',
                      marginBottom: 6
                    }}>
                      Longitude
                    </label>
                    <input
                      name="longitude"
                      type="number"
                      step="any"
                      value={form.longitude}
                      onChange={handleChange}
                      placeholder="106.816666"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: 6,
                        fontSize: 13,
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '14px',
              background: submitting ? '#a5b4fc' : '#4f46e5',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {submitting ? 'Memproses...' : 'Daftarkan UMKM'}
          </button>
        </form>

        {/* Footer */}
        <p style={{
          textAlign: 'center',
          marginTop: 24,
          fontSize: 12,
          color: '#94a3b8'
        }}>
          © 2024 ServPoint. All rights reserved.
        </p>
      </div>
    </div>
  )
}
