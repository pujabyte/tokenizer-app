'use client'
import { useEffect, useState } from 'react'
import { TokenLogo } from '@/components/ui/token-logo'
import { Copy, CheckCircle2, Mail, Wallet, ArrowLeft, X, CreditCard, QrCode, Building, ExternalLink, Send, Loader2 } from 'lucide-react'

export default function PortfolioPage() {
  const [data, setData] = useState<any>(null)
  const [history, setHistory] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  
  // Add Funds State
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [depositMethod, setDepositMethod] = useState<'onramp' | 'onchain' | null>(null)

  // Send State
  const [showSendModal, setShowSendModal] = useState(false)
  const [sendStep, setSendStep] = useState<'form' | 'confirm' | 'success'>('form')
  const [sendAmount, setSendAmount] = useState('')
  const [sendAddress, setSendAddress] = useState('')
  const [isSending, setIsSending] = useState(false)

  const handleSend = () => {
    setIsSending(true)
    setTimeout(() => {
      setIsSending(false)
      setSendStep('success')
    }, 2000)
  }

  // Mock Privy User Identity
  const privyUser = {
    email: 'investor@frakta.io', // Set to null to see wallet-only mode
    wallet: '0x71C...976F'
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    Promise.all([
      fetch('/api/investor/portfolio').then(res => res.json()),
      fetch('/api/investor/history').then(res => res.json())
    ]).then(([portfolioData, historyData]) => {
      setData(portfolioData)
      setHistory(historyData.transactions)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return <div style={{ color: 'var(--fk-text-mid)', padding: 48 }}>Loading portfolio...</div>
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, color: 'var(--fk-text-hi)', marginBottom: 12 }}>Portfolio</h1>
      
      <div className="fk-hero-a" style={{ padding: '36px 40px', marginBottom: 48, display: 'flex', flexDirection: 'column' }}>
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', height: '100%' }}>
          <div>
            <div className="fk-mono" style={{ fontSize: '12px', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--fk-blue-bright)', marginBottom: '12px' }}>Total Portfolio Value</div>
            <div className="fk-mono" style={{ fontWeight: 700, fontSize: '48px', letterSpacing: '-.01em', margin: 'auto 0 8px' }}>{data.totalValue}</div>
            <div className="fk-mono" style={{ fontSize: '14px', color: 'var(--fk-text-mid)' }}><span style={{ color: 'var(--fk-gain)' }}>+$ 325.50 (+2.26%)</span> · 24h</div>
            <div className="flex" style={{ gap: '12px', marginTop: '32px' }}>
              <button onClick={() => { setShowDepositModal(true); setDepositMethod(null); }} className="fk-btn fk-btn-primary" style={{ padding: '12px 24px', fontSize: '14px' }}>Add funds</button>
              <button onClick={() => { setShowSendModal(true); setSendStep('form'); setSendAmount(''); setSendAddress(''); }} className="fk-btn fk-btn-secondary" style={{ padding: '12px 24px', fontSize: '14px' }}>Send</button>
            </div>
          </div>
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {privyUser.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--fk-surface-1)', border: '1px solid var(--fk-line)', padding: '6px 14px', borderRadius: 999, fontSize: 13, color: 'var(--fk-text-hi)', backdropFilter: 'blur(10px)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--fk-surface-2)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--fk-surface-1)'}>
                  <Mail size={14} style={{ color: 'var(--fk-text-mid)' }} />
                  <span style={{ fontWeight: 500 }}>{privyUser.email}</span>
                </div>
              )}
              {privyUser.wallet && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--fk-surface-1)', border: '1px solid var(--fk-line)', padding: '6px 14px', borderRadius: 999, fontSize: 13, color: 'var(--fk-text-hi)', backdropFilter: 'blur(10px)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--fk-surface-2)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--fk-surface-1)'}>
                  <Wallet size={14} style={{ color: 'var(--fk-text-mid)' }} />
                  <span className="fk-mono" style={{ fontWeight: 500 }}>{privyUser.wallet}</span>
                  <div style={{ width: 1, height: 14, background: 'var(--fk-line)', margin: '0 2px' }} />
                  <button onClick={() => handleCopy(privyUser.wallet)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: copied ? 'var(--fk-gain)' : 'var(--fk-text-mid)', padding: 0, transition: 'color 0.2s' }} title="Copy Wallet Address">
                    {copied ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              )}
            </div>
            <p style={{ fontSize: 12, color: 'var(--fk-text-low)' }}>Last synced: {new Date(data.lastSyncedAt).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--fk-text-hi)', marginBottom: 24 }}>Your Assets</h2>

      <div className="fk-card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
          <thead>
            <tr>
              {['Asset', 'Quantity', 'Avg Price', 'Current Price', 'Total Value'].map((h, i) => (
                <th key={h} className="fk-mono" style={{ textAlign: i > 0 ? 'right' : 'left', fontSize: '11px', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--fk-text-low)', padding: '16px', borderBottom: '1px solid var(--fk-line)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.holdings.map((h: any) => (
              <tr key={h.id}>
                <td style={{ padding: '16px', borderBottom: '1px solid var(--fk-line-soft)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <TokenLogo logo={h.logo} symbol={h.symbol} size={32} isGain={h.isGain} />
                    <div>
                      <p style={{ fontWeight: 600, color: 'var(--fk-text-hi)' }}>{h.symbol}</p>
                      <p style={{ fontSize: 12, color: 'var(--fk-text-mid)' }}>{h.name}</p>
                    </div>
                  </div>
                </td>
                <td className="fk-mono" style={{ padding: '16px', borderBottom: '1px solid var(--fk-line-soft)', textAlign: 'right', color: 'var(--fk-text-hi)' }}>{h.quantity}</td>
                <td className="fk-mono" style={{ padding: '16px', borderBottom: '1px solid var(--fk-line-soft)', textAlign: 'right', color: 'var(--fk-text-hi)' }}>{h.averagePrice}</td>
                <td className="fk-mono" style={{ padding: '16px', borderBottom: '1px solid var(--fk-line-soft)', textAlign: 'right' }}>
                  <div style={{ color: 'var(--fk-text-hi)', marginBottom: 4 }}>{h.currentPrice}</div>
                  <div style={{ fontSize: 11, color: h.isGain ? 'var(--fk-gain)' : 'var(--fk-loss)' }}>{h.change}</div>
                </td>
                <td className="fk-mono" style={{ padding: '16px', borderBottom: '1px solid var(--fk-line-soft)', textAlign: 'right', fontWeight: 600, color: 'var(--fk-text-hi)' }}>{h.currentValue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--fk-text-hi)', marginTop: 48, marginBottom: 24 }}>Recent Transactions</h2>

      <div className="fk-card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
          <thead>
            <tr>
              {['Transaction', 'Type', 'Amount', 'Price', 'Total', 'Status', 'Date'].map((h, i) => (
                <th key={h} className="fk-mono" style={{ textAlign: i > 0 && i < 6 ? 'right' : 'left', fontSize: '11px', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--fk-text-low)', padding: '16px', borderBottom: '1px solid var(--fk-line)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {history.map((tx: any) => (
              <tr key={tx.id}>
                <td style={{ padding: '16px', borderBottom: '1px solid var(--fk-line-soft)' }}>
                  <div style={{ fontWeight: 600, color: 'var(--fk-text-hi)' }}>{tx.symbol}</div>
                  <div className="fk-mono" style={{ fontSize: 11, color: 'var(--fk-text-mid)' }}>{tx.id.toUpperCase()}</div>
                </td>
                <td style={{ padding: '16px', borderBottom: '1px solid var(--fk-line-soft)', textAlign: 'right' }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: 4, 
                    fontSize: 11, 
                    fontWeight: 700, 
                    color: tx.type === 'BUY' ? 'var(--fk-gain)' : 'var(--fk-loss)',
                    background: tx.type === 'BUY' ? 'var(--fk-gain-tint)' : 'var(--fk-loss-tint)'
                  }}>
                    {tx.type}
                  </span>
                </td>
                <td className="fk-mono" style={{ padding: '16px', borderBottom: '1px solid var(--fk-line-soft)', textAlign: 'right', color: 'var(--fk-text-hi)' }}>{tx.amount}</td>
                <td className="fk-mono" style={{ padding: '16px', borderBottom: '1px solid var(--fk-line-soft)', textAlign: 'right', color: 'var(--fk-text-hi)' }}>{tx.price}</td>
                <td className="fk-mono" style={{ padding: '16px', borderBottom: '1px solid var(--fk-line-soft)', textAlign: 'right', fontWeight: 600, color: 'var(--fk-text-hi)' }}>{tx.total}</td>
                <td style={{ padding: '16px', borderBottom: '1px solid var(--fk-line-soft)', textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: tx.status === 'success' ? 'var(--fk-gain)' : 'var(--fk-yellow)' }}></span>
                    <span style={{ fontSize: 12, color: 'var(--fk-text-mid)', textTransform: 'capitalize' }}>{tx.status}</span>
                  </div>
                </td>
                <td className="fk-mono" style={{ padding: '16px', borderBottom: '1px solid var(--fk-line-soft)', textAlign: 'left', color: 'var(--fk-text-mid)', fontSize: 11 }}>
                  {new Date(tx.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Funds Modal */}
      {showDepositModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="fk-card" style={{ width: 480, maxWidth: '90%', padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'fadeIn 0.2s ease-out' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', borderBottom: '1px solid var(--fk-line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {depositMethod && (
                  <button onClick={() => setDepositMethod(null)} style={{ background: 'transparent', border: 'none', color: 'var(--fk-text-mid)', cursor: 'pointer', padding: 0, display: 'flex' }}>
                    <ArrowLeft size={20} />
                  </button>
                )}
                <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--fk-text-hi)' }}>
                  {!depositMethod && 'Add Funds'}
                  {depositMethod === 'onramp' && 'Buy with Fiat'}
                  {depositMethod === 'onchain' && 'Deposit Crypto'}
                </h2>
              </div>
              <button onClick={() => setShowDepositModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--fk-text-mid)', cursor: 'pointer', padding: 0, display: 'flex' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              
              {/* View 1: Selection */}
              {!depositMethod && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <button onClick={() => setDepositMethod('onramp')} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: 20, background: 'var(--fk-surface-1)', border: '1px solid var(--fk-line)', borderRadius: 12, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = 'var(--fk-surface-2)'; e.currentTarget.style.borderColor = 'var(--fk-blue)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'var(--fk-surface-1)'; e.currentTarget.style.borderColor = 'var(--fk-line)'; }}>
                    <div style={{ background: 'var(--fk-blue-tint)', color: 'var(--fk-blue)', padding: 12, borderRadius: 12, display: 'flex' }}>
                      <CreditCard size={24} />
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--fk-text-hi)', marginBottom: 4 }}>Buy with Fiat (On-ramp)</div>
                      <div style={{ fontSize: 14, color: 'var(--fk-text-mid)', lineHeight: 1.5 }}>The easiest way for beginners. Buy digital dollars (USDC) directly using your credit card, Apple Pay, or bank transfer.</div>
                    </div>
                  </button>

                  <button onClick={() => setDepositMethod('onchain')} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: 20, background: 'var(--fk-surface-1)', border: '1px solid var(--fk-line)', borderRadius: 12, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = 'var(--fk-surface-2)'; e.currentTarget.style.borderColor = 'var(--fk-blue)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'var(--fk-surface-1)'; e.currentTarget.style.borderColor = 'var(--fk-line)'; }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--fk-text-hi)', padding: 12, borderRadius: 12, display: 'flex' }}>
                      <QrCode size={24} />
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--fk-text-hi)', marginBottom: 4 }}>Deposit Crypto (On-chain)</div>
                      <div style={{ fontSize: 14, color: 'var(--fk-text-mid)', lineHeight: 1.5 }}>Transfer crypto from an external exchange (Binance, Coinbase) or your personal Web3 wallet (MetaMask, TrustWallet).</div>
                    </div>
                  </button>
                </div>
              )}

              {/* View 2: On-ramp */}
              {depositMethod === 'onramp' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div style={{ padding: '16px 20px', background: 'rgba(37, 99, 235, 0.05)', borderLeft: '3px solid var(--fk-blue)', borderRadius: '0 8px 8px 0' }}>
                    <p style={{ fontSize: 13, color: 'var(--fk-text-hi)', lineHeight: 1.6, margin: 0 }}>Your fiat money (USD, EUR, etc.) will be automatically converted into <strong>USDC</strong> tokens by our certified partners. The USDC will be deposited directly into your Frakta wallet.</p>
                  </div>
                  
                  <div>
                    <h3 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--fk-text-low)', marginBottom: 16 }}>Select a provider</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, background: 'var(--fk-surface-1)', border: '1px solid var(--fk-line)', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--fk-surface-2)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--fk-surface-1)'}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 32, height: 32, background: '#1d4ed8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: 14 }}>A</div>
                          <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--fk-text-hi)' }}>Alchemy Pay</span>
                        </div>
                        <ExternalLink size={16} color="var(--fk-text-mid)" />
                      </button>
                      <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, background: 'var(--fk-surface-1)', border: '1px solid var(--fk-line)', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--fk-surface-2)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--fk-surface-1)'}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 32, height: 32, background: '#7e22ce', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: 14 }}>M</div>
                          <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--fk-text-hi)' }}>MoonPay</span>
                        </div>
                        <ExternalLink size={16} color="var(--fk-text-mid)" />
                      </button>
                      <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, background: 'var(--fk-surface-1)', border: '1px solid var(--fk-line)', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--fk-surface-2)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--fk-surface-1)'}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 32, height: 32, background: '#6366f1', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: 14 }}>S</div>
                          <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--fk-text-hi)' }}>Stripe</span>
                        </div>
                        <ExternalLink size={16} color="var(--fk-text-mid)" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* View 3: On-chain */}
              {depositMethod === 'onchain' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div style={{ padding: '16px 20px', background: 'rgba(234, 179, 8, 0.05)', borderLeft: '3px solid #eab308', borderRadius: '0 8px 8px 0' }}>
                    <p style={{ fontSize: 13, color: 'var(--fk-text-hi)', lineHeight: 1.6, margin: 0 }}>Please ensure you only send <strong>USDC</strong> assets using the <strong>Polygon (MATIC)</strong> or <strong>Ethereum (ERC-20)</strong> networks. Sending other coins or using other networks will result in permanent loss of your assets.</p>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                    {/* Dummy QR Code */}
                    <div style={{ padding: 16, background: '#fff', borderRadius: 16 }}>
                      <div style={{ width: 180, height: 180, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                        <div style={{ width: '90%', height: '90%', background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Cpath fill=\'%23fff\' d=\'M10 10h30v30H10zm5 5v20h20V15zm-5 45h30v30H10zm5 5v20h20V65zM55 10h30v30H55zm5 5v20h20V15zM55 60h10v10H55zm0 15h10v10H55zm15-15h10v10H70zm15 15h10v10H85zm-15 15h10v10H70zm15-30h10v10H85z\'/%3E%3C/svg%3E")' }} />
                        <div style={{ position: 'absolute', width: 40, height: 40, background: '#fff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <TokenLogo logo="https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=026" symbol="USDC" size={24} isGain={true} />
                        </div>
                      </div>
                    </div>

                    <div style={{ width: '100%' }}>
                      <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--fk-text-low)', marginBottom: 8, textAlign: 'center' }}>Your Frakta Wallet Address</div>
                      <div style={{ display: 'flex', alignItems: 'center', background: 'var(--fk-surface-1)', border: '1px solid var(--fk-line)', borderRadius: 12, padding: 4 }}>
                        <div className="fk-mono" style={{ flex: 1, padding: '12px 16px', fontSize: 13, color: 'var(--fk-text-hi)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {privyUser.wallet || '0x0000000000000000000000000000000000000000'}
                        </div>
                        <button onClick={() => handleCopy(privyUser.wallet || '0x0000000000000000000000000000000000000000')} className="fk-btn" style={{ padding: '10px 16px', background: 'var(--fk-surface-2)', display: 'flex', alignItems: 'center', gap: 6, color: copied ? 'var(--fk-gain)' : 'var(--fk-text-hi)' }}>
                          {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                          <span style={{ fontSize: 13, fontWeight: 500 }}>{copied ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Send Modal */}
      {showSendModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="fk-card" style={{ width: 480, maxWidth: '90%', padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'fadeIn 0.2s ease-out' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', borderBottom: '1px solid var(--fk-line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {sendStep === 'confirm' && (
                  <button onClick={() => setSendStep('form')} style={{ background: 'transparent', border: 'none', color: 'var(--fk-text-mid)', cursor: 'pointer', padding: 0, display: 'flex' }}>
                    <ArrowLeft size={20} />
                  </button>
                )}
                <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--fk-text-hi)' }}>
                  {sendStep === 'form' && 'Send Asset'}
                  {sendStep === 'confirm' && 'Confirm Transaction'}
                  {sendStep === 'success' && 'Transaction Sent'}
                </h2>
              </div>
              <button onClick={() => setShowSendModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--fk-text-mid)', cursor: 'pointer', padding: 0, display: 'flex' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              
              {/* Step 1: Form */}
              {sendStep === 'form' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--fk-text-mid)', marginBottom: 8 }}>Asset</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px', background: 'var(--fk-surface-1)', border: '1px solid var(--fk-line)', borderRadius: 12 }}>
                      <TokenLogo logo="https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=026" symbol="USDC" size={24} isGain={true} />
                      <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--fk-text-hi)' }}>USDC</span>
                      <span style={{ marginLeft: 'auto', fontSize: 14, color: 'var(--fk-text-mid)' }}>Balance: 12,450.00</span>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--fk-text-mid)' }}>Amount</label>
                      <button onClick={() => setSendAmount('12450')} style={{ background: 'transparent', border: 'none', color: 'var(--fk-blue)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>MAX</button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', padding: '16px', background: 'var(--fk-surface-0)', border: '1px solid var(--fk-line)', borderRadius: 12 }}>
                      <input type="number" value={sendAmount} onChange={e => setSendAmount(e.target.value)} placeholder="0.00" style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: 24, fontWeight: 700, color: 'var(--fk-text-hi)' }} className="fk-mono" />
                      <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--fk-text-mid)' }}>USDC</span>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--fk-text-mid)', marginBottom: 8 }}>Send to</label>
                    <input type="text" value={sendAddress} onChange={e => setSendAddress(e.target.value)} placeholder="Enter ENS name or 0x address" style={{ width: '100%', padding: '16px', background: 'var(--fk-surface-0)', border: '1px solid var(--fk-line)', borderRadius: 12, fontSize: 14, color: 'var(--fk-text-hi)' }} className="fk-mono" />
                  </div>

                  <button onClick={() => setSendStep('confirm')} disabled={!sendAmount || !sendAddress} className="fk-btn fk-btn-primary" style={{ width: '100%', padding: '16px', fontSize: 16, marginTop: 8, opacity: (!sendAmount || !sendAddress) ? 0.5 : 1 }}>
                    Review Transaction
                  </button>

                </div>
              )}

              {/* Step 2: Confirm */}
              {sendStep === 'confirm' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0' }}>
                    <div className="fk-mono" style={{ fontSize: 40, fontWeight: 700, color: 'var(--fk-text-hi)', marginBottom: 8 }}>{sendAmount} <span style={{ fontSize: 20, color: 'var(--fk-text-mid)' }}>USDC</span></div>
                    <div style={{ fontSize: 14, color: 'var(--fk-text-mid)' }}>≈ $ {Number(sendAmount).toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                  </div>

                  <div style={{ background: 'var(--fk-surface-1)', borderRadius: 12, padding: '16px', border: '1px solid var(--fk-line)', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 14, color: 'var(--fk-text-mid)' }}>From</span>
                      <span className="fk-mono" style={{ fontSize: 14, color: 'var(--fk-text-hi)' }}>{privyUser.wallet || '0x000...000'}</span>
                    </div>
                    <div style={{ height: 1, background: 'var(--fk-line-soft)' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 14, color: 'var(--fk-text-mid)' }}>To</span>
                      <span className="fk-mono" style={{ fontSize: 14, color: 'var(--fk-text-hi)' }}>{sendAddress.substring(0,6)}...{sendAddress.substring(sendAddress.length - 4)}</span>
                    </div>
                    <div style={{ height: 1, background: 'var(--fk-line-soft)' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 14, color: 'var(--fk-text-mid)' }}>Network Fee</span>
                      <span className="fk-mono" style={{ fontSize: 14, color: 'var(--fk-text-hi)' }}>0.15 USDC <span style={{ color: 'var(--fk-text-low)' }}>($0.15)</span></span>
                    </div>
                  </div>

                  <button onClick={handleSend} disabled={isSending} className="fk-btn fk-btn-primary" style={{ width: '100%', padding: '16px', fontSize: 16, marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    {isSending ? (
                      <>
                        <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}><Loader2 size={20} /></span>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Confirm Send
                      </>
                    )}
                  </button>

                </div>
              )}

              {/* Step 3: Success */}
              {sendStep === 'success' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0 16px', textAlign: 'center', gap: 24 }}>
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', color: 'var(--fk-gain)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircle2 size={48} />
                  </div>
                  
                  <div>
                    <h3 style={{ fontSize: 24, fontWeight: 700, color: 'var(--fk-text-hi)', marginBottom: 8 }}>Transaction Sent</h3>
                    <p style={{ fontSize: 15, color: 'var(--fk-text-mid)', lineHeight: 1.5 }}>You have successfully sent {sendAmount} USDC to {sendAddress.substring(0,6)}...{sendAddress.substring(sendAddress.length - 4)}.</p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', marginTop: 16 }}>
                    <button style={{ width: '100%', padding: '16px', background: 'var(--fk-surface-1)', border: '1px solid var(--fk-line)', borderRadius: 12, color: 'var(--fk-text-hi)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 15, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--fk-surface-2)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--fk-surface-1)'}>
                      View on Explorer <ExternalLink size={16} />
                    </button>
                    <button onClick={() => setShowSendModal(false)} className="fk-btn fk-btn-primary" style={{ width: '100%', padding: '16px', fontSize: 16 }}>
                      Done
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  )
}
