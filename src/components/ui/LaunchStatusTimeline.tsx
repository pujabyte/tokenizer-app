import { CheckCircle2, FileCheck, Rocket, Globe, ChevronRight } from 'lucide-react'

interface Step {
  label: string
  date: string
  status: 'submitted' | 'document_approved' | 'deployed' | 'live'
}

const stepConfig = {
  submitted: { icon: CheckCircle2, color: 'var(--fk-gain)' },
  document_approved: { icon: FileCheck, color: 'var(--fk-info)' },
  deployed: { icon: Rocket, color: 'var(--fk-gain)' },
  live: { icon: Globe, color: 'var(--fk-gain)' },
}

interface LaunchStatusTimelineProps {
  steps: Step[]
}

export default function LaunchStatusTimeline({ steps }: LaunchStatusTimelineProps) {
  return (
    <div
      className="flex items-center gap-2 px-6 py-5 rounded-xl"
      style={{ overflowX: 'auto', backgroundColor: 'var(--fk-surface-1)', border: '1px solid var(--glass-border)' }}
    >
      <span className="font-semibold text-sm mr-4 flex-shrink-0" style={{ fontFamily: 'var(--font-display)', color: 'var(--fk-text-hi)' }}>Launch Status</span>
      <div
        className="w-px self-stretch flex-shrink-0"
        style={{ backgroundColor: 'var(--fk-line)' }}
      />

      <div className="flex items-center gap-2 flex-1 ml-2">
        {steps.map((step, i) => {
          const { icon: Icon, color } = stepConfig[step.status]
          return (
            <div key={i} className="flex items-center gap-2 flex-shrink-0">
              <div className="flex flex-col gap-0.5">
                <span className="fk-mono text-xs" style={{ color: 'var(--fk-text-low)' }}>{step.date}</span>
                <div className="flex items-center gap-1.5 text-sm font-medium" style={{ color }}>
                  <Icon size={14} color={color} />
                  <span>{step.label}</span>
                </div>
              </div>
              {i < steps.length - 1 && (
                <ChevronRight size={14} style={{ color: 'var(--fk-line)', flexShrink: 0, margin: '0 4px' }} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
