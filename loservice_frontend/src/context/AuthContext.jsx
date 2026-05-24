import { createContext, useEffect, useState } from 'react'
import api from '../services/api'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    const token = localStorage.getItem('token')
    
    const boot = async () => {
      try {
        if (!token) {
          if (active) {
            setUser(null)
            setLoading(false)
          }
          return
        }
        // Always resolve the real user behind the token
        const { data } = await api.get('/auth/me/')
        if (active) setUser(data)
      } catch (e) {
        console.error('Auth check failed:', e.message)
        // Check if it's a network error vs auth error
        if (e.code === 'ERR_NETWORK' || !e.response) {
          console.error('Backend server tidak dapat diakses. Pastikan server production berjalan dan VITE_API_URL sudah benar.')
        }
        // token invalid/expired -> clear
        localStorage.removeItem('token')
        localStorage.removeItem('refresh')
        if (active) setUser(null)
      } finally {
        if (active) setLoading(false)
      }
    }
    
    boot()
    
    return () => {
      active = false
    }
  }, [])

  const login = async (email, password) => {
    setError(null)
    try {
      const res = await api.post('/auth/login/', { email, password })
      const { access, refresh, user: userData } = res.data
      localStorage.setItem('token', access)
      localStorage.setItem('refresh', refresh)
      setUser(userData)
      return res.data
    } catch (e) {
      setError(e?.response?.data?.detail || 'Login gagal')
      throw e
    }
  }

  const register = async (payload) => {
    setError(null)
    try {
      // Tentukan endpoint berdasarkan role
      const role = (payload.role || '').toUpperCase()
      const endpoint = role === 'OWNER' ? '/auth/register-owner/' : '/auth/register/'
      console.log('[AuthContext] Register to endpoint:', endpoint, 'with role:', role)
      
      const res = await api.post(endpoint, payload)
      const { access, refresh, user: userData } = res.data
      localStorage.setItem('token', access)
      localStorage.setItem('refresh', refresh)
      setUser(userData)
      console.log('[AuthContext] Registration success, user role:', userData.role)
      return res.data
    } catch (e) {
      setError(e?.response?.data?.detail || 'Registrasi gagal')
      throw e
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refresh')
    setUser(null)
  }

  const updateUser = (userData) => {
    setUser(userData)
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}