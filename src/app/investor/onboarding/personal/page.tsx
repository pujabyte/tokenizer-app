'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { User, ArrowLeft, UploadCloud, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function PersonalKycPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate network request
    setTimeout(() => {
      router.push('/investor/onboarding/pending')
    }, 1500)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--fk-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 24px', position: 'relative' }}>
      <div style={{ width: '100%', maxWidth: 640, position: 'relative', zIndex: 1 }}>
        <Link href="/investor/onboarding" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--fk-text-mid)', fontSize: 13, textDecoration: 'none', marginBottom: 32 }}>
          <ArrowLeft size={14} /> Back to selection
        </Link>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, rgba(46,92,255,.2), rgba(46,92,255,.05))', border: '1px solid rgba(46,92,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={24} color="#6B85FF" />
            </div>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--fk-text-hi)' }}>Personal KYC</h1>
              <p style={{ fontSize: 14, color: 'var(--fk-text-mid)' }}>Please provide your personal information to continue.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ background: 'var(--fk-surface-1)', border: '1px solid var(--glass-border)', borderRadius: 'var(--r-lg)', padding: '32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--fk-text-low)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.05em' }}>First Name</label>
                  <input type="text" required placeholder="Satoshi" style={{ width: '100%', padding: '12px 16px', background: 'var(--fk-surface-2)', border: '1px solid var(--fk-line)', borderRadius: 8, color: 'var(--fk-text-hi)', fontSize: 14, outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--fk-text-low)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.05em' }}>Last Name</label>
                  <input type="text" required placeholder="Nakamoto" style={{ width: '100%', padding: '12px 16px', background: 'var(--fk-surface-2)', border: '1px solid var(--fk-line)', borderRadius: 8, color: 'var(--fk-text-hi)', fontSize: 14, outline: 'none' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--fk-text-low)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.05em' }}>Date of Birth</label>
                <input type="date" required style={{ width: '100%', padding: '12px 16px', background: 'var(--fk-surface-2)', border: '1px solid var(--fk-line)', borderRadius: 8, color: 'var(--fk-text-hi)', fontSize: 14, outline: 'none' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--fk-text-low)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.05em' }}>Residential Address</label>
                <textarea required rows={3} placeholder="Full address" style={{ width: '100%', padding: '12px 16px', background: 'var(--fk-surface-2)', border: '1px solid var(--fk-line)', borderRadius: 8, color: 'var(--fk-text-hi)', fontSize: 14, outline: 'none', resize: 'none' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--fk-text-low)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.05em' }}>Government ID (Passport / ID Card)</label>
                <div style={{ border: '1px dashed var(--fk-line)', borderRadius: 8, padding: '32px', textAlign: 'center', background: 'var(--glass-bg)', cursor: 'pointer' }}>
                  <UploadCloud size={28} color="var(--fk-text-mid)" style={{ margin: '0 auto 12px' }} />
                  <p style={{ fontSize: 13, color: 'var(--fk-text-mid)', marginBottom: 4 }}>Click to upload or drag and drop</p>
                  <p style={{ fontSize: 11, color: 'var(--fk-text-low)' }}>JPG, PNG or PDF (max. 5MB)</p>
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <button type="submit" disabled={isSubmitting} className="fk-btn fk-btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 15, padding: '14px 24px', opacity: isSubmitting ? 0.7 : 1 }}>
                  {isSubmitting ? 'Submitting...' : 'Submit Verification'}
                  {!isSubmitting && <CheckCircle2 size={16} />}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
