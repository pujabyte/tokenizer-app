'use client'
import { useEffect, useState } from 'react'
import { AlertTriangle, Check, Copy, Landmark, Lock } from 'lucide-react'
import { MANUAL_ORDER_BADGE, MANUAL_ORDER_LABELS, type ManualOrderStatus } from '@/lib/constants'
import { formatMoney, formatQty } from '@/lib/format'

export type ManualOrder = {
  id: string
  reference: string
  symbol: string
  name: string
  side: 'buy' | 'sell'
  qty: number
  amountUsd: number
  feeUsd: number
  status: ManualOrderStatus
  expiresAt: string | null
  settledAt: string | null
  rejectionReason: string | null
  isOpen: boolean
  stepIndex: number
  flow: { status: ManualOrderStatus; label: string; hint: string }[]
  instruction: {
    kind: 'bank_transfer' | 'payout'
    heading: string
    account: Record<string, string>
    amountUsd: number
    reference: string
    expiresAt: string | null
    notes: string[]
  }
}

/** Copy-to-clipboard field. Bank details are useless if they can't be copied
 *  exactly — a mistyped reference is what breaks reconciliation. */
function CopyField({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const t = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(t)
  }, [copied])

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--fk-text-mid)' }}>{label}</span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        <span
          className={`fk-truncate${mono ? ' fk-mono' : ''}`}
          style={{ fontSize: 'var(--fs-sm)', color: 'var(--fk-text-hi)' }}
        >
          {value}
        </span>
        <button
          type="button"
          aria-label={`Copy ${label}`}
          onClick={() => { navigator.clipboard?.writeText(value); setCopied(true) }}
          style={{
            display: 'flex', flexShrink: 0, padding: 4, borderRadius: 'var(--r-sm)',
            background: 'transparent', border: 'none',
            color: copied ? 'var(--fk-gain)' : 'var(--fk-text-low)',
          }}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
        </button>
      </span>
    </div>
  )
}

/** Remaining payment window. A static "expires at" timestamp does not convey
 *  urgency the way a live countdown does. */
