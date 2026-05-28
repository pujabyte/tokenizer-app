import { Settings, DollarSign, Users, SquareCheck } from 'lucide-react'

const steps = [
  { label: 'Basics & Config', icon: Settings },
  { label: 'Financial Info', icon: DollarSign },
  { label: 'Partners & Docs', icon: Users },
  { label: 'Review & Confirm', icon: SquareCheck },
]

interface WizardStepIndicatorProps {
  currentStep: number
}

export default function WizardStepIndicator({ currentStep }: WizardStepIndicatorProps) {
  return (
    <div style={{ overflowX: 'auto', padding: '32px 0' }}>
      <div className="flex items-center justify-center" style={{ gap: '8px', minWidth: 'max-content' }}>
        {steps.map((step, i) => {
          const isActive = i === currentStep
          const isDone = i < currentStep
          const Icon = step.icon

          return (
            <div key={i} className="flex items-center" style={{ gap: '8px' }}>
              {/* Step column: icon + label */}
              <div className="flex flex-col items-center">
                {/* Square icon */}
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    backgroundColor: '#18181B',
                    border: isActive ? 'none' : '1px solid var(--border-color)',
                    boxShadow: isActive ? 'rgb(100, 104, 240) 0px 0px 30px 0px' : 'none',
                  }}
                >
                  <Icon
                    size={20}
                    color={isActive || isDone ? '#f8fafc' : '#6b7280'}
                  />
                </div>

                {/* Label */}
                <div
                  style={{
                    marginTop: '8px',
                    fontSize: '16px',
                    fontWeight: 400,
                    color: '#f8fafc',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {step.label}
                </div>
              </div>

              {/* Connector line (not after last step) */}
              {i < steps.length - 1 && (
                <div
                  style={{
                    width: '57px',
                    height: '2px',
                    backgroundColor: isDone ? 'rgba(100,104,240,0.6)' : 'rgba(255,255,255,0.3)',
                    flexShrink: 0,
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
