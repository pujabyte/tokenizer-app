import React from 'react'
import Image from 'next/image'

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  iconSrc: string
  iconAlt: string
  iconBg?: string
}

export default function StatCard({
  title,
  value,
  change = '0% from last month',
  iconSrc,
  iconAlt,
  iconBg = 'rgba(16,185,129,0.1)',
}: StatCardProps) {
  return (
    <div
      className="rounded-xl border shadow"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        padding: '24px',
      }}
    >
      <div className="flex items-start justify-between">
        {/* Text left */}
        <div className="space-y-3">
          <p style={{ fontSize: '14px', color: '#94a3b8' }}>{title}</p>
          <p style={{ fontSize: '30px', fontWeight: 700, color: '#f8fafc', lineHeight: '36px' }}>{value}</p>
          <p style={{ fontSize: '12px', color: '#94a3b8' }}>{change}</p>
        </div>

        {/* Icon right */}
        <div
          className="rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            width: '48px',
            height: '48px',
            backgroundColor: iconBg,
            padding: '12px',
          }}
        >
          <Image src={iconSrc} alt={iconAlt} width={24} height={24} />
        </div>
      </div>
    </div>
  )
}
