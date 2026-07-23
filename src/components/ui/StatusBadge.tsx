import { Globe, CheckCircle2, Rocket, FileCheck, Clock, Check, Activity } from 'lucide-react'
import React from 'react'

type StatusType = 'live' | 'submitted' | 'document_approved' | 'deployed' | 'approved' | 'pending' | 'operational'

interface StatusConfig {
  label: string
  icon: React.ReactNode
  color: string
  borderColor: string
  glow: string
}

const statusConfig: Record<StatusType, StatusConfig> = {
  live: {
    label: 'Live',
    icon: <Globe size={12} strokeWidth={2} />,
    color: 'var(--fk-gain)',
    borderColor: 'rgba(37,212,138,.22)',
    glow: 'rgba(37,212,138,.07)',
  },
  submitted: {
    label: 'Submitted',
    icon: <CheckCircle2 size={12} strokeWidth={2} />,
    color: 'var(--fk-gain)',
    borderColor: 'rgba(37,212,138,.22)',
    glow: 'rgba(37,212,138,.07)',
  },
  document_approved: {
    label: 'Document Approved',
    icon: <FileCheck size={12} strokeWidth={2} />,
    color: 'var(--fk-info)',
    borderColor: 'rgba(92,200,255,.22)',
    glow: 'rgba(92,200,255,.07)',
  },
  deployed: {
    label: 'Deployed',
    icon: <Rocket size={12} strokeWidth={2} />,
    color: 'var(--fk-gain)',
    borderColor: 'rgba(37,212,138,.22)',
    glow: 'rgba(37,212,138,.07)',
  },
  approved: {
    label: 'Approved',
    icon: <Check size={12} strokeWidth={2.5} />,
    color: 'var(--fk-gain)',
    borderColor: 'rgba(37,212,138,.22)',
    glow: 'rgba(37,212,138,.07)',
  },
  pending: {
    label: 'Pending',
    icon: <Clock size={12} strokeWidth={2} />,
    color: 'var(--fk-warn)',
    borderColor: 'rgba(255,194,77,.22)',
    glow: 'rgba(255,194,77,.07)',
  },
  operational: {
    label: 'Operational',
    icon: <Activity size={12} strokeWidth={2} />,
    color: 'var(--fk-gain)',
    borderColor: 'rgba(37,212,138,.22)',
    glow: 'rgba(37,212,138,.07)',
  },
}

interface StatusBadgeProps {
  status: StatusType
  size?: 'sm' | 'md'
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const c = statusConfig[status]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: size === 'sm' ? '3px 9px' : '5px 12px',
        borderRadius: 'var(--r-pill)',
        backgroundColor: c.glow,
        border: `1px solid ${c.borderColor}`,
        color: c.color,
        fontSize: size === 'sm' ? 11 : 12,
        fontWeight: 600,
        letterSpacing: '.01em',
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}
    >
      {c.icon}
      {c.label}
    </span>
  )
}
