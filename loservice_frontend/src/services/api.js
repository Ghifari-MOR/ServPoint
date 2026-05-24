import axios from 'axios'

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim()
const isLocalhostUrl = (value) => /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?(\/.*)?$/i.test(value || '')
const apiOrigin = (configuredApiUrl && !isLocalhostUrl(configuredApiUrl) ? configuredApiUrl : window.location.origin).replace(/\/$/, '')
const API_BASE_URL = `${apiOrigin}/api`

const api = axios.create({
  baseURL: API_BASE_URL,
  // Jangan set default Content-Type, biar setiap request tentukan sendiri
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  // Set Content-Type ke JSON kecuali sudah diset atau ada FormData
  if (!config.headers['Content-Type'] && !(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json'
  }
  
  // Hapus Content-Type untuk FormData, biar browser yang set dengan boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  
  return config
})

let isRefreshing = false
let pendingQueue = []

const processQueue = (token = null, error = null) => {
  pendingQueue.forEach(({ resolve, reject, originalRequest }) => {
    if (token) {
      originalRequest.headers.Authorization = `Bearer ${token}`
      resolve(api(originalRequest))
    } else {
      reject(error)
    }
  })
  pendingQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {}
    const status = error.response?.status
    const refresh = localStorage.getItem('refresh')

    if (status === 401 && refresh && !originalRequest._retry) {
      originalRequest._retry = true

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject, originalRequest })
        })
      }

      isRefreshing = true
      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, { refresh })
        const newAccess = data.access
        localStorage.setItem('token', newAccess)
        api.defaults.headers.common.Authorization = `Bearer ${newAccess}`
        processQueue(newAccess, null)
        return api(originalRequest)
      } catch (err) {
        processQueue(null, err)
        localStorage.removeItem('token')
        localStorage.removeItem('refresh')
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
