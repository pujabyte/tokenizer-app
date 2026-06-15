'use client'
import React, { useState, useMemo, useRef, useEffect } from 'react'
import {
  ExternalLink, Plus, Flame, AlertTriangle, PauseCircle,
  CheckCircle2, XCircle, ChevronDown, Info,
} from 'lucide-react'
import ContractSearchBar, { TokenOption } from '@/components/ui/ContractSearchBar'
import MintSigningModal, { MintTx } from '@/components/ui/MintSigningModal'
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

/* ── Prototype scenario presets ───────────────────────────────────────── */
type Scenario = {
  label: string
  minterAllowance: number
  remainingSupply: number
  maxSupply: number
  isWhitelistedToken: boolean
}

const SCENARIOS: Scenario[] = [
  { label: '1 TX — Mint only',             minterAllowance: 500_000, remainingSupply: 500_000, maxSupply: 1_000_000, isWhitelistedToken: false },
  { label: '2 TX — Set Allowance + Mint',  minterAllowance: 0,       remainingSupply: 500_000, maxSupply: 1_000_000, isWhitelistedToken: false },
  { label: '2 TX — Whitelist + Mint',      minterAllowance: 500_000, remainingSupply: 500_000, maxSupply: 1_000_000, isWhitelistedToken: true  },
  { label: '3 TX — All steps',             minterAllowance: 0,       remainingSupply: 500_000, maxSupply: 1_000_000, isWhitelistedToken: true  },
  { label: 'Blocked — Max supply reached', minterAllowance: 500_000, remainingSupply: 0,       maxSupply: 1_000_000, isWhitelistedToken: false },
]

const OWNER_WALLET = '0xF7aBd08D1b15121469c78CC4a473324fF4CfB48e'

/* ── Scale options ────────────────────────────────────────────────────── */
const SCALE_OPTIONS = [
  { label: 'x1',     exp: 0  },
  { label: 'x10^6',  exp: 6  },
  { label: 'x10^9',  exp: 9  },
  { label: 'x10^12', exp: 12 },
  { label: 'x10^15', exp: 15 },
  { label: 'x10^18', exp: 18 },
]

function applyScale(base: string, exp: number): number {
  const n = parseFloat(base) || 0
  return n * Math.pow(10, exp)
}

function truncate(addr: string) {
  return addr.slice(0, 6) + '...' + addr.slice(-4)
}

