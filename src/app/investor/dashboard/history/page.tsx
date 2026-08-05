'use client'
import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Download, ExternalLink, Receipt } from 'lucide-react'
import { useFetch } from '@/lib/useFetch'
import { EmptyState, ErrorState, LoadingAnnouncer, Skeleton, SkeletonTable } from '@/components/ui/states'
import {
  EXECUTION_MODE_LABELS, TX_STATUS_BADGE, TX_STATUS_LABELS,
  type ExecutionMode, type TxStatus,
} from '@/lib/constants'
import { formatDateTime } from '@/lib/format'

type Transaction = {
  id: string
  tokenId: string
  symbol: string
  name: string
  type: string
  amount: string
  price: string
  total: string
  status: string
  executionMode: string
  timestamp: string
  txHash: string | null
  txHashShort: string | null
  explorerUrl: string | null
  failureReason?: string
}

type HistoryResponse = {
  transactions: Transaction[]
  executionModes: string[]
  statuses: string[]
  pagination: { page: number; pageSize: number; total: number; totalPages: number }
}

const PAGE_SIZE = 20
const HEADERS = ['Time', 'Asset', 'Type', 'Price', 'Amount', 'Total', 'Execution Mode', 'Status'] as const

const modeLabel = (mode: string) =>
  mode === 'All' ? 'All modes' : (EXECUTION_MODE_LABELS[mode as ExecutionMode] ?? mode)
const statusLabel = (status: string) =>
  status === 'All' ? 'All statuses' : (TX_STATUS_LABELS[status as TxStatus] ?? status)
const statusBadge = (status: string) =>
  `fk-badge ${TX_STATUS_BADGE[status as TxStatus] ?? 'fk-badge-neutral'}`

const cell: React.CSSProperties = { padding: '16px', borderBottom: '1px solid var(--fk-line-soft)' }

function FilterPill({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        padding: '6px 12px', borderRadius: 'var(--r-pill)', whiteSpace: 'nowrap',
        border: `1px solid ${active ? 'var(--fk-blue)' : 'var(--fk-line)'}`,
        background: active ? 'var(--fk-blue-tint)' : 'transparent',
        color: active ? 'var(--fk-blue-bright)' : 'var(--fk-text-mid)',
        fontSize: 'var(--fs-sm)', fontWeight: active ? 600 : 500,
        cursor: 'pointer', transition: 'all .15s',
      }}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--fk-surface-hover)'; e.currentTarget.style.color = 'var(--fk-text-hi)' } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--fk-text-mid)' } }}
    >
      {label}
    </button>
  )
}

