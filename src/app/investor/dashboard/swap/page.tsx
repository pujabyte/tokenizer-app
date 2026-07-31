'use client'
import { useState, useEffect } from 'react'
import { ArrowDown, Settings, ChevronDown, CheckCircle, Loader2 } from 'lucide-react'
import { TokenLogo } from '@/components/ui/token-logo'

export default function SwapPage() {
  const [tokens, setTokens] = useState<any[]>([])
  const [payToken, setPayToken] = useState<any>(null)
  const [receiveToken, setReceiveToken] = useState<any>(null)
  const [payAmount, setPayAmount] = useState('1000')
  
  // Modals
  const [showSettings, setShowSettings] = useState(false)
  const [slippage, setSlippage] = useState('0.5')
  const [selectingFor, setSelectingFor] = useState<'pay' | 'receive' | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Transaction state
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')

  useEffect(() => {
    fetch('/api/investor/tokens')
      .then(res => res.json())
      .then(d => {
        setTokens(d.assets)
        const usdc = d.assets.find((t:any) => t.symbol === 'USDC') || d.assets[0]
        const aapl = d.assets.find((t:any) => t.symbol === 'AAPLon') || d.assets[1]
        setPayToken(usdc)
        setReceiveToken(aapl)
      })
  }, [])

  const parsePrice = (priceStr: string) => {
    if (!priceStr) return 0;
    return parseFloat(priceStr.replace(/[^0-9.-]+/g,""));
  }

  const receiveAmount = (() => {
    if (!payToken || !receiveToken || !payAmount || isNaN(Number(payAmount))) return ''
    const pPrice = parsePrice(payToken.price)
    const rPrice = parsePrice(receiveToken.price)
    if (rPrice === 0) return ''
    return ((Number(payAmount) * pPrice) / rPrice).toFixed(4)
  })()
  
  const exchangeRate = (() => {
     if (!payToken || !receiveToken) return ''
     const pPrice = parsePrice(payToken.price)
     const rPrice = parsePrice(receiveToken.price)
     if (pPrice === 0) return ''
     return `1 ${receiveToken.symbol} = ${(rPrice/pPrice).toFixed(4)} ${payToken.symbol}`
  })()

  const handleSwap = () => {
    if (!payToken || !receiveToken || !payAmount) return
    setStatus('loading')
    setTimeout(() => {
      setStatus('success')
      setTimeout(() => {
        setStatus('idle')
        setPayAmount('')
      }, 3000)
    }, 1500)
  }

  const switchTokens = () => {
    const temp = payToken
    setPayToken(receiveToken)
    setReceiveToken(temp)
    setPayAmount(receiveAmount)
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 40 }}>
      
      {/* Token Selector Modal */}
      {selectingFor && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="fk-card" style={{ width: 440, maxWidth: '90%', padding: 24, maxHeight: 520, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--fk-text-hi)' }}>Select a token</h2>
              <button onClick={() => setSelectingFor(null)} style={{ background: 'transparent', border: 'none', color: 'var(--fk-text-mid)', cursor: 'pointer', fontSize: 20 }}>✕</button>
            </div>
            <input 
              type="text" 
              className="fk-input" 
              placeholder="Search name or symbol" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ marginBottom: 16, width: '100%', padding: '12px 16px', fontSize: 15 }}
            />
            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 4, paddingRight: 8, margin: '0 -8px' }}>
              {tokens.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.symbol.toLowerCase().includes(searchQuery.toLowerCase())).map(t => (
                <div 
                  key={t.id} 
                  onClick={() => {
                    if (selectingFor === 'pay') setPayToken(t)
                    else setReceiveToken(t)
                    setSelectingFor(null)
                    setSearchQuery('')
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12, cursor: 'pointer', transition: 'background 0.2s', margin: '0 8px' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--fk-surface-1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <TokenLogo logo={t.logo} symbol={t.symbol} size={36} isGain={true} />
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--fk-text-hi)' }}>{t.symbol}</div>
                    <div style={{ fontSize: 12, color: 'var(--fk-text-mid)' }}>{t.name}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <div className="fk-mono" style={{ fontWeight: 600, color: 'var(--fk-text-hi)' }}>{t.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="fk-card" style={{ width: '100%', maxWidth: 480, padding: 24 }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--fk-text-hi)' }}>{showSettings ? 'Transaction Settings' : 'Swap'}</h1>
          <button onClick={() => setShowSettings(!showSettings)} style={{ background: showSettings ? 'var(--fk-surface-2)' : 'transparent', border: 'none', color: 'var(--fk-text-mid)', cursor: 'pointer', padding: 8, borderRadius: 8, display: 'flex', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--fk-surface-2)'} onMouseLeave={e => e.currentTarget.style.background = showSettings ? 'var(--fk-surface-2)' : 'transparent'}>
            <Settings size={20} style={{ color: showSettings ? 'var(--fk-text-hi)' : 'var(--fk-text-mid)' }} />
          </button>
        </div>

        {showSettings ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fk-text-hi)', marginBottom: 12 }}>Slippage Tolerance</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {['0.1', '0.5', '1.0'].map(val => (
                  <button 
                    key={val}
                    onClick={() => setSlippage(val)}
                    style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: slippage === val ? '1px solid var(--fk-blue)' : '1px solid var(--fk-line)', background: slippage === val ? 'rgba(37, 99, 235, 0.1)' : 'var(--fk-surface-1)', color: slippage === val ? 'var(--fk-blue-bright)' : 'var(--fk-text-hi)', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    {val}%
                  </button>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--fk-surface-1)', border: '1px solid var(--fk-line)', borderRadius: 8, padding: '0 12px', width: 100 }}>
                  <input className="fk-mono" type="text" placeholder="Custom" style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: 'var(--fk-text-hi)', fontSize: 13 }} />
                  <span style={{ color: 'var(--fk-text-mid)', fontSize: 13 }}>%</span>
                </div>
              </div>
            </div>
            
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fk-text-hi)', marginBottom: 12 }}>Transaction Deadline</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--fk-surface-1)', border: '1px solid var(--fk-line)', borderRadius: 8, padding: '8px 12px', width: 80 }}>
                  <input className="fk-mono" type="text" defaultValue="20" style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: 'var(--fk-text-hi)', fontSize: 13, textAlign: 'center' }} />
                </div>
                <span style={{ color: 'var(--fk-text-mid)', fontSize: 13 }}>minutes</span>
              </div>
            </div>
            
            <button onClick={() => setShowSettings(false)} className="fk-btn fk-btn-primary" style={{ width: '100%', marginTop: 8, padding: '12px' }}>
              Save & Close
            </button>
          </div>
        ) : (
          <>

        {/* You Pay Section */}
        <div style={{ background: 'var(--fk-surface-1)', borderRadius: 16, padding: 16, marginBottom: 8, border: '1px solid var(--fk-line)' }}>
          <div style={{ fontSize: 13, color: 'var(--fk-text-mid)', marginBottom: 8 }}>You Pay</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <input 
              type="text" 
              className="fk-mono"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 28, fontWeight: 700, color: 'var(--fk-text-hi)', width: '60%' }} 
              placeholder="0.0"
            />
            {payToken ? (
              <button onClick={() => setSelectingFor('pay')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--fk-surface-2)', border: '1px solid var(--fk-line-soft)', padding: '6px 12px', borderRadius: 999, cursor: 'pointer', color: 'var(--fk-text-hi)', fontWeight: 600, transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--fk-surface-3)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--fk-surface-2)'}>
                <TokenLogo logo={payToken.logo} symbol={payToken.symbol} size={24} isGain={true} />
                <span>{payToken.symbol}</span>
                <ChevronDown size={16} color="var(--fk-text-mid)" />
              </button>
            ) : (
              <div style={{ width: 100, height: 36, background: 'var(--fk-surface-2)', borderRadius: 999, animation: 'pulse 2s infinite' }} />
            )}
          </div>
          <div style={{ fontSize: 13, color: 'var(--fk-text-mid)', marginTop: 8 }}>Balance: 12,450.00 {payToken?.symbol}</div>
        </div>

        {/* Swap Arrow */}
        <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', height: 16, margin: '-12px 0' }}>
          <div style={{ position: 'absolute', top: -4, background: 'var(--fk-surface-0)', padding: 4, borderRadius: '50%', zIndex: 10 }}>
            <button onClick={switchTokens} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--fk-surface-2)', border: '1px solid var(--fk-line)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fk-text-hi)', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--fk-surface-3)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--fk-surface-2)'}>
              <ArrowDown size={16} />
            </button>
          </div>
        </div>

        {/* You Receive Section */}
        <div style={{ background: 'var(--fk-surface-1)', borderRadius: 16, padding: 16, marginTop: 8, border: '1px solid var(--fk-line)' }}>
          <div style={{ fontSize: 13, color: 'var(--fk-text-mid)', marginBottom: 8 }}>You Receive</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <input 
              type="text" 
              className="fk-mono"
              value={receiveAmount}
              readOnly
              style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 28, fontWeight: 700, color: 'var(--fk-text-hi)', width: '60%', opacity: 0.8 }} 
              placeholder="0.0"
            />
            {receiveToken ? (
              <button onClick={() => setSelectingFor('receive')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--fk-surface-2)', border: '1px solid var(--fk-line-soft)', padding: '6px 12px', borderRadius: 999, cursor: 'pointer', color: 'var(--fk-text-hi)', fontWeight: 600, transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--fk-surface-3)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--fk-surface-2)'}>
                <TokenLogo logo={receiveToken.logo} symbol={receiveToken.symbol} size={24} isGain={true} />
                <span>{receiveToken.symbol}</span>
                <ChevronDown size={16} color="var(--fk-text-mid)" />
              </button>
            ) : (
              <div style={{ width: 100, height: 36, background: 'var(--fk-surface-2)', borderRadius: 999, animation: 'pulse 2s infinite' }} />
            )}
          </div>
          <div style={{ fontSize: 13, color: 'var(--fk-text-mid)', marginTop: 8 }}>Balance: 50.00 {receiveToken?.symbol}</div>
        </div>

        {/* Swap Details */}
        <div style={{ padding: '16px 8px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: 'var(--fk-text-mid)' }}>Exchange Rate</span>
            <span className="fk-mono" style={{ color: 'var(--fk-text-hi)', fontWeight: 600 }}>{exchangeRate}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: 'var(--fk-text-mid)' }}>Network Fee</span>
            <span className="fk-mono" style={{ color: 'var(--fk-text-hi)', fontWeight: 600 }}>$ 0.12</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: 'var(--fk-text-mid)' }}>Slippage Tolerance</span>
            <span className="fk-mono" style={{ color: 'var(--fk-text-hi)', fontWeight: 600 }}>{slippage}%</span>
          </div>
        </div>

        {/* Action Button */}
        {status === 'success' ? (
          <button className="fk-btn fk-btn-primary" style={{ width: '100%', padding: '16px', fontSize: 16, marginTop: 8, background: 'var(--fk-gain)', borderColor: 'var(--fk-gain)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <CheckCircle size={20} /> Swap Successful!
          </button>
        ) : (
          <button 
            className="fk-btn fk-btn-primary" 
            onClick={handleSwap}
            disabled={status === 'loading' || !payAmount || Number(payAmount) === 0}
            style={{ width: '100%', padding: '16px', fontSize: 16, marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: (status === 'loading' || !payAmount) ? 0.7 : 1 }}
          >
            {status === 'loading' ? (
              <>
                 <span className="animate-spin" style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}><Loader2 size={20} /></span> 
                 Swapping...
              </>
            ) : (
              'Confirm Swap'
            )}
          </button>
        )}
        </>
        )}

      </div>
    </div>
  )
}
