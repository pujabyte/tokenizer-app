'use client'
import { useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Activity, Info, ShieldAlert, Tag, Building2, Box, Users, Globe,
  Layers, Coins, Hash, Hexagon, Check, Copy, ExternalLink, AlertTriangle, LineChart,
} from 'lucide-react'
import { TokenLogo } from '@/components/ui/token-logo'
import { Modal } from '@/components/ui/modal'
import { EmptyState, ErrorState, Skeleton, SkeletonCard, LoadingAnnouncer } from '@/components/ui/states'
import { useFetch } from '@/lib/useFetch'
import { BLOCK_EXPLORER, EXECUTION_MODE_LABELS, type ExecutionMode } from '@/lib/constants'
import {
  EM_DASH, formatMoney, formatPct, formatQty, sanitizeDecimalInput, shortenAddress,
  toNumberOrNull, trendArrow, trendBadgeClass, trendColor, trendOf, trendTint,
} from '@/lib/format'

const SiPolygon = ({ size = 14, color = '#8247E5' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 38.4 33.5" fill={color} aria-hidden="true">
    <path d="M29 10.2a2.6 2.6 0 0 0-2.6 0l-6 3.5-4.1 2.3-6 3.5a2.6 2.6 0 0 1-2.6 0L3 16.7a2.6 2.6 0 0 1-1.3-2.2v-6.8a2.6 2.6 0 0 1 1.3-2.2l4.6-2.7a2.6 2.6 0 0 1 2.6 0l4.6 2.7a2.6 2.6 0 0 1 1.3 2.2v3.5l4.1-2.4V5.3a2.6 2.6 0 0 0-1.3-2.2L11 .4a2.6 2.6 0 0 0-2.6 0L1.3 3.1A2.6 2.6 0 0 0 0 5.3v13.1a2.6 2.6 0 0 0 1.3 2.2l8.1 4.7a2.6 2.6 0 0 0 2.6 0l6-3.4 4.1-2.4 6-3.4a2.6 2.6 0 0 1 2.6 0l4.6 2.7a2.6 2.6 0 0 1 1.3 2.2v6.8a2.6 2.6 0 0 1-1.3 2.2l-4.6 2.7a2.6 2.6 0 0 1-2.6 0l-4.6-2.7a2.6 2.6 0 0 1-1.3-2.2v-3.5l-4.1 2.4v3.5a2.6 2.6 0 0 0 1.3 2.2l8.1 4.7a2.6 2.6 0 0 0 2.6 0l8.1-4.7a2.6 2.6 0 0 0 1.3-2.2V18.3a2.6 2.6 0 0 0-1.3-2.2z" />
  </svg>
)
const FaEthereum = ({ size = 14, color = '#627EEA' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 320 512" fill={color} aria-hidden="true">
    <path d="M311.9 197.4L160 0 8.1 197.4l152 90.3 151.8-90.3zM160 0v287.7L8.1 197.4 160 0zm0 0v287.7l151.9-90.3L160 0zm0 320.3L8.1 230l151.9 282 151.9-282L160 320.3z" />
  </svg>
)

type Attestation = { id: string; date: string; type: string; auditor: string; link: string }
type Reward = { id: string; date: string; amount: string; currency: string | null; txHash: string }
type Candle = { time: number; open: number; high: number; low: number; close: number }

type TokenDetail = {
  id: string
  symbol: string
  name: string
  category: string
  type: string
  logo: string | null
  description: string | null
  issuer: string | null
  blockchain: string | null
  underlying: string | null
  investorType: string | null
  legalJurisdiction: string | null
  totalSupply: string | null
  decimals: number
  contractAddress: string | null
  legalDocument: string | null
  whitepaper: string | null
  prospectus: string | null
  factsheet: string | null
  apy: string | null
  yieldToken: string | null
  executionMode: string | null
  priceUsd: number | null
  priceNative: number | null
  currency: string
  currencySymbol: string
  changePct: number | null
  trend: 'up' | 'down' | 'flat' | null
  isGain: boolean | null
  remainingSupply: number | null
  totalSupplyNum: number | null
  soldOut: boolean
  tradable: boolean
  wallet: { quoteSymbol: string; quoteBalance: number; tokenBalance: number }
  fees: { platformFeeBps: number; networkFeeUsd: number; estimatedSettlement: string }
  attestations: Attestation[]
  rewardHistory: Reward[]
}

const TIMEFRAMES = ['1H', '1D', '1W', '1M', '6M', '1Y'] as const

/** Truncates (never rounds up) to the token's own precision, so a "Max" click
 *  can never produce an amount the wallet cannot actually cover. */
function floorTo(value: number, decimals: number) {
  const dp = Math.min(Math.max(decimals, 0), 8)
  const factor = 10 ** dp
  return Math.floor(value * factor) / factor
}

const CARD: CSSProperties = {
  border: '1px solid var(--fk-line)',
  borderRadius: 'var(--r-lg)',
  padding: 24,
}
const CARD_TITLE: CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 'var(--fs-card-title)',
  fontWeight: 600,
  color: 'var(--fk-text-hi)',
}
const ROW: CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '12px 16px', background: 'var(--fk-surface-1)',
  borderRadius: 'var(--r-sm)', border: '1px solid var(--fk-line)',
}

