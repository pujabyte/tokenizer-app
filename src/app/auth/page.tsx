'use client'
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { Wallet, Zap, Sparkles, Key, Fingerprint } from 'lucide-react'
import FraktaHorizontalLogo from '@/components/ui/FraktaHorizontalLogo'

const STEPS = [
  {
    title: 'Deploy compliant RWA tokens in hours',
    desc: 'Launch ERC-3643 standard RWA tokens on any EVM network in hours, not months.',
    metric: 'SPEED TO MARKET',
    Icon: Zap,
    accent: '#3E67F0',
  },
  {
    title: 'AI-assisted whitepaper generation',
    desc: 'Generate high-quality technical documents, regulatory filings, and whitepapers with integrated AI.',
    metric: 'INTELLIGENT AGENT',
    Icon: Sparkles,
    accent: '#25D48A',
  },
  {
    title: 'Non-custodial — your keys, your assets',
    desc: 'Absolute decentralized access with no intermediaries. Your private keys stay entirely in your hands.',
    metric: 'SELF-CUSTODY',
    Icon: Key,
    accent: '#6B85FF',
  },
  {
    title: 'Full KYC/AML compliance built-in',
    desc: 'Identity verification embedded directly at the smart contract level for real-time regulatory compliance.',
    metric: 'SECURE IDENTITY',
    Icon: Fingerprint,
    accent: '#A78BFA',
  },
]

