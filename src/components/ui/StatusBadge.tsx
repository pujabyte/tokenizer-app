import { Globe, CheckCircle2, Rocket, FileCheck } from 'lucide-react'
import clsx from 'clsx'

type StatusType = 'live' | 'submitted' | 'document_approved' | 'deployed' | 'approved' | 'pending' | 'operational'

interface StatusBadgeProps {
  status: StatusType
  size?: 'sm' | 'md'
}

const statusConfig: Record<StatusType, { label: string; className: string; dotColor: string; icon?: React.ReactNode }> = {
  live: {
    label: 'Live',
    className: 'text-green-400 border-green-500/30 bg-green-500/10',
    dotColor: '#22c55e',
    icon: <Globe size={11} />,
  },
  submitted: {
    label: 'Submitted',
    className: 'text-green-400',
    dotColor: '#22c55e',
    icon: <CheckCircle2 size={13} />,
  },
  document_approved: {
    label: 'Document Approved',
    className: 'text-blue-400',
    dotColor: '#3b82f6',
    icon: <FileCheck size={13} />,
  },
  deployed: {
    label: 'Deployed',
    className: 'text-green-400',
    dotColor: '#22c55e',
    icon: <Rocket size={13} />,
  },
  approved: {
    label: 'Approved',
    className: 'text-green-400 border-green-500/30 bg-green-500/10',
    dotColor: '#22c55e',
  },
  pending: {
    label: 'Pending',
    className: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    dotColor: '#f59e0b',
  },
  operational: {
    label: 'Operational',
    className: 'text-green-400 border-green-500/30 bg-green-500/10',
    dotColor: '#22c55e',
  },
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status]

  if (status === 'submitted' || status === 'document_approved' || status === 'deployed') {
    return (
      <span className={clsx('flex items-center gap-1.5 text-sm font-medium', config.className)}>
        {config.icon}
        {config.label}
      </span>
    )
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        config.className
      )}
    >
      {config.icon ? config.icon : (
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: config.dotColor, boxShadow: `0 0 5px ${config.dotColor}` }}
        />
      )}
      {config.label}
    </span>
  )
}
