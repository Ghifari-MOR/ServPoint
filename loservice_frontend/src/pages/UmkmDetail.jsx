import { useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { Reply } from 'lucide-react'
import api from '../services/api'

// Dummy data untuk reviews dan gallery (sampai API tersedia)
const dummyReviews = [
  { id: 1, name: 'Ahmad Fauzi', role: 'Mahasiswa TI 2023', date: '2 Hari yang lalu', rating: 5, text: 'Pelayanan cepat banget, pagi taruh laptop sore udah kelar ganti keyboard. Mantep ramah banget buat anak S1T NF ada diskon! Recommended parah.' },
  { id: 2, name: 'Siti Nurhaliza', role: 'Mahasiswa SI 2022', date: '1 Minggu yang lalu', rating: 4, text: 'Tempatnya nyaman dan strategis dekat kampus. Harganya standar mahasiswa lah. Cuma antrinya lumayan kalau siang.' },
]

const dummyGallery = [
  'https://placehold.co/600x400/1e293b/e2e8f0?text=Toko+1',
  'https://placehold.co/600x400/1e293b/e2e8f0?text=Toko+2',
  'https://placehold.co/600x400/1e293b/e2e8f0?text=Toko+3',
  'https://placehold.co/600x400/1e293b/e2e8f0?text=Toko+4',
]

// Render star rating - moved outside component to avoid recreation
const renderStars = (rating) => {
  return Array.from({ length: 5 }, (_, i) => (
    <span key={i} style={{ color: i < rating ? '#fbbf24' : '#475569' }}>★</span>
  ))
}

// Helper function untuk format harga
const formatPrice = (min, max) => {
  if (!min && !max) return '-'
  if (min && max) return `Rp ${parseInt(min).toLocaleString()} - Rp ${parseInt(max).toLocaleString()}`
  if (min) return `Mulai Rp ${parseInt(min).toLocaleString()}`
  return `Rp ${parseInt(max).toLocaleString()}`
}

export default function UmkmDetail() {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const { id } = useParams()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [umkm, setUmkm] = useState(null)
  const [activeImage, setActiveImage] = useState(0)
  
  // State untuk data real dari backend
  const [services, setServices] = useState([])
  const [products, setProducts] = useState([])
  const [servicesLoading, setServicesLoading] = useState(false)
  const [productsLoading, setProductsLoading] = useState(false)
  // Gallery (REAL DATA)
  const [gallery, setGallery] = useState([])
  const [galleryLoading, setGalleryLoading] = useState(false)
  // Reviews (REAL DATA)
  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [reviewError, setReviewError] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState('')

  const handleLogout = useCallback(() => {
    if (window.confirm('Apakah Anda yakin ingin logout?')) {
      const backendLoginUrl = 'http://127.0.0.1:8000/admin/login/'
      logout()
      if (user?.role === 'ADMIN') {
        window.location.replace(backendLoginUrl)
      } else {
        navigate('/login')
      }
    }
  }, [logout, user?.role, navigate])

  useEffect(() => {
    let active = true
    const fetchDetail = async () => {
      setLoading(true)
      setError('')
      try {
        const { data } = await api.get(`/umkm/${id}/`)
        if (active) {
          setUmkm(data)
          
          // Fetch services untuk UMKM ini
          setServicesLoading(true)
          try {
            const { data: servicesData } = await api.get('/umkm-services/', {
              params: { umkm_id: id }
            })
            if (active) {
              const servicesArray = Array.isArray(servicesData) ? servicesData : []
              setServices(servicesArray)
            }
          } catch (e) {
            console.error('Error fetching services:', e?.response?.data || e.message)
            if (active) setServices([])
          } finally {
            if (active) setServicesLoading(false)
          }

          // Fetch products untuk UMKM ini
          setProductsLoading(true)
          try {
            const { data: productsData } = await api.get('/umkm-products/', {
              params: { umkm_id: id }
            })
            if (active) {
              const productsArray = Array.isArray(productsData) ? productsData : []
              setProducts(productsArray)
            }
          } catch (e) {
            console.error('Error fetching products:', e?.response?.data || e.message)
            if (active) setProducts([])
          } finally {
            if (active) setProductsLoading(false)
          }

          // Fetch gallery untuk UMKM ini
          setGalleryLoading(true)
          try {
            const { data: galleryData } = await api.get('/umkm-gallery/', {
              params: { umkm_id: id }
            })
            if (active) {
              const galleryArray = Array.isArray(galleryData) ? galleryData : []
              setGallery(galleryArray)
            }
          } catch (e) {
            console.error('Error fetching gallery:', e?.response?.data || e.message)
            if (active) setGallery([])
          } finally {
            if (active) setGalleryLoading(false)
          }

          // Fetch reviews untuk UMKM ini
          setReviewsLoading(true)
          try {
            const { data: reviewsData } = await api.get('/umkm-reviews/', {
              params: { umkm_id: id }
            })
            if (active) setReviews(Array.isArray(reviewsData) ? reviewsData : [])
          } catch (e) {
            console.error('Error fetching reviews:', e)
            if (active) setReviews([])
          } finally {
            if (active) setReviewsLoading(false)
          }
        }
      } catch (e) {
        if (active) setError(e?.response?.data?.detail || 'Gagal memuat detail UMKM')
      } finally {
        if (active) setLoading(false)
      }
    }

    if (id) fetchDetail()
    return () => {
      active = false
    }
  }, [id])

  const title = useMemo(() => umkm?.nama_umkm || 'Detail UMKM', [umkm])

  const verifiedStatus = useMemo(() => {
    const s = String(umkm?.status || '').toUpperCase()
    return s === 'APPROVED'
  }, [umkm])

  const mapsUrl = useMemo(() => {
    const firstBranch = Array.isArray(umkm?.branches) ? umkm.branches[0] : null
    if (firstBranch?.geom?.coordinates && Array.isArray(firstBranch.geom.coordinates)) {
      const [lng, lat] = firstBranch.geom.coordinates
      // Open Google Maps with directions from user's current location
      return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    }
    return ''
  }, [umkm])

  const mapsEmbedUrl = useMemo(() => {
    const firstBranch = Array.isArray(umkm?.branches) ? umkm.branches[0] : null
    if (firstBranch?.geom?.coordinates && Array.isArray(firstBranch.geom.coordinates)) {
      const [lng, lat] = firstBranch.geom.coordinates
      // Embed map view
      return `https://maps.google.com/maps?q=${lat},${lng}&hl=id&z=15&output=embed`
    }
    return ''
  }, [umkm])

  const firstBranch = useMemo(() => {
    return Array.isArray(umkm?.branches) ? umkm.branches[0] : null
  }, [umkm])

  const whatsappUrl = useMemo(() => {
    const phone = umkm?.telpon?.replace(/\D/g, '')
    if (phone) {
      const formatted = phone.startsWith('0') ? '62' + phone.slice(1) : phone
      // Template pesan otomatis
      const message = encodeURIComponent(
        `Halo ${umkm?.nama_umkm || 'Admin'},\n\nSaya ingin bertanya tentang layanan service. Saya melihat informasi dari aplikasi ServPoint.\n\nTerima kasih!`
      )
      return `https://wa.me/${formatted}?text=${message}`
    }
    return ''
  }, [umkm])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8fafc' }}>
        <p>Memuat...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f8fafc' }}>
        <p>{error}</p>
      </div>
    )
  }

  if (!umkm) {
    return null
  }

  return (
    <div className="umkm-detail-page">
      {/* Simplified Header */}
      <header className="umkm-header">
        <button className="back-btn" onClick={() => navigate(-1)}>← Kembali</button>
        <div className="header-user">
          <span>{user?.name || user?.email}</span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main className="umkm-detail-main">
        {/* Breadcrumb */}
        <nav className="umkm-breadcrumb">
          <span onClick={() => navigate('/')}>Home</span>
          <span>/</span>
          <span onClick={() => navigate('/user/map')}>Search</span>
          <span>/</span>
          <span className="active">{title}</span>
        </nav>

        <div className="umkm-detail-grid">
          {/* Left Column */}
          <div className="umkm-left-col">
            {/* Image Gallery */}
            <section className="umkm-gallery">
              {galleryLoading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', background: '#1e293b', borderRadius: '12px' }}>
                  Memuat foto...
                </div>
              ) : gallery.length === 0 ? (
                <div style={{ padding: '60px 40px', textAlign: 'center', color: '#94a3b8', background: '#1e293b', borderRadius: '12px' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '48px' }}>📷</p>
                  <p style={{ margin: 0, fontSize: '14px' }}>Belum ada foto yang ditambahkan</p>
                </div>
              ) : (
                <>
                  <div className="gallery-main">
                    <img 
                      src={gallery[activeImage]?.image_url || dummyGallery[0]} 
                      alt={title}
                      loading="lazy"
                    />
                    <span className="photo-count">📷 {gallery.length} Foto</span>
                  </div>
                  <div className="gallery-thumbs">
                    {gallery.slice(0, 4).map((img, idx) => (
                      <div 
                        key={img.gallery_id || idx} 
                        className={`thumb ${activeImage === idx ? 'active' : ''}`}
                        onClick={() => setActiveImage(idx)}
                      >
                        <img src={img.image_url || dummyGallery[0]} alt={`Thumb ${idx + 1}`} loading="lazy" />
                      </div>
                    ))}
                    {gallery.length > 4 && (
                      <div className="thumb more">
                        +{gallery.length - 4} Lainnya
                      </div>
                    )}
                  </div>
                </>
              )}
            </section>

            {/* Katalog Jasa - REAL DATA */}
            <section className="umkm-section">
              <div className="section-header">
                <h2>Katalog Jasa</h2>
                {services.length > 3 && (
                  <a href="#" className="link-blue">Lihat Semua</a>
                )}
              </div>
              {servicesLoading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                  Memuat jasa...
                </div>
              ) : services.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                  Belum ada katalog jasa tersedia
                </div>
              ) : (
                <div className="service-list">
                  {services.map((service) => (
                    <div key={service.service_id} className="service-item">
                      <div className="service-icon">🛠️</div>
                      <div className="service-info">
                        <h4>{service.nama_service}</h4>
                        <p>{service.deskripsi}</p>
                      </div>
                      <div className="service-price">
                        <span className="price">{formatPrice(service.harga_min, service.harga_max)}</span>
                        {service.estimasi_waktu && (
                          <span className="time">Est. {service.estimasi_waktu}</span>
                        )}
                      </div>
                      <span className="arrow">›</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Produk Tersedia - REAL DATA */}
            <section className="umkm-section">
              <div className="section-header">
                <h2>Produk Tersedia</h2>
                {products.length > 3 && (
                  <div className="header-actions">
                    <span className="icon-btn">←</span>
                    <span className="icon-btn">→</span>
                  </div>
                )}
              </div>
              {productsLoading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                  Memuat produk...
                </div>
              ) : products.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                  Belum ada produk tersedia
                </div>
              ) : (
                <div className="product-grid">
                  {products.map((product) => (
                    <div key={product.product_id} className="product-card">
                      <img 
                        src={product.image_url || 'https://placehold.co/120x120/1e293b/e2e8f0?text=Product'} 
                        alt={product.nama_produk} 
                        loading="lazy" 
                      />
                      <h4>{product.nama_produk}</h4>
                      <p className="product-price">Rp {parseInt(product.harga).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Ulasan Terbaru */}
            <section className="umkm-section">
              <div className="section-header">
                <h2>Ulasan Terbaru <span className="count">({reviews.length})</span></h2>
                <button 
                  onClick={() => setShowReviewForm(!showReviewForm)} 
                  className="link-blue"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit' }}
                >
                  {showReviewForm ? 'Batal' : 'Tulis Ulasan'}
                </button>
              </div>

              {/* Form Ulasan */}
              {showReviewForm && (
                <div className="review-form" style={{
                  background: '#f8fafc',
                  padding: '20px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  border: '1px solid #e2e8f0'
                }}>
                  <h3 style={{ marginBottom: '15px', fontSize: '16px', fontWeight: '600' }}>Tulis Ulasan Anda</h3>
                  
                  {reviewError && (
                    <div style={{ 
                      background: '#fee2e2', 
                      color: '#991b1b', 
                      padding: '10px', 
                      borderRadius: '6px', 
                      marginBottom: '15px',
                      fontSize: '14px'
                    }}>
                      {reviewError}
                    </div>
                  )}
                  
                  {reviewSuccess && (
                    <div style={{ 
                      background: '#d1fae5', 
                      color: '#065f46', 
                      padding: '10px', 
                      borderRadius: '6px', 
                      marginBottom: '15px',
                      fontSize: '14px'
                    }}>
                      {reviewSuccess}
                    </div>
                  )}

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
                      Rating
                    </label>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '28px',
                            cursor: 'pointer',
                            color: star <= reviewForm.rating ? '#fbbf24' : '#cbd5e1',
                            padding: '0 2px'
                          }}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>
                      Ulasan
                    </label>
                    <textarea
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      placeholder="Bagikan pengalaman Anda dengan UMKM ini..."
                      rows={4}
                      style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  <button
                    onClick={async () => {
                      if (!reviewForm.comment.trim()) {
                        setReviewError('Mohon tulis ulasan Anda')
                        return
                      }
                      
                      setReviewSubmitting(true)
                      setReviewError('')
                      setReviewSuccess('')
                      
                      try {
                        await api.post('/umkm-reviews/', {
                          umkm: id,
                          rating: reviewForm.rating,
                          comment: reviewForm.comment
                        })
                        
                        setReviewSuccess('Ulasan berhasil dikirim! Terima kasih atas ulasan Anda.')
                        setReviewForm({ rating: 5, comment: '' })
                        
                        // Refresh reviews
                        const { data: reviewsData } = await api.get('/umkm-reviews/', {
                          params: { umkm_id: id }
                        })
                        setReviews(Array.isArray(reviewsData) ? reviewsData : [])
                        
                        // Hide form after 2 seconds
                        setTimeout(() => {
                          setShowReviewForm(false)
                          setReviewSuccess('')
                        }, 2000)
                      } catch (e) {
                        setReviewError(e?.response?.data?.detail || 'Gagal mengirim ulasan')
                      } finally {
                        setReviewSubmitting(false)
                      }
                    }}
                    disabled={reviewSubmitting}
                    style={{
                      background: reviewSubmitting ? '#94a3b8' : '#3b82f6',
                      color: 'white',
                      padding: '10px 24px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: reviewSubmitting ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    {reviewSubmitting ? 'Mengirim...' : 'Kirim Ulasan'}
                  </button>
                </div>
              )}

              {/* List Ulasan */}
              {reviewsLoading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                  Memuat ulasan...
                </div>
              ) : reviews.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                  Belum ada ulasan. Jadilah yang pertama memberi ulasan!
                </div>
              ) : (
                <>
                  <div className="review-list">
                    {reviews.map((review) => (
                      <div key={review.review_id} className="review-item">
                        <div className="review-avatar">
                          {(review.user?.name || review.user?.email || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="review-content">
                          <div className="review-header">
                            <div>
                              <h4>{review.user?.name || review.user?.email || 'User'}</h4>
                              <p className="role">{review.user?.role || 'User'}</p>
                            </div>
                            <span className="date">
                              {new Date(review.created_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          <div className="review-rating">
                            {renderStars(review.rating)}
                          </div>
                          <p className="review-text">"{review.comment}"</p>
                          
                          {/* Owner Reply */}
                          {review.reply && (
                            <div style={{
                              marginTop: '12px',
                              padding: '12px',
                              background: '#f8fafc',
                              borderLeft: '3px solid #4f46e5',
                              borderRadius: '6px'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                <Reply size={14} color="#4f46e5" />
                                <p style={{ 
                                  margin: 0, 
                                  fontSize: '12px', 
                                  fontWeight: 600, 
                                  color: '#4f46e5' 
                                }}>
                                  Balasan Owner
                                  {review.reply_at && ` • ${new Date(review.reply_at).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                  })}`}
                                </p>
                              </div>
                              <p style={{ 
                                margin: 0, 
                                fontSize: '13px', 
                                color: '#475569', 
                                lineHeight: 1.5 
                              }}>
                                {review.reply}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {reviews.length > 5 && (
                    <button 
                      onClick={() => {/* Implementasi show more */}}
                      className="view-all-link"
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Lihat semua {reviews.length} ulasan
                    </button>
                  )}
                </>
              )}
            </section>
          </div>

          {/* Right Column - Sticky Info */}
          <div className="umkm-right-col">
            <div className="umkm-info-card">
              {/* Title & Rating */}
              <div className="info-header">
                <h1>{title}</h1>
                <div className="info-meta">
                  {verifiedStatus && (
                    <span className="verified-badge">✓ Verified Partner</span>
                  )}
                  <span className="rating">
                    <span className="star">★</span> 
                    {reviews.length > 0 
                      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                      : '0.0'
                    } 
                    <span className="count">({reviews.length} Reviews)</span>
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="info-desc">{umkm.deskripsi}</p>

              {/* Tags */}
              <div className="info-tags">
                <span className="tag">{umkm?.kategori?.nama_kategori || 'Laptop Service'}</span>
                {services.length > 0 && <span className="tag">{services.length} Jasa</span>}
                {products.length > 0 && <span className="tag">{products.length} Produk</span>}
              </div>

              {/* Location & Contact */}
              <div className="location-section">
                <div className="section-header small">
                  <h3>Lokasi & Kontak</h3>
                </div>

                {/* Mini Map */}
                {mapsEmbedUrl ? (
                  <div style={{ position: 'relative', marginBottom: '16px' }}>
                    <div className="mini-map">
                      <iframe 
                        src={mapsEmbedUrl}
                        title="Location Map"
                        loading="lazy"
                        style={{
                          width: '100%',
                          height: '100%',
                          border: 'none'
                        }}
                      />
                    </div>
                    {mapsUrl && (
                      <a 
                        href={mapsUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: 'white',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#4f46e5',
                          textDecoration: 'none',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        🗺️ Buka Sekarang
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="mini-map" style={{
                    background: '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#64748b',
                    marginBottom: '16px'
                  }}>
                    <p>📍 Lokasi belum tersedia</p>
                  </div>
                )}

                <div className="contact-info">
                  <div className="contact-item">
                    <span className="icon">📍</span>
                    <div>
                      <p>{firstBranch?.alamat || 'Alamat tidak tersedia'}</p>
                    </div>
                  </div>
                  <div className="contact-item">
                    <span className="icon">🕐</span>
                    <div>
                      <p><strong>08:00 - 20:00 WIB</strong></p>
                      <p className="sub">Senin - Sabtu</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="action-buttons">
                  {whatsappUrl && (
                    <a href={whatsappUrl} target="_blank" rel="noreferrer" className="btn-whatsapp">
                      💬 Chat WhatsApp
                    </a>
                  )}
                  {firstBranch?.geom?.coordinates && (
                    <button 
                      onClick={() => {
                        const [lng, lat] = firstBranch.geom.coordinates
                        navigate('/user-map', { 
                          state: { 
                            showRoute: true, 
                            coords: { lat, lng } 
                          } 
                        })
                      }}
                      className="btn-route"
                      style={{
                        textDecoration: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontSize: 'inherit'
                      }}
                    >
                      🗺️ Lihat Rute
                    </button>
                  )}
                </div>

                {/* Guarantee Badge */}
                <div className="guarantee-badge">
                  <span className="icon">🛡️</span>
                  <div>
                    <strong>Garansi Service 30 Hari</strong>
                    <p>Setiap perbaikan dijamin dengan garansi toko. Klaim mudah dengan struk digital.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}