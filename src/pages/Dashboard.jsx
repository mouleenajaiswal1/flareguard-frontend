import { useState } from 'react'
import {
  Page, Layout, Card, Text, Badge, Banner, ProgressBar,
  BlockStack, InlineStack, Select, Spinner, Box,
  DataTable, EmptyState,
} from '@shopify/polaris'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie, Legend,
} from 'recharts'
import { useAuth } from '../context/AuthContext'
import { analyticsApi } from '../api'
import { useFetch } from '../hooks/useFetch'
import dayjs from 'dayjs'

// ── Stat card ─────────────────────────────────────────────────
function StatCard({ label, value, change, changeUp, sub }) {
  return (
    <Card>
      <BlockStack gap="100">
        <Text variant="bodySm" tone="subdued">{label}</Text>
        <Text variant="heading2xl" fontWeight="bold">{value}</Text>
        {change && (
          <InlineStack gap="100" blockAlign="center">
            <Badge tone={changeUp ? 'success' : 'critical'}>
              {changeUp ? '↑' : '↓'} {change}
            </Badge>
            {sub && <Text variant="bodySm" tone="subdued">{sub}</Text>}
          </InlineStack>
        )}
        {!change && sub && <Text variant="bodySm" tone="subdued">{sub}</Text>}
      </BlockStack>
    </Card>
  )
}

// ── Platform colours ──────────────────────────────────────────
const PLATFORM_COLORS = {
  instagram: '#e1306c', facebook: '#1877f2', tiktok: '#010101',
  twitter: '#1da1f2', linkedin: '#0a66c2', wechat: '#07c160',
  snapchat: '#fffc00', telegram: '#229ed9', pinterest: '#e60023',
  reddit: '#ff4500', line: '#00b900', gmail: '#d93025',
}

const PLATFORM_EMOJI = {
  instagram:'📸', facebook:'👍', tiktok:'🎵', twitter:'🐦',
  linkedin:'💼', wechat:'💬', snapchat:'👻', telegram:'✈️',
  pinterest:'📌', reddit:'🤖', gmail:'📧', others:'🌐',
}

// ── Custom bar tooltip ────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background:'#fff', border:'1px solid #e3e3e3', borderRadius:8,
      padding:'10px 14px', fontSize:12, boxShadow:'0 2px 8px rgba(0,0,0,.1)'
    }}>
      <div style={{ fontWeight:700, marginBottom:4 }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.fill || p.stroke }}>
          {p.name}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────
