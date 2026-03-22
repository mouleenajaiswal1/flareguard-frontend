// ═══════════════════════════════════════════════════════════
// ALERTS PAGE
// ═══════════════════════════════════════════════════════════
import { useState, useEffect } from 'react'
import {
  Page, Layout, Card, FormLayout, TextField, Select,
  BlockStack, Text, Banner, InlineStack, Button,
  Checkbox, Divider, Badge,
} from '@shopify/polaris'
import { shopApi } from '../api'
import { useFetch, useMutation } from '../hooks/useFetch'

export default function Alerts() {
  const { data, loading, refetch } = useFetch(shopApi.getAlerts)
  const { mutate, saving, success, error } = useMutation(shopApi.saveAlerts)
  const [testing, setTesting] = useState(false)
  const [testOk,  setTestOk]  = useState(false)

  const [form, setForm] = useState(null)
  useEffect(() => { if (data?.alerts) setForm({ ...data.alerts }) }, [data])
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => { await mutate(form); refetch() }
  const handleTest = async () => {
    setTesting(true)
    try { await shopApi.testAlert(); setTestOk(true); setTimeout(() => setTestOk(false), 3000) }
    finally { setTesting(false) }
  }

  if (loading || !form) return <Page title="Email Alerts"><Card><Text>Loading…</Text></Card></Page>

  return (
    <Page
      title="Email Alerts"
      subtitle="Get notified when something needs your attention"
      primaryAction={{ content: saving ? 'Saving…' : 'Save alerts', onAction: handleSave, loading: saving }}
    >
      <BlockStack gap="500">
        {success && <Banner title="Alert settings saved!" tone="success" />}
        {testOk  && <Banner title="Test email sent!" tone="success" />}
        {error   && <Banner title={error} tone="critical" />}

        <Layout>
          <Layout.Section variant="oneHalf">
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd">Notification Email</Text>
                <FormLayout>
                  <TextField label="Send Alerts To" type="email"
                    value={form.email || ''} onChange={v => set('email', v)} autoComplete="email" />
                  <TextField label="CC (optional)" type="email"
                    value={form.ccEmail || ''} onChange={v => set('ccEmail', v)} autoComplete="email" />
                  <Select label="Digest Frequency"
                    options={[
                      { label: 'Real-time (instant)', value: 'realtime' },
                      { label: 'Daily digest',        value: 'daily'    },
                      { label: 'Weekly digest',       value: 'weekly'   },
                      { label: 'Disabled',            value: 'disabled' },
                    ]}
                    value={form.frequency || 'realtime'}
                    onChange={v => set('frequency', v)}
                  />
                </FormLayout>
                <InlineStack gap="300">
                  <Button onClick={handleSave} variant="primary" loading={saving}>Save</Button>
                  <Button onClick={handleTest} loading={testing}>Send Test Email</Button>
                </InlineStack>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneHalf">
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd">Alert Triggers</Text>
                <Divider />
                {[
                  { key: 'scriptInactive', label: 'Script Inactive',
                    hint: 'Alert if FlareGuard stops detecting events for 2+ hours' },
                  { key: 'limitWarning',   label: 'Free Limit Warning (80%)',
                    hint: 'Alert when approaching your monthly redirect quota' },
                  { key: 'redirectSpike',  label: 'Redirect Spike',
                    hint: 'Alert if redirects jump 3× vs previous hour' },
                  { key: 'newPlatform',    label: 'New Platform Detected',
                    hint: 'Alert when a new in-app browser UA is seen' },
                  { key: 'weeklyReport',   label: 'Weekly Performance Report',
                    hint: 'Every Monday — redirects, platforms, success rate' },
                ].map(({ key, label, hint }) => (
                  <Checkbox key={key} label={label} helpText={hint}
                    checked={form[key] ?? false} onChange={v => set(key, v)} />
                ))}
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  )
}
