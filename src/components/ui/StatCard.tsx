import React from 'react'

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  icon: React.ReactNode
  iconBg?: string
}

export default function StatCard({
  title,
  value,
  change = '0% from last month',
  icon,
  iconBg = 'var(--fk-soft-tint)',
}: StatCardProps) {
  return (
    <div className="fk-hero-a" style={{ padding: '16px' }}>
      <div className="flex items-start justify-between" style={{ position: 'relative', zIndex: 1 }}>
        {/* Text left */}
        <div className="space-y-1.5">
          <p
            className="fk-mono"
            style={{ fontSize: '11px', fontWeight: 400, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--fk-blue-bright)' }}
          >
            {title}
          </p>
          <p className="fk-mono" style={{ fontSize: '22px', fontWeight: 700, color: 'var(--fk-text-hi)', lineHeight: '26px' }}>{value}</p>
          <p className="fk-mono" style={{ fontSize: '11px', color: 'var(--fk-text-mid)' }}>{change}</p>
        </div>

        {/* Icon right — single glass tile, lucide-react icon (same icon framework used app-wide) */}
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--r-sm)',
            backgroundColor: iconBg,
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,.12), 0 1px 2px rgba(0,0,0,.3)',
          }}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}