function Countdown({ iso }: { iso: string }) {
  const [left, setLeft] = useState(() => new Date(iso).getTime() - Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setLeft(new Date(iso).getTime() - Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [iso])

  if (left <= 0) return <span style={{ color: 'var(--fk-loss)' }}>Payment window closed</span>

  const mins = Math.floor(left / 60000)
  const secs = Math.floor((left % 60000) / 1000)
  return (
    <span className="fk-mono" style={{ color: mins < 15 ? 'var(--fk-warn)' : 'var(--fk-text-hi)' }}>
      {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')} left
    </span>
  )
}

function Stepper({ flow, current }: { flow: ManualOrder['flow']; current: number }) {
  return (
    <ol style={{ display: 'grid', gap: 12, listStyle: 'none', margin: 0, padding: 0 }}>
      {flow.map((step, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={step.status} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span
              aria-hidden="true"
              className="fk-mono"
              style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700,
                background: done ? 'var(--fk-gain-tint)' : active ? 'var(--fk-blue-tint)' : 'var(--fk-surface-3)',
                color: done ? 'var(--fk-gain)' : active ? 'var(--fk-blue-bright)' : 'var(--fk-text-low)',
                border: active ? '1px solid var(--fk-blue)' : '1px solid transparent',
              }}
            >
              {done ? <Check size={12} /> : i + 1}
            </span>
            <span style={{ minWidth: 0 }}>
              <span
                style={{
                  display: 'block', fontSize: 'var(--fs-sm)', fontWeight: active ? 600 : 500,
                  color: active || done ? 'var(--fk-text-hi)' : 'var(--fk-text-mid)',
                }}
              >
                {step.label}
              </span>
              {active && (
                <span style={{ display: 'block', fontSize: 'var(--fs-xs)', color: 'var(--fk-text-mid)', marginTop: 2, lineHeight: 1.5 }}>
                  {step.hint}
                </span>
              )}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

const ACCOUNT_LABELS: Record<string, string> = {
  bankName: 'Bank',
  accountName: 'Account name',
  accountNumber: 'Account number',
  accountNumberMasked: 'Account number',
  swift: 'SWIFT',
  currency: 'Currency',
}

export function ManualOrderPanel({ order }: { order: ManualOrder }) {
  const isBuy = order.side === 'buy'
  const { instruction } = order

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      {/* Status + reference */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <span className={`fk-badge ${MANUAL_ORDER_BADGE[order.status]}`}>
          <span className="fk-dot" aria-hidden="true" />
          {MANUAL_ORDER_LABELS[order.status]}
        </span>
        <span className="fk-mono" style={{ fontSize: 'var(--fs-xs)', color: 'var(--fk-text-low)' }}>
          {order.reference}
        </span>
      </div>

      {order.status === 'rejected' && order.rejectionReason && (
        <div className="fk-alert fk-alert-loss">
          <AlertTriangle size={16} style={{ flexShrink: 0 }} aria-hidden="true" />
          <div>
            <b>Order rejected</b>
            <p>{order.rejectionReason}</p>
          </div>
        </div>
      )}

      <Stepper flow={order.flow} current={order.stepIndex} />

      {/* Order figures */}
      <div style={{ display: 'grid', gap: 10, padding: 16, background: 'var(--fk-surface-1)', borderRadius: 'var(--r-md)', border: '1px solid var(--fk-line)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--fk-text-mid)' }}>{isBuy ? 'You receive' : 'You sell'}</span>
          <span className="fk-mono" style={{ fontSize: 'var(--fs-sm)', color: 'var(--fk-text-hi)' }}>
            {formatQty(order.qty)} {order.symbol}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--fk-text-mid)' }}>
            {isBuy ? 'Amount to transfer' : 'Payout amount'}
          </span>
          <span className="fk-mono" style={{ fontSize: 'var(--fs-card-title)', fontWeight: 700, color: 'var(--fk-text-hi)' }}>
            {formatMoney(order.amountUsd, { symbol: '$' })}
          </span>
        </div>
        {instruction.expiresAt && order.isOpen && (
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, paddingTop: 10, borderTop: '1px dashed var(--fk-line)' }}>
            <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--fk-text-mid)' }}>Payment window</span>
            <span style={{ fontSize: 'var(--fs-sm)' }}><Countdown iso={instruction.expiresAt} /></span>
          </div>
        )}
      </div>

      {/* Bank details / hold notice. Hidden once the order reaches a terminal
          state — "transfer the exact amount" on a settled order reads as a
          second payment request. */}
      {order.isOpen && (
      <div>
        <p style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--fk-text-hi)', marginBottom: 12 }}>
          {isBuy ? <Landmark size={15} aria-hidden="true" /> : <Lock size={15} aria-hidden="true" />}
          {instruction.heading}
        </p>
        <div style={{ display: 'grid', gap: 10, padding: 16, background: 'var(--fk-surface-1)', borderRadius: 'var(--r-md)', border: '1px solid var(--fk-line)' }}>
          {Object.entries(instruction.account).map(([key, value]) => (
            <CopyField key={key} label={ACCOUNT_LABELS[key] ?? key} value={value} mono={key !== 'bankName' && key !== 'accountName'} />
          ))}
          {isBuy && (
            <>
              <div style={{ height: 1, background: 'var(--fk-line)' }} />
              <CopyField label="Amount" value={formatMoney(instruction.amountUsd, { symbol: '$' })} />
              <CopyField label="Reference" value={instruction.reference} />
            </>
          )}
        </div>
      </div>
      )}

      {order.isOpen && (
      <ul style={{ display: 'grid', gap: 8, listStyle: 'none', margin: 0, padding: 0 }}>
        {instruction.notes.map(note => (
          <li key={note} style={{ display: 'flex', gap: 8, fontSize: 'var(--fs-xs)', color: 'var(--fk-text-mid)', lineHeight: 1.6 }}>
            <span aria-hidden="true" style={{ color: 'var(--fk-text-low)' }}>·</span>
            {note}
          </li>
        ))}
      </ul>
      )}
    </div>
  )
}
