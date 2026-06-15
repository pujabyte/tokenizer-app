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
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          padding: '28px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-white font-semibold text-lg">
              {isComplete ? 'Mint Successful' : 'Sign Transactions'}
            </h2>
            {!isComplete && (
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                Step {currentIdx + 1} of {txs.length} — {txs[currentIdx].label}
              </p>
            )}
          </div>
          {!isSigning && (
            <button
              onClick={onClose}
              className="hover:text-gray-300 transition-colors"
              style={{ color: 'var(--text-muted)' }}
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
              style={{ backgroundColor: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)' }}
            >
              <Check size={30} className="text-green-400" />
            </div>

            <div className="text-center">
              <p className="text-white font-semibold">All transactions confirmed</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                Tokens have been minted on-chain
              </p>
            </div>

            <div className="w-full flex flex-col gap-2">
              {txs.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg"
                  style={{ backgroundColor: 'var(--bg-card-hover)', border: '1px solid var(--border-color)' }}
                >
                  <div className="flex items-center gap-2">
                    <Check size={12} className="text-green-400" />
                    <span className="text-sm text-white">{tx.label}</span>
                  </div>
                  <a
                    href="#"
                    className="flex items-center gap-1 text-xs font-mono hover:underline"
                    style={{ color: '#6366f1' }}
                  >
                    {MOCK_TX_HASHES[tx.id] ?? '0xmock...'}
                    <ExternalLink size={10} />
                  </a>
                </div>
              ))}
            </div>

            <button
              onClick={onComplete}
              className="w-full py-2.5 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#4f46e5' }}
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
                      backgroundColor: isActive ? 'rgba(79,70,229,0.08)' : 'var(--bg-card-hover)',
                      border: isActive
                        ? '1px solid rgba(79,70,229,0.35)'
                        : '1px solid var(--border-color)',
                    }}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{
                        backgroundColor:
                          status === 'done'
                            ? 'rgba(34,197,94,0.15)'
                            : status === 'signing'
                            ? 'rgba(79,70,229,0.2)'
                            : 'rgba(255,255,255,0.06)',
                      }}
                    >
                      {status === 'done' ? (
                        <Check size={11} className="text-green-400" />
                      ) : status === 'signing' ? (
                        <Loader2 size={11} className="text-indigo-400 animate-spin" />
                      ) : (
                        <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                          {i + 1}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p
                        className={clsx(
                          'text-sm font-medium',
                          status === 'done' ? 'line-through' : 'text-white',
                        )}
                        style={status === 'done' ? { color: 'var(--text-muted)' } : undefined}
                      >
                        {tx.label}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {tx.description}
                      </p>
                    </div>

                    {status === 'done' && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: 'rgba(34,197,94,0.1)',
                          color: '#4ade80',
                          border: '1px solid rgba(34,197,94,0.2)',
                        }}
                      >
                        Confirmed
                      </span>
                    )}
                    {status === 'signing' && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: 'rgba(79,70,229,0.15)',
                          color: '#818cf8',
                          border: '1px solid rgba(79,70,229,0.25)',
                        }}
                      >
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
              style={{ backgroundColor: 'var(--bg-card-hover)', border: '1px solid var(--border-color)' }}
            >
              <p
                className="text-xs font-semibold mb-3"
                style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}
              >
                Transaction Details
              </p>
              <div className="flex flex-col gap-2">
                {Object.entries(txs[currentIdx].details).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {k}
                    </span>
                    <span className="text-xs text-white font-mono">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Sign button ── */}
            <button
              onClick={signCurrent}
              disabled={isSigning}
              className="w-full py-2.5 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2 transition-opacity"
              style={{
                backgroundColor: isSigning ? 'rgba(79,70,229,0.4)' : '#4f46e5',
                cursor: isSigning ? 'not-allowed' : 'pointer',
              }}
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
