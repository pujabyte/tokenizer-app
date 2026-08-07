'use client'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertTriangle, ArrowDown, CheckCircle, ChevronDown, ExternalLink, Loader2, Lock, RefreshCw, Settings, XCircle,
} from 'lucide-react'
import { TokenLogo } from '@/components/ui/token-logo'
import { Modal } from '@/components/ui/modal'
import { useFetch } from '@/lib/useFetch'
import { EmptyState, ErrorState, LoadingAnnouncer, Skeleton } from '@/components/ui/states'
import { KycInlineNotice, useKycGate } from '@/components/investor/onboarding-shared'
import { BLOCK_EXPLORER } from '@/lib/constants'
import { balanceOf } from '@/app/api/investor/tokens/data'
import { EM_DASH, formatMoney, formatQty, sanitizeDecimalInput, toNumberOrNull } from '@/lib/format'

type Token = {
  id: string
  symbol: string
  name: string
  logo: string | null
  price: string | null
  priceUsd: number | null
  currencySymbol: string
  decimals: number
  tradable: boolean
  soldOut?: boolean
}

type TokensResponse = { assets: Token[] }

/** Quotes go stale — a swap panel that shows a 10-minute-old rate is a trap. */
const QUOTE_TTL_SECONDS = 15
/** Mock pool depth in USD, used to derive a plausible price impact. */
const POOL_DEPTH_USD = 100_000
const NETWORK_FEE_USD = 0.12

type SwapStatus = 'idle' | 'confirming' | 'pending' | 'success' | 'rejected' | 'failed'

