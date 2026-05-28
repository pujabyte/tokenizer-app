import StatusBadge from './StatusBadge'

interface TokenSummaryCardProps {
  initials: string
  name: string
  ticker: string
  type?: string
  network: string
  supply: string
  status: 'live' | 'pending'
}

export default function TokenSummaryCard({ initials, name, ticker, type, network, supply, status }: TokenSummaryCardProps) {
  const fields = [
    { label: 'Name', value: name },
    { label: 'Ticker', value: ticker },
    { label: 'Type', value: type || '–' },
    { label: 'Network', value: network },
    { label: 'Initial Token Supply', value: Number(supply.replace(/,/g, '')).toLocaleString() },
  ]

  return (
    <div
      className="flex items-center gap-6 px-6 py-5 rounded-xl"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
      }}
    >
      {/* Avatar */}
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
        style={{ backgroundColor: '#374151' }}
      >
        {initials}
      </div>

      {/* Fields */}
      <div className="flex items-center gap-8 flex-1 flex-wrap">
        {fields.map((f) => (
          <div key={f.label} className="flex flex-col gap-0.5">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{f.label}</span>
            <span className="text-sm text-white font-medium">{f.value}</span>
          </div>
        ))}
      </div>

      {/* Status */}
      <StatusBadge status={status} />
    </div>
  )
}
