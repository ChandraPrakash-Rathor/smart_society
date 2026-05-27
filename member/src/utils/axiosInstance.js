import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://smart-society-h7px.onrender.com/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto logout on 401
axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default axiosInstance
