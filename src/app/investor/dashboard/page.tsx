'use client'
import { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  Search, LayoutGrid, List, LineChart, Building2, CircleDollarSign, Zap,
  RefreshCw, TrendingUp, TrendingDown, Sparkles, X,
} from 'lucide-react'
import { TokenLogo } from '@/components/ui/token-logo'
import { useFetch } from '@/lib/useFetch'
import { EmptyState, ErrorState, LoadingAnnouncer, NoResults, Skeleton, SkeletonCard } from '@/components/ui/states'
import {
  EM_DASH, formatMoney, formatPct, trendArrow, trendBadgeClass, trendColor, type Trend,
} from '@/lib/format'

/* ── Types mirroring /api/investor/tokens ─────────────────────────────────── */

type RailItem = {
  id: string
  symbol: string
  name: string
  logo: string | null
  /** USD, so rails are comparable across currencies. */
  price: number | null
  priceDisplay: string | null
  currencySymbol: string
  change: number | null
  trend: Trend
  desc: string
  info: string
}

type Asset = {
  id: string
  symbol: string
  name: string
  category: string
  type: string
  logo: string | null
  info: string | null
  supplyPre: string | null
  priceNative: number | null
  priceUsd: number | null
  currency: string
  currencySymbol: string
  changePct: number | null
  trend: Trend
  soldOut: boolean
  tradable: boolean
}

type TokensResponse = {
  assets: Asset[]
  topGainers: RailItem[]
  topLosers: RailItem[]
  trending: RailItem[]
  newlyAdded: RailItem[]
  categories: string[]
}

const ALL = 'All assets'
const SORTS = ['Most Popular', 'Top Gainers', 'Top Losers'] as const
type SortMode = (typeof SORTS)[number]

function iconFor(category: string) {
  if (category === 'Stock') return LineChart
  if (category === 'RWA') return Building2
  if (category === 'Stablecoin') return CircleDollarSign
  if (category === 'Utility Token') return Zap
  return LayoutGrid
}

/** `soldOut` is derived from `remaining === 0`, which is also true for every
 *  "You own 0/N" asset. Only offerings ("Remaining …") can actually sell out. */
function isSoldOut(asset: Asset) {
  return asset.soldOut && /remaining/i.test(asset.supplyPre ?? '')
}

/* ── Rail card ────────────────────────────────────────────────────────────
   Three near-identical copy-pasted cards had already drifted (one hardcoded a
   green ▲ for every row, all three passed isGain={true}). One component now. */

