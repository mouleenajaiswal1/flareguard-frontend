import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Page, Card, FormLayout, TextField, Button,
  BlockStack, Text, Banner, InlineStack,
} from '@shopify/polaris'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [token, setToken] = useState('')
  const [error, setError] = useState('')

  const handleLogin = () => {
    if (!token.trim()) { setError('Please enter your token'); return }
    login(token.trim())
    navigate('/')
  }

  return (
    <Page narrowWidth>
      <div style={{ marginTop: 80 }}>
        <BlockStack gap="500">
          <InlineStack align="center" gap="200">
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: 'linear-gradient(135deg,#ff6b2b,#f59e0b)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22,
            }}>🔥</div>
            <Text variant="headingXl" fontWeight="bold">FlareGuard</Text>
          </InlineStack>

          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd">Sign in to your store</Text>
              <Text tone="subdued">
                Normally you access FlareGuard directly from your Shopify admin.
                Enter your JWT token below if you're accessing it directly.
              </Text>

              {error && <Banner title={error} tone="critical" />}

              <FormLayout>
                <TextField
                  label="JWT Token"
                  value={token}
                  onChange={setToken}
                  autoComplete="off"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  multiline={3}
                />
              </FormLayout>

              <Button variant="primary" onClick={handleLogin} fullWidth>
                Sign In
              </Button>

              <Text variant="bodySm" tone="subdued" alignment="center">
                Install FlareGuard from the{' '}
                <a href="https://apps.shopify.com" style={{ color: '#1d6bf3' }}>
                  Shopify App Store
                </a>
                {' '}to get started.
              </Text>
            </BlockStack>
          </Card>
        </BlockStack>
      </div>
    </Page>
  )
}
