import { useContext, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import api from '../services/api'
import LogoutConfirmModal from '../components/LogoutConfirmModal'
import { 
  LayoutGrid, 
  ShoppingBag, 
  Settings, 
  Eye, 
  MessageCircle, 
  Star,
  TrendingUp,
  Plus,
  ArrowRight,
  AlertCircle,
  Edit,
  Trash2,
  Save,
  X,
  DollarSign,
  Clock,
  Send,
  Reply
} from 'lucide-react'
import { GalleryContent, GalleryModal } from './OwnerGalleryComponents'

export default function Owner() {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [umkmList, setUmkmList] = useState([])
  const [umkmLoading, setUmkmLoading] = useState(true)
  const [activeMenu, setActiveMenu] = useState('overview')
  const [successMessage, setSuccessMessage] = useState('')
  
  // States untuk Services
  const [services, setServices] = useState([])
  const [showServiceModal, setShowServiceModal] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [serviceForm, setServiceForm] = useState({
    nama_service: '',
    deskripsi: '',
    harga_min: '',
    harga_max: '',
    estimasi_waktu: ''
  })

  // States untuk Products
  const [products, setProducts] = useState([])
  const [showProductModal, setShowProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [productForm, setProductForm] = useState({
    nama_produk: '',
    harga: '',
    image_url: ''
  })
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  // States untuk Gallery
  const [gallery, setGallery] = useState([])
  const [showGalleryModal, setShowGalleryModal] = useState(false)
  const [selectedGalleryImage, setSelectedGalleryImage] = useState(null)
  const [galleryImagePreview, setGalleryImagePreview] = useState(null)
  const [uploadingGallery, setUploadingGallery] = useState(false)

  // Dummy stats data
  const stats = {
    totalViews: 1240,
    viewsGrowth: 5,
    whatsappClicks: 45,
    clicksGrowth: 12,
    rating: 4.8,
    ratingMax: 5.0,
    totalReviews: 82
  }

  // Dummy chart data (7 hari terakhir)
  const chartData = [
    { label: 'SEN', value: 45 },
    { label: 'SEL', value: 52 },
    { label: 'RAB', value: 38 },
    { label: 'KAM', value: 48 },
    { label: 'JUM', value: 65 },
    { label: 'SAB', value: 42 },
    { label: 'MIN', value: 58 }
  ]

 const [reviews, setReviews] = useState([])

  // Check if user can edit (must be OWNER or ADMIN)
  const canEdit = user && user.role && (user.role.toUpperCase() === 'OWNER' || user.role.toUpperCase() === 'ADMIN')

  // Handle image file upload
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Hanya file gambar yang diperbolehkan')
        return
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file maksimal 5MB')
        return
      }
      
      setSelectedImage(file)
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  useEffect(() => {
    // Handle message dari location.state
    if (location.state?.message) {
      setSuccessMessage(location.state.message)
      setTimeout(() => setSuccessMessage(''), 5000)
      navigate(location.pathname, { replace: true, state: {} })
    }
    
    // Handle message dari URL params (dari redirect form)
    const params = new URLSearchParams(location.search)
    const success = params.get('success')
    const message = params.get('message')
    
    if (success === 'true' && message) {
      setSuccessMessage(decodeURIComponent(message))
      setTimeout(() => setSuccessMessage(''), 5000)
      // Clean URL
      navigate(location.pathname, { replace: true })
    }

    // Check if user has OWNER role
    if (user && user.role && user.role.toUpperCase() !== 'OWNER' && user.role.toUpperCase() !== 'ADMIN') {
      setUmkmLoading(false)
    }
  }, [location, navigate, user])

  useEffect(() => {
    fetchOwnerData()
  }, [])

 const fetchOwnerData = async () => {
  setUmkmLoading(true)
  try {
    const { data } = await api.get('/umkm/')
    setUmkmList(Array.isArray(data) ? data : [])
    
    if (data && data[0]) {
      const umkmId = data[0].umkm_id
      
      try {
        const { data: servicesData } = await api.get('/umkm-services/', {
          params: { umkm_id: umkmId }
        })
        setServices(servicesData)
      } catch (e) {
        console.error('Error fetching services:', e)
      }

      try {
        const { data: productsData } = await api.get('/umkm-products/', {
          params: { umkm_id: umkmId }
        })
        setProducts(productsData)
      } catch (e) {
        console.error('Error fetching products:', e)
      }
      
      // TAMBAHKAN INI - Fetch reviews
      try {
        const { data: reviewsData } = await api.get('/umkm-reviews/', {
          params: { umkm_id: umkmId }
        })
        setReviews(reviewsData || [])
      } catch (e) {
        console.error('Error fetching reviews:', e)
        setReviews([])
      }

      // Fetch gallery
      try {
        const { data: galleryData } = await api.get('/umkm-gallery/', {
          params: { umkm_id: umkmId }
        })
        setGallery(galleryData || [])
      } catch (e) {
        console.error('Error fetching gallery:', e)
        setGallery([])
      }
    }
  } catch (e) {
    console.error('Gagal memuat UMKM:', e)
  } finally {
    setUmkmLoading(false)
  }
}

  const currentUmkm = umkmList[0] || null
  const umkmStatus = currentUmkm?.status?.toUpperCase() || 'PENDING'

  const openAddServiceModal = () => {
    setEditingService(null)
    setServiceForm({
      nama_service: '',
      deskripsi: '',
      harga_min: '',
      harga_max: '',
      estimasi_waktu: ''
    })
    setShowServiceModal(true)
  }

  const openEditServiceModal = (service) => {
    setEditingService(service)
    setServiceForm({
      nama_service: service.nama_service,
      deskripsi: service.deskripsi,
      harga_min: service.harga_min || '',
      harga_max: service.harga_max || '',
      estimasi_waktu: service.estimasi_waktu || ''
    })
    setShowServiceModal(true)
  }

  const handleSaveService = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...serviceForm,
        umkm: currentUmkm.umkm_id,
        harga_min: serviceForm.harga_min ? parseFloat(serviceForm.harga_min) : null,
        harga_max: serviceForm.harga_max ? parseFloat(serviceForm.harga_max) : null
      }

      if (editingService) {
        await api.patch(`/umkm-services/${editingService.service_id}/`, payload)
      } else {
        await api.post('/umkm-services/', payload)
      }

      setShowServiceModal(false)
      fetchOwnerData()
    } catch (e) {
      console.error('Error saving service:', e)
      alert('Gagal menyimpan jasa')
    }
  }

  const handleDeleteService = async (id) => {
    if (!window.confirm('Yakin ingin menghapus jasa ini?')) return
    try {
      await api.delete(`/umkm-services/${id}/`)
      fetchOwnerData()
    } catch (e) {
      console.error('Error deleting service:', e)
    }
  }

  const openAddProductModal = () => {
    setEditingProduct(null)
    setProductForm({
      nama_produk: '',
      harga: '',
      image_url: ''
    })
    setSelectedImage(null)
    setImagePreview(null)
    setShowProductModal(true)
  }

  const openEditProductModal = (product) => {
    setEditingProduct(product)
    setProductForm({
      nama_produk: product.nama_produk,
      harga: product.harga,
      image_url: product.image_url || ''
    })
    setSelectedImage(null)
    setImagePreview(product.image_url || null)
    setShowProductModal(true)
  }

  const handleSaveProduct = async (e) => {
    e.preventDefault()
    try {
      const formData = new FormData()
      formData.append('nama_produk', productForm.nama_produk)
      formData.append('harga', parseFloat(productForm.harga))
      formData.append('umkm', currentUmkm.umkm_id)
      
      if (selectedImage) {
        formData.append('image', selectedImage)
      }

      let response
      if (editingProduct) {
        response = await api.patch(`/umkm-products/${editingProduct.product_id}/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
      } else {
        response = await api.post('/umkm-products/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
      }

      // Reset form state
      setShowProductModal(false)
      setSelectedImage(null)
      setImagePreview(null)
      setEditingProduct(null)
      setProductForm({
        nama_produk: '',
        harga: '',
        image_url: ''
      })

      // Show success message
      setSuccessMessage('✓ Produk berhasil disimpan!')
      setTimeout(() => setSuccessMessage(''), 3000)

      // Fetch updated data with delay to ensure backend processes image
      setTimeout(() => {
        fetchOwnerData()
      }, 500)
    } catch (e) {
      console.error('Error saving product:', e)
      alert('Gagal menyimpan produk: ' + (e?.response?.data?.detail || e.message))
    }
  }

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Yakin ingin menghapus produk ini?')) return
    try {
      await api.delete(`/umkm-products/${id}/`)
      fetchOwnerData()
    } catch (e) {
      console.error('Error deleting product:', e)
    }
  }

  // Gallery handlers
  const handleGalleryImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('❌ Hanya file gambar yang diperbolehkan (JPG, PNG, GIF)')
        return
      }
      
      if (file.size > 10 * 1024 * 1024) {
        alert('❌ Ukuran file maksimal 10MB')
        return
      }
      
      setSelectedGalleryImage(file)
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setGalleryImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadGallery = async (e) => {
    e.preventDefault()
    if (!selectedGalleryImage) {
      alert('Pilih foto terlebih dahulu')
      return
    }

    if (!currentUmkm || !currentUmkm.umkm_id) {
      alert('❌ Error: UMKM tidak ditemukan. Silakan refresh halaman.')
      console.error('currentUmkm:', currentUmkm)
      return
    }

    setUploadingGallery(true)
    try {
      const formData = new FormData()
      formData.append('image', selectedGalleryImage)
      formData.append('umkm', currentUmkm.umkm_id)
      formData.append('is_primary', gallery.length === 0)

      console.log('Uploading gallery with umkm_id:', currentUmkm.umkm_id)
      console.log('Gallery count:', gallery.length)
      console.log('is_primary:', gallery.length === 0)

      // Jangan set Content-Type manual, biar axios yang handle
      const response = await api.post('/umkm-gallery/', formData)
      
      console.log('Upload success:', response.data)
      setShowGalleryModal(false)
      setSelectedGalleryImage(null)
      setGalleryImagePreview(null)
      fetchOwnerData()
    } catch (e) {
      console.error('Error uploading gallery image:', e)
      console.error('Error response:', e?.response?.data)
      const errorMsg = e?.response?.data?.detail || 
                      e?.response?.data?.error ||
                      JSON.stringify(e?.response?.data) || 
                      e.message
      alert('Gagal mengupload foto: ' + errorMsg)
    } finally {
      setUploadingGallery(false)
    }
  }

  const handleDeleteGallery = async (id) => {
    if (!window.confirm('Yakin ingin menghapus foto ini?')) return
    try {
      await api.delete(`/umkm-gallery/${id}/`)
      fetchOwnerData()
    } catch (e) {
      console.error('Error deleting gallery:', e)
    }
  }

  const handleSetPrimaryImage = async (id) => {
    try {
      await api.patch(`/umkm-gallery/${id}/`, {
        is_primary: true,
        umkm: currentUmkm.umkm_id
      })
      fetchOwnerData()
    } catch (e) {
      console.error('Error setting primary image:', e)
    }
  }

  const formatPrice = (min, max) => {
    if (!min && !max) return '-'
    if (min && max) return `Rp ${parseInt(min).toLocaleString()} - ${parseInt(max).toLocaleString()}`
    if (min) return `Mulai Rp ${parseInt(min).toLocaleString()}`
    return `Rp ${parseInt(max).toLocaleString()}`
  }

  const maxChartValue = Math.max(...chartData.map(d => d.value))
  const chartHeight = 180
  const chartPoints = chartData.map((d, i) => {
    const x = (i / (chartData.length - 1)) * 100
    const y = chartHeight - (d.value / maxChartValue) * (chartHeight - 20)
    return `${x},${y}`
  }).join(' ')

  const handleLogout = () => {
    setShowLogoutModal(true)
  }

  const handleLogoutConfirm = () => {
    logout()
    navigate('/login')
  }

  const handleLogoutCancel = () => {
    setShowLogoutModal(false)
  }

  const getStatusBanner = () => {
    if (umkmStatus === 'PENDING') {
      return {
        bg: '#fef3c7',
        border: '#fbbf24',
        text: '#92400e',
        icon: <AlertCircle size={20} />,
        title: 'UMKM Menunggu Verifikasi',
        message: 'Data UMKM Anda sedang ditinjau oleh admin. Anda akan mendapat notifikasi setelah disetujui.'
      }
    }
    if (umkmStatus === 'REJECTED') {
      return {
        bg: '#fee2e2',
        border: '#f87171',
        text: '#991b1b',
        icon: <AlertCircle size={20} />,
        title: 'UMKM Ditolak',
        message: 'Pengajuan UMKM Anda ditolak. Silakan hubungi admin untuk informasi lebih lanjut.'
      }
    }
    return null
  }

  const statusBanner = getStatusBanner()

  if (umkmLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: 48, 
            height: 48, 
            border: '3px solid #e2e8f0',
            borderTopColor: '#3b82f6',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#64748b', fontSize: 14 }}>Memuat dashboard...</p>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f7fa' }}>
      <aside style={{
        width: 240,
        background: '#fff',
        color: '#334155',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        position: 'fixed',
        height: '100vh',
        left: 0,
        top: 0,
        borderRight: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div style={{
            width: 32,
            height: 32,
            background: '#3b82f6',
            borderRadius: 8,
            display: 'grid',
            placeItems: 'center',
            fontSize: 14,
            fontWeight: 700,
            color: '#ffffff'
          }}>
            SP
          </div>
          <span style={{ fontSize: 18, fontWeight: 700 }}>ServPoint</span>
        </div>

        <div style={{
          background: '#f0f1f9',
          borderRadius: 8,
          padding: 12,
          marginBottom: 24,
          border: '1px solid #e2e8f0'
        }}>
          <p style={{ margin: 0, fontSize: 11, color: '#64748b', marginBottom: 4 }}>UMKM Dashboard</p>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
            {currentUmkm?.nama_umkm || user?.name || 'Toko Saya'}
          </p>
          {umkmStatus !== 'APPROVED' && (
            <div style={{
              marginTop: 8,
              padding: '4px 8px',
              background: umkmStatus === 'PENDING' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(248, 113, 113, 0.2)',
              borderRadius: 4,
              fontSize: 11,
              color: umkmStatus === 'PENDING' ? '#fbbf24' : '#f87171',
              fontWeight: 600,
              textAlign: 'center'
            }}>
              {umkmStatus === 'PENDING' ? 'PENDING' : 'DITOLAK'}
            </div>
          )}
          
          {/* Preview Button */}
          {currentUmkm?.umkm_id && (
            <button
              onClick={() => navigate(`/umkm/${currentUmkm.umkm_id}`)}
              style={{
                marginTop: 12,
                width: '100%',
                padding: '10px 12px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                border: 'none',
                borderRadius: 6,
                color: '#fff',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <Eye size={14} />
              Lihat Halaman UMKM
            </button>
          )}
        </div>

        <nav style={{ flex: 1 }}>
          <p style={{ 
            fontSize: 11, 
            fontWeight: 700, 
            color: '#94a3b8', 
            marginBottom: 8,
            textTransform: 'uppercase',
            letterSpacing: 0.5
          }}>
            Menu
          </p>
          
          <SidebarLink
            icon={<LayoutGrid size={18} />}
            label="Overview"
            active={activeMenu === 'overview'}
            onClick={() => setActiveMenu('overview')}
          />
          <SidebarLink
            icon={<LayoutGrid size={18} />}
            label="Katalog Jasa"
            active={activeMenu === 'services'}
            onClick={() => setActiveMenu('services')}
            disabled={umkmStatus !== 'APPROVED'}
            badge={services.length}
          />
          <SidebarLink
            icon={<ShoppingBag size={18} />}
            label="Produk"
            active={activeMenu === 'products'}
            onClick={() => setActiveMenu('products')}
            disabled={umkmStatus !== 'APPROVED'}
            badge={products.length}
          />
          <SidebarLink
            icon={<Eye size={18} />}
            label="Galeri Foto"
            active={activeMenu === 'gallery'}
            onClick={() => setActiveMenu('gallery')}
            disabled={umkmStatus !== 'APPROVED'}
            badge={gallery.length}
          />
          <SidebarLink
            icon={<Star size={18} />}
            label="Ulasan"
            active={activeMenu === 'reviews'}
            onClick={() => setActiveMenu('reviews')}
            disabled={umkmStatus !== 'APPROVED'}
          />
          <SidebarLink
            icon={<Settings size={18} />}
            label="Pengaturan"
            active={activeMenu === 'settings'}
            onClick={() => navigate('/owner/settings')}
          />
        </nav>

        {/* User Profile Section */}
        <div style={{
          padding: '12px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: 8,
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <div style={{
            width: 40,
            height: 40,
            background: '#3b82f6',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 16,
            fontWeight: 600,
            flexShrink: 0
          }}>
            {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {user?.name && (
              <p style={{ 
                margin: 0, 
                fontSize: 13, 
                fontWeight: 600, 
                color: '#1e293b',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {user.name}
              </p>
            )}
            <p style={{ 
              margin: 0, 
              fontSize: 12, 
              color: '#64748b',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {user?.email || 'user@email.com'}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #f1f5f9',
            background: '#fef2f2',
            borderRadius: 8,
            color: '#dc2626',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#fee2e2'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#fef2f2'
          }}
        >
          Keluar
        </button>
      </aside>

      <main style={{ marginLeft: 240, flex: 1, padding: 40 }}>
        {user && user.role && user.role.toUpperCase() !== 'OWNER' && user.role.toUpperCase() !== 'ADMIN' && (
          <div style={{
            padding: 16,
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: 10,
            marginBottom: 24,
            color: '#991b1b',
            fontSize: 14,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12
          }}>
            <AlertCircle size={20} style={{ marginTop: 2, flexShrink: 0 }} />
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
                Akses Terbatas
              </p>
              <p style={{ margin: 0, fontSize: 13 }}>
                Halaman ini hanya dapat diakses oleh pemilik UMKM (Role: OWNER). Role Anda saat ini adalah "{user.role}". Anda tidak dapat menambah atau mengedit produk dan layanan.
              </p>
            </div>
          </div>
        )}

        {successMessage && (
          <div style={{
            padding: 16,
            background: '#d1fae5',
            border: '1px solid #34d399',
            borderRadius: 10,
            marginBottom: 24,
            color: '#065f46',
            fontSize: 14,
            fontWeight: 500
          }}>
            {successMessage}
          </div>
        )}

        {statusBanner && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            padding: 16,
            background: statusBanner.bg,
            border: `1px solid ${statusBanner.border}`,
            borderRadius: 10,
            marginBottom: 32,
            color: statusBanner.text
          }}>
            {statusBanner.icon}
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
                {statusBanner.title}
              </p>
              <p style={{ margin: 0, fontSize: 13 }}>
                {statusBanner.message}
              </p>
            </div>
          </div>
        )}

        {activeMenu === 'overview' && (
          <OverviewContent 
            stats={stats}
            chartData={chartData}
            chartPoints={chartPoints}
            chartHeight={chartHeight}
            reviews={reviews}
            setActiveMenu={setActiveMenu}
          />
        )}

        {activeMenu === 'services' && (
          <ServicesContent
            services={services}
            onAdd={openAddServiceModal}
            onEdit={openEditServiceModal}
            onDelete={handleDeleteService}
            formatPrice={formatPrice}
            canEdit={canEdit}
          />
        )}

        {activeMenu === 'products' && (
          <ProductsContent
            products={products}
            onAdd={openAddProductModal}
            onEdit={openEditProductModal}
            onDelete={handleDeleteProduct}
            canEdit={canEdit}
          />
        )}

        {activeMenu === 'gallery' && (
          <GalleryContent
            gallery={gallery}
            onAdd={() => setShowGalleryModal(true)}
            onDelete={handleDeleteGallery}
            onSetPrimary={handleSetPrimaryImage}
          />
        )}

        {activeMenu === 'reviews' && (
          <ReviewsContent reviews={reviews} />
        )}

        {activeMenu === 'settings' && (
          <SettingsContent currentUmkm={currentUmkm} user={user} />
        )}
      </main>

      {showServiceModal && (
        <ServiceModal
          form={serviceForm}
          setForm={setServiceForm}
          onSave={handleSaveService}
          onClose={() => setShowServiceModal(false)}
          isEdit={!!editingService}
        />
      )}

      {showProductModal && (
        <ProductModal
          form={productForm}
          setForm={setProductForm}
          onSave={handleSaveProduct}
          onClose={() => setShowProductModal(false)}
          isEdit={!!editingProduct}
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
          imagePreview={imagePreview}
          setImagePreview={setImagePreview}
          handleImageChange={handleImageChange}
        />
      )}

      {showGalleryModal && (
        <GalleryModal
          onSave={handleUploadGallery}
          onClose={() => {
            setShowGalleryModal(false)
            setSelectedGalleryImage(null)
            setGalleryImagePreview(null)
          }}
          selectedImage={selectedGalleryImage}
          imagePreview={galleryImagePreview}
          handleImageChange={handleGalleryImageChange}
          uploading={uploadingGallery}
        />
      )}

      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />
    </div>
  )
}

function OverviewContent({ stats, chartData, chartPoints, chartHeight, reviews, setActiveMenu }) {
  return (
    <>
      <h1 style={{ margin: '0 0 32px 0', fontSize: 28, fontWeight: 700, color: '#0f172a' }}>
        Dashboard Overview
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 32 }}>
        <StatsCard
          icon={<Eye size={24} />}
          label="Total Dilihat"
          value={stats.totalViews}
          growth={`+${stats.viewsGrowth}%`}
          color="#3b82f6"
        />
        <StatsCard
          icon={<MessageCircle size={24} />}
          label="Klik WhatsApp"
          value={stats.whatsappClicks}
          growth={`+${stats.clicksGrowth}%`}
          color="#10b981"
        />
        <StatsCard
          icon={<Star size={24} />}
          label="Rating"
          value={`${stats.rating}/${stats.ratingMax}`}
          subtext={`${stats.totalReviews} ulasan`}
          color="#f59e0b"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 32 }}>
        <ChartCard chartData={chartData} chartPoints={chartPoints} chartHeight={chartHeight} />
        <ActionsCard setActiveMenu={setActiveMenu} />
      </div>

      <ReviewsSection reviews={reviews} />
    </>
  )
}
function ServicesContent({ services, onAdd, onEdit, onDelete, formatPrice, canEdit }) {
  const safeServices = Array.isArray(services) ? services : []

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#0f172a' }}>
          Katalog Jasa
        </h1>
        <button
          onClick={canEdit ? onAdd : undefined}
          disabled={!canEdit}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 24px',
            background: canEdit ? 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)' : '#cbd5e1',
            border: 'none',
            borderRadius: 8,
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
            cursor: canEdit ? 'pointer' : 'not-allowed',
            opacity: canEdit ? 1 : 0.6
          }}
          title={canEdit ? '' : 'Hanya pemilik UMKM (OWNER) yang dapat menambah jasa'}
        >
          <Plus size={18} />
          Tambah Jasa
        </button>
      </div>

      {safeServices.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 12, padding: 60, textAlign: 'center', color: '#94a3b8' }}>
          <p style={{ margin: 0, fontSize: 16 }}>Belum ada jasa. Klik “Tambah Jasa” untuk memulai.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {safeServices.map((service) => (
            <ServiceCard
              key={service.service_id}
              service={service}
              onEdit={onEdit}
              onDelete={onDelete}
              formatPrice={formatPrice}
            />
          ))}
        </div>
      )}
    </>
  )
}

function SettingsContent({ currentUmkm, user }) {
  const status = currentUmkm?.status?.toUpperCase() || '-'

  return (
    <>
      <h1 style={{ margin: '0 0 32px 0', fontSize: 28, fontWeight: 700, color: '#0f172a' }}>
        Pengaturan
      </h1>

      <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0' }}>
        <p style={{ margin: 0, fontSize: 13, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
          Info UMKM
        </p>

        <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
            <span style={{ color: '#64748b', fontSize: 13 }}>Nama UMKM</span>
            <span style={{ color: '#0f172a', fontSize: 13, fontWeight: 600 }}>
              {currentUmkm?.nama_umkm || '-'}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
            <span style={{ color: '#64748b', fontSize: 13 }}>Status</span>
            <span style={{ color: '#0f172a', fontSize: 13, fontWeight: 600 }}>
              {status}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
            <span style={{ color: '#64748b', fontSize: 13 }}>Owner</span>
            <span style={{ color: '#0f172a', fontSize: 13, fontWeight: 600 }}>
              {user?.name || user?.email || '-'}
            </span>
          </div>
        </div>
      </div>
    </>
  )
}

function ProductsContent({ products, onAdd, onEdit, onDelete, canEdit }) {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#0f172a' }}>
          Produk Tersedia
        </h1>
        <button
          onClick={canEdit ? onAdd : undefined}
          disabled={!canEdit}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 24px',
            background: canEdit ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#cbd5e1',
            border: 'none',
            borderRadius: 8,
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
            cursor: canEdit ? 'pointer' : 'not-allowed',
            opacity: canEdit ? 1 : 0.6
          }}
          title={canEdit ? '' : 'Hanya pemilik UMKM (OWNER) yang dapat menambah produk'}
        >
          <Plus size={18} />
          Tambah Produk
        </button>
      </div>

      {products.length === 0 ? (
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: 60,
          textAlign: 'center',
          color: '#94a3b8'
        }}>
          <p style={{ margin: 0, fontSize: 16 }}>Belum ada produk. Klik "Tambah Produk" untuk memulai.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 20
        }}>
          {products.map(product => (
            <ProductCard
              key={product.product_id}
              product={product}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </>
  )
}


function ReviewsContent({ reviews }) {
  const safeReviews = Array.isArray(reviews) ? reviews : []
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [submittingReply, setSubmittingReply] = useState(false)

  const handleReply = async (reviewId) => {
    if (!replyText.trim()) {
      alert('Balasan tidak boleh kosong')
      return
    }

    setSubmittingReply(true)
    try {
      const response = await api.post(`/umkm-reviews/${reviewId}/reply/`, {
        reply: replyText
      })
      
      console.log('Reply success:', response.data)
      alert('Balasan berhasil dikirim!')
      
      // Refresh data
      window.location.reload()
    } catch (e) {
      console.error('Error submitting reply:', e)
      console.error('Error response:', e.response?.data)
      console.error('Error status:', e.response?.status)
      
      let errorMsg = 'Gagal mengirim balasan'
      
      if (e.response?.status === 401) {
        errorMsg = 'Sesi login Anda telah berakhir. Silakan login kembali.'
        setTimeout(() => {
          logout()
          navigate('/login')
        }, 2000)
      } else if (e.response?.status === 403) {
        errorMsg = e.response?.data?.error || 'Anda tidak memiliki izin untuk membalas ulasan ini'
      } else if (e.response?.status === 400) {
        errorMsg = e.response?.data?.error || 'Data tidak valid'
      } else if (e.response?.status === 404) {
        errorMsg = 'Ulasan tidak ditemukan'
      } else if (!e.response) {
        errorMsg = 'Tidak dapat terhubung ke server. Pastikan backend server berjalan di http://127.0.0.1:8000'
      } else {
        errorMsg = e.response?.data?.error || e.response?.data?.detail || 'Gagal mengirim balasan'
      }
      
      alert(errorMsg)
    } finally {
      setSubmittingReply(false)
    }
  }

  if (safeReviews.length === 0) {
    return (
      <>
        <h1 style={{ margin: '0 0 32px 0', fontSize: 28, fontWeight: 700, color: '#0f172a' }}>
          Ulasan Pelanggan
        </h1>
        <div style={{ background: '#fff', borderRadius: 12, padding: 60, textAlign: 'center', color: '#94a3b8' }}>
          <p style={{ margin: 0, fontSize: 16 }}>Belum ada ulasan dari pelanggan.</p>
        </div>
      </>
    )
  }

  return (
    <>
      <h1 style={{ margin: '0 0 32px 0', fontSize: 28, fontWeight: 700, color: '#0f172a' }}>
        Ulasan Pelanggan ({safeReviews.length})
      </h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 20 }}>
        {safeReviews.map((review) => (
          <ReviewCard 
            key={review.review_id || review.id} 
            review={review}
            replyingTo={replyingTo}
            setReplyingTo={setReplyingTo}
            replyText={replyText}
            setReplyText={setReplyText}
            handleReply={handleReply}
            submittingReply={submittingReply}
          />
        ))}
      </div>
    </>
  )
}

function ReviewsSection({ reviews }) {
  const safeReviews = Array.isArray(reviews) ? reviews : []
  const latest = safeReviews.slice(0, 3)

  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      padding: 24,
      border: '1px solid #e2e8f0'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#0f172a' }}>
          Ulasan Terbaru
        </h3>
        <button style={{
          padding: '6px 12px',
          background: 'transparent',
          border: '1px solid #e2e8f0',
          borderRadius: 6,
          fontSize: 13,
          fontWeight: 500,
          color: '#3b82f6',
          cursor: 'pointer'
        }}>
          Lihat Semua
        </button>
      </div>

      <div style={{ display: 'grid', gap: 16 }}>
        {latest.map((review) => (
          <ReviewCardSimple key={review.review_id || review.id} review={review} />
        ))}
      </div>
    </div>
  )
}

function ReviewCardSimple({ review }) {
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Hari ini'
    if (diffDays === 1) return 'Kemarin'
    if (diffDays < 7) return `${diffDays} hari yang lalu`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu yang lalu`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} bulan yang lalu`
    return `${Math.floor(diffDays / 365)} tahun yang lalu`
  }

  const displayName = review?.user?.name || review?.user?.email || review?.user_name || review?.user_email || 'User'

  return (
    <div style={{
      padding: 20,
      background: '#fff',
      borderRadius: 8,
      border: '1px solid #e2e8f0'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40,
            height: 40,
            background: '#3b82f6',
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            color: '#fff',
            fontSize: 16,
            fontWeight: 600
          }}>
            {(displayName || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
              {displayName}
            </p>
            <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
              {formatDate(review?.created_at)}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 2 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              style={{
                fontSize: 18,
                color: i < (review?.rating || 0) ? '#f59e0b' : '#cbd5e1'
              }}
            >
              ★
            </span>
          ))}
        </div>
      </div>

      <p style={{ margin: 0, fontSize: 14, color: '#475569', lineHeight: 1.6 }}>
        "{review?.comment || ''}"
      </p>
    </div>
  )
}

function ServiceCard({ service, onEdit, onDelete, formatPrice }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      padding: 24,
      border: '1px solid #e2e8f0'
    }}>
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

      <p style={{
        margin: '0 0 16px 0',
        fontSize: 14,
        color: '#64748b',
        lineHeight: 1.6
      }}>
        {service.deskripsi}
      </p>

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

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => onEdit(service)}
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
          onClick={() => onDelete(service.service_id)}
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
  )
}

function ProductCard({ product, onEdit, onDelete }) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Get image URL - handle multiple possible image URL fields from API
  // Priority: image_url_full (full URL) > image (full URL or relative) > image_url (text field)
  const imageUrl = product.image_url_full || product.image || product.image_url

  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      overflow: 'hidden',
      border: '1px solid #e2e8f0',
      cursor: 'pointer',
      transition: 'all 0.2s'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
      e.currentTarget.style.transform = 'translateY(-4px)'
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = 'none'
      e.currentTarget.style.transform = 'translateY(0)'
    }}>
      <div style={{
        width: '100%',
        height: 200,
        backgroundImage: (imageUrl && !imageError) ? `url(${imageUrl})` : 'none',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundColor: (imageUrl && !imageError) ? 'transparent' : '#3b82f6',
        display: 'grid',
        placeItems: 'center',
        color: '#fff',
        fontSize: 48,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {imageUrl && !imageError ? (
          <img 
            src={imageUrl} 
            alt={product.nama_produk}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: imageLoaded ? 'block' : 'none'
            }}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              console.warn('Failed to load image:', imageUrl)
              setImageError(true)
            }}
          />
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8
          }}>
            <span>📦</span>
            <span style={{ fontSize: 12, fontWeight: 500 }}>Belum ada gambar</span>
          </div>
        )}
      </div>
      <div style={{ padding: 20 }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: 16, fontWeight: 600, color: '#0f172a' }}>
          {product.nama_produk}
        </h3>
        <p style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 700, color: '#10b981' }}>
          Rp {parseInt(product.harga).toLocaleString()}
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => onEdit(product)}
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
              gap: 6,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#dbeafe'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#eff6ff'
            }}
          >
            <Edit size={14} />
            Edit
          </button>
          <button
            onClick={() => onDelete(product.product_id)}
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
              gap: 6,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#fee2e2'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#fef2f2'
            }}
          >
            <Trash2 size={14} />
            Hapus
          </button>
        </div>
      </div>
    </div>
  )
}

function ServiceModal({ form, setForm, onSave, onClose, isEdit }) {
  const [errors, setErrors] = useState({})
  const [showConfirmClose, setShowConfirmClose] = useState(false)

  // Check if form has unsaved changes
  const hasChanges = form.nama_service || form.deskripsi

  // Handle close with confirmation
  const handleClose = () => {
    if (hasChanges) {
      setShowConfirmClose(true)
    } else {
      onClose()
    }
  }

  // Validate form
  const validateForm = () => {
    const newErrors = {}
    if (!form.nama_service?.trim()) newErrors.nama_service = 'Nama jasa wajib diisi'
    if (!form.deskripsi?.trim()) newErrors.deskripsi = 'Deskripsi wajib diisi'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submit
  const handleSubmit = (e) => {
    if (validateForm()) {
      onSave(e)
    }
  }

  return (
    <>
      {/* Confirmation Dialog */}
      {showConfirmClose && (
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
          zIndex: 2000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: 24,
            maxWidth: 400,
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#0f172a' }}>Batalkan perubahan?</h3>
            <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: 14 }}>
              Data yang Anda isi akan hilang jika tidak disimpan.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={() => setShowConfirmClose(false)}
                style={{
                  padding: '10px 20px',
                  border: '1px solid #e2e8f0',
                  background: '#fff',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#64748b'
                }}
              >
                Lanjutkan Edit
              </button>
              <button
                onClick={() => {
                  setShowConfirmClose(false)
                  onClose()
                }}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  background: '#ef4444',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#fff'
                }}
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Modal */}
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
        onClick={handleClose}
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
          {isEdit ? 'Edit Jasa' : 'Tambah Jasa Baru'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500, color: '#475569' }}>
              Nama Jasa *
            </label>
            <input
              type="text"
              value={form.nama_service}
              onChange={(e) => {
                setForm({ ...form, nama_service: e.target.value })
                if (errors.nama_service) setErrors({ ...errors, nama_service: '' })
              }}
              placeholder="Contoh: Ganti LCD Laptop"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: errors.nama_service ? '2px solid #ef4444' : '1px solid #e2e8f0',
                borderRadius: 8,
                fontSize: 14,
                outline: 'none',
                backgroundColor: errors.nama_service ? '#fef2f2' : '#fff'
              }}
            />
            {errors.nama_service && (
              <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#ef4444' }}>
                ⚠ {errors.nama_service}
              </p>
            )}
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500, color: '#475569' }}>
              Deskripsi *
            </label>
            <textarea
              value={form.deskripsi}
              onChange={(e) => {
                setForm({ ...form, deskripsi: e.target.value })
                if (errors.deskripsi) setErrors({ ...errors, deskripsi: '' })
              }}
              placeholder="Jelaskan detail jasa yang ditawarkan..."
              rows={4}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: errors.deskripsi ? '2px solid #ef4444' : '1px solid #e2e8f0',
                borderRadius: 8,
                fontSize: 14,
                outline: 'none',
                resize: 'vertical',
                backgroundColor: errors.deskripsi ? '#fef2f2' : '#fff'
              }}
            />
            {errors.deskripsi && (
              <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#ef4444' }}>
                ⚠ {errors.deskripsi}
              </p>
            )}
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
              placeholder="Contoh: 60 Menit, 1-2 Jam"
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
              onClick={handleClose}
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
    </>
  )
}

function ProductModal({ form, setForm, onSave, onClose, isEdit, selectedImage, setSelectedImage, imagePreview, setImagePreview, handleImageChange }) {
  const [errors, setErrors] = useState({})
  const [showConfirmClose, setShowConfirmClose] = useState(false)

  // Check if form has unsaved changes
  const hasChanges = form.nama_produk || form.harga || selectedImage

  // Handle close with confirmation
  const handleClose = () => {
    if (hasChanges) {
      setShowConfirmClose(true)
    } else {
      onClose()
    }
  }

  // Validate form
  const validateForm = () => {
    const newErrors = {}
    if (!form.nama_produk?.trim()) newErrors.nama_produk = 'Nama produk wajib diisi'
    if (!form.harga) newErrors.harga = 'Harga wajib diisi'
    if (form.harga && parseFloat(form.harga) <= 0) newErrors.harga = 'Harga harus lebih dari 0'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submit
  const handleSubmit = (e) => {
    if (validateForm()) {
      onSave(e)
    }
  }
  return (
    <>
      {/* Confirmation Dialog */}
      {showConfirmClose && (
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
          zIndex: 2000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: 24,
            maxWidth: 400,
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#0f172a' }}>Batalkan perubahan?</h3>
            <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: 14 }}>
              Data yang Anda isi akan hilang jika tidak disimpan.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={() => setShowConfirmClose(false)}
                style={{
                  padding: '10px 20px',
                  border: '1px solid #e2e8f0',
                  background: '#fff',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#64748b'
                }}
              >
                Lanjutkan Edit
              </button>
              <button
                onClick={() => {
                  setShowConfirmClose(false)
                  onClose()
                }}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  background: '#ef4444',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#fff'
                }}
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Modal */}
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
        onClick={handleClose}
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
          {isEdit ? 'Edit Produk' : 'Tambah Produk Baru'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500, color: '#475569' }}>
              Nama Produk *
            </label>
            <input
              type="text"
              value={form.nama_produk}
              onChange={(e) => {
                setForm({ ...form, nama_produk: e.target.value })
                if (errors.nama_produk) setErrors({ ...errors, nama_produk: '' })
              }}
              placeholder="Contoh: Mouse Logitech M220"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: errors.nama_produk ? '2px solid #ef4444' : '1px solid #e2e8f0',
                borderRadius: 8,
                fontSize: 14,
                outline: 'none',
                backgroundColor: errors.nama_produk ? '#fef2f2' : '#fff'
              }}
            />
            {errors.nama_produk && (
              <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#ef4444' }}>
                ⚠ {errors.nama_produk}
              </p>
            )}
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500, color: '#475569' }}>
              Harga *
            </label>
            <input
              type="number"
              value={form.harga}
              onChange={(e) => {
                setForm({ ...form, harga: e.target.value })
                if (errors.harga) setErrors({ ...errors, harga: '' })
              }}
              placeholder="145000"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: errors.harga ? '2px solid #ef4444' : '1px solid #e2e8f0',
                borderRadius: 8,
                fontSize: 14,
                outline: 'none',
                backgroundColor: errors.harga ? '#fef2f2' : '#fff'
              }}
            />
            {errors.harga && (
              <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#ef4444' }}>
                ⚠ {errors.harga}
              </p>
            )}
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500, color: '#475569' }}>
              Gambar Produk (opsional)
            </label>
            
            {imagePreview && (
              <div style={{ marginBottom: 12, position: 'relative' }}>
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  style={{ 
                    width: '100%', 
                    maxHeight: 200, 
                    objectFit: 'cover', 
                    borderRadius: 8,
                    border: '1px solid #e2e8f0'
                  }} 
                />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedImage(null)
                    setImagePreview(null)
                  }}
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    width: 28,
                    height: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            )}
            
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                fontSize: 14,
                outline: 'none',
                cursor: 'pointer'
              }}
            />
            <p style={{ 
              margin: '8px 0 0 0', 
              fontSize: 12, 
              color: '#94a3b8' 
            }}>
              Format: JPG, PNG, GIF (Max 5MB)
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleClose}
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
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
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
    </>
  )
}

function SidebarLink({ icon, label, active, onClick, disabled, badge }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: '10px 12px',
        marginBottom: 4,
        border: 'none',
        background: active ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
        color: disabled ? '#94a3b8' : active ? '#3b82f6' : '#64748b',
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        textAlign: 'left',
        transition: 'all 0.2s'
      }}
      onMouseEnter={(e) => {
        if (!active && !disabled) {
          e.currentTarget.style.background = 'rgba(79, 70, 229, 0.05)'
        }
      }}
      onMouseLeave={(e) => {
        if (!active && !disabled) {
          e.currentTarget.style.background = 'transparent'
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {icon}
        <span>{label}</span>
      </div>
      {badge !== undefined && (
        <span style={{
          padding: '2px 8px',
          background: active ? '#3b82f6' : 'rgba(255,255,255,0.1)',
          borderRadius: 12,
          fontSize: 11,
          fontWeight: 600
        }}>
          {badge}
        </span>
      )}
    </button>
  )
}

function StatsCard({ icon, label, value, growth, subtext, color }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      padding: 24,
      border: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <p style={{ margin: 0, fontSize: 13, color: '#64748b', fontWeight: 500 }}>{label}</p>
        <div style={{
          width: 40,
          height: 40,
          background: `${color}15`,
          borderRadius: 8,
          display: 'grid',
          placeItems: 'center',
          color
        }}>
          {icon}
        </div>
      </div>
      <p style={{ margin: 0, fontSize: 32, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
        {value}
      </p>
      {growth && (
        <p style={{ margin: 0, fontSize: 12, color: '#10b981', fontWeight: 600 }}>
          {growth} dari bulan lalu
        </p>
      )}
      {subtext && (
        <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
          {subtext}
        </p>
      )}
    </div>
  )
}

function ChartCard({ chartData, chartPoints, chartHeight }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      padding: 24,
      border: '1px solid #e2e8f0'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#0f172a' }}>
          Pengunjung (7 Hari)
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <TrendingUp size={16} color="#10b981" />
          <span style={{ fontSize: 13, color: '#10b981', fontWeight: 600 }}>+8%</span>
        </div>
      </div>
      <svg
        viewBox={`0 0 100 ${chartHeight}`}
        style={{ width: '100%', height: chartHeight, overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline
          points={`0,${chartHeight} ${chartPoints} 100,${chartHeight}`}
          fill="url(#chartGrad)"
        />
        <polyline
          points={chartPoints}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {chartData.map((d, i) => {
          const x = (i / (chartData.length - 1)) * 100
          const y = chartHeight - (d.value / Math.max(...chartData.map(d => d.value))) * (chartHeight - 20)
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="3"
              fill="#3b82f6"
            />
          )
        })}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
        {chartData.map((d, i) => (
          <span key={i} style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>
            {d.label}
          </span>
        ))}
      </div>
    </div>
  )
}

function ActionsCard({ setActiveMenu }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }}>
      <ActionCardItem
        icon="🛠️"
        title="Tambah Jasa"
        desc="Kelola layanan UMKM"
        color="#3b82f6"
        onClick={() => setActiveMenu('services')}
      />
      <ActionCardItem
        icon="📦"
        title="Tambah Produk"
        desc="Tambah produk baru"
        color="#10b981"
        onClick={() => setActiveMenu('products')}
      />
    </div>
  )
}

function ActionCardItem({ icon, title, desc, color, onClick }) {
  return (
    <div 
      style={{
        background: '#fff',
        borderRadius: 12,
        padding: 20,
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = color
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#e2e8f0'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <div style={{
        width: 48,
        height: 48,
        background: `${color}15`,
        borderRadius: 10,
        display: 'grid',
        placeItems: 'center',
        fontSize: 20
      }}>
        {icon}
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 2 }}>
          {title}
        </p>
        <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
          {desc}
        </p>
      </div>
      <ArrowRight size={20} color={color} style={{ marginLeft: 'auto' }} />
    </div>
  )
}


function ReviewCard({ review, replyingTo, setReplyingTo, replyText, setReplyText, handleReply, submittingReply }) {
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Hari ini'
    if (diffDays === 1) return 'Kemarin'
    if (diffDays < 7) return `${diffDays} hari yang lalu`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu yang lalu`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} bulan yang lalu`
    return `${Math.floor(diffDays / 365)} tahun yang lalu`
  }

  const displayName = review?.user?.name || review?.user?.email || review?.user_name || review?.user_email || 'User'
  const isReplying = replyingTo === (review.review_id || review.id)

  return (
    <div style={{
      padding: 20,
      background: '#fff',
      borderRadius: 12,
      border: '1px solid #e2e8f0'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40,
            height: 40,
            background: '#3b82f6',
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            color: '#fff',
            fontSize: 16,
            fontWeight: 600
          }}>
            {(displayName || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#0f172a' }}>
              {displayName}
            </p>
            <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>
              {formatDate(review?.created_at)}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 2 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              style={{
                fontSize: 18,
                color: i < (review?.rating || 0) ? '#f59e0b' : '#cbd5e1'
              }}
            >
              ★
            </span>
          ))}
        </div>
      </div>

      <p style={{ margin: '0 0 12px 0', fontSize: 14, color: '#475569', lineHeight: 1.6 }}>
        "{review?.comment || ''}"
      </p>

      {/* Display existing reply */}
      {review?.reply && (
        <div style={{
          marginTop: 12,
          padding: 12,
          background: '#f8fafc',
          borderLeft: '3px solid #3b82f6',
          borderRadius: 6
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <Reply size={14} color="#3b82f6" />
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#3b82f6' }}>
              Balasan Anda {review?.reply_at && `• ${formatDate(review.reply_at)}`}
            </p>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
            {review.reply}
          </p>
        </div>
      )}

      {/* Reply button or form */}
      {!review?.reply && !isReplying && (
        <button
          onClick={() => {
            setReplyingTo(review.review_id || review.id)
            setReplyText('')
          }}
          style={{
            marginTop: 8,
            padding: '8px 16px',
            background: 'transparent',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            color: '#3b82f6',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f8fafc'
            e.currentTarget.style.borderColor = '#3b82f6'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.borderColor = '#e2e8f0'
          }}
        >
          <Reply size={14} />
          Balas Ulasan
        </button>
      )}

      {/* Reply form */}
      {isReplying && (
        <div style={{ marginTop: 12 }}>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Tulis balasan Anda..."
            style={{
              width: '100%',
              minHeight: 80,
              padding: 12,
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              fontSize: 13,
              fontFamily: 'inherit',
              resize: 'vertical',
              marginBottom: 8
            }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => handleReply(review.review_id || review.id)}
              disabled={submittingReply || !replyText.trim()}
              style={{
                flex: 1,
                padding: '8px 16px',
                background: '#3b82f6',
                border: 'none',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                color: '#fff',
                cursor: submittingReply || !replyText.trim() ? 'not-allowed' : 'pointer',
                opacity: submittingReply || !replyText.trim() ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              <Send size={14} />
              {submittingReply ? 'Mengirim...' : 'Kirim Balasan'}
            </button>
            <button
              onClick={() => {
                setReplyingTo(null)
                setReplyText('')
              }}
              disabled={submittingReply}
              style={{
                padding: '8px 16px',
                background: 'transparent',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                color: '#64748b',
                cursor: submittingReply ? 'not-allowed' : 'pointer'
              }}
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  )
}