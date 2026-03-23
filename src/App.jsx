import { useState } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { AppProvider, Frame, Navigation, TopBar } from '@shopify/polaris'
import enTranslations from '@shopify/polaris/locales/en.json'
import '@shopify/polaris/build/esm/styles.css'
import { HomeIcon, ChartVerticalIcon, SettingsIcon, NotificationIcon, ColorIcon, CreditCardIcon, QuestionCircleIcon } from '@shopify/polaris-icons'
import { AuthProvider, useAuth } from './context/AuthContext'
import Dashboard from './pages/Dashboard'
import SettingsPage from './pages/Settings'
import LogsPage from './pages/Logs'
import AlertsPage from './pages/Alerts'
import BrandingPage from './pages/Branding'
import BillingPage from './pages/Billing'
import LoginPage from './pages/Login'

function AppShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const { shop, logout, token } = useAuth()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const isPro = shop?.plan === 'pro'
  const path = location.pathname
  // Only show login if token is explicitly null (logged out)
  if (token === null) {
  return (
    <Routes>
      <Route path="*" element={<LoginPage />} />
    </Routes>
  )
    }

  const userMenu = (
    <TopBar.UserMenu
      actions={[{ items: [{ content: 'Log out', onAction: logout }] }]}
      name={shop?.shopName || 'Demo Store'}
      detail={shop?.shopDomain || 'demo.myshopify.com'}
      initials="D"
    />
  )

  const topBar = (
    <TopBar
      showNavigationToggle
      userMenu={userMenu}
      onNavigationToggle={() => setMobileNavOpen(o => !o)}
    />
  )

  const navMarkup = (
    <Navigation location={path}>
      <Navigation.Section items={[
        { label: 'Dashboard', icon: HomeIcon, url: '/', selected: path === '/', onClick: () => navigate('/') },
        { label: 'Detection Logs', icon: ChartVerticalIcon, url: '/logs', selected: path === '/logs', onClick: () => navigate('/logs'), badge: '3' },
      ]} />
      <Navigation.Section title="Configure" items={[
        { label: 'Settings', icon: SettingsIcon, url: '/settings', selected: path === '/settings', onClick: () => navigate('/settings') },
        { label: 'Email Alerts', icon: NotificationIcon, url: '/alerts', selected: path === '/alerts', onClick: () => navigate('/alerts') },
        { label: 'White-label', icon: ColorIcon, url: '/branding', selected: path === '/branding', onClick: () => navigate('/branding'), badge: isPro ? null : 'Pro' },
      ]} />
      <Navigation.Section title="Account" items={[
        { label: isPro ? 'Pro Plan ✓' : 'Upgrade to Pro', icon: CreditCardIcon, url: '/billing', selected: path === '/billing', onClick: () => navigate('/billing') },
        { label: 'Help & Docs', icon: QuestionCircleIcon, url: 'https://docs.flareguard.app', external: true },
      ]} />
    </Navigation>
  )

  return (
    <Frame
      topBar={topBar}
      navigation={navMarkup}
      showMobileNavigation={mobileNavOpen}
      onNavigationDismiss={() => setMobileNavOpen(false)}
    >
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/logs" element={<LogsPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/branding" element={<BrandingPage />} />
        <Route path="/billing" element={<BillingPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Frame>
  )
}

export default function App() {
  return (
    <AppProvider i18n={enTranslations}>
      <AuthProvider>
        <BrowserRouter>
          <AppShell />
        </BrowserRouter>
      </AuthProvider>
    </AppProvider>
  )
}