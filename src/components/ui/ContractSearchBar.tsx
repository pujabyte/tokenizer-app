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
    <div ref={ref} className="relative">
      <div className="flex items-center" style={{ gap: '8px' }}>
        {/* Input with absolute search icon */}
        <div className="relative flex-1">
          <Search
            size={14}
            className="text-gray-500 absolute"
            style={{ left: '10px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
            placeholder="Input Token"
            className="w-full text-sm text-white placeholder-gray-600 focus:outline-none"
            style={{
              height: '36px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: 'rgba(30, 41, 59, 0.5)',
              paddingLeft: '36px',
              paddingRight: '12px',
            }}
          />
        </div>
        <button
          className="flex-shrink-0 text-sm font-medium text-white"
          style={{
            backgroundColor: '#4f46e5',
            borderRadius: '6px',
            padding: '8px 16px',
            height: '40px',
          }}
          onClick={() => setOpen(true)}
        >
          Search
        </button>
      </div>

      {open && filtered.length > 0 && (
        <div
          className="absolute left-0 right-0 mt-1 rounded-lg z-50 overflow-hidden"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          {filtered.map((token) => (
            <button
              key={token.id}
              onClick={() => { onSelect(token); setQuery(token.name); setOpen(false) }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.05] transition-colors"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                style={{ backgroundColor: '#374151' }}
              >
                {token.initials}
              </div>
              <div className="text-left">
                <p className="text-sm text-white font-medium">
                  {token.name}/<span style={{ color: 'var(--text-muted)' }}>{token.ticker}</span>
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{token.contractAddress}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
