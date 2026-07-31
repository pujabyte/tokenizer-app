import { NextResponse } from 'next/server'
import { ASSETS_DB } from '../data'

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params
  const token = ASSETS_DB.find(t => t.id === params.id)
  
  if (!token) {
    return NextResponse.json({ error: 'Token not found' }, { status: 404 })
  }

  // Add some detail-specific dummy data
  const detailData = {
    ...token,
    description: token.description || `This is a detailed description for ${token.name}. It provides exposure to the ${token.category} sector with a focus on stable yield and long-term capital appreciation.`,
    stats: {
      marketCap: '$ 50,000,000',
      volume24h: token.info.split(' · ')[1] || '$ 3.2M',
      circulatingSupply: '10,000,000',
      totalIssued: '10,000,000'
    },
    executionMode: token.category === 'RWA' ? 'manual-lp' : 'pancake-api',
    attestations: (token.category === 'RWA' || token.category === 'Stablecoin') ? [
      { id: 'att-01', date: '2023-10-01', type: 'Proof of Reserve', auditor: 'Deloitte', link: '#' },
      { id: 'att-02', date: '2023-09-01', type: 'Proof of Reserve', auditor: 'Deloitte', link: '#' },
      { id: 'att-03', date: '2023-08-01', type: 'Proof of Reserve', auditor: 'Deloitte', link: '#' },
      { id: 'att-04', date: '2023-07-01', type: 'Proof of Reserve', auditor: 'Deloitte', link: '#' },
      { id: 'att-05', date: '2023-06-01', type: 'Proof of Reserve', auditor: 'Deloitte', link: '#' },
      { id: 'att-06', date: '2023-05-01', type: 'Proof of Reserve', auditor: 'Deloitte', link: '#' },
      { id: 'att-07', date: '2023-04-01', type: 'Proof of Reserve', auditor: 'Deloitte', link: '#' },
    ] : null,
    rewardHistory: (token.apy && token.apy !== '-') ? [
      { id: 'rew-01', date: '2023-10-15', amount: '125.50', currency: token.yieldToken, txHash: '0xabc123...def456' },
      { id: 'rew-02', date: '2023-09-15', amount: '122.10', currency: token.yieldToken, txHash: '0xdef456...abc123' },
      { id: 'rew-03', date: '2023-08-15', amount: '119.80', currency: token.yieldToken, txHash: '0x999abc...333def' },
      { id: 'rew-04', date: '2023-07-15', amount: '120.50', currency: token.yieldToken, txHash: '0x444abc...444def' },
      { id: 'rew-05', date: '2023-06-15', amount: '118.00', currency: token.yieldToken, txHash: '0x555abc...555def' },
      { id: 'rew-06', date: '2023-05-15', amount: '117.20', currency: token.yieldToken, txHash: '0x666abc...666def' },
      { id: 'rew-07', date: '2023-04-15', amount: '116.90', currency: token.yieldToken, txHash: '0x777abc...777def' },
    ] : null
  }

  return NextResponse.json(detailData)
}
