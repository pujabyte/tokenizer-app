'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Activity, Info, BarChart2, ShieldAlert, Tag, Building2, Box, Users, Globe, Layers, Coins, Hash, Hexagon } from 'lucide-react'
const SiPolygon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 38.4 33.5" fill="#8247E5">
    <path d="M29 10.2a2.6 2.6 0 0 0-2.6 0l-6 3.5-4.1 2.3-6 3.5a2.6 2.6 0 0 1-2.6 0L3 16.7a2.6 2.6 0 0 1-1.3-2.2v-6.8a2.6 2.6 0 0 1 1.3-2.2l4.6-2.7a2.6 2.6 0 0 1 2.6 0l4.6 2.7a2.6 2.6 0 0 1 1.3 2.2v3.5l4.1-2.4V5.3a2.6 2.6 0 0 0-1.3-2.2L11 .4a2.6 2.6 0 0 0-2.6 0L1.3 3.1A2.6 2.6 0 0 0 0 5.3v13.1a2.6 2.6 0 0 0 1.3 2.2l8.1 4.7a2.6 2.6 0 0 0 2.6 0l6-3.4 4.1-2.4 6-3.4a2.6 2.6 0 0 1 2.6 0l4.6 2.7a2.6 2.6 0 0 1 1.3 2.2v6.8a2.6 2.6 0 0 1-1.3 2.2l-4.6 2.7a2.6 2.6 0 0 1-2.6 0l-4.6-2.7a2.6 2.6 0 0 1-1.3-2.2v-3.5l-4.1 2.4v3.5a2.6 2.6 0 0 0 1.3 2.2l8.1 4.7a2.6 2.6 0 0 0 2.6 0l8.1-4.7a2.6 2.6 0 0 0 1.3-2.2V18.3a2.6 2.6 0 0 0-1.3-2.2z"/>
  </svg>
)
const FaEthereum = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 320 512" fill="#627EEA">
    <path d="M311.9 197.4L160 0 8.1 197.4l152 90.3 151.8-90.3zM160 0v287.7L8.1 197.4 160 0zm0 0v287.7l151.9-90.3L160 0zm0 320.3L8.1 230l151.9 282 151.9-282L160 320.3z"/>
  </svg>
)
import { TokenLogo } from '@/components/ui/token-logo'

