import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    summary: {
      totalEarned: '$ 2,450.75',
      pendingClaim: '$ 184.20'
    },
    pendingClaims: [
      {
        id: 'clm-001',
        tokenId: 'tkn-stk-aapl',
        symbol: 'AAPLon',
        name: 'Apple Inc.',
        type: 'Dividend',
        amount: '$ 120.50',
        dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg'
      },
      {
        id: 'clm-002',
        tokenId: 'tkn-rwa-nyc',
        symbol: 'NYCRE',
        name: 'NYC Real Estate',
        type: 'Rental Yield',
        amount: '$ 63.70',
        dueDate: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        logo: null
      }
    ],
    history: [
      {
        id: 'tx-rwd-001',
        tokenId: 'tkn-cry-sol',
        symbol: 'SOL',
        type: 'Staking Reward',
        amount: '$ 12.50',
        status: 'auto-distributed',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
      },
      {
        id: 'tx-rwd-002',
        tokenId: 'tkn-stb-usdc',
        symbol: 'USDC',
        type: 'Lending Yield',
        amount: '$ 45.00',
        status: 'claimed',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString()
      },
      {
        id: 'tx-rwd-003',
        tokenId: 'tkn-stk-aapl',
        symbol: 'AAPLon',
        type: 'Dividend',
        amount: '$ 115.00',
        status: 'claimed',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString()
      }
    ]
  })
}
