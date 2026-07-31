'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, LayoutGrid, List, LineChart, Building2, CircleDollarSign, Zap } from 'lucide-react'
import { TokenLogo } from '@/components/ui/token-logo'

export default function InvestorDashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('All assets')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortMode, setSortMode] = useState('Most Popular')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetch('/api/investor/tokens')
      .then(res => res.json())
      .then(d => {
        setData(d)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div style={{ padding: 48, color: 'var(--fk-text-mid)' }}>Loading dashboard...</div>
  }

  const { assets: ASSETS, topGainers: TOP_GAINERS, trending: TRENDING, newlyAdded: NEWLY_ADDED, categories } = data

  let filteredAssets = ASSETS.filter((a: any) => activeFilter === 'All assets' || a.category === activeFilter)

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase()
    filteredAssets = filteredAssets.filter((a: any) => 
      a.name.toLowerCase().includes(q) || 
      a.symbol.toLowerCase().includes(q)
    )
  }

  if (sortMode === 'Top Gainers') {
    filteredAssets = [...filteredAssets].sort((a, b) => parseFloat(b.change) - parseFloat(a.change))
  } else if (sortMode === 'Top Losers') {
    filteredAssets = [...filteredAssets].sort((a, b) => parseFloat(a.change) - parseFloat(b.change))
  }

  return (
    <div>
      {/* Banner */}
      <div style={{
        background: 'var(--fk-blue)',
        borderRadius: 16, padding: '40px 48px', marginBottom: 48,
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Abstract graphic "1/" */}
        <div style={{ position: 'absolute', right: 20, bottom: -40, opacity: 0.1, pointerEvents: 'none', userSelect: 'none' }}>
           <span style={{ fontSize: 240, fontWeight: 900, fontFamily: 'var(--font-family-display)', lineHeight: 1, color: '#fff' }}>1/</span>
        </div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 600 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', color: 'rgba(255,255,255,.8)', marginBottom: 12, textTransform: 'uppercase' }}>
            Initial Offering
          </p>
          <h1 style={{ fontSize: 36, fontWeight: 700, color: '#fff', marginBottom: 12, fontFamily: 'monospace' }}>
            1500 Broadway NYC
          </h1>
          <p style={{ fontSize: 15, color: '#fff', marginBottom: 24, fontFamily: 'monospace' }}>
            $ 520.00 / token • yield 5.2% p.a. • remaining 2,140/5,000
          </p>
          <button style={{
            background: '#fff', border: 'none',
            color: 'var(--fk-blue)', padding: '12px 24px', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer'
          }}>
            View offering
          </button>
        </div>
      </div>

      {/* 3 Columns Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 64 }}>
        
        {/* Top Gainers */}
        <div style={{ position: 'relative', overflow: 'hidden', background: 'var(--fk-surface-1)', border: '1px solid var(--fk-line)', borderRadius: 'var(--r-lg)', padding: '24px' }}>
          <div style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, background: 'var(--fk-blue)', filter: 'blur(100px)', borderRadius: '50%', opacity: 0.2, pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--fk-text-hi)' }}>Top Gainers</h2>
              <span style={{ fontSize: 10, background: 'rgba(255,255,255,.1)', padding: '2px 6px', borderRadius: 4, color: 'var(--fk-text-mid)' }}>24H</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {TOP_GAINERS.map((item: any, i: number) => (
              <Link href={`/investor/dashboard/token/${item.id}`} key={item.symbol} style={{ textDecoration: 'none', display: 'block' }}>
                <div 
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', margin: '0 -12px', borderRadius: 'var(--r-md)', transition: 'background .2s', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--fk-surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <TokenLogo logo={item.logo} symbol={item.symbol} size={36} isGain={true} />
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--fk-text-hi)' }}>{item.symbol}</p>
                      <p style={{ fontSize: 12, color: 'var(--fk-text-low)' }}>{item.name}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--fk-text-hi)' }}>${item.price.toFixed(2)}</p>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--fk-gain)' }}>▲ {item.change.toFixed(2)}%</p>
                  </div>
                </div>
              </Link>
            ))}
            </div>
          </div>
        </div>

        {/* Trending */}
        <div style={{ position: 'relative', overflow: 'hidden', background: 'var(--fk-surface-1)', border: '1px solid var(--fk-line)', borderRadius: 'var(--r-lg)', padding: '24px' }}>
          <div style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, background: 'var(--fk-blue)', filter: 'blur(100px)', borderRadius: '50%', opacity: 0.2, pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--fk-text-hi)' }}>Trending</h2>
              <span style={{ fontSize: 10, background: 'rgba(255,255,255,.1)', padding: '2px 6px', borderRadius: 4, color: 'var(--fk-text-mid)' }}>24H</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {TRENDING.map((item: any, i: number) => (
              <Link href={`/investor/dashboard/token/${item.id}`} key={item.symbol} style={{ textDecoration: 'none', display: 'block' }}>
                <div 
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', margin: '0 -12px', borderRadius: 'var(--r-md)', transition: 'background .2s', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--fk-surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <TokenLogo logo={item.logo} symbol={item.symbol} size={36} isGain={true} />
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--fk-text-hi)' }}>{item.symbol}</p>
                      <p style={{ fontSize: 12, color: 'var(--fk-text-low)' }}>{item.name}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--fk-text-hi)' }}>${item.price.toFixed(2)}</p>
                    <p style={{ fontSize: 12, color: 'var(--fk-text-low)' }}>{item.vol}</p>
                  </div>
                </div>
              </Link>
            ))}
            </div>
          </div>
        </div>

        {/* Newly Added */}
        <div style={{ position: 'relative', overflow: 'hidden', background: 'var(--fk-surface-1)', border: '1px solid var(--fk-line)', borderRadius: 'var(--r-lg)', padding: '24px' }}>
          <div style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, background: 'var(--fk-blue)', filter: 'blur(100px)', borderRadius: '50%', opacity: 0.2, pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--fk-text-hi)' }}>Newly Added</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {NEWLY_ADDED.map((item: any, i: number) => (
              <Link href={`/investor/dashboard/token/${item.id}`} key={item.symbol} style={{ textDecoration: 'none', display: 'block' }}>
                <div 
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', margin: '0 -12px', borderRadius: 'var(--r-md)', transition: 'background .2s', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--fk-surface-2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <TokenLogo logo={item.logo} symbol={item.symbol} size={36} isGain={true} />
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--fk-text-hi)' }}>{item.symbol}</p>
                      <p style={{ fontSize: 12, color: 'var(--fk-text-low)' }}>{item.name.length > 20 ? item.name.substring(0,17)+'...' : item.name}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--fk-text-hi)' }}>${item.price.toFixed(2)}</p>
                    <p style={{ fontSize: 12, color: 'var(--fk-text-low)' }}>{item.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
            </div>
          </div>
        </div>

      </div>

      {/* Explore Assets */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--fk-text-hi)' }}>Explore Assets</h2>
          </div>

        </div>

        {/* Filters bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--fk-surface-1)', border: '1px solid var(--fk-line)', borderRadius: 8, padding: '8px 12px', width: 280 }}>
            <Search size={16} color="var(--fk-text-low)" />
            <input 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--fk-text-hi)', fontSize: 13, marginLeft: 8, width: '100%' }} 
              placeholder="Search assets..." 
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, overflowX: 'auto', flex: 1 }}>
            {categories.map((catName: string) => {
              let Icon = LayoutGrid
              if (catName === 'Stock') Icon = LineChart
              if (catName === 'RWA') Icon = Building2
              if (catName === 'Stablecoin') Icon = CircleDollarSign
              if (catName === 'Utility Token') Icon = Zap

              return (
                <button key={catName} onClick={() => setActiveFilter(catName)} style={{
                  background: activeFilter === catName ? 'var(--fk-surface-2)' : 'transparent',
                  border: activeFilter === catName ? '1px solid var(--fk-line)' : '1px solid transparent',
                  color: activeFilter === catName ? 'var(--fk-text-hi)' : 'var(--fk-text-mid)',
                  padding: '8px 16px', borderRadius: 999, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap',
                  display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s'
                }}>
                  <Icon size={14} style={{ color: activeFilter === catName ? 'var(--fk-blue-soft)' : 'var(--fk-text-low)' }} />
                  {catName}
                </button>
              )
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', background: 'rgba(255,255,255,.05)', borderRadius: 8, overflow: 'hidden' }}>
              <button onClick={() => setViewMode('grid')} style={{ padding: '8px', background: viewMode === 'grid' ? 'rgba(255,255,255,.1)' : 'transparent', border: 'none', cursor: 'pointer', color: viewMode === 'grid' ? 'var(--fk-text-hi)' : 'var(--fk-text-mid)' }}><LayoutGrid size={16} /></button>
              <button onClick={() => setViewMode('list')} style={{ padding: '8px', background: viewMode === 'list' ? 'rgba(255,255,255,.1)' : 'transparent', border: 'none', cursor: 'pointer', color: viewMode === 'list' ? 'var(--fk-text-hi)' : 'var(--fk-text-mid)' }}><List size={16} /></button>
            </div>
            <select value={sortMode} onChange={e => setSortMode(e.target.value)} style={{ background: 'rgba(255,255,255,.05)', border: 'none', color: 'var(--fk-text-hi)', padding: '8px 12px', borderRadius: 8, outline: 'none', fontSize: 13, cursor: 'pointer' }}>
              <option value="Most Popular">Most Popular</option>
              <option value="Top Gainers">Top Gainers</option>
              <option value="Top Losers">Top Losers</option>
            </select>
          </div>
        </div>

        {/* Cards Grid / List */}
        {viewMode === 'grid' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 24 }}>
            {filteredAssets.map((asset: any) => (
            <Link key={asset.id} href={`/investor/dashboard/token/${asset.id}`} style={{ textDecoration: 'none' }}>
              <div 
                className="fk-card"
                style={{ 
                  padding: '24px', cursor: 'pointer', transition: 'transform .2s', display: 'flex', flexDirection: 'column'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <TokenLogo logo={asset.logo} symbol={asset.symbol} size={44} isGain={asset.isGain} />
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--fk-text-hi)', marginBottom: 2 }}>{asset.name}</h3>
                      <p className="fk-mono" style={{ fontSize: 12, color: 'var(--fk-text-mid)' }}>{asset.symbol} · {asset.type}</p>
                    </div>
                  </div>
                  <span className={`fk-badge ${asset.isGain ? 'fk-badge-gain' : 'fk-badge-loss'}`} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600 }}>
                    {asset.change}
                  </span>
                </div>

                <div style={{ position: 'relative', margin: '16px -24px 0', display: 'flex', flexDirection: 'column' }}>
                  
                  <div style={{ position: 'relative', zIndex: 1, padding: '0 24px', marginBottom: 20 }}>
                    <p className="fk-mono" style={{ fontSize: 28, fontWeight: 700, color: 'var(--fk-text-hi)', marginBottom: 4 }}>
                      {asset.price}
                    </p>
                    {asset.info && asset.info !== '-' && (
                      <p style={{ fontSize: 13, color: 'var(--fk-text-mid)' }}>
                        {asset.info}
                      </p>
                    )}
                  </div>

                  {/* Creative Background Sparkline */}
                  <div style={{ width: '100%', height: '60px', opacity: 0.6, pointerEvents: 'none', position: 'relative' }}>
                    <svg viewBox="0 0 100 40" preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible', position: 'absolute', bottom: 0, left: 0 }}>
                      <defs>
                        <linearGradient id={`grad-${asset.id}`} x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="var(--fk-blue)" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="var(--fk-blue)" stopOpacity="0" />
                        </linearGradient>
                        <filter id={`glow-${asset.id}`} x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="1.5" result="blur" />
                          <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                      </defs>
                      {asset.isGain ? (
                        <>
                          <path d="M0 35 Q 15 30, 30 32 T 60 20 T 80 15 T 100 5 L 100 40 L 0 40 Z" fill={`url(#grad-${asset.id})`} />
                          <path d="M0 35 Q 15 30, 30 32 T 60 20 T 80 15 T 100 5" fill="none" stroke="var(--fk-blue)" strokeWidth="1.2" filter={`url(#glow-${asset.id})`} />
                        </>
                      ) : (
                        <>
                          <path d="M0 10 Q 15 15, 30 12 T 60 25 T 80 20 T 100 35 L 100 40 L 0 40 Z" fill={`url(#grad-${asset.id})`} />
                          <path d="M0 10 Q 15 15, 30 12 T 60 25 T 80 20 T 100 35" fill="none" stroke="var(--fk-blue)" strokeWidth="1.2" filter={`url(#glow-${asset.id})`} />
                        </>
                      )}
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filteredAssets.map((asset: any) => (
              <Link key={asset.id} href={`/investor/dashboard/token/${asset.id}`} style={{ textDecoration: 'none' }}>
                <div 
                  className="fk-card"
                  style={{ 
                    padding: '16px 24px', cursor: 'pointer', transition: 'transform .2s', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
                    <TokenLogo logo={asset.logo} symbol={asset.symbol} size={40} isGain={asset.isGain} />
                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--fk-text-hi)' }}>{asset.name}</h3>
                      <p className="fk-mono" style={{ fontSize: 12, color: 'var(--fk-text-mid)' }}>{asset.symbol} · {asset.type}</p>
                    </div>
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                     {asset.info && asset.info !== '-' && (
                      <p style={{ fontSize: 13, color: 'var(--fk-text-mid)' }}>
                        {asset.info}
                      </p>
                    )}
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <p className="fk-mono" style={{ fontSize: 16, fontWeight: 700, color: 'var(--fk-text-hi)' }}>
                      {asset.price}
                    </p>
                    <span className={`fk-badge ${asset.isGain ? 'fk-badge-gain' : 'fk-badge-loss'}`} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 6px', borderRadius: 999, fontSize: 11, fontWeight: 600, marginTop: 4 }}>
                      {asset.change}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}


      </div>
    </div>
  )
}
