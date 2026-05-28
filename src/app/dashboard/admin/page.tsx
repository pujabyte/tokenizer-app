'use client'
import { useState } from 'react'
import { ExternalLink, Plus, Flame, AlertTriangle, PauseCircle } from 'lucide-react'
import ContractSearchBar, { TokenOption } from '@/components/ui/ContractSearchBar'
import clsx from 'clsx'

const mockTokens: TokenOption[] = [
  {
    id: '6260c508-5d68-4359-bca5-91c3c3bcd4d2',
    name: 'clawd256',
    ticker: 'clawd256',
    initials: 'CL',
    contractAddress: '0x3d5fae7b105942601f16b95bb504bb96e929b2cb',
  },
]

type TabType = 'supply' | 'security'

export default function ContractAdminPage() {
  const [selectedToken, setSelectedToken] = useState<TokenOption | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('supply')

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '30px', fontWeight: 700, color: '#ffffff' }}>Smart Contract Admin</h1>
        <p style={{ fontSize: '16px', color: '#94a3b8', marginTop: '4px' }}>
          Manage supply, permissions, and security for your assets.
        </p>
      </div>

      {/* Search */}
      <div
        className="rounded-xl"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
      >
        {/* Card Header */}
        <div style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f8fafc', marginBottom: '6px' }}>
            Select Asset Contract
          </h3>
          <p style={{ fontSize: '14px', color: '#94a3b8' }}>
            To set supply, security and audit you need to select token first.
          </p>
        </div>
        {/* Card Content */}
        <div style={{ padding: '0px 24px 24px' }}>
          <ContractSearchBar options={mockTokens} onSelect={setSelectedToken} />
        </div>
      </div>

      {/* Contract Panel */}
      {selectedToken && (
        <>
          {/* Contract Header */}
          <div
            className="flex items-center gap-4 px-5 py-4 rounded-xl"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
              style={{ backgroundColor: '#374151' }}
            >
              {selectedToken.initials}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-semibold tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  CONTRACT ADDRESS
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium text-blue-300"
                  style={{ backgroundColor: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.2)' }}
                >
                  BNB Chain Testnet
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  Transferable
                </span>
              </div>
              <p className="text-sm text-white font-mono">{selectedToken.contractAddress}</p>
            </div>
            <a
              href="#"
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg transition-colors hover:bg-white/[0.05]"
              style={{
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
              }}
            >
              <ExternalLink size={12} />
              View Testnet
            </a>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1">
            {(['supply', 'security'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={clsx(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  activeTab === tab
                    ? 'text-white'
                    : 'hover:bg-white/[0.04]'
                )}
                style={{
                  backgroundColor: activeTab === tab ? 'var(--bg-card)' : 'transparent',
                  border: activeTab === tab ? '1px solid var(--border-color)' : '1px solid transparent',
                  color: activeTab === tab ? '#fff' : 'var(--text-muted)',
                }}
              >
                {tab === 'supply' ? 'Supply Operations' : 'Security & Audit'}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'supply' && (
            <div className="flex flex-col gap-4">
              {/* Warning Banner */}
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{
                  backgroundColor: 'rgba(245,158,11,0.08)',
                  border: '1px solid rgba(245,158,11,0.2)',
                }}
              >
                <AlertTriangle size={16} className="text-amber-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-white font-medium">Your wallet has 0 tBNB on this network.</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    Mint and burn transactions need tBNB to pay gas. Fund the wallet to continue.
                  </p>
                </div>
                <button
                  className="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium text-white"
                  style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                >
                  Fund wallet
                </button>
              </div>

              {/* Mint & Burn */}
              <div className="grid grid-cols-2 gap-4">
                {/* Mint */}
                <div
                  className="rounded-xl p-5 flex flex-col gap-4"
                  style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(34,197,94,0.15)' }}
                    >
                      <Plus size={18} className="text-green-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">Mint Tokens</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Increase total supply. Requires multi-sig (mock).
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: 'var(--text-muted)' }}>Current Supply:</span>
                    <span className="text-white font-medium">1,000,000</span>
                  </div>
                  <div>
                    <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Amount to Mint</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-gray-600"
                      style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)' }}
                      disabled
                    />
                    <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>To: 0xF7aB...B48e</p>
                  </div>
                  <button
                    className="w-full py-2.5 rounded-lg text-sm font-medium text-gray-500 cursor-not-allowed"
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)' }}
                    disabled
                  >
                    Mint Disabled
                  </button>
                </div>

                {/* Burn */}
                <div
                  className="rounded-xl p-5 flex flex-col gap-4"
                  style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(249,115,22,0.15)' }}
                    >
                      <Flame size={18} className="text-orange-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">Burn Tokens</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Decrease total supply permanently.
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Amount to Burn</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-gray-600"
                      style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)' }}
                      disabled
                    />
                  </div>
                  <button
                    className="w-full py-2.5 rounded-lg text-sm font-medium text-gray-500 cursor-not-allowed mt-auto"
                    style={{ backgroundColor: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.2)' }}
                    disabled
                  >
                    Burn Disabled
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div
              className="flex items-center justify-between px-5 py-4 rounded-xl"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
            >
              <div className="flex items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold text-sm">Emergency Control</p>
                    <span
                      className="flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: 'rgba(34,197,94,0.15)',
                        border: '1px solid rgba(34,197,94,0.2)',
                        color: '#4ade80',
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      Operational
                    </span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    Only Contract owner or assigned guardians can initiate this pause.
                  </p>
                </div>
              </div>
              <button
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white"
                style={{ backgroundColor: 'rgba(239,68,68,0.8)' }}
              >
                <PauseCircle size={15} />
                Pause Contract
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
