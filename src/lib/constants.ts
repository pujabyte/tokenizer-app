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

export const KYC_STATUSES = [
  'unverified', 'pending_kyc', 'pending_kyb', 'more_info_required',
  'rejected', 'expired', 'kyc_approved', 'kyc_kyb_approved', 'whitelisted',
] as const
export type KycStatus = (typeof KYC_STATUSES)[number]

export const APPROVED_KYC_STATUSES: KycStatus[] = ['kyc_approved', 'kyc_kyb_approved', 'whitelisted']

export const SESSION_COOKIE = 'fk_investor_session'