export default function Dashboard() {
  const { shop } = useAuth()
  const [days, setDays] = useState('7')

  const { data: summary, loading: sumLoading } =
    useFetch(() => analyticsApi.summary(days), [days])

  const { data: dailyData, loading: chartLoading } =
    useFetch(() => analyticsApi.daily(days), [days])

  const { data: platformData, loading: platLoading } =
    useFetch(() => analyticsApi.platforms())

  const { data: osData } =
    useFetch(() => analyticsApi.os())

  const isPro   = shop?.plan === 'pro'
  const usage   = shop?.usage || {}
  const limit   = 500
  const usedPct = Math.min(Math.round((usage.redirectCount / limit) * 100), 100)

  // Build chart data
  const chartRows = dailyData?.days?.map(d => ({
    name:       dayjs(d.date).format('ddd'),
    Redirected: d.redirected,
    Failed:     d.failed,
    Overlay:    d.overlay,
  })) || []

  // Platform pie data
  const pieData = platformData?.platforms?.slice(0, 6).map(p => ({
    name:  `${PLATFORM_EMOJI[p.platform] || '🌐'} ${p.platform}`,
    value: p.count,
    color: PLATFORM_COLORS[p.platform] || '#8884d8',
  })) || []

  // OS table
  const osRows = osData?.os?.map(o => [
    o.os === 'ios' ? '🍎 iOS' : o.os === 'android' ? '🤖 Android' : '🖥 Desktop',
    o.count.toLocaleString(),
    `${o.pct}%`,
    o.os === 'ios' ? 'x-safari://' : o.os === 'android' ? 'intent://' : 'location.href',
  ]) || []

  return (
    <Page
      title="Dashboard"
      subtitle={shop?.shopDomain}
      secondaryActions={[
        {
          content: isPro ? '✓ Pro Plan' : 'Upgrade to Pro',
          url: '/billing',
          tone: isPro ? 'success' : undefined,
        }
      ]}
    >
      <BlockStack gap="500">

        {/* Free plan limit banner */}
        {!isPro && usedPct >= 80 && (
          <Banner
            title={`You've used ${usedPct}% of your monthly redirects`}
            tone="warning"
            action={{ content: 'Upgrade to Pro — $9/mo', url: '/billing' }}
          >
            <p>Once you hit 500, in-app visitors won't be redirected until next month.</p>
          </Banner>
        )}

        {/* Active banner */}
        {!sumLoading && summary && (
          <Banner title="FlareGuard is active" tone="success">
            <p>Script is live on your store. Redirects firing normally.</p>
          </Banner>
        )}

        {/* Free usage bar */}
        {!isPro && (
          <Card>
            <BlockStack gap="200">
              <InlineStack align="space-between">
                <Text variant="headingSm">Free Plan Usage</Text>
                <Text variant="bodySm" tone="subdued">
                  {usage.redirectCount || 0} / {limit} redirects this month
                </Text>
              </InlineStack>
              <ProgressBar
                progress={usedPct}
                tone={usedPct >= 80 ? 'critical' : 'highlight'}
                size="small"
              />
              <InlineStack align="end">
                <Text variant="bodySm" tone="subdued">
                  <a href="/billing" style={{color:'#1d6bf3'}}>
                    Upgrade for unlimited redirects →
                  </a>
                </Text>
              </InlineStack>
            </BlockStack>
          </Card>
        )}

        {/* Stat cards */}
        <Layout>
          <Layout.Section variant="oneQuarter">
            <StatCard
              label="Total Redirects"
              value={sumLoading ? '—' : (summary?.redirects || 0).toLocaleString()}
              change={sumLoading ? null : `${Math.abs(summary?.redirectsPct || 0)}%`}
              changeUp={(summary?.redirectsPct || 0) >= 0}
              sub={`Last ${days} days`}
            />
          </Layout.Section>
          <Layout.Section variant="oneQuarter">
            <StatCard
              label="Success Rate"
              value={sumLoading ? '—' : `${summary?.successRate || 0}%`}
              sub="Successful redirects"
            />
          </Layout.Section>
          <Layout.Section variant="oneQuarter">
            <StatCard
              label="All-time Redirects"
              value={sumLoading ? '—' : (summary?.totalAllTime || 0).toLocaleString()}
              sub="Since install"
            />
          </Layout.Section>
          <Layout.Section variant="oneQuarter">
            <StatCard
              label="Plan"
              value={isPro ? 'Pro 🔥' : 'Free'}
              sub={isPro ? 'Unlimited redirects' : `${usage.redirectCount || 0}/500 used`}
            />
          </Layout.Section>
        </Layout>

        {/* Charts row */}
        <Layout>
          {/* Daily bar chart */}
          <Layout.Section variant="twoThirds">
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <Text variant="headingMd">Daily Redirects</Text>
                  <Select
                    label=""
                    labelHidden
                    options={[
                      { label: 'Last 7 days',  value: '7'  },
                      { label: 'Last 14 days', value: '14' },
                      { label: 'Last 30 days', value: '30', disabled: !isPro },
                    ]}
                    value={days}
                    onChange={setDays}
                  />
                </InlineStack>

                {chartLoading ? (
                  <Box minHeight="220px">
                    <InlineStack align="center" blockAlign="center" gap="200">
                      <Spinner size="large" />
                    </InlineStack>
                  </Box>
                ) : chartRows.length === 0 ? (
                  <EmptyState heading="No data yet" image="">
                    <p>Redirects will appear here once your script is live.</p>
                  </EmptyState>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={chartRows} barSize={18} barGap={2}>
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="Redirected" fill="#1d6bf3" radius={[4,4,0,0]} />
                      <Bar dataKey="Overlay"    fill="#f59e0b" radius={[4,4,0,0]} />
                      <Bar dataKey="Failed"     fill="#fca5a5" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>

          {/* Platform pie */}
          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd">Platforms</Text>
                {platLoading ? (
                  <Box minHeight="220px">
                    <InlineStack align="center"><Spinner /></InlineStack>
                  </Box>
                ) : pieData.length === 0 ? (
                  <Text tone="subdued">No detections yet</Text>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%" cy="50%"
                        outerRadius={80}
                        paddingAngle={3}
                      >
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => [v.toLocaleString(), 'Redirects']} />
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        formatter={v => <span style={{fontSize:11}}>{v}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        {/* OS split table */}
        <Card>
          <BlockStack gap="300">
            <Text variant="headingMd">OS & Redirect Method Breakdown</Text>
            <DataTable
              columnContentTypes={['text','numeric','numeric','text']}
              headings={['OS', 'Redirects', 'Share', 'Method Used']}
              rows={osRows.length ? osRows : [['No data', '—', '—', '—']]}
            />
          </BlockStack>
        </Card>

      </BlockStack>
    </Page>
  )
}