function RailRow({ item, meta }: { item: RailItem; meta: 'change' | 'desc' }) {
  return (
    <Link href={`/investor/dashboard/token/${item.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          padding: 12, margin: '0 -12px', borderRadius: 'var(--r-md)',
          transition: 'background .2s', cursor: 'pointer',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--fk-surface-2)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <TokenLogo
            logo={item.logo}
            symbol={item.symbol}
            size={36}
            isGain={item.trend === null ? null : item.trend === 'up'}
          />
          <div style={{ minWidth: 0 }}>
            <p className="fk-mono" style={{ fontSize: 14, fontWeight: 600, color: 'var(--fk-text-hi)' }}>{item.symbol}</p>
            <p className="fk-truncate" style={{ fontSize: 12, color: 'var(--fk-text-low)' }}>{item.name}</p>
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <p className="fk-mono" style={{ fontSize: 14, fontWeight: 600, color: 'var(--fk-text-hi)' }}>
            {formatMoney(item.price)}
          </p>
          {meta === 'change' ? (
            <p className="fk-mono" style={{ fontSize: 12, fontWeight: 600, color: trendColor(item.trend) }}>
              {item.change === null ? EM_DASH : `${trendArrow(item.trend)} ${formatPct(item.change)}`}
            </p>
          ) : (
            <p className="fk-truncate" style={{ fontSize: 12, color: 'var(--fk-text-low)', maxWidth: 120 }}>{item.desc}</p>
          )}
        </div>
      </div>
    </Link>
  )
}

function RailCard({
  title, badge, items, meta, header, emptyBody,
}: {
  title?: string
  badge?: string
  items: RailItem[]
  meta: 'change' | 'desc'
  header?: React.ReactNode
  emptyBody: string
}) {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', background: 'var(--fk-surface-1)', border: '1px solid var(--fk-line)', borderRadius: 'var(--r-lg)', padding: 24 }}>
      <div
        aria-hidden="true"
        style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, background: 'var(--fk-blue)', filter: 'blur(100px)', borderRadius: '50%', opacity: 0.2, pointerEvents: 'none' }}
      />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, minHeight: 28 }}>
          {header ?? <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--fk-text-hi)' }}>{title}</h2>}
          {badge && (
            <span style={{ fontSize: 10, background: 'var(--fk-surface-2)', padding: '2px 6px', borderRadius: 4, color: 'var(--fk-text-mid)' }}>
              {badge}
            </span>
          )}
        </div>
        {items.length === 0 ? (
          <EmptyState compact title="Nothing to show yet" body={emptyBody} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {items.map(item => <RailRow key={item.id} item={item} meta={meta} />)}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Asset change badge ───────────────────────────────────────────────────── */

function ChangeBadge({ trend, change, small }: { trend: Trend; change: number | null; small?: boolean }) {
  return (
    <span
      className={`${trendBadgeClass(trend)} fk-mono`}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: small ? '2px 8px' : '4px 10px', borderRadius: 999,
        fontSize: small ? 11 : 12, fontWeight: 600, whiteSpace: 'nowrap',
      }}
    >
      {trend !== null && trend !== 'flat' && <span aria-hidden="true">{trendArrow(trend)}</span>}
      {formatPct(change)}
    </span>
  )
}

function StatusBadge({ asset }: { asset: Asset }) {
  if (!asset.tradable) return <span className="fk-badge fk-badge-info">Upcoming</span>
  if (isSoldOut(asset)) return <span className="fk-badge fk-badge-warn">Sold out</span>
  return null
}

/** Price in USD (canonical) plus the native quote when they differ — the old
 *  single column mixed '$ 520.00' and '£ 105.20' as if comparable. */
function PriceBlock({ asset, size }: { asset: Asset; size: number }) {
  const showNative = asset.currency !== 'USD' && asset.priceNative !== null
  return (
    <div>
      <p className="fk-mono" style={{ fontSize: size, fontWeight: 700, color: 'var(--fk-text-hi)', lineHeight: 1.2 }}>
        {formatMoney(asset.priceUsd)}
      </p>
      {showNative && (
        <p className="fk-mono" style={{ fontSize: 11, color: 'var(--fk-text-low)' }}>
          {formatMoney(asset.priceNative, { symbol: asset.currencySymbol })} native
        </p>
      )}
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────────────────────── */

function DashboardSkeleton() {
  return (
    <>
      <LoadingAnnouncer label="Loading market data" />
      <div className="iv-rail-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 64 }}>
        <SkeletonCard rows={3} />
        <SkeletonCard rows={3} />
        <SkeletonCard rows={3} />
      </div>
      <div className="iv-asset-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
        <SkeletonCard rows={2} height={180} />
        <SkeletonCard rows={2} height={180} />
        <SkeletonCard rows={2} height={180} />
        <SkeletonCard rows={2} height={180} />
      </div>
    </>
  )
}

function InvestorDashboard() {
  const searchParams = useSearchParams()
  const urlQuery = searchParams.get('q') ?? ''

  const { data, loading, refreshing, error, offline, refetch } = useFetch<TokensResponse>('/api/investor/tokens')

  const [activeFilter, setActiveFilter] = useState(ALL)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortMode, setSortMode] = useState<SortMode>('Most Popular')
  const [searchQuery, setSearchQuery] = useState(urlQuery)
  const [rail, setRail] = useState<'gainers' | 'losers'>('gainers')

  // The header search navigates here with ?q=… — adopt it.
  useEffect(() => { setSearchQuery(urlQuery) }, [urlQuery])

  const assets = data?.assets ?? []
  const categories = data?.categories ?? [ALL]

  // A category can disappear between refreshes (or ?empty=1); don't strand the
  // user on a filter that no longer exists.
  useEffect(() => {
    if (data && activeFilter !== ALL && !categories.includes(activeFilter)) setActiveFilter(ALL)
  }, [data, categories, activeFilter])

  const trimmedQuery = searchQuery.trim()

  const categoryAssets = useMemo(
    () => assets.filter(a => activeFilter === ALL || a.category === activeFilter),
    [assets, activeFilter]
  )

  const filteredAssets = useMemo(() => {
    let list = categoryAssets
    if (trimmedQuery) {
      const q = trimmedQuery.toLowerCase()
      list = list.filter(a => a.name.toLowerCase().includes(q) || a.symbol.toLowerCase().includes(q))
    }
    if (sortMode !== 'Most Popular') {
      // Sort on the numeric changePct, never on the display string. Assets with
      // no price discovery yet (null) always sink to the bottom.
      const dir = sortMode === 'Top Gainers' ? -1 : 1
      list = [...list].sort((a, b) => {
        if (a.changePct === null) return 1
        if (b.changePct === null) return -1
        return (a.changePct - b.changePct) * dir
      })
    }
    return list
  }, [categoryAssets, trimmedQuery, sortMode])

  const featured = useMemo(
    () => assets.find(a => a.id === 'tkn-rwa-nyc') ?? assets.find(a => a.tradable) ?? assets[0] ?? null,
    [assets]
  )

  const clearAll = () => { setSearchQuery(''); setActiveFilter(ALL) }

  const railItems = rail === 'gainers' ? (data?.topGainers ?? []) : (data?.topLosers ?? [])

  return (
    <div>
      {/* Featured offering — copy is driven by the data. It used to be hardcoded
          and disagreed with the asset it linked to (5.2% vs 6.5% yield). */}
      <div
        className="iv-hero-card"
        style={{ background: 'var(--fk-blue)', borderRadius: 16, padding: '40px 48px', marginBottom: 48, position: 'relative', overflow: 'hidden' }}
      >
        <div aria-hidden="true" style={{ position: 'absolute', right: 20, bottom: -40, opacity: 0.1, pointerEvents: 'none', userSelect: 'none' }}>
          <span style={{ fontSize: 240, fontWeight: 900, fontFamily: 'var(--font-display)', lineHeight: 1, color: '#fff' }}>1/</span>
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 600 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: 'rgba(255,255,255,.8)', marginBottom: 12, textTransform: 'uppercase' }}>
            Initial Offering
          </p>
          {loading || !featured ? (
            <div style={{ display: 'grid', gap: 12, maxWidth: 420 }}>
              <Skeleton w="70%" h={34} style={{ background: 'rgba(255,255,255,.18)' }} />
              <Skeleton w="90%" h={16} style={{ background: 'rgba(255,255,255,.14)' }} />
              <Skeleton w={150} h={44} r={12} style={{ background: 'rgba(255,255,255,.2)' }} />
            </div>
          ) : (
            <>
              <h1 className="iv-page-title fk-clamp-2" style={{ fontSize: 36, fontWeight: 700, color: '#fff', marginBottom: 12 }}>
                {featured.name}
              </h1>
              <p className="fk-mono" style={{ fontSize: 15, color: '#fff', marginBottom: 24 }}>
                {formatMoney(featured.priceUsd)} / token
                {/* `info` already begins with "per token · " — don't say it twice. */}
                {featured.info ? ` · ${featured.info.replace(/^per token\s*·\s*/i, '')}` : ''}
              </p>
              <Link
                href={`/investor/dashboard/token/${featured.id}`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: '#fff', color: 'var(--fk-blue)', padding: '12px 24px',
                  borderRadius: 12, fontSize: 14, fontWeight: 600, textDecoration: 'none',
                }}
              >
                View offering
              </Link>
            </>
          )}
        </div>
      </div>

      {error ? (
        <ErrorState
          offline={offline}
          title="Could not load market data"
          body={offline ? undefined : error}
          onRetry={refetch}
        />
      ) : loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          {/* Rails */}
          <div className="iv-rail-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 64 }}>
            <RailCard
              meta="change"
              items={railItems}
              badge="24H"
              emptyBody={rail === 'gainers' ? 'No asset is up over the last 24 hours.' : 'No asset is down over the last 24 hours.'}
              header={
                <div role="tablist" aria-label="Movers" style={{ display: 'flex', gap: 4, background: 'var(--fk-surface-2)', borderRadius: 999, padding: 3 }}>
                  {([['gainers', 'Top Gainers', TrendingUp], ['losers', 'Top Losers', TrendingDown]] as const).map(([key, label, Icon]) => {
                    const active = rail === key
                    return (
                      <button
                        key={key}
                        role="tab"
                        aria-selected={active}
                        onClick={() => setRail(key)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          padding: '5px 12px', borderRadius: 999, border: 'none', cursor: 'pointer',
                          fontSize: 13, fontWeight: 600,
                          background: active ? 'var(--fk-surface-3)' : 'transparent',
                          color: active ? 'var(--fk-text-hi)' : 'var(--fk-text-mid)',
                          boxShadow: active ? 'var(--glass-hi)' : 'none',
                        }}
                      >
                        <Icon size={14} aria-hidden="true" /> {label}
                      </button>
                    )
                  })}
                </div>
              }
            />
            <RailCard
              title="Trending"
              badge="24H"
              meta="change"
              items={data?.trending ?? []}
              emptyBody="Trending picks appear once there is enough market activity."
            />
            <RailCard
              title="Newly Added"
              meta="desc"
              items={data?.newlyAdded ?? []}
              emptyBody="No new listings this week."
            />
          </div>

          {/* Explore Assets */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--fk-text-hi)' }}>Explore Assets</h2>
              <span style={{ fontSize: 12, color: 'var(--fk-text-low)' }}>
                {filteredAssets.length} of {assets.length}
              </span>
              <button
                onClick={refetch}
                disabled={refreshing}
                aria-label="Refresh market data"
                title="Refresh market data"
                style={{
                  marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'var(--fk-surface-2)', border: '1px solid var(--fk-line)',
                  color: 'var(--fk-text-mid)', borderRadius: 999, padding: '6px 12px',
                  fontSize: 12, cursor: refreshing ? 'progress' : 'pointer',
                }}
              >
                <RefreshCw size={13} style={{ animation: refreshing ? 'spin 1s linear infinite' : undefined }} aria-hidden="true" />
                {refreshing ? 'Refreshing…' : 'Refresh'}
              </button>
            </div>

            {/* Toolbar */}
            <div className="iv-toolbar" style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32 }}>
              <div
                className="iv-search"
                style={{ display: 'flex', alignItems: 'center', background: 'var(--fk-surface-1)', border: '1px solid var(--fk-line)', borderRadius: 8, padding: '8px 12px', width: 280, flexShrink: 0 }}
              >
                <Search size={16} color="var(--fk-text-low)" aria-hidden="true" />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  aria-label="Search assets"
                  style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--fk-text-hi)', fontSize: 13, marginLeft: 8, width: '100%', minWidth: 0 }}
                  placeholder="Search assets..."
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: 'var(--fk-text-low)', padding: 2 }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div
                className="iv-filter-row"
                role="tablist"
                aria-label="Asset category"
                style={{ display: 'flex', alignItems: 'center', gap: 12, overflowX: 'auto', flex: 1 }}
              >
                {categories.map((catName: string) => {
                  const Icon = iconFor(catName)
                  const active = activeFilter === catName
                  return (
                    <button
                      key={catName}
                      role="tab"
                      aria-selected={active}
                      onClick={() => setActiveFilter(catName)}
                      style={{
                        background: active ? 'var(--fk-surface-2)' : 'transparent',
                        border: `1px solid ${active ? 'var(--fk-blue)' : 'transparent'}`,
                        color: active ? 'var(--fk-text-hi)' : 'var(--fk-text-mid)',
                        fontWeight: active ? 600 : 500,
                        padding: '8px 16px', borderRadius: 999, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap',
                        display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s',
                      }}
                    >
                      <Icon size={14} aria-hidden="true" style={{ color: active ? 'var(--fk-blue-soft)' : 'var(--fk-text-low)' }} />
                      {catName}
                      {active && <span className="fk-sr-only">(selected)</span>}
                    </button>
                  )
                })}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
                <div style={{ display: 'flex', background: 'var(--fk-surface-2)', border: '1px solid var(--fk-line)', borderRadius: 8, overflow: 'hidden' }}>
                  <button
                    onClick={() => setViewMode('grid')}
                    aria-label="Grid view"
                    aria-pressed={viewMode === 'grid'}
                    style={{ padding: 8, display: 'flex', background: viewMode === 'grid' ? 'var(--fk-surface-3)' : 'transparent', border: 'none', cursor: 'pointer', color: viewMode === 'grid' ? 'var(--fk-text-hi)' : 'var(--fk-text-mid)' }}
                  >
                    <LayoutGrid size={16} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    aria-label="List view"
                    aria-pressed={viewMode === 'list'}
                    style={{ padding: 8, display: 'flex', background: viewMode === 'list' ? 'var(--fk-surface-3)' : 'transparent', border: 'none', cursor: 'pointer', color: viewMode === 'list' ? 'var(--fk-text-hi)' : 'var(--fk-text-mid)' }}
                  >
                    <List size={16} />
                  </button>
                </div>
                <select
                  value={sortMode}
                  onChange={e => setSortMode(e.target.value as SortMode)}
                  aria-label="Sort assets"
                  style={{ background: 'var(--fk-surface-2)', border: '1px solid var(--fk-line)', color: 'var(--fk-text-hi)', padding: '8px 12px', borderRadius: 8, outline: 'none', fontSize: 13, cursor: 'pointer' }}
                >
                  {SORTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Results */}
            {filteredAssets.length === 0 ? (
              trimmedQuery ? (
                <NoResults query={trimmedQuery} onClear={clearAll} />
              ) : assets.length === 0 ? (
                <EmptyState
                  icon={<Sparkles size={20} />}
                  title="No assets are listed yet"
                  body="New tokenized offerings appear here as soon as they go live."
                  action={{ label: 'Refresh', onClick: refetch }}
                />
              ) : (
                <EmptyState
                  title={`Nothing in “${activeFilter}”`}
                  body="This category has no listed assets right now. Try another category."
                  action={{ label: 'Show all assets', onClick: clearAll }}
                />
              )
            ) : viewMode === 'grid' ? (
              <div className="iv-asset-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
                {filteredAssets.map(asset => (
                  <Link key={asset.id} href={`/investor/dashboard/token/${asset.id}`} style={{ textDecoration: 'none' }}>
                    <div
                      className="fk-card"
                      style={{ padding: 24, cursor: 'pointer', transition: 'transform .2s', display: 'flex', flexDirection: 'column', height: '100%' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
                          <TokenLogo logo={asset.logo} symbol={asset.symbol} size={44} isGain={asset.trend === null ? null : asset.trend === 'up'} />
                          <div style={{ minWidth: 0 }}>
                            <h3 className="fk-clamp-2" style={{ fontSize: 16, fontWeight: 600, color: 'var(--fk-text-hi)', marginBottom: 2, lineHeight: 1.3 }}>
                              {asset.name}
                            </h3>
                            <p className="fk-mono fk-truncate" style={{ fontSize: 12, color: 'var(--fk-text-mid)' }}>
                              {asset.symbol} · {asset.type}
                            </p>
                          </div>
                        </div>
                        <ChangeBadge trend={asset.trend} change={asset.changePct} />
                      </div>

                      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
                        <div style={{ minWidth: 0 }}>
                          {/* The old card drew one of two hardcoded SVG "sparklines"
                              unrelated to any data. Removed — the change is the signal. */}
                          <PriceBlock asset={asset} size={28} />
                          {asset.info && asset.info !== '-' && (
                            <p className="fk-truncate" style={{ fontSize: 13, color: 'var(--fk-text-mid)', marginTop: 4 }}>
                              {asset.info}
                            </p>
                          )}
                        </div>
                        <StatusBadge asset={asset} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {filteredAssets.map(asset => (
                  <Link key={asset.id} href={`/investor/dashboard/token/${asset.id}`} style={{ textDecoration: 'none' }}>
                    <div
                      className="fk-card"
                      style={{ padding: '16px 24px', cursor: 'pointer', transition: 'transform .2s', display: 'flex', alignItems: 'center', gap: 16 }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                    >
                      <TokenLogo logo={asset.logo} symbol={asset.symbol} size={40} isGain={asset.trend === null ? null : asset.trend === 'up'} />

                      <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                        <h3 className="fk-truncate" style={{ fontSize: 15, fontWeight: 600, color: 'var(--fk-text-hi)' }}>{asset.name}</h3>
                        <p className="fk-mono fk-truncate" style={{ fontSize: 12, color: 'var(--fk-text-mid)' }}>
                          {asset.symbol} · {asset.type}
                          {/* `info` is optional; it lives on the same line instead of
                              reserving an empty flex:1 column that misaligned prices. */}
                          {asset.info && asset.info !== '-' ? ` · ${asset.info}` : ''}
                        </p>
                      </div>

                      <StatusBadge asset={asset} />

                      <div style={{ width: 150, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, textAlign: 'right' }}>
                        <PriceBlock asset={asset} size={16} />
                        <ChangeBadge trend={asset.trend} change={asset.changePct} small />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default function InvestorDashboardPage() {
  // useSearchParams needs a Suspense boundary to keep this page prerenderable.
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <InvestorDashboard />
    </Suspense>
  )
}
