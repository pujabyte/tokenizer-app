'use client'
import { Suspense, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import {
  AlertTriangle, ArrowRight, Check, Download, Fingerprint, Info, Key, Mail,
  Pause, Play, RefreshCw, ShieldAlert, Sparkles, Wallet, Zap,
} from 'lucide-react'
import FraktaHorizontalLogo from '@/components/ui/FraktaHorizontalLogo'
import { Modal } from '@/components/ui/modal'
import { shortenAddress } from '@/lib/format'
import {
  postAuth, routeForStatus, useSession, validators, type Session,
} from '@/components/investor/onboarding-shared'

const STEPS = [
  {
    title: 'Access premium tokenized assets',
    desc: 'Invest in real-world assets, stocks, and exclusive opportunities previously unavailable on-chain.',
    metric: 'GLOBAL MARKETS',
    Icon: Zap,
    accent: 'var(--fk-blue)',
  },
  {
    title: 'Seamless unified liquidity',
    desc: 'Trade instantly across multiple liquidity sources with optimized execution and zero hidden fees.',
    metric: 'INSTANT EXECUTION',
    Icon: Sparkles,
    accent: 'var(--fk-gain)',
  },
  {
    title: 'Non-custodial — your keys, your assets',
    desc: 'Absolute decentralized access with no intermediaries. Your private keys stay entirely in your hands.',
    metric: 'SELF-CUSTODY',
    Icon: Key,
    accent: 'var(--fk-blue-soft)',
  },
  {
    title: 'Full KYC/AML compliance built-in',
    desc: 'Identity verification embedded directly at the smart contract level for real-time regulatory compliance.',
    metric: 'SECURE IDENTITY',
    Icon: Fingerprint,
    accent: 'var(--fk-cat-4)',
  },
]

/** Deterministic wallet mock — every failure state has to be reachable. */
const WALLET_OUTCOMES = [
  { value: 'success', label: 'Connects successfully' },
  { value: 'rejected', label: 'User rejects the signature' },
  { value: 'wrong_network', label: 'Wallet is on the wrong network' },
  { value: 'not_installed', label: 'No wallet extension installed' },
  { value: 'already_connected', label: 'Already connected (reconnect)' },
] as const

type WalletOutcome = (typeof WALLET_OUTCOMES)[number]['value']

const MOCK_ADDRESS = '0x8A21F6e6C2F7B3d0c19aE5B0e2F1a4C3D5b67890'
const REQUIRED_NETWORK = 'Polygon'

const AUTH_CSS = `
.auth-card {
  width: 100%; max-width: 1020px; min-height: 620px;
  border-radius: var(--r-xl); overflow: hidden;
  background: var(--fk-surface-1); border: 1px solid var(--glass-border);
  box-shadow: var(--el-3); display: flex; position: relative; z-index: 1;
}
.auth-pane-left {
  flex: 0 0 42%; display: flex; flex-direction: column;
  justify-content: space-between; gap: 32px; padding: 36px 40px;
  border-right: 1px solid var(--glass-border);
}
.auth-pane-right {
  flex: 1; display: flex; flex-direction: column; justify-content: space-between;
  gap: 28px; padding: 36px 40px; position: relative; overflow: hidden;
  background: var(--fk-surface-0);
}
.auth-tab {
  flex: 1; padding: 9px; border-radius: 9px; font-size: var(--fs-sm); font-weight: 600;
  color: var(--fk-text-mid); background: transparent; transition: all .15s;
}
.auth-tab[aria-selected="true"] { background: var(--fk-surface-3); color: var(--fk-text-hi); box-shadow: var(--glass-hi); }
.auth-dot {
  width: 24px; height: 24px; display: inline-flex; align-items: center;
  justify-content: center; background: none; border-radius: var(--r-sm); padding: 0;
}
.auth-dot > span {
  display: block; height: 6px; border-radius: 99px;
  background: var(--fk-text-low); transition: all .3s; width: 6px;
}
.auth-dot[aria-current="true"] > span { width: 18px; background: var(--fk-blue); }

/* Below 880px the two panes stacked into ~160px columns and clipped their
   content. Stack them and let the page scroll instead. */
@media (max-width: 880px) {
  .auth-card { flex-direction: column; min-height: 0; }
  .auth-pane-left { flex: none; border-right: none; border-bottom: 1px solid var(--glass-border); padding: 28px 24px; }
  .auth-pane-right { flex: none; padding: 28px 24px; }
  .auth-telemetry { position: static !important; margin: 0 !important; }
  .auth-telemetry-row { display: flex; gap: 10px; justify-content: center; margin-top: 16px; }
}
`

function AuthPageInner() {
  const router = useRouter()
  const params = useSearchParams()
  const { data: session, loading: sessionLoading } = useSession()

  const nextParam = params.get('next')
  const reason = params.get('reason')

  const [mode, setMode] = useState<'email' | 'wallet'>('email')
  const [consent, setConsent] = useState(false)
  const [consentTouched, setConsentTouched] = useState(false)
  const [legalDoc, setLegalDoc] = useState<'terms' | 'privacy' | null>(null)

  // Email path
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [emailBusy, setEmailBusy] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Wallet path
  const [outcome, setOutcome] = useState<WalletOutcome>('success')
  const [walletBusy, setWalletBusy] = useState(false)
  const [walletError, setWalletError] = useState<{ kind: WalletOutcome; message: string } | null>(null)

  const [activeCycleStep, setActiveCycleStep] = useState(0)
  const [paused, setPaused] = useState(false)
  const [simulatedBlock, setSimulatedBlock] = useState(19283745)
  const [simulatedLatency, setSimulatedLatency] = useState(12)

  useEffect(() => {
    const interval = setInterval(() => {
      setSimulatedBlock(prev => prev + 1)
      setSimulatedLatency(Math.floor(Math.random() * 8) + 8)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  // WCAG 2.2.2 — auto-advancing content needs a pause control.
  useEffect(() => {
    if (paused) return
    const cycle = setInterval(() => setActiveCycleStep(prev => (prev + 1) % STEPS.length), 5000)
    return () => clearInterval(cycle)
  }, [paused])

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
  const alreadySignedIn = Boolean(session?.authenticated)

  const goOnward = (s: Session | undefined) => {
    // Honour ?next= only when the session may actually view it; otherwise the
    // middleware would bounce the user straight back here.
    const fallback = routeForStatus(s?.status)
    const target = nextParam && fallback === '/investor/dashboard' ? nextParam : fallback
    router.push(target)
  }

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setConsentTouched(true)
    const problem = validators.email(email)
    setEmailError(problem)
    if (problem || !consent) return

    setFormError(null)
    setEmailBusy(true)
    const res = await postAuth('LOGIN', { email: email.trim() })
    setEmailBusy(false)
    if (!res.ok) {
      if (res.code === 'INVALID_EMAIL') setEmailError(res.error)
      else setFormError(res.error)
      return
    }
    goOnward(res.session)
  }

  const connectWallet = async (forcedOutcome?: WalletOutcome) => {
    const effective = forcedOutcome ?? outcome
    setConsentTouched(true)
    if (!consent) return

    setWalletError(null)
    setFormError(null)
    setWalletBusy(true)
    // Mock handshake delay so the pending state is visible.
    await new Promise(r => setTimeout(r, 900))

    if (effective === 'not_installed') {
      setWalletBusy(false)
      setWalletError({ kind: effective, message: 'No Web3 wallet was detected in this browser.' })
      return
    }
    if (effective === 'rejected') {
      setWalletBusy(false)
      setWalletError({ kind: effective, message: 'You rejected the signature request in your wallet.' })
      return
    }
    if (effective === 'wrong_network') {
      setWalletBusy(false)
      setWalletError({ kind: effective, message: `Your wallet is connected to Ethereum Mainnet. Frakta settles on ${REQUIRED_NETWORK}.` })
      return
    }

    const res = await postAuth('CONNECT_WALLET', { address: MOCK_ADDRESS })
    setWalletBusy(false)
    if (!res.ok) {
      setFormError(res.error)
      return
    }
    goOnward(res.session)
  }

  const consentBlocked = consentTouched && !consent

  return (
    <div
      style={{
        minHeight: '100dvh', backgroundColor: 'var(--fk-bg)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: 24,
      }}
    >
      <style>{AUTH_CSS}</style>

      {/* Atmospheric glow */}
      <div aria-hidden="true" style={{ position: 'fixed', top: '-25%', left: '-15%', width: '70%', height: '70%', borderRadius: '50%', background: 'radial-gradient(ellipse, var(--fk-blue-tint) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div aria-hidden="true" style={{ position: 'fixed', bottom: '-20%', right: '-15%', width: '60%', height: '60%', borderRadius: '50%', background: 'radial-gradient(ellipse, var(--fk-soft-tint) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <div className="auth-card">

        {/* ── Left panel — sign in ── */}
        <div className="auth-pane-left">

          <Link href="/" aria-label="Frakta home">
            <FraktaHorizontalLogo height={24} />
          </Link>

          <div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h1)', fontWeight: 800, color: 'var(--fk-text-hi)', letterSpacing: '-.03em', lineHeight: 1.1, marginBottom: 10 }}>
                Access Frakta<br />Markets.
              </h1>
              <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--fk-text-mid)', lineHeight: 1.6, marginBottom: 20, maxWidth: 320 }}>
                Connect your wallet or sign in with email to access tokenized real-world assets.
              </p>
            </motion.div>

            {/* Why the user landed here — the middleware sets ?reason= */}
            {reason === 'signin_required' && (
              <div className="fk-alert fk-alert-info" style={{ marginBottom: 16 }} role="status">
                <Info size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                <div><b>Please sign in to continue</b><p>That page requires an authenticated session.</p></div>
              </div>
            )}
            {reason === 'verification_required' && (
              <div className="fk-alert fk-alert-warn" style={{ marginBottom: 16 }} role="status">
                <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                <div><b>Verification required</b><p>Finish identity verification before trading.</p></div>
              </div>
            )}

            {alreadySignedIn && (
              <div className="fk-fbanner fk-fb-brand" style={{ marginBottom: 16 }} role="status">
                <Check size={16} style={{ flexShrink: 0, marginTop: 2, color: 'var(--fk-fb-brand-title)' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="fk-ft">Session already active</p>
                  <p className="fk-fd fk-truncate">
                    {session?.email ?? shortenAddress(session?.walletAddress)}
                  </p>
                  <button type="button" className="fk-btn fk-btn-primary" style={{ marginTop: 10 }} onClick={() => goOnward(session ?? undefined)}>
                    Continue <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            )}

            {formError && (
              <div className="fk-alert fk-alert-loss" style={{ marginBottom: 16 }} role="alert">
                <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                <div><b>Sign-in failed</b><p>{formError}</p></div>
              </div>
            )}

            {/* Method switch */}
            <div
              role="tablist"
              aria-label="Sign-in method"
              style={{ display: 'flex', gap: 4, padding: 3, background: 'var(--fk-bg)', border: '1px solid var(--fk-line-soft)', borderRadius: 'var(--r-md)', marginBottom: 18 }}
            >
              <button type="button" role="tab" id="tab-email" aria-selected={mode === 'email'} aria-controls="panel-email" className="auth-tab" onClick={() => setMode('email')}>
                <Mail size={13} style={{ verticalAlign: '-2px', marginRight: 6 }} />Email
              </button>
              <button type="button" role="tab" id="tab-wallet" aria-selected={mode === 'wallet'} aria-controls="panel-wallet" className="auth-tab" onClick={() => setMode('wallet')}>
                <Wallet size={13} style={{ verticalAlign: '-2px', marginRight: 6 }} />Wallet
              </button>
            </div>

            {mode === 'email' ? (
              <form id="panel-email" role="tabpanel" aria-labelledby="tab-email" onSubmit={submitEmail} noValidate>
                <label htmlFor="auth-email" style={{ display: 'block', fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--fk-text-hi)', marginBottom: 8 }}>
                  Email address
                </label>
                <input
                  id="auth-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className={`fk-input${emailError ? ' fk-err' : ''}`}
                  value={email}
                  onChange={e => { setEmail(e.target.value); if (emailError) setEmailError(null) }}
                  onBlur={() => email && setEmailError(validators.email(email))}
                  placeholder="you@example.com"
                  maxLength={120}
                  aria-invalid={emailError ? true : undefined}
                  aria-describedby={emailError ? 'auth-email-err' : 'auth-email-hint'}
                  style={{ padding: '12px 14px', fontSize: 'var(--fs-body)' }}
                />
                {emailError
                  ? <p id="auth-email-err" className="fk-hint fk-err" role="alert">{emailError}</p>
                  : <p id="auth-email-hint" className="fk-hint">We email a one-time sign-in link. No password required.</p>}

                <ConsentRow
                  checked={consent}
                  invalid={consentBlocked}
                  onChange={v => { setConsent(v); setConsentTouched(true) }}
                  onOpen={setLegalDoc}
                />

                <button
                  type="submit"
                  className="fk-btn fk-btn-primary"
                  disabled={emailBusy || !consent}
                  style={{ width: '100%', justifyContent: 'center', fontSize: 'var(--fs-body)', padding: '13px 20px', marginTop: 16 }}
                >
                  {emailBusy ? 'Signing in…' : 'Continue with email'}
                  {!emailBusy && <ArrowRight size={15} />}
                </button>
              </form>
            ) : (
              <div id="panel-wallet" role="tabpanel" aria-labelledby="tab-wallet">
                {session?.walletAddress && !walletError && (
                  <p className="fk-badge fk-badge-brand fk-mono" style={{ marginBottom: 12 }}>
                    <span className="fk-dot" />{shortenAddress(session.walletAddress)}
                  </p>
                )}

                {walletError?.kind === 'not_installed' && (
                  <div className="fk-alert fk-alert-warn" style={{ marginBottom: 14 }} role="alert">
                    <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <b>No wallet detected</b>
                      <p>{walletError.message} Install a browser wallet, then reconnect.</p>
                      <a
                        className="fk-btn fk-btn-secondary"
                        style={{ marginTop: 10 }}
                        href="https://metamask.io/download/"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download size={13} /> Install a wallet
                      </a>
                    </div>
                  </div>
                )}

                {walletError?.kind === 'rejected' && (
                  <div className="fk-alert fk-alert-loss" style={{ marginBottom: 14 }} role="alert">
                    <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <b>Signature rejected</b>
                      <p>{walletError.message} Approve the request to prove you control the address.</p>
                      <button type="button" className="fk-btn fk-btn-secondary" style={{ marginTop: 10 }} onClick={() => connectWallet()}>
                        <RefreshCw size={13} /> Try again
                      </button>
                    </div>
                  </div>
                )}

                {walletError?.kind === 'wrong_network' && (
                  <div className="fk-alert fk-alert-warn" style={{ marginBottom: 14 }} role="alert">
                    <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <b>Wrong network</b>
                      <p>{walletError.message}</p>
                      <button
                        type="button"
                        className="fk-btn fk-btn-primary"
                        style={{ marginTop: 10 }}
                        onClick={() => { setOutcome('success'); connectWallet('success') }}
                      >
                        Switch to {REQUIRED_NETWORK}
                      </button>
                    </div>
                  </div>
                )}

                <ConsentRow
                  checked={consent}
                  invalid={consentBlocked}
                  onChange={v => { setConsent(v); setConsentTouched(true) }}
                  onOpen={setLegalDoc}
                />

                <button
                  type="button"
                  className="fk-btn fk-btn-primary"
                  disabled={walletBusy || !consent}
                  onClick={() => connectWallet()}
                  style={{ width: '100%', justifyContent: 'center', fontSize: 'var(--fs-body)', padding: '13px 20px', marginTop: 16 }}
                >
                  <Wallet size={16} strokeWidth={1.75} />
                  {walletBusy
                    ? 'Waiting for wallet…'
                    : outcome === 'already_connected' ? 'Reconnect wallet' : 'Connect wallet'}
                </button>

                {/* Mock-only outcome picker so each failure path is reachable. */}
                <div style={{ marginTop: 14, padding: 12, border: '1px dashed var(--fk-line)', borderRadius: 'var(--r-md)', background: 'var(--fk-surface-2)' }}>
                  <label htmlFor="wallet-outcome" style={{ display: 'block', fontSize: 'var(--fs-2xs)', textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--fk-text-low)', fontWeight: 700, marginBottom: 6 }}>
                    Wallet simulation (mock only)
                  </label>
                  <select
                    id="wallet-outcome"
                    className="fk-input"
                    value={outcome}
                    onChange={e => { setOutcome(e.target.value as WalletOutcome); setWalletError(null) }}
                    style={{ padding: '8px 10px' }}
                  >
                    {WALLET_OUTCOMES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
            )}

            {consentBlocked && (
              <p className="fk-hint fk-err" role="alert" style={{ marginTop: 10 }}>
                You must accept the Terms of Service and Privacy Policy to continue.
              </p>
            )}
          </div>

          <p style={{ fontSize: 'var(--fs-2xs)', color: 'var(--fk-text-low)', lineHeight: 1.7, fontFamily: 'var(--font-mono)' }}>
            {sessionLoading ? 'Checking session…' : 'Frakta never takes custody of your assets.'}
          </p>
        </div>

        {/* ── Right panel — showcase ── */}
        <div className="auth-pane-right">

          {/* Glass ribbon background */}
          <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'var(--fk-surface-0)' }} />
            <div style={{ position: 'absolute', top: '50%', right: '10%', transform: 'translateY(-50%)', width: 420, height: 600, background: 'rgba(46,92,255,.22)', filter: 'blur(120px)', borderRadius: '50%' }} />
            <svg viewBox="0 0 900 700" preserveAspectRatio="none" style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, mixBlendMode: 'screen', opacity: 0.55 }}>
              <defs>
                {glassRibbons.map(({ index, activeFactor }) => (
                  <linearGradient key={`g-${index}`} id={`g-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#000" stopOpacity={0.98} />
                    <stop offset="10%" stopColor="#020514" stopOpacity={0.9} />
                    <stop offset="35%" stopColor="#0a1d63" stopOpacity={0.2 + activeFactor * 0.75} />
                    <stop offset="52%" stopColor="#1d4ed8" stopOpacity={0.3 + activeFactor * 0.65} />
                    <stop offset="60%" stopColor="#3b82f6" stopOpacity={0.4 + activeFactor * 0.55} />
                    <stop offset="65%" stopColor="#f3f8ff" stopOpacity={activeFactor * 0.9} />
                    <stop offset="67%" stopColor="#fff" stopOpacity={activeFactor * 0.98} />
                    <stop offset="69%" stopColor="#93c5fd" stopOpacity={activeFactor * 0.9} />
                    <stop offset="82%" stopColor="#1e40af" stopOpacity={0.2 + activeFactor * 0.7} />
                    <stop offset="95%" stopColor="#050a24" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#000" stopOpacity={0.98} />
                  </linearGradient>
                ))}
              </defs>
              <g>
                {glassRibbons.map(({ d, index }) => (
                  <path key={`r-${index}`} d={d} fill={`url(#g-${index})`} />
                ))}
              </g>
            </svg>
          </div>

          {/* Dynamic accent glow */}
          <div aria-hidden="true" style={{ position: 'absolute', top: '28%', left: '25%', width: 360, height: 360, borderRadius: '50%', filter: 'blur(100px)', opacity: 0.18, pointerEvents: 'none', transition: 'background 1s', background: `radial-gradient(circle, ${currentStep.accent} 0%, transparent 70%)` }} />

          {/* Header */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--fk-blue-soft)', letterSpacing: '.15em', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: 10 }}>
              FRAKTA INVESTOR PROTOCOL
            </span>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h2)', fontWeight: 800, color: 'var(--fk-text-hi)', letterSpacing: '-.03em', lineHeight: 1.15, maxWidth: 300 }}>
              Institutional grade tokenized markets.
            </h2>
          </div>

          {/* Orb + telemetry */}
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 196 }}>
            <div aria-hidden="true" style={{ position: 'absolute', width: 260, height: 260, borderRadius: '50%', border: '1px dashed rgba(107,133,255,.1)' }} className="auth-orbit-slow" />
            <div aria-hidden="true" style={{ position: 'absolute', width: 170, height: 170, borderRadius: '50%', border: '1px solid rgba(107,133,255,.05)' }} className="auth-orbit-fast" />

            <div style={{ position: 'relative', width: 130, height: 130 }}>
              <div aria-hidden="true" style={{ position: 'absolute', inset: 10, borderRadius: '50%', filter: 'blur(20px)', transition: 'background 1s', background: currentStep.accent, opacity: 0.25 }} />

              <div aria-hidden="true" style={{ position: 'absolute', top: '50%', left: '50%', width: 0, height: 0 }}>
                <motion.div
                  style={{ position: 'absolute', width: 28, height: 28, top: -84, left: -14, borderRadius: '50%', border: '1px solid var(--glass-border)', background: 'var(--fk-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: 'var(--fk-text-low)', fontFamily: 'var(--font-mono)', fontWeight: 700, transformOrigin: '14px 84px' }}
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
                >
                  TX
                </motion.div>
              </div>

              <div aria-hidden="true" style={{ position: 'absolute', top: '50%', left: '50%', width: 0, height: 0 }}>
                <motion.div
                  style={{ position: 'absolute', width: 8, height: 8, top: -59, left: -4, borderRadius: '50%', background: 'var(--fk-blue)', boxShadow: '0 0 6px rgba(46,92,255,.9)', transformOrigin: '4px 59px' }}
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
                />
              </div>

              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 62, height: 62, borderRadius: 18, background: 'rgba(255,255,255,.03)', border: '1px solid var(--glass-border)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, var(--fk-blue-tint) 0%, transparent 100%)' }} />
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeCycleStep}
                    initial={{ scale: 0.75, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.75, opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    style={{ position: 'relative', zIndex: 1 }}
                  >
                    <currentStep.Icon size={22} style={{ color: currentStep.accent }} aria-hidden="true" />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <div className="auth-telemetry" style={{ position: 'absolute', left: 0, top: '10%', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: '8px 14px', borderRadius: 'var(--r-md)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--fk-gain)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9 }}>
                <span style={{ color: 'var(--fk-text-low)', display: 'block', letterSpacing: '.06em' }}>BLOCKS</span>
                <span style={{ color: 'var(--fk-text-hi)', fontWeight: 700, display: 'block', marginTop: 2 }}>#{simulatedBlock}</span>
              </div>
            </div>

            <div className="auth-telemetry" style={{ position: 'absolute', right: 0, bottom: '10%', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: '8px 14px', borderRadius: 'var(--r-md)', textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9 }}>
                <span style={{ color: 'var(--fk-text-low)', display: 'block', letterSpacing: '.06em' }}>EVM LATENCY</span>
                <span style={{ color: 'var(--fk-text-hi)', fontWeight: 700, display: 'block', marginTop: 2 }}>{simulatedLatency}ms</span>
              </div>
            </div>
          </div>

          {/* Feature carousel */}
          <div
            style={{ position: 'relative', zIndex: 1, background: 'rgba(255,255,255,.06)', border: '1px solid var(--glass-border)', borderRadius: 'var(--r-lg)', padding: '16px 20px', backdropFilter: 'blur(24px) saturate(1.4)', WebkitBackdropFilter: 'blur(24px) saturate(1.4)', boxShadow: 'var(--glass-hi), var(--el-2)' }}
            aria-roledescription="carousel"
            aria-label="Why Frakta"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCycleStep}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                role="group"
                aria-label={`${activeCycleStep + 1} of ${STEPS.length}`}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fk-text-mid)', letterSpacing: '.05em', fontWeight: 600 }}>{currentStep.title}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 8, padding: '3px 8px', borderRadius: 4, background: 'rgba(255,255,255,.06)', border: '1px solid var(--glass-border)', color: 'var(--fk-text-hi)', fontWeight: 700, letterSpacing: '.08em', flexShrink: 0, whiteSpace: 'nowrap' }}>{currentStep.metric}</span>
                </div>
                <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--fk-text-mid)', lineHeight: 1.6 }}>{currentStep.desc}</p>
              </motion.div>
            </AnimatePresence>

            <div style={{ display: 'flex', gap: 2, marginTop: 10, alignItems: 'center' }}>
              {STEPS.map((s, i) => (
                <button
                  key={s.metric}
                  type="button"
                  className="auth-dot"
                  aria-current={i === activeCycleStep}
                  aria-label={`Show slide ${i + 1} of ${STEPS.length}: ${s.title}`}
                  onClick={() => { setActiveCycleStep(i); setPaused(true) }}
                >
                  <span />
                </button>
              ))}
              <button
                type="button"
                className="fk-btn fk-btn-ghost"
                onClick={() => setPaused(p => !p)}
                aria-pressed={paused}
                style={{ marginLeft: 'auto', padding: '4px 8px', fontSize: 'var(--fs-2xs)' }}
              >
                {paused ? <><Play size={11} /> Play</> : <><Pause size={11} /> Pause</>}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={legalDoc !== null}
        onClose={() => setLegalDoc(null)}
        title={legalDoc === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
        footer={<button className="fk-btn fk-btn-primary" onClick={() => setLegalDoc(null)}>Close</button>}
      >
        {legalDoc === 'privacy' ? (
          <div style={{ display: 'grid', gap: 12, fontSize: 'var(--fs-sm)', color: 'var(--fk-text-mid)', lineHeight: 1.65 }}>
            <p><b style={{ color: 'var(--fk-text-hi)' }}>What we collect.</b> Identity documents, a liveness selfie, contact details and — for entities — corporate registry documents and beneficial-ownership data.</p>
            <p><b style={{ color: 'var(--fk-text-hi)' }}>Why.</b> To satisfy KYC/AML obligations and to whitelist your wallet address for regulated tokenized assets.</p>
            <p><b style={{ color: 'var(--fk-text-hi)' }}>Retention.</b> Verification records are retained for the statutory period after the account closes, then deleted.</p>
            <p><b style={{ color: 'var(--fk-text-hi)' }}>Your rights.</b> Request a copy, correction or erasure of your data at {'compliance@frakta.io'}.</p>
            <p style={{ color: 'var(--fk-text-low)' }}>Prototype text for demonstration purposes.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12, fontSize: 'var(--fs-sm)', color: 'var(--fk-text-mid)', lineHeight: 1.65 }}>
            <p><b style={{ color: 'var(--fk-text-hi)' }}>Eligibility.</b> You must be 18 or older and resident in a supported jurisdiction. Access is refused where local law prohibits tokenized securities.</p>
            <p><b style={{ color: 'var(--fk-text-hi)' }}>Self-custody.</b> Frakta never takes custody of your assets or private keys. Transactions you sign are final and irreversible.</p>
            <p><b style={{ color: 'var(--fk-text-hi)' }}>Verification.</b> Market access depends on completing identity verification, which must be renewed every 24 months.</p>
            <p><b style={{ color: 'var(--fk-text-hi)' }}>Risk.</b> Tokenized real-world assets can lose value. Nothing in the portal is investment advice.</p>
            <p style={{ color: 'var(--fk-text-low)' }}>Prototype text for demonstration purposes.</p>
          </div>
        )}
      </Modal>

      <style>{`
        .auth-orbit-slow { animation: auth-spin 22s linear infinite; }
        .auth-orbit-fast { animation: auth-spin 14s linear infinite reverse; }
        @keyframes auth-spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
      `}</style>
    </div>
  )
}

/** Required consent — the old copy claimed agreement without capturing it. */
function ConsentRow({
  checked, invalid, onChange, onOpen,
}: {
  checked: boolean
  invalid: boolean
  onChange: (v: boolean) => void
  onOpen: (doc: 'terms' | 'privacy') => void
}) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginTop: 16 }}>
      <input
        id="auth-consent"
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        aria-invalid={invalid ? true : undefined}
        required
        style={{ width: 16, height: 16, marginTop: 2, accentColor: 'var(--fk-blue)', flexShrink: 0 }}
      />
      <label htmlFor="auth-consent" style={{ fontSize: 'var(--fs-xs)', color: 'var(--fk-text-mid)', lineHeight: 1.55 }}>
        I agree to the{' '}
        <button type="button" className="fk-btn fk-btn-ghost" style={{ padding: 0, fontSize: 'var(--fs-xs)', textDecoration: 'underline' }} onClick={() => onOpen('terms')}>
          Terms of Service
        </button>{' '}
        and{' '}
        <button type="button" className="fk-btn fk-btn-ghost" style={{ padding: 0, fontSize: 'var(--fs-xs)', textDecoration: 'underline' }} onClick={() => onOpen('privacy')}>
          Privacy Policy
        </button>.
      </label>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', background: 'var(--fk-bg)', color: 'var(--fk-text-mid)' }}>
        Loading sign-in…
      </div>
    }>
      <AuthPageInner />
    </Suspense>
  )
}
