import { useState, useEffect } from 'react'
import {
  Page, Layout, Card, FormLayout, TextField, BlockStack,
  Text, Banner, InlineStack, Button, Badge, Box,
} from '@shopify/polaris'
import { shopApi } from '../api'
import { useAuth } from '../context/AuthContext'
import { useFetch, useMutation } from '../hooks/useFetch'

const SWATCHES = ['#1d6bf3','#7c3aed','#059669','#dc2626','#d97706','#0f0e0b','#db2777','#0891b2']

export default function Branding() {
  const { shop } = useAuth()
  const isPro = shop?.plan === 'pro'

  const { data, loading, refetch } = useFetch(
    isPro ? shopApi.getBranding : () => Promise.resolve({ data: { branding: {} } })
  )
  const { mutate, saving, success, error } = useMutation(shopApi.saveBranding)

  const [form, setForm] = useState({
    primaryColor: '#1d6bf3',
    headline:     'Open in Browser',
    bodyText:     'Tap ··· and choose Open in Browser',
    buttonLabel:  'Got it',
    logoUrl:      '',
  })

  useEffect(() => { if (data?.branding) setForm(f => ({ ...f, ...data.branding })) }, [data])
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  if (!isPro) return (
    <Page title="White-label Branding" subtitle="Customise the WeChat overlay with your brand">
      <Banner
        title="Pro feature"
        tone="warning"
        action={{ content: 'Upgrade to Pro — $9/mo', url: '/billing' }}
      >
        <p>White-label branding is available on the Pro plan. Remove FlareGuard branding and use your own logo and colours.</p>
      </Banner>
    </Page>
  )

  return (
    <Page
      title="White-label Branding"
      subtitle="Customise the WeChat overlay and redirect experience"
      primaryAction={{ content: saving ? 'Saving…' : 'Save branding', onAction: () => mutate(form).then(refetch), loading: saving }}
    >
      <BlockStack gap="500">
        {success && <Banner title="Branding saved!" tone="success" />}
        {error   && <Banner title={error} tone="critical" />}

        <Layout>
          <Layout.Section variant="oneHalf">
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd">Brand Settings</Text>

                <BlockStack gap="200">
                  <Text variant="bodySm" fontWeight="semibold">Primary Colour</Text>
                  <InlineStack gap="200" wrap>
                    {SWATCHES.map(c => (
                      <div key={c} onClick={() => set('primaryColor', c)}
                        style={{
                          width: 32, height: 32, borderRadius: 8, background: c,
                          cursor: 'pointer', border: form.primaryColor === c ? '3px solid #1a1a1a' : '2px solid transparent',
                          transition: 'all .15s',
                        }}
                      />
                    ))}
                  </InlineStack>
                  <TextField label="Custom hex" value={form.primaryColor}
                    onChange={v => set('primaryColor', v)} autoComplete="off" />
                </BlockStack>

                <TextField label="Logo URL" placeholder="https://cdn.mystore.com/logo.png"
                  helpText="PNG or SVG, recommended 200×60px"
                  value={form.logoUrl} onChange={v => set('logoUrl', v)} autoComplete="off" />

                <FormLayout>
                  <TextField label="Overlay Headline"  value={form.headline}    onChange={v => set('headline', v)}    autoComplete="off" />
                  <TextField label="Body Text"         value={form.bodyText}    onChange={v => set('bodyText', v)}    autoComplete="off" multiline={2} />
                  <TextField label="Button Label"      value={form.buttonLabel} onChange={v => set('buttonLabel', v)} autoComplete="off" />
                </FormLayout>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneHalf">
            <Card>
              <BlockStack gap="300">
                <InlineStack align="space-between">
                  <Text variant="headingMd">Live Preview</Text>
                  <Badge tone="success">WeChat Overlay</Badge>
                </InlineStack>

                {/* Preview */}
                <div style={{
                  background: '#0f0e0b', borderRadius: 14, padding: '40px 28px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  textAlign: 'center', gap: 12, minHeight: 300,
                }}>
                  {form.logoUrl ? (
                    <img src={form.logoUrl} alt="Logo"
                      style={{ height: 40, marginBottom: 4, objectFit: 'contain' }} />
                  ) : (
                    <div style={{ fontSize: 44, marginBottom: 4 }}>↗️</div>
                  )}
                  <div style={{ color: '#fff', fontSize: 18, fontWeight: 700, fontFamily: 'sans-serif' }}>
                    {form.headline || 'Open in Browser'}
                  </div>
                  <div style={{ color: '#999', fontSize: 13, maxWidth: 240, lineHeight: 1.65, fontFamily: 'sans-serif' }}>
                    {form.bodyText}
                  </div>
                  <div style={{ color: form.primaryColor, fontSize: 12, fontFamily: 'sans-serif' }}>
                    🔗 Link copied to clipboard
                  </div>
                  <button style={{
                    marginTop: 8, padding: '11px 28px',
                    background: form.primaryColor, color: '#fff',
                    border: 'none', borderRadius: 10, fontSize: 14,
                    fontWeight: 600, cursor: 'pointer', fontFamily: 'sans-serif',
                  }}>
                    {form.buttonLabel || 'Got it'}
                  </button>
                </div>

                <Text variant="bodySm" tone="subdued">
                  This overlay is shown to WeChat users since WeChat blocks deep-link redirects.
                </Text>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  )
}