export default function TokenDetailPage() {
  const params = useParams()
  const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : ''

  const {
    data: token, loading, error, offline, refetch,
  } = useFetch<TokenDetail>(id ? `/api/investor/tokens/${id}` : null)

  const [timeframe, setTimeframe] = useState<string>('1D')
  const chart = useFetch<{ data: Candle[]; reason?: string }>(
    id ? `/api/investor/tokens/${id}/ohlc?timeframe=${timeframe}` : null
  )

  const [tradeModalOpen, setTradeModalOpen] = useState(false)
  const [tradeSide, setTradeSide] = useState<'buy' | 'sell'>('buy')
  const [tradeAmount, setTradeAmount] = useState('')
  const [tradeStatus, setTradeStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
  const [txHash, setTxHash] = useState<string | null>(null)
  const [failReason, setFailReason] = useState<string | null>(null)
  const [attestationsModalOpen, setAttestationsModalOpen] = useState(false)
  const [rewardModalOpen, setRewardModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const candles = chart.data?.data ?? []

  /* ── Derived trade figures. The panel and the confirm dialog both read these,
        so they can no longer disagree about whether the input is USD or qty. ── */
  const quote = useMemo(() => {
    const price = token?.priceUsd ?? null
    const decimals = token?.decimals ?? 6
    const feeRate = (token?.fees?.platformFeeBps ?? 0) / 10000
    const qty = toNumberOrNull(tradeAmount)
    const quoteBalance = token?.wallet?.quoteBalance ?? 0
    const tokenBalance = token?.wallet?.tokenBalance ?? 0

    // Buying is capped by spendable cash (fee included) and by remaining supply.
    const affordable = price && price > 0 ? quoteBalance / (price * (1 + feeRate)) : 0
    const supplyCap = token?.remainingSupply ?? Infinity
    const maxQty = tradeSide === 'buy'
      ? floorTo(Math.min(affordable, supplyCap), decimals)
      : floorTo(tokenBalance, decimals)

    const gross = price !== null && qty !== null ? price * qty : null
    const fee = gross === null ? null : gross * feeRate
    // Fee is charged either way: added to what you pay, deducted from proceeds.
    const total = gross === null || fee === null
      ? null
      : tradeSide === 'buy' ? gross + fee : gross - fee

    return {
      price, decimals, feeRate, qty, quoteBalance, tokenBalance,
      maxQty, gross, fee, total,
      balanceLabel: tradeSide === 'buy'
        ? formatMoney(quoteBalance, { symbol: '$' })
        : `${formatQty(tokenBalance, decimals)} ${token?.symbol ?? ''}`,
    }
  }, [token, tradeAmount, tradeSide])

  /* Single source of truth for "can this order be placed, and if not why". */
  const block = useMemo<{ reason: string; hard: boolean } | null>(() => {
    if (!token) return { reason: 'Loading asset data.', hard: true }
    if (!token.tradable) {
      return { reason: 'Price discovery has not started for this offering, so it cannot be traded yet.', hard: true }
    }
    if (tradeSide === 'buy' && token.soldOut) {
      return { reason: 'This offering is fully subscribed — there is no remaining supply to buy.', hard: true }
    }
    if (tradeSide === 'sell' && quote.tokenBalance <= 0) {
      return { reason: `You do not hold any ${token.symbol} to sell.`, hard: true }
    }
    if (quote.qty === null) return { reason: 'Enter an amount to continue.', hard: false }
    if (quote.qty <= 0) return { reason: 'Amount must be greater than zero.', hard: false }
    if (quote.qty > quote.maxQty) {
      return {
        reason: tradeSide === 'buy'
          ? `Amount exceeds what your ${token.wallet.quoteSymbol} balance can cover (max ${formatQty(quote.maxQty, quote.decimals)} ${token.symbol}).`
          : `You only hold ${formatQty(quote.tokenBalance, quote.decimals)} ${token.symbol}.`,
        hard: false,
      }
    }
    return null
  }, [token, tradeSide, quote])

  const executionLabel = token?.executionMode
    ? EXECUTION_MODE_LABELS[token.executionMode as ExecutionMode] ?? token.executionMode
    : 'Unknown'

  const handleTrade = () => {
    setTradeStatus('processing')
    setFailReason(null)
    window.setTimeout(() => {
      // The mock engine rejects roughly one in five orders so the failure path
      // is reachable in the prototype rather than dead code.
      if (Math.random() < 0.2) {
        setTradeStatus('error')
        setFailReason('The execution engine rejected the order: liquidity moved before the quote settled.')
        return
      }
      const hash = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`
      setTxHash(hash)
      setTradeStatus('success')
    }, 1500)
  }

  const closeTradeModal = () => {
    setTradeModalOpen(false)
    if (tradeStatus === 'success') setTradeAmount('')
    setTradeStatus('idle')
    setTxHash(null)
    setFailReason(null)
  }

  const copyAddress = () => {
    if (!token?.contractAddress) return
    navigator.clipboard.writeText(token.contractAddress)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  /* ── Loading / error / 404 ───────────────────────────────────────────── */

  if (loading) {
    return (
      <div>
        <LoadingAnnouncer label="Loading token details" />
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32 }}>
          <Skeleton w={120} h={13} />
        </div>
        <div className="iv-two-col" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
          <div style={{ display: 'grid', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Skeleton w={56} h={56} r={999} />
              <div style={{ display: 'grid', gap: 8 }}>
                <Skeleton w={240} h={24} />
                <Skeleton w={140} h={12} />
              </div>
            </div>
            <SkeletonCard rows={1} height={340} />
            <SkeletonCard rows={2} />
            <SkeletonCard rows={3} />
          </div>
          <SkeletonCard rows={4} height={480} />
        </div>
      </div>
    )
  }

  if (error || !token) {
    const notFound = /not found/i.test(error ?? '')
    return (
      <div style={{ paddingTop: 24 }}>
        <Link href="/investor/dashboard" style={backLinkStyle}>
          <ArrowLeft size={14} /> Back to Markets
        </Link>
        {notFound ? (
          <EmptyState
            icon={<AlertTriangle size={20} />}
            title="This asset does not exist"
            body={`No tokenized asset is listed under “${id}”. It may have been delisted, or the link may be mistyped.`}
            action={{ label: 'Back to Markets', href: '/investor/dashboard' }}
          />
        ) : (
          <ErrorState
            title="Could not load this asset"
            body={error ?? undefined}
            offline={offline}
            onRetry={refetch}
          />
        )}
      </div>
    )
  }

  /* ── Chart geometry ──────────────────────────────────────────────────── */

  const closes = candles.map(c => c.close)
  const min = closes.length ? Math.min(...closes) : 0
  const max = closes.length ? Math.max(...closes) : 0
  const range = max - min || 1
  // Plot band sits inside the viewBox so the line can't ride up into the price
  // headline (which is what the old marginTop:-20 caused).
  const TOP = 8
  const BOTTOM = 38
  const yOf = (v: number) => BOTTOM - ((v - min) / range) * (BOTTOM - TOP)

  // Plain computation, not a hook — it sits after the loading/error returns.
  const chartPath = closes.length === 0
    ? null
    // A single candle has no span: i/(n-1) would be 0/0 → NaN → invalid path.
    : closes.length === 1
      ? `M 0 ${yOf(closes[0]).toFixed(2)} L 100 ${yOf(closes[0]).toFixed(2)}`
      : closes
        .map((close, i) => {
          const x = (i / (closes.length - 1)) * 100
          const y = yOf(close)
          if (i === 0) return `M ${x.toFixed(2)} ${y.toFixed(2)}`
          const prevX = ((i - 1) / (closes.length - 1)) * 100
          const prevY = yOf(closes[i - 1])
          const midX = (prevX + x) / 2
          return `C ${midX.toFixed(2)} ${prevY.toFixed(2)}, ${midX.toFixed(2)} ${y.toFixed(2)}, ${x.toFixed(2)} ${y.toFixed(2)}`
        })
        .join(' ')

  const chartTrend = closes.length > 1 ? trendOf(closes[closes.length - 1] - closes[0]) : token.trend
  const headTrend = token.trend ?? trendOf(token.changePct)
  const priceDisplay = formatMoney(token.priceNative, { symbol: token.currencySymbol })

  const chartSummary = closes.length
    ? `${token.name} price over ${timeframe}: ${formatMoney(closes[closes.length - 1], { symbol: token.currencySymbol })}, ` +
      `change ${formatPct(token.changePct)}. Range ${formatMoney(min, { symbol: token.currencySymbol })} to ${formatMoney(max, { symbol: token.currencySymbol })}.`
    : `No price history available for ${token.name}.`

  const detailItems: { label: string; value: ReactNode; isMono?: boolean; Icon: typeof Tag }[] = [
    { label: 'Category', value: token.category, Icon: Tag },
    { label: 'Issuer', value: token.issuer, Icon: Building2 },
    { label: 'Underlying Asset', value: token.underlying, Icon: Box },
    { label: 'Investor Type', value: token.investorType, Icon: Users },
    { label: 'Jurisdiction', value: token.legalJurisdiction, Icon: Globe },
    {
      label: 'Blockchain',
      value: token.blockchain === 'Polygon'
        ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><SiPolygon size={14} />{token.blockchain}</span>
        : token.blockchain === 'Ethereum'
          ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><FaEthereum size={14} />{token.blockchain}</span>
          : token.blockchain,
      Icon: token.blockchain === 'Polygon' ? Hexagon : Layers,
    },
    { label: 'Total Supply', value: token.totalSupply, isMono: true, Icon: Coins },
    { label: 'Decimals', value: String(token.decimals), isMono: true, Icon: Hash },
  ]

  const documents = [
    { label: 'Legal Document', link: token.legalDocument },
    { label: 'Whitepaper', link: token.whitepaper },
    { label: 'Prospectus', link: token.prospectus },
    { label: 'Factsheet', link: token.factsheet },
  ].filter(d => Boolean(d.link))

  const sideColor = tradeSide === 'buy' ? 'var(--fk-gain)' : 'var(--fk-loss)'
  const sideTint = tradeSide === 'buy' ? 'var(--fk-gain-tint)' : 'var(--fk-loss-tint)'
  const canSubmit = block === null

  return (
    <div>
      <Link href="/investor/dashboard" style={backLinkStyle}>
        <ArrowLeft size={14} /> Back to Markets
      </Link>

      <div className="iv-two-col" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        {/* ── Main column ────────────────────────────────────────────── */}
        <div style={{ minWidth: 0 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
            <TokenLogo logo={token.logo} symbol={token.symbol} size={56} isGain={token.isGain} />
            <div style={{ minWidth: 0 }}>
              <h1
                className="iv-page-title fk-clamp-2"
                style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h2)', fontWeight: 700, color: 'var(--fk-text-hi)', marginBottom: 4, lineHeight: 1.25 }}
              >
                {token.name}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <span className="fk-mono" style={{ fontSize: 'var(--fs-body)', color: 'var(--fk-text-mid)' }}>{token.symbol}</span>
                <span className="fk-badge fk-badge-brand">Execution: {executionLabel}</span>
                {token.soldOut && <span className="fk-badge fk-badge-warn">Fully subscribed</span>}
                {!token.tradable && <span className="fk-badge fk-badge-neutral">Not yet priced</span>}
              </div>
            </div>
          </div>

          {/* Hero chart */}
          <div style={{ ...CARD, padding: 0, background: 'var(--fk-surface-2)', overflow: 'hidden', marginBottom: 20 }}>
            <div style={{ padding: '32px 32px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
                  <span
                    className="iv-chart-price fk-mono"
                    style={{ fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 700, color: 'var(--fk-text-hi)', letterSpacing: '-1px' }}
                  >
                    {priceDisplay}
                  </span>
                  <span
                    className={trendBadgeClass(headTrend)}
                    style={{ fontSize: 'var(--fs-sm)', fontWeight: 600 }}
                  >
                    {trendArrow(headTrend)} {formatPct(token.changePct)} (Past 24h)
                  </span>
                </div>
                {token.currency !== 'USD' && (
                  <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--fk-text-low)', marginTop: 6 }}>
                    Quoted in {token.currency}. Orders settle in USD at {formatMoney(token.priceUsd, { symbol: '$' })}.
                  </p>
                )}
              </div>

              <div
                className="iv-timeframes"
                role="tablist"
                aria-label="Chart timeframe"
                style={{ display: 'flex', background: 'var(--fk-surface-1)', borderRadius: 'var(--r-md)', padding: 4, border: '1px solid var(--fk-line)' }}
              >
                {TIMEFRAMES.map(t => (
                  <button
                    key={t}
                    role="tab"
                    aria-selected={t === timeframe}
                    aria-controls="td-chart-panel"
                    onClick={() => setTimeframe(t)}
                    className="td-tf-btn"
                    style={{
                      background: t === timeframe ? 'var(--fk-surface-3)' : 'transparent',
                      border: 'none',
                      color: t === timeframe ? 'var(--fk-text-hi)' : 'var(--fk-text-mid)',
                      fontSize: 'var(--fs-xs)', fontWeight: 600, padding: '6px 12px',
                      borderRadius: 'var(--r-sm)', cursor: 'pointer',
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart */}
            <div
              id="td-chart-panel"
              role="tabpanel"
              aria-label={`${timeframe} price chart`}
              style={{ height: 260, position: 'relative', marginTop: 12 }}
            >
              {chart.loading ? (
                <div style={{ position: 'absolute', inset: '0 32px 32px', display: 'flex', alignItems: 'flex-end' }}>
                  <LoadingAnnouncer label="Loading chart" />
                  <Skeleton w="100%" h={160} r={12} />
                </div>
              ) : chart.error ? (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
                  <ErrorState
                    title="Chart unavailable"
                    body={chart.error}
                    offline={chart.offline}
                    onRetry={chart.refetch}
                  />
                </div>
              ) : candles.length === 0 ? (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
                  <EmptyState
                    compact
                    icon={<LineChart size={20} />}
                    title="No chart data"
                    body={
                      chart.data?.reason === 'NO_PRICE_DATA'
                        ? 'This offering has not been priced yet, so there is no price history to plot.'
                        : 'No price history has been recorded for this timeframe.'
                    }
                  />
                </div>
              ) : (
                <>
                  <svg
                    viewBox="0 0 100 44"
                    preserveAspectRatio="none"
                    role="img"
                    aria-label={chartSummary}
                    style={{ width: '100%', height: '100%', opacity: chart.refreshing ? 0.45 : 1, transition: 'opacity .2s' }}
                  >
                    <title>{`${token.name} ${timeframe} price chart`}</title>
                    {/* Gridlines give the eye a baseline to read values against. */}
                    {[TOP, (TOP + BOTTOM) / 2, BOTTOM].map(y => (
                      <line
                        key={y}
                        x1="0" x2="100" y1={y} y2={y}
                        stroke="var(--fk-line)"
                        strokeWidth="1"
                        vectorEffect="non-scaling-stroke"
                      />
                    ))}
                    {chartPath && (
                      <>
                        <path
                          d={`${chartPath} L 100 44 L 0 44 Z`}
                          fill={trendTint(chartTrend)}
                        />
                        <path
                          d={chartPath}
                          fill="none"
                          stroke={trendColor(chartTrend)}
                          strokeWidth="2"
                          strokeLinecap="round"
                          vectorEffect="non-scaling-stroke"
                        />
                      </>
                    )}
                  </svg>
                  {/* Readable min/max, laid out in HTML so preserveAspectRatio
                      can't stretch the type. */}
                  <div className="fk-mono" style={{ position: 'absolute', right: 12, top: 4, fontSize: 'var(--fs-2xs)', color: 'var(--fk-text-low)' }}>
                    High {formatMoney(max, { symbol: token.currencySymbol })}
                  </div>
                  <div className="fk-mono" style={{ position: 'absolute', right: 12, bottom: 26, fontSize: 'var(--fs-2xs)', color: 'var(--fk-text-low)' }}>
                    Low {formatMoney(min, { symbol: token.currencySymbol })}
                  </div>
                  <p className="fk-sr-only">{chartSummary}</p>
                  {chart.refreshing && <LoadingAnnouncer label={`Loading ${timeframe} chart`} />}
                </>
              )}
            </div>
          </div>

          {/* Detail cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="td-card" style={CARD}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Info size={16} color="var(--fk-blue)" />
                <h2 style={CARD_TITLE}>Asset Overview</h2>
              </div>
              <p style={{ fontSize: 'var(--fs-body)', color: 'var(--fk-text-mid)', lineHeight: 1.7 }}>
                {token.description ?? 'No description has been published for this asset.'}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
              {detailItems.map(item => {
                const Icon = item.Icon
                const empty = item.value === null || item.value === undefined || item.value === ''
                return (
                  <div
                    key={item.label}
                    className="td-tile"
                    style={{ border: '1px solid var(--fk-line)', borderRadius: 'var(--r-lg)', padding: '16px 20px' }}
                  >
                    <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--fk-text-low)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Icon size={14} aria-hidden="true" />
                      <span>{item.label}</span>
                    </div>
                    <div
                      className={item.isMono ? 'fk-mono fk-truncate' : 'fk-truncate'}
                      title={typeof item.value === 'string' ? item.value : undefined}
                      style={{ fontSize: 'var(--fs-body)', color: empty ? 'var(--fk-text-low)' : 'var(--fk-text-hi)', fontWeight: 500 }}
                    >
                      {empty ? EM_DASH : item.value}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="iv-stat-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Yield */}
              <div
                className="td-lift"
                style={{
                  background: 'linear-gradient(135deg, var(--fk-gain-tint) 0%, transparent 100%)',
                  border: '1px solid var(--fk-gain-tint)',
                  borderRadius: 'var(--r-lg)', padding: '16px 24px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                }}
              >
                <div>
                  <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--fk-gain)', marginBottom: 6, fontWeight: 500 }}>Expected Yield (APY)</div>
                  <div style={{ fontSize: 'var(--fs-h2)', color: token.apy ? 'var(--fk-gain)' : 'var(--fk-text-low)', fontWeight: 700 }}>
                    {token.apy ?? EM_DASH}
                  </div>
                </div>
                {token.yieldToken && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 'var(--fs-2xs)', color: 'var(--fk-text-low)', marginBottom: 6 }}>Distributed in</div>
                    <div className="fk-mono" style={{ fontSize: 'var(--fs-sm)', color: 'var(--fk-text-hi)', fontWeight: 600, padding: '4px 12px', background: 'var(--fk-surface-2)', borderRadius: 'var(--r-pill)', border: '1px solid var(--fk-line)' }}>
                      {token.yieldToken}
                    </div>
                  </div>
                )}
              </div>

              {/* Contract */}
              <div
                className="td-card"
                style={{ border: '1px solid var(--fk-line)', borderRadius: 'var(--r-lg)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--fk-text-low)', marginBottom: 6 }}>Smart Contract Address</div>
                  <div className="fk-mono fk-truncate" style={{ fontSize: 'var(--fs-card-title)', color: token.contractAddress ? 'var(--fk-blue-soft)' : 'var(--fk-text-low)', letterSpacing: 0.5 }}>
                    {token.contractAddress ? shortenAddress(token.contractAddress) : EM_DASH}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={copyAddress}
                  disabled={!token.contractAddress}
                  className="td-ghost-btn"
                  aria-label={copied ? 'Contract address copied' : 'Copy contract address'}
                  style={{
                    border: '1px solid var(--fk-line)', borderRadius: 'var(--r-sm)', padding: '8px 14px',
                    color: copied ? 'var(--fk-gain)' : 'var(--fk-text-hi)',
                    fontSize: 'var(--fs-xs)', fontWeight: 500, flexShrink: 0,
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    opacity: token.contractAddress ? 1 : 0.4,
                    cursor: token.contractAddress ? 'pointer' : 'not-allowed',
                  }}
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Documents */}
            <div className="td-card" style={CARD}>
              <h2 style={{ ...CARD_TITLE, marginBottom: 16 }}>Official Documents</h2>
              {documents.length === 0 ? (
                <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--fk-text-low)' }}>
                  No documents have been published for this asset yet.
                </p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  {documents.map(doc => (
                    <a
                      key={doc.label}
                      href={doc.link as string}
                      target="_blank"
                      rel="noreferrer"
                      className="td-doc-chip"
                      style={{
                        border: '1px solid var(--fk-blue-tint)', color: 'var(--fk-blue-soft)',
                        padding: '8px 16px', borderRadius: 'var(--r-pill)',
                        fontSize: 'var(--fs-sm)', fontWeight: 500, textDecoration: 'none',
                        display: 'flex', alignItems: 'center', gap: 8,
                      }}
                    >
                      <Info size={14} aria-hidden="true" /> {doc.label}
                      <ExternalLink size={12} aria-hidden="true" />
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Attestations */}
            {token.attestations.length > 0 && (
              <div className="td-card" style={CARD}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <ShieldAlert size={16} color="var(--fk-gain)" />
                  <h2 style={CARD_TITLE}>Monthly Attestation Reports</h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {token.attestations.slice(0, 5).map(att => (
                    <div key={att.id} style={ROW}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                        <span className="fk-mono" style={{ fontSize: 'var(--fs-sm)', fontWeight: 500, color: 'var(--fk-text-hi)' }}>{att.date}</span>
                        <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--fk-text-mid)' }}>{att.type} by {att.auditor}</span>
                      </div>
                      <a href={att.link} target="_blank" rel="noreferrer" style={{ fontSize: 'var(--fs-xs)', color: 'var(--fk-blue-soft)', fontWeight: 500 }}>
                        View PDF
                      </a>
                    </div>
                  ))}
                  {token.attestations.length > 5 && (
                    <button type="button" onClick={() => setAttestationsModalOpen(true)} className="td-ghost-btn" style={moreButtonStyle}>
                      View all {token.attestations.length} reports
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Rewards */}
            {token.rewardHistory.length > 0 && (
              <div className="td-card" style={CARD}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <Activity size={16} color="var(--fk-blue)" />
                  <h2 style={CARD_TITLE}>Reward Distribution History</h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {token.rewardHistory.slice(0, 5).map(rew => (
                    <div key={rew.id} style={ROW}>
                      <div style={{ minWidth: 0 }}>
                        <div className="fk-mono" style={{ fontSize: 'var(--fs-sm)', fontWeight: 500, color: 'var(--fk-text-hi)' }}>{rew.date}</div>
                        <div className="fk-mono fk-truncate" style={{ fontSize: 'var(--fs-2xs)', color: 'var(--fk-text-low)', marginTop: 4 }}>Tx: {rew.txHash}</div>
                      </div>
                      <div className="fk-mono" style={{ fontSize: 'var(--fs-body)', fontWeight: 600, color: 'var(--fk-gain)', flexShrink: 0 }}>
                        +{rew.amount} {rew.currency ?? ''}
                      </div>
                    </div>
                  ))}
                  {token.rewardHistory.length > 5 && (
                    <button type="button" onClick={() => setRewardModalOpen(true)} className="td-ghost-btn" style={moreButtonStyle}>
                      View all {token.rewardHistory.length} distributions
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Trade column ───────────────────────────────────────────── */}
        <div>
          <div
            className="iv-trade-panel"
            style={{ background: 'var(--fk-surface-1)', border: '1px solid var(--fk-line)', borderRadius: 'var(--r-lg)', padding: 24, position: 'sticky', top: 'calc(var(--header-height) + 24px)' }}
          >
            <div
              role="radiogroup"
              aria-label="Order side"
              style={{ display: 'flex', gap: 8, marginBottom: 24, background: 'var(--fk-surface-2)', padding: 4, borderRadius: 'var(--r-md)' }}
            >
              {(['buy', 'sell'] as const).map(side => (
                <button
                  key={side}
                  type="button"
                  role="radio"
                  aria-checked={tradeSide === side}
                  onClick={() => setTradeSide(side)}
                  style={{
                    flex: 1, padding: 10, border: '1px solid transparent', borderRadius: 'var(--r-sm)',
                    background: tradeSide === side ? (side === 'buy' ? 'var(--fk-gain-tint)' : 'var(--fk-loss-tint)') : 'transparent',
                    borderColor: tradeSide === side ? (side === 'buy' ? 'var(--fk-gain)' : 'var(--fk-loss)') : 'transparent',
                    color: tradeSide === side ? (side === 'buy' ? 'var(--fk-gain)' : 'var(--fk-loss)') : 'var(--fk-text-mid)',
                    fontSize: 'var(--fs-sm)', fontWeight: 600, cursor: 'pointer', transition: 'all .2s',
                    textTransform: 'capitalize',
                  }}
                >
                  {side}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <TokenLogo logo={token.logo} symbol={token.symbol} size={40} isGain={token.isGain} />
              <div style={{ minWidth: 0 }}>
                <div className="fk-truncate" style={{ fontSize: 'var(--fs-body)', fontWeight: 600, color: 'var(--fk-text-hi)', marginBottom: 2 }}>{token.name}</div>
                <div className="fk-mono" style={{ fontSize: 'var(--fs-xs)', color: 'var(--fk-text-low)' }}>
                  {formatMoney(token.priceUsd, { symbol: '$' })}
                </div>
              </div>
            </div>

            {/* Amount */}
            <div style={{ marginBottom: 8 }}>
              <label
                htmlFor="td-amount"
                style={{ display: 'block', fontSize: 'var(--fs-xs)', color: 'var(--fk-text-low)', textAlign: 'center', marginBottom: 4 }}
              >
                Quantity
              </label>
              <input
                id="td-amount"
                className="fk-mono"
                inputMode="decimal"
                autoComplete="off"
                value={tradeAmount}
                disabled={Boolean(block?.hard)}
                aria-invalid={Boolean(block && !block.hard && quote.qty !== null)}
                aria-describedby="td-amount-help"
                onChange={e => setTradeAmount(sanitizeDecimalInput(e.target.value, token.decimals))}
                placeholder="0"
                style={{
                  width: '100%', background: 'transparent',
                  border: 'none', borderBottom: '1px solid var(--fk-line)',
                  color: 'var(--fk-text-hi)', fontSize: 40, fontWeight: 700,
                  textAlign: 'center', padding: '4px 0',
                  opacity: block?.hard ? 0.5 : 1,
                }}
              />
            </div>

            <div id="td-amount-help" style={{ textAlign: 'center', marginBottom: 20, minHeight: 20 }}>
              {block && !block.hard && quote.qty !== null ? (
                <span className="fk-hint fk-err" style={{ fontSize: 'var(--fs-xs)' }}>{block.reason}</span>
              ) : (
                <span className="fk-mono" style={{ fontSize: 'var(--fs-sm)', color: 'var(--fk-text-mid)' }}>
                  ≈ {formatMoney(quote.gross, { symbol: '$' })}
                </span>
              )}
            </div>

            {/* Quick amounts */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
              {([['25%', 0.25], ['50%', 0.5], ['75%', 0.75], ['Max', 1]] as const).map(([label, frac]) => (
                <button
                  key={label}
                  type="button"
                  disabled={Boolean(block?.hard) || quote.maxQty <= 0}
                  onClick={() => setTradeAmount(String(floorTo(quote.maxQty * frac, token.decimals)))}
                  className="td-pct-btn"
                  style={{
                    flex: 1, background: 'transparent', border: '1px solid var(--fk-line)',
                    borderRadius: 'var(--r-sm)', padding: '8px 0', color: 'var(--fk-text-mid)',
                    fontSize: 'var(--fs-xs)',
                    cursor: block?.hard || quote.maxQty <= 0 ? 'not-allowed' : 'pointer',
                    opacity: block?.hard || quote.maxQty <= 0 ? 0.5 : 1,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20, fontSize: 'var(--fs-sm)' }}>
              <SummaryRow label={tradeSide === 'buy' ? `Available ${token.wallet.quoteSymbol}` : `Available ${token.symbol}`} value={quote.balanceLabel} />
              <SummaryRow
                label={`Platform fee (${(quote.feeRate * 100).toFixed(2)}%)`}
                value={quote.fee === null ? EM_DASH : `${tradeSide === 'buy' ? '+' : '-'}${formatMoney(quote.fee, { symbol: '$' })}`}
              />
              <SummaryRow label="Estimated settlement" value={token.fees.estimatedSettlement} />
              <div style={{ borderBottom: '1px dashed var(--fk-line)', margin: '4px 0' }} />
              <SummaryRow
                label={tradeSide === 'buy' ? 'Total cost' : 'You receive'}
                value={formatMoney(quote.total, { symbol: '$' })}
                strong
              />
            </div>

            <button
              type="button"
              onClick={() => setTradeModalOpen(true)}
              disabled={!canSubmit}
              className="fk-btn fk-btn-primary"
              aria-describedby={canSubmit ? undefined : 'td-submit-help'}
              style={{
                width: '100%', justifyContent: 'center',
                fontSize: 'var(--fs-card-title)', padding: 16,
                background: canSubmit ? 'var(--fk-grad)' : 'var(--fk-surface-3)',
                border: 'none', color: canSubmit ? '#fff' : 'var(--fk-text-low)',
                boxShadow: canSubmit ? undefined : 'none',
                cursor: canSubmit ? 'pointer' : 'not-allowed',
              }}
            >
              {tradeSide === 'buy' ? 'Buy' : 'Sell'} {formatQty(quote.qty ?? 0, token.decimals)} {token.symbol}
            </button>

            {block && (
              <p
                id="td-submit-help"
                role={block.hard ? 'status' : undefined}
                style={{ marginTop: 10, fontSize: 'var(--fs-xs)', color: block.hard ? 'var(--fk-warn)' : 'var(--fk-text-low)', textAlign: 'center', lineHeight: 1.5 }}
              >
                {block.reason}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Confirm / status dialog ─────────────────────────────────── */}
      <Modal
        open={tradeModalOpen}
        onClose={closeTradeModal}
        busy={tradeStatus === 'processing'}
        width={420}
        title={
          tradeStatus === 'success' ? 'Transaction submitted'
            : tradeStatus === 'error' ? 'Transaction failed'
              : 'Confirm transaction'
        }
        footer={
          tradeStatus === 'idle' ? (
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" onClick={closeTradeModal} className="fk-btn fk-btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTrade}
                className="fk-btn"
                style={{ flex: 1, justifyContent: 'center', background: sideTint, border: `1px solid ${sideColor}`, color: sideColor, textTransform: 'capitalize' }}
              >
                Confirm {tradeSide}
              </button>
            </div>
          ) : tradeStatus === 'error' ? (
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" onClick={closeTradeModal} className="fk-btn fk-btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                Close
              </button>
              <button type="button" onClick={handleTrade} className="fk-btn fk-btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                Try again
              </button>
            </div>
          ) : tradeStatus === 'success' ? (
            <button type="button" onClick={closeTradeModal} className="fk-btn fk-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Done
            </button>
          ) : null
        }
      >
        {tradeStatus === 'processing' ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div
              style={{
                width: 28, height: 28, border: '3px solid var(--fk-line)', borderTopColor: 'var(--fk-blue)',
                borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px',
              }}
              aria-hidden="true"
            />
            <p role="status" style={{ fontSize: 'var(--fs-body)', color: 'var(--fk-text-mid)' }}>
              Executing via {executionLabel}…
            </p>
          </div>
        ) : tradeStatus === 'error' ? (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ ...statusCircle, background: 'var(--fk-loss-tint)', color: 'var(--fk-loss)' }} aria-hidden="true">
              <AlertTriangle size={22} />
            </div>
            <p role="alert" style={{ fontSize: 'var(--fs-card-title)', fontWeight: 600, color: 'var(--fk-text-hi)', marginBottom: 8 }}>
              Order was not executed
            </p>
            <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--fk-text-mid)', lineHeight: 1.6 }}>
              {failReason} No funds have left your wallet.
            </p>
          </div>
        ) : tradeStatus === 'success' ? (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ ...statusCircle, background: 'var(--fk-gain-tint)', color: 'var(--fk-gain)' }} aria-hidden="true">
              <Check size={22} />
            </div>
            <p role="status" style={{ fontSize: 'var(--fs-card-title)', fontWeight: 600, color: 'var(--fk-text-hi)', marginBottom: 8 }}>
              {tradeSide === 'buy' ? 'Purchase' : 'Sale'} submitted
            </p>
            <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--fk-text-mid)', marginBottom: 16 }}>
              {formatQty(quote.qty, token.decimals)} {token.symbol} · {formatMoney(quote.total, { symbol: '$' })}
            </p>
            {txHash && (
              <>
                <div className="fk-mono fk-truncate" style={{ fontSize: 'var(--fs-2xs)', color: 'var(--fk-text-low)', marginBottom: 10 }}>
                  {shortenAddress(txHash, 10, 8)}
                </div>
                <a
                  href={`${BLOCK_EXPLORER}${txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="fk-btn fk-btn-ghost"
                  style={{ justifyContent: 'center' }}
                >
                  View on explorer <ExternalLink size={13} />
                </a>
              </>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <ConfirmRow label={tradeSide === 'buy' ? 'You pay' : 'You receive'} value={formatMoney(quote.total, { symbol: '$' })} />
            <ConfirmRow
              label={tradeSide === 'buy' ? 'You receive' : 'You sell'}
              value={`${formatQty(quote.qty, token.decimals)} ${token.symbol}`}
            />
            <ConfirmRow label="Price" value={formatMoney(quote.price, { symbol: '$' })} />
            <ConfirmRow
              label={`Platform fee (${(quote.feeRate * 100).toFixed(2)}%)`}
              value={`${tradeSide === 'buy' ? '+' : '-'}${formatMoney(quote.fee, { symbol: '$' })}`}
            />
            <ConfirmRow label="Execution engine" value={executionLabel} accent />
          </div>
        )}
      </Modal>

      {/* ── All attestations ────────────────────────────────────────── */}
      <Modal
        open={attestationsModalOpen}
        onClose={() => setAttestationsModalOpen(false)}
        title="All attestation reports"
        width={520}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {token.attestations.map(att => (
            <div key={att.id} style={ROW}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <span className="fk-mono" style={{ fontSize: 'var(--fs-sm)', fontWeight: 500, color: 'var(--fk-text-hi)' }}>{att.date}</span>
                <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--fk-text-mid)' }}>{att.type} by {att.auditor}</span>
              </div>
              <a href={att.link} target="_blank" rel="noreferrer" style={{ fontSize: 'var(--fs-xs)', color: 'var(--fk-blue-soft)', fontWeight: 500 }}>
                View PDF
              </a>
            </div>
          ))}
        </div>
      </Modal>

      {/* ── All rewards ─────────────────────────────────────────────── */}
      <Modal
        open={rewardModalOpen}
        onClose={() => setRewardModalOpen(false)}
        title="All reward distributions"
        width={520}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {token.rewardHistory.map(rew => (
            <div key={rew.id} style={ROW}>
              <div style={{ minWidth: 0 }}>
                <div className="fk-mono" style={{ fontSize: 'var(--fs-sm)', fontWeight: 500, color: 'var(--fk-text-hi)' }}>{rew.date}</div>
                <div className="fk-mono fk-truncate" style={{ fontSize: 'var(--fs-2xs)', color: 'var(--fk-text-low)', marginTop: 4 }}>Tx: {rew.txHash}</div>
              </div>
              <div className="fk-mono" style={{ fontSize: 'var(--fs-body)', fontWeight: 600, color: 'var(--fk-gain)', flexShrink: 0 }}>
                +{rew.amount} {rew.currency ?? ''}
              </div>
            </div>
          ))}
        </div>
      </Modal>

      {/*
        Hover states live in CSS rather than onMouseEnter/onMouseLeave: every
        inline handler on this page previously set the *same* colour on enter
        and leave, so cards latched into the hover shade permanently.
      */}
      <style>{`
        .td-card { background: var(--fk-surface-2); transition: background .2s; }
        .td-card:hover { background: var(--fk-surface-hover); }
        .td-tile { background: var(--fk-surface-2); transition: background .2s, transform .2s; }
        .td-tile:hover { background: var(--fk-surface-hover); transform: translateY(-2px); }
        .td-lift { transition: transform .2s; }
        .td-lift:hover { transform: translateY(-2px); }
        .td-ghost-btn { background: var(--fk-surface-2); transition: background .2s, color .2s; }
        .td-ghost-btn:hover:not(:disabled) { background: var(--fk-surface-hover); }
        .td-doc-chip { background: var(--fk-blue-tint); transition: border-color .2s, transform .2s; }
        .td-doc-chip:hover { border-color: var(--fk-blue); transform: translateY(-1px); }
        .td-pct-btn { transition: border-color .2s, color .2s; }
        .td-pct-btn:hover:not(:disabled) { border-color: var(--fk-blue); color: var(--fk-text-hi); }
        .td-tf-btn { transition: background .2s, color .2s; }
        .td-tf-btn:hover[aria-selected="false"] { background: var(--fk-surface-hover); color: var(--fk-text-hi); }
      `}</style>
    </div>
  )
}

/* ── Small presentational helpers ──────────────────────────────────────── */

const backLinkStyle: CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  color: 'var(--fk-text-mid)', fontSize: 'var(--fs-sm)',
  textDecoration: 'none', marginBottom: 32,
}

const moreButtonStyle: CSSProperties = {
  border: '1px solid var(--fk-line)', color: 'var(--fk-text-hi)',
  padding: 10, borderRadius: 'var(--r-sm)',
  fontSize: 'var(--fs-sm)', fontWeight: 600, cursor: 'pointer', marginTop: 4,
}

const statusCircle: CSSProperties = {
  width: 48, height: 48, borderRadius: '50%',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  margin: '0 auto 16px',
}

function SummaryRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
      <span style={{ color: strong ? 'var(--fk-text-hi)' : 'var(--fk-text-mid)', fontWeight: strong ? 600 : 400 }}>{label}</span>
      <span className="fk-mono" style={{ color: 'var(--fk-text-hi)', fontWeight: strong ? 700 : 400 }}>{value}</span>
    </div>
  )
}

function ConfirmRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, paddingBottom: 14, borderBottom: '1px solid var(--fk-line)' }}>
      <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--fk-text-low)' }}>{label}</span>
      <span
        className={accent ? undefined : 'fk-mono'}
        style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: accent ? 'var(--fk-blue-soft)' : 'var(--fk-text-hi)' }}
      >
        {value}
      </span>
    </div>
  )
}
