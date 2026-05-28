import { Globe, Coins, Users, TrendingUp } from 'lucide-react'
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
          icon={<Globe size={24} className="text-green-400" />}
          iconBg="rgba(16,185,129,0.1)"
        />
        <StatCard
          title="Active Tokens"
          value="0"
          change="0% from last month"
          icon={<Coins size={24} className="text-blue-400" />}
          iconBg="rgba(59,130,246,0.1)"
        />
        <StatCard
          title="Total Token"
          value="1"
          change="0% from last month"
          icon={<TrendingUp size={24} className="text-purple-400" />}
          iconBg="rgba(168,85,247,0.1)"
        />
        <StatCard
          title="Total Investors"
          value="0"
          change="0% from last month"
          icon={<Users size={24} className="text-orange-400" />}
          iconBg="rgba(245,158,11,0.1)"
        />
      </div>

      {/* Recent Tokens */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        <div
          className="px-6 py-4"
          style={{ borderBottom: '1px solid var(--border-color)' }}
        >
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#ffffff' }}>Recent Token</h2>
          <p style={{ fontSize: '16px', color: '#64748b', marginTop: '2px' }}>
            You made {mockTokens.length} token this month.
          </p>
        </div>

        <TokenTable tokens={mockTokens} totalCount={mockTokens.length} embedded />

        <div style={{ padding: '16px' }}>
          <Link
            href="/dashboard/assets"
            className="flex items-center justify-center text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{
              backgroundColor: '#5b21b6',
              borderRadius: '10px',
              height: '44px',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            View All Assets
          </Link>
        </div>
      </div>
    </div>
  )
}
