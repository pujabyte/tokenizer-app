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
  const hasPrev = false
  const hasNext = false

  const inner = (
    <>
      {/* Table Header */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: COLS,
          padding: '10px 16px',
          gap: '8px',
          fontFamily: 'var(--font-mono)',
          fontSize: '10.5px',
          fontWeight: 400,
          letterSpacing: '.08em',
          textTransform: 'uppercase',
          color: 'var(--fk-text-low)',
          borderBottom: '1px solid var(--fk-line)',
        }}
      >
        <span>Name</span>
        <span>Ticker</span>
        <span>Chain</span>
        <span>Type</span>
        <span style={{ textAlign: 'right' }}>Initial Supply</span>
        <span>Date Created</span>
        <span>Status</span>
      </div>

      {/* Rows */}
      {tokens.map((token) => (
        <Link
          key={token.id}
          href={`/dashboard/assets/${token.id}`}
          className="grid items-center transition-colors cursor-pointer hover:bg-[var(--fk-surface-2)]"
          style={{
            gridTemplateColumns: COLS,
            gap: '8px',
            padding: '12px 16px',
            borderBottom: '1px solid var(--fk-line-soft)',
          }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: 'var(--fk-surface-3)',
                color: 'var(--fk-text-hi)',
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              {token.initials}
            </div>
            <span className="truncate" style={{ fontSize: '13px', color: 'var(--fk-text-hi)', fontWeight: 600 }}>{token.name}</span>
          </div>
          <span className="fk-mono truncate" style={{ fontSize: '12px', color: 'var(--fk-text-mid)' }}>{token.ticker}</span>
          <span className="truncate" style={{ fontSize: '13px', color: 'var(--fk-text-mid)' }}>{token.chain}</span>
          <span style={{ fontSize: '13px', color: 'var(--fk-text-low)' }}>{token.type || '–'}</span>
          <span className="fk-mono truncate" style={{ fontSize: '12px', color: 'var(--fk-text-hi)', textAlign: 'right' }}>{Number(token.supply).toLocaleString('id-ID')}</span>
          <span className="fk-mono truncate" style={{ fontSize: '11.5px', color: 'var(--fk-text-mid)' }}>{token.dateCreated}</span>
          <div className="flex items-center">
            <StatusBadge status={token.status} size="sm" />
          </div>
        </Link>
      ))}

      {/* Pagination */}
      {showPagination && (
        <div
          className="flex items-center justify-between"
          style={{
            padding: '10px 16px',
            borderTop: '1px solid var(--fk-line)',
            fontSize: '12px',
            color: 'var(--fk-text-low)',
          }}
        >
          <span>
            Showing 1 to {tokens.length} of {totalCount ?? tokens.length} tokens
          </span>
          <div className="flex items-center" style={{ gap: '6px' }}>
            <button
              disabled={!hasPrev}
              className="flex items-center transition-colors"
              style={{
                color: 'var(--fk-text-mid)',
                borderRadius: 'var(--r-sm)',
                padding: '0px 10px',
                height: '30px',
                fontSize: '12px',
                gap: '4px',
                opacity: hasPrev ? 1 : .4,
                cursor: hasPrev ? 'pointer' : 'not-allowed',
              }}
            >
              <ChevronLeft size={14} />
              Previous
            </button>
            <button
              className="fk-mono"
              style={{
                backgroundColor: 'var(--fk-soft-tint)',
                borderRadius: 'var(--r-sm)',
                padding: '0px 10px',
                height: '30px',
                fontSize: '12px',
                color: 'var(--fk-blue-soft)',
                fontWeight: 600,
              }}
            >
              1
            </button>
            <button
              disabled={!hasNext}
              className="flex items-center transition-colors"
              style={{
                color: 'var(--fk-text-mid)',
                borderRadius: 'var(--r-sm)',
                padding: '0px 10px',
                height: '30px',
                fontSize: '12px',
                gap: '4px',
                opacity: hasNext ? 1 : .4,
                cursor: hasNext ? 'pointer' : 'not-allowed',
              }}
            >
              Next
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  )

  if (embedded) return <div>{inner}</div>

  return (
    <div className="fk-card" style={{ overflow: 'hidden' }}>
      {inner}
    </div>
  )
}
