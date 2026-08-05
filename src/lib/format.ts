/**
 * Shared formatting. Previously each page re-parsed display strings and
 * re-invented its own rules, which produced disagreeing numbers on one screen
 * (0.00% shown as a gain, £ treated as $, NaN from empty inputs).
 */

export type Trend = 'up' | 'down' | 'flat' | null

export const EM_DASH = '—'

/** 0 is `flat`, not a gain. Null/undefined stays null so the UI can show a dash. */
export function trendOf(value: number | null | undefined): Trend {
  if (value === null || value === undefined || !Number.isFinite(value)) return null
  if (value > 0) return 'up'
  if (value < 0) return 'down'
  return 'flat'
}

export function trendColor(trend: Trend) {
  if (trend === 'up') return 'var(--fk-gain)'
  if (trend === 'down') return 'var(--fk-loss)'
  return 'var(--fk-neutral)'
}

export function trendTint(trend: Trend) {
  if (trend === 'up') return 'var(--fk-gain-tint)'
  if (trend === 'down') return 'var(--fk-loss-tint)'
  return 'var(--fk-neutral-tint)'
}

export function trendBadgeClass(trend: Trend) {
  if (trend === 'up') return 'fk-badge fk-badge-gain'
  if (trend === 'down') return 'fk-badge fk-badge-loss'
  return 'fk-badge fk-badge-neutral'
}

/** '▲' / '▼' / '' — never a hardcoded up arrow. */
export function trendArrow(trend: Trend) {
  if (trend === 'up') return '▲'
  if (trend === 'down') return '▼'
  return ''
}

/** '+1.25%' / '-0.45%' / '0.00%' / '—' */
export function formatPct(value: number | null | undefined, digits = 2) {
  if (value === null || value === undefined || !Number.isFinite(value)) return EM_DASH
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(digits)}%`
}

/** Currency with sensible precision for sub-dollar assets. */
export function formatMoney(
  value: number | null | undefined,
  { symbol = '$', digits }: { symbol?: string; digits?: number } = {}
) {
  if (value === null || value === undefined || !Number.isFinite(value)) return EM_DASH
  const abs = Math.abs(value)
  const dp = digits ?? (abs === 0 ? 2 : abs < 0.01 ? 6 : abs < 1 ? 4 : 2)
  return `${symbol} ${value.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp })}`
}

/** Signed money for P&L: '+$ 325.50' / '-$ 42.00' */
export function formatSignedMoney(value: number | null | undefined, symbol = '$') {
  if (value === null || value === undefined || !Number.isFinite(value)) return EM_DASH
  const sign = value > 0 ? '+' : value < 0 ? '-' : ''
  return `${sign}${formatMoney(Math.abs(value), { symbol })}`
}

/** Compact volume/market cap: 1.2K / 15.4M / 3.1B */
export function formatCompact(value: number | null | undefined, symbol = '$') {
  if (value === null || value === undefined || !Number.isFinite(value)) return EM_DASH
  const abs = Math.abs(value)
  const units: [number, string][] = [[1e9, 'B'], [1e6, 'M'], [1e3, 'K']]
  for (const [div, suffix] of units) {
    if (abs >= div) return `${symbol} ${(value / div).toFixed(abs / div >= 100 ? 0 : 1)}${suffix}`
  }
  return formatMoney(value, { symbol })
}

/** Token quantity, respecting the token's own decimals. */
export function formatQty(value: number | null | undefined, decimals = 4) {
  if (value === null || value === undefined || !Number.isFinite(value)) return EM_DASH
  const dp = Math.min(Math.max(decimals, 0), 8)
  return value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: dp })
}

/** Relative time — 'Last synced: now' was meaningless because the API stamped
 *  the timestamp at request time. */
export function formatRelativeTime(iso: string | null | undefined) {
  if (!iso) return EM_DASH
  const then = new Date(iso).getTime()
  if (!Number.isFinite(then)) return EM_DASH
  const diff = Date.now() - then
  const future = diff < 0
  const s = Math.floor(Math.abs(diff) / 1000)
  const pick = (): [number, string] => {
    if (s < 60) return [s, 'second']
    if (s < 3600) return [Math.floor(s / 60), 'minute']
    if (s < 86400) return [Math.floor(s / 3600), 'hour']
    if (s < 2592000) return [Math.floor(s / 86400), 'day']
    if (s < 31536000) return [Math.floor(s / 2592000), 'month']
    return [Math.floor(s / 31536000), 'year']
  }
  const [n, unit] = pick()
  if (s < 10) return future ? 'in a moment' : 'just now'
  const label = `${n} ${unit}${n === 1 ? '' : 's'}`
  return future ? `in ${label}` : `${label} ago`
}

export function formatDateTime(iso: string | null | undefined) {
  if (!iso) return EM_DASH
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return EM_DASH
  return d.toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

/* ── Input parsing ──────────────────────────────────────────────────────── */

/** Sanitizes a decimal input: digits + a single '.', clamped to `decimals`.
 *  The trade panel used to strip '.' entirely on a fractional-ownership product. */
export function sanitizeDecimalInput(raw: string, decimals = 6) {
  let v = raw.replace(/[^0-9.]/g, '')
  const firstDot = v.indexOf('.')
  if (firstDot !== -1) {
    v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, '')
    if (decimals === 0) v = v.slice(0, firstDot)
    else {
      const [int, frac = ''] = v.split('.')
      v = frac.length > decimals ? `${int}.${frac.slice(0, decimals)}` : v
    }
  }
  if (v.length > 1 && v.startsWith('0') && !v.startsWith('0.')) v = v.replace(/^0+/, '') || '0'
  return v
}

/** Returns null instead of NaN, so `Number('abc') === 0` bugs can't happen. */
export function toNumberOrNull(raw: string | number | null | undefined) {
  if (raw === null || raw === undefined || raw === '') return null
  const n = typeof raw === 'number' ? raw : Number(raw)
  return Number.isFinite(n) ? n : null
}

const EVM_ADDRESS = /^0x[a-fA-F0-9]{40}$/
const ENS_NAME = /^[a-z0-9-]+\.eth$/i

export function isValidRecipient(value: string) {
  const v = value.trim()
  return EVM_ADDRESS.test(v) || ENS_NAME.test(v)
}

/** Only shortens what is actually an address; 'abc' used to render 'abc...abc'. */
export function shortenAddress(value: string | null | undefined, lead = 6, tail = 4) {
  if (!value) return EM_DASH
  const v = value.trim()
  if (v.length <= lead + tail + 1) return v
  return `${v.slice(0, lead)}…${v.slice(-tail)}`
}
