import { NextResponse } from 'next/server'
import { ASSETS_DB } from '../tokens/data'
import {
  MANUAL_BUY_FLOW, MANUAL_SELL_FLOW, PAYMENT_WINDOW_MINUTES,
  type ManualOrderStatus,
} from '@/lib/constants'

/**
 * Manual-settlement orders — the off-chain path for tokens whose
 * `executionMode` is `manual-lp` (RWA). DEX-executed tokens never come here.
 *
 * Buy:  awaiting_payment → payment_review → settled   (admin releases tokens)
 * Sell: on_hold          → payout_review  → settled   (admin wires fiat)
 *
 * In-memory store — a mockup. Orders reset when the dev server restarts.
 */

type ManualOrder = {
  id: string
  reference: string
  tokenId: string
  symbol: string
  name: string
  side: 'buy' | 'sell'
  qty: number
  pricePerToken: number
  amountUsd: number
  feeUsd: number
  status: ManualOrderStatus
  createdAt: string
  expiresAt: string | null
  settledAt: string | null
  /** Set once the reviewer rejects, so the UI can explain why. */
  rejectionReason: string | null
}

const ORDERS = new Map<string, ManualOrder>()
let sequence = 1000

// Frakta's collection account. Static on purpose — a real system issues a
// virtual account per order so incoming transfers reconcile automatically.
const COLLECTION_ACCOUNT = {
  bankName: 'DBS Bank Singapore',
  accountName: 'Frakta Custody Pte Ltd',
  accountNumber: '072-901-4455',
  swift: 'DBSSSGSG',
  currency: 'USD',
}

const PAYOUT_ACCOUNT = {
  bankName: 'Bank Central Asia',
  accountName: 'Registered account holder',
  accountNumberMasked: '••••  ••••  4471',
  currency: 'IDR',
}

function nextReference(side: 'buy' | 'sell') {
  return `FRK-${side === 'buy' ? 'B' : 'S'}${sequence}`
}

/** Buy needs a payment window; sell holds the balance until the admin pays out. */
function instructionFor(order: ManualOrder) {
  if (order.side === 'buy') {
    return {
      kind: 'bank_transfer' as const,
      heading: 'Transfer the exact amount below',
      account: COLLECTION_ACCOUNT,
      amountUsd: order.amountUsd,
      // The reference ties an incoming transfer to this order — without it
      // reconciliation is manual guesswork.
      reference: order.reference,
      expiresAt: order.expiresAt,
      notes: [
        `Include the reference ${order.reference} in the transfer description.`,
        'Transfer the exact amount — a partial or rounded amount delays settlement.',
        'Tokens are released to your wallet once our team confirms receipt, usually within 1 business day.',
      ],
    }
  }
  return {
    kind: 'payout' as const,
    heading: 'Your tokens are on hold',
    account: PAYOUT_ACCOUNT,
    amountUsd: order.amountUsd,
    reference: order.reference,
    expiresAt: null,
    notes: [
      `${order.qty} ${order.symbol} is locked and cannot be traded while this order is open.`,
      'Our team verifies the redemption, then wires the proceeds to your registered bank account.',
      'Cancel any time before the payout is initiated to release the hold.',
    ],
  }
}