export default function AuthPage() {
  const [activeCycleStep, setActiveCycleStep] = useState(0)
  const [simulatedBlock, setSimulatedBlock] = useState(19283745)
  const [simulatedLatency, setSimulatedLatency] = useState(12)

  useEffect(() => {
    const interval = setInterval(() => {
      setSimulatedBlock(prev => prev + 1)
      setSimulatedLatency(Math.floor(Math.random() * 8) + 8)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const cycle = setInterval(() => {
      setActiveCycleStep(prev => (prev + 1) % 4)
    }, 5000)
    return () => clearInterval(cycle)
  }, [])

  // Static ribbons — no mouse tracking
  const glassRibbons = useMemo(() => {
    const numCols = 18, pts = 10, W = 900, H = 700, colW = W / numCols
    return Array.from({ length: numCols }, (_, i) => {
      const activeFactor = Math.max(0, (i - 4) / (numCols - 5))
      const left: string[] = [], right: string[] = []
      for (let p = 0; p <= pts; p++) {
        const y = (p / pts) * H
        const sine = Math.sin((p / pts) * Math.PI)
        const wave = Math.sin(i * 0.28 + 1.4) * 45 * sine
        left.push(`${(i * colW + wave).toFixed(1)},${y.toFixed(1)}`)
        right.push(`${((i + 1.45) * colW + wave).toFixed(1)},${y.toFixed(1)}`)
      }
      const d = `M ${left[0]} ${left.slice(1).map(p => `L ${p}`).join(' ')} L ${right[pts]} ${right.slice(0, pts).reverse().map(p => `L ${p}`).join(' ')} Z`
      return { d, index: i, activeFactor }
    })
  }, [])

  const currentStep = STEPS[activeCycleStep]

  return (
    <div style={{ height: '100vh', backgroundColor: 'var(--fk-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, overflow: 'hidden' }}>

      {/* Atmospheric glow */}
      <div style={{ position: 'fixed', top: '-25%', left: '-15%', width: '70%', height: '70%', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(46,92,255,.1) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-20%', right: '-15%', width: '60%', height: '60%', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(107,133,255,.07) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />

      {/* Card container */}
      <div style={{ width: '100%', maxWidth: 1020, height: 620, borderRadius: 'var(--r-xl)', overflow: 'hidden', background: 'var(--fk-surface-1)', border: '1px solid var(--glass-border)', boxShadow: '0 48px 96px rgba(0,0,0,.7)', display: 'flex', position: 'relative', zIndex: 1 }}>

        {/* ── Left panel — CTA ── */}
        <div style={{ flex: '0 0 42%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '36px 44px', borderRight: '1px solid var(--glass-border)' }}>

          <Link href="/" style={{ textDecoration: 'none' }}>
            <FraktaHorizontalLogo height={24} />
          </Link>

          {/* Main content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 800, color: '#fff', letterSpacing: '-.03em', lineHeight: 1.1, marginBottom: 12 }}>
                Tokenize any<br />Real-world Asset.
              </h2>
              <p style={{ fontSize: 13, color: 'var(--fk-text-mid)', lineHeight: 1.65, marginBottom: 32, maxWidth: 300 }}>
                Connect your wallet to access the creator portal. New users are onboarded automatically.
              </p>
            </motion.div>

            <button
              className="fk-btn fk-btn-primary"
              onClick={() => { window.location.href = '/dashboard' }}
              style={{ width: '100%', justifyContent: 'center', fontSize: 14, padding: '13px 20px' }}
            >
              <Wallet size={16} strokeWidth={1.75} />
              Enter Creator Portal
            </button>
          </div>

          <p style={{ fontSize: 10, color: 'var(--fk-text-low)', lineHeight: 1.7, fontFamily: 'var(--font-mono)' }}>
            By continuing you agree to our{' '}
            <a href="#" style={{ color: 'var(--fk-text-mid)', textDecoration: 'underline' }}>Terms of Service</a>
            {' '}and{' '}
            <a href="#" style={{ color: 'var(--fk-text-mid)', textDecoration: 'underline' }}>Privacy Policy</a>.
          </p>
        </div>

        {/* ── Right panel — showcase ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '36px 44px', position: 'relative', overflow: 'hidden', background: '#07070A' }}>

          {/* Glass ribbon background */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: '#000' }} />
            <div style={{ position: 'absolute', top: '50%', right: '10%', transform: 'translateY(-50%)', width: 420, height: 600, background: 'rgba(46,92,255,.22)', filter: 'blur(120px)', borderRadius: '50%' }} />
            <svg viewBox="0 0 900 700" preserveAspectRatio="none" style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, mixBlendMode: 'screen', opacity: 0.55 }}>
              <defs>
                {glassRibbons.map(({ index, activeFactor }) => (
                  <linearGradient key={`g-${index}`} id={`g-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%"   stopColor="#000"    stopOpacity={0.98} />
                    <stop offset="10%"  stopColor="#020514" stopOpacity={0.9} />
                    <stop offset="35%"  stopColor="#0a1d63" stopOpacity={0.2 + activeFactor * 0.75} />
                    <stop offset="52%"  stopColor="#1d4ed8" stopOpacity={0.3 + activeFactor * 0.65} />
                    <stop offset="60%"  stopColor="#3b82f6" stopOpacity={0.4 + activeFactor * 0.55} />
                    <stop offset="65%"  stopColor="#f3f8ff" stopOpacity={activeFactor * 0.9} />
                    <stop offset="67%"  stopColor="#fff"    stopOpacity={activeFactor * 0.98} />
                    <stop offset="69%"  stopColor="#93c5fd" stopOpacity={activeFactor * 0.9} />
                    <stop offset="82%"  stopColor="#1e40af" stopOpacity={0.2 + activeFactor * 0.7} />
                    <stop offset="95%"  stopColor="#050a24" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#000"    stopOpacity={0.98} />
                  </linearGradient>
                ))}
              </defs>
              <g>
                {glassRibbons.map(({ d, index }) => (
                  <path key={`r-${index}`} d={d} fill={`url(#g-${index})`} />
                ))}
              </g>
            </svg>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #07070A 0%, rgba(7,7,10,.6) 22%, transparent 48%)' }} />
          </div>

          {/* Dynamic accent glow */}
          <div style={{ position: 'absolute', top: '28%', left: '25%', width: 360, height: 360, borderRadius: '50%', filter: 'blur(100px)', opacity: 0.18, pointerEvents: 'none', transition: 'background 1s', background: `radial-gradient(circle, ${currentStep.accent} 0%, transparent 70%)` }} />

          {/* Header */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--fk-blue-soft)', letterSpacing: '.15em', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: 10 }}>
              FRAKTA SECURE ENGINE
            </span>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-.03em', lineHeight: 1.15, maxWidth: 280 }}>
              Automated asset tokenization pipeline.
            </h3>
          </div>

          {/* Orb + telemetry */}
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 196 }}>
            <div style={{ position: 'absolute', width: 260, height: 260, borderRadius: '50%', border: '1px dashed rgba(107,133,255,.1)' }} className="auth-orbit-slow" />
            <div style={{ position: 'absolute', width: 170, height: 170, borderRadius: '50%', border: '1px solid rgba(107,133,255,.05)' }} className="auth-orbit-fast" />

            <div style={{ position: 'relative', width: 130, height: 130 }}>
              {/* Aura */}
              <div style={{ position: 'absolute', inset: 10, borderRadius: '50%', filter: 'blur(20px)', transition: 'background 1s', background: `${currentStep.accent}40` }} />

              {/* Orbiting TX node */}
              <div style={{ position: 'absolute', top: '50%', left: '50%', width: 0, height: 0 }}>
                <motion.div
                  style={{ position: 'absolute', width: 28, height: 28, top: -84, left: -14, borderRadius: '50%', border: '1px solid rgba(255,255,255,.15)', background: 'var(--fk-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: 'var(--fk-text-low)', fontFamily: 'var(--font-mono)', fontWeight: 700, transformOrigin: '14px 84px' }}
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
                >
                  TX
                </motion.div>
              </div>

              {/* Orbiting blue dot */}
              <div style={{ position: 'absolute', top: '50%', left: '50%', width: 0, height: 0 }}>
                <motion.div
                  style={{ position: 'absolute', width: 8, height: 8, top: -59, left: -4, borderRadius: '50%', background: 'var(--fk-blue)', boxShadow: '0 0 6px rgba(46,92,255,.9)', transformOrigin: '4px 59px' }}
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
                />
              </div>

              {/* Center crystal */}
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 62, height: 62, borderRadius: 18, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.1)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(46,92,255,.14) 0%, transparent 100%)' }} />
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeCycleStep}
                    initial={{ scale: 0.75, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.75, opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    style={{ position: 'relative', zIndex: 1 }}
                  >
                    <currentStep.Icon size={22} style={{ color: currentStep.accent }} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Telemetry — blocks */}
            <div style={{ position: 'absolute', left: 0, top: '10%', background: 'rgba(0,0,0,.88)', border: '1px solid var(--glass-border)', padding: '8px 14px', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--fk-gain)', boxShadow: '0 0 5px rgba(37,212,138,.8)', display: 'inline-block', animation: 'fk-pulse 2s infinite' }} />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9 }}>
                <span style={{ color: 'var(--fk-text-low)', display: 'block', letterSpacing: '.06em' }}>BLOCKS</span>
                <span style={{ color: '#fff', fontWeight: 700, display: 'block', marginTop: 2 }}>#{simulatedBlock}</span>
              </div>
            </div>

            {/* Telemetry — latency */}
            <div style={{ position: 'absolute', right: 0, bottom: '10%', background: 'rgba(0,0,0,.88)', border: '1px solid var(--glass-border)', padding: '8px 14px', borderRadius: 'var(--r-md)', textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9 }}>
                <span style={{ color: 'var(--fk-text-low)', display: 'block', letterSpacing: '.06em' }}>EVM LATENCY</span>
                <span style={{ color: '#fff', fontWeight: 700, display: 'block', marginTop: 2 }}>{simulatedLatency}ms</span>
              </div>
            </div>
          </div>

          {/* Feature cycle card */}
          <div style={{ position: 'relative', zIndex: 1, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 'var(--r-lg)', padding: '18px 22px', backdropFilter: 'blur(24px) saturate(1.4)', WebkitBackdropFilter: 'blur(24px) saturate(1.4)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.08), 0 4px 24px rgba(0,0,0,.4)' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCycleStep}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fk-text-mid)', letterSpacing: '.05em', fontWeight: 600 }}>{currentStep.title}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, padding: '3px 8px', borderRadius: 4, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: '#fff', fontWeight: 700, letterSpacing: '.08em', flexShrink: 0, whiteSpace: 'nowrap' }}>{currentStep.metric}</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--fk-text-low)', lineHeight: 1.6 }}>{currentStep.desc}</p>
              </motion.div>
            </AnimatePresence>

            <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveCycleStep(i)}
                  style={{ width: i === activeCycleStep ? 20 : 6, height: 6, borderRadius: 99, border: 'none', background: i === activeCycleStep ? 'var(--fk-blue)' : 'rgba(255,255,255,.15)', cursor: 'pointer', padding: 0, transition: 'all .3s' }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .auth-orbit-slow { animation: auth-spin 22s linear infinite; }
        .auth-orbit-fast { animation: auth-spin 14s linear infinite reverse; }
        @keyframes auth-spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        @keyframes fk-pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.4 } }
      `}</style>
    </div>
  )
}
