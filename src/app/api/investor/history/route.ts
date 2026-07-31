import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    transactions: [
      {
        id: 'tx-001',
        tokenId: 'tkn-stk-aapl',
        symbol: 'AAPLon',
        type: 'BUY',
        amount: '10',
        price: '$ 185.30',
        total: '$ 1,853.00',
        status: 'success',
        executionMode: 'smart-contract',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        txHash: '0xabc123def456'
      },
      {
        id: 'tx-002',
        tokenId: 'tkn-cry-sol',
        symbol: 'SOL',
        type: 'SELL',
        amount: '5',
        price: '$ 150.00',
        total: '$ 750.00',
        status: 'success',
        executionMode: 'dex-aggregator',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
        txHash: '0x123abc456def789'
      },
      {
        id: 'tx-003',
        tokenId: 'tkn-stb-usdc',
        symbol: 'USDC',
        type: 'BUY',
        amount: '500',
        price: '$ 1.00',
        total: '$ 500.00',
        status: 'success',
        executionMode: 'direct-deposit',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
        txHash: '0xdef789123abc456'
      },
      {
        id: 'tx-004',
        tokenId: 'tkn-rwa-nyc',
        symbol: 'NYCRE',
        type: 'BUY',
        amount: '2',
        price: '$ 520.00',
        total: '$ 1,040.00',
        status: 'pending',
        executionMode: 'smart-contract',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
        txHash: null
      }
    ]
  })
}
