'use client'
import { useState, useRef, useEffect } from 'react'
import { Search } from 'lucide-react'

export interface TokenOption {
  id: string
  name: string
  ticker: string
  initials: string
  contractAddress: string
}

interface ContractSearchBarProps {
  options: TokenOption[]
  onSelect: (token: TokenOption) => void
}

export default function ContractSearchBar({ options, onSelect }: ContractSearchBarProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const filtered = options.filter(
    (o) =>
      o.name.toLowerCase().includes(query.toLowerCase()) ||
      o.ticker.toLowerCase().includes(query.toLowerCase())
  )

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative" style={{ maxWidth: '512px' }}>
      <div className="relative">
        <Search
          size={14}
          className="absolute"
          style={{ left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--fk-text-low)' }}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder="Search token by name or ticker"
          className="fk-input w-full"
          style={{ paddingLeft: '36px' }}
        />
      </div>

      {open && filtered.length > 0 && (
        <div
          className="absolute left-0 right-0 mt-1 rounded-lg z-50 overflow-hidden"
          style={{
            backgroundColor: 'var(--fk-surface-3)',
            border: '1px solid var(--glass-border)',
            boxShadow: 'var(--el-3)',
          }}
        >
          {filtered.map((token) => (
            <button
              key={token.id}
              onClick={() => { onSelect(token); setQuery(token.name); setOpen(false) }}
              className="w-full flex items-center gap-3 px-4 py-3 transition-colors"
              style={{ backgroundColor: 'transparent' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--fk-surface-2)' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                style={{ backgroundColor: 'var(--fk-surface-2)', color: 'var(--fk-text-hi)' }}
              >
                {token.initials}
              </div>
              <div className="text-left min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--fk-text-hi)' }}>
                  {token.name}/<span style={{ color: 'var(--fk-text-mid)' }}>{token.ticker}</span>
                </p>
                <p className="fk-mono text-xs truncate" style={{ color: 'var(--fk-text-low)' }}>{token.contractAddress}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
