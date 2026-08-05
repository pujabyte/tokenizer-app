'use client'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import {
  ArrowLeft, Check, CheckCircle2, FileText, ShieldCheck, XCircle,
} from 'lucide-react'
import {
  ALLOWED_COUNTRIES, DOC_TYPES, EMPTY_UPLOAD, FailureBanner, RadioCardGroup,
  ResumeBanner, SelectField, StepProgress, TextField, UploadSlot,
  docLabel, postAuth, useBeforeUnload, usePersistedState, useStepParam, validators,
  type UploadValue,
} from '@/components/investor/onboarding-shared'

const STEP_NAMES = ['Overview', 'Document type', 'Upload documents', 'Your details']
const DRAFT_KEY = 'fk_kyc_personal_draft'

type Draft = {
  country: string
  docType: string
  firstName: string
  lastName: string
  idNumber: string
  front: UploadValue
  /** Furthest step reached, so a refresh can offer to resume. */
  maxStep: number
}

const EMPTY_DRAFT: Draft = {
  country: 'Singapore',
  docType: 'id_card',
  firstName: '',
  lastName: '',
  idNumber: '',
  front: EMPTY_UPLOAD,
  maxStep: 1,
}

function PersonalKycInner() {
  const router = useRouter()
  const [step, setStep] = useStepParam(STEP_NAMES.length)
  const [draft, setDraft, clearDraft] = usePersistedState<Draft>(DRAFT_KEY, EMPTY_DRAFT)

  const [errors, setErrors] = useState<Record<string, string | null>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [savedStep, setSavedStep] = useState(1)
  const [resumeDismissed, setResumeDismissed] = useState(false)

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft(d => ({ ...d, [key]: value }))

  // Read the saved step once, before the hook's own write cycle overwrites it.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Draft>
        if (typeof parsed.maxStep === 'number') setSavedStep(parsed.maxStep)
      }
    } catch { /* no usable draft */ }
  }, [])

  useEffect(() => {
    setDraft(d => (step > d.maxStep ? { ...d, maxStep: step } : d))
  }, [step, setDraft])

  const dirty = Boolean(
    draft.firstName || draft.lastName || draft.idNumber || draft.front.status !== 'idle'
  )
  useBeforeUnload(dirty && !submitted)

  const missingUploads = useMemo(() => {
    const missing: string[] = []
    if (draft.front.status !== 'success') missing.push('front of document')
    return missing
  }, [draft.front.status])

  const validateDetails = () => {
    const next = {
      firstName: validators.name('First name')(draft.firstName),
      lastName: validators.name('Last name')(draft.lastName),
      idNumber: validators.idNumber(draft.idNumber),
    }
    setErrors(next)
    return !next.firstName && !next.lastName && !next.idNumber
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateDetails()) return

    setSubmitError(null)
    setIsSubmitting(true)
    const res = await postAuth('SUBMIT_KYC', {
      country: draft.country,
      docType: draft.docType,
      firstName: draft.firstName.trim(),
      lastName: draft.lastName.trim(),
      idNumber: draft.idNumber.trim(),
    })
    // Always reset — the old code left the flag stuck on any failure.
    setIsSubmitting(false)
    if (!res.ok) {
      setSubmitError(res.error)
      return
    }
    setSubmitted(true)
    clearDraft()
    router.push('/investor/onboarding/pending')
  }

  const showResume = step === 1 && savedStep > 1 && !resumeDismissed

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: 'var(--fk-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '56px 20px', position: 'relative' }}>
      <div
        aria-hidden="true"
        style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, var(--fk-blue-tint) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }}
      />

      <div style={{ width: '100%', maxWidth: 520, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          {step === 1 ? (
            <Link href="/investor/onboarding" className="fk-btn fk-btn-ghost" style={{ padding: '6px 8px' }}>
              <ArrowLeft size={15} /> Back to selection
            </Link>
          ) : (
            <button type="button" onClick={() => setStep(step - 1)} className="fk-btn fk-btn-ghost" style={{ padding: '6px 8px' }}>
              <ArrowLeft size={15} /> Back
            </button>
          )}
          <span className="fk-badge fk-badge-brand">PERSONAL KYC</span>
        </div>

        <div
          className="fk-card"
          style={{ borderRadius: 'var(--r-xl)', padding: '32px 28px', position: 'relative' }}
        >
          <StepProgress steps={STEP_NAMES} current={step} />

          {showResume && (
            <ResumeBanner
              stepName={STEP_NAMES[Math.min(savedStep, STEP_NAMES.length) - 1]}
              onResume={() => { setResumeDismissed(true); setStep(savedStep) }}
              onDiscard={() => {
                clearDraft()
                setDraft(EMPTY_DRAFT)
                setSavedStep(1)
                setResumeDismissed(true)
              }}
            />
          )}

          <AnimatePresence mode="wait">

            {/* STEP 1 — Overview */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--fk-blue-tint)', border: '1px solid var(--fk-blue)', color: 'var(--fk-blue-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                    <ShieldCheck size={30} aria-hidden="true" />
                  </div>
                  <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h2)', fontWeight: 700, color: 'var(--fk-text-hi)', marginBottom: 10 }}>
                    Let&apos;s get you verified
                  </h1>
                  <p style={{ fontSize: 'var(--fs-body)', color: 'var(--fk-text-mid)', lineHeight: 1.6 }}>
                    Identity verification is a compliance requirement. Complete it now to unlock market access.
                  </p>
                </div>

                <div style={{ display: 'grid', gap: 12, marginBottom: 28 }}>
                  <Requirement icon={<FileText size={18} />} title="Identity document" body="Your ID card, passport, residence permit or driver's license — front side only." />
                </div>

                <button type="button" onClick={() => setStep(2)} className="fk-btn fk-btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 'var(--fs-card-title)' }}>
                  Continue
                </button>
              </motion.div>
            )}

            {/* STEP 2 — Document type */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
                <StepHeading title="Select document type" body="Choose the issuing country and the type of identity document you will upload." />

                <div style={{ display: 'grid', gap: 22, marginBottom: 28 }}>
                  <SelectField
                    id="kyc-country"
                    label="Issuing country"
                    value={draft.country}
                    onChange={v => set('country', v)}
                    options={ALLOWED_COUNTRIES.map(c => ({ value: c.name, label: `${c.flag} ${c.name}` }))}
                    hint="Only supported jurisdictions are listed."
                  />

                  <RadioCardGroup
                    name="docType"
                    legend="Document type"
                    value={draft.docType}
                    onChange={v => set('docType', v)}
                    options={DOC_TYPES.map(d => ({ value: d.id, label: d.label }))}
                  />
                </div>

                <button type="button" onClick={() => setStep(3)} className="fk-btn fk-btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 'var(--fs-card-title)' }}>
                  Next step
                </button>
              </motion.div>
            )}

            {/* STEP 3 — Uploads */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
                <StepHeading
                  title={`Upload your ${docLabel(draft.docType).toLowerCase()}`}
                  body="Make sure every corner is visible and the text is readable."
                />

                <div style={{ background: 'var(--fk-surface-2)', borderRadius: 'var(--r-lg)', padding: 18, marginBottom: 24, border: '1px solid var(--fk-line)' }}>
                  <h3 style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--fk-text-hi)', marginBottom: 12 }}>Tips for a good photo</h3>
                  <ul style={{ listStyle: 'none', display: 'grid', gap: 10, margin: 0, padding: 0 }}>
                    <Tip good>Upload a colour photo or scan</Tip>
                    <Tip good>Take the photo in a well-lit room</Tip>
                    <Tip>Do not edit or crop images of your document</Tip>
                  </ul>
                </div>

                <div style={{ display: 'grid', gap: 20, marginBottom: 24 }}>
                  <UploadSlot
                    id="upload-front"
                    label="Front of document"
                    description="The side showing your photo and document number."
                    value={draft.front}
                    onChange={v => set('front', v)}
                  />
                </div>

                {missingUploads.length > 0 && (
                  <p className="fk-hint" style={{ marginBottom: 12 }}>
                    Still required: {missingUploads.join(', ')}.
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => setStep(4)}
                  disabled={missingUploads.length > 0}
                  className="fk-btn fk-btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 'var(--fs-card-title)' }}
                >
                  Continue
                </button>
              </motion.div>
            )}

            {/* STEP 4 — Details */}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
                <StepHeading title="Verify your details" body="Enter your details exactly as they appear on the uploaded document." />

                {submitError && <FailureBanner message={submitError} onRetry={() => setSubmitError(null)} retryLabel="Dismiss" />}

                <form onSubmit={handleSubmit} noValidate>
                  <div style={{ display: 'grid', gap: 18, marginBottom: 26 }}>
                    <TextField
                      id="kyc-first-name"
                      label="First name"
                      value={draft.firstName}
                      onChange={v => set('firstName', v)}
                      onBlur={() => setErrors(e => ({ ...e, firstName: validators.name('First name')(draft.firstName) }))}
                      error={errors.firstName}
                      placeholder="e.g. Satoshi"
                      maxLength={40}
                      autoComplete="given-name"
                      hint="2–40 letters, as printed on the document."
                    />
                    <TextField
                      id="kyc-last-name"
                      label="Last name"
                      value={draft.lastName}
                      onChange={v => set('lastName', v)}
                      onBlur={() => setErrors(e => ({ ...e, lastName: validators.name('Last name')(draft.lastName) }))}
                      error={errors.lastName}
                      placeholder="e.g. Nakamoto"
                      maxLength={40}
                      autoComplete="family-name"
                    />
                    <TextField
                      id="kyc-id-number"
                      label={`${docLabel(draft.docType)} number`}
                      value={draft.idNumber}
                      onChange={v => set('idNumber', v.toUpperCase())}
                      onBlur={() => setErrors(e => ({ ...e, idNumber: validators.idNumber(draft.idNumber) }))}
                      error={errors.idNumber}
                      placeholder="E1234567X"
                      maxLength={20}
                      mono
                      hint="5–20 characters: letters, digits or hyphens."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="fk-btn fk-btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 'var(--fs-card-title)' }}
                  >
                    {isSubmitting ? 'Submitting…' : 'Submit verification'}
                    {!isSubmitting && <Check size={16} />}
                  </button>
                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--fk-text-low)', textAlign: 'center', marginTop: 18 }}>
          Your progress is saved in this browser tab until you submit.
        </p>
      </div>
    </div>
  )
}

