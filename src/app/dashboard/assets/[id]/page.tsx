import Link from 'next/link'
import { ArrowLeft, FileText, MoreVertical, ExternalLink } from 'lucide-react'
import TokenSummaryCard from '@/components/ui/TokenSummaryCard'
import LaunchStatusTimeline from '@/components/ui/LaunchStatusTimeline'
import InfoCard from '@/components/ui/InfoCard'
import WalletAddress from '@/components/ui/WalletAddress'
import FeatureBadge from '@/components/ui/FeatureBadge'
import StatusBadge from '@/components/ui/StatusBadge'

const launchSteps = [
  { label: 'Submitted', date: 'May 28, 2026', status: 'submitted' as const },
  { label: 'Document Approved', date: 'May 28, 2026', status: 'document_approved' as const },
  { label: 'Deployed', date: 'May 28, 2026', status: 'deployed' as const },
  { label: 'Live', date: 'May 28, 2026', status: 'live' as const },
]

export default function AssetDetailPage() {
  return (
    <div className="flex flex-col gap-5">
      {/* Back */}
      <Link
        href="/dashboard/assets"
        className="flex items-center gap-2 text-sm w-fit transition-colors hover:opacity-80"
        style={{ color: 'var(--fk-text-mid)' }}
      >
        <ArrowLeft size={15} />
        Back to Assets
      </Link>

      {/* Title */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, letterSpacing: '-.01em', color: 'var(--fk-text-hi)' }}>Assets</h1>
        <p style={{ fontSize: '15px', color: 'var(--fk-text-mid)', marginTop: '4px' }}>
          View and manage your token details
        </p>
      </div>

      {/* Token Summary */}
      <TokenSummaryCard
        initials="CL"
        name="clawd256"
        ticker="CLAWD256"
        network="BNB Chain Testnet"
        supply="1000000"
        status="live"
      />

      {/* Launch Status */}
      <LaunchStatusTimeline steps={launchSteps} />

      {/* Two-column grid */}
      <div className="grid grid-cols-2 gap-4">
        <InfoCard
          title="Product Details"
          rows={[
            {
              label: 'Network',
              value: <span style={{ color: 'var(--fk-text-hi)' }}>BNB Chain Testnet</span>,
            },
            {
              label: 'Contract',
              value: <WalletAddress address="0x3d5fae7b105942601f16b95bb504bb96e929b2cb" />,
            },
          ]}
        />

        <InfoCard
          title="Service Providers"
          rows={[
            { label: 'Token Issuer', value: 'nano' },
            { label: 'Security Agent', value: 'nano' },
            { label: 'Broker', value: 'nano' },
            { label: 'Custodian', value: <span className="fk-mono font-semibold tracking-wide">FIREBLOCKS</span> },
          ]}
        />
      </div>

      {/* Smart Contract Features */}
      <div className="fk-card p-6">
        <h3 className="font-semibold text-sm mb-3" style={{ fontFamily: 'var(--font-display)', color: 'var(--fk-text-hi)' }}>Smart Contract Features</h3>
        <div className="h-px mb-4" style={{ backgroundColor: 'var(--fk-line-soft)' }} />
        <div className="flex items-center gap-3 flex-wrap">
          <FeatureBadge feature="public" />
          <FeatureBadge feature="transferable" />
          <FeatureBadge feature="pausable" />
        </div>
      </div>

      {/* Document Product */}
      <div className="fk-card p-6">
        <h3 className="font-semibold text-sm mb-3" style={{ fontFamily: 'var(--font-display)', color: 'var(--fk-text-hi)' }}>Document Product</h3>
        <div className="h-px mb-4" style={{ backgroundColor: 'var(--fk-line-soft)' }} />

        <div
          className="flex items-center gap-3 px-4 py-3 rounded-lg"
          style={{
            backgroundColor: 'var(--fk-surface-2)',
            border: '1px solid var(--glass-border)',
            maxWidth: '480px',
          }}
        >
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'var(--fk-soft-tint)' }}
          >
            <FileText size={16} style={{ color: 'var(--fk-blue-soft)' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium" style={{ color: 'var(--fk-text-hi)' }}>whitepaper.pdf</p>
            <p className="text-xs" style={{ color: 'var(--fk-text-low)' }}>Updated today</p>
          </div>
          <StatusBadge status="approved" size="sm" />
          <button className="ml-1 transition-colors hover:opacity-80" style={{ color: 'var(--fk-text-low)' }} aria-label="More options">
            <MoreVertical size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
