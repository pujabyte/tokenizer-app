import { CheckCircle2, FileCheck, Rocket, Globe, ChevronRight } from 'lucide-react'

interface Step {
  label: string
  date: string
  status: 'submitted' | 'document_approved' | 'deployed' | 'live'
}

const stepConfig = {
  submitted: { icon: CheckCircle2, color: '#22c55e' },
  document_approved: { icon: FileCheck, color: '#3b82f6' },
  deployed: { icon: Rocket, color: '#22c55e' },
  live: { icon: Globe, color: '#22c55e' },
}

const colorMap = {
  submitted: 'text-green-400',
  document_approved: 'text-blue-400',
  deployed: 'text-green-400',
  live: 'text-green-400',
}

interface LaunchStatusTimelineProps {
  steps: Step[]
}

export default function LaunchStatusTimeline({ steps }: LaunchStatusTimelineProps) {
  return (
    <div
      className="flex items-center gap-2 px-6 py-5 rounded-xl"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
      }}
    >
      <span className="text-white font-semibold text-sm mr-4 flex-shrink-0">Launch Status</span>
      <div
        className="w-px self-stretch flex-shrink-0"
        style={{ backgroundColor: 'var(--border-color)' }}
      />

      <div className="flex items-center gap-2 flex-1 ml-2">
        {steps.map((step, i) => {
          const { icon: Icon, color } = stepConfig[step.status]
          return (
            <div key={i} className="flex items-center gap-2">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{step.date}</span>
                <div className={`flex items-center gap-1.5 text-sm font-medium ${colorMap[step.status]}`}>
                  <Icon size={14} color={color} />
                  <span>{step.label}</span>
                </div>
              </div>
              {i < steps.length - 1 && (
                <ChevronRight size={14} className="text-gray-600 flex-shrink-0 mx-1" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
