import axios from 'axios'

const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

// ==============================
// 🔥 AXIOS INSTANCE
// ==============================
const api = axios.create({
  baseURL: BASE,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ==============================
// 🔐 REQUEST INTERCEPTOR
// ==============================
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fg_token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// ==============================
// 🚨 RESPONSE INTERCEPTOR
// ==============================
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status

    if (status === 401) {
      localStorage.removeItem('fg_token')

      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    return Promise.reject(err)
  }
)

// ════════════════════════════════════════════════════
// 🏪 SHOP
// ════════════════════════════════════════════════════
export const shopApi = {
  get: () => api.get('/shop'),

  getSettings: () => api.get('/settings'),
  saveSettings: (data) => api.put('/settings', data),

  getAlerts: () => api.get('/alerts'),
  saveAlerts: (data) => api.put('/alerts', data),
  testAlert: () => api.post('/alerts/test'),

  getBranding: () => api.get('/branding'),
  saveBranding: (data) => api.put('/branding', data),
}

// ════════════════════════════════════════════════════
// 📊 ANALYTICS
// ════════════════════════════════════════════════════
export const analyticsApi = {
  summary: (days = 7) =>
    api.get('/analytics/summary', { params: { days } }),

  daily: (days = 7) =>
    api.get('/analytics/daily', { params: { days } }),

  platforms: () => api.get('/analytics/platforms'),
  os: () => api.get('/analytics/os'),
}

// ════════════════════════════════════════════════════
// 📡 EVENTS / LOGS
// ════════════════════════════════════════════════════
export const eventsApi = {
  list: (params = {}) => api.get('/events', { params }),

  export: () =>
    api.get('/events/export', {
      responseType: 'blob',
    }),
}

// ════════════════════════════════════════════════════
// 💳 BILLING
// ════════════════════════════════════════════════════
export const billingApi = {
  status: () => api.get('/billing/status'),

  upgrade: async () => {
    const res = await api.get('/billing/upgrade')

    // 🔥 Shopify redirect handling
    if (res.data?.confirmationUrl) {
      window.open(res.data.confirmationUrl, '_top')
    }

    return res
  },

  downgrade: () => api.post('/billing/downgrade'),
}

// ════════════════════════════════════════════════════
// 📤 FILE DOWNLOAD HELPER
// ════════════════════════════════════════════════════
export const downloadFile = (blob, filename = 'file.csv') => {
  const url = window.URL.createObjectURL(new Blob([blob]))
  const link = document.createElement('a')

  link.href = url
  link.setAttribute('download', filename)

  document.body.appendChild(link)
  link.click()

  link.remove()
}

// ==============================
// 🚀 EXPORT
// ==============================
export default api