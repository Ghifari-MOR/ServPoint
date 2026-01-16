import { useContext, useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import api from '../services/api'

export default function OwnerGuard({ children, requireUmkm = false }) {
  const { user, loading: authLoading } = useContext(AuthContext)
  const location = useLocation()
  const [checking, setChecking] = useState(true)
  const [hasUmkm, setHasUmkm] = useState(false)

  useEffect(() => {
    let active = true
    
    const checkOwnerUmkm = async () => {
      if (!user || user.role !== 'OWNER') {
        console.log('[OwnerGuard] User is not OWNER or not loaded:', user?.role)
        if (active) setChecking(false)
        return
      }

      console.log('[OwnerGuard] Checking UMKM for owner:', user.email)

      try {
        const { data } = await api.get('/umkm/')
        console.log('[OwnerGuard] UMKM API response:', data)
        const umkmList = Array.isArray(data) ? data : []
        console.log('[OwnerGuard] UMKM count:', umkmList.length)
        if (active) {
          setHasUmkm(umkmList.length > 0)
          setChecking(false)
        }
      } catch (e) {
        console.error('[OwnerGuard] Error fetching UMKM:', e)
        console.error('[OwnerGuard] Error response:', e?.response?.data)
        if (active) {
          setHasUmkm(false)
          setChecking(false)
        }
      }
    }

    checkOwnerUmkm()
    
    return () => {
      active = false
    }
  }, [user])

  if (authLoading || checking) {
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
            borderTopColor: '#4f46e5',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#64748b', fontSize: 14 }}>Memuat data UMKM...</p>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    )
  }

  // Jika di halaman /owner (dashboard) tapi belum punya UMKM -> redirect ke form
  if (requireUmkm && !hasUmkm) {
    console.log('[OwnerGuard] Redirecting to register-umkm (no UMKM found)')
    return <Navigate to="/owner/register-umkm" replace />
  }

  // Jika di halaman /owner/register-umkm tapi sudah punya UMKM -> redirect ke dashboard
  if (!requireUmkm && hasUmkm && location.pathname === '/owner/register-umkm') {
    console.log('[OwnerGuard] Redirecting to owner dashboard (UMKM already exists)')
    return <Navigate to="/owner" replace />
  }

  console.log('[OwnerGuard] Access granted, requireUmkm:', requireUmkm, 'hasUmkm:', hasUmkm)
  return children
}