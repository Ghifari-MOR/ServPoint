import { useContext, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import api from '../services/api'
import AuthPopup from '../components/AuthPopup'
import Sidebar from '../components/Sidebar'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet-routing-machine'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { Search, MapPin, Monitor, Smartphone, Printer, Filter, Star, ArrowRight, LayoutGrid, Settings, LogOut, Navigation } from 'lucide-react'

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

function MapResizer({ onMapReady }) {
  const map = useMap()
  useEffect(() => {
    const t = setTimeout(() => {
      map.invalidateSize()
      if (onMapReady) onMapReady(map)
    }, 200)
    return () => clearTimeout(t)
  }, [map, onMapReady])
  return null
}

export default function UserMap() {
  const { user, loading, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()
  const token = localStorage.getItem('token')
  const isAuthed = Boolean(token && user)

  const [query, setQuery] = useState('')
  const [umkmResults, setUmkmResults] = useState([])
  const [loadingUmkm, setLoadingUmkm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("Semua Kategori")
  const [showUserMenu, setShowUserMenu] = useState(false)

  const [authPopupOpen, setAuthPopupOpen] = useState(false)
  const [authPopupMode, setAuthPopupMode] = useState('login')
  const [authPopupFrom, setAuthPopupFrom] = useState('')

  const [userLocation, setUserLocation] = useState(null)
  const [routingControl, setRoutingControl] = useState(null)
  const [mapInstance, setMapInstance] = useState(null)

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin logout?')) {
      logout()
      navigate('/login')
    }
  }

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.log('Geolocation error:', error)
        }
      )
    }
  }, [])

  // Calculate distance using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3 // Earth radius in meters
    const φ1 = lat1 * Math.PI/180
    const φ2 = lat2 * Math.PI/180
    const Δφ = (lat2-lat1) * Math.PI/180
    const Δλ = (lon2-lon1) * Math.PI/180

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

    return Math.round(R * c) // Distance in meters
  }

  // Format distance
  const formatDistance = (meters) => {
    if (meters < 1000) return `${meters} m`
    return `${(meters / 1000).toFixed(1)} km`
  }

  // Show route on map
  const showRoute = (umkmLat, umkmLng) => {
    console.log('showRoute called', { umkmLat, umkmLng, userLocation, mapInstance })
    
    if (!userLocation || !mapInstance) {
      alert('Lokasi Anda belum terdeteksi. Pastikan GPS aktif dan muat ulang halaman.')
      return
    }

    try {
      // Remove existing route
      if (routingControl) {
        mapInstance.removeControl(routingControl)
        setRoutingControl(null)
      }

    // Indonesian language formatter
    const indonesianFormatter = {
      formatDistance: function(distance) {
        if (distance < 1000) {
          return Math.round(distance) + ' m'
        }
        return (distance / 1000).toFixed(1) + ' km'
      },
      formatTime: function(seconds) {
        const minutes = Math.round(seconds / 60)
        if (minutes < 60) {
          return minutes + ' menit'
        }
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        return hours + ' jam ' + (mins > 0 ? mins + ' menit' : '')
      },
      formatInstruction: function(instruction, index) {
        const directions = {
          'Head': 'Mulai ke arah',
          'Continue': 'Lanjutkan',
          'Turn right': 'Belok kanan',
          'Turn left': 'Belok kiri',
          'Slight right': 'Belok sedikit ke kanan',
          'Slight left': 'Belok sedikit ke kiri',
          'Sharp right': 'Belok tajam ke kanan',
          'Sharp left': 'Belok tajam ke kanan',
          'You have arrived': 'Anda telah sampai',
          'Roundabout': 'Bundaran',
          'north': 'utara',
          'south': 'selatan',
          'east': 'timur',
          'west': 'barat',
          'northeast': 'timur laut',
          'northwest': 'barat laut',
          'southeast': 'tenggara',
          'southwest': 'barat daya'
        }
        
        let text = instruction.text || ''
        Object.keys(directions).forEach(key => {
          const regex = new RegExp(key, 'gi')
          text = text.replace(regex, directions[key])
        })
        
        return text
      }
    }

    // Create new route
    const control = L.Routing.control({
      waypoints: [
        L.latLng(userLocation.lat, userLocation.lng),
        L.latLng(umkmLat, umkmLng)
      ],
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
      lineOptions: {
        styles: [{ color: '#4f46e5', opacity: 0.8, weight: 5 }]
      },
      containerClassName: 'custom-routing-container',
      createMarker: function(i, waypoint, n) {
        const marker = L.marker(waypoint.latLng, {
          draggable: false,
          icon: L.icon({
            iconUrl: i === 0 ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png' : markerIcon,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowUrl: markerShadow,
            shadowSize: [41, 41]
          })
        })
        
        if (i === 0) {
          marker.bindPopup('Lokasi Anda')
        } else {
          marker.bindPopup('Tujuan')
        }
        
        return marker
      }
    }).addTo(mapInstance)

    // Apply custom styling to routing container
    setTimeout(() => {
      const routingContainer = document.querySelector('.custom-routing-container')
      if (routingContainer) {
        routingContainer.style.cssText = `
          background: white !important;
          border: 2px solid #4f46e5 !important;
          border-radius: 12px !important;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15) !important;
          padding: 12px !important;
          font-family: system-ui, -apple-system, sans-serif !important;
        `
        
        // Comprehensive Indonesian translation function
        const translateToIndonesian = (element) => {
          const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            null,
            false
          )
          
          const textNodes = []
          let node
          while (node = walker.nextNode()) {
            if (node.nodeValue.trim()) {
              textNodes.push(node)
            }
          }
          
          textNodes.forEach(textNode => {
            let text = textNode.nodeValue
            
            // Directions
            text = text.replace(/Head\s+/gi, 'Mulai ke arah ')
            text = text.replace(/Continue\s+(on\s+)?/gi, 'Lanjutkan ')
            text = text.replace(/Turn\s+right/gi, 'Belok kanan')
            text = text.replace(/Turn\s+left/gi, 'Belok kiri')
            text = text.replace(/Slight\s+right/gi, 'Agak ke kanan')
            text = text.replace(/Slight\s+left/gi, 'Agak ke kiri')
            text = text.replace(/Sharp\s+right/gi, 'Belok tajam kanan')
            text = text.replace(/Sharp\s+left/gi, 'Belok tajam kiri')
            text = text.replace(/Keep\s+right/gi, 'Tetap di kanan')
            text = text.replace(/Keep\s+left/gi, 'Tetap di kiri')
            text = text.replace(/Make\s+a\s+U-turn/gi, 'Putar balik')
            
            // Destinations
            text = text.replace(/You\s+have\s+arrived\s+at\s+your\s+destination/gi, 'Anda telah sampai di tujuan')
            text = text.replace(/at\s+your\s+destination/gi, 'di tujuan Anda')
            text = text.replace(/straight\s+ahead/gi, 'lurus saja')
            text = text.replace(/on\s+the\s+right/gi, 'di sebelah kanan')
            text = text.replace(/on\s+the\s+left/gi, 'di sebelah kiri')
            text = text.replace(/on\s+your\s+right/gi, 'di kanan Anda')
            text = text.replace(/on\s+your\s+left/gi, 'di kiri Anda')
            text = text.replace(/Destination/gi, 'Tujuan')
            text = text.replace(/waypoint/gi, 'titik tujuan')
            
            // Compass directions
            text = text.replace(/\bnorth\b/gi, 'utara')
            text = text.replace(/\bsouth\b/gi, 'selatan')
            text = text.replace(/\beast\b/gi, 'timur')
            text = text.replace(/\bwest\b/gi, 'barat')
            text = text.replace(/northeast/gi, 'timur laut')
            text = text.replace(/northwest/gi, 'barat laut')
            text = text.replace(/southeast/gi, 'tenggara')
            text = text.replace(/southwest/gi, 'barat daya')
            
            // Common words
            text = text.replace(/\btoward(s)?\b/gi, 'menuju')
            text = text.replace(/\bonto\b/gi, 'ke')
            text = text.replace(/\bfor\b/gi, 'sejauh')
            text = text.replace(/\bthen\b/gi, 'kemudian')
            text = text.replace(/\band\b/gi, 'dan')
            text = text.replace(/\bat\b/gi, 'di')
            
            textNode.nodeValue = text
          })
        }
        
        // Initial translation
        translateToIndonesian(routingContainer)
        
        // Watch for dynamic content changes
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
              translateToIndonesian(routingContainer)
            }
          })
        })
        
        observer.observe(routingContainer, {
          childList: true,
          subtree: true
        })
        
        // Style all text elements
        const textElements = routingContainer.querySelectorAll('*')
        textElements.forEach(el => {
          el.style.color = '#1e293b'
          el.style.backgroundColor = 'transparent'
        })
        
        // Style headers
        const headers = routingContainer.querySelectorAll('h2, h3')
        headers.forEach(h => {
          h.style.color = '#4f46e5'
          h.style.fontWeight = '700'
          h.style.fontSize = '14px'
          h.style.marginBottom = '8px'
        })
        
        // Style instructions
        const instructions = routingContainer.querySelectorAll('.leaflet-routing-alt')
        instructions.forEach(inst => {
          inst.style.background = '#f8fafc'
          inst.style.padding = '8px'
          inst.style.borderRadius = '8px'
          inst.style.marginBottom = '8px'
        })
      }
    }, 100)

    setRoutingControl(control)
    } catch (error) {
      console.error('Error creating route:', error)
      alert('Gagal membuat rute. Error: ' + error.message)
    }
  }

  const openUmkmDetail = (umkmId) => {
    const destination = `/umkm/${umkmId}`
    if (isAuthed) return navigate(destination)
    if (token && loading) return navigate(destination)
    setAuthPopupFrom(destination)
    setAuthPopupMode('login')
    setAuthPopupOpen(true)
  }

  useEffect(() => {
    let active = true
    const run = async () => {
      setLoadingUmkm(true)
      try {
        const params = { status: 'APPROVED' }
        if (query.trim()) params.q = query.trim()
        const { data } = await api.get('/umkm/', { params })
        if (active) setUmkmResults(Array.isArray(data) ? data : [])
      } catch (e) {
        console.error('Error fetching UMKM:', e)
      } finally {
        if (active) setLoadingUmkm(false)
      }
    }
    const t = setTimeout(run, 300)
    return () => { active = false; clearTimeout(t) }
  }, [query])

  // Auto-show route if navigated from detail page with coords
  useEffect(() => {
    const state = location.state
    if (state?.showRoute && state?.coords) {
      // Wait a bit for map and location to be ready
      const timer = setTimeout(() => {
        if (userLocation && mapInstance) {
          const { lat, lng } = state.coords
          try {
            showRoute(lat, lng)
            // Clear the state to prevent re-triggering
            window.history.replaceState({}, document.title)
          } catch (error) {
            console.error('Error showing route:', error)
            alert('Gagal menampilkan rute. Silakan coba lagi.')
          }
        } else {
          console.log('Waiting for location/map...', { userLocation, mapInstance })
          // Try again after a delay if not ready
          if (!userLocation) {
            alert('Menunggu deteksi lokasi GPS...')
          }
        }
      }, 1000)
      
      return () => clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, userLocation, mapInstance])

  // Build markers
  const markers = umkmResults.flatMap((u) => {
    const branches = Array.isArray(u?.branches) ? u.branches : []
    return branches.map((b) => {
      // Extract coordinates from GeoJSON format: {type: "Point", coordinates: [lng, lat]}
      if (b?.geom?.coordinates && Array.isArray(b.geom.coordinates)) {
        const [lng, lat] = b.geom.coordinates
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
        return {
          key: `${u.umkm_id}:${b.branch_id}`,
          umkmId: u.umkm_id,
          name: u.nama_umkm,
          kategori: u?.kategori?.nama_kategori || 'Service',
          lat, lng
        }
      }
      return null
    })
  }).filter(Boolean)

  const mapCenter = markers.length ? [markers[0].lat, markers[0].lng] : [-6.353, 106.832] // Default near STT-NF
  const resultCount = umkmResults.length

  const getCategoryIcon = (cat) => {
    const c = (cat || '').toLowerCase()
    if (c.includes('laptop') || c.includes('komputer')) return <Monitor size={20} color="#4f46e5" />
    if (c.includes('hp') || c.includes('phone')) return <Smartphone size={20} color="#10b981" />
    if (c.includes('printer')) return <Printer size={20} color="#06b6d4" />
    return <LayoutGrid size={20} color="#6b7280" />
  }

  // Debug log
  console.log('UserMap render', { userLocation, mapInstance, hasState: !!location.state })

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 24, overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, color: '#6366f1', letterSpacing: 0.5, marginBottom: 4 }}>
              <MapPin size={14} /> RADIUS 2 KM • KAMPUS STT-NF
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>Temukan Tempat Servis</h1>
            <p style={{ color: '#64748b', margin: 0 }}>Bengkel terverifikasi untuk Laptop, PC, dan HP di sekitar kampus.</p>
          </div>

          {/* User Profile Section */}
          {user && (
            <div style={{ position: 'relative' }}>
              <div 
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 12, 
                  background: '#fff',
                  padding: '8px 12px',
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#4f46e5'
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(79, 70, 229, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0'
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                    {user.name || 'User'}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                    {user.email}
                  </p>
                </div>
                {user.profile_picture_url ? (
                  <img 
                    src={user.profile_picture_url} 
                    alt={user.name || 'User'}
                    style={{ 
                      width: 44, 
                      height: 44, 
                      borderRadius: '50%', 
                      objectFit: 'cover',
                      border: '3px solid #e0e7ff'
                    }}
                  />
                ) : (
                  <div style={{ 
                    width: 44, 
                    height: 44, 
                    background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)', 
                    borderRadius: '50%', 
                    display: 'grid', 
                    placeItems: 'center', 
                    color: '#4f46e5', 
                    fontWeight: 700,
                    fontSize: 18,
                    border: '3px solid #e0e7ff'
                  }}>
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </div>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 8,
                  background: '#fff',
                  borderRadius: 12,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  minWidth: 220,
                  zIndex: 1000,
                  overflow: 'hidden'
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                      {user.name || 'User'}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>
                      {user.role || 'USER'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      navigate('/settings')
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: 'none',
                      background: 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      cursor: 'pointer',
                      fontSize: 14,
                      color: '#475569',
                      textAlign: 'left',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Settings size={16} />
                    Pengaturan
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      handleLogout()
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: 'none',
                      background: 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      cursor: 'pointer',
                      fontSize: 14,
                      color: '#ef4444',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      borderTop: '1px solid #e2e8f0'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <LogOut size={16} />
                    Keluar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div style={{ background: '#fff', padding: 8, borderRadius: 16, border: '1px solid #e2e8f0', display: 'flex', gap: 12, alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, paddingLeft: 12 }}>
            <Search size={20} color="#cbd5e1" />
            <input
              placeholder="Cari nama toko, jenis kerusakan (mis: LCD, Baterai)..."
              style={{ border: 'none', outline: 'none', width: '100%', fontSize: 15, color: '#1e293b' }}
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>

          <div style={{ height: 24, width: 1, background: '#e2e8f0' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingRight: 8 }}>
            <select
              style={{
                border: '1px solid #e2e8f0',
                outline: 'none',
                background: '#fff',
                fontWeight: 600,
                color: '#475569',
                cursor: 'pointer',
                padding: '10px 12px',
                borderRadius: 10,
                minWidth: 160,
                WebkitAppearance: 'menulist',
                appearance: 'auto',
              }}
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
            >
              <option>Semua Kategori</option>
              <option>Laptop & PC</option>
              <option>Handphone</option>
              <option>Printer</option>
            </select>
          </div>

          <button style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #d1fae5', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <MapPin size={16} /> Area Kampus
          </button>

          <button style={{ background: '#4f46e5', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            Cari <ArrowRight size={18} />
          </button>
        </div>

        {/* Filters & Results Count */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 16, color: '#1e293b' }}>
            <strong>{resultCount} Hasil</strong> <span style={{ fontWeight: 400, color: '#64748b' }}>ditemukan</span>
          </h3>
          <button style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500, color: '#475569', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <Filter size={14} /> FIlter
          </button>
        </div>

        {/* Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 350px) 1fr', gap: 24, height: 'calc(100vh - 280px)' }}>

          {/* Results List */}
          <div style={{ overflowY: 'auto', paddingRight: 8, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {loadingUmkm ? (
              <div style={{ padding: 20, textAlign: 'center', color: '#64748b' }}>Memuat data...</div>
            ) : umkmResults.map(umkm => {
              const branch = umkm.branches?.[0]
              const coords = branch?.geom?.coordinates
              const distance = userLocation && coords ? 
                calculateDistance(userLocation.lat, userLocation.lng, coords[1], coords[0]) : null
              
              return (
              <div key={umkm.umkm_id}
                style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', padding: 16, transition: 'all 0.2s', position: 'relative', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}
                className="hover:shadow-md hover:border-indigo-300"
              >
                {/* Badge Rekomendasi (Dummy logic) */}
                <div style={{ position: 'absolute', top: 0, right: 0, background: '#4f46e5', color: '#fff', fontSize: 10, fontWeight: 700, padding: '4px 12px', borderRadius: '0 15px 0 10px', textTransform: 'uppercase' }}>
                  REKOMENDASI
                </div>

                <div style={{ display: 'flex', gap: 16 }}>
                  {/* UMKM Image or Category Icon */}
                  <div style={{ 
                    width: 64, 
                    height: 64, 
                    background: umkm.primary_image ? 'transparent' : '#f1f5f9', 
                    borderRadius: 12, 
                    display: 'grid', 
                    placeItems: 'center',
                    overflow: 'hidden'
                  }}>
                    {umkm.primary_image ? (
                      <img 
                        src={umkm.primary_image} 
                        alt={umkm.nama_umkm}
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover' 
                        }}
                      />
                    ) : (
                      getCategoryIcon(umkm?.kategori?.nama_kategori)
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: '#1e293b' }}>{umkm.nama_umkm}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#64748b', marginBottom: 8 }}>
                      <MapPin size={14} /> 
                      {distance ? formatDistance(distance) : '-- m'} • <span style={{ color: '#16a34a', fontWeight: 600 }}>Buka</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 500, color: '#475569' }}>
                        {umkm?.kategori?.nama_kategori || 'Umum'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Operating Hours & Address */}
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {/* Jam Operasional */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ 
                      width: 24, 
                      height: 24, 
                      background: '#f0fdf4', 
                      borderRadius: '50%', 
                      display: 'grid', 
                      placeItems: 'center',
                    }}>
                      <span style={{ fontSize: 12 }}>🕐</span>
                    </div>
                    <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>
                      {branch?.jam_buka && branch?.jam_tutup
                        ? `${branch.jam_buka} - ${branch.jam_tutup} WIB`
                        : '08:00 - 20:00 WIB'
                      }
                    </span>
                  </div>
                  
                  {/* Nama Jalan */}
                  {branch?.alamat && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ 
                        width: 24, 
                        height: 24, 
                        background: '#eff6ff', 
                        borderRadius: '50%', 
                        display: 'grid', 
                        placeItems: 'center',
                      }}>
                        <MapPin size={12} color="#3b82f6" />
                      </div>
                      <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {branch.alamat}
                      </span>
                    </div>
                  )}
                </div>

                {/* Rating & Detail Button */}
                <div style={{ marginTop: 16, borderTop: '1px solid #f1f5f9', paddingTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Star size={14} fill="#f59e0b" stroke="none" />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>4.8</span>
                    <span style={{ fontSize: 13, color: '#94a3b8' }}>(124 ulasan)</span>
                  </div>
                  
                  <button
                    onClick={() => openUmkmDetail(umkm.umkm_id)}
                    style={{
                      background: '#4f46e5',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      padding: '8px 16px',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#4338ca'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#4f46e5'}
                  >
                    Detail
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )})}
          </div>

          {/* Map */}
          <div style={{ background: '#f1f5f9', borderRadius: 24, overflow: 'hidden', border: '1px solid #e2e8f0', position: 'relative' }}>
            <MapContainer center={mapCenter} zoom={13} style={{ width: '100%', height: '100%', background: '#f8fafc' }}>
              <MapResizer onMapReady={setMapInstance} />
              {/* Custom Minimal Tiles */}
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              {/* User Location Marker */}
              {userLocation && (
                <Marker position={[userLocation.lat, userLocation.lng]} icon={L.icon({
                  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                  popupAnchor: [1, -34],
                  shadowUrl: markerShadow,
                  shadowSize: [41, 41]
                })}>
                  <Popup>
                    <strong>Lokasi Anda</strong>
                  </Popup>
                </Marker>
              )}

              {/* Grid Overlay Effect (Optional) */}

              {markers.map(m => (
                <Marker key={m.key} position={[m.lat, m.lng]}>
                  <Popup>
                    <strong>{m.name}</strong><br />
                    {m.kategori}
                  </Popup>
                </Marker>
              ))}

              {/* Floating Zoom / Controls matching design */}
              <div style={{ position: 'absolute', bottom: 24, right: 24, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ background: '#fff', borderRadius: 12, padding: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                  <span style={{ fontSize: 18, fontWeight: 600 }}>+</span>
                </div>
                <div style={{ background: '#fff', borderRadius: 12, padding: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                  <span style={{ fontSize: 18, fontWeight: 600 }}>-</span>
                </div>
              </div>

            </MapContainer>
          </div>
        </div>

      </main>

      <AuthPopup
        open={authPopupOpen}
        mode={authPopupMode}
        from={authPopupFrom}
        onModeChange={setAuthPopupMode}
        onClose={() => setAuthPopupOpen(false)}
        onAuthed={() => { setAuthPopupOpen(false); if (authPopupFrom) navigate(authPopupFrom); }}
      />
    </div>
  )
}
