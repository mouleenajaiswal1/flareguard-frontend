import { createContext, useContext, useState } from 'react'

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
  const [shop]  = useState(DEMO_SHOP)
  const [token] = useState('demo-token')

  return (
    <AuthContext.Provider value={{
      token,
      shop,
      loading:         false,
      error:           null,
      isAuthenticated: true,
      isDemo:          true,
      login:           () => {},
      logout:          () => {},
      refreshShop:     () => {},
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)