'use client'
import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { TokenLogo } from '@/components/ui/token-logo'
import { Modal } from '@/components/ui/modal'
import { EmptyState, ErrorState, Skeleton, SkeletonCard, SkeletonTable, LoadingAnnouncer } from '@/components/ui/states'
import { useFetch } from '@/lib/useFetch'
import {
  formatMoney, formatRelativeTime, formatDateTime, isValidRecipient,
  sanitizeDecimalInput, shortenAddress, toNumberOrNull, trendArrow, trendBadgeClass,
  trendColor, type Trend,
} from '@/lib/format'
import { BLOCK_EXPLORER, TX_STATUSES, TX_STATUS_BADGE, TX_STATUS_LABELS, type TxStatus } from '@/lib/constants'
import {
  Copy, CheckCircle2, Mail, Wallet, ArrowLeft, CreditCard, QrCode, ExternalLink,
  Send, Loader2, RefreshCw, AlertTriangle, Inbox, Wallet2,
} from 'lucide-react'

/* ── API shapes ─────────────────────────────────────────────────────────── */

type Holding = {
  id: string; symbol: string; name: string
  quantity: number; quantityDisplay: string
  averagePrice: number; averagePriceDisplay: string
  currentPrice: number; currentPriceDisplay: string
  currentValue: number; currentValueDisplay: string
  costBasis: number; pnl: number; pnlDisplay: string
  changePct: number; change: string
  trend: Trend; isGain: boolean | null
  source: string; logo: string | null
}

type Portfolio = {
  totalValue: number; totalValueDisplay: string
  totalPnl: number; totalPnlDisplay: string
  totalPnlPct: number; totalPnlPctDisplay: string
  totalTrend: Trend
  cashBalance: number; cashBalanceDisplay: string
  allocation: { symbol: string; pct: number }[]
  lastSyncedAt: string
  holdings: Holding[]
}

type Tx = {
  id: string; symbol: string; name: string; type: string
  amount: string; price: string; total: string
  status: string; failureReason?: string
  timestamp: string
  txHash: string | null; txHashShort: string | null; explorerUrl: string | null
}

type HistoryResponse = { transactions: Tx[] }

const ALLOCATION_COLORS = [
  'var(--fk-cat-1)', 'var(--fk-cat-2)', 'var(--fk-cat-3)', 'var(--fk-cat-4)',
  'var(--fk-cat-5)', 'var(--fk-cat-6)', 'var(--fk-cat-7)', 'var(--fk-cat-8)',
]

const asTxStatus = (s: string): TxStatus =>
  (TX_STATUSES as readonly string[]).includes(s) ? (s as TxStatus) : 'pending'

const th = (align: 'left' | 'right'): React.CSSProperties => ({
  textAlign: align,
  fontSize: 'var(--fs-2xs)',
  letterSpacing: '.08em',
  textTransform: 'uppercase',
  // Was --fk-text-low at 11px, which fell under the contrast floor.
  color: 'var(--fk-text-mid)',
  padding: '16px',
  borderBottom: '1px solid var(--fk-line)',
  whiteSpace: 'nowrap',
})

const td: React.CSSProperties = { padding: '16px', borderBottom: '1px solid var(--fk-line-soft)' }

const NETWORK_FEE = 0.15

const PageTitle = () => (
  <h1 className="iv-page-title" style={{ fontSize: 'var(--fs-h1)', fontWeight: 700, color: 'var(--fk-text-hi)', marginBottom: 12 }}>Portfolio</h1>
)

/** Keeps the heading and the hero/table geometry so the layout doesn't jump. */
function PortfolioSkeleton() {
  return (
    <div>
      <PageTitle />
      <LoadingAnnouncer label="Loading portfolio" />
      <div className="fk-hero-a iv-hero-card" style={{ padding: '36px 40px', marginBottom: 48 }}>
        <div style={{ position: 'relative', zIndex: 1, display: 'grid', gap: 14, maxWidth: 420 }}>
          <Skeleton w={180} h={12} />
          <Skeleton w={280} h={40} />
          <Skeleton w={200} h={14} />
          <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
            <Skeleton w={130} h={42} r={10} />
            <Skeleton w={100} h={42} r={10} />
          </div>
        </div>
      </div>
      <h2 style={{ fontSize: 'var(--fs-h3)', fontWeight: 600, color: 'var(--fk-text-hi)', marginBottom: 24 }}>Your Assets</h2>
      <div className="fk-card" style={{ padding: 20 }}><SkeletonTable rows={5} cols={5} /></div>
      <h2 style={{ fontSize: 'var(--fs-h3)', fontWeight: 600, color: 'var(--fk-text-hi)', marginTop: 48, marginBottom: 24 }}>Recent Transactions</h2>
      <div className="fk-card" style={{ padding: 20 }}><SkeletonCard rows={3} /></div>
    </div>
  )
}

