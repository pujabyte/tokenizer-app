'use client'
import { Copy, Check, ExternalLink, UserPlus, MoreHorizontal, Key, LayoutGrid, Users } from 'lucide-react'
import { useState } from 'react'
import { usePrivyUser } from '@/hooks/usePrivyUser'

const truncWallet = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'team', label: 'Team', icon: Users },
]

const TEAM_MEMBERS = [
  { id: '1', name: 'I Ketut Puja Arsana Sujana', email: 'ketut.puja@nanovest.io', role: 'owner', status: 'Active', initial: 'I', color: '#8B5CF6' },
]


export default function SettingsPage() {
  const user = usePrivyUser()
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const handleCopy = () => {
    navigator.clipboard.writeText(user.walletAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const initials = user.displayName.split(' ').slice(0, 2).map(w => w[0]).join('')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Profile header card */}
      <div className="fk-card" style={{ padding: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Avatar */}
          <div style={{
            width: 72, height: 72, borderRadius: '50%', flexShrink: 0,
            background: 'var(--fk-grad)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 700, color: '#fff',
            boxShadow: '0 0 0 3px var(--fk-bg), 0 0 0 5px rgba(255,255,255,.08)',
          }}>
            {initials}
          </div>

          {/* Info */}
          <div>
            <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--fk-text-hi)', marginBottom: 4 }}>
              {user.displayName}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {/* Wallet pill */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '4px 10px', borderRadius: 'var(--r-pill)',
                background: 'var(--fk-surface-2)', border: '1px solid var(--glass-border)',
                fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--fk-text-mid)',
              }}>
                {truncWallet(user.walletAddress)}
                <button onClick={handleCopy} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: copied ? 'var(--fk-gain)' : 'var(--fk-text-low)', transition: 'color .2s' }}>
                  {copied ? <Check size={12} strokeWidth={2.5} /> : <Copy size={12} strokeWidth={1.75} />}
                </button>
              </div>

              {/* Explorer pill */}
              <a
                href={`https://etherscan.io/address/${user.walletAddress}`}
                target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '4px 10px', borderRadius: 'var(--r-pill)',
                  background: 'var(--fk-surface-2)', border: '1px solid var(--glass-border)',
                  fontSize: 12, color: 'var(--fk-text-mid)', textDecoration: 'none', transition: 'color .15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--fk-text-hi)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--fk-text-mid)')}
              >
                Etherscan <ExternalLink size={11} strokeWidth={2} />
              </a>

              {/* Org pill */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '4px 10px', borderRadius: 'var(--r-pill)',
                background: 'var(--fk-surface-2)', border: '1px solid var(--glass-border)',
                fontSize: 12, color: 'var(--fk-text-mid)',
              }}>
                openano
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Tab bar */}
      <div style={{
        display: 'flex', gap: 2,
        background: 'var(--fk-surface-1)', border: '1px solid var(--glass-border)',
        borderRadius: 'var(--r-lg)', padding: 4,
      }}>
        {TABS.map(tab => {
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '8px 16px', borderRadius: 'var(--r-md)',
                background: active ? 'var(--fk-surface-3)' : 'none',
                border: active ? '1px solid var(--glass-border)' : '1px solid transparent',
                cursor: 'pointer',
                color: active ? 'var(--fk-text-hi)' : 'var(--fk-text-low)',
                fontSize: 13, fontWeight: active ? 600 : 500,
                transition: 'all .15s',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'var(--fk-text-mid)' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'var(--fk-text-low)' }}
            >
              <tab.icon size={14} strokeWidth={1.75} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div className="fk-card" style={{ padding: '20px 24px' }}>
          <div style={{ borderBottom: '1px solid var(--fk-line-soft)', paddingBottom: 16, marginBottom: 16 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--fk-text-hi)', marginBottom: 2 }}>Account Details</p>
            <p style={{ fontSize: 13, color: 'var(--fk-text-low)' }}>Your profile and wallet information</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { label: 'Full Name', value: user.displayName },
              { label: 'Email', value: user.email ?? '—' },
              { label: 'Organization', value: 'openano' },
              { label: 'Wallet', value: truncWallet(user.walletAddress), mono: true },
              { label: 'Role', value: 'Owner' },
            ].map((row, i, arr) => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--fk-line-soft)' : 'none' }}>
                <span style={{ fontSize: 13, color: 'var(--fk-text-low)' }}>{row.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fk-text-hi)', fontFamily: row.mono ? 'var(--font-mono)' : undefined }}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--fk-line-soft)' }}>
            <button className="fk-btn fk-btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <Key size={14} strokeWidth={1.75} />
              Export Wallet
            </button>
          </div>
        </div>
      )}

      {activeTab === 'team' && (
        <div className="fk-card">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid var(--fk-line-soft)' }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--fk-text-hi)', marginBottom: 2 }}>Team Members</p>
              <p style={{ fontSize: 13, color: 'var(--fk-text-low)' }}>Manage your organization&apos;s permissions and roles</p>
            </div>
            <button style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '8px 16px', borderRadius: 'var(--r-md)',
              background: 'var(--fk-grad)', border: 'none', cursor: 'pointer',
              color: '#fff', fontSize: 13, fontWeight: 600,
            }}>
              <UserPlus size={14} strokeWidth={2} />
              Invite Member
            </button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--fk-line-soft)' }}>
                {['NAME', 'ROLE', 'STATUS', 'ACTIONS'].map(col => (
                  <th key={col} style={{ padding: '10px 24px', textAlign: 'left', fontSize: 11, fontWeight: 600, letterSpacing: '.08em', color: 'var(--fk-text-low)', textTransform: 'uppercase' }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TEAM_MEMBERS.map(m => (
                <tr key={m.id}>
                  <td style={{ padding: '14px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{m.initial}</div>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--fk-text-hi)' }}>{m.name}</p>
                        <p style={{ fontSize: 12, color: 'var(--fk-text-low)', marginTop: 2 }}>{m.email}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 24px' }}><span style={{ fontSize: 13, color: 'var(--fk-text-mid)' }}>{m.role}</span></td>
                  <td style={{ padding: '14px 24px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 'var(--r-pill)', background: 'rgba(37,212,138,.08)', border: '1px solid rgba(37,212,138,.2)', fontSize: 12, fontWeight: 600, color: 'var(--fk-gain)' }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--fk-gain)' }} />{m.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 24px' }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fk-text-low)', display: 'flex', padding: 4, borderRadius: 'var(--r-sm)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--fk-text-hi)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--fk-text-low)')}
                    >
                      <MoreHorizontal size={16} strokeWidth={1.75} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}


    </div>
  )
}
