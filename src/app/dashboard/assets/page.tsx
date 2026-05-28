import TokenTable, { Token } from '@/components/ui/TokenTable'

const mockTokens: Token[] = [
  {
    id: '6260c508-5d68-4359-bca5-91c3c3bcd4d2',
    name: 'clawd256',
    initials: 'CL',
    ticker: 'CLAWD256',
    chain: 'BNB Chain Testnet',
    type: '',
    supply: '1000000',
    dateCreated: '28 May 2026',
    status: 'live',
  },
]

export default function AssetsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 style={{ fontSize: '30px', fontWeight: 700, color: '#ffffff' }}>Assets</h1>
        <p style={{ fontSize: '16px', color: '#94a3b8', marginTop: '4px' }}>
          Manage your tokenized real world asset portfolio.
        </p>
      </div>

      <TokenTable tokens={mockTokens} totalCount={mockTokens.length} />
    </div>
  )
}