function serialize(order: ManualOrder) {
  const flow = order.side === 'buy' ? MANUAL_BUY_FLOW : MANUAL_SELL_FLOW
  return {
    ...order,
    instruction: instructionFor(order),
    flow,
    stepIndex: Math.max(flow.findIndex(s => s.status === order.status), 0),
    // Terminal states must not offer "I have paid" / "Cancel" actions.
    isOpen: !['settled', 'cancelled', 'expired', 'rejected'].includes(order.status),
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    if (searchParams.get('fail') === '1') {
      return NextResponse.json({ error: 'Order service unavailable' }, { status: 503 })
    }

    const id = searchParams.get('id')
    if (id) {
      const order = ORDERS.get(id)
      if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      return NextResponse.json(serialize(order))
    }

    const orders = [...ORDERS.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    return NextResponse.json({ orders: orders.map(serialize) })
  } catch {
    return NextResponse.json({ error: 'Failed to load orders' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'CREATE') {
      const { tokenId, side, qty } = body
      const token = ASSETS_DB.find(t => t.id === tokenId)

      if (!token) {
        return NextResponse.json({ error: 'Token not found', code: 'TOKEN_NOT_FOUND' }, { status: 404 })
      }
      // Defensive: only manual-settlement tokens belong on this endpoint.
      if (token.category !== 'RWA') {
        return NextResponse.json(
          { error: 'This token settles on-chain and does not use manual orders', code: 'NOT_MANUAL' },
          { status: 400 }
        )
      }

      const quantity = Number(qty)
      if (!Number.isFinite(quantity) || quantity <= 0) {
        return NextResponse.json({ error: 'Enter a valid quantity', code: 'INVALID_QTY' }, { status: 400 })
      }
      if (token.priceUsd === null) {
        return NextResponse.json({ error: 'This token is not priced yet', code: 'NOT_PRICED' }, { status: 400 })
      }
      if (side === 'buy' && token.soldOut) {
        return NextResponse.json({ error: 'This offering is fully subscribed', code: 'SOLD_OUT' }, { status: 409 })
      }

      const isSell = side === 'sell'
      const gross = quantity * token.priceUsd
      const fee = gross * 0.0015
      const now = new Date()

      sequence += 1
      const order: ManualOrder = {
        id: `ord-${sequence}`,
        reference: nextReference(isSell ? 'sell' : 'buy'),
        tokenId: token.id,
        symbol: token.symbol,
        name: token.name,
        side: isSell ? 'sell' : 'buy',
        qty: quantity,
        pricePerToken: token.priceUsd,
        amountUsd: Number((isSell ? gross - fee : gross + fee).toFixed(2)),
        feeUsd: Number(fee.toFixed(2)),
        status: isSell ? 'on_hold' : 'awaiting_payment',
        createdAt: now.toISOString(),
        expiresAt: isSell
          ? null
          : new Date(now.getTime() + PAYMENT_WINDOW_MINUTES * 60 * 1000).toISOString(),
        settledAt: null,
        rejectionReason: null,
      }
      ORDERS.set(order.id, order)
      return NextResponse.json(serialize(order), { status: 201 })
    }

    // ── Order transitions ───────────────────────────────────────────────
    const order = ORDERS.get(body.orderId)
    if (!order) {
      return NextResponse.json({ error: 'Order not found', code: 'ORDER_NOT_FOUND' }, { status: 404 })
    }

    const move = (status: ManualOrderStatus, patch: Partial<ManualOrder> = {}) => {
      const next = { ...order, status, ...patch }
      ORDERS.set(order.id, next)
      return NextResponse.json(serialize(next))
    }

    switch (action) {
      // User declares the bank transfer is done; it now sits with a reviewer.
      case 'MARK_PAID':
        if (order.side !== 'buy' || order.status !== 'awaiting_payment') {
          return NextResponse.json({ error: 'Order is not awaiting payment', code: 'BAD_STATE' }, { status: 409 })
        }
        return move('payment_review')

      case 'CANCEL':
        if (order.status === 'settled') {
          return NextResponse.json({ error: 'Settled orders cannot be cancelled', code: 'BAD_STATE' }, { status: 409 })
        }
        return move('cancelled')

      // ── Reviewer simulation (mock only) ──
      case 'ADMIN_SETTLE':
        return move('settled', { settledAt: new Date().toISOString() })

      case 'ADMIN_START_PAYOUT':
        if (order.side !== 'sell') {
          return NextResponse.json({ error: 'Payout applies to sell orders', code: 'BAD_STATE' }, { status: 409 })
        }
        return move('payout_review')

      case 'ADMIN_REJECT':
        return move('rejected', {
          rejectionReason: typeof body.reason === 'string' && body.reason
            ? body.reason
            : 'We could not match an incoming transfer to this reference.',
        })

      default:
        return NextResponse.json({ error: 'Invalid action', code: 'INVALID_ACTION' }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: 'Failed to process order' }, { status: 500 })
  }
}
