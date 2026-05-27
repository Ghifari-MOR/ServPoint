import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import GoogleCallback from './pages/GoogleCallback'
import Dashboard from './pages/Dashboard'
import Owner from './pages/Owner'
import OwnerMap from './pages/OwnerMap'
import UserMap from './pages/UserMap'
import UmkmForm from './pages/UmkmForm'
import Admin from './pages/Admin'
import UmkmDetail from './pages/UmkmDetail'
import UserSettings from './pages/UserSettings'
import OwnerSettings from './pages/OwnerSettings'
import PrivateRoute from './components/PrivateRoute'
import OwnerGuard from './components/OwnerGuard'
import { AuthProvider } from './context/AuthContext'

function App() {
  useEffect(() => {
    document.title = 'ServicePoint'

    const existingIcon = document.querySelector('link[rel="icon"]')
    if (existingIcon) {
      existingIcon.setAttribute('href', `/logo-sp-v2.svg?v=${Date.now()}`)
    }
  }, [])

  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/google/callback" element={<GoogleCallback />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        
        {/* Owner Dashboard - Require UMKM sudah terdaftar */}
        <Route
          path="/owner"
          element={
            <PrivateRoute allowedRoles={["OWNER"]}>
              <OwnerGuard requireUmkm={true}>
                <Owner />
              </OwnerGuard>
            </PrivateRoute>
          }
        />
        
        {/* Owner Register UMKM - Block jika sudah punya UMKM */}
        <Route
          path="/owner/register-umkm"
          element={
            <PrivateRoute allowedRoles={["USER", "OWNER"]}>
              <OwnerGuard requireUmkm={false}>
                <UmkmForm />
              </OwnerGuard>
            </PrivateRoute>
          }
        />

        <Route
          path="/owner/edit-umkm"
          element={
            <PrivateRoute allowedRoles={["OWNER"]}>
              <OwnerGuard requireUmkm={false}>
                <UmkmForm />
              </OwnerGuard>
            </PrivateRoute>
          }
        />
        
        {/* Legacy route - redirect ke route baru */}
        <Route
          path="/owner/umkm"
          element={<Navigate to="/owner/register-umkm" replace />}
        />
        
        <Route
          path="/owner/map"
          element={
            <PrivateRoute allowedRoles={["OWNER"]}>
              <OwnerMap />
            </PrivateRoute>
          }
        />

        {/* Admin - Require ADMIN role or staff access */}
        <Route
          path="/admin"
          element={
            <PrivateRoute allowedRoles={["ADMIN"]} requireStaff={false}>
              <Admin />
            </PrivateRoute>
          }
        />
        
        {/* User Map - Only for USER role */}
        <Route 
          path="/user-map" 
          element={
            <PrivateRoute allowedRoles={["USER"]}>
              <UserMap />
            </PrivateRoute>
          } 
        />
        <Route path="/user/map" element={<Navigate to="/user-map" replace />} />

        {/* UMKM Detail */}
        <Route
          path="/umkm/:id"
          element={
            <PrivateRoute allowedRoles={["USER", "OWNER", "ADMIN"]}>
              <UmkmDetail />
            </PrivateRoute>
          }
        />

        {/* User Settings - Only for USER role */}
        <Route
          path="/settings"
          element={
            <PrivateRoute allowedRoles={["USER"]}>
              <UserSettings />
            </PrivateRoute>
          }
        />

        {/* Owner Settings */}
        <Route
          path="/owner/settings"
          element={
            <PrivateRoute allowedRoles={["OWNER"]}>
              <OwnerSettings />
            </PrivateRoute>
          }
        />
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App