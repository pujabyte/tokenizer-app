import { Shield } from 'lucide-react'
import ComingSoon from '@/components/ui/ComingSoon'

export default function CompliancePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 style={{ fontSize: '30px', fontWeight: 700, color: '#ffffff' }}>Compliance</h1>
        <p style={{ fontSize: '16px', color: '#94a3b8', marginTop: '4px' }}>
          KYC verification and audit trails
        </p>
      </div>

      <ComingSoon
        icon={<Shield size={24} className="text-slate-400" />}
        title="Coming Soon"
        description="The compliance page is under development. This page will display KYC status, audit logs, and compliance management tools."
      />
    </div>
  )
}
