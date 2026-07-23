import { Shield } from 'lucide-react'
import ComingSoon from '@/components/ui/ComingSoon'

export default function CompliancePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, letterSpacing: '-.01em', color: 'var(--fk-text-hi)' }}>Compliance</h1>
        <p style={{ fontSize: '15px', color: 'var(--fk-text-mid)', marginTop: '4px' }}>
          KYC verification and audit trails
        </p>
      </div>

      <ComingSoon
        icon={<Shield size={24} style={{ color: 'var(--fk-text-mid)' }} />}
        title="Coming Soon"
        description="The compliance page is under development. This page will display KYC status, audit logs, and compliance management tools."
      />
    </div>
  )
}
