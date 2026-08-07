'use client'
import React, { useMemo, useState } from 'react'
import StatCard from '@/components/ui/StatCard'
import {
  AlertTriangle, CheckCircle, Clock, Coins, ExternalLink, HandCoins, Loader2, RefreshCw,
} from 'lucide-react'
import { TokenLogo } from '@/components/ui/token-logo'
import { Modal } from '@/components/ui/modal'
import { useFetch } from '@/lib/useFetch'
import { EmptyState, ErrorState, LoadingAnnouncer, Skeleton, SkeletonTable } from '@/components/ui/states'
import { KycInlineNotice, useKycGate } from '@/components/investor/onboarding-shared'
import { BLOCK_EXPLORER } from '@/lib/constants'
import { formatMoney, formatRelativeTime, formatDateTime } from '@/lib/format'

type PendingClaim = {
  id: string
  tokenId: string
  symbol: string
  name: string
  type: string
  amount: number
  amountDisplay: string
  currency: string
  availableSince: string
  claimableUntil: string
  logo: string | null
  belowMinimum: boolean
  gasExceedsReward: boolean
  expiringSoon: boolean
}

type RewardHistoryRow = {
  id: string
  symbol: string
  type: string
  amount: number
  amountDisplay: string
  status: string
  timestamp: string
  txHash: string | null
  failureReason?: string
}

type RewardsResponse = {
  summary: {
    totalEarned: number; totalEarnedDisplay: string
    pendingClaim: number; pendingClaimDisplay: string
    totalClaimed: number; totalClaimedDisplay: string
  }
  config: { minClaimUsd: number; gasEstimateUsd: number }
  pendingClaims: PendingClaim[]
  history: RewardHistoryRow[]
}

type ClaimResult = {
  id: string
  status: 'success' | 'failed' | 'rejected'
  reason?: string
  amountDisplay?: string
  txHash?: string
}

/** Reward-history statuses map to explicit badge modifiers. The old two-way
 *  branch defaulted to green, so a `failed` payout rendered as a success. */
const HISTORY_STATUS: Record<string, { label: string; badge: string }> = {
  claimed: { label: 'Claimed', badge: 'fk-badge-gain' },
  'auto-distributed': { label: 'Auto-distributed', badge: 'fk-badge-brand' },
  pending: { label: 'Pending', badge: 'fk-badge-warn' },
  failed: { label: 'Failed', badge: 'fk-badge-loss' },
}
const historyStatus = (status: string) =>
  HISTORY_STATUS[status] ?? { label: status, badge: 'fk-badge-neutral' }

const cell: React.CSSProperties = { padding: '16px', borderBottom: '1px solid var(--fk-line-soft)' }
const th: React.CSSProperties = {
  fontSize: 'var(--fs-2xs)', letterSpacing: '.08em', textTransform: 'uppercase',
  color: 'var(--fk-text-mid)', padding: '16px', whiteSpace: 'nowrap',
  borderBottom: '1px solid var(--fk-line)',
}

