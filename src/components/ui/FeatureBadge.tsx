import { ArrowLeftRight, Users, PauseCircle, Plus, Flame } from 'lucide-react'
import React from 'react'

type FeatureType = 'transferable' | 'public' | 'pausable' | 'mintable' | 'burnable'

interface FeatureConfig {
  label: string
  icon: React.ReactNode
  color: string
  borderColor: string
  glow: string
}

const featureConfig: Record<FeatureType, FeatureConfig> = {
  transferable: {
    label: 'Transferable',
    icon: <ArrowLeftRight size={13} strokeWidth={2} />,
    color: 'var(--fk-info)',
    borderColor: 'rgba(92,200,255,.22)',
    glow: 'rgba(92,200,255,.06)',
  },
  public: {
    label: 'Public',
    icon: <Users size={13} strokeWidth={2} />,
    color: 'var(--fk-gain)',
    borderColor: 'rgba(37,212,138,.22)',
    glow: 'rgba(37,212,138,.06)',
  },
  pausable: {
    label: 'Pausable',
    icon: <PauseCircle size={13} strokeWidth={2} />,
    color: 'var(--fk-warn)',
    borderColor: 'rgba(255,194,77,.22)',
    glow: 'rgba(255,194,77,.06)',
  },
  mintable: {
    label: 'Mintable',
    icon: <Plus size={13} strokeWidth={2} />,
    color: 'var(--fk-cat-5)',
    borderColor: 'rgba(217,123,196,.22)',
    glow: 'rgba(217,123,196,.06)',
  },
  burnable: {
    label: 'Burnable',
    icon: <Flame size={13} strokeWidth={2} />,
    color: 'var(--fk-cat-6)',
    borderColor: 'rgba(217,142,107,.22)',
    glow: 'rgba(217,142,107,.06)',
  },
}

export default function FeatureBadge({ feature }: { feature: FeatureType }) {
  const c = featureConfig[feature]
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '5px 12px',
        borderRadius: 'var(--r-pill)',
        backgroundColor: c.glow,
        border: `1px solid ${c.borderColor}`,
        color: c.color,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: '.01em',
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}
    >
      {c.icon}
      {c.label}
    </div>
  )
}