function StepHeading({ title, body }: { title: string; body: string }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h3)', fontWeight: 700, color: 'var(--fk-text-hi)', marginBottom: 6 }}>{title}</h1>
      <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--fk-text-mid)', lineHeight: 1.6 }}>{body}</p>
    </div>
  )
}

function Requirement({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'var(--fk-surface-2)', borderRadius: 'var(--r-lg)', border: '1px solid var(--fk-line)' }}>
      <span
        aria-hidden="true"
        style={{ width: 38, height: 38, borderRadius: 'var(--r-md)', background: 'var(--fk-surface-1)', color: 'var(--fk-text-hi)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
      >
        {icon}
      </span>
      <div>
        <h3 style={{ fontSize: 'var(--fs-body)', fontWeight: 600, color: 'var(--fk-text-hi)' }}>{title}</h3>
        <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--fk-text-mid)' }}>{body}</p>
      </div>
    </div>
  )
}

function Tip({ good, children }: { good?: boolean; children: React.ReactNode }) {
  return (
    <li style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 'var(--fs-sm)', color: 'var(--fk-text-mid)' }}>
      {good
        ? <CheckCircle2 size={15} style={{ flexShrink: 0, marginTop: 2, color: 'var(--fk-gain)' }} aria-hidden="true" />
        : <XCircle size={15} style={{ flexShrink: 0, marginTop: 2, color: 'var(--fk-loss)' }} aria-hidden="true" />}
      {children}
    </li>
  )
}

export default function PersonalKycPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', background: 'var(--fk-bg)', color: 'var(--fk-text-mid)' }}>
        Loading verification…
      </div>
    }>
      <PersonalKycInner />
    </Suspense>
  )
}
