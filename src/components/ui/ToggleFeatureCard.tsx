'use client'
import { useState } from 'react'
import React from 'react'
import clsx from 'clsx'

interface ToggleFeatureCardProps {
  icon: React.ReactNode
  iconBg: string
  title: string
  description: string
  defaultEnabled?: boolean
}

export default function ToggleFeatureCard({ icon, iconBg, title, description, defaultEnabled = false }: ToggleFeatureCardProps) {
  const [enabled, setEnabled] = useState(defaultEnabled)

  return (
    <div
      className="relative flex flex-col"
      style={{
        backgroundColor: 'var(--fk-surface-1)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--r-md)',
        padding: '16px',
        gap: '12px',
      }}
    >
      {/* Toggle — top right */}
      <div className="absolute" style={{ top: '16px', right: '16px' }}>
        <button
          onClick={() => setEnabled(!enabled)}
          className={clsx('fk-toggle', enabled && 'fk-on')}
          role="switch"
          aria-checked={enabled}
          aria-label={title}
        />
      </div>

      {/* Icon */}
      <div
        className="flex items-center justify-center"
        style={{
          width: '40px',
          height: '40px',
          borderRadius: 'var(--r-md)',
          backgroundColor: iconBg,
        }}
      >
        {icon}
      </div>

      {/* Content */}
      <div>
        <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--fk-text-hi)' }}>{title}</p>
        <p style={{ fontSize: '13.5px', color: 'var(--fk-text-mid)', marginTop: '4px', lineHeight: '1.5' }}>
          {description}
        </p>
      </div>
    </div>
  )
}
