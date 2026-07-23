import Image from 'next/image'

const stepIcons = [
  '/basic_config.svg',
  '/financial_info.svg',
  '/partner_doc.svg',
  '/review_confirm.svg',
]

interface WizardStepFloatingProps {
  currentStep: number
  totalSteps?: number
}

export default function WizardStepFloating({ currentStep, totalSteps = 4 }: WizardStepFloatingProps) {
  return (
    <div
      className="fixed bottom-6 right-6 flex items-center z-50"
      style={{
        backgroundColor: 'var(--fk-surface-2)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--r-pill)',
        padding: '8px 16px',
        gap: '8px',
        boxShadow: 'var(--el-3)',
      }}
    >
      {/* Step icon pills */}
      <div className="flex" style={{ gap: '8px' }}>
        {stepIcons.slice(0, totalSteps).map((src, i) => {
          const isActive = i === currentStep
          return (
            <div
              key={i}
              className="flex items-center justify-center"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--r-sm)',
                backgroundColor: 'var(--fk-surface-3)',
                boxShadow: isActive ? 'var(--el-glow)' : 'none',
              }}
            >
              <Image
                src={src}
                alt={`step ${i + 1}`}
                width={20}
                height={20}
                style={{
                  filter: isActive ? 'brightness(0) invert(1)' : 'none',
                  opacity: isActive ? 1 : .5,
                }}
              />
            </div>
          )
        })}
      </div>

      {/* Step counter */}
      <span className="fk-mono" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--fk-text-mid)' }}>
        {currentStep + 1}/{totalSteps}
      </span>
    </div>
  )
}
