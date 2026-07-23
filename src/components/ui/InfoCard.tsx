import React from 'react'

interface InfoRow {
  label: string
  value: React.ReactNode
}

interface InfoCardProps {
  title: string
  rows: InfoRow[]
  className?: string
}

export default function InfoCard({ title, rows, className = '' }: InfoCardProps) {
  return (
    <div className={`fk-card p-6 flex flex-col gap-4 ${className}`}>
      <div>
        <h3 className="font-semibold text-sm" style={{ fontFamily: 'var(--font-display)', color: 'var(--fk-text-hi)' }}>{title}</h3>
        <div className="mt-3" style={{ borderBottom: '1px solid var(--fk-line-soft)' }} />
      </div>

      <div className="flex flex-col gap-4">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <span className="text-sm flex-shrink-0" style={{ color: 'var(--fk-text-mid)' }}>{row.label}</span>
            <div className="text-sm font-medium text-right" style={{ color: 'var(--fk-text-hi)' }}>{row.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
