import { NextResponse } from 'next/server'
import { balanceOf } from '../tokens/data'

type Holding = {
  id: string; symbol: string; name: string
  quantity: number; averagePrice: number; currentPrice: number
  source: string; logo: string | null
}

const HOLDINGS: Holding[] = [
  {
    id: 'tkn-stk-aapl', symbol: 'AAPLon', name: 'Apple Inc.',
    quantity: 50, averagePrice: 175.0, currentPrice: 185.3, source: 'on-chain',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
  },
  {
    id: 'tkn-cry-sol', symbol: 'SOL', name: 'Solana',
    quantity: 25, averagePrice: 150.2, currentPrice: 145.2, source: 'on-chain',
    logo: 'https://cryptologos.cc/logos/solana-sol-logo.svg?v=026',
  },
  {
    id: 'tkn-stb-usdc', symbol: 'USDC', name: 'USD Coin',
    quantity: 1625.5, averagePrice: 1.0, currentPrice: 1.0, source: 'on-chain',
    logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=026',
  },
  {
    // Long name + no logo — exercises truncation and the initials fallback
    id: 'tkn-rwa-jkt', symbol: 'JKTMXD',
    name: 'Jakarta Sudirman Central Business District Mixed-Use Development Phase II',
    quantity: 12, averagePrice: 80.0, currentPrice: 75.0, source: 'primary-issuance',
    logo: null,
  },
]

const fmt = (n: number) =>
  `$ ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    if (searchParams.get('fail') === '1') {
      return NextResponse.json({ error: 'Portfolio service unavailable' }, { status: 503 })
    }

    // ?empty=1 → brand-new investor with zero holdings
    const source = searchParams.get('empty') === '1' ? [] : HOLDINGS

    const holdings = source.map(h => {
      const currentValue = h.quantity * h.currentPrice
      const costBasis = h.quantity * h.averagePrice
      const pnl = currentValue - costBasis
      const changePct = costBasis === 0 ? 0 : (pnl / costBasis) * 100
      const trend = changePct > 0 ? 'up' : changePct < 0 ? 'down' : 'flat'
      return {
        ...h,
        quantityDisplay: h.quantity.toLocaleString('en-US'),
        averagePriceDisplay: fmt(h.averagePrice),
        currentPriceDisplay: fmt(h.currentPrice),
        currentValue,
        currentValueDisplay: fmt(currentValue),
        costBasis,
        pnl,
        pnlDisplay: `${pnl >= 0 ? '+' : '-'}${fmt(Math.abs(pnl)).replace('$ ', '$ ')}`,
        changePct: Number(changePct.toFixed(2)),
        change: `${changePct > 0 ? '+' : ''}${changePct.toFixed(2)}%`,
        trend,
        // isGain is null for flat so the UI can render neutral, not green
        isGain: trend === 'flat' ? null : trend === 'up',
      }
    })

    const totalValue = holdings.reduce((s, h) => s + h.currentValue, 0)
    const totalCost = holdings.reduce((s, h) => s + h.costBasis, 0)
    const totalPnl = totalValue - totalCost
    const totalPnlPct = totalCost === 0 ? 0 : (totalPnl / totalCost) * 100
    const totalTrend = totalPnl > 0 ? 'up' : totalPnl < 0 ? 'down' : 'flat'

    return NextResponse.json({
      totalValue,
      totalValueDisplay: fmt(totalValue),
      // Was a hardcoded green "+$ 325.50 (+2.26%)" unrelated to the holdings
      totalPnl,
      totalPnlDisplay: `${totalPnl >= 0 ? '+' : '-'}$ ${Math.abs(totalPnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      totalPnlPct: Number(totalPnlPct.toFixed(2)),
      totalPnlPctDisplay: `${totalPnlPct >= 0 ? '+' : ''}${totalPnlPct.toFixed(2)}%`,
      totalTrend,
      cashBalance: balanceOf('USDC'),
      cashBalanceDisplay: fmt(balanceOf('USDC')),
      allocation: holdings.map(h => ({
        symbol: h.symbol,
        pct: totalValue === 0 ? 0 : Number(((h.currentValue / totalValue) * 100).toFixed(1)),
      })),
      lastSyncedAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
      holdings,
    })
  } catch {
    return NextResponse.json({ error: 'Failed to load portfolio' }, { status: 500 })
  }
}
