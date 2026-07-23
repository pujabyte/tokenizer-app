'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, ArrowUp, Check, ChevronRight, Layers, Coins, Vote, Zap, Shield, Package } from 'lucide-react'
import FraktaHorizontalLogo from '@/components/ui/FraktaHorizontalLogo'
import ConfigureTokenOrbitAnimation from '@/components/ui/ConfigureTokenOrbitAnimation'

/* ── Nav ─────────────────────────────────────────────────────────────── */
function Nav() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      transition: 'background-color .3s, backdrop-filter .3s, border-color .3s',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,.06)' : '1px solid transparent',
      backgroundColor: scrolled ? 'rgba(10,11,16,.85)' : 'transparent',
    }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', gap: 48 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <FraktaHorizontalLogo height={26} />
        </Link>

        <div className="lp-nav-links" style={{ display: 'flex', gap: 32, marginLeft: 8 }}>
          {['How it works', 'Assets', 'Why frakta'].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g,'-')}`} style={{ fontSize: 14, color: 'var(--fk-text-mid)', textDecoration: 'none', transition: 'color .2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--fk-text-mid)')}
            >{l}</a>
          ))}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/auth" className="fk-btn fk-btn-primary" style={{ fontSize: 14, gap: 6 }}>
            Launch App <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </nav>
  )
}

/* ── TypewriterHeadline ───────────────────────────────────────────────── */
const WORDS = ['Any asset.', 'Tokenized.', 'On-chain.']
const GRADIENT = { background: 'linear-gradient(90deg, #2E5CFF 0%, #6B85FF 45%, #2BBCB4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }
const TYPE_SPEED = 55
const DELETE_SPEED = 32
const HOLD_MS = 5000

function TypewriterHeadline() {
  const [wordIdx, setWordIdx] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [phase, setPhase] = useState<'typing' | 'holding' | 'deleting'>('typing')

  useEffect(() => {
    const word = WORDS[wordIdx]
    let timer: ReturnType<typeof setTimeout>

    if (phase === 'typing') {
      if (displayed.length < word.length) {
        timer = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), TYPE_SPEED)
      } else {
        timer = setTimeout(() => setPhase('holding'), HOLD_MS)
      }
    } else if (phase === 'holding') {
      setPhase('deleting')
    } else {
      if (displayed.length > 0) {
        timer = setTimeout(() => setDisplayed(d => d.slice(0, -1)), DELETE_SPEED)
      } else {
        setWordIdx(i => (i + 1) % WORDS.length)
        setPhase('typing')
      }
    }
    return () => clearTimeout(timer)
  }, [displayed, phase, wordIdx])

  const isGradient = wordIdx === 1
  return (
    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 4.8vw, 68px)', fontWeight: 900, lineHeight: .93, letterSpacing: '-.04em', color: '#fff', marginBottom: 16, minHeight: '1.1em' }}>
      <span style={isGradient ? GRADIENT : undefined}>{displayed}</span>
      <span style={{ display: 'inline-block', width: 3, height: '0.85em', background: isGradient ? '#6B85FF' : '#fff', marginLeft: 2, verticalAlign: 'middle', borderRadius: 2, animation: 'blink 1s step-end infinite' }} />
    </h1>
  )
}

/* ── Hero ─────────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="lp-hero-section" style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden', paddingTop: 64 }}>
      <style>{`
        @keyframes float-a { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-14px)} }
        @keyframes float-b { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-9px)} }
        @keyframes float-c { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-18px)} }
        @keyframes float-d { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-11px)} }
        @keyframes fade-hero { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        .hero-float { display: block }
        @media(max-width:1100px){.hero-float{display:none!important}}
      `}</style>

      {/* ── Background layers ── */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {/* Primary deep-blue orb — very large, dramatic */}
        <div style={{ position: 'absolute', top: '-12%', left: '50%', transform: 'translateX(-50%)', width: 1300, height: 860, background: 'radial-gradient(ellipse at 50% 32%, rgba(8,92,240,.52) 0%, rgba(8,92,240,.24) 28%, rgba(8,92,240,.07) 54%, transparent 70%)' }} />
        {/* Secondary cyan accent orb */}
        <div style={{ position: 'absolute', top: '28%', left: '44%', transform: 'translateX(-50%)', width: 720, height: 480, background: 'radial-gradient(ellipse, rgba(43,188,180,.07) 0%, transparent 65%)', filter: 'blur(32px)' }} />
        {/* Left ambient glow */}
        <div style={{ position: 'absolute', top: '8%', left: '-8%', width: 450, height: 650, background: 'radial-gradient(ellipse, rgba(46,92,255,.07) 0%, transparent 70%)', filter: 'blur(70px)' }} />
        {/* Right ambient glow */}
        <div style={{ position: 'absolute', top: '8%', right: '-8%', width: 450, height: 650, background: 'radial-gradient(ellipse, rgba(107,133,255,.07) 0%, transparent 70%)', filter: 'blur(70px)' }} />
        {/* Dot grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)', backgroundSize: '72px 72px', maskImage: 'radial-gradient(ellipse 92% 68% at 50% 22%, black 0%, transparent 100%)' }} />
        {/* Bottom scene fade */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 320, background: 'linear-gradient(to top, var(--fk-bg) 10%, transparent 100%)' }} />
      </div>

      {/* ── Floating orbital cards — contained in a centered max-width wrapper ── */}
      <div className="hero-float" style={{
        position: 'absolute', top: 0, bottom: 0, zIndex: 3,
        left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 1080, pointerEvents: 'none',
      }}>
        {/* Ambient glow clusters */}
        <div style={{ position: 'absolute', top: '30vh', left: '-30px', width: 240, height: 280, background: 'radial-gradient(ellipse, rgba(8,92,240,.1) 0%, transparent 70%)', filter: 'blur(48px)' }} />
        <div style={{ position: 'absolute', top: '28vh', right: '-30px', width: 240, height: 280, background: 'radial-gradient(ellipse, rgba(8,92,240,.1) 0%, transparent 70%)', filter: 'blur(48px)' }} />

        {/* ─── LEFT COLUMN ─── */}

        {/* Card: Live Token (top-left) */}
        <div style={{ position: 'absolute', top: '36vh', left: 0, width: 204, padding: '14px 16px', borderRadius: 14, background: 'rgba(12,15,26,.82)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', border: '1px solid rgba(255,255,255,.11)', boxShadow: '0 8px 48px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.04), inset 0 1px 0 rgba(255,255,255,.08)', animation: 'float-a 6.5s ease-in-out infinite' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,.3)' }}>Token</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: '#25D48A', backgroundColor: 'rgba(37,212,138,.1)', padding: '2px 8px', borderRadius: 999, border: '1px solid rgba(37,212,138,.2)' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: '#25D48A', boxShadow: '0 0 6px #25D48A', display: 'inline-block' }} />
              LIVE
            </span>
          </div>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4, letterSpacing: '-.01em' }}>Sandbox</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            {/* BSC / BNB Chain icon */}
            <svg width="14" height="14" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 0L19.56 3.56L9.78 13.34L6.22 9.78L16 0Z" fill="#F0B90B"/>
              <path d="M22.22 6.22L25.78 9.78L9.78 25.78L6.22 22.22L22.22 6.22Z" fill="#F0B90B"/>
              <path d="M3.56 12.44L7.12 16L3.56 19.56L0 16L3.56 12.44Z" fill="#F0B90B"/>
              <path d="M28.44 12.44L32 16L28.44 19.56L24.88 16L28.44 12.44Z" fill="#F0B90B"/>
              <path d="M9.78 18.66L13.34 22.22L16 19.56L18.66 22.22L22.22 18.66L16 32L9.78 18.66Z" fill="#F0B90B"/>
            </svg>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,.32)' }}>BNB Chain</span>
          </div>
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,.06)', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,.28)' }}>Supply</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,.55)', fontFamily: 'var(--font-mono)' }}>1,000,000</span>
          </div>
        </div>

        {/* ─── RIGHT COLUMN ─── */}

        {/* Card: Governance Vote (bottom-right) */}
        <div style={{ position: 'absolute', top: '53vh', right: '-8px', width: 208, padding: '14px 15px', borderRadius: 14, background: 'rgba(12,15,26,.82)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', border: '1px solid rgba(255,255,255,.11)', boxShadow: '0 8px 48px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.04), inset 0 1px 0 rgba(255,255,255,.08)', animation: 'float-b 6.2s ease-in-out infinite 3.5s' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>Vote Active</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#6B85FF', backgroundColor: 'rgba(107,133,255,.14)', padding: '2px 8px', borderRadius: 999, border: '1px solid rgba(107,133,255,.2)' }}>DAO</span>
          </div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,.38)', marginBottom: 10, lineHeight: 1.5 }}>Proposal #24 — Reserve ratio update</p>
          <div style={{ height: 4, borderRadius: 999, backgroundColor: 'rgba(255,255,255,.08)', overflow: 'hidden', marginBottom: 5 }}>
            <div style={{ height: '100%', width: '89%', borderRadius: 999, background: 'linear-gradient(90deg, #085CF0, #2BBCB4)' }} />
          </div>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,.22)' }}>89% approval · 2d left</p>
        </div>
      </div>

      {/* ── Center content ── */}
      <div className="lp-hero-content" style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 780, padding: '88px 32px 0', animation: 'fade-hero .9s ease-out both' }}>
        {/* Eyebrow */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 36, padding: '6px 16px', borderRadius: 999, border: '1px solid rgba(46,92,255,.4)', backgroundColor: 'rgba(46,92,255,.08)', backdropFilter: 'blur(8px)' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#25D48A', boxShadow: '0 0 8px rgba(37,212,138,.85)' }} />
          <span style={{ fontSize: 12, color: 'rgba(107,163,255,.9)', fontWeight: 600, letterSpacing: '.04em' }}>On-chain asset tokenization · Now live</span>
        </div>

        {/* Headline — typewriter */}
        <TypewriterHeadline />

        {/* Subheadline */}
        <p style={{ fontSize: 'clamp(15px, 1.8vw, 19px)', color: 'rgba(255,255,255,.48)', lineHeight: 1.7, maxWidth: 540, margin: '0 auto 52px' }}>
          frakta turns real-world assets into programmable tokens, so owners unlock liquidity and investors access markets that were never open before.
        </p>

        {/* CTAs */}
        <div className="lp-hero-ctas" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Primary CTA */}
          <Link href="/auth" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '12px 24px', borderRadius: 10,
            background: 'linear-gradient(135deg, #085CF0 0%, #2E5CFF 100%)',
            color: '#fff', textDecoration: 'none',
            boxShadow: '0 0 0 1px rgba(46,92,255,.5), 0 6px 32px rgba(8,92,240,.45)',
            transition: 'transform .18s, box-shadow .18s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 0 0 1px rgba(46,92,255,.65), 0 10px 44px rgba(8,92,240,.6)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 0 0 1px rgba(46,92,255,.5), 0 6px 32px rgba(8,92,240,.45)' }}
          >
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, letterSpacing: '-.01em' }}>Tokenize an asset</span>
            <ArrowRight size={14} />
          </Link>

        </div>
      </div>

      {/* ── Dashboard mockup ── */}
      <div className="lp-hero-mockup" style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 1000, margin: '64px auto 0', padding: '0 40px', flexShrink: 0 }}>
        <div style={{
          borderRadius: '16px 16px 0 0',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,.1)',
          borderBottom: 'none',
          boxShadow: '0 -28px 90px rgba(8,92,240,.24), 0 0 0 1px rgba(255,255,255,.06), 0 -8px 48px rgba(0,0,0,.55)',
          transform: 'perspective(1600px) rotateX(7deg)',
          transformOrigin: 'center top',
          maskImage: 'linear-gradient(to bottom, black 45%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 45%, transparent 100%)',
        }}>
          {/* Browser chrome */}
          <div style={{ height: 38, backgroundColor: '#0D0F1A', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 6, borderBottom: '1px solid rgba(255,255,255,.06)', flexShrink: 0 }}>
            {['#FF5F57', '#FEBC2E', '#28C840'].map(c => (
              <div key={c} style={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: c, opacity: .8, flexShrink: 0 }} />
            ))}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <div style={{ height: 20, width: 220, borderRadius: 5, backgroundColor: 'rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,.22)', fontFamily: 'var(--font-mono)' }}>app.frakta.io/dashboard</span>
              </div>
            </div>
          </div>
          {/* App body */}
          <div style={{ display: 'flex', height: 380, backgroundColor: '#09090F' }}>
            {/* Sidebar */}
            <div style={{ width: 214, borderRight: '1px solid rgba(255,255,255,.05)', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 2, backgroundColor: '#0B0C16', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 12px', marginBottom: 10 }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg, #085CF0, #2BBCB4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff', flexShrink: 0 }}>f</div>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.82)' }}>frakta</span>
              </div>
              {[
                { label: 'Overview', active: true },
                { label: 'Tokens', active: false },
                { label: 'Assets', active: false },
                { label: 'Compliance', active: false },
                { label: 'Settings', active: false },
              ].map(item => (
                <div key={item.label} style={{ padding: '8px 12px', borderRadius: 8, backgroundColor: item.active ? 'rgba(46,92,255,.1)' : 'transparent', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 13, height: 13, borderRadius: 3, backgroundColor: item.active ? '#085CF0' : 'rgba(255,255,255,.12)', flexShrink: 0 }} />
                  <span style={{ fontSize: 12.5, color: item.active ? '#6B85FF' : 'rgba(255,255,255,.28)', fontWeight: item.active ? 600 : 400 }}>{item.label}</span>
                </div>
              ))}
            </div>
            {/* Main content */}
            <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', gap: 14, overflow: 'hidden' }}>
              {/* Top row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <div>
                  <div style={{ height: 13, width: 78, borderRadius: 5, backgroundColor: 'rgba(255,255,255,.18)', marginBottom: 7 }} />
                  <div style={{ height: 9, width: 148, borderRadius: 4, backgroundColor: 'rgba(255,255,255,.08)' }} />
                </div>
                <div style={{ height: 30, width: 118, borderRadius: 8, background: 'linear-gradient(135deg, #085CF0, #2E5CFF)', opacity: .8, flexShrink: 0 }} />
              </div>
              {/* Stat cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, flexShrink: 0 }}>
                {[
                  { grad: true },
                  { grad: false },
                  { grad: false },
                  { grad: false },
                ].map((s, i) => (
                  <div key={i} style={{ padding: '12px 14px', borderRadius: 10, background: s.grad ? 'linear-gradient(135deg, rgba(8,92,240,.38), rgba(46,92,255,.22))' : 'rgba(255,255,255,.03)', border: `1px solid ${s.grad ? 'rgba(46,92,255,.35)' : 'rgba(255,255,255,.07)'}` }}>
                    <div style={{ height: 7, width: '72%', borderRadius: 3, backgroundColor: s.grad ? 'rgba(255,255,255,.28)' : 'rgba(255,255,255,.12)', marginBottom: 9 }} />
                    <div style={{ height: 15, width: '48%', borderRadius: 4, backgroundColor: s.grad ? 'rgba(255,255,255,.72)' : 'rgba(255,255,255,.18)' }} />
                  </div>
                ))}
              </div>
              {/* Token table */}
              <div style={{ flex: 1, borderRadius: 10, border: '1px solid rgba(255,255,255,.06)', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,.015)' }}>
                <div style={{ height: 34, borderBottom: '1px solid rgba(255,255,255,.05)', display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr', alignItems: 'center', padding: '0 16px', gap: 8 }}>
                  {[80, 60, 44, 48].map((w, i) => (
                    <div key={i} style={{ height: 7, width: w, borderRadius: 3, backgroundColor: 'rgba(255,255,255,.13)' }} />
                  ))}
                </div>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ height: 44, borderBottom: '1px solid rgba(255,255,255,.04)', display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr', alignItems: 'center', padding: '0 16px', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div style={{ width: 24, height: 24, borderRadius: 7, background: i === 0 ? 'linear-gradient(135deg, #085CF0, #2BBCB4)' : 'rgba(255,255,255,.1)', flexShrink: 0 }} />
                      <div style={{ height: 9, width: 66, borderRadius: 3, backgroundColor: 'rgba(255,255,255,.16)' }} />
                    </div>
                    <div style={{ height: 8, width: 52, borderRadius: 3, backgroundColor: 'rgba(255,255,255,.09)' }} />
                    <div style={{ height: 8, width: 38, borderRadius: 3, backgroundColor: 'rgba(255,255,255,.09)' }} />
                    <div style={{ height: 20, width: 46, borderRadius: 999, backgroundColor: i === 0 ? 'rgba(37,212,138,.12)' : 'rgba(255,200,50,.07)', border: `1px solid ${i === 0 ? 'rgba(37,212,138,.22)' : 'rgba(255,200,50,.14)'}` }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Stats Bar ───────────────────────────────────────────────────────── */
function StatsBar() {
  const stats = [
    { value: '$1M+', label: 'Total Value Locked', change: '18.4%', period: 'last 30 days' },
    { value: '18', label: 'Assets Tokenized', change: '5', period: 'this month' },
    { value: '1,500+', label: 'On-chain Transactions', change: '120', period: 'last 7 days' },
  ]
  return (
    <section style={{ position: 'relative', overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,.06)', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(30,50,120,.14) 0%, transparent 100%)', pointerEvents: 'none' }} />
      <div className="lp-stats-grid" style={{ maxWidth: 1160, margin: '0 auto', padding: '0 32px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)' }}>
        {stats.map((s, i) => (
          <div key={i} className="lp-stats-item" style={{ padding: '36px 40px', borderRight: i < 2 ? '1px solid rgba(255,255,255,.06)' : 'none', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 40, right: 40, height: 1, background: 'linear-gradient(90deg, transparent, rgba(107,163,255,.35), transparent)' }} />
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.28)', marginBottom: 12 }}>{s.label}</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 700, letterSpacing: '-.03em', color: '#fff', lineHeight: 1, marginBottom: 12 }}>{s.value}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 600, color: 'rgba(52,211,153,.9)', background: 'rgba(52,211,153,.1)', border: '1px solid rgba(52,211,153,.2)', borderRadius: 4, padding: '2px 7px' }}><ArrowUp size={10} strokeWidth={2.5} />{s.change}</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,.25)' }}>{s.period}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ── How It Works ────────────────────────────────────────────────────── */
function HowItWorks() {
  const card: React.CSSProperties = {
    borderRadius: 20, overflow: 'hidden', position: 'relative',
    background: 'rgba(14,17,28,.72)', backdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,.07)',
  }
  return (
    <section id="how-it-works" className="lp-hiw-section" style={{ padding: '120px 32px' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--fk-blue-soft)', marginBottom: 16 }}>How it works</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, letterSpacing: '-.03em', lineHeight: .95, color: '#fff', marginBottom: 20 }}>
            Simple process.<br />Powerful outcome.
          </h2>
          <p style={{ fontSize: 17, color: 'var(--fk-text-mid)', maxWidth: 480, margin: '0 auto' }}>
            From documentation to on-chain deployment — frakta handles the full token lifecycle.
          </p>
        </div>

        <div className="lp-hiw-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: 'auto auto', gap: 16 }}>

          {/* ── Card 01 — Define your asset (text + animation combined) ── */}
          <div className="lp-hiw-card01" style={{ ...card, gridColumn: 'span 2', display: 'flex', flexDirection: 'row', alignItems: 'stretch', overflow: 'hidden', background: 'radial-gradient(ellipse 80% 70% at 15% 80%, rgba(8,92,240,.22) 0%, rgba(14,17,28,.72) 55%)', boxShadow: 'inset 0 0 80px rgba(8,92,240,.08), 0 0 0 1px rgba(46,92,255,.12)' }}>

            {/* Left: text */}
            <div className="lp-hiw-card01-text" style={{ flex: '0 0 38%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '44px 48px', borderRight: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--fk-blue-soft)', display: 'block', marginBottom: 20 }}>01</span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 700, color: '#fff', marginBottom: 18, letterSpacing: '-.03em', lineHeight: 1.05 }}>Define your asset</h3>
              <p style={{ fontSize: 15, color: 'var(--fk-text-mid)', lineHeight: 1.75 }}>Upload documents or describe your asset through our AI-assisted whitepaper generator. frakta structures it into a token-ready prospectus automatically.</p>
            </div>

            {/* Right: animation */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px 16px' }}>
            <div style={{ width: '62%' }}>
              <svg viewBox="-10 -8 560 290" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%' }}>
                <defs>
                  <filter id="c1-green-atm" x="-80%" y="-80%" width="260%" height="260%">
                    <feGaussianBlur stdDeviation="36"/>
                  </filter>
                  <radialGradient id="c1-orb" cx="38%" cy="32%" r="66%">
                    <stop offset="0%" stopColor="#3D6FFF"/>
                    <stop offset="100%" stopColor="#1836CC"/>
                  </radialGradient>
                  <filter id="c1-glow" x="-60%" y="-60%" width="220%" height="220%">
                    <feGaussianBlur stdDeviation="14"/>
                  </filter>
                  <filter id="c1-sm" x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur stdDeviation="2.5" result="blur"/>
                    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                </defs>

                {/* Background atmospheric green glow */}
                <ellipse cx="340" cy="128" rx="78" ry="66" fill="rgba(37,212,138,0.14)" filter="url(#c1-green-atm)"/>

                {/* ── DOCUMENT CARD ── */}
                <rect x="14" y="12" width="152" height="208" rx="14" fill="rgba(22,24,34,0.96)" stroke="rgba(107,133,255,0.14)" strokeWidth="1"/>

                {/* File icon */}
                <rect x="26" y="22" width="34" height="43" rx="4" fill="rgba(46,92,255,0.1)" stroke="rgba(107,133,255,0.3)" strokeWidth="0.9"/>
                <path d="M50 22 L60 32 H50 Z" fill="rgba(46,92,255,0.18)" stroke="rgba(107,133,255,0.3)" strokeWidth="0.9"/>
                <line x1="32" y1="36" x2="50" y2="36" stroke="rgba(107,133,255,0.65)" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="32" y1="43" x2="48" y2="43" stroke="rgba(107,133,255,0.35)" strokeWidth="1.2" strokeLinecap="round"/>
                <line x1="32" y1="49" x2="52" y2="49" stroke="rgba(107,133,255,0.35)" strokeWidth="1.2" strokeLinecap="round"/>
                <line x1="32" y1="55" x2="44" y2="55" stroke="rgba(107,133,255,0.22)" strokeWidth="1.2" strokeLinecap="round"/>

                {/* Content text lines */}
                <rect x="26" y="78" width="128" height="5" rx="2.5" fill="rgba(255,255,255,0.13)"/>
                <rect x="26" y="90" width="104" height="4" rx="2" fill="rgba(255,255,255,0.08)"/>
                <rect x="26" y="101" width="118" height="4" rx="2" fill="rgba(255,255,255,0.08)"/>
                <rect x="26" y="112" width="90" height="4" rx="2" fill="rgba(255,255,255,0.06)"/>
                <rect x="26" y="123" width="112" height="4" rx="2" fill="rgba(255,255,255,0.06)"/>
                <rect x="26" y="134" width="86" height="4" rx="2" fill="rgba(255,255,255,0.05)"/>
                <rect x="26" y="145" width="102" height="4" rx="2" fill="rgba(255,255,255,0.05)"/>
                <rect x="26" y="156" width="74" height="4" rx="2" fill="rgba(255,255,255,0.04)"/>

                {/* Separator */}
                <line x1="26" y1="173" x2="152" y2="173" stroke="rgba(255,255,255,0.07)" strokeWidth="0.75"/>

                {/* FORMAT: PDF · READY */}
                <circle cx="33" cy="187" r="3.5" fill="#25D48A">
                  <animate attributeName="opacity" values="0.55;1;0.55" dur="2.4s" repeatCount="indefinite"/>
                </circle>
                <text x="42" y="187" dominantBaseline="central" fill="rgba(255,255,255,0.42)" fontSize="8.5" fontFamily="sans-serif" letterSpacing="0.3">FORMAT:</text>
                <text x="88" y="187" dominantBaseline="central" fill="rgba(255,255,255,0.72)" fontSize="8.5" fontWeight="600" fontFamily="sans-serif">PDF</text>
                <circle cx="106" cy="187" r="1.5" fill="rgba(255,255,255,0.2)"/>
                <circle cx="117" cy="187" r="2.5" fill="#25D48A"/>
                <text x="124" y="187" dominantBaseline="central" fill="#25D48A" fontSize="8.5" fontWeight="700" fontFamily="sans-serif" letterSpacing="0.5">READY</text>

                {/* File name chip */}
                <rect x="14" y="232" width="190" height="22" rx="6" fill="rgba(16,18,26,0.97)" stroke="rgba(107,133,255,0.13)" strokeWidth="0.75"/>
                <rect x="22" y="238" width="10" height="12" rx="1.5" fill="none" stroke="rgba(107,133,255,0.45)" strokeWidth="0.75"/>
                <line x1="24" y1="244" x2="30" y2="244" stroke="rgba(107,133,255,0.4)" strokeWidth="0.8"/>
                <line x1="24" y1="247" x2="29" y2="247" stroke="rgba(107,133,255,0.25)" strokeWidth="0.8"/>
                <text x="38" y="243" dominantBaseline="central" fill="rgba(255,255,255,0.36)" fontSize="8" fontFamily="monospace">PROSPECTUS_REAL_ESTATE_v2.pdf</text>

                {/* ── CONNECTOR ── */}
                {/* ON-CHAIN LINK pill */}
                <rect x="173" y="97" width="74" height="17" rx="8.5" fill="rgba(16,18,26,0.97)" stroke="rgba(107,133,255,0.24)" strokeWidth="0.75"/>
                <text x="210" y="105.5" textAnchor="middle" dominantBaseline="central" fill="rgba(107,133,255,0.72)" fontSize="6.5" fontWeight="700" fontFamily="sans-serif" letterSpacing="1">ON-CHAIN LINK</text>

                {/* Dashed connection line */}
                <line x1="166" y1="130" x2="238" y2="130" stroke="rgba(107,133,255,0.13)" strokeWidth="0.75" strokeDasharray="3 4"/>

                {/* Dot 1 */}
                <circle cx="186" cy="130" r="5.5" fill="rgba(46,92,255,0.2)" stroke="rgba(107,133,255,0.5)" strokeWidth="1.2"/>
                <circle cx="186" cy="130" r="2.5" fill="#6B85FF" filter="url(#c1-sm)"/>
                {/* Dot 2 */}
                <circle cx="218" cy="130" r="5.5" fill="rgba(46,92,255,0.18)" stroke="rgba(107,163,255,0.38)" strokeWidth="1.2"/>
                <circle cx="218" cy="130" r="2.5" fill="#6B85FF" filter="url(#c1-sm)"/>

                {/* Flowing particles */}
                <circle r="2.5" fill="#6B85FF" filter="url(#c1-sm)" opacity="0">
                  <animate attributeName="cx" values="166;238" dur="2.4s" repeatCount="indefinite"/>
                  <animate attributeName="cy" values="130;130" dur="2.4s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="0;1;1;0" dur="2.4s" repeatCount="indefinite"/>
                </circle>
                <circle r="2" fill="#6B85FF" opacity="0">
                  <animate attributeName="cx" values="166;238" dur="2.4s" begin="-0.9s" repeatCount="indefinite"/>
                  <animate attributeName="cy" values="130;130" dur="2.4s" begin="-0.9s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="0;0.7;0.7;0" dur="2.4s" begin="-0.9s" repeatCount="indefinite"/>
                </circle>

                {/* ── TOKEN ORB ── */}
                {/* Outer pulse ring */}
                <circle cx="306" cy="128" r="78" fill="rgba(46,92,255,0.03)" stroke="rgba(107,133,255,0.07)" strokeWidth="0.75">
                  <animate attributeName="r" values="74;82;74" dur="4s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="0.4;0.9;0.4" dur="4s" repeatCount="indefinite"/>
                </circle>
                {/* Dashed orbit ring */}
                <circle cx="306" cy="128" r="65" stroke="rgba(107,133,255,0.1)" strokeWidth="0.75" strokeDasharray="3 5" fill="none"/>
                {/* Inner ring */}
                <circle cx="306" cy="128" r="53" stroke="rgba(107,133,255,0.15)" strokeWidth="0.75" fill="none"/>

                {/* Orbit dot */}
                <circle cx="371" cy="128" r="3.5" fill="#6B85FF" filter="url(#c1-sm)">
                  <animateTransform attributeName="transform" type="rotate" from="90 306 128" to="450 306 128" dur="9s" repeatCount="indefinite"/>
                </circle>

                {/* Token glow (blur layer) */}
                <circle cx="306" cy="128" r="46" fill="rgba(46,92,255,0.55)" filter="url(#c1-glow)"/>
                {/* Token core */}
                <circle cx="306" cy="128" r="46" fill="url(#c1-orb)" stroke="rgba(107,133,255,0.38)" strokeWidth="1.5"/>
                {/* Subtle inner highlight */}
                <circle cx="294" cy="114" r="22" fill="rgba(255,255,255,0.04)"/>

                {/* Frakta icon mark */}
                <svg x="272" y="94" width="68" height="68" viewBox="0 0 624 624">
                  <path d="M417.854 107.237C440.558 98.5802 477.052 91.7966 500.822 99.0985C517.251 104.212 530.957 115.68 538.891 130.949C547.016 146.543 548.609 164.728 543.32 181.498C537.982 198.299 526.107 212.248 510.374 220.199C502.668 224.212 494.256 226.701 485.607 227.53C473.742 228.671 448.427 225.863 435.284 224.857C420.727 223.743 409.068 223.658 395.312 223.438L389.273 223.333C385.035 223.443 374.334 223.564 370.684 224.365C353.692 224.676 332.647 230.244 316.95 236.657C306.801 241.315 300.389 245.876 292.121 253.201C303.856 234.01 312.279 206.5 325.188 187.917L325.189 187.916C326.085 185.5 330.577 178.732 332.06 176.449C342.769 159.958 363.944 136.299 381.118 126.434L381.216 126.319C382.468 124.997 390.925 119.913 392.47 118.962C400.743 114.596 409.126 110.563 417.854 107.237Z" fill="rgba(255,255,255,0.92)"/>
                  <path d="M383.392 117.384L383.777 117.476C383.669 117.861 369.159 127.309 367.457 128.532C308.791 170.732 297.977 240.569 259.252 296.897C228.071 342.254 145.707 386.067 96.6672 341.67C78.0852 323.518 72.002 296.707 80.8895 272.208C89.921 247.311 115.16 230.227 141.36 229.128C156.695 228.484 172.353 230.97 187.776 229.716C208.803 228.212 226.593 224.351 245.645 215.109C275.213 200.766 295.382 177.84 319.766 156.968C339.439 140.129 359.948 128.075 383.392 117.384Z" fill="rgba(255,255,255,0.7)"/>
                  <path d="M344.957 328.685C362.815 321.876 391.52 316.541 410.216 322.284C423.138 326.306 433.917 335.325 440.157 347.335C446.548 359.6 447.802 373.904 443.643 387.094C439.444 400.309 430.103 411.28 417.729 417.534C411.667 420.69 405.051 422.648 398.248 423.299C388.915 424.197 369.005 421.989 358.667 421.198C345.582 420.197 335.473 420.252 322.478 419.999C319.143 420.087 310.726 420.181 307.854 420.811C294.49 421.056 277.937 425.435 265.591 430.479C257.608 434.141 252.564 437.729 246.062 443.491C255.292 428.396 261.918 406.758 272.072 392.141C272.776 390.242 276.309 384.919 277.476 383.124C285.899 370.153 302.555 351.544 316.062 343.785C316.692 342.915 323.739 338.679 324.992 337.907C331.5 334.473 338.093 331.301 344.957 328.685Z" fill="rgba(255,255,255,0.92)"/>
                  <path d="M317.615 337.161L317.918 337.232C317.833 337.534 306.431 344.947 305.094 345.906C258.996 379.012 250.499 433.799 220.07 477.989C195.569 513.572 130.85 547.944 92.3156 513.113C77.7145 498.873 72.9345 477.84 79.918 458.621C87.0146 439.088 106.847 425.686 127.434 424.824C139.484 424.319 151.787 426.269 163.906 425.285C180.428 424.105 194.408 421.077 209.377 413.826C232.612 402.574 248.46 384.588 267.62 368.215C283.078 355.004 299.193 345.548 317.615 337.161Z" fill="rgba(255,255,255,0.65)"/>
                </svg>

                {/* Green badge (~5 o'clock: 306+32=338, 128+36=164) */}
                <rect x="328" y="158" width="26" height="26" rx="7" fill="#25D48A"/>
                {/* Doc icon in badge */}
                <rect x="333" y="162" width="12" height="15" rx="1.5" fill="rgba(0,0,0,0.2)" stroke="rgba(255,255,255,0.5)" strokeWidth="0.75"/>
                <line x1="336" y1="167" x2="342" y2="167" stroke="rgba(255,255,255,0.75)" strokeWidth="1" strokeLinecap="round"/>
                <line x1="336" y1="171" x2="341" y2="171" stroke="rgba(255,255,255,0.5)" strokeWidth="1" strokeLinecap="round"/>
                <line x1="336" y1="175" x2="342" y2="175" stroke="rgba(255,255,255,0.5)" strokeWidth="1" strokeLinecap="round"/>

                {/* TOKEN READY */}
                <text x="306" y="214" textAnchor="middle" fill="#25D48A" fontSize="9" fontWeight="700" fontFamily="monospace" letterSpacing="2.5">TOKEN READY</text>
              </svg>
            </div>
            </div>
          </div>

          {/* ── Card 02 — Configure the token (orbital) ── */}
          <div style={{ ...card }}>
            <div style={{ position: 'relative', height: 210, overflow: 'hidden' }}>
              <div style={{
                position: 'absolute', top: 0, left: '-21.43%',
                width: '142.86%', height: 300,
                transform: 'scale(0.7)', transformOrigin: 'top center',
              }}>
                <ConfigureTokenOrbitAnimation supply={1000} kyc={true} />
              </div>
            </div>
            <div style={{ padding: '10px 24px 20px' }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(217,168,78,.8)', display: 'block', marginBottom: 10 }}>02</span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 8, letterSpacing: '-.02em' }}>Configure the token</h3>
              <p style={{ fontSize: 14, color: 'var(--fk-text-mid)', lineHeight: 1.65 }}>Set supply, distribution rules, governance rights, and compliance parameters. Smart contracts are generated and audited — no code required.</p>
            </div>
          </div>

          {/* ── Card 03 — Blockchain deploy + token distribution ── */}
          <div style={{ ...card }}>
            <div style={{ padding: '16px 24px 6px', display: 'flex', justifyContent: 'center' }}>
              <svg viewBox="0 0 360 148" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '70%' }}>
                <defs>
                  <filter id="s3-glow" x="-60%" y="-60%" width="220%" height="220%">
                    <feGaussianBlur stdDeviation="3.5" result="blur"/>
                    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                  <filter id="s3-block-glow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="6" result="blur"/>
                    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                </defs>

                {/* ── DEPLOY ZONE — Blockchain blocks ── */}
                {/* Block A — muted left */}
                <rect x="10" y="48" width="34" height="44" rx="7" fill="rgba(52,211,153,0.04)" stroke="rgba(52,211,153,0.12)" strokeWidth="1"/>
                <rect x="17" y="58" width="20" height="2.5" rx="1.25" fill="rgba(52,211,153,0.15)"/>
                <rect x="17" y="63" width="14" height="2.5" rx="1.25" fill="rgba(52,211,153,0.1)"/>
                <rect x="17" y="68" width="18" height="2.5" rx="1.25" fill="rgba(52,211,153,0.08)"/>
                <rect x="17" y="73" width="10" height="2.5" rx="1.25" fill="rgba(52,211,153,0.06)"/>

                {/* Chain link A→B */}
                <line x1="44" y1="70" x2="52" y2="70" stroke="rgba(52,211,153,0.2)" strokeWidth="2.5" strokeLinecap="round"/>

                {/* Block B — active/deployed, center */}
                <rect x="52" y="38" width="46" height="60" rx="9" fill="rgba(52,211,153,0.09)" stroke="rgba(52,211,153,0.45)" strokeWidth="1.5"/>
                {/* Contract code lines inside B */}
                <rect x="61" y="50" width="28" height="2.5" rx="1.25" fill="rgba(52,211,153,0.45)"/>
                <rect x="61" y="55.5" width="20" height="2.5" rx="1.25" fill="rgba(52,211,153,0.32)"/>
                <rect x="61" y="61" width="24" height="2.5" rx="1.25" fill="rgba(52,211,153,0.25)"/>
                <rect x="61" y="66.5" width="16" height="2.5" rx="1.25" fill="rgba(52,211,153,0.18)"/>
                <rect x="61" y="72" width="22" height="2.5" rx="1.25" fill="rgba(52,211,153,0.14)"/>
                <rect x="61" y="77.5" width="12" height="2.5" rx="1.25" fill="rgba(52,211,153,0.1)"/>
                {/* Check badge top-right */}
                <circle cx="96" cy="40" r="7" fill="rgba(12,20,36,0.9)" stroke="rgba(52,211,153,0.45)" strokeWidth="1"/>
                <path d="M93 40 L95.5 42.5 L100 37" stroke="rgba(52,211,153,0.9)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                {/* DEPLOYED label */}
                <text x="75" y="30" textAnchor="middle" fill="rgba(52,211,153,0.55)" fontSize="8" fontWeight="700" fontFamily="sans-serif" letterSpacing="1">DEPLOYED</text>
                {/* Hash below */}
                <text x="75" y="112" textAnchor="middle" fill="rgba(52,211,153,0.28)" fontSize="7.5" fontFamily="monospace">0x4f2a…e3c</text>
                {/* Glow behind block B */}
                <circle cx="75" cy="68" r="38" fill="rgba(52,211,153,0.04)" filter="url(#s3-block-glow)">
                  <animate attributeName="opacity" values="0.4;0.9;0.4" dur="3s" repeatCount="indefinite"/>
                </circle>

                {/* Chain link B→C */}
                <line x1="98" y1="70" x2="106" y2="70" stroke="rgba(52,211,153,0.14)" strokeWidth="2.5" strokeLinecap="round"/>

                {/* Block C — future/muted right */}
                <rect x="106" y="52" width="32" height="38" rx="6" fill="rgba(52,211,153,0.02)" stroke="rgba(52,211,153,0.08)" strokeWidth="1"/>
                <rect x="113" y="62" width="18" height="2" rx="1" fill="rgba(52,211,153,0.08)"/>
                <rect x="113" y="67" width="12" height="2" rx="1" fill="rgba(52,211,153,0.06)"/>
                <rect x="113" y="72" width="16" height="2" rx="1" fill="rgba(52,211,153,0.04)"/>

                {/* ── BRIDGE ARROW ── */}
                <path d="M142 70 L170 70" stroke="rgba(52,211,153,0.22)" strokeWidth="1" strokeDasharray="3 2.5"/>
                <path d="M165 66 L172 70 L165 74" stroke="rgba(52,211,153,0.4)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="148" y="60" width="14" height="10" rx="3" fill="rgba(52,211,153,0.08)" stroke="rgba(52,211,153,0.22)" strokeWidth="0.75"/>
                <text x="155" y="66" textAnchor="middle" dominantBaseline="central" fill="rgba(52,211,153,0.6)" fontSize="6" fontWeight="700" fontFamily="sans-serif">LIVE</text>

                {/* ── DISTRIBUTION ZONE — token → investors ── */}
                {/* Token node */}
                <circle cx="202" cy="70" r="22" fill="rgba(52,211,153,0.04)" stroke="rgba(52,211,153,0.15)" strokeWidth="1">
                  <animate attributeName="r" values="20;24;20" dur="3.5s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="0.4;0.8;0.4" dur="3.5s" repeatCount="indefinite"/>
                </circle>
                <circle cx="202" cy="70" r="13" fill="rgba(52,211,153,0.12)" stroke="rgba(52,211,153,0.5)" strokeWidth="1.5"/>
                {/* Frakta icon mark */}
                <svg x="192" y="60" width="20" height="20" viewBox="0 0 624 624">
                  <path d="M417.854 107.237C440.558 98.5802 477.052 91.7966 500.822 99.0985C517.251 104.212 530.957 115.68 538.891 130.949C547.016 146.543 548.609 164.728 543.32 181.498C537.982 198.299 526.107 212.248 510.374 220.199C502.668 224.212 494.256 226.701 485.607 227.53C473.742 228.671 448.427 225.863 435.284 224.857C420.727 223.743 409.068 223.658 395.312 223.438L389.273 223.333C385.035 223.443 374.334 223.564 370.684 224.365C353.692 224.676 332.647 230.244 316.95 236.657C306.801 241.315 300.389 245.876 292.121 253.201C303.856 234.01 312.279 206.5 325.188 187.917L325.189 187.916C326.085 185.5 330.577 178.732 332.06 176.449C342.769 159.958 363.944 136.299 381.118 126.434L381.216 126.319C382.468 124.997 390.925 119.913 392.47 118.962C400.743 114.596 409.126 110.563 417.854 107.237Z" fill="rgba(52,211,153,0.9)"/>
                  <path d="M383.392 117.384L383.777 117.476C383.669 117.861 369.159 127.309 367.457 128.532C308.791 170.732 297.977 240.569 259.252 296.897C228.071 342.254 145.707 386.067 96.6672 341.67C78.0852 323.518 72.002 296.707 80.8895 272.208C89.921 247.311 115.16 230.227 141.36 229.128C156.695 228.484 172.353 230.97 187.776 229.716C208.803 228.212 226.593 224.351 245.645 215.109C275.213 200.766 295.382 177.84 319.766 156.968C339.439 140.129 359.948 128.075 383.392 117.384Z" fill="rgba(52,211,153,0.6)"/>
                  <path d="M344.957 328.685C362.815 321.876 391.52 316.541 410.216 322.284C423.138 326.306 433.917 335.325 440.157 347.335C446.548 359.6 447.802 373.904 443.643 387.094C439.444 400.309 430.103 411.28 417.729 417.534C411.667 420.69 405.051 422.648 398.248 423.299C388.915 424.197 369.005 421.989 358.667 421.198C345.582 420.197 335.473 420.252 322.478 419.999C319.143 420.087 310.726 420.181 307.854 420.811C294.49 421.056 277.937 425.435 265.591 430.479C257.608 434.141 252.564 437.729 246.062 443.491C255.292 428.396 261.918 406.758 272.072 392.141C272.776 390.242 276.309 384.919 277.476 383.124C285.899 370.153 302.555 351.544 316.062 343.785C316.692 342.915 323.739 338.679 324.992 337.907C331.5 334.473 338.093 331.301 344.957 328.685Z" fill="rgba(52,211,153,0.9)"/>
                  <path d="M317.615 337.161L317.918 337.232C317.833 337.534 306.431 344.947 305.094 345.906C258.996 379.012 250.499 433.799 220.07 477.989C195.569 513.572 130.85 547.944 92.3156 513.113C77.7145 498.873 72.9345 477.84 79.918 458.621C87.0146 439.088 106.847 425.686 127.434 424.824C139.484 424.319 151.787 426.269 163.906 425.285C180.428 424.105 194.408 421.077 209.377 413.826C232.612 402.574 248.46 384.588 267.62 368.215C283.078 355.004 299.193 345.548 317.615 337.161Z" fill="rgba(52,211,153,0.55)"/>
                </svg>

                {/* Distribution lines */}
                <line x1="215" y1="70" x2="278" y2="33" stroke="rgba(52,211,153,0.14)" strokeWidth="1" strokeDasharray="3 3"/>
                <line x1="215" y1="70" x2="294" y2="70" stroke="rgba(52,211,153,0.14)" strokeWidth="1" strokeDasharray="3 3"/>
                <line x1="215" y1="70" x2="278" y2="107" stroke="rgba(52,211,153,0.14)" strokeWidth="1" strokeDasharray="3 3"/>

                {/* Animated flow particles — staggered per branch */}
                {([
                  [278, 33, 0] as [number,number,number],
                  [294, 70, 0.75] as [number,number,number],
                  [278, 107, 1.5] as [number,number,number],
                ]).map(([tx, ty, delay], i) => (
                  <circle key={i} r="3.2" fill="rgba(52,211,153,0.9)" filter="url(#s3-glow)" opacity={0}>
                    <animate attributeName="cx" values={`215;${tx}`} dur="2s" begin={`${delay}s`} repeatCount="indefinite"/>
                    <animate attributeName="cy" values={`70;${ty}`} dur="2s" begin={`${delay}s`} repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0;1;1;0" dur="2s" begin={`${delay}s`} repeatCount="indefinite"/>
                  </circle>
                ))}

                {/* Investor wallet cards */}
                {([
                  [278, 22, '412K', 0] as [number,number,string,number],
                  [296, 59, '350K', 0.5] as [number,number,string,number],
                  [278, 96, '238K', 1.0] as [number,number,string,number],
                ]).map(([x, y, amt, delay], i) => (
                  <g key={i}>
                    <rect x={x} y={y} width="32" height="22" rx="5" fill="rgba(52,211,153,0.06)" stroke="rgba(52,211,153,0.22)" strokeWidth="1">
                      <animate attributeName="opacity" values="0.5;1;0.5" dur="2.4s" begin={`${delay}s`} repeatCount="indefinite"/>
                    </rect>
                    {/* card chip */}
                    <rect x={x+4} y={y+5} width="9" height="7" rx="1.5" fill="rgba(52,211,153,0.22)" stroke="rgba(52,211,153,0.4)" strokeWidth="0.75"/>
                    {/* balance line */}
                    <rect x={x+16} y={y+7} width="12" height="2" rx="1" fill="rgba(52,211,153,0.2)"/>
                    <rect x={x+16} y={y+11} width="8" height="1.5" rx="0.75" fill="rgba(52,211,153,0.13)"/>
                    {/* amount badge */}
                    <text x={x+16} y={y+30} textAnchor="middle" fill="rgba(52,211,153,0.42)" fontSize="8" fontWeight="700" fontFamily="sans-serif">{amt}</text>
                  </g>
                ))}

                {/* INVESTORS label */}
                <text x="300" y="138" textAnchor="middle" fill="rgba(52,211,153,0.28)" fontSize="8" fontWeight="600" letterSpacing="1.5" fontFamily="sans-serif">INVESTORS</text>
              </svg>
            </div>
            <div style={{ padding: '10px 24px 20px' }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(52,211,153,.8)', display: 'block', marginBottom: 10 }}>03</span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 8, letterSpacing: '-.02em' }}>Deploy & distribute</h3>
              <p style={{ fontSize: 14, color: 'var(--fk-text-mid)', lineHeight: 1.65 }}>Launch your token on-chain with one confirmation. Ownership transfers, investor access, and yield distribution are all handled by the protocol.</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

/* ── Asset Categories ─────────────────────────────────────────────────── */
const CATEGORIES = [
  {
    icon: <Layers size={20} />,
    iconColor: 'var(--fk-cat-1)',
    iconBg: 'rgba(107,133,255,.12)',
    tag: 'Real-World Asset',
    title: 'RWA Tokens',
    body: 'Tokenize tangible assets and bring them on-chain. Enable fractional ownership, transparent provenance, and programmable yield — all backed by real collateral.',
    examples: ['Real estate', 'Commodities', 'Private credit', 'Trade finance'],
    accent: 'var(--fk-cat-1)',
  },
  {
    icon: <Coins size={20} />,
    iconColor: 'var(--fk-cat-3)',
    iconBg: 'rgba(217,168,78,.12)',
    tag: 'Stablecoin',
    title: 'Stablecoin',
    body: 'Issue asset-backed stablecoins with full reserve transparency. Built for payment use cases, DeFi integration, and programmable settlement on any EVM chain.',
    examples: ['Fiat-backed', 'Commodity-backed', 'Algorithmic'],
    accent: 'var(--fk-cat-3)',
  },
  {
    icon: <Vote size={20} />,
    iconColor: 'var(--fk-cat-4)',
    iconBg: 'rgba(156,123,245,.12)',
    tag: 'Protocol / Governance',
    title: 'Protocol Token',
    body: 'Launch governance and utility tokens with built-in DAO mechanics, vesting schedules, and on-chain voting — ready for community ownership from day one.',
    examples: ['DAO governance', 'Utility access', 'Fee sharing', 'Vested allocation'],
    accent: 'var(--fk-cat-4)',
  },
]

function AssetCategories() {
  return (
    <section id="assets" className="lp-assets-section" style={{ padding: '120px 32px', backgroundColor: 'rgba(255,255,255,.015)', borderTop: '1px solid var(--fk-line-soft)' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--fk-blue-soft)', marginBottom: 16 }}>Asset categories</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, letterSpacing: '-.03em', lineHeight: .95, color: '#fff', marginBottom: 20 }}>
            Every class of asset.<br />One protocol.
          </h2>
          <p style={{ fontSize: 17, color: 'var(--fk-text-mid)', maxWidth: 480, margin: '0 auto' }}>
            frakta supports the three primary token architectures used in modern on-chain finance.
          </p>
        </div>

        <div className="lp-assets-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
          {CATEGORIES.map(c => (
            <div key={c.title} style={{
              padding: '32px', borderRadius: 'var(--r-xl)',
              background: 'var(--glass-surface), var(--fk-surface-1)',
              border: '1px solid var(--glass-border)',
              boxShadow: 'var(--glass-hi), var(--vol-shadow)',
              display: 'flex', flexDirection: 'column', gap: 20,
              transition: 'transform .25s, box-shadow .25s',
            }}
              onMouseEnter={e => { const t = e.currentTarget; t.style.transform = 'translateY(-4px)'; t.style.boxShadow = `var(--glass-hi), var(--vol-shadow), 0 0 0 1px ${c.accent}30` }}
              onMouseLeave={e => { const t = e.currentTarget; t.style.transform = ''; t.style.boxShadow = 'var(--glass-hi), var(--vol-shadow)' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ width: 44, height: 44, borderRadius: 'var(--r-md)', backgroundColor: c.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.iconColor }}>
                  {c.icon}
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: c.iconColor, backgroundColor: c.iconBg, padding: '4px 10px', borderRadius: 999 }}>{c.tag}</span>
              </div>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '-.02em', marginBottom: 10 }}>{c.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--fk-text-mid)', lineHeight: 1.7 }}>{c.body}</p>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 'auto' }}>
                {c.examples.map(e => (
                  <span key={e} style={{ fontSize: 12, color: 'var(--fk-text-low)', backgroundColor: 'var(--fk-surface-2)', border: '1px solid var(--fk-line)', borderRadius: 999, padding: '3px 10px' }}>{e}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Why Frakta ──────────────────────────────────────────────────────── */
const WHY = [
  { icon: <Zap size={18} />, color: 'var(--fk-warn)', bg: 'var(--fk-warn-tint)', title: 'AI-assisted issuance', body: 'The frakta Whitepaper Agent structures your asset documentation into compliance-ready token prospectuses. What used to take weeks now takes hours.' },
  { icon: <Shield size={18} />, color: 'var(--fk-gain)', bg: 'var(--fk-gain-tint)', title: 'Non-custodial by design', body: "Your assets and tokens live in your wallet — not ours. Ownership, transfers, and governance are enforced by audited smart contracts, not a company's database." },
  { icon: <Package size={18} />, color: 'var(--fk-blue-soft)', bg: 'var(--fk-soft-tint)', title: 'End-to-end in one place', body: 'From whitepaper to token launch to secondary trading — frakta handles the full lifecycle. No stitching together five different tools or three separate custodians.' },
]

function WhyFrakta() {
  return (
    <section id="why-frakta" className="lp-why-section" style={{ padding: '120px 32px' }}>
      <div className="lp-why-grid" style={{ maxWidth: 1160, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--fk-blue-soft)', marginBottom: 20 }}>Why frakta</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 4vw, 52px)', fontWeight: 800, letterSpacing: '-.03em', lineHeight: .95, color: '#fff', marginBottom: 24 }}>
            Built for the people<br />who actually do this.
          </h2>
          <p style={{ fontSize: 16, color: 'var(--fk-text-mid)', lineHeight: 1.65, marginBottom: 40 }}>
            Not a generic blockchain tool. A purpose-built platform for serious asset issuers and investors.
          </p>
          <Link href="/auth" className="fk-btn fk-btn-primary" style={{ gap: 8, fontSize: 14, padding: '12px 24px' }}>
            Get started <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {WHY.map(w => (
            <div key={w.title} style={{ display: 'flex', gap: 20, padding: '24px', borderRadius: 'var(--r-lg)', background: 'var(--glass-surface), var(--fk-surface-1)', border: '1px solid var(--glass-border)', boxShadow: 'var(--glass-hi), var(--el-1)' }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--r-sm)', backgroundColor: w.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: w.color, flexShrink: 0 }}>
                {w.icon}
              </div>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 6 }}>{w.title}</h3>
                <p style={{ fontSize: 13.5, color: 'var(--fk-text-mid)', lineHeight: 1.65 }}>{w.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── CTA Section ─────────────────────────────────────────────────────── */
function CTASection() {
  return (
    <section className="lp-cta-section" style={{ padding: '120px 32px 140px', position: 'relative', overflow: 'hidden', background: 'var(--fk-bg)' }}>

      {/* Grid tiles — visible across entire section */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />

      {/* Blue gradient — top to bottom */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        background: 'linear-gradient(to bottom, rgba(8,60,200,.55) 0%, rgba(6,30,100,.25) 45%, transparent 80%)',
      }} />

      {/* Black vignette — left + right + bottom edges */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        background: 'radial-gradient(ellipse 70% 90% at 50% 30%, transparent 35%, rgba(0,0,0,.82) 100%)',
      }} />

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 580, margin: '0 auto' }}>

        {/* Frakta icon mark */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 60, height: 60, borderRadius: 18, marginBottom: 36,
          background: 'rgba(8,92,240,.12)',
          border: '1px solid rgba(8,92,240,.3)',
          boxShadow: '0 0 24px rgba(8,92,240,.2)',
        }}>
          <svg width="30" height="30" viewBox="0 0 624 624" fill="none">
            <path d="M417.854 107.237C440.558 98.5802 477.052 91.7966 500.822 99.0985C517.251 104.212 530.957 115.68 538.891 130.949C547.016 146.543 548.609 164.728 543.32 181.498C537.982 198.299 526.107 212.248 510.374 220.199C502.668 224.212 494.256 226.701 485.607 227.53C473.742 228.671 448.427 225.863 435.284 224.857C420.727 223.743 409.068 223.658 395.312 223.438L389.273 223.333C385.035 223.443 374.334 223.564 370.684 224.365C353.692 224.676 332.647 230.244 316.95 236.657C306.801 241.315 300.389 245.876 292.121 253.201C303.856 234.01 312.279 206.5 325.188 187.917C326.085 185.5 330.577 178.732 332.06 176.449C342.769 159.958 363.944 136.299 381.118 126.434L381.216 126.319C382.468 124.997 390.925 119.913 392.47 118.962C400.743 114.596 409.126 110.563 417.854 107.237Z" fill="rgba(255,255,255,.92)"/>
            <path d="M383.392 117.384L383.777 117.476C383.669 117.861 369.159 127.309 367.457 128.532C308.791 170.732 297.977 240.569 259.252 296.897C228.071 342.254 145.707 386.067 96.6672 341.67C78.0852 323.518 72.002 296.707 80.8895 272.208C89.921 247.311 115.16 230.227 141.36 229.128C156.695 228.484 172.353 230.97 187.776 229.716C208.803 228.212 226.593 224.351 245.645 215.109C275.213 200.766 295.382 177.84 319.766 156.968C339.439 140.129 359.948 128.075 383.392 117.384Z" fill="rgba(255,255,255,.65)"/>
            <path d="M344.957 328.685C362.815 321.876 391.52 316.541 410.216 322.284C423.138 326.306 433.917 335.325 440.157 347.335C446.548 359.6 447.802 373.904 443.643 387.094C439.444 400.309 430.103 411.28 417.729 417.534C411.667 420.69 405.051 422.648 398.248 423.299C388.915 424.197 369.005 421.989 358.667 421.198C345.582 420.197 335.473 420.252 322.478 419.999C319.143 420.087 310.726 420.181 307.854 420.811C294.49 421.056 277.937 425.435 265.591 430.479C257.608 434.141 252.564 437.729 246.062 443.491C255.292 428.396 261.918 406.758 272.072 392.141C272.776 390.242 276.309 384.919 277.476 383.124C285.899 370.153 302.555 351.544 316.062 343.785C316.692 342.915 323.739 338.679 324.992 337.907C331.5 334.473 338.093 331.301 344.957 328.685Z" fill="rgba(255,255,255,.92)"/>
            <path d="M317.615 337.161L317.918 337.232C317.833 337.534 306.431 344.947 305.094 345.906C258.996 379.012 250.499 433.799 220.07 477.989C195.569 513.572 130.85 547.944 92.3156 513.113C77.7145 498.873 72.9345 477.84 79.918 458.621C87.0146 439.088 106.847 425.686 127.434 424.824C139.484 424.319 151.787 426.269 163.906 425.285C180.428 424.105 194.408 421.077 209.377 413.826C232.612 402.574 248.46 384.588 267.62 368.215C283.078 355.004 299.193 345.548 317.615 337.161Z" fill="rgba(255,255,255,.6)"/>
          </svg>
        </div>

        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 900, letterSpacing: '-.04em', lineHeight: .93, color: '#fff', marginBottom: 20 }}>
          Ready to tokenize?
        </h2>

        <p style={{ fontSize: 17, color: 'rgba(255,255,255,.42)', lineHeight: 1.65, maxWidth: 440, margin: '0 auto 52px' }}>
          Join the creators and investors already using frakta to move assets on-chain.
        </p>

        <div className="lp-cta-btns" style={{ display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link href="/auth" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '14px 36px', borderRadius: 999,
            background: 'linear-gradient(135deg, #085CF0 0%, #2E5CFF 100%)',
            color: '#fff', textDecoration: 'none',
            fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700,
            boxShadow: '0 0 0 1px rgba(46,92,255,.45), 0 8px 36px rgba(8,92,240,.5)',
            transition: 'transform .18s, box-shadow .18s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 0 0 1px rgba(46,92,255,.6), 0 12px 48px rgba(8,92,240,.65)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 0 0 1px rgba(46,92,255,.45), 0 8px 36px rgba(8,92,240,.5)' }}
          >
            Start tokenizing <ArrowRight size={14} />
          </Link>
          <button style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '13px 32px', borderRadius: 999,
            border: '1px solid rgba(255,255,255,.14)',
            backgroundColor: 'rgba(255,255,255,.05)', color: 'rgba(255,255,255,.6)',
            fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600,
            cursor: 'pointer', transition: 'background .2s, color .2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,.09)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,.05)'; e.currentTarget.style.color = 'rgba(255,255,255,.6)' }}
          >
            Talk to the team
          </button>
        </div>
      </div>
    </section>
  )
}

/* ── Footer ──────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--fk-line-soft)', padding: '40px 32px' }}>
      <div className="lp-footer" style={{ maxWidth: 1160, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
        <FraktaHorizontalLogo height={22} />
        <div className="lp-footer-links" style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
          {['Docs', 'Blog', 'Privacy', 'Terms', 'Contact'].map(l => (
            <a key={l} href="#" style={{ fontSize: 13, color: 'var(--fk-text-low)', textDecoration: 'none', transition: 'color .2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--fk-text-mid)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--fk-text-low)')}
            >{l}</a>
          ))}
        </div>
        <span style={{ fontSize: 12, color: 'var(--fk-text-low)' }}>© 2025 frakta.io · All rights reserved</span>
      </div>
    </footer>
  )
}

/* ── Page ─────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div style={{ backgroundColor: 'var(--fk-bg)', minHeight: '100vh', color: 'var(--fk-text-hi)' }}>
      <Nav />
      <Hero />
      <StatsBar />
      <HowItWorks />
      <AssetCategories />
      <WhyFrakta />
      <CTASection />
      <Footer />
    </div>
  )
}
