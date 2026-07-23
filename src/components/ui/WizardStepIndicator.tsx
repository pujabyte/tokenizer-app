import Image from 'next/image'

const steps = [
  { label: 'Basics & Config', icon: '/basic_config.svg' },
  { label: 'Financial Info', icon: '/financial_info.svg' },
  { label: 'Partners & Docs', icon: '/partner_doc.svg' },
  { label: 'Review & Confirm', icon: '/review_confirm.svg' },
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
                    borderRadius: 'var(--r-lg)',
                    backgroundColor: 'var(--fk-surface-2)',
                    border: isActive ? 'none' : '1px solid var(--fk-line)',
                    boxShadow: isActive ? 'var(--el-glow)' : 'none',
                  }}
                >
                  <Image
                    src={step.icon}
                    alt={step.label}
                    width={32}
                    height={32}
                    style={{
                      filter: isActive || isDone ? 'brightness(0) invert(1)' : 'none',
                      opacity: isActive || isDone ? 1 : .5,
                    }}
                  />
                </div>

                {/* Label */}
                <div
                  style={{
                    marginTop: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: isActive ? 'var(--fk-text-hi)' : 'var(--fk-text-mid)',
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
                    backgroundColor: isDone ? 'var(--fk-blue-soft)' : 'var(--fk-line)',
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
