import React from 'react'

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  icon: React.ReactNode
  iconBg?: string
}

export default function StatCard({ title, value, change = '0% from last month', icon, iconBg = 'rgba(34,197,94,0.15)' }: StatCardProps) {
  return (
    <div
      className="relative flex flex-col gap-3"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '24px',
      }}
    >
      {/* Icon - top right */}
      <div
        className="absolute flex items-center justify-center rounded-full"
        style={{
          top: '16px',
          right: '16px',
          width: '48px',
          height: '48px',
          backgroundColor: iconBg,
        }}
      >
        {icon}
      </div>

      {/* Label */}
      <p style={{ fontSize: '14px', color: '#94a3b8' }}>{title}</p>

      {/* Value */}
      <p style={{ fontSize: '30px', fontWeight: 700, color: '#ffffff', lineHeight: 1 }}>{value}</p>

      {/* Change */}
      <p style={{ fontSize: '12px', color: '#94a3b8' }}>{change}</p>
    </div>
  )
}
