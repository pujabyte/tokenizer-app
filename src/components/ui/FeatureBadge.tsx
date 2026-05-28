import { ArrowLeftRight, Users, PauseCircle, Plus, Flame } from 'lucide-react'
import React from 'react'

type FeatureType = 'transferable' | 'public' | 'pausable' | 'mintable' | 'burnable'

interface FeatureConfig {
  label: string
  icon: React.ReactNode
  bgColor: string
  textColor: string
  iconBg: string
}

const featureConfig: Record<FeatureType, FeatureConfig> = {
  transferable: {
    label: 'Transferable',
    icon: <ArrowLeftRight size={14} />,
    bgColor: 'rgba(59,130,246,0.08)',
    textColor: '#93c5fd',
    iconBg: 'rgba(59,130,246,0.2)',
  },
  public: {
    label: 'Public',
    icon: <Users size={14} />,
    bgColor: 'rgba(34,197,94,0.08)',
    textColor: '#86efac',
    iconBg: 'rgba(34,197,94,0.2)',
  },
  pausable: {
    label: 'Pausable',
    icon: <PauseCircle size={14} />,
    bgColor: 'rgba(245,158,11,0.08)',
    textColor: '#fcd34d',
    iconBg: 'rgba(245,158,11,0.2)',
  },
  mintable: {
    label: 'Mintable',
    icon: <Plus size={14} />,
    bgColor: 'rgba(236,72,153,0.08)',
    textColor: '#f9a8d4',
    iconBg: 'rgba(236,72,153,0.2)',
  },
  burnable: {
    label: 'Burnable',
    icon: <Flame size={14} />,
    bgColor: 'rgba(249,115,22,0.08)',
    textColor: '#fdba74',
    iconBg: 'rgba(249,115,22,0.2)',
  },
}

interface FeatureBadgeProps {
  feature: FeatureType
}

export default function FeatureBadge({ feature }: FeatureBadgeProps) {
  const config = featureConfig[feature]
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
      style={{
        backgroundColor: config.bgColor,
        color: config.textColor,
        border: `1px solid ${config.iconBg}`,
      }}
    >
      <span
        className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: config.iconBg }}
      >
        {config.icon}
      </span>
      {config.label}
    </div>
  )
}
