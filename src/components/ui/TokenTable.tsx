import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import StatusBadge from './StatusBadge'

export interface Token {
  id: string
  name: string
  initials: string
  ticker: string
  chain: string
  type: string
  supply: string
  dateCreated: string
  status: 'live' | 'pending'
}

interface TokenTableProps {
  tokens: Token[]
  showPagination?: boolean
  totalCount?: number
  /** When true, skips the outer card border/radius wrapper (used when already inside a card) */
  embedded?: boolean
}

const COLS = '2fr 1fr 2fr 1fr 1.5fr 1.5fr 1fr'

export default function TokenTable({ tokens, showPagination = true, totalCount, embedded = false }: TokenTableProps) {
  const inner = (
    <>
      {/* Table Header */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: COLS,
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: 500,
          color: '#94a3b8',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-card)',
        }}
      >
        <span>Name</span>
        <span>Ticker</span>
        <span>Chain</span>
        <span>Type</span>
        <span>Initial Token Supply</span>
        <span>Date Created</span>
        <span>Status</span>
      </div>

      {/* Rows */}
      {tokens.map((token) => (
        <Link
          key={token.id}
          href={`/dashboard/assets/${token.id}`}
          className="grid items-center hover:bg-white/[0.02] transition-colors cursor-pointer"
          style={{
            gridTemplateColumns: COLS,
            padding: '16px',
            borderBottom: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-card)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#1e293b',
                fontSize: '12px',
              }}
            >
              {token.initials}
            </div>
            <span style={{ fontSize: '16px', color: '#ffffff', fontWeight: 500 }}>{token.name}</span>
          </div>
          <span style={{ fontSize: '16px', color: '#ffffff' }}>{token.ticker}</span>
          <span style={{ fontSize: '16px', color: '#ffffff' }}>{token.chain}</span>
          <span style={{ fontSize: '16px', color: '#94a3b8' }}>{token.type || '-'}</span>
          <span style={{ fontSize: '16px', color: '#ffffff' }}>{Number(token.supply).toLocaleString()}</span>
          <span style={{ fontSize: '16px', color: '#ffffff' }}>{token.dateCreated}</span>
          <StatusBadge status={token.status} size="sm" />
        </Link>
      ))}

      {/* Pagination */}
      {showPagination && (
        <div
          className="flex items-center justify-between"
          style={{
            padding: '12px 16px',
            backgroundColor: 'var(--bg-card)',
            borderTop: '1px solid var(--border-color)',
            fontSize: '14px',
            color: '#64748b',
          }}
        >
          <span>
            Showing 1 to {tokens.length} of {totalCount ?? tokens.length} tokens
          </span>
          <div className="flex items-center" style={{ gap: '8px' }}>
            <button
              className="flex items-center hover:bg-white/[0.05] transition-colors"
              style={{
                color: '#94a3b8',
                borderRadius: '6px',
                padding: '0px 12px',
                height: '36px',
                fontSize: '14px',
                gap: '4px',
              }}
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            <button
              style={{
                backgroundColor: '#1e293b',
                borderRadius: '6px',
                padding: '0px 12px',
                height: '36px',
                fontSize: '14px',
                color: '#f8fafc',
                fontWeight: 500,
              }}
            >
              1
            </button>
            <button
              className="flex items-center hover:bg-white/[0.05] transition-colors"
              style={{
                color: '#94a3b8',
                borderRadius: '6px',
                padding: '0px 12px',
                height: '36px',
                fontSize: '14px',
                gap: '4px',
              }}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  )

  if (embedded) return <div>{inner}</div>

  return (
    <div
      style={{
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      {inner}
    </div>
  )
}
