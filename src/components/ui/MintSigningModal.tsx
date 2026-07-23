'use client'
import { useState } from 'react'
import { X, Check, Loader2, ExternalLink } from 'lucide-react'
import clsx from 'clsx'

export interface MintTx {
  id: string
  label: string
  description: string
  details: Record<string, string>
}

interface MintSigningModalProps {
  txs: MintTx[]
  onClose: () => void
  onComplete: () => void
}

type TxStatus = 'pending' | 'signing' | 'done'

const MOCK_TX_HASHES: Record<string, string> = {
  configureMinter: '0x4e44d956f3a1...c8b2',
  whitelist: '0x3af32abf91cc...7d04',
  mint: '0x40c10f19e822...a3f1',
}

export default function MintSigningModal({ txs, onClose, onComplete }: MintSigningModalProps) {
  const [statuses, setStatuses] = useState<TxStatus[]>(txs.map(() => 'pending'))
  const [currentIdx, setCurrentIdx] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  const isSigning = statuses[currentIdx] === 'signing'

  const signCurrent = () => {
    const next = [...statuses]
    next[currentIdx] = 'signing'
    setStatuses(next)

    setTimeout(() => {
      const done = [...next]
      done[currentIdx] = 'done'
      setStatuses(done)
      if (currentIdx < txs.length - 1) {
        setCurrentIdx(currentIdx + 1)
      } else {
        setIsComplete(true)
      }
    }, 1800)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(2px)' }}
    >
      <div
        className="relative w-full rounded-2xl"
        style={{
          maxWidth: '480px',
          backgroundColor: 'var(--fk-surface-3)',
          border: '1px solid var(--glass-border)',
          padding: '28px',
          boxShadow: 'var(--el-3)',
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="font-semibold text-lg" style={{ fontFamily: 'var(--font-display)', color: 'var(--fk-text-hi)' }}>
              {isComplete ? 'Mint Successful' : 'Sign Transactions'}
            </h2>
            {!isComplete && (
              <p className="text-sm mt-1" style={{ color: 'var(--fk-text-mid)' }}>
                Step {currentIdx + 1} of {txs.length} — {txs[currentIdx].label}
              </p>
            )}
          </div>
          {!isSigning && (
            <button
              onClick={onClose}
              className="transition-colors hover:opacity-80"
              style={{ color: 'var(--fk-text-mid)' }}
              aria-label="Close"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {isComplete ? (
          /* ── Success state ── */
          <div className="flex flex-col items-center gap-5">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--fk-gain-tint)', border: '1px solid rgba(37,212,138,.25)' }}
            >
              <Check size={30} style={{ color: 'var(--fk-gain)' }} />
            </div>

            <div className="text-center">
              <p className="font-semibold" style={{ color: 'var(--fk-text-hi)' }}>All transactions confirmed</p>
              <p className="text-sm mt-1" style={{ color: 'var(--fk-text-mid)' }}>
                Tokens have been minted on-chain
              </p>
            </div>

            <div className="w-full flex flex-col gap-2">
              {txs.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg"
                  style={{ backgroundColor: 'var(--fk-surface-2)', border: '1px solid var(--glass-border)' }}
                >
                  <div className="flex items-center gap-2">
                    <Check size={12} style={{ color: 'var(--fk-gain)' }} />
                    <span className="text-sm" style={{ color: 'var(--fk-text-hi)' }}>{tx.label}</span>
                  </div>
                  <a
                    href="#"
                    className="fk-mono flex items-center gap-1 text-xs hover:underline"
                    style={{ color: 'var(--fk-blue-bright)' }}
                  >
                    {MOCK_TX_HASHES[tx.id] ?? '0xmock...'}
                    <ExternalLink size={10} />
                  </a>
                </div>
              ))}
            </div>

            <button
              onClick={onComplete}
              className="fk-btn fk-btn-primary w-full justify-center"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* ── TX Steps ── */}
            <div className="flex flex-col gap-2 mb-5">
              {txs.map((tx, i) => {
                const status = statuses[i]
                const isActive = i === currentIdx
                return (
                  <div
                    key={tx.id}
                    className="flex items-start gap-3 px-3 py-3 rounded-lg"
                    style={{
                      backgroundColor: isActive ? 'var(--fk-blue-tint)' : 'var(--fk-surface-2)',
                      border: isActive
                        ? '1px solid rgba(46,92,255,.35)'
                        : '1px solid var(--glass-border)',
                    }}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{
                        backgroundColor:
                          status === 'done'
                            ? 'var(--fk-gain-tint)'
                            : status === 'signing'
                            ? 'var(--fk-blue-tint)'
                            : 'rgba(255,255,255,0.06)',
                      }}
                    >
                      {status === 'done' ? (
                        <Check size={11} style={{ color: 'var(--fk-gain)' }} />
                      ) : status === 'signing' ? (
                        <Loader2 size={11} className="animate-spin" style={{ color: 'var(--fk-blue-bright)' }} />
                      ) : (
                        <span className="text-xs font-semibold" style={{ color: 'var(--fk-text-mid)' }}>
                          {i + 1}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p
                        className={clsx('text-sm font-medium', status === 'done' && 'line-through')}
                        style={{ color: status === 'done' ? 'var(--fk-text-mid)' : 'var(--fk-text-hi)' }}
                      >
                        {tx.label}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--fk-text-mid)' }}>
                        {tx.description}
                      </p>
                    </div>

                    {status === 'done' && (
                      <span className="fk-badge fk-badge-gain flex-shrink-0">
                        Confirmed
                      </span>
                    )}
                    {status === 'signing' && (
                      <span className="fk-badge fk-badge-brand flex-shrink-0">
                        Pending...
                      </span>
                    )}
                  </div>
                )
              })}
            </div>

            {/* ── Current TX details ── */}
            <div
              className="rounded-lg p-4 mb-5"
              style={{ backgroundColor: 'var(--fk-surface-2)', border: '1px solid var(--glass-border)' }}
            >
              <p
                className="text-xs font-semibold mb-3"
                style={{ color: 'var(--fk-text-low)', textTransform: 'uppercase', letterSpacing: '0.08em' }}
              >
                Transaction Details
              </p>
              <div className="flex flex-col gap-2">
                {Object.entries(txs[currentIdx].details).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-3">
                    <span className="text-xs flex-shrink-0" style={{ color: 'var(--fk-text-mid)' }}>
                      {k}
                    </span>
                    <span className="fk-mono text-xs text-right" style={{ color: 'var(--fk-text-hi)' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Sign button ── */}
            <button
              onClick={signCurrent}
              disabled={isSigning}
              className="fk-btn fk-btn-primary w-full justify-center"
              style={isSigning ? { opacity: .6, cursor: 'not-allowed', transform: 'none', boxShadow: 'none' } : undefined}
            >
              {isSigning ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Waiting for confirmation...
                </>
              ) : (
                `Sign Transaction ${currentIdx + 1} of ${txs.length}`
              )}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
