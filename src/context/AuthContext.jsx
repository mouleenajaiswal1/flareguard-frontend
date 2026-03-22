import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react'
import { shopApi } from '../api'

const AuthContext = createContext(null)

// 🔥 Demo fallback (used only when no token)
const DEMO_SHOP = {
  shopDomain: 'demo.myshopify.com',
  shopName: 'Demo Store',
  shopEmail: 'demo@mystore.com',
  plan: 'free',
  usage: {
    redirectCount: 347,
    detectedCount: 410,
    monthKey: '2026-03',
  },
  installedAt: new Date().toISOString(),
  isOverLimit: false,
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const [shop, setShop] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 🔐 INIT AUTH (URL → localStorage → demo)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlToken = params.get('token')
    const savedToken = localStorage.getItem('fg_token')

    const tokenToUse = urlToken || savedToken

    if (tokenToUse && typeof tokenToUse === 'string') {
      if (urlToken) {
        localStorage.setItem('fg_token', urlToken)

        // ✅ clean URL (important for security)
        window.history.replaceState({}, '', window.location.pathname)
      }

      setToken(tokenToUse)
    } else {
      // 👉 fallback to demo mode
      setToken(null)
      setShop(DEMO_SHOP)
      setLoading(false)
    }
  }, [])

  // 📡 FETCH SHOP DATA (only for real users)
  useEffect(() => {
    if (!token || token === 'demo') return

    const fetchShop = async () => {
      setLoading(true)
      setError(null)

      try {
        const res = await shopApi.get()
        setShop(res.data)
      } catch (err) {
        console.error('Failed to fetch shop:', err)
        setError(err.message || 'Failed to load shop')
        setShop(null)
      } finally {
        setLoading(false)
      }
    }

    fetchShop()
  }, [token])

  // 🔐 LOGIN
  const login = (newToken) => {
    if (!newToken || typeof newToken !== 'string') return

    localStorage.setItem('fg_token', newToken)
    setToken(newToken)
  }

  // 🚪 LOGOUT
  const logout = () => {
    localStorage.removeItem('fg_token')
    setToken(null)
    setShop(null)
    setError(null)
  }

  // 🔄 REFRESH SHOP
  const refreshShop = useCallback(async () => {
    if (!token || token === 'demo') return

    setLoading(true)
    setError(null)

    try {
      const res = await shopApi.get()
      setShop(res.data)
    } catch (err) {
      console.error('Refresh failed:', err)
      setError(err.message || 'Refresh failed')
    } finally {
      setLoading(false)
    }
  }, [token])

  return (
    <AuthContext.Provider
      value={{
        token,
        shop,
        loading,
        error,
        isAuthenticated: !!token && token !== 'demo',
        isDemo: !token,
        login,
        logout,
        refreshShop,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// 🔥 Hook
export const useAuth = () => useContext(AuthContext)