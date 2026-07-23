import TokenTable, { Token } from '@/components/ui/TokenTable'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const mockTokens: Token[] = [
  {
    id: '6260c508-5d68-4359-bca5-91c3c3bcd4d2',
    name: 'clawd256',
    initials: 'CL',
    ticker: 'CLAWD256',
    chain: 'BNB Chain Testnet',
    type: '',
    supply: '1000000',
    dateCreated: '28 May 2026',
    status: 'live',
  },
]

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, letterSpacing: '-.01em', color: 'var(--fk-text-hi)' }}>Overview</h1>
        <p style={{ fontSize: '15px', color: 'var(--fk-text-mid)', marginTop: '4px' }}>
          Welcome back. Here is your portfolio performance.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4">
        {/* Active Tokens — Hero Card Style B (Core Gradient) */}
        <div className="fk-hero-b" style={{ padding: '20px', minHeight: '170px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <p className="fk-mono" style={{ fontSize: '11px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.75)', marginBottom: '10px' }}>
              Active Tokens
            </p>
            <p className="fk-mono" style={{ fontWeight: 700, fontSize: '30px', letterSpacing: '-.01em', margin: 'auto 0 4px' }}>0</p>
            <p className="fk-mono" style={{ fontSize: '12px', color: 'rgba(255,255,255,.8)' }}>0% from last month</p>
            <div style={{ marginTop: '16px' }}>
              <Link href="/dashboard/tokens/create" className="fk-btn" style={{ background: '#fff', color: 'var(--fk-blue-deep)', padding: '8px 14px', fontSize: '12px' }}>
                Create Token
              </Link>
            </div>
          </div>
        </div>

        {/* Total Token — Hero Card Style C (Edge Light) */}
        <div className="fk-hero-c" style={{ padding: '20px', minHeight: '170px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <p className="fk-mono" style={{ fontSize: '11px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--fk-blue-bright)', marginBottom: '10px' }}>
              Total Token
            </p>
            <p className="fk-mono" style={{ fontWeight: 700, fontSize: '30px', letterSpacing: '-.01em', color: 'var(--fk-text-hi)', margin: 'auto 0 4px' }}>1</p>
            <p className="fk-mono" style={{ fontSize: '12px', color: 'var(--fk-text-mid)' }}>0% from last month</p>
            <div style={{ marginTop: '16px' }}>
              <Link href="/dashboard/assets" className="fk-btn fk-btn-ghost" style={{ padding: '8px 10px', fontSize: '12px' }}>
                View details <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Tokens */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 600, letterSpacing: '-.01em', color: 'var(--fk-text-hi)' }}>Recent Token</h2>
          <p style={{ fontSize: '13px', color: 'var(--fk-text-low)', marginTop: '2px' }}>
            You made {mockTokens.length} token this month.
          </p>
        </div>

        <TokenTable tokens={mockTokens} totalCount={mockTokens.length} />

        <Link
          href="/dashboard/assets"
          className="fk-btn fk-btn-ghost w-full justify-center"
        >
          View All Assets
        </Link>
      </div>
    </div>
  )
}
