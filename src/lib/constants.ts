/**
 * Shared vocabulary. These lived inside route files, which Next.js forbids
 * exporting non-route values from — and worse, the history route and the
 * history UI each had their own list, so the filter pills matched nothing.
 */

export const EXECUTION_MODES = ['manual-lp', 'pancake-api', 'direct-swap'] as const
export type ExecutionMode = (typeof EXECUTION_MODES)[number]

export const EXECUTION_MODE_LABELS: Record<ExecutionMode, string> = {
  'manual-lp': 'Manual LP',
  'pancake-api': 'PancakeSwap API',
  'direct-swap': 'Direct Swap',
}

export const TX_STATUSES = ['success', 'pending', 'failed', 'reverted'] as const
export type TxStatus = (typeof TX_STATUSES)[number]

export const TX_STATUS_LABELS: Record<TxStatus, string> = {
  success: 'Success',
  pending: 'Pending',
  failed: 'Failed',
  reverted: 'Reverted',
}

/** Maps a status to a .fk-badge modifier. `pending` must not read as success. */
export const TX_STATUS_BADGE: Record<TxStatus, string> = {
  success: 'fk-badge-gain',
  pending: 'fk-badge-warn',
  failed: 'fk-badge-loss',
  reverted: 'fk-badge-loss',
}

export const BLOCK_EXPLORER = 'https://polygonscan.com/tx/'

/* ── Manual settlement ──────────────────────────────────────────────────
   Tokens with executionMode 'manual-lp' (RWA) do not route to a DEX. The
   user transfers fiat to us, a reviewer confirms, and only then do tokens
   move — so the order has a lifecycle the instant-swap path never needs. */

export const MANUAL_ORDER_STATUSES = [
  'awaiting_payment', // buy: waiting for the user's bank transfer
  'payment_review',   // buy: transfer declared, reviewer verifying
  'on_hold',          // sell: user's tokens locked, awaiting reviewer
  'payout_review',    // sell: reviewer verified, fiat payout in flight
  'settled',
  'rejected',
  'cancelled',
  'expired',
] as const
export type ManualOrderStatus = (typeof MANUAL_ORDER_STATUSES)[number]

/** How long a buy order's payment window stays open. */
export const PAYMENT_WINDOW_MINUTES = 120

type FlowStep = { status: ManualOrderStatus; label: string; hint: string }

export const MANUAL_BUY_FLOW: FlowStep[] = [
  { status: 'awaiting_payment', label: 'Transfer funds', hint: 'Send the exact amount using your order reference.' },
  { status: 'payment_review', label: 'We confirm receipt', hint: 'Our team matches your transfer, usually within 1 business day.' },
  { status: 'settled', label: 'Tokens delivered', hint: 'Tokens are released to your wallet.' },
]

export const MANUAL_SELL_FLOW: FlowStep[] = [
  { status: 'on_hold', label: 'Tokens on hold', hint: 'Your tokens are locked while we verify the redemption.' },
  { status: 'payout_review', label: 'Payout initiated', hint: 'We wire the proceeds to your registered bank account.' },
  { status: 'settled', label: 'Funds sent', hint: 'Payout complete and the hold is released.' },
]

/** Badge modifier per order status — pending states must not read as success. */
export const MANUAL_ORDER_BADGE: Record<ManualOrderStatus, string> = {
  awaiting_payment: 'fk-badge-warn',
  payment_review: 'fk-badge-info',
  on_hold: 'fk-badge-warn',
  payout_review: 'fk-badge-info',
  settled: 'fk-badge-gain',
  rejected: 'fk-badge-loss',
  cancelled: 'fk-badge-neutral',
  expired: 'fk-badge-neutral',
}

export const MANUAL_ORDER_LABELS: Record<ManualOrderStatus, string> = {
  awaiting_payment: 'Awaiting payment',
  payment_review: 'Confirming payment',
  on_hold: 'On hold',
  payout_review: 'Payout in progress',
  settled: 'Settled',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
  expired: 'Expired',
}

export const KYC_STATUSES = [
  'unverified', 'pending_kyc', 'pending_kyb', 'more_info_required',
  'rejected', 'expired', 'kyc_approved', 'kyc_kyb_approved', 'whitelisted',
] as const
export type KycStatus = (typeof KYC_STATUSES)[number]

export const APPROVED_KYC_STATUSES: KycStatus[] = ['kyc_approved', 'kyc_kyb_approved', 'whitelisted']

export const SESSION_COOKIE = 'fk_investor_session'
