import { Shield } from 'lucide-react'
import React from 'react'

interface ComingSoonProps {
  icon?: React.ReactNode
  title?: string
  description?: string
}

export default function ComingSoon({
  icon = <Shield size={24} className="text-slate-400" />,
  title = 'Coming Soon',
  description = 'This page is under development.',
}: ComingSoonProps) {
  return (
    <div
      className="rounded-xl flex flex-col items-center justify-center text-center"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        padding: '48px',
      }}
    >
      <div
        className="flex items-center justify-center rounded-full"
        style={{
          width: '64px',
          height: '64px',
          backgroundColor: '#1e293b',
          marginBottom: '16px',
        }}
      >
        {icon}
      </div>
      <h3 style={{ fontSize: '24px', fontWeight: 600, color: '#f8fafc', marginBottom: '8px' }}>{title}</h3>
      <p style={{ fontSize: '16px', color: '#94a3b8', maxWidth: '448px' }}>{description}</p>
    </div>
  )
}
