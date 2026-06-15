import StatCard from '@/components/ui/StatCard'
import TokenTable, { Token } from '@/components/ui/TokenTable'
import Link from 'next/link'

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
        <h1 style={{ fontSize: '30px', fontWeight: 700, color: '#ffffff' }}>Overview</h1>
        <p style={{ fontSize: '16px', color: '#94a3b8', marginTop: '4px' }}>
          Welcome back. Here is your portfolio performance.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="Total Value Locked"
          value="0"
          change="0% from last month"
          iconSrc="/value_locked.svg"
          iconAlt="Total Value Locked"
          iconBg="rgba(16,185,129,0.1)"
        />
        <StatCard
          title="Active Tokens"
          value="0"
          change="0% from last month"
          iconSrc="/active_token.svg"
          iconAlt="Active Tokens"
          iconBg="rgba(59,130,246,0.1)"
        />
        <StatCard
          title="Total Token"
          value="1"
          change="0% from last month"
          iconSrc="/token.svg"
          iconAlt="Total Token"
          iconBg="rgba(168,85,247,0.1)"
        />
        <StatCard
          title="Total Investors"
          value="0"
          change="0% from last month"
          iconSrc="/investors.svg"
          iconAlt="Total Investors"
          iconBg="rgba(245,158,11,0.1)"
        />
      </div>

      {/* Recent Tokens */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
        }}
      >
        {/* Card header: p-6 pb-4 = padding 24px top/sides, 16px bottom */}
        <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#ffffff' }}>Recent Token</h2>
          <p style={{ fontSize: '16px', color: '#64748b', marginTop: '2px' }}>
            You made {mockTokens.length} token this month.
          </p>
        </div>

        <TokenTable tokens={mockTokens} totalCount={mockTokens.length} embedded />

        {/* Footer: p-4 pt-0 = 0px top, 16px sides/bottom */}
        <div style={{ padding: '0 16px 16px' }}>
          <Link
            href="/dashboard/assets"
            className="inline-flex items-center justify-center w-full text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{
              backgroundColor: '#4f46e5',
              borderRadius: '6px',
              height: '40px',
            }}
          >
            View All Assets
          </Link>
        </div>
      </div>
    </div>
  )
}
