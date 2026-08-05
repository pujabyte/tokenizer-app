import { NextResponse } from 'next/server'
import { ASSETS_DB, balanceOf } from '../data'

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params
    const { searchParams } = new URL(request.url)

    if (searchParams.get('fail') === '1') {
      return NextResponse.json({ error: 'Token service unavailable' }, { status: 503 })
    }

    const token = ASSETS_DB.find(t => t.id === params.id)

    if (!token) {
      return NextResponse.json(
        { error: 'Token not found', code: 'TOKEN_NOT_FOUND', id: params.id },
        { status: 404 }
      )
    }

    const hasYield = Boolean(token.apy)
    const volume24h = token.info?.includes(' · ') ? token.info.split(' · ')[1] : null

    return NextResponse.json({
      ...token,
      description:
        token.description ||
        `Provides exposure to the ${token.category} sector with a focus on stable yield and long-term capital appreciation.`,
      stats: {
        marketCap:
          token.priceUsd !== null && token.totalSupplyNum !== null
            ? `$ ${(token.priceUsd * token.totalSupplyNum).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
            : null,
        volume24h,
        circulatingSupply: token.totalSupplyNum?.toLocaleString('en-US') ?? null,
        totalIssued: token.totalSupply ?? null,
      },
      // Wallet context the trade panel needs to validate against, rather than
      // the hardcoded "Available balance $14,500.00" string it used before.
      wallet: {
        quoteSymbol: 'USDC',
        quoteBalance: balanceOf('USDC'),
        tokenBalance: balanceOf(token.symbol),
      },
      fees: { platformFeeBps: 15, networkFeeUsd: 0.42, estimatedSettlement: '2-4 mins' },
      executionMode: token.category === 'RWA' ? 'manual-lp' : 'pancake-api',
      attestations:
        token.category === 'RWA' || token.category === 'Stablecoin'
          ? Array.from({ length: 7 }, (_, i) => ({
              id: `att-0${i + 1}`,
              date: `2026-${String(10 - i).padStart(2, '0')}-01`,
              type: 'Proof of Reserve',
              auditor: 'Deloitte',
              link: '#',
            }))
          : [],
      rewardHistory: hasYield
        ? Array.from({ length: 7 }, (_, i) => ({
            id: `rew-0${i + 1}`,
            date: `2026-${String(10 - i).padStart(2, '0')}-15`,
            amount: (125.5 - i * 1.4).toFixed(2),
            currency: token.yieldToken,
            txHash: `0x${(i + 1).toString().repeat(6)}abc...${(i + 1).toString().repeat(3)}def`,
          }))
        : [],
    })
  } catch {
    return NextResponse.json({ error: 'Failed to load token' }, { status: 500 })
  }
}
