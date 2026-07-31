'use client'
import { useEffect, useState } from 'react'

export default function TransactionHistoryPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filterMode, setFilterMode] = useState('All')

  useEffect(() => {
    fetch('/api/investor/history')
      .then(res => res.json())
      .then(d => {
        setData(d)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div style={{ color: 'var(--fk-text-mid)', padding: 48 }}>Memuat riwayat transaksi...</div>
  }

  const filteredTransactions = data.transactions.filter((tx: any) => 
    filterMode === 'All' ? true : tx.executionMode === filterMode
  )

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, color: 'var(--fk-text-hi)', marginBottom: 24 }}>Transaction History</h1>
      
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['All', 'pancake-api', 'direct-swap', 'manual-lp'].map(mode => (
          <button 
            key={mode} 
            onClick={() => setFilterMode(mode)}
            style={{ 
              padding: '6px 12px', 
              borderRadius: 999, 
              border: '1px solid var(--fk-line)', 
              background: filterMode === mode ? 'var(--fk-surface-2)' : 'transparent', 
              color: filterMode === mode ? 'var(--fk-text-hi)' : 'var(--fk-text-mid)',
              fontSize: 13,
              cursor: 'pointer'
            }}
          >
            {mode}
          </button>
        ))}
      </div>

      <div className="fk-card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
          <thead>
            <tr>
              {['Waktu', 'Aset', 'Tipe', 'Harga', 'Jumlah', 'Total', 'Mode Eksekusi', 'Status'].map((h, i) => (
                <th key={h} className="fk-mono" style={{ textAlign: (i >= 3 && i <= 5) ? 'right' : 'left', fontSize: '11px', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--fk-text-low)', padding: '16px', borderBottom: '1px solid var(--fk-line)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((tx: any) => (
              <tr key={tx.id}>
                <td className="fk-mono" style={{ padding: '16px', borderBottom: '1px solid var(--fk-line-soft)', color: 'var(--fk-text-mid)', fontSize: 12 }}>
                  {new Date(tx.timestamp).toLocaleString()}
                </td>
                <td style={{ padding: '16px', borderBottom: '1px solid var(--fk-line-soft)', fontWeight: 600, color: 'var(--fk-text-hi)' }}>
                  {tx.symbol}
                </td>
                <td style={{ padding: '16px', borderBottom: '1px solid var(--fk-line-soft)' }}>
                  <span style={{ color: tx.type === 'BUY' ? 'var(--fk-gain)' : 'var(--fk-loss)', fontWeight: 700, fontSize: 12 }}>{tx.type}</span>
                </td>
                <td className="fk-mono" style={{ padding: '16px', borderBottom: '1px solid var(--fk-line-soft)', textAlign: 'right', color: 'var(--fk-text-hi)' }}>{tx.price}</td>
                <td className="fk-mono" style={{ padding: '16px', borderBottom: '1px solid var(--fk-line-soft)', textAlign: 'right', color: 'var(--fk-text-hi)' }}>{tx.amount}</td>
                <td className="fk-mono" style={{ padding: '16px', borderBottom: '1px solid var(--fk-line-soft)', textAlign: 'right', fontWeight: 600, color: 'var(--fk-text-hi)' }}>{tx.total}</td>
                <td className="fk-mono" style={{ padding: '16px', borderBottom: '1px solid var(--fk-line-soft)', color: 'var(--fk-text-mid)', fontSize: 11 }}>
                  <span style={{ padding: '4px 8px', background: 'var(--fk-surface-1)', borderRadius: 4 }}>{tx.executionMode}</span>
                </td>
                <td style={{ padding: '16px', borderBottom: '1px solid var(--fk-line-soft)' }}>
                  {tx.status === 'success' && <span className="fk-badge fk-badge-gain" style={{ fontSize: 11, padding: '2px 6px' }}>Success</span>}
                  {tx.status === 'pending' && <span className="fk-badge fk-badge-warn" style={{ fontSize: 11, padding: '2px 6px' }}>Pending</span>}
                  {tx.status === 'failed' && <span className="fk-badge fk-badge-loss" style={{ fontSize: 11, padding: '2px 6px' }}>Failed</span>}
                  {tx.txHash && <div className="fk-mono" style={{ fontSize: 10, color: 'var(--fk-text-low)', marginTop: 4 }}>Tx: {tx.txHash.substring(0,8)}...</div>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredTransactions.length === 0 && (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--fk-text-mid)' }}>Tidak ada transaksi yang sesuai filter.</div>
        )}
      </div>
    </div>
  )
}
