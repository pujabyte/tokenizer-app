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
        backgroundColor: '#1a1d29',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '16px',
        gap: '12px',
      }}
    >
      {/* Toggle — top right */}
      <div className="absolute" style={{ top: '16px', right: '16px' }}>
        <button
          onClick={() => setEnabled(!enabled)}
          className={clsx(
            'relative inline-flex shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none',
          )}
          style={{
            width: '36px',
            height: '20px',
            backgroundColor: enabled ? '#f8fafc' : 'var(--border-color)',
          }}
        >
          <span
            className={clsx(
              'absolute rounded-full bg-white shadow transition-transform duration-200',
            )}
            style={{
              width: '14px',
              height: '14px',
              top: '3px',
              left: enabled ? '19px' : '3px',
              backgroundColor: enabled ? 'var(--border-color)' : '#6b7280',
            }}
          />
        </button>
      </div>

      {/* Icon */}
      <div
        className="flex items-center justify-center"
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '8px',
          backgroundColor: iconBg,
        }}
      >
        {icon}
      </div>

      {/* Content */}
      <div>
        <p style={{ fontSize: '16px', fontWeight: 500, color: '#f8fafc' }}>{title}</p>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.5' }}>
          {description}
        </p>
      </div>
    </div>
  )
}
