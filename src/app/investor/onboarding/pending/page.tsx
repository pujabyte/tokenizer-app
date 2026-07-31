'use client'
import { motion } from 'motion/react'
import { Clock, ShieldCheck, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function PendingApprovalPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--fk-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', position: 'relative' }}>
      {/* Background glow */}
      <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(167,139,250,.07) 0%, transparent 60%)', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
        <div style={{ width: '100%', maxWidth: 480, background: 'var(--fk-surface-1)', border: '1px solid var(--glass-border)', borderRadius: 'var(--r-xl)', padding: '48px 40px', textAlign: 'center', position: 'relative', zIndex: 1, boxShadow: '0 24px 64px rgba(0,0,0,.5)' }}>
          
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(255,200,50,.2), rgba(255,200,50,.05))', border: '1px solid rgba(255,200,50,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', position: 'relative' }}>
            <Clock size={40} color="#FFC832" />
            <div style={{ position: 'absolute', right: -4, bottom: -4, background: '#111', borderRadius: '50%', padding: 2 }}>
              <ShieldCheck size={20} color="#25D48A" />
            </div>
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--fk-text-hi)', marginBottom: 12 }}>Under Review</h1>
          
          <p style={{ fontSize: 15, color: 'var(--fk-text-mid)', lineHeight: 1.6, marginBottom: 32 }}>
            Your application has been received and is currently being reviewed by our compliance team. We will notify you via email once approved.
          </p>

          <div style={{ padding: '16px', borderRadius: 12, background: 'var(--fk-surface-2)', border: '1px dashed var(--fk-line)', marginBottom: 40 }}>
            <p style={{ fontSize: 12, color: 'var(--fk-text-low)', fontFamily: 'var(--font-mono)' }}>Estimated review time: 24-48 hours</p>
          </div>

          {/* SIMULATION BUTTON - Dev Only */}
          <div style={{ paddingTop: 32, borderTop: '1px solid var(--fk-line-soft)' }}>
            <p style={{ fontSize: 10, color: 'var(--fk-text-low)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 16 }}>Prototype Developer Tools</p>
            <Link href="/investor/dashboard" className="fk-btn" style={{ width: '100%', justifyContent: 'center', fontSize: 14, background: 'rgba(37,212,138,.15)', color: '#25D48A', border: '1px solid rgba(37,212,138,.3)', gap: 8 }}>
              Simulate Admin Approval <ArrowRight size={14} />
            </Link>
          </div>

        </div>
      </motion.div>
    </div>
  )
}