export default function TransactionHistoryPage() {
  const [mode, setMode] = useState('All')
  const [status, setStatus] = useState('All')
  const [page, setPage] = useState(1)

  // Filtering and paging happen server-side; the old client-side filter compared
  // against a hardcoded mode list that matched none of the API's values.
  const url = `/api/investor/history?page=${page}&pageSize=${PAGE_SIZE}&mode=${encodeURIComponent(mode)}&status=${encodeURIComponent(status)}`
  const { data, loading, refreshing, error, offline, refetch } = useFetch<HistoryResponse>(url)

  const transactions = useMemo(() => data?.transactions ?? [], [data])
  const pagination = data?.pagination
  const modes = data?.executionModes ?? ['All']
  const statuses = data?.statuses ?? ['All']
  const filtered = mode !== 'All' || status !== 'All'

  const setModeAndReset = (next: string) => { setMode(next); setPage(1) }
  const setStatusAndReset = (next: string) => { setStatus(next); setPage(1) }
  const clearFilters = () => { setMode('All'); setStatus('All'); setPage(1) }

  const exportCsv = () => {
    const rows = [
      ['Time', 'Asset', 'Name', 'Type', 'Price', 'Amount', 'Total', 'Execution Mode', 'Status', 'Tx Hash'],
      ...transactions.map(tx => [
        tx.timestamp, tx.symbol, tx.name, tx.type, tx.price, tx.amount, tx.total,
        modeLabel(tx.executionMode), statusLabel(tx.status), tx.txHash ?? '',
      ]),
    ]
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `frakta-transactions-page-${page}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const header = (
    <h1 className="iv-page-title" style={{ fontSize: 'var(--fs-h1)', fontWeight: 700, color: 'var(--fk-text-hi)', marginBottom: 24 }}>
      Transaction History
    </h1>
  )

  if (loading) {
    return (
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        {header}
        <LoadingAnnouncer label="Loading transaction history" />
        <div className="iv-filter-row" style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} w={96} h={30} r={999} />)}
        </div>
        <div className="fk-card" style={{ padding: 20 }}>
          <SkeletonTable rows={6} cols={6} />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        {header}
        <div className="fk-card">
          <ErrorState
            title="Could not load your transaction history"
            body={error}
            offline={offline}
            onRetry={refetch}
          />
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {header}

      <div className="iv-toolbar" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 20 }}>
        <div style={{ display: 'grid', gap: 10, minWidth: 0 }}>
          <div className="iv-filter-row" role="group" aria-label="Filter by execution mode" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {modes.map(m => (
              <FilterPill key={m} active={mode === m} label={modeLabel(m)} onClick={() => setModeAndReset(m)} />
            ))}
          </div>
          <div className="iv-filter-row" role="group" aria-label="Filter by status" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {statuses.map(s => (
              <FilterPill key={s} active={status === s} label={statusLabel(s)} onClick={() => setStatusAndReset(s)} />
            ))}
          </div>
        </div>

        <button
          type="button"
          className="fk-btn fk-btn-secondary"
          onClick={exportCsv}
          disabled={transactions.length === 0}
          aria-label="Export the transactions on this page as CSV"
          style={{ flexShrink: 0 }}
        >
          <Download size={13} aria-hidden="true" /> Export CSV
        </button>
      </div>

      <div className="fk-card" style={{ overflow: 'hidden', opacity: refreshing ? 0.6 : 1, transition: 'opacity .15s' }}>
        {transactions.length === 0 ? (
          filtered ? (
            <EmptyState
              compact
              icon={<Receipt size={20} />}
              title="No transactions match these filters"
              body="Try a different execution mode or status, or clear the filters to see everything."
              action={{ label: 'Clear filters', onClick: clearFilters }}
            />
          ) : (
            <EmptyState
              icon={<Receipt size={20} />}
              title="No transactions yet"
              body="Once you buy or sell a tokenized asset, every settlement shows up here with its on-chain proof."
              action={{ label: 'Explore markets', href: '/investor/dashboard' }}
            />
          )
        ) : (
          <div className="fk-table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
              <caption className="fk-sr-only">
                Transaction history, page {pagination?.page ?? 1} of {pagination?.totalPages ?? 1}
              </caption>
              <thead>
                <tr>
                  {HEADERS.map((h, i) => (
                    <th
                      key={h}
                      scope="col"
                      className="fk-mono"
                      style={{
                        textAlign: (i >= 3 && i <= 5) ? 'right' : 'left',
                        fontSize: 'var(--fs-2xs)', letterSpacing: '.08em', textTransform: 'uppercase',
                        color: 'var(--fk-text-mid)', padding: '16px', whiteSpace: 'nowrap',
                        borderBottom: '1px solid var(--fk-line)',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.id}>
                    <td className="fk-mono" style={{ ...cell, color: 'var(--fk-text-mid)', fontSize: 'var(--fs-xs)', whiteSpace: 'nowrap' }}>
                      {formatDateTime(tx.timestamp)}
                    </td>
                    <td style={{ ...cell, maxWidth: 180 }}>
                      <div style={{ fontWeight: 600, color: 'var(--fk-text-hi)' }}>{tx.symbol}</div>
                      <div className="fk-truncate" style={{ fontSize: 'var(--fs-xs)', color: 'var(--fk-text-mid)', maxWidth: 160 }} title={tx.name}>
                        {tx.name}
                      </div>
                    </td>
                    <td style={cell}>
                      <span style={{ color: tx.type === 'BUY' ? 'var(--fk-gain)' : 'var(--fk-loss)', fontWeight: 700, fontSize: 'var(--fs-xs)' }}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="fk-mono" style={{ ...cell, textAlign: 'right', color: 'var(--fk-text-hi)' }}>{tx.price}</td>
                    <td className="fk-mono" style={{ ...cell, textAlign: 'right', color: 'var(--fk-text-hi)' }}>{tx.amount}</td>
                    <td className="fk-mono" style={{ ...cell, textAlign: 'right', fontWeight: 600, color: 'var(--fk-text-hi)' }}>{tx.total}</td>
                    <td className="fk-mono" style={{ ...cell, color: 'var(--fk-text-mid)', fontSize: 'var(--fs-2xs)', whiteSpace: 'nowrap' }}>
                      <span style={{ padding: '4px 8px', background: 'var(--fk-surface-1)', borderRadius: 'var(--r-sm)' }}>
                        {modeLabel(tx.executionMode)}
                      </span>
                    </td>
                    <td style={{ ...cell, minWidth: 190 }}>
                      <span className={statusBadge(tx.status)}>
                        <span className="fk-dot" aria-hidden="true" />
                        {statusLabel(tx.status)}
                      </span>
                      {tx.failureReason && (
                        <p className="fk-clamp-2" style={{ fontSize: 'var(--fs-2xs)', color: 'var(--fk-loss)', marginTop: 6, lineHeight: 1.4 }} title={tx.failureReason}>
                          {tx.failureReason}
                        </p>
                      )}
                      {tx.txHashShort && (
                        tx.explorerUrl ? (
                          <a
                            href={tx.explorerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="fk-mono"
                            aria-label={`View transaction ${tx.txHashShort} on the block explorer`}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 6,
                              fontSize: 'var(--fs-2xs)', color: 'var(--fk-blue-bright)',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.textDecoration = 'underline' }}
                            onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none' }}
                          >
                            {tx.txHashShort}
                            <ExternalLink size={10} aria-hidden="true" />
                          </a>
                        ) : (
                          <div className="fk-mono" style={{ fontSize: 'var(--fs-2xs)', color: 'var(--fk-text-low)', marginTop: 6 }}>
                            {tx.txHashShort}
                          </div>
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagination && pagination.total > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
          <p className="fk-mono" style={{ fontSize: 'var(--fs-xs)', color: 'var(--fk-text-mid)' }} aria-live="polite">
            Showing {(pagination.page - 1) * pagination.pageSize + 1}
            –{Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              className="fk-btn fk-btn-secondary"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={pagination.page <= 1 || refreshing}
              aria-label="Previous page"
            >
              <ChevronLeft size={13} aria-hidden="true" /> Previous
            </button>
            <span className="fk-mono" style={{ fontSize: 'var(--fs-xs)', color: 'var(--fk-text-mid)', padding: '0 4px' }}>
              {pagination.page} / {pagination.totalPages}
            </span>
            <button
              type="button"
              className="fk-btn fk-btn-secondary"
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={pagination.page >= pagination.totalPages || refreshing}
              aria-label="Next page"
            >
              Next <ChevronRight size={13} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {transactions.length === 0 && !filtered && (
        <p style={{ marginTop: 16, textAlign: 'center', fontSize: 'var(--fs-sm)', color: 'var(--fk-text-mid)' }}>
          Looking for your rewards instead? See the{' '}
          <Link href="/investor/dashboard/rewards" style={{ color: 'var(--fk-blue-bright)' }}>Rewards Hub</Link>.
        </p>
      )}
    </div>
  )
}
