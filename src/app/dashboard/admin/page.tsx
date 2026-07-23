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
      <div className="absolute left-0 top-1/2 -translate-y-1/2" style={{ width: '1px', height: '20px', backgroundColor: 'var(--fk-line)' }} />

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 pl-3 pr-2 h-full text-sm font-medium transition-colors hover:opacity-80"
        style={{ color: 'var(--fk-text-mid)', minWidth: '80px' }}
      >
        {selected.label}
        <ChevronDown size={12} className={clsx('transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 rounded-lg overflow-hidden z-50"
          style={{
            backgroundColor: 'var(--fk-surface-3)',
            border: '1px solid var(--glass-border)',
            boxShadow: 'var(--el-3)',
            minWidth: '100px',
          }}
        >
          {SCALE_OPTIONS.map(opt => (
            <button
              key={opt.exp}
              type="button"
              onClick={() => { onChange(opt.exp); setOpen(false) }}
              className="w-full flex items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-white/[0.05]"
              style={{ color: opt.exp === value ? 'var(--fk-blue-soft)' : 'var(--fk-text-mid)' }}
            >
              {opt.label}
              {opt.exp === value && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--fk-blue-soft)' }} />}
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
        backgroundColor: 'var(--fk-surface-1)',
        border: '1px solid var(--glass-border)',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,.3)',
        borderRadius: 'var(--r-md)',
        height: '42px',
      }}
    >
      <input
        type="number"
        value={base}
        onChange={e => onBaseChange(e.target.value)}
        placeholder={placeholder}
        className="fk-mono flex-1 px-4 text-sm bg-transparent border-none outline-none min-w-0"
        style={{
          height: '100%',
          minWidth: 0,
          color: 'var(--fk-text-hi)',
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
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, letterSpacing: '-.01em', color: 'var(--fk-text-hi)' }}>Smart Contract Admin</h1>
        <p style={{ fontSize: '15px', color: 'var(--fk-text-mid)', marginTop: '4px' }}>
          Manage supply, permissions, and security for your assets.
        </p>
      </div>

      {/* ── Prototype Controls ── */}
      <div
        className="rounded-xl p-4"
        style={{ backgroundColor: 'var(--fk-warn-tint)', border: '1px solid rgba(255,194,77,.25)' }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Info size={14} style={{ color: 'var(--fk-warn)', flexShrink: 0 }} />
          <span className="fk-mono text-xs font-semibold" style={{ color: 'var(--fk-warn)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
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
                backgroundColor: activeScenario === i ? 'rgba(255,194,77,.15)' : 'rgba(255,255,255,0.04)',
                border: activeScenario === i ? '1px solid rgba(255,194,77,.4)' : '1px solid var(--fk-line)',
                color: activeScenario === i ? 'var(--fk-warn)' : 'var(--fk-text-mid)',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="flex gap-4 mt-3">
          <span className="text-xs" style={{ color: 'var(--fk-text-mid)' }}>
            Minting Allowance: <span className="fk-mono" style={{ color: 'var(--fk-text-hi)' }}>{scenario.minterAllowance.toLocaleString()}</span>
          </span>
          <span className="text-xs" style={{ color: 'var(--fk-text-mid)' }}>
            Remaining Supply: <span className="fk-mono" style={{ color: 'var(--fk-text-hi)' }}>{scenario.remainingSupply.toLocaleString()}</span>
          </span>
          <span className="text-xs" style={{ color: 'var(--fk-text-mid)' }}>
            Token Type: <span style={{ color: 'var(--fk-text-hi)' }}>{scenario.isWhitelistedToken ? 'Whitelisted' : 'Public'}</span>
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="fk-card">
        <div style={{ padding: '24px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 600, color: 'var(--fk-text-hi)', marginBottom: '6px' }}>Select Asset Contract</h3>
          <p style={{ fontSize: '14px', color: 'var(--fk-text-mid)' }}>To set supply, security and audit you need to select token first.</p>
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
            style={{ backgroundColor: 'var(--fk-surface-1)', border: '1px solid var(--glass-border)' }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
              style={{ backgroundColor: 'var(--fk-surface-3)', color: 'var(--fk-text-hi)' }}
            >
              {selectedToken.initials}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="fk-mono text-xs font-semibold tracking-widest" style={{ color: 'var(--fk-text-low)' }}>CONTRACT ADDRESS</span>
                <span className="fk-badge fk-badge-info">
                  BNB Chain Testnet
                </span>
                <span
                  className="fk-badge"
                  style={{
                    backgroundColor: scenario.isWhitelistedToken ? 'rgba(156,123,245,.12)' : 'rgba(255,255,255,0.05)',
                    border: scenario.isWhitelistedToken ? '1px solid rgba(156,123,245,.3)' : '1px solid var(--fk-line)',
                    color: scenario.isWhitelistedToken ? 'var(--fk-cat-4)' : 'var(--fk-text-mid)',
                  }}
                >
                  {scenario.isWhitelistedToken ? 'Whitelisted' : 'Transferable'}
                </span>
              </div>
              <p className="fk-mono text-sm" style={{ color: 'var(--fk-text-hi)' }}>{selectedToken.contractAddress}</p>
            </div>
            <a href="#" className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg transition-colors hover:bg-white/[0.05]" style={{ color: 'var(--fk-text-mid)', border: '1px solid var(--fk-line)' }}>
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
                  backgroundColor: activeTab === tab ? 'var(--fk-surface-1)' : 'transparent',
                  border: activeTab === tab ? '1px solid var(--glass-border)' : '1px solid transparent',
                  color: activeTab === tab ? 'var(--fk-text-hi)' : 'var(--fk-text-mid)',
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
              <div className="fk-alert fk-alert-warn items-center">
                <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                <div className="flex-1">
                  <b>Your wallet has 0 tBNB on this network.</b>
                  <p>Mint and burn transactions need tBNB to pay gas. Fund the wallet to continue.</p>
                </div>
                <button className="fk-btn fk-btn-secondary flex-shrink-0" style={{ padding: '8px 16px', fontSize: '13px' }}>
                  Fund wallet
                </button>
              </div>

              {/* Mint + Burn grid */}
              <div className="grid grid-cols-2 gap-4 items-start">

                {/* ── Mint Card ── */}
                <div className="fk-card p-5 flex flex-col gap-4">
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--fk-soft-tint)' }}>
                      <Plus size={18} style={{ color: 'var(--fk-blue-soft)' }} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: 'var(--fk-text-hi)' }}>Mint Tokens</p>
                      <p className="text-xs" style={{ color: 'var(--fk-text-mid)' }}>Increase total supply. Requires multi-sig (mock).</p>
                    </div>
                  </div>

                  {/* Max Supply & Minting Allowance row */}
                  <div className="flex items-center justify-between text-sm" style={{ borderBottom: '1px solid var(--fk-line-soft)', paddingBottom: '12px' }}>
                    <span style={{ color: 'var(--fk-text-mid)' }}>Max Supply:</span>
                    <span className="fk-mono font-medium" style={{ color: 'var(--fk-text-hi)' }}>{scenario.maxSupply.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm" style={{ marginTop: '-8px' }}>
                    <span style={{ color: 'var(--fk-text-mid)' }}>Minting Allowance:</span>
                    <span
                      className="fk-mono font-medium"
                      style={{ color: scenario.minterAllowance === 0 ? 'var(--fk-loss)' : 'var(--fk-gain)' }}
                    >
                      {scenario.minterAllowance.toLocaleString()}
                    </span>
                  </div>

                  {/* ── Allowance input — only when insufficient ── */}
                  {needsConfigMinter && (
                    <div
                      className="flex flex-col gap-3 p-3 rounded-lg"
                      style={{ backgroundColor: 'var(--fk-blue-tint)', border: '1px solid rgba(46,92,255,.2)' }}
                    >
                      {/* Header */}
                      <div className="flex items-start gap-2">
                        <div
                          className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ backgroundColor: 'var(--fk-soft-tint)' }}
                        >
                          <span className="fk-mono" style={{ fontSize: '10px', color: 'var(--fk-blue-soft)', fontWeight: 700 }}>!</span>
                        </div>
                        <div>
                          <p className="text-xs font-semibold" style={{ color: 'var(--fk-blue-soft)' }}>
                            Minting Permission Required
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--fk-blue-bright)', lineHeight: 1.5 }}>
                            Before minting, your wallet needs a spending limit. Set how much you want to authorize in one go.
                          </p>
                        </div>
                      </div>

                      {/* Input */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-medium" style={{ color: 'var(--fk-text-mid)' }}>
                            Allowance Amount
                          </label>
                          {allowanceFilled && allowanceWarning && (
                            <span className="text-xs" style={{ color: 'var(--fk-loss)' }}>must be ≥ mint amount</span>
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
                          <p className="text-xs" style={{ color: 'var(--fk-text-mid)' }}>
                            Will authorize up to <span className="fk-mono" style={{ color: 'var(--fk-text-hi)' }}>{parsedAllowance.toLocaleString()}</span> tokens
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ── Amount to Mint ── */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium" style={{ color: 'var(--fk-text-mid)' }}>
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
                      <p className="fk-mono text-xs" style={{ color: 'var(--fk-text-mid)' }}>
                        = {parsedMint.toLocaleString()} tokens
                      </p>
                    )}
                    <div
                      className="flex items-center gap-2 px-3 py-2 rounded-lg"
                      style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid var(--fk-line)' }}
                    >
                      <span className="text-xs font-medium" style={{ color: 'var(--fk-text-mid)', flexShrink: 0 }}>Recipient</span>
                      <span className="fk-mono flex-1 text-xs" style={{ color: 'var(--fk-text-hi)' }}>{truncate(OWNER_WALLET)}</span>
                      <span className="fk-badge fk-badge-brand" style={{ fontSize: '10px' }}>
                        You
                      </span>
                    </div>
                  </div>

                  {/* ── Pre-flight checks ── */}
                  {parsedMint > 0 && (
                    <div
                      className="flex flex-col gap-2 p-3 rounded-lg"
                      style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--fk-line)' }}
                    >
                      <p className="text-xs font-semibold mb-1" style={{ color: 'var(--fk-text-low)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                        Pre-flight
                      </p>

                      {/* Supply check */}
                      <div className="flex items-center gap-2">
                        {supplyZero
                          ? <XCircle size={13} style={{ color: 'var(--fk-loss)', flexShrink: 0 }} />
                          : <CheckCircle2 size={13} style={{ color: 'var(--fk-gain)', flexShrink: 0 }} />
                        }
                        <span className="text-xs" style={{ color: supplyZero ? 'var(--fk-loss)' : 'var(--fk-text-mid)' }}>
                          {supplyZero
                            ? 'Max supply reached — minting blocked'
                            : `Remaining supply: ${scenario.remainingSupply.toLocaleString()}`}
                        </span>
                      </div>

                      {/* Allowance check */}
                      {!supplyZero && (
                        <div className="flex items-start gap-2">
                          {needsConfigMinter
                            ? <XCircle size={13} style={{ color: 'var(--fk-warn)', flexShrink: 0, marginTop: '2px' }} />
                            : <CheckCircle2 size={13} style={{ color: 'var(--fk-gain)', flexShrink: 0, marginTop: '2px' }} />
                          }
                          <span className="text-xs" style={{ color: needsConfigMinter ? 'var(--fk-warn)' : 'var(--fk-text-mid)' }}>
                            {needsConfigMinter
                              ? `Allowance ${scenario.minterAllowance.toLocaleString()} < ${parsedMint.toLocaleString()} — set allowance above`
                              : 'Minting allowance sufficient'}
                          </span>
                        </div>
                      )}

                      {/* Whitelist check */}
                      {!supplyZero && scenario.isWhitelistedToken && (
                        <div className="flex items-center gap-2">
                          <XCircle size={13} style={{ color: 'var(--fk-warn)', flexShrink: 0 }} />
                          <span className="text-xs" style={{ color: 'var(--fk-warn)' }}>Whitelisted token — will add your address to whitelist</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── TX badge strip ── */}
                  {canMint && txList.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {txList.map((tx, i) => (
                        <span key={tx.id} className="flex items-center gap-1">
                          {i > 0 && <span className="text-xs" style={{ color: 'var(--fk-text-mid)' }}>→</span>}
                          <span className="fk-badge fk-badge-brand">
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
                      style={{ backgroundColor: 'var(--fk-loss-tint)', border: '1px solid rgba(255,92,110,.25)', color: 'var(--fk-loss)' }}
                    >
                      Minting Unavailable — Max Supply Reached
                    </div>
                  ) : (
                    <button
                      onClick={() => canMint && setShowModal(true)}
                      disabled={!canMint}
                      className={clsx('fk-btn w-full justify-center', canMint ? 'fk-btn-primary' : '')}
                      style={!canMint ? {
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        color: 'var(--fk-text-mid)',
                        border: '1px solid var(--fk-line)',
                        cursor: 'not-allowed',
                      } : undefined}
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
                <div className="fk-card p-5 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(217,142,107,.15)' }}>
                      <Flame size={18} style={{ color: 'var(--fk-cat-6)' }} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: 'var(--fk-text-hi)' }}>Burn Tokens</p>
                      <p className="text-xs" style={{ color: 'var(--fk-text-mid)' }}>Decrease total supply permanently.</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs mb-1.5 block" style={{ color: 'var(--fk-text-mid)' }}>Amount to Burn</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="fk-input fk-mono w-full"
                      disabled
                    />
                  </div>
                  <button
                    className="w-full py-2.5 rounded-lg text-sm font-medium cursor-not-allowed mt-auto"
                    style={{ backgroundColor: 'var(--fk-loss-tint)', border: '1px solid rgba(255,92,110,.25)', color: 'var(--fk-text-low)' }}
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
            <div className="fk-card flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm" style={{ color: 'var(--fk-text-hi)' }}>Emergency Control</p>
                    <span className="fk-badge fk-badge-gain">
                      Operational
                    </span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--fk-text-mid)' }}>
                    Only Contract owner or assigned guardians can initiate this pause.
                  </p>
                </div>
              </div>
              <button className="fk-btn fk-btn-danger">
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
