import { useState, useEffect } from 'react'
import {
  Page, Layout, Card, FormLayout, Select, TextField,
  BlockStack, Text, Banner, InlineStack, Badge,
  Button, Checkbox, Divider, Toast, Frame,
} from '@shopify/polaris'
import { shopApi } from '../api'
import { useFetch, useMutation } from '../hooks/useFetch'

export default function Settings() {
  const { data, loading, refetch } = useFetch(shopApi.getSettings)
  const { mutate, saving, success, error } = useMutation(shopApi.saveSettings)

  const [form, setForm] = useState(null)

  useEffect(() => {
    if (data?.settings) setForm({ ...data.settings })
  }, [data])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSave = async () => {
    await mutate(form)
    refetch()
  }

  if (loading || !form) return (
    <Page title="Settings"><Card><Text>Loading…</Text></Card></Page>
  )

  return (
    <Frame>
      <Page
        title="Settings"
        subtitle="Control how FlareGuard behaves on your store"
        primaryAction={{
          content: saving ? 'Saving…' : 'Save settings',
          onAction: handleSave,
          loading: saving,
        }}
      >
        <BlockStack gap="500">
          {success && <Banner title="Settings saved!" tone="success" />}
          {error   && <Banner title={error} tone="critical" />}

          <Layout>
            <Layout.Section variant="oneHalf">

              {/* Master toggle */}
              <Card>
                <BlockStack gap="400">
                  <Text variant="headingMd">Master Control</Text>
                  <Checkbox
                    label="Enable FlareGuard"
                    helpText="Turn off to pause all redirects without uninstalling"
                    checked={form.enabled}
                    onChange={v => set('enabled', v)}
                  />
                </BlockStack>
              </Card>

              {/* Platform toggles */}
              <Card>
                <BlockStack gap="400">
                  <Text variant="headingMd">Platforms to Redirect</Text>
                  <Divider />
                  {[
                    { key: 'instagram', label: '📸 Instagram', hint: 'FBAN / FBAV / Instagram UA' },
                    { key: 'facebook',  label: '👍 Facebook',  hint: 'FB_IAB / FBIOS WebViews' },
                    { key: 'tiktok',    label: '🎵 TikTok',    hint: 'musical_ly / TikTok UA' },
                    { key: 'twitter',   label: '🐦 Twitter / X',hint: 'Twitter for iOS/Android' },
                    { key: 'linkedin',  label: '💼 LinkedIn',  hint: 'LinkedInApp WebView' },
                    { key: 'wechat',    label: '💬 WeChat',    hint: 'MicroMessenger — overlay only' },
                    { key: 'others',    label: '🌐 All Others', hint: 'Snapchat, Telegram, Pinterest…' },
                  ].map(({ key, label, hint }) => (
                    <Checkbox
                      key={key}
                      label={label}
                      helpText={hint}
                      checked={form[key] ?? true}
                      onChange={v => set(key, v)}
                    />
                  ))}
                </BlockStack>
              </Card>

            </Layout.Section>

            <Layout.Section variant="oneHalf">

              {/* Redirect method */}
              <Card>
                <BlockStack gap="400">
                  <Text variant="headingMd">Redirect Methods</Text>
                  <FormLayout>
                    <Select
                      label="iOS Method"
                      helpText="x-safari-https:// triggers Safari directly — recommended"
                      options={[
                        { label: 'x-safari-https:// (recommended)', value: 'x-safari' },
                        { label: 'Direct location.href fallback',    value: 'location' },
                      ]}
                      value={form.iosMethod || 'x-safari'}
                      onChange={v => set('iosMethod', v)}
                    />
                    <Select
                      label="Android Method"
                      helpText="intent:// opens Chrome directly"
                      options={[
                        { label: 'intent:// → Chrome (recommended)', value: 'intent'   },
                        { label: 'intent:// → Default browser',      value: 'intent-default' },
                        { label: 'Direct location.href fallback',    value: 'location' },
                      ]}
                      value={form.androidMethod || 'intent'}
                      onChange={v => set('androidMethod', v)}
                    />
                    <TextField
                      label="Redirect Delay (ms)"
                      helpText="0 = instant. Set 500–1000 for slow connections."
                      type="number"
                      value={String(form.redirectDelayMs || 0)}
                      onChange={v => set('redirectDelayMs', parseInt(v) || 0)}
                      autoComplete="off"
                    />
                    <TextField
                      label="Excluded URL Paths"
                      helpText="Comma-separated paths to skip, e.g. /cart, /account"
                      value={(form.excludedPaths || []).join(', ')}
                      onChange={v => set('excludedPaths', v.split(',').map(s => s.trim()).filter(Boolean))}
                      multiline={2}
                      autoComplete="off"
                    />
                  </FormLayout>
                </BlockStack>
              </Card>

              {/* Tracking preservation */}
              <Card>
                <BlockStack gap="400">
                  <InlineStack align="space-between">
                    <Text variant="headingMd">Tracking Preservation</Text>
                    <Badge tone="success">Recommended On</Badge>
                  </InlineStack>
                  <Divider />
                  <Checkbox
                    label="Preserve UTM Parameters"
                    helpText="Re-attach utm_source, utm_medium, utm_campaign after redirect"
                    checked={form.preserveUtm ?? true}
                    onChange={v => set('preserveUtm', v)}
                  />
                  <Checkbox
                    label="Preserve fbclid / ttclid / gclid"
                    helpText="Keep paid click IDs for Meta, TikTok, Google Ads attribution"
                    checked={form.preserveClickIds ?? true}
                    onChange={v => set('preserveClickIds', v)}
                  />
                  <Checkbox
                    label="GA4 Client ID Handoff"
                    helpText="Forward _ga cookie so GA4 matches sessions across redirect"
                    checked={form.preserveGa4 ?? true}
                    onChange={v => set('preserveGa4', v)}
                  />
                </BlockStack>
              </Card>

            </Layout.Section>
          </Layout>

          <InlineStack align="end" gap="300">
            <Button onClick={refetch}>Reset</Button>
            <Button variant="primary" onClick={handleSave} loading={saving}>
              Save Settings
            </Button>
          </InlineStack>

        </BlockStack>
      </Page>
    </Frame>
  )
}
