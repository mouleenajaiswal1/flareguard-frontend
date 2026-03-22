import { useState, useEffect, useCallback } from 'react'
import {
  Page, Card, DataTable, Filters, ChoiceList, Badge,
  Pagination, BlockStack, InlineStack, Text, Banner,
  Button, EmptyState, Spinner, Select, Box,
} from '@shopify/polaris'
import { eventsApi } from '../api'
import { useAuth } from '../context/AuthContext'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

const PLATFORM_EMOJI = {
  instagram:'📸', facebook:'👍', tiktok:'🎵', twitter:'🐦',
  linkedin:'💼', wechat:'💬', snapchat:'👻', telegram:'✈️',
  pinterest:'📌', reddit:'🤖', gmail:'📧',
}

function StatusBadge({ status }) {
  const map = {
    success: { tone: 'success',  label: '✓ Redirected' },
    failed:  { tone: 'critical', label: '✗ Failed'     },
    overlay: { tone: 'warning',  label: '⚠ Overlay'    },
  }
  const { tone, label } = map[status] || { tone: 'info', label: status }
  return <Badge tone={tone}>{label}</Badge>
}

function MethodBadge({ method }) {
  const map = {
    'x-safari': { tone: 'info',    label: 'x-safari'  },
    'intent':   { tone: 'success', label: 'intent://' },
    'overlay':  { tone: 'warning', label: 'overlay'   },
    'location': { tone: 'subdued', label: 'location'  },
  }
  const { tone, label } = map[method] || { tone: 'subdued', label: method }
  return <Badge tone={tone}>{label}</Badge>
}

export default function Logs() {
  const { shop } = useAuth()
  const isPro = shop?.plan === 'pro'

  const [events,     setEvents]     = useState([])
  const [total,      setTotal]      = useState(0)
  const [page,       setPage]       = useState(1)
  const [loading,    setLoading]    = useState(true)
  const [platform,   setPlatform]   = useState(null)
  const [status,     setStatus]     = useState(null)
  const [timeRange,  setTimeRange]  = useState('24h')
  const [exporting,  setExporting]  = useState(false)

  const PAGE_LIMIT = isPro ? 50 : 20

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: PAGE_LIMIT }
      if (platform) params.platform = platform
      if (status)   params.status   = status
      const hoursMap = { '24h': 1, '7d': 7, '30d': 30 }
      const days = hoursMap[timeRange] || 1
      params.from = dayjs().subtract(days, 'day').toISOString()

      const res = await eventsApi.list(params)
      setEvents(res.data.events || [])
      setTotal(res.data.pagination?.total || 0)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [page, platform, status, timeRange, PAGE_LIMIT])

  useEffect(() => { load() }, [load])

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await eventsApi.export()
      const url  = URL.createObjectURL(new Blob([res.data]))
      const a    = document.createElement('a')
      a.href     = url
      a.download = 'flareguard-logs.csv'
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  const rows = events.map(e => [
    <Text variant="bodySm" tone="subdued">{dayjs(e.occurredAt).fromNow()}</Text>,
    <Text>{PLATFORM_EMOJI[e.platform] || '🌐'} {e.platform}</Text>,
    <Text variant="bodySm">{e.os}</Text>,
    <MethodBadge method={e.method} />,
    <StatusBadge status={e.status} />,
    <Text variant="bodySm" tone="subdued"
      breakWord truncate style={{maxWidth:180}}>
      {e.url || '—'}
    </Text>,
    <InlineStack gap="100">
      {e.hasUtm    && <Badge tone="info"    size="small">UTM</Badge>}
      {e.hasFbclid && <Badge tone="success" size="small">fbclid</Badge>}
      {e.hasTtclid && <Badge tone="warning" size="small">ttclid</Badge>}
    </InlineStack>,
  ])

  const totalPages = Math.ceil(total / PAGE_LIMIT)

  return (
    <Page
      title="Detection Logs"
      subtitle="Every in-app browser event on your store"
      primaryAction={isPro ? {
        content:  exporting ? 'Exporting…' : '⬇ Export CSV',
        onAction: handleExport,
        loading:  exporting,
      } : undefined}
    >
      <BlockStack gap="400">

        {!isPro && (
          <Banner tone="warning"
            action={{ content: 'Upgrade to Pro', url: '/billing' }}
            title="Free plan shows last 20 events"
          >
            <p>Upgrade to Pro for full log history, 90-day retention, and CSV export.</p>
          </Banner>
        )}

        <Card>
          <BlockStack gap="400">
            {/* Filters */}
            <InlineStack gap="300" wrap>
              <Select
                label="Platform"
                labelHidden
                options={[
                  { label: 'All platforms',  value: ''          },
                  { label: '📸 Instagram',   value: 'instagram' },
                  { label: '👍 Facebook',    value: 'facebook'  },
                  { label: '🎵 TikTok',      value: 'tiktok'    },
                  { label: '🐦 Twitter / X', value: 'twitter'   },
                  { label: '💼 LinkedIn',    value: 'linkedin'  },
                  { label: '💬 WeChat',      value: 'wechat'    },
                ]}
                value={platform || ''}
                onChange={v => { setPlatform(v || null); setPage(1) }}
              />
              <Select
                label="Status"
                labelHidden
                options={[
                  { label: 'All statuses', value: ''        },
                  { label: '✓ Redirected', value: 'success' },
                  { label: '⚠ Overlay',   value: 'overlay' },
                  { label: '✗ Failed',     value: 'failed'  },
                ]}
                value={status || ''}
                onChange={v => { setStatus(v || null); setPage(1) }}
              />
              <Select
                label="Time range"
                labelHidden
                options={[
                  { label: 'Last 24 hours', value: '24h' },
                  { label: 'Last 7 days',   value: '7d'  },
                  { label: 'Last 30 days',  value: '30d', disabled: !isPro },
                ]}
                value={timeRange}
                onChange={v => { setTimeRange(v); setPage(1) }}
              />
              <Button onClick={load} variant="plain">↺ Refresh</Button>
            </InlineStack>

            {/* Table */}
            {loading ? (
              <Box minHeight="200px" padding="400">
                <InlineStack align="center"><Spinner /></InlineStack>
              </Box>
            ) : rows.length === 0 ? (
              <EmptyState heading="No events yet" image="">
                <p>Redirect events will appear here once your script fires.</p>
              </EmptyState>
            ) : (
              <DataTable
                columnContentTypes={['text','text','text','text','text','text','text']}
                headings={['Time','Platform','OS','Method','Status','URL','Tracking']}
                rows={rows}
                truncate
              />
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <InlineStack align="center">
                <Pagination
                  hasPrevious={page > 1}
                  onPrevious={() => setPage(p => p - 1)}
                  hasNext={page < totalPages}
                  onNext={() => setPage(p => p + 1)}
                  label={`Page ${page} of ${totalPages} · ${total.toLocaleString()} total`}
                />
              </InlineStack>
            )}

            <Text variant="bodySm" tone="subdued">
              Showing {events.length} of {total.toLocaleString()} events
              {!isPro && ' · Upgrade to Pro for full history'}
            </Text>
          </BlockStack>
        </Card>

      </BlockStack>
    </Page>
  )
}
