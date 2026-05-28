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
    <div
      className={`rounded-xl p-6 flex flex-col gap-4 ${className}`}
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
      }}
    >
      <div>
        <h3 className="text-white font-semibold text-sm">{title}</h3>
        <div className="mt-3" style={{ borderBottom: '1px solid var(--border-color)' }} />
      </div>

      <div className="flex flex-col gap-4">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{row.label}</span>
            <div className="text-sm text-white font-medium">{row.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