function PortfolioView() {
  // ?empty=1 / ?fail=1 pass through to the API so the empty and error states
  // are reachable without editing fixtures.
  const searchParams = useSearchParams()
  const fixtureQuery = useMemo(() => {
    const q = new URLSearchParams()
    for (const flag of ['empty', 'fail'] as const) {
      const v = searchParams.get(flag)
      if (v) q.set(flag, v)
    }
    const s = q.toString()
    return s ? `?${s}` : ''
  }, [searchParams])

  const portfolio = useFetch<Portfolio>(`/api/investor/portfolio${fixtureQuery}`)
  const history = useFetch<HistoryResponse>(`/api/investor/history${fixtureQuery}`)

  const data = portfolio.data
  const transactions = history.data?.transactions ?? []

  const [copied, setCopied] = useState(false)

  // Add Funds
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [depositMethod, setDepositMethod] = useState<'onramp' | 'onchain' | null>(null)

  // Send
  const [showSendModal, setShowSendModal] = useState(false)
  const [sendStep, setSendStep] = useState<'form' | 'confirm' | 'success' | 'error'>('form')
  /** 'signing' = waiting on the wallet, 'pending' = broadcast, awaiting inclusion. */
  const [sendPhase, setSendPhase] = useState<'idle' | 'signing' | 'pending'>('idle')
  const [sendAmount, setSendAmount] = useState('')
  const [sendAddress, setSendAddress] = useState('')
  const [sendError, setSendError] = useState<string | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [touched, setTouched] = useState(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = [] }
  useEffect(() => clearTimers, [])

  const cashBalance = data?.cashBalance ?? 0
  const amountNumber = toNumberOrNull(sendAmount)

  const amountError = useMemo(() => {
    if (sendAmount === '') return 'Enter an amount to send.'
    if (amountNumber === null) return 'Enter a valid number.'
    if (amountNumber <= 0) return 'Amount must be greater than zero.'
    if (amountNumber > cashBalance) return `You only have ${formatMoney(cashBalance, { symbol: '' }).trim()} USDC available.`
    return null
  }, [sendAmount, amountNumber, cashBalance])

  const addressError = useMemo(() => {
    if (sendAddress.trim() === '') return 'Enter a recipient.'
    if (!isValidRecipient(sendAddress)) return 'Must be a 0x address (42 characters) or an ENS name ending in .eth.'
    return null
  }, [sendAddress])

  const formValid = !amountError && !addressError

  const openSend = () => {
    clearTimers()
    setSendStep('form'); setSendPhase('idle')
    setSendAmount(''); setSendAddress('')
    setSendError(null); setTxHash(null); setTouched(false)
    setShowSendModal(true)
  }

  const closeSend = () => { clearTimers(); setSendPhase('idle'); setShowSendModal(false) }

  const handleSend = () => {
    if (!formValid) return
    clearTimers()
    setSendError(null)
    setSendPhase('signing')
    timers.current.push(setTimeout(() => setSendPhase('pending'), 900))
    timers.current.push(setTimeout(() => {
      setSendPhase('idle')
      // Mock backend: 1-in-4 broadcasts fail so the error path is reachable.
      if (Math.random() < 0.25) {
        setSendError('The network rejected the transfer: gas price moved above your limit before the transaction was included. Nothing was sent and no fee was charged.')
        setSendStep('error')
        return
      }
      const hash = `0x${Array.from({ length: 64 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('')}`
      setTxHash(hash)
      setSendStep('success')
    }, 2300))
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const refreshAll = () => { portfolio.refetch(); history.refetch() }

  // Mock Privy identity
  const privyUser = {
    email: 'investor@frakta.io', // Set to null to see wallet-only mode
    wallet: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  }

  const busy = sendPhase !== 'idle'

  /* ── Loading / error ──────────────────────────────────────────────────── */

  if (portfolio.loading) return <PortfolioSkeleton />

  if (portfolio.error || !data) {
    return (
      <div>
        <PageTitle />
        <div className="fk-card" style={{ padding: 8 }}>
          <ErrorState
            title="Could not load your portfolio"
            body={portfolio.error ?? undefined}
            offline={portfolio.offline}
            onRetry={refreshAll}
          />
        </div>
      </div>
    )
  }

  const pnlColor = trendColor(data.totalTrend)
  const arrow = trendArrow(data.totalTrend)
  const allocation = data.allocation.filter(a => a.pct > 0)

  return (
    <div>
      <PageTitle />

      <div className="fk-hero-a iv-hero-card" style={{ padding: '36px 40px', marginBottom: 48, display: 'flex', flexDirection: 'column' }}>
        <div className="iv-summary-grid" style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <div className="fk-mono" style={{ fontSize: 'var(--fs-xs)', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--fk-blue-bright)', marginBottom: '12px' }}>Total Portfolio Value</div>
            <div className="fk-mono iv-hero-value" style={{ fontWeight: 700, fontSize: '48px', letterSpacing: '-.01em', margin: '0 0 8px' }}>{data.totalValueDisplay}</div>
            {/* Derived from the API, not a hardcoded green literal — a portfolio
                that is down renders red, and a flat one renders neutral. */}
            <div className="fk-mono" style={{ fontSize: 'var(--fs-body)', color: 'var(--fk-text-mid)' }}>
              <span style={{ color: pnlColor }}>
                {arrow && <span aria-hidden="true">{arrow} </span>}
                {data.totalPnlDisplay} ({data.totalPnlPctDisplay})
              </span> · all time
            </div>
            <div className="flex" style={{ gap: '12px', marginTop: '32px', flexWrap: 'wrap' }}>
              <button onClick={() => { setShowDepositModal(true); setDepositMethod(null) }} className="fk-btn fk-btn-primary" style={{ padding: '12px 24px', fontSize: 'var(--fs-body)' }}>Add funds</button>
              <button onClick={openSend} className="fk-btn fk-btn-secondary" style={{ padding: '12px 24px', fontSize: 'var(--fs-body)' }}>Send</button>
            </div>
          </div>

          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {privyUser.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--fk-surface-1)', border: '1px solid var(--fk-line)', padding: '6px 14px', borderRadius: 999, fontSize: 'var(--fs-sm)', color: 'var(--fk-text-hi)', backdropFilter: 'blur(10px)' }}>
                  <Mail size={14} style={{ color: 'var(--fk-text-mid)' }} />
                  <span style={{ fontWeight: 500 }}>{privyUser.email}</span>
                </div>
              )}
              {privyUser.wallet && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--fk-surface-1)', border: '1px solid var(--fk-line)', padding: '6px 14px', borderRadius: 999, fontSize: 'var(--fs-sm)', color: 'var(--fk-text-hi)', backdropFilter: 'blur(10px)' }}>
                  <Wallet size={14} style={{ color: 'var(--fk-text-mid)' }} />
                  <span className="fk-mono" style={{ fontWeight: 500 }}>{shortenAddress(privyUser.wallet)}</span>
                  <div style={{ width: 1, height: 14, background: 'var(--fk-line)', margin: '0 2px' }} />
                  <button
                    onClick={() => handleCopy(privyUser.wallet)}
                    aria-label="Copy wallet address"
                    title="Copy wallet address"
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: copied ? 'var(--fk-gain)' : 'var(--fk-text-mid)', padding: 0, transition: 'color 0.2s' }}
                  >
                    {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--fk-text-low)' }}>
                Last synced {formatRelativeTime(data.lastSyncedAt)}
              </p>
              <button
                onClick={refreshAll}
                disabled={portfolio.refreshing || history.refreshing}
                aria-label="Refresh portfolio"
                className="fk-btn fk-btn-secondary"
                style={{ padding: '6px 12px', fontSize: 'var(--fs-xs)', gap: 6 }}
              >
                <span style={{ display: 'inline-flex', animation: portfolio.refreshing ? 'spin 1s linear infinite' : undefined }}>
                  <RefreshCw size={12} />
                </span>
                {portfolio.refreshing ? 'Refreshing…' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Allocation — the page previously had no portfolio-level visualization */}
      {allocation.length > 0 && (
        <section style={{ marginBottom: 48 }}>
          <h2 style={{ fontSize: 'var(--fs-h3)', fontWeight: 600, color: 'var(--fk-text-hi)', marginBottom: 24 }}>Allocation</h2>
          <div className="fk-card" style={{ padding: 24 }}>
            <div
              role="img"
              aria-label={`Allocation by value: ${allocation.map(a => `${a.symbol} ${a.pct}%`).join(', ')}`}
              style={{ display: 'flex', height: 12, borderRadius: 999, overflow: 'hidden', background: 'var(--fk-surface-1)' }}
            >
              {allocation.map((a, i) => (
                <div key={a.symbol} title={`${a.symbol} · ${a.pct}%`} style={{ width: `${a.pct}%`, background: ALLOCATION_COLORS[i % ALLOCATION_COLORS.length] }} />
              ))}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 24px', marginTop: 20 }}>
              {allocation.map((a, i) => (
                <div key={a.symbol} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--fs-sm)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: ALLOCATION_COLORS[i % ALLOCATION_COLORS.length], flexShrink: 0 }} />
                  <span style={{ color: 'var(--fk-text-hi)', fontWeight: 500 }}>{a.symbol}</span>
                  <span className="fk-mono" style={{ color: 'var(--fk-text-mid)' }}>{a.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <h2 style={{ fontSize: 'var(--fs-h3)', fontWeight: 600, color: 'var(--fk-text-hi)', marginBottom: 24 }}>Your Assets</h2>

      <div className="fk-card" style={{ overflow: 'hidden' }}>
        {data.holdings.length === 0 ? (
          <EmptyState
            icon={<Wallet2 size={20} />}
            title="You don't hold any assets yet"
            body="Once you buy your first tokenized asset it will appear here with its live value and performance."
            action={{ label: 'Explore markets', href: '/investor/dashboard' }}
          />
        ) : (
          <div className="fk-table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
              <thead>
                <tr>
                  <th scope="col" className="fk-mono" style={th('left')}>Asset</th>
                  <th scope="col" className="fk-mono" style={th('right')}>Quantity</th>
                  <th scope="col" className="fk-mono" style={th('right')}>Avg Price</th>
                  <th scope="col" className="fk-mono" style={th('right')}>Current Price</th>
                  <th scope="col" className="fk-mono" style={th('right')}>Total Value</th>
                </tr>
              </thead>
              <tbody>
                {data.holdings.map(h => (
                  <tr key={h.id}>
                    <td style={td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                        <TokenLogo logo={h.logo} symbol={h.symbol} size={32} isGain={h.isGain} />
                        <div style={{ minWidth: 0, maxWidth: 240 }}>
                          <p style={{ fontWeight: 600, color: 'var(--fk-text-hi)' }}>{h.symbol}</p>
                          {/* The fixtures include a 72-char name — must not blow out the table */}
                          <p className="fk-truncate" style={{ fontSize: 'var(--fs-xs)', color: 'var(--fk-text-mid)' }} title={h.name}>{h.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="fk-mono" style={{ ...td, textAlign: 'right', color: 'var(--fk-text-hi)' }}>{h.quantityDisplay}</td>
                    <td className="fk-mono" style={{ ...td, textAlign: 'right', color: 'var(--fk-text-hi)' }}>{h.averagePriceDisplay}</td>
                    <td className="fk-mono" style={{ ...td, textAlign: 'right' }}>
                      <div style={{ color: 'var(--fk-text-hi)', marginBottom: 4 }}>{h.currentPriceDisplay}</div>
                      {/* isGain null (e.g. USDC at 0.00%) must render neutral, not green */}
                      <div style={{ fontSize: 'var(--fs-2xs)', color: trendColor(h.trend) }}>{h.change}</div>
                    </td>
                    <td className="fk-mono" style={{ ...td, textAlign: 'right', fontWeight: 600, color: 'var(--fk-text-hi)' }}>{h.currentValueDisplay}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <h2 style={{ fontSize: 'var(--fs-h3)', fontWeight: 600, color: 'var(--fk-text-hi)', marginTop: 48, marginBottom: 24 }}>Recent Transactions</h2>

      <div className="fk-card" style={{ overflow: 'hidden' }}>
        {history.loading ? (
          <div style={{ padding: 20 }}><SkeletonTable rows={4} cols={7} /><LoadingAnnouncer label="Loading transactions" /></div>
        ) : history.error ? (
          <ErrorState
            title="Could not load your transactions"
            body={history.error}
            offline={history.offline}
            onRetry={history.refetch}
          />
        ) : transactions.length === 0 ? (
          <EmptyState
            icon={<Inbox size={20} />}
            title="No transactions yet"
            body="Your buys, sells and transfers will be listed here as soon as you make your first trade."
            action={{ label: 'Explore markets', href: '/investor/dashboard' }}
          />
        ) : (
          <div className="fk-table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
              <thead>
                <tr>
                  <th scope="col" className="fk-mono" style={th('left')}>Transaction</th>
                  <th scope="col" className="fk-mono" style={th('right')}>Type</th>
                  <th scope="col" className="fk-mono" style={th('right')}>Amount</th>
                  <th scope="col" className="fk-mono" style={th('right')}>Price</th>
                  <th scope="col" className="fk-mono" style={th('right')}>Total</th>
                  <th scope="col" className="fk-mono" style={th('right')}>Status</th>
                  <th scope="col" className="fk-mono" style={th('left')}>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => {
                  const status = asTxStatus(tx.status)
                  return (
                    <tr key={tx.id}>
                      <td style={td}>
                        <div style={{ maxWidth: 220 }}>
                          <div style={{ fontWeight: 600, color: 'var(--fk-text-hi)' }}>{tx.symbol}</div>
                          {tx.explorerUrl && tx.txHashShort ? (
                            <a
                              href={tx.explorerUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="fk-mono"
                              style={{ fontSize: 'var(--fs-2xs)', color: 'var(--fk-blue-bright)', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                            >
                              {tx.txHashShort} <ExternalLink size={10} />
                            </a>
                          ) : (
                            <div className="fk-mono" style={{ fontSize: 'var(--fs-2xs)', color: 'var(--fk-text-mid)' }}>{tx.id.toUpperCase()}</div>
                          )}
                        </div>
                      </td>
                      <td style={{ ...td, textAlign: 'right' }}>
                        <span className={`fk-badge ${tx.type === 'BUY' ? 'fk-badge-gain' : 'fk-badge-loss'}`}>{tx.type}</span>
                      </td>
                      <td className="fk-mono" style={{ ...td, textAlign: 'right', color: 'var(--fk-text-hi)' }}>{tx.amount}</td>
                      <td className="fk-mono" style={{ ...td, textAlign: 'right', color: 'var(--fk-text-hi)' }}>{tx.price}</td>
                      <td className="fk-mono" style={{ ...td, textAlign: 'right', fontWeight: 600, color: 'var(--fk-text-hi)' }}>{tx.total}</td>
                      <td style={{ ...td, textAlign: 'right' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                          <span className={`fk-badge ${TX_STATUS_BADGE[status]}`}>
                            <span className="fk-dot" />
                            {TX_STATUS_LABELS[status]}
                          </span>
                          {tx.failureReason && (
                            <span className="fk-clamp-2" style={{ fontSize: 'var(--fs-2xs)', color: 'var(--fk-text-mid)', maxWidth: 180, textAlign: 'right' }} title={tx.failureReason}>
                              {tx.failureReason}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="fk-mono" style={{ ...td, textAlign: 'left', color: 'var(--fk-text-mid)', fontSize: 'var(--fs-2xs)', whiteSpace: 'nowrap' }}>
                        {formatDateTime(tx.timestamp)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Add Funds Modal ─────────────────────────────────────────────── */}
      <Modal
        open={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        width={480}
        title={
          depositMethod === 'onramp' ? 'Buy with Fiat'
            : depositMethod === 'onchain' ? 'Deposit Crypto'
              : 'Add Funds'
        }
      >
        {depositMethod && (
          <button
            onClick={() => setDepositMethod(null)}
            className="fk-btn fk-btn-ghost"
            style={{ padding: '6px 10px', fontSize: 'var(--fs-sm)', gap: 6, marginBottom: 16 }}
          >
            <ArrowLeft size={14} /> Back
          </button>
        )}

        {!depositMethod && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <button onClick={() => setDepositMethod('onramp')} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: 20, background: 'var(--fk-surface-1)', border: '1px solid var(--fk-line)', borderRadius: 12, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = 'var(--fk-surface-2)'; e.currentTarget.style.borderColor = 'var(--fk-blue)' }} onMouseLeave={e => { e.currentTarget.style.background = 'var(--fk-surface-1)'; e.currentTarget.style.borderColor = 'var(--fk-line)' }}>
              <div style={{ background: 'var(--fk-blue-tint)', color: 'var(--fk-blue)', padding: 12, borderRadius: 12, display: 'flex' }}>
                <CreditCard size={24} />
              </div>
              <div>
                <div style={{ fontSize: 'var(--fs-card-title)', fontWeight: 600, color: 'var(--fk-text-hi)', marginBottom: 4 }}>Buy with Fiat (On-ramp)</div>
                <div style={{ fontSize: 'var(--fs-body)', color: 'var(--fk-text-mid)', lineHeight: 1.5 }}>The easiest way for beginners. Buy digital dollars (USDC) directly using your credit card, Apple Pay, or bank transfer.</div>
              </div>
            </button>

            <button onClick={() => setDepositMethod('onchain')} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: 20, background: 'var(--fk-surface-1)', border: '1px solid var(--fk-line)', borderRadius: 12, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = 'var(--fk-surface-2)'; e.currentTarget.style.borderColor = 'var(--fk-blue)' }} onMouseLeave={e => { e.currentTarget.style.background = 'var(--fk-surface-1)'; e.currentTarget.style.borderColor = 'var(--fk-line)' }}>
              <div style={{ background: 'var(--fk-surface-3)', color: 'var(--fk-text-hi)', padding: 12, borderRadius: 12, display: 'flex' }}>
                <QrCode size={24} />
              </div>
              <div>
                <div style={{ fontSize: 'var(--fs-card-title)', fontWeight: 600, color: 'var(--fk-text-hi)', marginBottom: 4 }}>Deposit Crypto (On-chain)</div>
                <div style={{ fontSize: 'var(--fs-body)', color: 'var(--fk-text-mid)', lineHeight: 1.5 }}>Transfer crypto from an external exchange (Binance, Coinbase) or your personal Web3 wallet (MetaMask, TrustWallet).</div>
              </div>
            </button>
          </div>
        )}

        {depositMethod === 'onramp' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ padding: '16px 20px', background: 'var(--fk-blue-tint)', borderLeft: '3px solid var(--fk-blue)', borderRadius: '0 8px 8px 0' }}>
              <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--fk-text-hi)', lineHeight: 1.6, margin: 0 }}>Your fiat money (USD, EUR, etc.) will be automatically converted into <strong>USDC</strong> tokens by our certified partners. The USDC will be deposited directly into your Frakta wallet.</p>
            </div>

            <div>
              <h3 style={{ fontSize: 'var(--fs-xs)', textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--fk-text-mid)', marginBottom: 16 }}>Select a provider</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { name: 'Alchemy Pay', initial: 'A', color: 'var(--fk-cat-1)' },
                  { name: 'MoonPay', initial: 'M', color: 'var(--fk-cat-4)' },
                  { name: 'Stripe', initial: 'S', color: 'var(--fk-cat-2)' },
                ].map(p => (
                  <button key={p.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, background: 'var(--fk-surface-1)', border: '1px solid var(--fk-line)', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--fk-surface-2)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--fk-surface-1)'}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 32, height: 32, background: p.color, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A0B10', fontWeight: 'bold', fontSize: 'var(--fs-body)' }}>{p.initial}</div>
                      <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--fk-text-hi)' }}>{p.name}</span>
                    </div>
                    <ExternalLink size={16} color="var(--fk-text-mid)" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {depositMethod === 'onchain' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ padding: '16px 20px', background: 'var(--fk-warn-tint)', borderLeft: '3px solid var(--fk-warn)', borderRadius: '0 8px 8px 0' }}>
              <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--fk-text-hi)', lineHeight: 1.6, margin: 0 }}>Please ensure you only send <strong>USDC</strong> assets using the <strong>Polygon (MATIC)</strong> or <strong>Ethereum (ERC-20)</strong> networks. Sending other coins or using other networks will result in permanent loss of your assets.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <div style={{ padding: 16, background: '#fff', borderRadius: 16 }}>
                <div style={{ width: 180, height: 180, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <div style={{ width: '90%', height: '90%', background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Cpath fill=\'%23fff\' d=\'M10 10h30v30H10zm5 5v20h20V15zm-5 45h30v30H10zm5 5v20h20V65zM55 10h30v30H55zm5 5v20h20V15zM55 60h10v10H55zm0 15h10v10H55zm15-15h10v10H70zm15 15h10v10H85zm-15 15h10v10H70zm15-30h10v10H85z\'/%3E%3C/svg%3E")' }} />
                  <div style={{ position: 'absolute', width: 40, height: 40, background: '#fff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TokenLogo logo="https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=026" symbol="USDC" size={24} />
                  </div>
                </div>
              </div>

              <div style={{ width: '100%' }}>
                <div style={{ fontSize: 'var(--fs-xs)', textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--fk-text-mid)', marginBottom: 8, textAlign: 'center' }}>Your Frakta Wallet Address</div>
                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--fk-surface-1)', border: '1px solid var(--fk-line)', borderRadius: 12, padding: 4 }}>
                  <div className="fk-mono fk-truncate" style={{ flex: 1, padding: '12px 16px', fontSize: 'var(--fs-sm)', color: 'var(--fk-text-hi)' }}>
                    {privyUser.wallet}
                  </div>
                  <button onClick={() => handleCopy(privyUser.wallet)} aria-label="Copy deposit address" className="fk-btn" style={{ padding: '10px 16px', background: 'var(--fk-surface-2)', display: 'flex', alignItems: 'center', gap: 6, color: copied ? 'var(--fk-gain)' : 'var(--fk-text-hi)' }}>
                    {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                    <span style={{ fontSize: 'var(--fs-sm)', fontWeight: 500 }}>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Send Modal ──────────────────────────────────────────────────── */}
      <Modal
        open={showSendModal}
        onClose={closeSend}
        width={480}
        busy={busy}
        title={
          sendStep === 'form' ? 'Send Asset'
            : sendStep === 'confirm' ? 'Confirm Transaction'
              : sendStep === 'success' ? 'Transaction Sent'
                : 'Transaction Failed'
        }
      >
        {/* Step 1: Form */}
        {sendStep === 'form' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--fs-sm)', fontWeight: 500, color: 'var(--fk-text-mid)', marginBottom: 8 }}>Asset</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px', background: 'var(--fk-surface-1)', border: '1px solid var(--fk-line)', borderRadius: 12 }}>
                <TokenLogo logo="https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=026" symbol="USDC" size={24} />
                <span style={{ fontSize: 'var(--fs-card-title)', fontWeight: 600, color: 'var(--fk-text-hi)' }}>USDC</span>
                <span style={{ marginLeft: 'auto', fontSize: 'var(--fs-body)', color: 'var(--fk-text-mid)' }}>Balance: {data.cashBalanceDisplay}</span>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label htmlFor="send-amount" style={{ fontSize: 'var(--fs-sm)', fontWeight: 500, color: 'var(--fk-text-mid)' }}>Amount</label>
                <button onClick={() => { setTouched(true); setSendAmount(String(cashBalance)) }} style={{ background: 'transparent', border: 'none', color: 'var(--fk-blue)', fontSize: 'var(--fs-sm)', fontWeight: 600, cursor: 'pointer' }}>MAX</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', padding: '16px', background: 'var(--fk-surface-0)', border: `1px solid ${touched && amountError ? 'var(--fk-loss)' : 'var(--fk-line)'}`, borderRadius: 12 }}>
                {/* Text + sanitizer instead of type=number: the numeric input
                    accepted '-500' and '1e9' and silently exceeded the balance. */}
                <input
                  id="send-amount"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={sendAmount}
                  onChange={e => { setTouched(true); setSendAmount(sanitizeDecimalInput(e.target.value, 6)) }}
                  aria-invalid={touched && !!amountError}
                  aria-describedby="send-amount-help"
                  placeholder="0.00"
                  style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: 24, fontWeight: 700, color: 'var(--fk-text-hi)' }}
                  className="fk-mono"
                />
                <span style={{ fontSize: 'var(--fs-card-title)', fontWeight: 600, color: 'var(--fk-text-mid)' }}>USDC</span>
              </div>
              <p id="send-amount-help" style={{ fontSize: 'var(--fs-xs)', marginTop: 6, color: touched && amountError ? 'var(--fk-loss)' : 'var(--fk-text-mid)' }}>
                {touched && amountError ? amountError : `Available: ${data.cashBalanceDisplay} USDC`}
              </p>
            </div>

            <div>
              <label htmlFor="send-to" style={{ display: 'block', fontSize: 'var(--fs-sm)', fontWeight: 500, color: 'var(--fk-text-mid)', marginBottom: 8 }}>Send to</label>
              <input
                id="send-to"
                type="text"
                spellCheck={false}
                autoComplete="off"
                value={sendAddress}
                onChange={e => { setTouched(true); setSendAddress(e.target.value) }}
                aria-invalid={touched && !!addressError}
                aria-describedby="send-to-help"
                placeholder="Enter ENS name or 0x address"
                style={{ width: '100%', padding: '16px', background: 'var(--fk-surface-0)', border: `1px solid ${touched && addressError ? 'var(--fk-loss)' : 'var(--fk-line)'}`, borderRadius: 12, fontSize: 'var(--fs-body)', color: 'var(--fk-text-hi)' }}
                className="fk-mono"
              />
              <p id="send-to-help" style={{ fontSize: 'var(--fs-xs)', marginTop: 6, color: touched && addressError ? 'var(--fk-loss)' : 'var(--fk-text-mid)' }}>
                {touched && addressError ? addressError : 'Transfers cannot be reversed — double-check the recipient.'}
              </p>
            </div>

            <div>
              <button
                onClick={() => { setTouched(true); if (formValid) setSendStep('confirm') }}
                disabled={!formValid}
                className="fk-btn fk-btn-primary"
                style={{ width: '100%', padding: '16px', fontSize: 'var(--fs-card-title)', cursor: formValid ? 'pointer' : 'not-allowed' }}
              >
                Review Transaction
              </button>
              {!formValid && (
                <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--fk-text-mid)', marginTop: 8, textAlign: 'center' }}>
                  {amountError ?? addressError}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Confirm */}
        {sendStep === 'confirm' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <button
              onClick={() => setSendStep('form')}
              disabled={busy}
              className="fk-btn fk-btn-ghost"
              style={{ padding: '6px 10px', fontSize: 'var(--fs-sm)', gap: 6, alignSelf: 'flex-start' }}
            >
              <ArrowLeft size={14} /> Edit
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0' }}>
              <div className="fk-mono" style={{ fontSize: 40, fontWeight: 700, color: 'var(--fk-text-hi)', marginBottom: 8 }}>
                {sendAmount} <span style={{ fontSize: 20, color: 'var(--fk-text-mid)' }}>USDC</span>
              </div>
              <div style={{ fontSize: 'var(--fs-body)', color: 'var(--fk-text-mid)' }}>≈ {formatMoney(amountNumber)}</div>
            </div>

            <div style={{ background: 'var(--fk-surface-1)', borderRadius: 12, padding: '16px', border: '1px solid var(--fk-line)', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 'var(--fs-body)', color: 'var(--fk-text-mid)' }}>From</span>
                <span className="fk-mono" style={{ fontSize: 'var(--fs-body)', color: 'var(--fk-text-hi)' }}>{shortenAddress(privyUser.wallet)}</span>
              </div>
              <div style={{ height: 1, background: 'var(--fk-line-soft)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 'var(--fs-body)', color: 'var(--fk-text-mid)' }}>To</span>
                {/* shortenAddress leaves short values (ENS names) intact — the old
                    substring pair rendered 'abc' as 'abc...abc'. */}
                <span className="fk-mono fk-truncate" style={{ fontSize: 'var(--fs-body)', color: 'var(--fk-text-hi)', maxWidth: 220 }} title={sendAddress}>{shortenAddress(sendAddress)}</span>
              </div>
              <div style={{ height: 1, background: 'var(--fk-line-soft)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 'var(--fs-body)', color: 'var(--fk-text-mid)' }}>Network Fee</span>
                <span className="fk-mono" style={{ fontSize: 'var(--fs-body)', color: 'var(--fk-text-hi)' }}>
                  {NETWORK_FEE.toFixed(2)} USDC <span style={{ color: 'var(--fk-text-low)' }}>({formatMoney(NETWORK_FEE, { digits: 2 })})</span>
                </span>
              </div>
            </div>

            <button onClick={handleSend} disabled={busy} className="fk-btn fk-btn-primary" style={{ width: '100%', padding: '16px', fontSize: 'var(--fs-card-title)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {busy ? (
                <>
                  <span style={{ display: 'inline-flex', animation: 'spin 1s linear infinite' }}><Loader2 size={20} /></span>
                  {sendPhase === 'signing' ? 'Waiting for wallet…' : 'Broadcasting…'}
                </>
              ) : (
                <>
                  <Send size={18} />
                  Confirm Send
                </>
              )}
            </button>

            {busy && (
              <p role="status" aria-live="polite" style={{ fontSize: 'var(--fs-xs)', color: 'var(--fk-text-mid)', textAlign: 'center' }}>
                {sendPhase === 'signing'
                  ? 'Approve the transfer in your wallet. Keep this window open.'
                  : 'Submitted to the network — waiting for the first confirmation.'}
              </p>
            )}
          </div>
        )}

        {/* Step 3a: Success */}
        {sendStep === 'success' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0', textAlign: 'center', gap: 24 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--fk-gain-tint)', color: 'var(--fk-gain)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={48} />
            </div>

            <div>
              <h3 style={{ fontSize: 'var(--fs-h2)', fontWeight: 700, color: 'var(--fk-text-hi)', marginBottom: 8 }}>Transaction Sent</h3>
              <p style={{ fontSize: 15, color: 'var(--fk-text-mid)', lineHeight: 1.5 }}>
                You sent {sendAmount} USDC to <span className="fk-mono">{shortenAddress(sendAddress)}</span>.
              </p>
            </div>

            {txHash && (
              <div style={{ width: '100%', background: 'var(--fk-surface-1)', border: '1px solid var(--fk-line)', borderRadius: 12, padding: '12px 16px', textAlign: 'left' }}>
                <div style={{ fontSize: 'var(--fs-2xs)', textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--fk-text-mid)', marginBottom: 4 }}>Transaction hash</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="fk-mono fk-truncate" style={{ fontSize: 'var(--fs-sm)', color: 'var(--fk-text-hi)' }} title={txHash}>{shortenAddress(txHash, 10, 8)}</span>
                  <button onClick={() => handleCopy(txHash)} aria-label="Copy transaction hash" style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', color: copied ? 'var(--fk-gain)' : 'var(--fk-text-mid)', padding: 0, marginLeft: 'auto' }}>
                    {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
              {txHash && (
                <a
                  href={`${BLOCK_EXPLORER}${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="fk-btn fk-btn-secondary"
                  style={{ width: '100%', padding: '16px', fontSize: 15, gap: 8 }}
                >
                  View on Explorer <ExternalLink size={16} />
                </a>
              )}
              <button onClick={() => { refreshAll(); closeSend() }} className="fk-btn fk-btn-primary" style={{ width: '100%', padding: '16px', fontSize: 'var(--fs-card-title)' }}>
                Done
              </button>
            </div>
          </div>
        )}

        {/* Step 3b: Failure — the old flow had no way to fail */}
        {sendStep === 'error' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0', textAlign: 'center', gap: 24 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--fk-loss-tint)', color: 'var(--fk-loss)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={44} />
            </div>

            <div role="alert">
              <h3 style={{ fontSize: 'var(--fs-h2)', fontWeight: 700, color: 'var(--fk-text-hi)', marginBottom: 8 }}>Transfer failed</h3>
              <p style={{ fontSize: 15, color: 'var(--fk-text-mid)', lineHeight: 1.5 }}>{sendError ?? 'The transfer could not be completed.'}</p>
            </div>

            <div style={{ width: '100%', background: 'var(--fk-surface-1)', border: '1px solid var(--fk-line)', borderRadius: 12, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 'var(--fs-sm)' }}>
                <span style={{ color: 'var(--fk-text-mid)' }}>Amount</span>
                <span className="fk-mono" style={{ color: 'var(--fk-text-hi)' }}>{sendAmount} USDC</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 'var(--fs-sm)' }}>
                <span style={{ color: 'var(--fk-text-mid)' }}>Recipient</span>
                <span className="fk-mono" style={{ color: 'var(--fk-text-hi)' }}>{shortenAddress(sendAddress)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
              <button onClick={() => { setSendStep('confirm'); handleSend() }} className="fk-btn fk-btn-primary" style={{ width: '100%', padding: '16px', fontSize: 'var(--fs-card-title)', gap: 8 }}>
                <RefreshCw size={16} /> Try again
              </button>
              <button onClick={() => { setSendError(null); setSendStep('form') }} className="fk-btn fk-btn-secondary" style={{ width: '100%', padding: '16px', fontSize: 15 }}>
                Edit transfer
              </button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  )
}

export default function PortfolioPage() {
  // useSearchParams needs a Suspense boundary to keep this page prerenderable.
  return (
    <Suspense fallback={<PortfolioSkeleton />}>
      <PortfolioView />
    </Suspense>
  )
}