export default function RewardsPage() {
  const { approved: kycApproved, loading: kycLoading } = useKycGate()
  const { data, loading, error, offline, refetch } = useFetch<RewardsResponse>('/api/investor/rewards')

  const [confirmIds, setConfirmIds] = useState<string[] | null>(null)
  const [claimingIds, setClaimingIds] = useState<string[]>([])
  const [results, setResults] = useState<ClaimResult[] | null>(null)
  const [claimError, setClaimError] = useState<string | null>(null)
  // Successful claims are removed locally — the mock API keeps returning them.
  const [settledIds, setSettledIds] = useState<string[]>([])

  const config = data?.config ?? { minClaimUsd: 10, gasEstimateUsd: 0.42 }
  const allClaims = useMemo(() => data?.pendingClaims ?? [], [data])
  const claims = useMemo(
    () => allClaims.filter(c => !settledIds.includes(c.id)),
    [allClaims, settledIds]
  )
  const history = data?.history ?? []

  const isBlocked = (c: PendingClaim) => c.belowMinimum || c.gasExceedsReward
  const blockedReason = (c: PendingClaim) => {
    if (c.belowMinimum) return `Below the ${formatMoney(config.minClaimUsd)} minimum claim amount`
    if (c.gasExceedsReward) return `Gas (${formatMoney(config.gasEstimateUsd)}) costs more than this reward`
    return null
  }

  // Derived locally so the summary cards agree with the table after a claim.
  const pendingTotal = claims.reduce((s, c) => s + c.amount, 0)
  const settledTotal = allClaims.filter(c => settledIds.includes(c.id)).reduce((s, c) => s + c.amount, 0)

  const claimable = claims.filter(c => !isBlocked(c))
  const confirmClaims = confirmIds ? claims.filter(c => confirmIds.includes(c.id)) : []
  const confirmTotal = confirmClaims.reduce((s, c) => s + c.amount, 0)
  const busy = claimingIds.length > 0

  const submitClaim = async (ids: string[]) => {
    setClaimingIds(ids)
    setClaimError(null)
    setResults(null)
    try {
      const res = await fetch('/api/investor/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimIds: ids }),
      })
      // 207 is a partial success — it carries results, so it must not be treated
      // as a hard failure.
      if (!res.ok && res.status !== 207) {
        let message = `Claim failed (${res.status})`
        try {
          const body = await res.json()
          if (body?.error) message = body.error
        } catch { /* non-JSON error body */ }
        throw new Error(message)
      }
      const body: { results?: ClaimResult[] } = await res.json()
      const list = body.results ?? []
      setResults(list)
      const succeeded = list.filter(r => r.status === 'success').map(r => r.id)
      if (succeeded.length > 0) setSettledIds(prev => [...prev, ...succeeded])
    } catch (err) {
      setClaimError(err instanceof Error ? err.message : 'Could not reach the claim service')
    } finally {
      setClaimingIds([])
      setConfirmIds(null)
    }
  }

  const heading = (
    <h1 className="iv-page-title" style={{ fontSize: 'var(--fs-h1)', fontWeight: 700, color: 'var(--fk-text-hi)', marginBottom: 24 }}>
      Rewards Hub
    </h1>
  )

  if (loading) {
    return (
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        {heading}
        <LoadingAnnouncer label="Loading rewards" />
        <div className="iv-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, marginBottom: 48 }}>
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} h={92} r={16} />)}
        </div>
        <div className="fk-card" style={{ padding: 20, marginBottom: 48 }}>
          <SkeletonTable rows={4} cols={5} />
        </div>
        <div className="fk-card" style={{ padding: 20 }}>
          <SkeletonTable rows={3} cols={5} />
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        {heading}
        <div className="fk-card">
          <ErrorState
            title="Could not load your rewards"
            body={error ?? undefined}
            offline={offline}
            onRetry={refetch}
          />
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {heading}

      {!kycLoading && !kycApproved && <KycInlineNotice />}

      {/* Summary */}
      <div className="iv-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, marginBottom: 40 }}>
        <StatCard
          title="Total Rewards Earned"
          value={data.summary.totalEarnedDisplay}
          change="Lifetime accumulated yield"
          icon={<Coins size={18} style={{ color: 'var(--fk-gain)' }} />}
          iconBg="var(--fk-gain-tint)"
        />
        <StatCard
          title="Pending Claims"
          value={formatMoney(pendingTotal)}
          change={`${claims.length} ${claims.length === 1 ? 'reward' : 'rewards'} ready to claim`}
          icon={<HandCoins size={18} style={{ color: 'var(--fk-blue-bright)' }} />}
          iconBg="var(--fk-blue-tint)"
        />
        <StatCard
          title="Total Claimed"
          value={formatMoney(data.summary.totalClaimed + settledTotal)}
          change="Already settled to your wallet"
          icon={<CheckCircle size={18} style={{ color: 'var(--fk-info)' }} />}
          iconBg="var(--fk-info-tint)"
        />
      </div>

      {/* Claim outcome */}
      {claimError && (
        <div className="fk-fbanner fk-fb-loss" style={{ marginBottom: 24 }}>
          <AlertTriangle size={16} style={{ marginTop: 2, flexShrink: 0 }} aria-hidden="true" />
          <div style={{ flex: 1 }}>
            <p className="fk-ft">Claim could not be submitted</p>
            <p className="fk-fd">{claimError}</p>
          </div>
          <button className="fk-btn fk-btn-secondary" onClick={() => setClaimError(null)}>Dismiss</button>
        </div>
      )}

      {results && results.length > 0 && (
        <div role="status" style={{ display: 'grid', gap: 10, marginBottom: 24 }}>
          {results.map(r => {
            const claim = allClaims.find(c => c.id === r.id)
            const label = claim ? `${claim.symbol} · ${claim.type}` : r.id.toUpperCase()
            if (r.status === 'success') {
              return (
                <div key={r.id} className="fk-fbanner fk-fb-gain">
                  <CheckCircle size={16} style={{ marginTop: 2, flexShrink: 0 }} aria-hidden="true" />
                  <div style={{ minWidth: 0 }}>
                    <p className="fk-ft">Claimed {r.amountDisplay} — {label}</p>
                    <p className="fk-fd">
                      Settled to your wallet.{' '}
                      {r.txHash && (
                        <a
                          href={`${BLOCK_EXPLORER}${r.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="fk-mono"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--fk-blue-bright)' }}
                          aria-label={`View claim transaction for ${label} on the block explorer`}
                        >
                          View transaction <ExternalLink size={10} aria-hidden="true" />
                        </a>
                      )}
                    </p>
                  </div>
                </div>
              )
            }
            if (r.status === 'rejected') {
              return (
                <div key={r.id} className="fk-fbanner fk-fb-warn">
                  <AlertTriangle size={16} style={{ marginTop: 2, flexShrink: 0 }} aria-hidden="true" />
                  <div style={{ minWidth: 0 }}>
                    <p className="fk-ft">Not claimed — {label}</p>
                    <p className="fk-fd">
                      {r.reason ?? 'This reward was rejected.'} Rewards must reach{' '}
                      {formatMoney(config.minClaimUsd)} before they can be claimed; keep accruing and try again later.
                    </p>
                  </div>
                </div>
              )
            }
            return (
              <div key={r.id} className="fk-fbanner fk-fb-loss">
                <AlertTriangle size={16} style={{ marginTop: 2, flexShrink: 0 }} aria-hidden="true" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="fk-ft">Claim failed — {label}</p>
                  <p className="fk-fd">{r.reason ?? 'The transaction did not go through.'}</p>
                </div>
                <button
                  className="fk-btn fk-btn-secondary"
                  onClick={() => submitClaim([r.id])}
                  disabled={busy}
                  style={{ flexShrink: 0, alignSelf: 'center' }}
                >
                  <RefreshCw size={13} aria-hidden="true" /> Retry
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Pending claims */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
        <h2 style={{ fontSize: 'var(--fs-h3)', fontWeight: 600, color: 'var(--fk-text-hi)' }}>Pending Claims</h2>
        {claimable.length > 0 && (
          <button
            className="fk-btn fk-btn-primary"
            onClick={() => setConfirmIds(claimable.map(c => c.id))}
            disabled={busy || !kycApproved}
            title={kycApproved ? undefined : 'Complete KYC verification to claim rewards'}
          >
            {busy && claimingIds.length > 1
              ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} aria-hidden="true" /> Claiming…</>
              : `Claim all (${claimable.length})`}
          </button>
        )}
      </div>

      <div className="fk-card" style={{ overflow: 'hidden', marginBottom: 48 }}>
        {claims.length === 0 ? (
          <EmptyState
            compact
            icon={<HandCoins size={20} />}
            title="No rewards waiting to be claimed"
            body="Yield from your holdings appears here as it accrues. Most assets distribute automatically."
          />
        ) : (
          <div className="fk-table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
              <thead>
                <tr>
                  <th scope="col" className="fk-mono" style={{ ...th, textAlign: 'left' }}>Asset</th>
                  <th scope="col" className="fk-mono" style={{ ...th, textAlign: 'left' }}>Type</th>
                  <th scope="col" className="fk-mono" style={{ ...th, textAlign: 'right' }}>Amount</th>
                  <th scope="col" className="fk-mono" style={{ ...th, textAlign: 'left' }}>Available</th>
                  <th scope="col" className="fk-mono" style={{ ...th, textAlign: 'left' }}>Claim Before</th>
                  <th scope="col" className="fk-mono" style={{ ...th, textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {claims.map(claim => {
                  const blocked = isBlocked(claim)
                  const reason = blockedReason(claim)
                  const rowClaiming = claimingIds.includes(claim.id)
                  return (
                    <tr key={claim.id}>
                      <td style={{ ...cell, maxWidth: 240 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                          <TokenLogo logo={claim.logo} symbol={claim.symbol} size={32} isGain={null} />
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontWeight: 600, color: 'var(--fk-text-hi)' }}>{claim.symbol}</p>
                            <p className="fk-truncate" style={{ fontSize: 'var(--fs-xs)', color: 'var(--fk-text-mid)', maxWidth: 180 }} title={claim.name}>
                              {claim.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td style={{ ...cell, color: 'var(--fk-text-hi)' }}>{claim.type}</td>
                      <td className="fk-mono" style={{ ...cell, textAlign: 'right', fontWeight: 700, color: 'var(--fk-gain)', whiteSpace: 'nowrap' }}>
                        {claim.amountDisplay}
                        <span style={{ display: 'block', fontSize: 'var(--fs-2xs)', color: 'var(--fk-text-mid)', fontWeight: 400 }}>
                          {claim.currency}
                        </span>
                      </td>
                      <td className="fk-mono" style={{ ...cell, color: 'var(--fk-text-mid)', fontSize: 'var(--fs-xs)', whiteSpace: 'nowrap' }}>
                        {formatRelativeTime(claim.availableSince)}
                      </td>
                      <td className="fk-mono" style={{ ...cell, fontSize: 'var(--fs-xs)', whiteSpace: 'nowrap' }}>
                        {claim.expiringSoon ? (
                          <span className="fk-badge fk-badge-warn">
                            <Clock size={10} aria-hidden="true" />
                            Expires {formatRelativeTime(claim.claimableUntil)}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--fk-text-mid)' }}>{formatRelativeTime(claim.claimableUntil)}</span>
                        )}
                      </td>
                      <td style={{ ...cell, textAlign: 'right', minWidth: 170 }}>
                        <button
                          className="fk-btn fk-btn-secondary"
                          onClick={() => setConfirmIds([claim.id])}
                          disabled={blocked || busy || !kycApproved}
                          aria-label={`Claim ${claim.amountDisplay} of ${claim.type} from ${claim.symbol}`}
                          title={kycApproved ? undefined : 'Complete KYC verification to claim rewards'}
                        >
                          {rowClaiming
                            ? <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} aria-hidden="true" /> Claiming…</>
                            : 'Claim'}
                        </button>
                        {reason && (
                          <p style={{ fontSize: 'var(--fs-2xs)', color: 'var(--fk-warn)', marginTop: 6, textAlign: 'right', lineHeight: 1.4 }}>
                            {reason}
                          </p>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* History */}
      <h2 style={{ fontSize: 'var(--fs-h3)', fontWeight: 600, color: 'var(--fk-text-hi)', marginBottom: 16 }}>Reward History</h2>

      <div className="fk-card" style={{ overflow: 'hidden' }}>
        {history.length === 0 ? (
          <EmptyState
            icon={<Coins size={20} />}
            title="No reward payouts yet"
            body="Every distribution and claim will be listed here, with its on-chain receipt."
            action={{ label: 'Explore yield-bearing assets', href: '/investor/dashboard' }}
          />
        ) : (
          <div className="fk-table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
              <thead>
                <tr>
                  <th scope="col" className="fk-mono" style={{ ...th, textAlign: 'left' }}>Asset</th>
                  <th scope="col" className="fk-mono" style={{ ...th, textAlign: 'left' }}>Type</th>
                  <th scope="col" className="fk-mono" style={{ ...th, textAlign: 'right' }}>Amount</th>
                  <th scope="col" className="fk-mono" style={{ ...th, textAlign: 'left' }}>Status</th>
                  <th scope="col" className="fk-mono" style={{ ...th, textAlign: 'left' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map(tx => {
                  const st = historyStatus(tx.status)
                  const isFailed = tx.status === 'failed'
                  return (
                    <tr key={tx.id}>
                      <td style={cell}>
                        <div style={{ fontWeight: 600, color: 'var(--fk-text-hi)' }}>{tx.symbol}</div>
                        <div className="fk-mono" style={{ fontSize: 'var(--fs-2xs)', color: 'var(--fk-text-mid)' }}>{tx.id.toUpperCase()}</div>
                      </td>
                      <td style={{ ...cell, color: 'var(--fk-text-hi)' }}>{tx.type}</td>
                      <td
                        className="fk-mono"
                        style={{
                          ...cell, textAlign: 'right', fontWeight: 600, whiteSpace: 'nowrap',
                          color: isFailed ? 'var(--fk-text-mid)' : 'var(--fk-gain)',
                          textDecoration: isFailed ? 'line-through' : undefined,
                        }}
                      >
                        {tx.amountDisplay}
                      </td>
                      <td style={{ ...cell, minWidth: 180 }}>
                        <span className={`fk-badge ${st.badge}`}>
                          <span className="fk-dot" aria-hidden="true" />
                          {st.label}
                        </span>
                        {tx.failureReason && (
                          <p className="fk-clamp-2" style={{ fontSize: 'var(--fs-2xs)', color: 'var(--fk-loss)', marginTop: 6, lineHeight: 1.4 }} title={tx.failureReason}>
                            {tx.failureReason}
                          </p>
                        )}
                        {tx.txHash && (
                          <a
                            href={`${BLOCK_EXPLORER}${tx.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="fk-mono"
                            aria-label={`View the ${tx.symbol} reward transaction on the block explorer`}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 6,
                              fontSize: 'var(--fs-2xs)', color: 'var(--fk-blue-bright)',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.textDecoration = 'underline' }}
                            onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none' }}
                          >
                            Receipt <ExternalLink size={10} aria-hidden="true" />
                          </a>
                        )}
                      </td>
                      <td className="fk-mono" style={{ ...cell, color: 'var(--fk-text-mid)', fontSize: 'var(--fs-xs)', whiteSpace: 'nowrap' }}>
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

      {/* Confirm */}
      <Modal
        open={confirmClaims.length > 0}
        onClose={() => setConfirmIds(null)}
        title={confirmClaims.length > 1 ? `Claim ${confirmClaims.length} rewards` : 'Claim reward'}
        busy={busy}
        width={440}
        footer={
          <>
            <button
              className="fk-btn fk-btn-primary"
              style={{ justifyContent: 'center', padding: 12 }}
              onClick={() => submitClaim(confirmClaims.map(c => c.id))}
              disabled={busy}
            >
              {busy
                ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} aria-hidden="true" /> Submitting…</>
                : 'Confirm claim'}
            </button>
            <button
              className="fk-btn fk-btn-secondary"
              style={{ justifyContent: 'center', padding: 12 }}
              onClick={() => setConfirmIds(null)}
              disabled={busy}
            >
              Cancel
            </button>
          </>
        }
      >
        <div style={{ display: 'grid', gap: 12 }}>
          {confirmClaims.map(c => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <TokenLogo logo={c.logo} symbol={c.symbol} size={28} isGain={null} />
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--fk-text-hi)' }}>{c.symbol}</p>
                <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--fk-text-mid)' }}>{c.type}</p>
              </div>
              <span className="fk-mono" style={{ marginLeft: 'auto', fontWeight: 700, color: 'var(--fk-gain)' }}>
                {c.amountDisplay}
              </span>
            </div>
          ))}

          <div style={{ borderTop: '1px solid var(--fk-line-soft)', paddingTop: 12, display: 'grid', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-sm)' }}>
              <span style={{ color: 'var(--fk-text-mid)' }}>Total reward</span>
              <span className="fk-mono" style={{ color: 'var(--fk-text-hi)', fontWeight: 600 }}>{formatMoney(confirmTotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-sm)' }}>
              <span style={{ color: 'var(--fk-text-mid)' }}>Estimated gas</span>
              <span className="fk-mono" style={{ color: 'var(--fk-text-hi)', fontWeight: 600 }}>-{formatMoney(config.gasEstimateUsd)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-body)' }}>
              <span style={{ color: 'var(--fk-text-hi)', fontWeight: 600 }}>You receive</span>
              <span className="fk-mono" style={{ color: 'var(--fk-gain)', fontWeight: 700 }}>
                {formatMoney(Math.max(0, confirmTotal - config.gasEstimateUsd))}
              </span>
            </div>
          </div>

          <p className="fk-hint">
            Minimum claim is {formatMoney(config.minClaimUsd)} per reward. Gas is a single fee for the
            whole batch, so claiming several rewards at once costs less.
          </p>
        </div>
      </Modal>
    </div>
  )
}
