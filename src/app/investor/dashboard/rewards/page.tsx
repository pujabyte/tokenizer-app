'use client'
import { useEffect, useState } from 'react'
import StatCard from '@/components/ui/StatCard'
import { Coins, CheckCircle, HandCoins } from 'lucide-react'
import { TokenLogo } from '@/components/ui/token-logo'

export default function RewardsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/investor/rewards')
      .then(res => res.json())
      .then(d => {
        setData(d)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div style={{ color: 'var(--fk-text-mid)', padding: 48 }}>Loading rewards...</div>
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, color: 'var(--fk-text-hi)', marginBottom: 24 }}>Rewards Hub</h1>
      
      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 48 }}>
        <StatCard 
          title="Total Rewards Earned" 
          value={data.summary.totalEarned} 
          change="Lifetime accumulated yield"
          icon={<Coins size={18} style={{ color: 'var(--fk-gain)' }} />} 
          iconBg="var(--fk-gain-tint)" 
        />
        <StatCard 
          title="Pending Claims" 
          value={data.summary.pendingClaim} 
          change={`${data.pendingClaims.length} tokens ready to claim`}
          icon={<HandCoins size={18} style={{ color: 'var(--fk-blue)' }} />} 
          iconBg="var(--fk-blue-tint)" 
        />
      </div>

      {/* Pending Claims Section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--fk-text-hi)' }}>Pending Claims</h2>
        {data.pendingClaims.length > 0 && (
          <button className="fk-btn fk-btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>
            Claim All Rewards
          </button>
        )}
      </div>

      <div className="fk-card" style={{ overflow: 'hidden', marginBottom: 48 }}>
        {data.pendingClaims.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--fk-text-mid)' }}>
            No pending rewards to claim.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
            <thead>
              <tr>
                {['Asset', 'Type', 'Amount', 'Due Date', 'Action'].map((h, i) => (
                  <th key={h} className="fk-mono" style={{ textAlign: i === 2 || i === 4 ? 'right' : 'left', fontSize: '11px', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--fk-text-low)', padding: '16px', borderBottom: '1px solid var(--fk-line)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.pendingClaims.map((claim: any) => (
                <tr key={claim.id}>
                  <td style={{ padding: '16px', borderBottom: '1px solid var(--fk-line-soft)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <TokenLogo logo={claim.logo} symbol={claim.symbol} size={32} isGain={true} />
                      <div>
                        <p style={{ fontWeight: 600, color: 'var(--fk-text-hi)' }}>{claim.symbol}</p>
                        <p style={{ fontSize: 12, color: 'var(--fk-text-mid)' }}>{claim.name}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px', borderBottom: '1px solid var(--fk-line-soft)', color: 'var(--fk-text-hi)' }}>
                    {claim.type}
                  </td>
                  <td className="fk-mono" style={{ padding: '16px', borderBottom: '1px solid var(--fk-line-soft)', textAlign: 'right', fontWeight: 700, color: 'var(--fk-gain)' }}>
                    {claim.amount}
                  </td>
                  <td className="fk-mono" style={{ padding: '16px', borderBottom: '1px solid var(--fk-line-soft)', color: 'var(--fk-text-mid)', fontSize: 11 }}>
                    {new Date(claim.dueDate).toLocaleString()}
                  </td>
                  <td style={{ padding: '16px', borderBottom: '1px solid var(--fk-line-soft)', textAlign: 'right' }}>
                    <button className="fk-btn fk-btn-secondary" style={{ padding: '6px 14px', fontSize: 12 }}>
                      Claim
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Reward History Section */}
      <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--fk-text-hi)', marginBottom: 24 }}>Reward History</h2>

      <div className="fk-card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
          <thead>
            <tr>
              {['Asset', 'Type', 'Amount', 'Status', 'Date'].map((h, i) => (
                <th key={h} className="fk-mono" style={{ textAlign: i === 2 ? 'right' : 'left', fontSize: '11px', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--fk-text-low)', padding: '16px', borderBottom: '1px solid var(--fk-line)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.history.map((tx: any) => (
              <tr key={tx.id}>
                <td style={{ padding: '16px', borderBottom: '1px solid var(--fk-line-soft)' }}>
                  <div style={{ fontWeight: 600, color: 'var(--fk-text-hi)' }}>{tx.symbol}</div>
                  <div className="fk-mono" style={{ fontSize: 11, color: 'var(--fk-text-mid)' }}>{tx.id.toUpperCase()}</div>
                </td>
                <td style={{ padding: '16px', borderBottom: '1px solid var(--fk-line-soft)' }}>
                  <span style={{ color: 'var(--fk-text-hi)' }}>{tx.type}</span>
                </td>
                <td className="fk-mono" style={{ padding: '16px', borderBottom: '1px solid var(--fk-line-soft)', textAlign: 'right', fontWeight: 600, color: 'var(--fk-gain)' }}>
                  {tx.amount}
                </td>
                <td style={{ padding: '16px', borderBottom: '1px solid var(--fk-line-soft)' }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: 4, 
                    fontSize: 11, 
                    fontWeight: 600, 
                    color: tx.status === 'auto-distributed' ? 'var(--fk-blue)' : 'var(--fk-gain)',
                    background: tx.status === 'auto-distributed' ? 'var(--fk-blue-tint)' : 'var(--fk-gain-tint)'
                  }}>
                    {tx.status}
                  </span>
                </td>
                <td className="fk-mono" style={{ padding: '16px', borderBottom: '1px solid var(--fk-line-soft)', textAlign: 'left', color: 'var(--fk-text-mid)', fontSize: 11 }}>
                  {new Date(tx.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
