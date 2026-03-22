import { useState } from 'react'
import {
  Page, Layout, Card, BlockStack, InlineStack, Text,
  Badge, Banner, Button, List, Divider, Box,
} from '@shopify/polaris'
import { billingApi } from '../api'
import { useAuth } from '../context/AuthContext'
import { useFetch } from '../hooks/useFetch'

export default function Billing() {
  const { shop, refreshShop } = useAuth()
  const isPro = shop?.plan === 'pro'
  const [upgrading,   setUpgrading]   = useState(false)
  const [downgrading, setDowngrading] = useState(false)

  const { data: billingStatus } = useFetch(billingApi.status)

  const handleUpgrade = async () => {
    setUpgrading(true)
    try {
      const res = await billingApi.upgrade()
      // Redirect to Shopify billing page
      if (res.data?.confirmUrl || res.request?.responseURL) {
        window.location.href = res.request?.responseURL || res.data.confirmUrl
      }
    } catch (e) {
      console.error(e)
    } finally {
      setUpgrading(false)
    }
  }

  const handleDowngrade = async () => {
    if (!window.confirm('Downgrade to free plan? You\'ll lose Pro features at end of billing period.')) return
    setDowngrading(true)
    try { await billingApi.downgrade(); await refreshShop() }
    finally { setDowngrading(false) }
  }

  const FREE_FEATURES = [
    '500 redirects / month',
    '10 platforms detected',
    'Basic analytics (7 days)',
    'Email alerts',
  ]
  const PRO_FEATURES = [
    'Unlimited redirects',
    'All platforms + others',
    '90-day analytics history',
    'Advanced email alerts',
    'White-label branding',
    'Full detection log export (CSV)',
    'Priority support',
  ]
  const FREE_LOCKED = ['White-label branding','Full log history','Priority support']

  return (
    <Page title="Plan & Billing" subtitle="Manage your FlareGuard subscription">
      <BlockStack gap="500">

        {/* Current plan */}
        <Banner
          title={isPro ? '🔥 You\'re on FlareGuard Pro' : 'You\'re on the Free plan'}
          tone={isPro ? 'success' : 'info'}
          action={isPro ? undefined : { content: 'Upgrade to Pro — $9/mo', onAction: handleUpgrade }}
        >
          {isPro
            ? <p>Unlimited redirects, white-label branding, and full analytics are active.</p>
            : <p>You have {billingStatus?.usage?.redirectCount || 0} / 500 redirects used this month.</p>
          }
        </Banner>

        {/* Plan cards */}
        <Layout>
          <Layout.Section variant="oneHalf">
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <Text variant="headingLg" fontWeight="bold">Free</Text>
                  <Badge tone={!isPro ? 'success' : 'subdued'}>
                    {!isPro ? 'Current plan' : 'Inactive'}
                  </Badge>
                </InlineStack>
                <InlineStack gap="100" blockAlign="baseline">
                  <Text variant="heading2xl" fontWeight="bold">$0</Text>
                  <Text tone="subdued">/ month</Text>
                </InlineStack>
                <Text tone="subdued">For new stores getting started</Text>
                <Divider />
                <List>
                  {FREE_FEATURES.map(f => (
                    <List.Item key={f}>{f}</List.Item>
                  ))}
                </List>
                <Text tone="subdued" variant="bodySm">
                  {FREE_LOCKED.map(f => `✗ ${f}`).join(' · ')}
                </Text>
                {isPro && (
                  <Button onClick={handleDowngrade} loading={downgrading} tone="critical" variant="plain">
                    Downgrade to Free
                  </Button>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneHalf">
            <div style={{ outline: isPro ? '2px solid #1d6bf3' : 'none', borderRadius: 12 }}>
              <Card>
                <BlockStack gap="400">
                  <InlineStack align="space-between" blockAlign="center">
                    <Text variant="headingLg" fontWeight="bold">Pro 🔥</Text>
                    <Badge tone={isPro ? 'success' : 'info'}>
                      {isPro ? 'Current plan' : 'Recommended'}
                    </Badge>
                  </InlineStack>
                  <InlineStack gap="100" blockAlign="baseline">
                    <Text variant="heading2xl" fontWeight="bold">$9</Text>
                    <Text tone="subdued">/ month</Text>
                  </InlineStack>
                  <Text tone="subdued">For stores running paid social campaigns</Text>
                  <Divider />
                  <List>
                    {PRO_FEATURES.map(f => (
                      <List.Item key={f}>{f}</List.Item>
                    ))}
                  </List>
                  {!isPro && (
                    <Button variant="primary" onClick={handleUpgrade} loading={upgrading} fullWidth>
                      Upgrade to Pro — $9/mo
                    </Button>
                  )}
                  <Text variant="bodySm" tone="subdued" alignment="center">
                    7-day free trial · Cancel anytime · Billed via Shopify
                  </Text>
                </BlockStack>
              </Card>
            </div>
          </Layout.Section>
        </Layout>

        {/* Usage summary */}
        {billingStatus && (
          <Card>
            <BlockStack gap="300">
              <Text variant="headingMd">This Month's Usage</Text>
              <InlineStack gap="600" wrap>
                <BlockStack gap="100">
                  <Text tone="subdued" variant="bodySm">Redirects</Text>
                  <Text variant="headingLg" fontWeight="bold">
                    {billingStatus.usage?.redirectCount || 0}
                    {!isPro && <Text as="span" tone="subdued"> / 500</Text>}
                  </Text>
                </BlockStack>
                <BlockStack gap="100">
                  <Text tone="subdued" variant="bodySm">Plan</Text>
                  <Text variant="headingLg" fontWeight="bold">{billingStatus.plan}</Text>
                </BlockStack>
                {billingStatus.planActivatedAt && (
                  <BlockStack gap="100">
                    <Text tone="subdued" variant="bodySm">Pro Since</Text>
                    <Text variant="headingLg" fontWeight="bold">
                      {new Date(billingStatus.planActivatedAt).toLocaleDateString()}
                    </Text>
                  </BlockStack>
                )}
              </InlineStack>
            </BlockStack>
          </Card>
        )}

      </BlockStack>
    </Page>
  )
}
