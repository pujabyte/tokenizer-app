import { Settings, DollarSign, Users, SquareCheck } from 'lucide-react'

const stepIcons = [Settings, DollarSign, Users, SquareCheck]

interface WizardStepFloatingProps {
  currentStep: number
  totalSteps?: number
}

export default function WizardStepFloating({ currentStep, totalSteps = 4 }: WizardStepFloatingProps) {
  return (
    <div
      className="fixed bottom-6 right-6 flex items-center z-50"
      style={{
        backgroundColor: 'var(--bg-primary)',
        border: '1px solid var(--border-color)',
        borderRadius: '9999px',
        padding: '8px 16px',
        gap: '8px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      {/* Step icon pills */}
      <div className="flex" style={{ gap: '8px' }}>
        {stepIcons.slice(0, totalSteps).map((Icon, i) => {
          const isActive = i === currentStep
          return (
            <div
              key={i}
              className="flex items-center justify-center"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#18181B',
                boxShadow: isActive ? 'rgb(100, 104, 240) 0px 0px 30px 0px' : 'none',
              }}
            >
              <Icon size={16} color={isActive ? '#f8fafc' : '#6b7280'} />
            </div>
          )
        })}
      </div>

      {/* Step counter */}
      <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-muted)' }}>
        {currentStep + 1}/{totalSteps}
      </span>
    </div>
  )
}