/* ── Scale Dropdown ───────────────────────────────────────────────────── */
function ScaleDropdown({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = SCALE_OPTIONS.find(o => o.exp === value) ?? SCALE_OPTIONS[0]

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative flex-shrink-0">
      {/* Divider */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2" style={{ width: '1px', height: '20px', backgroundColor: 'var(--border-color)' }} />

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 pl-3 pr-2 h-full text-sm font-medium transition-colors hover:text-white"
        style={{ color: '#94a3b8', minWidth: '80px' }}
      >
        {selected.label}
        <ChevronDown size={12} className={clsx('transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 rounded-lg overflow-hidden z-50"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            minWidth: '100px',
          }}
        >
          {SCALE_OPTIONS.map(opt => (
            <button
              key={opt.exp}
              type="button"
              onClick={() => { onChange(opt.exp); setOpen(false) }}
              className="w-full flex items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-white/[0.05]"
              style={{ color: opt.exp === value ? '#818cf8' : '#94a3b8' }}
            >
              {opt.label}
              {opt.exp === value && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Amount Input with Scale ──────────────────────────────────────────── */
function ScaledAmountInput({
  base, onBaseChange, scale, onScaleChange, placeholder = '0.00',
}: {
  base: string; onBaseChange: (v: string) => void
  scale: number; onScaleChange: (v: number) => void
  placeholder?: string
}) {
  return (
    <div
      className="flex items-center"
      style={{
        backgroundColor: 'var(--bg-input)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        height: '42px',
      }}
    >
      <input
        type="number"
        value={base}
        onChange={e => onBaseChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 px-4 text-sm text-white placeholder-gray-600 bg-transparent border-none outline-none min-w-0"
        style={{
          height: '100%',
          minWidth: 0,
          /* hide native number spinners */
          appearance: 'none',
          WebkitAppearance: 'none',
          MozAppearance: 'textfield',
        } as React.CSSProperties}
      />
      <ScaleDropdown value={scale} onChange={onScaleChange} />
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────── */

export default function ContractAdminPage() {
  const [selectedToken, setSelectedToken] = useState<TokenOption | null>(null)
  const [activeTab, setActiveTab] = useState<TabType>('supply')

  /* Prototype scenario */
  const [activeScenario, setActiveScenario] = useState(0)
  const scenario = SCENARIOS[activeScenario]

  /* Mint form */
  const [mintBase, setMintBase]           = useState('')
  const [mintScale, setMintScale]         = useState(0)
  const [allowBase, setAllowBase]         = useState('')
  const [allowScale, setAllowScale]       = useState(0)
  const [showModal, setShowModal]         = useState(false)

  /* Computed */
  const parsedMint      = applyScale(mintBase, mintScale)
  const parsedAllowance = applyScale(allowBase, allowScale)

  const supplyOk           = parsedMint > 0 && scenario.remainingSupply >= parsedMint
  const supplyZero         = scenario.remainingSupply === 0
  const needsConfigMinter  = parsedMint > 0 && scenario.minterAllowance < parsedMint
  const allowanceFilled    = parsedAllowance > 0
  const allowanceSufficient = !needsConfigMinter || (allowanceFilled && parsedAllowance >= parsedMint)
  const allowanceWarning   = needsConfigMinter && allowanceFilled && parsedAllowance < parsedMint

  const txList = useMemo<MintTx[]>(() => {
    const list: MintTx[] = []

    if (needsConfigMinter && allowanceSufficient) {
      list.push({
        id: 'configureMinter',
        label: 'Set Minting Allowance',
        description: 'Authorize your wallet to mint up to the set allowance',
        details: {
          Function:  'configureMinter(address, uint256)',
          Minter:    truncate(OWNER_WALLET),
          Allowance: parsedAllowance.toLocaleString() + ' tokens',
        },
      })
    }

    if (!scenario.isWhitelistedToken === false && parsedMint > 0) {
      // whitelist token: owner minting to themselves, check if owner is whitelisted
      // For prototype: owner not whitelisted when isWhitelistedToken = true
      if (scenario.isWhitelistedToken) {
        list.push({
          id: 'whitelist',
          label: 'Whitelist Recipient',
          description: 'Add your address to the token whitelist',
          details: {
            Function: 'whitelist(address)',
            Address:  truncate(OWNER_WALLET),
          },
        })
      }
    }

    if (parsedMint > 0 && !supplyZero && allowanceSufficient) {
      list.push({
        id: 'mint',
        label: 'Mint Tokens',
        description: 'Create new tokens and send to your wallet',
        details: {
          Function: 'mint(address, uint256)',
          To:       truncate(OWNER_WALLET),
          Amount:   parsedMint.toLocaleString() + ' tokens',
        },
      })
    }

    return list
  }, [needsConfigMinter, allowanceSufficient, parsedAllowance, scenario.isWhitelistedToken, parsedMint, supplyZero])

  const canMint = parsedMint > 0 && !supplyZero && allowanceSufficient && txList.length > 0

  const handleMintComplete = () => {
    setShowModal(false)
    setMintBase('')
    setAllowBase('')
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 style={{ fontSize: '30px', fontWeight: 700, color: '#ffffff' }}>Smart Contract Admin</h1>
        <p style={{ fontSize: '16px', color: '#94a3b8', marginTop: '4px' }}>
          Manage supply, permissions, and security for your assets.
        </p>
      </div>

      {/* ── Prototype Controls ── */}
      <div
        className="rounded-xl p-4"
        style={{ backgroundColor: 'rgba(234,179,8,0.04)', border: '1px solid rgba(234,179,8,0.2)' }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Info size={14} className="text-yellow-500 flex-shrink-0" />
          <span className="text-xs font-semibold" style={{ color: '#eab308', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Prototype Scenarios
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SCENARIOS.map((s, i) => (
            <button
              key={i}
              onClick={() => { setActiveScenario(i); setMintBase(''); setAllowBase('') }}
              className="text-xs px-3 py-1.5 rounded-lg transition-colors font-medium"
              style={{
                backgroundColor: activeScenario === i ? 'rgba(234,179,8,0.15)' : 'rgba(255,255,255,0.04)',
                border: activeScenario === i ? '1px solid rgba(234,179,8,0.4)' : '1px solid var(--border-color)',
                color: activeScenario === i ? '#eab308' : 'var(--text-muted)',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="flex gap-4 mt-3">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Minting Allowance: <span className="text-white font-mono">{scenario.minterAllowance.toLocaleString()}</span>
          </span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Remaining Supply: <span className="text-white font-mono">{scenario.remainingSupply.toLocaleString()}</span>
          </span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Token Type: <span className="text-white">{scenario.isWhitelistedToken ? 'Whitelisted' : 'Public'}</span>
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        <div style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#f8fafc', marginBottom: '6px' }}>Select Asset Contract</h3>
          <p style={{ fontSize: '14px', color: '#94a3b8' }}>To set supply, security and audit you need to select token first.</p>
        </div>
        <div style={{ padding: '0px 24px 24px' }}>
          <ContractSearchBar options={mockTokens} onSelect={setSelectedToken} />
        </div>
      </div>

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
                <span className="text-xs font-semibold tracking-widest" style={{ color: 'var(--text-muted)' }}>CONTRACT ADDRESS</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium text-blue-300" style={{ backgroundColor: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.2)' }}>
                  BNB Chain Testnet
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    backgroundColor: scenario.isWhitelistedToken ? 'rgba(168,85,247,0.1)' : 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border-color)',
                    color: scenario.isWhitelistedToken ? '#c084fc' : 'var(--text-secondary)',
                  }}
                >
                  {scenario.isWhitelistedToken ? 'Whitelisted' : 'Transferable'}
                </span>
              </div>
              <p className="text-sm text-white font-mono">{selectedToken.contractAddress}</p>
            </div>
            <a href="#" className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg transition-colors hover:bg-white/[0.05]" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
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
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
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

          {/* ── Supply Tab ── */}
          {activeTab === 'supply' && (
            <div className="flex flex-col gap-4">
              {/* tBNB warning */}
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ backgroundColor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}
              >
                <AlertTriangle size={16} className="text-amber-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-white font-medium">Your wallet has 0 tBNB on this network.</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    Mint and burn transactions need tBNB to pay gas. Fund the wallet to continue.
                  </p>
                </div>
                <button className="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                  Fund wallet
                </button>
              </div>

              {/* Mint + Burn grid */}
              <div className="grid grid-cols-2 gap-4 items-start">

                {/* ── Mint Card ── */}
                <div
                  className="rounded-xl p-5 flex flex-col gap-4"
                  style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                >
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(79,70,229,0.2)' }}>
                      <Plus size={18} style={{ color: '#818cf8' }} />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">Mint Tokens</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Increase total supply. Requires multi-sig (mock).</p>
                    </div>
                  </div>

                  {/* Max Supply & Minting Allowance row */}
                  <div className="flex items-center justify-between text-sm" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Max Supply:</span>
                    <span className="text-white font-medium font-mono">{scenario.maxSupply.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm" style={{ marginTop: '-8px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Minting Allowance:</span>
                    <span
                      className="font-medium font-mono"
                      style={{ color: scenario.minterAllowance === 0 ? '#f87171' : '#4ade80' }}
                    >
                      {scenario.minterAllowance.toLocaleString()}
                    </span>
                  </div>

                  {/* ── Allowance input — only when insufficient ── */}
                  {needsConfigMinter && (
                    <div
                      className="flex flex-col gap-3 p-3 rounded-lg"
                      style={{ backgroundColor: 'rgba(79,70,229,0.06)', border: '1px solid rgba(79,70,229,0.2)' }}
                    >
                      {/* Header */}
                      <div className="flex items-start gap-2">
                        <div
                          className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ backgroundColor: 'rgba(99,102,241,0.2)' }}
                        >
                          <span style={{ fontSize: '10px', color: '#818cf8', fontWeight: 700 }}>!</span>
                        </div>
                        <div>
                          <p className="text-xs font-semibold" style={{ color: '#a5b4fc' }}>
                            Minting Permission Required
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: '#818cf8', lineHeight: 1.5 }}>
                            Before minting, your wallet needs a spending limit. Set how much you want to authorize in one go.
                          </p>
                        </div>
                      </div>

                      {/* Input */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                            Allowance Amount
                          </label>
                          {allowanceFilled && allowanceWarning && (
                            <span className="text-xs text-red-400">must be ≥ mint amount</span>
                          )}
                        </div>
                        <ScaledAmountInput
                          base={allowBase}
                          onBaseChange={setAllowBase}
                          scale={allowScale}
                          onScaleChange={setAllowScale}
                          placeholder="0.00"
                        />
                        {allowanceFilled && !allowanceWarning && (
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            Will authorize up to <span className="text-white font-mono">{parsedAllowance.toLocaleString()}</span> tokens
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ── Amount to Mint ── */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                      Amount to Mint
                    </label>
                    <ScaledAmountInput
                      base={mintBase}
                      onBaseChange={setMintBase}
                      scale={mintScale}
                      onScaleChange={setMintScale}
                      placeholder="0.00"
                    />
                    {/* Scaled preview */}
                    {parsedMint > 0 && mintScale > 0 && (
                      <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                        = {parsedMint.toLocaleString()} tokens
                      </p>
                    )}
                    <div
                      className="flex items-center gap-2 px-3 py-2 rounded-lg"
                      style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)' }}
                    >
                      <span className="text-xs font-medium" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>Recipient</span>
                      <span className="flex-1 text-xs font-mono text-white">{truncate(OWNER_WALLET)}</span>
                      <span
                        className="text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0"
                        style={{ backgroundColor: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)', fontSize: '10px' }}
                      >
                        You
                      </span>
                    </div>
                  </div>

                  {/* ── Pre-flight checks ── */}
                  {parsedMint > 0 && (
                    <div
                      className="flex flex-col gap-2 p-3 rounded-lg"
                      style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)' }}
                    >
                      <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                        Pre-flight
                      </p>

                      {/* Supply check */}
                      <div className="flex items-center gap-2">
                        {supplyZero
                          ? <XCircle size={13} className="text-red-400 flex-shrink-0" />
                          : <CheckCircle2 size={13} className="text-green-400 flex-shrink-0" />
                        }
                        <span className="text-xs" style={{ color: supplyZero ? '#f87171' : '#94a3b8' }}>
                          {supplyZero
                            ? 'Max supply reached — minting blocked'
                            : `Remaining supply: ${scenario.remainingSupply.toLocaleString()}`}
                        </span>
                      </div>

                      {/* Allowance check */}
                      {!supplyZero && (
                        <div className="flex items-start gap-2">
                          {needsConfigMinter
                            ? <XCircle size={13} className="text-amber-400 flex-shrink-0 mt-0.5" />
                            : <CheckCircle2 size={13} className="text-green-400 flex-shrink-0 mt-0.5" />
                          }
                          <span className="text-xs" style={{ color: needsConfigMinter ? '#fbbf24' : '#94a3b8' }}>
                            {needsConfigMinter
                              ? `Allowance ${scenario.minterAllowance.toLocaleString()} < ${parsedMint.toLocaleString()} — set allowance above`
                              : 'Minting allowance sufficient'}
                          </span>
                        </div>
                      )}

                      {/* Whitelist check */}
                      {!supplyZero && scenario.isWhitelistedToken && (
                        <div className="flex items-center gap-2">
                          <XCircle size={13} className="text-amber-400 flex-shrink-0" />
                          <span className="text-xs text-amber-300">Whitelisted token — will add your address to whitelist</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── TX badge strip ── */}
                  {canMint && txList.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {txList.map((tx, i) => (
                        <span key={tx.id} className="flex items-center gap-1">
                          {i > 0 && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>→</span>}
                          <span
                            className="text-xs px-2 py-1 rounded font-medium"
                            style={{ backgroundColor: 'rgba(79,70,229,0.15)', color: '#a5b4fc', border: '1px solid rgba(79,70,229,0.2)' }}
                          >
                            {tx.label}
                          </span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* ── Action button ── */}
                  {supplyZero ? (
                    <div
                      className="w-full py-2.5 rounded-lg text-sm font-medium text-center"
                      style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
                    >
                      Minting Unavailable — Max Supply Reached
                    </div>
                  ) : (
                    <button
                      onClick={() => canMint && setShowModal(true)}
                      disabled={!canMint}
                      className={clsx('w-full py-2.5 rounded-lg text-sm font-medium transition-opacity', canMint && 'hover:opacity-90')}
                      style={{
                        backgroundColor: canMint ? '#4f46e5' : 'rgba(255,255,255,0.05)',
                        color: canMint ? '#fff' : 'var(--text-muted)',
                        border: canMint ? 'none' : '1px solid var(--border-color)',
                        cursor: canMint ? 'pointer' : 'not-allowed',
                      }}
                    >
                      {!parsedMint
                        ? 'Enter amount to mint'
                        : needsConfigMinter && !allowanceSufficient
                        ? 'Set minting allowance above'
                        : `Sign ${txList.length} Transaction${txList.length !== 1 ? 's' : ''}`}
                    </button>
                  )}
                </div>

                {/* ── Burn Card ── */}
                <div
                  className="rounded-xl p-5 flex flex-col gap-4"
                  style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(249,115,22,0.15)' }}>
                      <Flame size={18} className="text-orange-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">Burn Tokens</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Decrease total supply permanently.</p>
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

          {/* ── Security Tab ── */}
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
                      style={{ backgroundColor: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80' }}
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

      {showModal && txList.length > 0 && (
        <MintSigningModal
          txs={txList}
          onClose={() => setShowModal(false)}
          onComplete={handleMintComplete}
        />
      )}
    </div>
  )
}