export default function SwapPage() {
  const router = useRouter()
  const { approved: kycApproved, loading: kycLoading } = useKycGate()
  const { data, loading, error, offline, refetch } = useFetch<TokensResponse>('/api/investor/tokens')

  // Non-tradable assets stay in the list but render disabled with a reason —
  // silently hiding them made "where is PRELN?" unanswerable.
  const tokens = useMemo(() => data?.assets ?? [], [data])

  const [payToken, setPayToken] = useState<Token | null>(null)
  const [receiveToken, setReceiveToken] = useState<Token | null>(null)
  const [payAmount, setPayAmount] = useState('1000')

  const [showSettings, setShowSettings] = useState(false)
  const [slippage, setSlippage] = useState('0.5')
  // Tracked separately so typing a value that happens to equal a preset doesn't
  // clear the custom field out from under the user.
  const [slippageIsCustom, setSlippageIsCustom] = useState(false)
  const [deadline, setDeadline] = useState('20')
  const [selectingFor, setSelectingFor] = useState<'pay' | 'receive' | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const [status, setStatus] = useState<SwapStatus>('idle')
  const [txHash, setTxHash] = useState<string | null>(null)
  const [txMessage, setTxMessage] = useState<string | null>(null)

  // Quote freshness
  const [quoteNonce, setQuoteNonce] = useState(0)
  const [quoteAge, setQuoteAge] = useState(0)

  // Seed the two sides once tokens land.
  useEffect(() => {
    if (tokens.length === 0 || payToken || receiveToken) return
    const usdc = tokens.find(t => t.symbol === 'USDC') ?? tokens[0]
    const aapl = tokens.find(t => t.symbol === 'AAPLon') ?? tokens.find(t => t.id !== usdc?.id) ?? null
    setPayToken(usdc ?? null)
    setReceiveToken(aapl)
  }, [tokens, payToken, receiveToken])

  useEffect(() => {
    setQuoteAge(0)
    const id = setInterval(() => setQuoteAge(a => a + 1), 1000)
    return () => clearInterval(id)
  }, [payToken?.id, receiveToken?.id, payAmount, quoteNonce])

  const quoteStale = quoteAge >= QUOTE_TTL_SECONDS

  /* ── Derived quote ─────────────────────────────────────────────────────── */

  const payAmountNum = toNumberOrNull(payAmount)
  const payBalance = balanceOf(payToken?.symbol)
  const receiveBalance = balanceOf(receiveToken?.symbol)

  const payPrice = payToken?.priceUsd ?? null
  const receivePrice = receiveToken?.priceUsd ?? null

  const receiveAmountNum = (() => {
    if (payAmountNum === null || payAmountNum <= 0) return null
    if (payPrice === null || receivePrice === null || receivePrice === 0) return null
    return (payAmountNum * payPrice) / receivePrice
  })()

  // Respect each token's own decimals — NYCRE has 0, so '2.4671 NYCRE' was a lie.
  const receiveAmountDisplay =
    receiveAmountNum === null ? '' : formatQty(receiveAmountNum, receiveToken?.decimals ?? 4)

  const exchangeRate = (() => {
    if (!payToken || !receiveToken || payPrice === null || receivePrice === null || payPrice === 0) return EM_DASH
    return `1 ${receiveToken.symbol} = ${formatQty(receivePrice / payPrice, 4)} ${payToken.symbol}`
  })()

  const payNotionalUsd = payAmountNum !== null && payPrice !== null ? payAmountNum * payPrice : null
  const priceImpactPct =
    payNotionalUsd === null ? null : Math.min(100, (payNotionalUsd / POOL_DEPTH_USD) * 100)

  const slippageNum = toNumberOrNull(slippage)
  const slippageError =
    slippageNum === null ? 'Enter a slippage tolerance'
    : slippageNum <= 0 ? 'Slippage must be greater than 0%'
    : slippageNum > 50 ? 'Slippage must be 50% or lower'
    : null
  const slippageWarning = !slippageError && slippageNum !== null && slippageNum > 5
    ? 'High slippage — you could receive noticeably less than quoted'
    : null

  const deadlineNum = toNumberOrNull(deadline)
  const deadlineError =
    deadlineNum === null ? 'Enter a deadline in minutes'
    : deadlineNum < 1 ? 'Deadline must be at least 1 minute'
    : deadlineNum > 180 ? 'Deadline must be 180 minutes or less'
    : null

  const minReceived =
    receiveAmountNum === null || slippageNum === null || slippageError
      ? null
      : receiveAmountNum * (1 - slippageNum / 100)

  /* ── Validation ────────────────────────────────────────────────────────── */

  /** Single source of truth for "can this swap run", and for the button label.
   *  The old check was `Number(payAmount) === 0`, which let 'abc' (NaN) and
   *  '-100' through and reported a successful swap with an empty receive field. */
  const validate = (): string | null => {
    if (loading) return 'Loading tokens…'
    if (error) return 'Market data unavailable'
    if (!kycLoading && !kycApproved) return 'Complete KYC to swap'
    if (!payToken || !receiveToken) return 'Select tokens'
    if (payToken.id === receiveToken.id) return 'Select a different token'
    if (!payToken.tradable || payPrice === null) return `${payToken.symbol} is not tradable yet`
    if (!receiveToken.tradable || receivePrice === null) return `${receiveToken.symbol} is not tradable yet`
    if (payAmount.trim() === '' || payAmountNum === null) return 'Enter an amount'
    if (payAmountNum <= 0) return 'Invalid amount'
    if (payAmountNum > payBalance) return `Insufficient ${payToken.symbol} balance`
    if (slippageError) return 'Check slippage tolerance'
    if (deadlineError) return 'Check transaction deadline'
    if (quoteStale) return 'Refresh the quote'
    return null
  }

  const blockReason = validate()
  const inFlight = status === 'confirming' || status === 'pending'
  // Staleness is the *only* blocker the CTA can resolve itself.
  const staleOnly = blockReason === 'Refresh the quote'

  /* ── Actions ───────────────────────────────────────────────────────────── */

  const resetResult = () => { setStatus('idle'); setTxHash(null); setTxMessage(null) }

  /** Deterministic mock outcome so every branch is demoable:
   *  integer part ending in 7 → rejected in wallet, in 3 → reverts on-chain. */
  const outcomeFor = (amount: number): Extract<SwapStatus, 'success' | 'rejected' | 'failed'> => {
    const lastDigit = Math.floor(Math.abs(amount)) % 10
    if (lastDigit === 7) return 'rejected'
    if (lastDigit === 3) return 'failed'
    return 'success'
  }

  const handleSwap = () => {
    if (blockReason || payAmountNum === null) return
    const outcome = outcomeFor(payAmountNum)

    setTxHash(null)
    setTxMessage(null)
    setStatus('confirming')

    // Phase 1: awaiting the wallet signature.
    window.setTimeout(() => {
      if (outcome === 'rejected') {
        setStatus('rejected')
        setTxMessage('You rejected the request in your wallet. Nothing was submitted.')
        return
      }
      const hash = `0xswap${Math.floor(payAmountNum).toString(16).padStart(6, '0')}aabbccddeeff00112233445566778899`
      setTxHash(hash)
      // Phase 2: signed and broadcast, now waiting on the chain.
      setStatus('pending')
      window.setTimeout(() => {
        if (outcome === 'failed') {
          setStatus('failed')
          setTxMessage('Transaction reverted — the price moved beyond your slippage tolerance before it confirmed.')
          return
        }
        setStatus('success')
        setPayAmount('')
      }, 1600)
    }, 1200)
  }

  const switchTokens = () => {
    const nextPay = receiveToken
    setPayToken(nextPay)
    setReceiveToken(payToken)
    setPayAmount(receiveAmountNum === null ? '' : sanitizeDecimalInput(String(receiveAmountNum), nextPay?.decimals ?? 6))
    resetResult()
  }

  const pickToken = (t: Token) => {
    // Uniswap behaviour: picking the token already on the other side flips them.
    if (selectingFor === 'pay') {
      if (receiveToken && t.id === receiveToken.id) setReceiveToken(payToken)
      setPayToken(t)
    } else {
      if (payToken && t.id === payToken.id) setPayToken(receiveToken)
      setReceiveToken(t)
    }
    setSelectingFor(null)
    setSearchQuery('')
    resetResult()
  }

  const setMax = () => {
    if (!payToken) return
    setPayAmount(sanitizeDecimalInput(String(payBalance), payToken.decimals ?? 6))
    resetResult()
  }

  const opposingId = selectingFor === 'pay' ? receiveToken?.id : payToken?.id
  const query = searchQuery.trim().toLowerCase()
  const selectorTokens = tokens
    .filter(t => t.id !== opposingId)
    .filter(t => query === '' || t.name.toLowerCase().includes(query) || t.symbol.toLowerCase().includes(query))

  /* ── Render ────────────────────────────────────────────────────────────── */

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 40 }}>
        <div className="fk-card iv-swap-card" style={{ width: '100%', maxWidth: 480 }}>
          <ErrorState
            title="Could not load swap markets"
            body={error}
            offline={offline}
            onRetry={refetch}
          />
        </div>
      </div>
    )
  }

  const impactColor =
    priceImpactPct === null ? 'var(--fk-text-hi)'
    : priceImpactPct >= 5 ? 'var(--fk-loss)'
    : priceImpactPct >= 1 ? 'var(--fk-warn)'
    : 'var(--fk-text-hi)'

  return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 40 }}>
      {loading && <LoadingAnnouncer label="Loading swap markets" />}

      {/* Token selector */}
      <Modal
        open={selectingFor !== null}
        onClose={() => { setSelectingFor(null); setSearchQuery('') }}
        title="Select a token"
        width={440}
      >
        <input
          type="text"
          className="fk-input"
          placeholder="Search name or symbol"
          aria-label="Search tokens by name or symbol"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ marginBottom: 16, padding: '12px 16px', fontSize: 15 }}
        />
        <div style={{ maxHeight: 340, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 4px' }}>
                <Skeleton w={36} h={36} r={999} />
                <div style={{ flex: 1, display: 'grid', gap: 6 }}>
                  <Skeleton w="35%" h={12} />
                  <Skeleton w="55%" h={10} />
                </div>
                <Skeleton w={60} h={12} />
              </div>
            ))
          ) : selectorTokens.length === 0 ? (
            <EmptyState
              compact
              title={query ? `No tokens found for “${searchQuery.trim()}”` : 'No tokens available'}
              body={query ? 'Check the spelling, or search by ticker instead.' : 'Market data returned no tradable tokens.'}
              action={query ? { label: 'Clear search', onClick: () => setSearchQuery('') } : undefined}
            />
          ) : (
            selectorTokens.map(t => {
              const untradable = !t.tradable || t.priceUsd === null
              return (
                <button
                  key={t.id}
                  type="button"
                  disabled={untradable}
                  onClick={() => pickToken(t)}
                  aria-label={untradable ? `${t.symbol} — not tradable yet` : `Select ${t.symbol}, ${t.name}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left',
                    padding: '12px', borderRadius: 'var(--r-md)', background: 'transparent',
                    border: '1px solid transparent', cursor: untradable ? 'not-allowed' : 'pointer',
                    opacity: untradable ? 0.55 : 1, transition: 'background .15s',
                  }}
                  onMouseEnter={e => { if (!untradable) e.currentTarget.style.background = 'var(--fk-surface-hover)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                  onFocus={e => { if (!untradable) e.currentTarget.style.background = 'var(--fk-surface-hover)' }}
                  onBlur={e => { e.currentTarget.style.background = 'transparent' }}
                >
                  <TokenLogo logo={t.logo} symbol={t.symbol} size={36} isGain={null} />
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: 'block', fontWeight: 600, color: 'var(--fk-text-hi)' }}>{t.symbol}</span>
                    <span className="fk-truncate" style={{ display: 'block', fontSize: 'var(--fs-xs)', color: 'var(--fk-text-mid)', maxWidth: 200 }}>
                      {t.name}
                    </span>
                  </span>
                  <span style={{ marginLeft: 'auto', textAlign: 'right', flexShrink: 0 }}>
                    <span className="fk-mono" style={{ display: 'block', fontWeight: 600, color: 'var(--fk-text-hi)' }}>
                      {t.price ?? EM_DASH}
                    </span>
                    <span style={{ display: 'block', fontSize: 'var(--fs-2xs)', color: untradable ? 'var(--fk-warn)' : 'var(--fk-text-mid)' }}>
                      {untradable ? 'Not tradable' : `Balance ${formatQty(balanceOf(t.symbol), t.decimals)}`}
                    </span>
                  </span>
                </button>
              )
            })
          )}
        </div>
      </Modal>

      <div className="fk-card iv-swap-card" style={{ width: '100%', maxWidth: 480, padding: 24 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h1 className="iv-page-title" style={{ fontSize: 'var(--fs-h3)', fontWeight: 700, color: 'var(--fk-text-hi)' }}>
            {showSettings ? 'Transaction Settings' : 'Swap'}
          </h1>
          <button
            type="button"
            onClick={() => setShowSettings(s => !s)}
            aria-label={showSettings ? 'Close transaction settings' : 'Open transaction settings'}
            aria-expanded={showSettings}
            style={{
              background: showSettings ? 'var(--fk-surface-2)' : 'transparent',
              color: 'var(--fk-text-mid)', cursor: 'pointer', padding: 8,
              borderRadius: 'var(--r-sm)', display: 'flex', transition: 'background .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--fk-surface-hover)' }}
            onMouseLeave={e => { e.currentTarget.style.background = showSettings ? 'var(--fk-surface-2)' : 'transparent' }}
          >
            <Settings size={20} style={{ color: showSettings ? 'var(--fk-text-hi)' : 'var(--fk-text-mid)' }} />
          </button>
        </div>

        {showSettings ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <div id="slippage-label" style={{ fontSize: 'var(--fs-body)', fontWeight: 600, color: 'var(--fk-text-hi)', marginBottom: 12 }}>
                Slippage Tolerance
              </div>
              <div role="group" aria-labelledby="slippage-label" style={{ display: 'flex', gap: 8 }}>
                {['0.1', '0.5', '1.0'].map(val => {
                  const active = !slippageIsCustom && slippage === val
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => { setSlippage(val); setSlippageIsCustom(false) }}
                      aria-pressed={active}
                      style={{
                        flex: 1, padding: '8px 0', borderRadius: 'var(--r-sm)',
                        border: `1px solid ${active ? 'var(--fk-blue)' : 'var(--fk-line)'}`,
                        background: active ? 'var(--fk-blue-tint)' : 'var(--fk-surface-1)',
                        color: active ? 'var(--fk-blue-bright)' : 'var(--fk-text-hi)',
                        fontWeight: 600, cursor: 'pointer', transition: 'all .15s',
                      }}
                    >
                      {val}%
                    </button>
                  )
                })}
                <div
                  style={{
                    display: 'flex', alignItems: 'center', background: 'var(--fk-surface-1)',
                    border: `1px solid ${slippageError ? 'var(--fk-loss)' : 'var(--fk-line)'}`,
                    borderRadius: 'var(--r-sm)', padding: '0 12px', width: 104,
                  }}
                >
                  <input
                    className="fk-mono"
                    type="text"
                    inputMode="decimal"
                    placeholder="Custom"
                    aria-label="Custom slippage tolerance, percent"
                    value={slippageIsCustom ? slippage : ''}
                    onChange={e => { setSlippage(sanitizeDecimalInput(e.target.value, 2)); setSlippageIsCustom(true) }}
                    style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: 'var(--fk-text-hi)', fontSize: 13 }}
                  />
                  <span style={{ color: 'var(--fk-text-mid)', fontSize: 13 }}>%</span>
                </div>
              </div>
              {slippageError && <p className="fk-hint fk-err">{slippageError}</p>}
              {slippageWarning && <p className="fk-hint" style={{ color: 'var(--fk-warn)' }}>{slippageWarning}</p>}
            </div>

            <div>
              <label
                htmlFor="swap-deadline"
                style={{ display: 'block', fontSize: 'var(--fs-body)', fontWeight: 600, color: 'var(--fk-text-hi)', marginBottom: 12 }}
              >
                Transaction Deadline
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    display: 'flex', alignItems: 'center', background: 'var(--fk-surface-1)',
                    border: `1px solid ${deadlineError ? 'var(--fk-loss)' : 'var(--fk-line)'}`,
                    borderRadius: 'var(--r-sm)', padding: '8px 12px', width: 88,
                  }}
                >
                  <input
                    id="swap-deadline"
                    className="fk-mono"
                    type="text"
                    inputMode="numeric"
                    value={deadline}
                    onChange={e => setDeadline(sanitizeDecimalInput(e.target.value, 0))}
                    style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: 'var(--fk-text-hi)', fontSize: 13, textAlign: 'center' }}
                  />
                </div>
                <span style={{ color: 'var(--fk-text-mid)', fontSize: 13 }}>minutes</span>
              </div>
              {deadlineError && <p className="fk-hint fk-err">{deadlineError}</p>}
            </div>

            <button
              type="button"
              onClick={() => setShowSettings(false)}
              className="fk-btn fk-btn-primary"
              disabled={Boolean(slippageError || deadlineError)}
              style={{ width: '100%', marginTop: 8, padding: 12, justifyContent: 'center' }}
            >
              Save & Close
            </button>
          </div>
        ) : (
          <>
            {!kycLoading && !kycApproved && <KycInlineNotice />}

            {/* You Pay */}
            <div style={{ background: 'var(--fk-surface-1)', borderRadius: 'var(--r-lg)', padding: 16, marginBottom: 8, border: '1px solid var(--fk-line)' }}>
              <label htmlFor="swap-pay-amount" style={{ display: 'block', fontSize: 'var(--fs-sm)', color: 'var(--fk-text-mid)', marginBottom: 8 }}>
                You Pay
              </label>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <input
                  id="swap-pay-amount"
                  type="text"
                  inputMode="decimal"
                  className="fk-mono"
                  value={payAmount}
                  onChange={e => setPayAmount(sanitizeDecimalInput(e.target.value, payToken?.decimals ?? 6))}
                  aria-describedby="swap-pay-balance"
                  style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 28, fontWeight: 700, color: 'var(--fk-text-hi)', width: '55%', minWidth: 0 }}
                  placeholder="0.0"
                />
                {payToken ? (
                  <button
                    type="button"
                    onClick={() => setSelectingFor('pay')}
                    aria-label={`Change the token you pay with. Currently ${payToken.symbol}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, background: 'var(--fk-surface-2)',
                      border: '1px solid var(--fk-line-soft)', padding: '6px 12px', borderRadius: 'var(--r-pill)',
                      cursor: 'pointer', color: 'var(--fk-text-hi)', fontWeight: 600, flexShrink: 0, transition: 'background .15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--fk-surface-3)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--fk-surface-2)' }}
                  >
                    <TokenLogo logo={payToken.logo} symbol={payToken.symbol} size={24} isGain={null} />
                    <span>{payToken.symbol}</span>
                    <ChevronDown size={16} color="var(--fk-text-mid)" aria-hidden="true" />
                  </button>
                ) : (
                  <Skeleton w={110} h={36} r={999} />
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                <span id="swap-pay-balance" className="fk-mono" style={{ fontSize: 'var(--fs-sm)', color: 'var(--fk-text-mid)' }}>
                  Balance: {payToken ? `${formatQty(payBalance, payToken.decimals)} ${payToken.symbol}` : EM_DASH}
                </span>
                <button
                  type="button"
                  onClick={setMax}
                  disabled={!payToken || payBalance <= 0}
                  aria-label={`Use your full ${payToken?.symbol ?? ''} balance`}
                  style={{
                    marginLeft: 'auto', padding: '2px 10px', borderRadius: 'var(--r-pill)',
                    border: '1px solid var(--fk-line)', background: 'var(--fk-surface-2)',
                    color: 'var(--fk-blue-bright)', fontSize: 'var(--fs-2xs)', fontWeight: 700,
                    cursor: !payToken || payBalance <= 0 ? 'not-allowed' : 'pointer',
                    opacity: !payToken || payBalance <= 0 ? 0.4 : 1, transition: 'all .15s',
                  }}
                  onMouseEnter={e => { if (payBalance > 0) e.currentTarget.style.borderColor = 'var(--fk-blue)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--fk-line)' }}
                >
                  MAX
                </button>
              </div>
            </div>

            {/* Switch */}
            <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', height: 16, margin: '-12px 0' }}>
              <div style={{ position: 'absolute', top: -4, background: 'var(--fk-surface-0)', padding: 4, borderRadius: '50%', zIndex: 10 }}>
                <button
                  type="button"
                  onClick={switchTokens}
                  disabled={inFlight}
                  aria-label="Swap the pay and receive tokens"
                  style={{
                    width: 32, height: 32, borderRadius: '50%', background: 'var(--fk-surface-2)',
                    border: '1px solid var(--fk-line)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: 'var(--fk-text-hi)', cursor: 'pointer', transition: 'background .15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--fk-surface-3)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--fk-surface-2)' }}
                >
                  <ArrowDown size={16} aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* You Receive */}
            <div style={{ background: 'var(--fk-surface-1)', borderRadius: 'var(--r-lg)', padding: 16, marginTop: 8, border: '1px solid var(--fk-line)' }}>
              <label htmlFor="swap-receive-amount" style={{ display: 'block', fontSize: 'var(--fs-sm)', color: 'var(--fk-text-mid)', marginBottom: 8 }}>
                You Receive (estimated)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <input
                  id="swap-receive-amount"
                  type="text"
                  className="fk-mono"
                  value={receiveAmountDisplay}
                  readOnly
                  aria-describedby="swap-receive-balance"
                  style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 28, fontWeight: 700, color: 'var(--fk-text-hi)', width: '55%', minWidth: 0 }}
                  placeholder="0.0"
                />
                {receiveToken ? (
                  <button
                    type="button"
                    onClick={() => setSelectingFor('receive')}
                    aria-label={`Change the token you receive. Currently ${receiveToken.symbol}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, background: 'var(--fk-surface-2)',
                      border: '1px solid var(--fk-line-soft)', padding: '6px 12px', borderRadius: 'var(--r-pill)',
                      cursor: 'pointer', color: 'var(--fk-text-hi)', fontWeight: 600, flexShrink: 0, transition: 'background .15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--fk-surface-3)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--fk-surface-2)' }}
                  >
                    <TokenLogo logo={receiveToken.logo} symbol={receiveToken.symbol} size={24} isGain={null} />
                    <span>{receiveToken.symbol}</span>
                    <ChevronDown size={16} color="var(--fk-text-mid)" aria-hidden="true" />
                  </button>
                ) : (
                  <Skeleton w={110} h={36} r={999} />
                )}
              </div>
              <div id="swap-receive-balance" className="fk-mono" style={{ fontSize: 'var(--fs-sm)', color: 'var(--fk-text-mid)', marginTop: 8 }}>
                Balance: {receiveToken ? `${formatQty(receiveBalance, receiveToken.decimals)} ${receiveToken.symbol}` : EM_DASH}
              </div>
            </div>

            {/* Quote details */}
            <div style={{ padding: '16px 8px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--fs-sm)', gap: 12 }}>
                <span style={{ color: 'var(--fk-text-mid)' }}>Exchange Rate</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="fk-mono" style={{ color: 'var(--fk-text-hi)', fontWeight: 600 }}>{exchangeRate}</span>
                  <button
                    type="button"
                    onClick={() => setQuoteNonce(n => n + 1)}
                    aria-label="Refresh the quote"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px',
                      borderRadius: 'var(--r-pill)', border: '1px solid var(--fk-line)',
                      color: quoteStale ? 'var(--fk-warn)' : 'var(--fk-text-mid)',
                      fontSize: 'var(--fs-2xs)', cursor: 'pointer',
                    }}
                  >
                    <RefreshCw size={10} aria-hidden="true" />
                    {quoteStale ? 'Stale' : `${QUOTE_TTL_SECONDS - quoteAge}s`}
                  </button>
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-sm)' }}>
                <span style={{ color: 'var(--fk-text-mid)' }}>Price Impact</span>
                <span className="fk-mono" style={{ color: impactColor, fontWeight: 600 }}>
                  {priceImpactPct === null ? EM_DASH : `${priceImpactPct.toFixed(2)}%`}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-sm)' }}>
                <span style={{ color: 'var(--fk-text-mid)' }}>Minimum Received</span>
                <span className="fk-mono" style={{ color: 'var(--fk-text-hi)', fontWeight: 600 }}>
                  {minReceived === null || !receiveToken
                    ? EM_DASH
                    : `${formatQty(minReceived, receiveToken.decimals)} ${receiveToken.symbol}`}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-sm)' }}>
                <span style={{ color: 'var(--fk-text-mid)' }}>Network Fee</span>
                <span className="fk-mono" style={{ color: 'var(--fk-text-hi)', fontWeight: 600 }}>{formatMoney(NETWORK_FEE_USD)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-sm)' }}>
                <span style={{ color: 'var(--fk-text-mid)' }}>Slippage / Deadline</span>
                <span className="fk-mono" style={{ color: 'var(--fk-text-hi)', fontWeight: 600 }}>
                  {slippageError ? EM_DASH : `${slippage}%`} · {deadlineError ? EM_DASH : `${deadline} min`}
                </span>
              </div>
            </div>

            {/* Warnings */}
            {priceImpactPct !== null && priceImpactPct >= 1 && (
              <div className={`fk-alert ${priceImpactPct >= 5 ? 'fk-alert-loss' : 'fk-alert-warn'}`} style={{ marginBottom: 12 }}>
                <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
                <div>
                  <b>{priceImpactPct >= 5 ? 'Very high price impact' : 'Noticeable price impact'}</b>
                  <p>
                    This trade moves the pool by {priceImpactPct.toFixed(2)}%. Consider splitting it into
                    smaller swaps to get a better rate.
                  </p>
                </div>
              </div>
            )}

            {quoteStale && status === 'idle' && (
              <div className="fk-alert fk-alert-warn" style={{ marginBottom: 12 }}>
                <RefreshCw size={16} style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
                <div>
                  <b>Quote expired</b>
                  <p>Prices update every {QUOTE_TTL_SECONDS} seconds. Refresh to get a current rate.</p>
                </div>
              </div>
            )}

            {/* Result banners */}
            {status === 'success' && (
              <div className="fk-fbanner fk-fb-gain" style={{ marginBottom: 12 }}>
                <CheckCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
                <div style={{ minWidth: 0 }}>
                  <p className="fk-ft">Swap confirmed</p>
                  <p className="fk-fd">
                    Your balances are updated.{' '}
                    {txHash && (
                      <a
                        href={`${BLOCK_EXPLORER}${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="fk-mono"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--fk-blue-bright)' }}
                        aria-label="View this swap on the block explorer"
                      >
                        View transaction <ExternalLink size={10} aria-hidden="true" />
                      </a>
                    )}
                  </p>
                </div>
              </div>
            )}

            {(status === 'rejected' || status === 'failed') && (
              <div className={`fk-fbanner ${status === 'rejected' ? 'fk-fb-warn' : 'fk-fb-loss'}`} style={{ marginBottom: 12 }}>
                <XCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
                <div style={{ minWidth: 0 }}>
                  <p className="fk-ft">{status === 'rejected' ? 'Swap rejected in your wallet' : 'Swap failed on-chain'}</p>
                  <p className="fk-fd">
                    {txMessage}{' '}
                    {status === 'failed' && txHash && (
                      <a
                        href={`${BLOCK_EXPLORER}${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="fk-mono"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--fk-blue-bright)' }}
                        aria-label="View the failed transaction on the block explorer"
                      >
                        View transaction <ExternalLink size={10} aria-hidden="true" />
                      </a>
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* Action */}
            {status === 'success' || status === 'rejected' || status === 'failed' ? (
              <button
                type="button"
                className="fk-btn fk-btn-primary"
                onClick={resetResult}
                style={{ width: '100%', padding: 16, fontSize: 16, marginTop: 8, justifyContent: 'center' }}
              >
                {status === 'success' ? 'Start a new swap' : 'Try again'}
              </button>
            ) : !kycLoading && !kycApproved ? (
              <button
                type="button"
                className="fk-btn fk-btn-primary"
                onClick={() => router.push('/investor/onboarding')}
                style={{ width: '100%', padding: 16, fontSize: 16, marginTop: 8, justifyContent: 'center' }}
              >
                <Lock size={16} aria-hidden="true" /> Complete KYC to swap
              </button>
            ) : (
              <button
                type="button"
                className="fk-btn fk-btn-primary"
                onClick={staleOnly ? () => setQuoteNonce(n => n + 1) : handleSwap}
                disabled={inFlight || (Boolean(blockReason) && !staleOnly)}
                aria-live="polite"
                style={{ width: '100%', padding: 16, fontSize: 16, marginTop: 8, justifyContent: 'center' }}
              >
                {status === 'confirming' && (
                  <>
                    <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} aria-hidden="true" />
                    Confirm in your wallet…
                  </>
                )}
                {status === 'pending' && (
                  <>
                    <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} aria-hidden="true" />
                    Pending on-chain…
                  </>
                )}
                {status === 'idle' && (blockReason ?? 'Confirm Swap')}
              </button>
            )}

            {status === 'pending' && txHash && (
              <p className="fk-hint" style={{ textAlign: 'center' }}>
                Broadcast as{' '}
                <a
                  href={`${BLOCK_EXPLORER}${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="fk-mono"
                  style={{ color: 'var(--fk-blue-bright)' }}
                >
                  {txHash.slice(0, 10)}…{txHash.slice(-6)}
                </a>
              </p>
            )}

            <p className="fk-hint" style={{ textAlign: 'center' }}>
              Demo environment: amounts ending in 3 revert on-chain, amounts ending in 7 are rejected in the wallet.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
