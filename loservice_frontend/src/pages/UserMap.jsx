import { useContext, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import api from '../services/api'
import AuthPopup from '../components/AuthPopup'
import LogoutConfirmModal from '../components/LogoutConfirmModal'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet-routing-machine'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { Search, MapPin, Monitor, Smartphone, Printer, Star, LayoutGrid, Settings, LogOut, Navigation, Map as MapIcon, X, AlertTriangle } from 'lucide-react'
import OwnerStoreIcon from '../components/OwnerStoreIcon'
import { getResponsiveValues } from '../utils/responsive'
import { CATEGORY_OPTIONS, DEFAULT_CATEGORY } from '../constants/categories'

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const currentLocationIcon = L.divIcon({
  className: 'current-location-icon',
  html: `
    <svg viewBox="0 0 512 512" width="48" height="48" aria-hidden="true" focusable="false">
      <path d="M256 32C150.2 32 64 118.2 64 224c0 135.2 176 256 192 256s192-120.8 192-256C448 118.2 361.8 32 256 32z" fill="#2d9cf4"/>
      <circle cx="256" cy="152" r="52" fill="#ffffff"/>
      <path d="M188 320c0-37.6 30.4-68 68-68h0c37.6 0 68 30.4 68 68v26H188v-26z" fill="#ffffff"/>
    </svg>
  `,
  iconSize: [48, 48],
  iconAnchor: [24, 48],
  popupAnchor: [0, -42],
})

const umkmMarkerIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: markerShadow,
  shadowSize: [41, 41]
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

  // Responsive state
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  const reponsive = getResponsiveValues()
  const isMobile = windowWidth <= 768
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [showBusinessUpgradeModal, setShowBusinessUpgradeModal] = useState(false)

  const [query, setQuery] = useState('')
  const [umkmResults, setUmkmResults] = useState([])
  const [loadingUmkm, setLoadingUmkm] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(DEFAULT_CATEGORY)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMapModal, setShowMapModal] = useState(false)

  const [authPopupOpen, setAuthPopupOpen] = useState(false)
  const [authPopupMode, setAuthPopupMode] = useState('login')
  const [authPopupFrom, setAuthPopupFrom] = useState('')

  const [userLocation, setUserLocation] = useState(null)
  const [routingControl, setRoutingControl] = useState(null)
  const [routeTarget, setRouteTarget] = useState(null)
  const [mapInstance, setMapInstance] = useState(null)
  const [mapCenterState, setMapCenterState] = useState(null)

  const refreshResults = async () => {
    try {
      const params = { status: 'APPROVED' }
      if (query.trim()) params.q = query.trim()

      if (selectedCategory && selectedCategory !== DEFAULT_CATEGORY) {
        params.kategori = selectedCategory
      }

      const { data } = await api.get('/umkm/', { params })
      setUmkmResults(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('Error fetching UMKM:', e)
    }
  }

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const handleReviewPing = (event) => {
      if (event.key === 'servpoint_analytics_ping') {
        refreshResults()
      }
    }

    const handleLocalReviewPing = () => {
      refreshResults()
    }

    window.addEventListener('storage', handleReviewPing)
    window.addEventListener('servpoint_analytics_ping', handleLocalReviewPing)
    return () => {
      window.removeEventListener('storage', handleReviewPing)
      window.removeEventListener('servpoint_analytics_ping', handleLocalReviewPing)
    }
  }, [query, selectedCategory])

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

  const handleOpenBusinessUpgrade = () => {
    setShowUserMenu(false)
    setShowBusinessUpgradeModal(true)
  }

  const handleConfirmBusinessUpgrade = () => {
    setShowBusinessUpgradeModal(false)
    navigate('/owner/register-umkm')
  }

  const getBusinessStatus = (umkm) => {
    const branch = Array.isArray(umkm?.branches) ? umkm.branches[0] : null
    return branch?.is_open_now !== false
  }

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Browser Anda tidak mendukung GPS.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }

        setUserLocation(nextLocation)

        if (mapInstance) {
          mapInstance.flyTo([nextLocation.lat, nextLocation.lng], 16, {
            animate: true,
            duration: 0.75
          })
        }
      },
      () => {
        alert('Tidak bisa mengambil lokasi Anda. Pastikan izin lokasi aktif.')
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
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

      setRouteTarget({ lat: umkmLat, lng: umkmLng })

      // Create new route with error handling
      const control = L.Routing.control({
        waypoints: [
          L.latLng(userLocation.lat, userLocation.lng),
          L.latLng(umkmLat, umkmLng)
        ],
        router: L.Routing.osrmv1({
          serviceUrl: 'https://router.project-osrm.org/route/v1'
        }),
        routeWhileDragging: false,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        showAlternatives: false,
        lineOptions: {
          styles: [{ color: '#3b82f6', opacity: 0.8, weight: 5 }]
        },
        containerClassName: 'custom-routing-container',
        createMarker: function(i, waypoint, n) {
          if (i === 0) {
            return null
          }

          const marker = L.marker(waypoint.latLng, {
            draggable: false,
            icon: L.icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowUrl: markerShadow,
              shadowSize: [41, 41]
            })
          })

          marker.bindPopup('Tujuan')
          
          return marker
        }
      })

      control.addTo(mapInstance)

      // Apply custom styling to routing container after it's created
      const maxAttempts = 20
      let attempts = 0
      
      const applyStyles = () => {
        attempts++
        const routingContainer = document.querySelector('.custom-routing-container')
        
        if (routingContainer) {
          try {
            const containerHeight = isMobile ? '140px' : '300px'
            const containerPadding = isMobile ? '8px' : '12px'
            const fontSize = isMobile ? '11px' : '12px'
            
            routingContainer.style.cssText = `
              background: white !important;
              border: 2px solid #3b82f6 !important;
              border-radius: 12px !important;
              box-shadow: 0 10px 25px rgba(0,0,0,0.15) !important;
              padding: ${containerPadding} !important;
              font-family: system-ui, -apple-system, sans-serif !important;
              max-height: ${containerHeight} !important;
              overflow-y: auto !important;
              font-size: ${fontSize} !important;
            `
            
            // Mobile: Hide semua instructions kecuali yang pertama
            if (isMobile) {
              const instructions = routingContainer.querySelectorAll('.leaflet-routing-alt')
              instructions.forEach((inst, idx) => {
                if (idx > 0) {
                  inst.style.display = 'none'
                }
              })
            }
            
            // Style all text elements
            const textElements = routingContainer.querySelectorAll('*')
            textElements.forEach(el => {
              el.style.color = '#1e293b'
              el.style.backgroundColor = 'transparent'
              if (isMobile) {
                el.style.fontSize = '10px'
                el.style.padding = '2px'
                el.style.margin = '2px 0'
              }
            })
            
            // Style headers
            const headers = routingContainer.querySelectorAll('h2, h3')
            headers.forEach(h => {
              h.style.color = '#3b82f6'
              h.style.fontWeight = '700'
              h.style.fontSize = isMobile ? '12px' : '14px'
              h.style.marginBottom = isMobile ? '4px' : '8px'
              h.style.margin = isMobile ? '0 0 4px 0' : '0 0 8px 0'
            })
            
            // Style instructions
            const instructions = routingContainer.querySelectorAll('.leaflet-routing-alt')
            instructions.forEach((inst, idx) => {
              inst.style.background = '#f8fafc'
              inst.style.padding = isMobile ? '4px 6px' : '8px'
              inst.style.borderRadius = '8px'
              inst.style.marginBottom = isMobile ? '6px' : '8px'
              inst.style.fontSize = isMobile ? '10px' : '12px'
              inst.style.border = isMobile && idx === 0 ? '2px solid #3b82f6' : 'none'
              inst.style.backgroundColor = isMobile && idx === 0 ? '#e0e7ff' : '#f8fafc'
            })
          } catch (e) {
            console.error('Error styling routing container:', e)
          }
        } else if (attempts < maxAttempts) {
          // Retry if container not ready yet
          setTimeout(applyStyles, 100)
        }
      }

      applyStyles()
      setRoutingControl(control)
    } catch (error) {
      console.error('Error creating route:', error)
      alert('Gagal membuat rute. Error: ' + error.message)
    }
  }

  // Clear route from map
  const clearRoute = () => {
    if (routingControl && mapInstance) {
      try {
        mapInstance.removeControl(routingControl)
        setRoutingControl(null)
        setRouteTarget(null)
        console.log('Route cleared')
      } catch (error) {
        console.error('Error clearing route:', error)
      }
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

        if (selectedCategory && selectedCategory !== DEFAULT_CATEGORY) {
          params.kategori = selectedCategory
        }

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
  }, [query, selectedCategory])

  useEffect(() => {
    const interval = setInterval(() => {
      refreshResults()
    }, 15000)

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshResults()
      }
    }

    window.addEventListener('focus', refreshResults)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', refreshResults)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [query, selectedCategory])

  // Auto-show route if navigated from detail page with coords
  useEffect(() => {
    const state = location.state
    
    // Handle mobile MapModal dengan route
    if (state?.openMapModal && isMobile) {
      setMapCenterState(state.mapCenter)
      setShowMapModal(true)
      if (state?.umkmName) {
        setQuery(state.umkmName)
      }
      
      // Show route after modal opens - wait untuk map ready
      const timer = setTimeout(() => {
        if (userLocation && mapInstance && state?.mapCenter) {
          try {
            showRoute(state.mapCenter.lat, state.mapCenter.lng)
            window.history.replaceState({}, document.title)
          } catch (error) {
            console.error('Error showing route in mobile modal:', error)
          }
        } else if (!userLocation) {
          console.log('Waiting for location/map...', { userLocation, mapInstance })
        }
      }, 1500)
      
      return () => clearTimeout(timer)
    }
    
    // Handle mobile MapCenter (tanpa route)
    if (state?.mapCenter && isMobile && !state?.openMapModal) {
      setMapCenterState(state.mapCenter)
      if (state?.searchQuery) {
        setQuery(state.searchQuery)
      }
      window.history.replaceState({}, document.title)
      return
    }
    
    // Handle desktop showRoute
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
  }, [location.state, userLocation, mapInstance, isMobile])

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

  const mapCenter = mapCenterState ? [mapCenterState.lat, mapCenterState.lng] : (markers.length ? [markers[0].lat, markers[0].lng] : [-6.353, 106.832]) // Default near STT-NF
  const resultCount = umkmResults.length
  const routeTargetKey = routeTarget ? `${routeTarget.lat.toFixed(6)}:${routeTarget.lng.toFixed(6)}` : null
  const isRouteActive = Boolean(routeTargetKey)
  const visibleMarkers = isRouteActive
    ? markers.filter((m) => `${m.lat.toFixed(6)}:${m.lng.toFixed(6)}` === routeTargetKey)
    : markers

  const getCategoryIcon = (cat) => {
    const c = (cat || '').toLowerCase()
    if (c.includes('pc') || c.includes('laptop') || c.includes('komputer')) return <Monitor size={20} color="#3b82f6" />
    if (c.includes('hp') || c.includes('handphone') || c.includes('phone')) return <Smartphone size={20} color="#10b981" />
    if (c.includes('printer')) return <Printer size={20} color="#06b6d4" />
    return <LayoutGrid size={20} color="#6b7280" />
  }

  // Debug log
  console.log('UserMap render', { userLocation, mapInstance, hasState: !!location.state })

  const getAverageRating = (umkm) => Number(umkm?.average_rating || 0).toFixed(1)
  const getReviewCount = (umkm) => Number(umkm?.total_reviews || 0)

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <main style={{ width: '100%', padding: isMobile ? '12px 12px' : '24px 32px', display: 'flex', flexDirection: 'column', gap: isMobile ? 12 : 24, overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 8 : 0,
          position: 'relative'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: isMobile ? 9 : 12, fontWeight: 700, color: '#3b82f6', letterSpacing: 0.5, marginBottom: 2 }}>
              <img
                src="/logo-sp-v2.svg"
                alt="ServicePoint"
                style={{ width: isMobile ? 12 : 16, height: isMobile ? 12 : 16, objectFit: 'contain', flexShrink: 0 }}
              />
              <span>SERVICEPOINT</span>
            </div>
            <h1 style={{ 
              fontSize: isMobile ? 18 : 28, 
              fontWeight: 800, 
              color: '#0f172a', 
              margin: '0 0 4px' 
            }}>Temukan Tempat Servis</h1>
            <p style={{ 
              color: '#64748b', 
              margin: 0,
              fontSize: isMobile ? 12 : 14
            }}>Bengkel terverifikasi untuk Laptop, PC, dan HP di sekitar kampus.</p>
          </div>

          {/* User Profile Section - Responsive */}
          {user && (
            <div style={{ 
              position: 'absolute', 
              top: isMobile ? '-8px' : '16px',
              right: isMobile ? '-8px' : 0,
              alignSelf: 'auto'
            }}>
              <div 
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: isMobile ? 8 : 12, 
                  background: '#fff',
                  padding: isMobile ? '6px 10px' : '8px 12px',
                  borderRadius: isMobile ? 10 : 12,
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6'
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(79, 70, 229, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0'
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'
                }}
              >
                {!isMobile && (
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                      {user.name || 'User'}
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
                      {user.email}
                    </p>
                  </div>
                )}
                {user.profile_picture_url ? (
                  <img 
                    src={user.profile_picture_url} 
                    alt={user.name || 'User'}
                    style={{ 
                      width: isMobile ? 36 : 44, 
                      height: isMobile ? 36 : 44, 
                      borderRadius: '50%', 
                      objectFit: 'cover',
                      border: '3px solid #e0e7ff'
                    }}
                  />
                ) : (
                  <div style={{ 
                    width: isMobile ? 36 : 44, 
                    height: isMobile ? 36 : 44, 
                    background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)', 
                    borderRadius: '50%', 
                    display: 'grid', 
                    placeItems: 'center', 
                    color: '#3b82f6', 
                    fontWeight: 700,
                    fontSize: isMobile ? 14 : 18,
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
                  {String(user?.role || '').toUpperCase() === 'USER' && (
                    <button
                      onClick={handleOpenBusinessUpgrade}
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
                        color: '#0f766e',
                        textAlign: 'left',
                        transition: 'all 0.2s',
                        borderBottom: '1px solid #e2e8f0'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f0fdfa'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <OwnerStoreIcon size={16} />
                      Daftarkan Usaha Saya
                    </button>
                  )}
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

        {/* Search Bar - Responsive */}
        <div style={{ 
          background: '#fff', 
          padding: isMobile ? '10px 10px' : '8px 8px', 
          borderRadius: 16, 
          border: '1px solid #e2e8f0', 
          display: 'flex', 
          gap: isMobile ? 6 : 12, 
          alignItems: 'center', 
          flexWrap: isMobile ? 'wrap' : 'nowrap',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' 
        }}>
          <div style={{ flex: isMobile ? '1 0 100%' : '1', display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 10, minWidth: 0, position: 'relative' }}>
            <Search size={isMobile ? 18 : 20} color="#cbd5e1" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
              <input
                placeholder={isMobile ? "Cari servis atau produk..." : "Cari nama UMKM, produk, atau layanan (mis: servis laptop, ganti layar HP)..."}
                style={{ 
                  border: 'none', 
                  outline: 'none', 
                  width: '100%', 
                  fontSize: isMobile ? 12 : 15, 
                  color: '#1e293b' 
                }}
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
          </div>

          {!isMobile && <div style={{ height: 24, width: 1, background: '#e2e8f0', flexShrink: 0 }} />}

          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 4 : 8, paddingRight: isMobile ? 6 : 8, flexWrap: isMobile ? 'wrap' : 'nowrap', justifyContent: isMobile ? 'flex-end' : 'center', flex: isMobile ? '1 0 100%' : '0 1 auto' }}>
            <select
              style={{
                border: '1px solid #e2e8f0',
                outline: 'none',
                background: '#fff',
                fontWeight: 600,
                color: '#475569',
                cursor: 'pointer',
                padding: isMobile ? '7px 8px' : '10px 12px',
                borderRadius: 10,
                minWidth: isMobile ? 110 : 160,
                fontSize: isMobile ? 11 : 14,
                WebkitAppearance: 'menulist',
                appearance: 'auto',
                flexShrink: 0
              }}
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
            >
              <option value={DEFAULT_CATEGORY}>{DEFAULT_CATEGORY}</option>
              {CATEGORY_OPTIONS.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>

            {!isMobile && (
              <button style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #d1fae5', padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}>
                <MapPin size={16} /> Area Kampus
              </button>
            )}

            {isMobile ? (
              <button 
                onClick={() => setShowMapModal(true)}
                style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '7px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
              >
                <MapIcon size={14} /> Map
              </button>
            ) : (
              <button style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
                Cari
              </button>
            )}
          </div>
        </div>

        {/* Filters & Results Count */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: isMobile ? 13 : 16, color: '#1e293b' }}>
            <strong>{resultCount} Hasil</strong> <span style={{ fontWeight: 400, color: '#64748b' }}>ditemukan</span>
          </h3>
        </div>

        {/* Content Grid - Responsive */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : 'minmax(300px, 330px) 1fr', 
          gap: isMobile ? 16 : 24, 
          height: isMobile ? 'auto' : 'calc(100vh - 280px)',
          maxHeight: isMobile ? 'none' : 'calc(100vh - 280px)'
        }}>

          {/* Results List */}
          <div style={{ 
            overflowY: isMobile ? 'visible' : 'auto', 
            paddingRight: isMobile ? 0 : 8, 
            display: 'flex', 
            flexDirection: 'column', 
            gap: isMobile ? 12 : 16,
            maxHeight: isMobile ? 'none' : 'calc(100vh - 280px)'
          }}>
            {loadingUmkm ? (
              <div style={{ padding: 20, textAlign: 'center', color: '#64748b' }}>Memuat data...</div>
            ) : umkmResults.map(umkm => {
              const branch = umkm.branches?.[0]
              const coords = branch?.geom?.coordinates
              const distance = userLocation && coords ? 
                calculateDistance(userLocation.lat, userLocation.lng, coords[1], coords[0]) : null
              
              return (
              <div 
                key={umkm.umkm_id}
                onClick={() => openUmkmDetail(umkm.umkm_id)}
                style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: isMobile ? 10 : 16, transition: 'all 0.2s', position: 'relative', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', cursor: 'pointer' }}
                className="hover:shadow-md hover:border-indigo-300"
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)'
                  e.currentTarget.style.borderColor = '#3b82f6'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0,0,0,0.05)'
                  e.currentTarget.style.borderColor = '#e2e8f0'
                }}
              >
                {/* Badge Rekomendasi */}
                <div style={{ position: 'absolute', top: 0, right: 0, background: '#3b82f6', color: '#fff', fontSize: isMobile ? 7 : 9, fontWeight: 700, padding: isMobile ? '3px 8px' : '4px 10px', borderRadius: '0 12px 0 10px', textTransform: 'uppercase' }}>
                  REKOMENDASI
                </div>

                <div style={{ display: 'flex', gap: isMobile ? 10 : 16 }}>
                  {/* UMKM Image or Category Icon */}
                  <div style={{ 
                    width: isMobile ? 48 : 64, 
                    height: isMobile ? 48 : 64, 
                    background: umkm.primary_image ? 'transparent' : '#f1f5f9', 
                    borderRadius: 10, 
                    display: 'grid', 
                    placeItems: 'center',
                    overflow: 'hidden',
                    flexShrink: 0
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
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ margin: '0 0 3px', fontSize: isMobile ? 13 : 16, fontWeight: 700, color: '#1e293b' }}>{umkm.nama_umkm}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: isMobile ? 11 : 13, color: '#64748b', marginBottom: 6 }}>
                      <MapPin size={isMobile ? 12 : 14} /> 
                      {distance ? formatDistance(distance) : '-- m'} • <span style={{ color: getBusinessStatus(umkm) ? '#16a34a' : '#dc2626', fontWeight: 600 }}>{getBusinessStatus(umkm) ? 'Buka' : 'Tutup'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <span style={{ background: '#f1f5f9', padding: isMobile ? '2px 6px' : '2px 8px', borderRadius: 6, fontSize: isMobile ? 10 : 11, fontWeight: 500, color: '#475569' }}>
                        {umkm?.kategori?.nama_kategori || 'Umum'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Operating Hours & Address */}
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {/* Jam Operasional */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ 
                      width: isMobile ? 20 : 24, 
                      height: isMobile ? 20 : 24, 
                      background: '#f0fdf4', 
                      borderRadius: '50%', 
                      display: 'grid', 
                      placeItems: 'center',
                    }}>
                      <span style={{ fontSize: isMobile ? 10 : 12 }}>🕐</span>
                    </div>
                    <span style={{ fontSize: isMobile ? 10 : 12, color: '#64748b', fontWeight: 500 }}>
                      {branch?.jam_buka && branch?.jam_tutup
                        ? `${branch.jam_buka} - ${branch.jam_tutup} WIB`
                        : '08:00 - 20:00 WIB'
                      }
                    </span>
                  </div>
                  
                  {/* Nama Jalan */}
                  {branch?.alamat && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ 
                        width: isMobile ? 20 : 24, 
                        height: isMobile ? 20 : 24, 
                        background: '#eff6ff', 
                        borderRadius: '50%', 
                        display: 'grid', 
                        placeItems: 'center',
                      }}>
                        <MapPin size={isMobile ? 10 : 12} color="#3b82f6" />
                      </div>
                      <span style={{ fontSize: isMobile ? 10 : 12, color: '#64748b', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {branch.alamat}
                      </span>
                    </div>
                  )}
                </div>

                {/* Rating */}
                <div style={{ marginTop: 12, borderTop: '1px solid #f1f5f9', paddingTop: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Star size={isMobile ? 12 : 14} fill="#f59e0b" stroke="none" />
                  <span style={{ fontSize: isMobile ? 11 : 13, fontWeight: 700, color: '#1e293b' }}>
                    {getAverageRating(umkm)}
                  </span>
                  <span style={{ fontSize: isMobile ? 10 : 13, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    ({getReviewCount(umkm)} ulasan)
                  </span>
                </div>
              </div>
            )})}
          </div>

          {/* Map - Hidden on Mobile, Modal Available */}
          {!isMobile && (
            <div style={{ background: '#f1f5f9', borderRadius: 24, overflow: 'hidden', border: '1px solid #e2e8f0', position: 'relative' }}>
              <MapContainer center={mapCenter} zoom={13} style={{ width: '100%', height: '100%', background: '#f8fafc' }} maxBounds={[[ -85, -180 ], [ 85, 180 ]]} maxBoundsViscosity={1} worldCopyJump={false}>
                <MapResizer onMapReady={setMapInstance} />
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  noWrap
                />

                {userLocation && (
                  <Marker position={[userLocation.lat, userLocation.lng]} icon={currentLocationIcon}>
                    <Popup>
                      <strong>Lokasi Anda</strong>
                    </Popup>
                  </Marker>
                )}

                {visibleMarkers.map(m => (
                  <Marker key={m.key} position={[m.lat, m.lng]} icon={umkmMarkerIcon}>
                    <Popup>
                      <strong>{m.name}</strong><br />
                      {m.kategori}
                    </Popup>
                  </Marker>
                ))}

                <div style={{ position: 'absolute', bottom: 24, right: 24, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button
                    onClick={handleLocateMe}
                    title="Cari posisi saya"
                    style={{
                      background: '#3b82f6',
                      color: '#fff',
                      borderRadius: 12,
                      padding: 10,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      cursor: 'pointer',
                      display: 'grid',
                      placeItems: 'center',
                      border: 'none',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
                  >
                    <Navigation size={18} />
                  </button>
                  {routingControl && (
                    <button
                      onClick={clearRoute}
                      title="Hapus Rute"
                      style={{
                        background: '#ef4444',
                        borderRadius: 12,
                        padding: 8,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        display: 'grid',
                        placeItems: 'center',
                        border: 'none',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
                    >
                      <X size={18} color="#fff" />
                    </button>
                  )}
                </div>

              </MapContainer>
            </div>
          )}
        </div>

        {/* Map Modal - Mobile Only */}
        {isMobile && showMapModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: '#f1f5f9',
            zIndex: 2000,
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              background: '#fff',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a' }}>Peta</h2>
              <button
                onClick={() => setShowMapModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={24} color="#475569" />
              </button>
            </div>

            {/* Modal Map */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <MapContainer center={mapCenter} zoom={13} style={{ width: '100%', height: '100%', background: '#f8fafc' }} maxBounds={[[ -85, -180 ], [ 85, 180 ]]} maxBoundsViscosity={1} worldCopyJump={false}>
                <MapResizer onMapReady={setMapInstance} />
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  noWrap
                />

                {userLocation && (
                  <Marker position={[userLocation.lat, userLocation.lng]} icon={currentLocationIcon}>
                    <Popup>
                      <strong>Lokasi Anda</strong>
                    </Popup>
                  </Marker>
                )}

                {visibleMarkers.map(m => (
                  <Marker key={m.key} position={[m.lat, m.lng]} icon={umkmMarkerIcon}>
                    <Popup>
                      <strong>{m.name}</strong><br />
                      {m.kategori}
                    </Popup>
                  </Marker>
                ))}

                <div style={{ position: 'absolute', bottom: 24, right: 24, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button
                    onClick={handleLocateMe}
                    title="Cari posisi saya"
                    style={{
                      background: '#3b82f6',
                      color: '#fff',
                      borderRadius: 12,
                      padding: 10,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      cursor: 'pointer',
                      display: 'grid',
                      placeItems: 'center',
                      border: 'none',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
                  >
                    <Navigation size={18} />
                  </button>
                  {routingControl && (
                    <button
                      onClick={clearRoute}
                      title="Hapus Rute"
                      style={{
                        background: '#ef4444',
                        borderRadius: 12,
                        padding: 8,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        cursor: 'pointer',
                        display: 'grid',
                        placeItems: 'center',
                        border: 'none',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
                    >
                      <X size={18} color="#fff" />
                    </button>
                  )}
                </div>

              </MapContainer>
            </div>
          </div>
        )}

      </main>

      <AuthPopup
        open={authPopupOpen}
        mode={authPopupMode}
        from={authPopupFrom}
        onModeChange={setAuthPopupMode}
        onClose={() => setAuthPopupOpen(false)}
        onAuthed={() => { setAuthPopupOpen(false); if (authPopupFrom) navigate(authPopupFrom); }}
      />
      <LogoutConfirmModal 
        isOpen={showLogoutModal}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />

      {showBusinessUpgradeModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.62)',
          zIndex: 3000,
          display: 'grid',
          placeItems: 'center',
          padding: 20
        }}>
          <div style={{
            width: '100%',
            maxWidth: 520,
            background: '#fff',
            borderRadius: 20,
            boxShadow: '0 24px 80px rgba(15, 23, 42, 0.28)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '22px 24px 16px',
              background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#fee2e2', display: 'grid', placeItems: 'center', color: '#dc2626' }}>
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Ubah Akun Menjadi Bisnis</p>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>Perubahan peran dari USER ke OWNER bersifat permanen.</p>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: '#334155' }}>
                Jika Anda melanjutkan, akun Anda akan didaftarkan sebagai OWNER untuk mengelola UMKM. Perubahan ini tidak dapat dibatalkan ke peran semula.
              </p>
            </div>

            <div style={{ padding: '18px 24px 24px' }}>
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 14, padding: 14, marginBottom: 20, color: '#991b1b', fontSize: 13, lineHeight: 1.6 }}>
                Setelah menekan <strong>Lanjutkan</strong>, Anda akan masuk ke formulir pendaftaran UMKM dan jika berhasil disubmit, role akun akan otomatis berubah menjadi OWNER.
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setShowBusinessUpgradeModal(false)}
                  style={{
                    padding: '12px 18px',
                    borderRadius: 12,
                    border: '1px solid #cbd5e1',
                    background: '#fff',
                    color: '#334155',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmBusinessUpgrade}
                  style={{
                    padding: '12px 18px',
                    borderRadius: 12,
                    border: 'none',
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    color: '#fff',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Lanjutkan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