export default function TokenDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [token, setToken] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  const [timeframe, setTimeframe] = useState('1D')
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    fetch(`/api/investor/tokens/${id}`)
      .then(res => res.json())
      .then(d => {
        setToken(d)
        setLoading(false)
      })
  }, [id])

  useEffect(() => {
    if (!id) return;
    fetch(`/api/investor/tokens/${id}/ohlc?timeframe=${timeframe}`)
      .then(res => res.json())
      .then(res => {
        if (res.data) {
          setChartData(res.data)
        }
      })
  }, [id, timeframe])

  const [tradeModalOpen, setTradeModalOpen] = useState(false)
  const [tradeSide, setTradeSide] = useState<'buy' | 'sell'>('buy')
  const [tradeAmount, setTradeAmount] = useState('')
  const [tradeStatus, setTradeStatus] = useState<'idle' | 'processing' | 'success'>('idle')
  const [attestationsModalOpen, setAttestationsModalOpen] = useState(false)
  const [rewardModalOpen, setRewardModalOpen] = useState(false)

  const handleTrade = () => {
    setTradeStatus('processing')
    setTimeout(() => {
      setTradeStatus('success')
      setTimeout(() => {
        setTradeModalOpen(false)
        setTradeStatus('idle')
        setTradeAmount('')
      }, 2000)
    }, 1500)
  }

  if (loading) {
    return <div style={{ padding: 48, color: 'var(--fk-text-mid)' }}>Loading token details...</div>
  }
  if (token.error) {
    return <div style={{ padding: 48, color: 'var(--fk-loss)' }}>Token not found</div>
  }

  return (
    <div>
      <Link href="/investor/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--fk-text-mid)', fontSize: 13, textDecoration: 'none', marginBottom: 32 }}>
        <ArrowLeft size={14} /> Back to Markets
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        {/* Main Column */}
        <div>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--fk-surface-2)' }}>
              {token.symbol[0]}
            </div>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--fk-text-hi)', marginBottom: 4 }}>{token.name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 14, color: 'var(--fk-text-mid)' }}>{token.symbol}</span>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 999, background: 'var(--fk-line)', border: '1px solid var(--fk-line)', color: 'var(--fk-text-low)' }}>
                  EXECUTION: {token.executionMode ? token.executionMode.toUpperCase() : 'UNKNOWN'}
                </span>
              </div>
            </div>
          </div>

          {/* Hero Chart Section */}
          <div style={{ position: 'relative', background: 'var(--fk-surface-2)', borderRadius: 'var(--r-lg)', border: '1px solid var(--fk-line)', overflow: 'hidden', marginBottom: 20 }}>
            
            {/* Top Info Overlay */}
            <div style={{ padding: '32px 32px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 10 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 700, color: 'var(--fk-text-hi)', letterSpacing: '-1px' }}>{token.price}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, padding: '4px 10px', borderRadius: 999, background: token.isGain ? 'rgba(37,212,138,0.1)' : 'rgba(255,95,87,0.1)', color: token.isGain ? 'var(--fk-gain)' : 'var(--fk-loss)' }}>
                    {token.change} (Past 24h)
                  </span>
                </div>
              </div>
              
              {/* Time Filters */}
              <div style={{ display: 'flex', background: 'var(--fk-surface-2)', borderRadius: 12, padding: 4, backdropFilter: 'blur(10px)', border: '1px solid var(--fk-line)' }}>
                {['1H', '1D', '1W', '1M', '6M', '1Y'].map(t => (
                  <button 
                    key={t} 
                    onClick={() => setTimeframe(t)}
                    style={{ background: t === timeframe ? 'var(--fk-surface-3)' : 'transparent', border: 'none', color: t === timeframe ? 'var(--fk-text-hi)' : 'var(--fk-text-mid)', fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s' }}>{t}</button>
                ))}
              </div>
            </div>

            {/* Edge-to-Edge Chart */}
            <div style={{ height: 260, position: 'relative', marginTop: -20 }}>
               <svg viewBox="0 0 100 40" preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                 {chartData.length > 0 && (() => {
                    const min = Math.min(...chartData.map(d => d.close))
                    const max = Math.max(...chartData.map(d => d.close))
                    const range = max - min || 1
                    
                    const pathData = chartData.map((d, i) => {
                      const x = (i / (chartData.length - 1)) * 100
                      const y = 35 - ((d.close - min) / range) * 30 // padding top and bottom
                      
                      if (i === 0) return `M ${x.toFixed(2)} ${y.toFixed(2)}`
                      
                      const prevX = ((i - 1) / (chartData.length - 1)) * 100
                      const prevY = 35 - ((chartData[i-1].close - min) / range) * 30
                      const midX = (prevX + x) / 2
                      
                      return `C ${midX.toFixed(2)} ${prevY.toFixed(2)}, ${midX.toFixed(2)} ${y.toFixed(2)}, ${x.toFixed(2)} ${y.toFixed(2)}`
                    }).join(' ')

                    const isGain = chartData[chartData.length - 1].close >= chartData[0].close

                    return (
                      <>
                        <path d={pathData} fill="none" stroke={isGain ? 'var(--fk-gain)' : 'var(--fk-loss)'} strokeWidth="0.4" strokeLinecap="round" />
                        <path d={`${pathData} L 100 40 L 0 40 Z`} fill={isGain ? 'rgba(37,212,138,0.15)' : 'rgba(255,95,87,0.15)'} />
                      </>
                    )
                 })()}
               </svg>
            </div>
          </div>

          {/* Bento Box Layout for Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            {/* Overview Card */}
            <div style={{ background: 'var(--fk-surface-2)', border: '1px solid var(--fk-line)', borderRadius: 'var(--r-lg)', padding: '24px', transition: 'background 0.3s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--fk-surface-hover, var(--fk-surface-3))'} onMouseLeave={e => e.currentTarget.style.background = 'var(--fk-surface-hover, var(--fk-surface-3))'}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Info size={16} color="var(--fk-blue)" />
                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--fk-text-hi)' }}>Asset Overview</h3>
              </div>
              <p style={{ fontSize: 14, color: 'var(--fk-text-mid)', lineHeight: 1.7 }}>
                {token.description || token.desc}
              </p>
            </div>

            {/* Grid of Mini Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
              
              {/* Dynamic Items */}
              {[
                { label: 'Category', value: token.category, Icon: Tag },
                { label: 'Issuer', value: token.issuer, Icon: Building2 },
                { label: 'Underlying Asset', value: token.underlying, Icon: Box },
                { label: 'Investor Type', value: token.investorType, Icon: Users },
                { label: 'Jurisdiction', value: token.legalJurisdiction, Icon: Globe },
                { label: 'Blockchain', value: token.blockchain, Icon: token.blockchain === 'Ethereum' ? Layers : token.blockchain === 'Polygon' ? Hexagon : Layers },
                { label: 'Total Supply', value: token.totalSupply, isMono: true, Icon: Coins },
                { label: 'Decimals', value: token.decimals, isMono: true, Icon: Hash },
              ].map((item, i) => {
                const Icon = item.Icon;
                
                // Helper to render value with inline SVG for Blockchain
                let renderedValue = item.value || '-';
                if (item.label === 'Blockchain' && item.value === 'Polygon') {
                  renderedValue = (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <SiPolygon size={14} color="#8247E5" />
                      {item.value}
                    </div>
                  );
                } else if (item.label === 'Blockchain' && item.value === 'Ethereum') {
                  renderedValue = (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <FaEthereum size={14} color="#627EEA" />
                      {item.value}
                    </div>
                  );
                }

                return (
                <div key={i} style={{ background: 'var(--fk-surface-2)', border: '1px solid var(--fk-line)', borderRadius: 16, padding: '16px 20px', transition: 'all 0.2s', cursor: 'default' }} onMouseEnter={e => { e.currentTarget.style.background = 'var(--fk-surface-hover, var(--fk-surface-3))'; e.currentTarget.style.transform = 'translateY(-2px)' }} onMouseLeave={e => { e.currentTarget.style.background = 'var(--fk-surface-hover, var(--fk-surface-3))'; e.currentTarget.style.transform = 'none' }}>
                  <div style={{ fontSize: 12, color: 'var(--fk-blue-soft)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Icon size={14} />
                    <span style={{ color: 'var(--fk-text-low)' }}>{item.label}</span>
                  </div>
                  <div className={item.isMono ? "fk-mono" : ""} style={{ fontSize: 14, color: 'var(--fk-text-hi)', fontWeight: 500 }}>{renderedValue}</div>
                </div>
              )})}
            </div>

            {/* 2-Column Layout for APY and Contract Address */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {/* Special APY Card */}
              <div style={{ background: 'linear-gradient(135deg, rgba(37,212,138,0.1) 0%, rgba(37,212,138,0.02) 100%)', border: '1px solid rgba(37,212,138,0.2)', borderRadius: 16, padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--fk-gain)', marginBottom: 6, opacity: 0.9, fontWeight: 500 }}>Expected Yield (APY)</div>
                  <div style={{ fontSize: 24, color: 'var(--fk-gain)', fontWeight: 700 }}>{token.apy && token.apy !== '-' ? token.apy : 'N/A'}</div>
                </div>
                {token.yieldToken && token.yieldToken !== '-' && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: 'var(--fk-text-low)', marginBottom: 6 }}>Distributed in</div>
                    <div style={{ fontSize: 13, color: 'var(--fk-text-hi)', fontWeight: 600, padding: '4px 12px', background: 'var(--fk-surface-2)', borderRadius: 999, border: '1px solid var(--fk-line)' }}>{token.yieldToken}</div>
                  </div>
                )}
              </div>

              {/* Contract Address Card */}
              <div style={{ background: 'var(--fk-surface-2)', border: '1px solid var(--fk-line)', borderRadius: 16, padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'background 0.3s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--fk-surface-hover, var(--fk-surface-3))'} onMouseLeave={e => e.currentTarget.style.background = 'var(--fk-surface-hover, var(--fk-surface-3))'}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--fk-text-low)', marginBottom: 6 }}>Smart Contract Address</div>
                  <div className="fk-mono" style={{ fontSize: 16, color: 'var(--fk-blue-soft)', letterSpacing: 0.5 }}>
                    {token.contractAddress ? `${token.contractAddress.substring(0, 6)}...${token.contractAddress.substring(token.contractAddress.length - 4)}` : '-'}
                  </div>
                </div>
                <button style={{ background: 'var(--fk-surface-2)', border: '1px solid var(--fk-line)', borderRadius: 8, padding: '8px 16px', color: 'var(--fk-text-hi)', fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--fk-surface-hover, var(--fk-surface-3))'} onMouseLeave={e => e.currentTarget.style.background = 'var(--fk-surface-hover, var(--fk-surface-3))'}>Copy</button>
              </div>
            </div>

            {/* Documents Section */}
            <div style={{ background: 'var(--fk-surface-2)', border: '1px solid var(--fk-line)', borderRadius: 'var(--r-lg)', padding: '24px', transition: 'background 0.3s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--fk-surface-hover, var(--fk-surface-3))'} onMouseLeave={e => e.currentTarget.style.background = 'var(--fk-surface-hover, var(--fk-surface-3))'}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--fk-text-hi)', marginBottom: 16 }}>Official Documents</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {[
                  { label: 'Legal Document', link: token.legalDocument },
                  { label: 'Whitepaper', link: token.whitepaper },
                  { label: 'Prospectus', link: token.prospectus },
                  { label: 'Factsheet', link: token.factsheet },
                ].map((doc, idx) => doc.link && doc.link !== '-' ? (
                  <a key={idx} href={doc.link} target="_blank" rel="noreferrer" style={{ background: 'rgba(46,92,255,0.1)', border: '1px solid rgba(46,92,255,0.2)', color: 'var(--fk-blue-soft)', padding: '8px 16px', borderRadius: 999, fontSize: 13, fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(46,92,255,0.2)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(46,92,255,0.1)'}>
                    <Info size={14} /> {doc.label}
                  </a>
                ) : null)}
              </div>
            </div>

            {/* Attestations Section */}
            {token.attestations && token.attestations.length > 0 && (
              <div style={{ background: 'var(--fk-surface-2)', border: '1px solid var(--fk-line)', borderRadius: 'var(--r-lg)', padding: '24px', transition: 'background 0.3s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--fk-surface-hover, var(--fk-surface-3))'} onMouseLeave={e => e.currentTarget.style.background = 'var(--fk-surface-hover, var(--fk-surface-3))'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <ShieldAlert size={16} color="#25D48A" />
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--fk-text-hi)' }}>Monthly Attestation Reports</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {token.attestations.slice(0, 5).map((att: any) => (
                    <div key={att.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--fk-surface-2)', borderRadius: 8, border: '1px solid var(--fk-line)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--fk-text-hi)' }}>{att.date}</div>
                        <div style={{ fontSize: 12, color: 'var(--fk-text-mid)' }}>{att.type} by {att.auditor}</div>
                      </div>
                      <a href={att.link} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--fk-blue-soft)', textDecoration: 'none', fontWeight: 500 }}>View PDF</a>
                    </div>
                  ))}
                  {token.attestations.length > 5 && (
                    <button onClick={() => setAttestationsModalOpen(true)} style={{ background: 'var(--fk-surface-2)', border: 'none', color: 'var(--fk-text-hi)', padding: '10px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 4, transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--fk-surface-hover, var(--fk-surface-3))'} onMouseLeave={e => e.currentTarget.style.background = 'var(--fk-surface-hover, var(--fk-surface-3))'}>
                      View More
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Reward History Section */}
            {token.rewardHistory && token.rewardHistory.length > 0 && (
              <div style={{ background: 'var(--fk-surface-2)', border: '1px solid var(--fk-line)', borderRadius: 'var(--r-lg)', padding: '24px', transition: 'background 0.3s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--fk-surface-hover, var(--fk-surface-3))'} onMouseLeave={e => e.currentTarget.style.background = 'var(--fk-surface-hover, var(--fk-surface-3))'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <Activity size={16} color="var(--fk-blue)" />
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--fk-text-hi)' }}>Reward Distribution History</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {token.rewardHistory.slice(0, 5).map((rew: any) => (
                    <div key={rew.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--fk-surface-2)', borderRadius: 8, border: '1px solid var(--fk-line)' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--fk-text-hi)' }}>{rew.date}</div>
                        <div className="fk-mono" style={{ fontSize: 11, color: 'var(--fk-text-low)', marginTop: 4 }}>Tx: {rew.txHash}</div>
                      </div>
                      <div className="fk-mono" style={{ fontSize: 14, fontWeight: 600, color: 'var(--fk-gain)' }}>
                        +{rew.amount} {rew.currency}
                      </div>
                    </div>
                  ))}
                  {token.rewardHistory.length > 5 && (
                    <button onClick={() => setRewardModalOpen(true)} style={{ background: 'var(--fk-surface-2)', border: 'none', color: 'var(--fk-text-hi)', padding: '10px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', marginTop: 4, transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--fk-surface-hover, var(--fk-surface-3))'} onMouseLeave={e => e.currentTarget.style.background = 'var(--fk-surface-hover, var(--fk-surface-3))'}>
                      View More
                    </button>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Trade Column */}
        <div>
          <div style={{ background: 'var(--fk-surface-1)', border: '1px solid var(--fk-line)', borderRadius: 'var(--r-lg)', padding: '24px', position: 'sticky', top: 'calc(var(--header-height) + 24px)' }}>
            
            {/* Toggles */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, background: 'var(--fk-surface-2)', padding: 4, borderRadius: 12 }}>
              <button 
                onClick={() => setTradeSide('buy')}
                style={{ flex: 1, padding: '10px', border: 'none', borderRadius: 8, background: tradeSide === 'buy' ? 'rgba(37,212,138,.1)' : 'transparent', color: tradeSide === 'buy' ? '#25D48A' : 'var(--fk-text-mid)', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all .2s' }}
              >
                Buy
              </button>
              <button 
                onClick={() => setTradeSide('sell')}
                style={{ flex: 1, padding: '10px', border: 'none', borderRadius: 8, background: tradeSide === 'sell' ? 'rgba(255,95,87,.1)' : 'transparent', color: tradeSide === 'sell' ? '#FF5F57' : 'var(--fk-text-mid)', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all .2s' }}
              >
                Sell
              </button>
            </div>

            {/* Token Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
              <TokenLogo logo={(token as any).logo} symbol={token.symbol} size={40} isGain={token.isGain} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fk-text-hi)', marginBottom: 2 }}>{token.name}</div>
                <div className="fk-mono" style={{ fontSize: 12, color: 'var(--fk-text-low)' }}>{token.price} / token</div>
              </div>
            </div>

            {/* Input Area */}
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <input 
                className="fk-mono"
                value={tradeAmount}
                onChange={e => setTradeAmount(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="0"
                style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--fk-text-hi)', fontSize: 48, fontWeight: 700, textAlign: 'center', outline: 'none' }} 
              />
            </div>
            
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div className="fk-mono" style={{ fontSize: 13, color: 'var(--fk-text-mid)' }}>
                ≈ {token.price ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format((parseFloat(token.price.replace(/[^0-9.]/g, '')) || 0) * (parseInt(tradeAmount) || 0)) : '$ 0.00'}
              </div>
            </div>

            {/* Percentage Buttons */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
              {['25%', '50%', '75%', 'Maks'].map(pct => (
                <button key={pct} onClick={() => setTradeAmount(pct === 'Maks' ? '120' : pct.replace('%', ''))} style={{ flex: 1, background: 'transparent', border: '1px solid var(--fk-line)', borderRadius: 8, padding: '8px 0', color: 'var(--fk-text-mid)', fontSize: 12, cursor: 'pointer', transition: 'border-color .2s' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--fk-text-low)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--fk-line)'}>
                  {pct}
                </button>
              ))}
            </div>

            {/* Summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--fk-text-mid)' }}>Available balance</span>
                <span className="fk-mono" style={{ color: 'var(--fk-text-hi)' }}>$ 14,500.00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--fk-text-mid)' }}>Platform fee (0.15%)</span>
                <span className="fk-mono" style={{ color: 'var(--fk-text-hi)' }}>
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format((parseFloat(token.price.replace(/[^0-9.]/g, '')) || 0) * (parseInt(tradeAmount) || 0) * 0.0015)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--fk-text-mid)' }}>Estimated settlement</span>
                <span className="fk-mono" style={{ color: 'var(--fk-text-hi)' }}>2-4 mins</span>
              </div>
              
              <div style={{ height: 1, borderBottom: '1px dashed var(--fk-line)', margin: '4px 0' }}></div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--fk-text-hi)', fontWeight: 600 }}>Total</span>
                <span className="fk-mono" style={{ color: 'var(--fk-text-hi)', fontWeight: 700, fontSize: 14 }}>
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format((parseFloat(token.price.replace(/[^0-9.]/g, '')) || 0) * (parseInt(tradeAmount) || 0) * 1.0015)}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              onClick={() => setTradeModalOpen(true)}
              disabled={!tradeAmount || parseInt(tradeAmount) <= 0}
              className="fk-btn fk-btn-primary" 
              style={{ width: '100%', justifyContent: 'center', fontSize: 15, padding: '16px', background: 'var(--fk-blue)', border: 'none', color: 'var(--fk-text-hi)', opacity: !tradeAmount || parseInt(tradeAmount) <= 0 ? 0.5 : 1 }}
            >
              {tradeSide === 'buy' ? 'Buy' : 'Sell'} {tradeAmount || 0} {token.symbol} tokens
            </button>

          </div>
        </div>
      </div>

      {/* Trade Modal Overlay */}
      {tradeModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--glass-bg)', backdropFilter: 'blur(10px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: 400, background: 'var(--fk-surface-1)', border: '1px solid var(--glass-border)', borderRadius: 'var(--r-xl)', padding: '32px' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--fk-text-hi)', marginBottom: 24, textAlign: 'center' }}>Confirm Transaction</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid var(--fk-line)' }}>
                <span style={{ fontSize: 13, color: 'var(--fk-text-low)' }}>You Pay</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--fk-text-hi)' }}>${parseFloat(tradeAmount).toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid var(--fk-line)' }}>
                <span style={{ fontSize: 13, color: 'var(--fk-text-low)' }}>You Receive (Est.)</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--fk-text-hi)' }}>{(parseFloat(tradeAmount) / (parseFloat(token.price.replace(/[^0-9.]/g, '')) || 1)).toFixed(4)} {token.symbol}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid var(--fk-line)' }}>
                <span style={{ fontSize: 13, color: 'var(--fk-text-low)' }}>Execution Engine</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fk-blue)' }}>{token.executionMode ? token.executionMode.toUpperCase() : 'MANUAL'}</span>
              </div>
            </div>

            {tradeStatus === 'idle' ? (
              <div style={{ display: 'flex', gap: 12 }}>
                <button 
                  onClick={() => setTradeModalOpen(false)}
                  className="fk-btn" style={{ flex: 1, justifyContent: 'center', background: 'transparent', border: '1px solid var(--fk-line)' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleTrade}
                  className="fk-btn fk-btn-primary" style={{ flex: 1, justifyContent: 'center', background: tradeSide === 'buy' ? '#25D48A' : '#FF5F57', color: '#000', border: 'none' }}
                >
                  Confirm {tradeSide}
                </button>
              </div>
            ) : tradeStatus === 'processing' ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ width: 24, height: 24, border: '3px solid rgba(37,212,138,.3)', borderTopColor: '#25D48A', borderRadius: '50%', animation: 'auth-spin 1s linear infinite', margin: '0 auto 16px' }} />
                <p style={{ fontSize: 14, color: 'var(--fk-text-mid)' }}>Executing on {token.executionMode || 'Engine'}...</p>
                <style>{`@keyframes auth-spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(37,212,138,.1)', color: 'var(--fk-gain)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--fk-text-hi)' }}>Transaction Successful</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Attestations Modal */}
      {attestationsModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--glass-bg)', backdropFilter: 'blur(10px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ width: '100%', maxWidth: 500, maxHeight: '80vh', overflowY: 'auto', background: 'var(--fk-surface-1)', border: '1px solid var(--glass-border)', borderRadius: 'var(--r-xl)', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--fk-text-hi)' }}>All Attestation Reports</h2>
              <button onClick={() => setAttestationsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--fk-text-mid)', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {token.attestations.map((att: any) => (
                <div key={att.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--fk-surface-2)', borderRadius: 8, border: '1px solid var(--fk-line)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--fk-text-hi)' }}>{att.date}</div>
                    <div style={{ fontSize: 12, color: 'var(--fk-text-mid)' }}>{att.type} by {att.auditor}</div>
                  </div>
                  <a href={att.link} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--fk-blue-soft)', textDecoration: 'none', fontWeight: 500 }}>View PDF</a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reward History Modal */}
      {rewardModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--glass-bg)', backdropFilter: 'blur(10px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ width: '100%', maxWidth: 500, maxHeight: '80vh', overflowY: 'auto', background: 'var(--fk-surface-1)', border: '1px solid var(--glass-border)', borderRadius: 'var(--r-xl)', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--fk-text-hi)' }}>All Reward Distributions</h2>
              <button onClick={() => setRewardModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--fk-text-mid)', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {token.rewardHistory.map((rew: any) => (
                <div key={rew.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--fk-surface-2)', borderRadius: 8, border: '1px solid var(--fk-line)' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--fk-text-hi)' }}>{rew.date}</div>
                    <div className="fk-mono" style={{ fontSize: 11, color: 'var(--fk-text-low)', marginTop: 4 }}>Tx: {rew.txHash}</div>
                  </div>
                  <div className="fk-mono" style={{ fontSize: 14, fontWeight: 600, color: 'var(--fk-gain)' }}>
                    +{rew.amount} {rew.currency}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
