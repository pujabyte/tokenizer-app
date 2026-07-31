import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    totalValue: '$ 14,520.50',
    lastSyncedAt: new Date().toISOString(),
    holdings: [
      {
        id: 'tkn-stk-aapl',
        symbol: 'AAPLon',
        name: 'Apple Inc.',
        quantity: '50',
        averagePrice: '$ 175.00',
        currentPrice: '$ 185.30',
        currentValue: '$ 9,265.00',
        change: '+5.88%',
        source: 'on-chain',
        isGain: true,
        logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg'
      },
      {
        id: 'tkn-cry-sol',
        symbol: 'SOL',
        name: 'Solana',
        quantity: '25',
        averagePrice: '$ 150.20',
        currentPrice: '$ 145.20',
        currentValue: '$ 3,630.00',
        change: '-3.32%',
        source: 'on-chain',
        isGain: false,
        logo: 'https://cryptologos.cc/logos/solana-sol-logo.svg?v=026'
      },
      {
        id: 'tkn-stb-usdc',
        symbol: 'USDC',
        name: 'USD Coin',
        quantity: '1625.5',
        averagePrice: '$ 1.00',
        currentPrice: '$ 1.00',
        currentValue: '$ 1,625.50',
        change: '0.00%',
        source: 'on-chain',
        isGain: true,
        logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=026'
      }
    ]
  })
}
