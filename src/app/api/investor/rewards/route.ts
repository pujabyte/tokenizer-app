import { NextResponse } from 'next/server'

const hours = (n: number) => new Date(Date.now() - 1000 * 60 * 60 * n).toISOString()
const inHours = (n: number) => new Date(Date.now() + 1000 * 60 * 60 * n).toISOString()

// Minimum claim + gas estimate exist so the UI can warn when a claim isn't
// economical, and block claims below the threshold.
const MIN_CLAIM_USD = 10
const GAS_ESTIMATE_USD = 0.42

const PENDING_CLAIMS = [
  {
    id: 'clm-001', tokenId: 'tkn-stk-aapl', symbol: 'AAPLon', name: 'Apple Inc.',
    type: 'Dividend', amount: 120.5, currency: 'USDC',
    availableSince: hours(48), claimableUntil: inHours(24 * 20),
    logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
  },
  {
    id: 'clm-002', tokenId: 'tkn-rwa-nyc', symbol: 'NYCRE', name: '1500 Broadway NYC',
    type: 'Rental Yield', amount: 63.7, currency: 'USDC',
    availableSince: hours(5), claimableUntil: inHours(24 * 27),
    logo: null,
  },
  {
    // Below the minimum — exercises the "not worth the gas" state
    id: 'clm-003', tokenId: 'tkn-cry-link', symbol: 'LINK', name: 'Chainlink',
    type: 'Staking Reward', amount: 0.85, currency: 'USDC',
    availableSince: hours(2), claimableUntil: inHours(24 * 29),
    logo: 'https://cryptologos.cc/logos/chainlink-link-logo.svg?v=032',
  },
  {
    // Expiring soon — exercises the urgency state
    id: 'clm-004', tokenId: 'tkn-bnd-ust3m', symbol: 'UST3M', name: 'US Treasury Bill 3M',
    type: 'Coupon', amount: 41.2, currency: 'USDC',
    availableSince: hours(24 * 27), claimableUntil: inHours(18),
    logo: 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Seal_of_the_United_States_Department_of_the_Treasury.svg',
  },
]

const HISTORY = [
  { id: 'tx-rwd-001', tokenId: 'tkn-cry-sol', symbol: 'SOL', type: 'Staking Reward', amount: 12.5, status: 'auto-distributed', timestamp: hours(12), txHash: '0xrwd001aabbcc' },
  { id: 'tx-rwd-002', tokenId: 'tkn-stb-usdc', symbol: 'USDC', type: 'Lending Yield', amount: 45.0, status: 'claimed', timestamp: hours(24 * 5), txHash: '0xrwd002ddeeff' },
  { id: 'tx-rwd-003', tokenId: 'tkn-stk-aapl', symbol: 'AAPLon', type: 'Dividend', amount: 115.0, status: 'claimed', timestamp: hours(24 * 30), txHash: '0xrwd003112233' },
  // Failure row so the failed state is reachable
  { id: 'tx-rwd-004', tokenId: 'tkn-rwa-mia', symbol: 'MIAM', type: 'Rental Yield', amount: 58.3, status: 'failed', timestamp: hours(24 * 8), txHash: '0xrwd004445566', failureReason: 'Claim transaction ran out of gas' },
]

const fmt = (n: number) => `$ ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    if (searchParams.get('fail') === '1') {
      return NextResponse.json({ error: 'Rewards service unavailable' }, { status: 503 })
    }

    const empty = searchParams.get('empty') === '1'
    const claims = empty ? [] : PENDING_CLAIMS
    const history = empty ? [] : HISTORY

    const pendingTotal = claims.reduce((s, c) => s + c.amount, 0)
    const claimedTotal = history.filter(h => h.status !== 'failed').reduce((s, h) => s + h.amount, 0)

    return NextResponse.json({
      summary: {
        totalEarned: pendingTotal + claimedTotal,
        totalEarnedDisplay: fmt(pendingTotal + claimedTotal),
        pendingClaim: pendingTotal,
        pendingClaimDisplay: fmt(pendingTotal),
        totalClaimed: claimedTotal,
        totalClaimedDisplay: fmt(claimedTotal),
      },
      config: { minClaimUsd: MIN_CLAIM_USD, gasEstimateUsd: GAS_ESTIMATE_USD },
      pendingClaims: claims.map(c => ({
        ...c,
        amountDisplay: fmt(c.amount),
        belowMinimum: c.amount < MIN_CLAIM_USD,
        gasExceedsReward: GAS_ESTIMATE_USD >= c.amount,
        expiringSoon: new Date(c.claimableUntil).getTime() - Date.now() < 1000 * 60 * 60 * 24,
      })),
      history: history.map(h => ({ ...h, amountDisplay: fmt(h.amount) })),
    })
  } catch {
    return NextResponse.json({ error: 'Failed to load rewards' }, { status: 500 })
  }
}

/** Mock claim endpoint. Deterministic outcomes so every branch is demoable:
 *  clm-003 is below minimum, clm-004 fails, everything else succeeds. */
export async function POST(request: Request) {
  try {
    const { claimIds } = await request.json()
    const ids: string[] = Array.isArray(claimIds) ? claimIds : [claimIds]

    const results = ids.map(id => {
      const claim = PENDING_CLAIMS.find(c => c.id === id)
      if (!claim) return { id, status: 'failed' as const, reason: 'Claim not found or already processed' }
      if (claim.amount < MIN_CLAIM_USD) {
        return { id, status: 'rejected' as const, reason: `Below the ${fmt(MIN_CLAIM_USD)} minimum claim amount` }
      }
      if (id === 'clm-004') {
        return { id, status: 'failed' as const, reason: 'Transaction reverted — insufficient gas' }
      }
      return {
        id, status: 'success' as const,
        amountDisplay: fmt(claim.amount),
        txHash: `0xclaim${id.slice(-3)}aabbccddeeff00112233445566778899`,
      }
    })

    const anyFailed = results.some(r => r.status !== 'success')
    return NextResponse.json({ ok: !anyFailed, results }, { status: anyFailed ? 207 : 200 })
  } catch {
    return NextResponse.json({ error: 'Failed to process claim' }, { status: 500 })
  }
}
