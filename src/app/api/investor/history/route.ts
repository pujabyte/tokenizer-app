import { NextResponse } from 'next/server'
// Shared vocabulary. The old values here ('smart-contract', 'dex-aggregator',
// 'direct-deposit') did not match the filter pills in the UI, so every filter
// except "All" returned nothing.
import { EXECUTION_MODES, TX_STATUSES, BLOCK_EXPLORER as EXPLORER } from '@/lib/constants'

const mins = (n: number) => new Date(Date.now() - 1000 * 60 * n).toISOString()

const TRANSACTIONS = [
  {
    id: 'tx-001', tokenId: 'tkn-stk-aapl', symbol: 'AAPLon', name: 'Apple Inc.',
    type: 'BUY', amount: '10', price: '$ 185.30', total: '$ 1,853.00',
    status: 'success', executionMode: 'pancake-api',
    timestamp: mins(60 * 24), txHash: '0xabc123def4567890abc123def4567890abc123def4567890abc123def4567890',
  },
  {
    id: 'tx-002', tokenId: 'tkn-cry-sol', symbol: 'SOL', name: 'Solana',
    type: 'SELL', amount: '5', price: '$ 150.00', total: '$ 750.00',
    status: 'success', executionMode: 'direct-swap',
    timestamp: mins(60 * 48), txHash: '0x123abc456def7890123abc456def7890123abc456def7890123abc456def7890',
  },
  {
    id: 'tx-003', tokenId: 'tkn-stb-usdc', symbol: 'USDC', name: 'USD Coin',
    type: 'BUY', amount: '500', price: '$ 1.00', total: '$ 500.00',
    status: 'success', executionMode: 'direct-swap',
    timestamp: mins(60 * 72), txHash: '0xdef789123abc4560def789123abc4560def789123abc4560def789123abc4560',
  },
  {
    id: 'tx-004', tokenId: 'tkn-rwa-nyc', symbol: 'NYCRE', name: '1500 Broadway NYC',
    type: 'BUY', amount: '2', price: '$ 520.00', total: '$ 1,040.00',
    status: 'pending', executionMode: 'manual-lp',
    timestamp: mins(5), txHash: null,
  },
  // Failure rows — the UI already had a "Failed" badge that was unreachable
  {
    id: 'tx-005', tokenId: 'tkn-cry-eth', symbol: 'ETH', name: 'Ethereum',
    type: 'BUY', amount: '0.5', price: '$ 3,250.00', total: '$ 1,625.00',
    status: 'failed', executionMode: 'pancake-api',
    timestamp: mins(60 * 6), txHash: '0xfail01aa22bb33cc44dd55ee66ff7788990011223344556677889900112233',
    failureReason: 'Slippage tolerance exceeded — price moved before confirmation',
  },
  {
    id: 'tx-006', tokenId: 'tkn-rwa-mia', symbol: 'MIAM', name: 'Miami Marina Resort',
    type: 'SELL', amount: '8', price: '$ 250.00', total: '$ 2,000.00',
    status: 'reverted', executionMode: 'manual-lp',
    timestamp: mins(60 * 30), txHash: '0xrevert99887766554433221100aabbccddeeff00112233445566778899aabb',
    failureReason: 'Redemption window closed — funds returned to your wallet',
  },
  {
    id: 'tx-007', tokenId: 'tkn-rwa-jkt', symbol: 'JKTMXD',
    name: 'Jakarta Sudirman Central Business District Mixed-Use Development Phase II',
    type: 'BUY', amount: '12', price: '$ 75.00', total: '$ 900.00',
    status: 'success', executionMode: 'manual-lp',
    timestamp: mins(60 * 24 * 12), txHash: '0xjkt1122334455667788990011223344556677889900112233445566778899',
  },
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    if (searchParams.get('fail') === '1') {
      return NextResponse.json({ error: 'History service unavailable' }, { status: 503 })
    }

    const empty = searchParams.get('empty') === '1'
    const page = Math.max(1, Number(searchParams.get('page') ?? 1))
    const pageSize = Math.min(50, Math.max(1, Number(searchParams.get('pageSize') ?? 20)))
    const mode = searchParams.get('mode')
    const status = searchParams.get('status')

    let rows = empty ? [] : TRANSACTIONS
    if (mode && mode !== 'All') rows = rows.filter(t => t.executionMode === mode)
    if (status && status !== 'All') rows = rows.filter(t => t.status === status)

    const total = rows.length
    const start = (page - 1) * pageSize

    return NextResponse.json({
      transactions: rows.slice(start, start + pageSize).map(t => ({
        ...t,
        explorerUrl: t.txHash ? `${EXPLORER}${t.txHash}` : null,
        txHashShort: t.txHash ? `${t.txHash.slice(0, 8)}…${t.txHash.slice(-6)}` : null,
      })),
      executionModes: ['All', ...EXECUTION_MODES],
      statuses: ['All', ...TX_STATUSES],
      pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to load transaction history' }, { status: 500 })
  }
}
