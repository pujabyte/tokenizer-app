import { Shield } from 'lucide-react'
import React from 'react'

interface ComingSoonProps {
  icon?: React.ReactNode
  title?: string
  description?: string
}

export default function ComingSoon({
  icon = <Shield size={24} style={{ color: 'var(--fk-text-mid)' }} />,
  title = 'Coming Soon',
  description = 'This page is under development.',
}: ComingSoonProps) {
  return (
    <div
      className="fk-card flex flex-col items-center justify-center text-center"
      style={{ padding: '48px' }}
    >
      <div
        className="flex items-center justify-center rounded-full"
        style={{
          width: '64px',
          height: '64px',
          backgroundColor: 'var(--fk-surface-2)',
          marginBottom: '16px',
        }}
      >
        {icon}
      </div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 600, color: 'var(--fk-text-hi)', marginBottom: '8px' }}>{title}</h3>
      <p style={{ fontSize: '15px', color: 'var(--fk-text-mid)', maxWidth: '448px' }}>{description}</p>
    </div>
  )
}
