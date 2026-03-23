import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { shopApi } from '../api'

const AuthContext = createContext(null)

const DEMO_SHOP = {
  shopDomain:  'flareguard-test.myshopify.com',
  shopName:    'FlareGuard Test',
  shopEmail:   'mouli14112000@gmail.com',
  plan:        'free',
  usage:       { redirectCount: 347, detectedCount: 410 },
  installedAt: new Date().toISOString(),
  isOverLimit: false,
}

export function AuthProvider({ children }) {
  const [token,   setToken]   = useState(() => {
    // Check URL for token from Shopify OAuth
    const params   = new URLSearchParams(window.location.search)
    const urlToken = params.get('token')
    if (urlToken) {
      localStorage.setItem('fg_token', urlToken)
      return urlToken
    }
    return localStorage.getItem('fg_token') || 'demo'
  })
  const [shop, setShop] = useState(DEMO_SHOP)
  const [loading, setLoading] = useState(false)

  // Clean token from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('token')) {
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  // Load real shop data if token exists
  const fetchShop = useCallback(async (t) => {
    setLoading(true)
    try {
      const res = await shopApi.get()
      setShop(res.data)
    } catch {
      // API failed — use demo data
      setShop(DEMO_SHOP)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (token) {
      fetchShop(token)
    }
  }, [token, fetchShop])

  const login = (t) => {
    localStorage.setItem('fg_token', t)
    setToken(t)
  }

  const logout = () => {
    localStorage.removeItem('fg_token')
    setToken(null)
    setShop(null)
  }

  return (
    <AuthContext.Provider value={{
      token,
      shop,
      loading,
      login,
      logout,
      refreshShop: fetchShop,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)