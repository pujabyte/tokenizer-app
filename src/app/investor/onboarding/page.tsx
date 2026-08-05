'use client'
import Link from 'next/link'
import { motion } from 'motion/react'
import { User, Building, ArrowRight, ShieldCheck } from 'lucide-react'
import FraktaHorizontalLogo from '@/components/ui/FraktaHorizontalLogo'
import { useSession } from '@/components/investor/onboarding-shared'

const CARD_CSS = `
.ob-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
/* Hover was driven by inline JS, so keyboard focus produced no feedback at all
   on the primary fork of the whole flow. */
.ob-card {
  display: block; height: 100%; padding: 28px 24px;
  background: var(--fk-surface-1); border: 1px solid var(--glass-border);
  border-radius: var(--r-lg); transition: transform .2s, border-color .2s, background .2s;
}
.ob-card:hover, .ob-card:focus-visible {
  background: var(--fk-surface-2); border-color: var(--fk-blue); transform: translateY(-2px);
}
.ob-card-icon {
  width: 48px; height: 48px; border-radius: var(--r-md); margin-bottom: 18px;
  display: flex; align-items: center; justify-content: center;
}
`

export default function OnboardingSelectionPage() {
  const { data: session } = useSession()

  return (
    <div
      style={{
        minHeight: '100dvh', backgroundColor: 'var(--fk-bg)', display: 'flex',
        flexDirection: 'column', alignItems: 'center', padding: '64px 20px', position: 'relative',
      }}
    >
      <style>{CARD_CSS}</style>
      <div
        aria-hidden="true"
        style={{ position: 'fixed', top: '10%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 400, background: 'radial-gradient(ellipse, var(--fk-blue-tint) 0%, transparent 60%)', filter: 'blur(80px)', pointerEvents: 'none' }}
      />

      <div style={{ width: '100%', maxWidth: 760, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 44 }}>
          <FraktaHorizontalLogo height={28} />
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div className="fk-badge fk-badge-gain" style={{ marginBottom: 18 }}>
              <ShieldCheck size={13} aria-hidden="true" />
              IDENTITY VERIFICATION
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h1)', fontWeight: 800, color: 'var(--fk-text-hi)', letterSpacing: '-.02em', marginBottom: 12 }}>
              Choose your account type
            </h1>
            <p style={{ fontSize: 'var(--fs-body)', color: 'var(--fk-text-mid)' }}>
              To comply with regulations, we need to verify your identity before granting market access.
            </p>
            {session?.email && (
              <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--fk-text-low)', marginTop: 8 }}>
                Signed in as <span className="fk-mono">{session.email}</span>
              </p>
            )}
          </div>

          <div className="ob-grid">
            <Link href="/investor/onboarding/personal" className="ob-card">
              <span
                className="ob-card-icon"
                style={{ background: 'var(--fk-blue-tint)', border: '1px solid var(--fk-blue)', color: 'var(--fk-blue-soft)' }}
                aria-hidden="true"
              >
                <User size={22} />
              </span>
              <h2 style={{ fontSize: 'var(--fs-h3)', fontWeight: 700, color: 'var(--fk-text-hi)', marginBottom: 8 }}>Personal Investor</h2>
              <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--fk-text-mid)', lineHeight: 1.6, marginBottom: 20 }}>
                Invest as an individual. Requires a government-issued ID and a liveness selfie. Four steps, about 5 minutes.
              </p>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--fk-blue-bright)' }}>
                Continue as Personal <ArrowRight size={14} aria-hidden="true" />
              </span>
            </Link>

            <Link href="/investor/onboarding/institutional" className="ob-card">
              <span
                className="ob-card-icon"
                style={{ background: 'var(--fk-soft-tint)', border: '1px solid var(--fk-blue-soft)', color: 'var(--fk-cat-4)' }}
                aria-hidden="true"
              >
                <Building size={22} />
              </span>
              <h2 style={{ fontSize: 'var(--fs-h3)', fontWeight: 700, color: 'var(--fk-text-hi)', marginBottom: 8 }}>Institutional / Corporate</h2>
              <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--fk-text-mid)', lineHeight: 1.6, marginBottom: 20 }}>
                Invest on behalf of a company or trust. Requires formation documents, director KYC and beneficial-ownership details.
              </p>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--fk-cat-4)' }}>
                Continue as Entity <ArrowRight size={14} aria-hidden="true" />
              </span>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
