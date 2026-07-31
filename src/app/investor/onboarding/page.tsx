'use client'
import Link from 'next/link'
import { motion } from 'motion/react'
import { User, Building, ArrowRight, ShieldCheck } from 'lucide-react'
import FraktaHorizontalLogo from '@/components/ui/FraktaHorizontalLogo'

export default function OnboardingSelectionPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--fk-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 24px', overflow: 'hidden', position: 'relative' }}>
      {/* Background glow */}
      <div style={{ position: 'fixed', top: '10%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 400, background: 'radial-gradient(ellipse, rgba(46,92,255,.08) 0%, transparent 60%)', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 760, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 48 }}>
          <FraktaHorizontalLogo height={28} />
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 999, background: 'rgba(37,212,138,.1)', border: '1px solid rgba(37,212,138,.2)', marginBottom: 20 }}>
              <ShieldCheck size={14} color="#25D48A" />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#25D48A', letterSpacing: '.05em' }}>IDENTITY VERIFICATION</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, color: 'var(--fk-text-hi)', letterSpacing: '-.02em', marginBottom: 12 }}>
              Choose your account type
            </h1>
            <p style={{ fontSize: 15, color: 'var(--fk-text-mid)' }}>
              To comply with regulations, we need to verify your identity before granting market access.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {/* Personal Option */}
            <Link href="/investor/onboarding/personal" style={{ textDecoration: 'none', display: 'block' }}>
              <div style={{
                background: 'var(--fk-surface-1)', border: '1px solid var(--glass-border)', borderRadius: 'var(--r-lg)',
                padding: '32px 28px', height: '100%', transition: 'all .2s', cursor: 'pointer',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'var(--fk-surface-2)';
                  e.currentTarget.style.borderColor = 'rgba(46,92,255,.4)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'var(--fk-surface-1)';
                  e.currentTarget.style.borderColor = 'var(--glass-border)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, rgba(46,92,255,.2), rgba(46,92,255,.05))', border: '1px solid rgba(46,92,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <User size={24} color="#6B85FF" />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--fk-text-hi)', marginBottom: 8 }}>Personal Investor</h3>
                <p style={{ fontSize: 13, color: 'var(--fk-text-mid)', lineHeight: 1.6, marginBottom: 24 }}>
                  Invest as an individual. Requires government-issued ID and proof of address.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--fk-blue)' }}>
                  Continue as Personal <ArrowRight size={14} />
                </div>
              </div>
            </Link>

            {/* Institutional Option */}
            <Link href="/investor/onboarding/institutional" style={{ textDecoration: 'none', display: 'block' }}>
              <div style={{
                background: 'var(--fk-surface-1)', border: '1px solid var(--glass-border)', borderRadius: 'var(--r-lg)',
                padding: '32px 28px', height: '100%', transition: 'all .2s', cursor: 'pointer',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'var(--fk-surface-2)';
                  e.currentTarget.style.borderColor = 'rgba(167,139,250,.4)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'var(--fk-surface-1)';
                  e.currentTarget.style.borderColor = 'var(--glass-border)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, rgba(167,139,250,.2), rgba(167,139,250,.05))', border: '1px solid rgba(167,139,250,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <Building size={24} color="#A78BFA" />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--fk-text-hi)', marginBottom: 8 }}>Institutional / Corporate</h3>
                <p style={{ fontSize: 13, color: 'var(--fk-text-mid)', lineHeight: 1.6, marginBottom: 24 }}>
                  Invest on behalf of a company or trust. Requires corporate formation documents and director KYC.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#A78BFA' }}>
                  Continue as Entity <ArrowRight size={14} />
                </div>
              </div>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
