'use client'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import {
  ArrowLeft, Briefcase, Building, Check, CheckCircle2, Plus, Trash2, User,
  Users, XCircle,
} from 'lucide-react'
import {
  ALLOWED_COUNTRIES, DOC_TYPES, EMPTY_UPLOAD, FailureBanner, RadioCardGroup,
  ResumeBanner, SelectField, StepProgress, TextAreaField, TextField, UploadSlot,
  docLabel, postAuth, useBeforeUnload, usePersistedState, useStepParam, validators,
  type UploadValue,
} from '@/components/investor/onboarding-shared'

const STEP_NAMES = [
  'Overview', 'Identity document', 'Document upload', 'Your details',
  'Authorization', 'Entity details', 'Directors & UBOs',
]
const DRAFT_KEY = 'fk_kyb_institutional_draft'

type Ubo = { name: string; role: string; ownership: string; email: string }

type Draft = {
  personalCountry: string
  docType: string
  firstName: string
  lastName: string
  idNumber: string
  repRole: string
  isDirector: 'yes' | 'no' | ''
  entityCountry: string
  entityName: string
  regNumber: string
  address: string
  front: UploadValue
  back: UploadValue
  selfie: UploadValue
  authLetter: UploadValue
  certificate: UploadValue
  ubos: Ubo[]
  maxStep: number
}

const EMPTY_UBO: Ubo = { name: '', role: '', ownership: '', email: '' }

const EMPTY_DRAFT: Draft = {
  personalCountry: 'Singapore',
  docType: 'id_card',
  firstName: '',
  lastName: '',
  idNumber: '',
  repRole: '',
  isDirector: '',
  entityCountry: 'Singapore',
  entityName: '',
  regNumber: '',
  address: '',
  front: EMPTY_UPLOAD,
  back: EMPTY_UPLOAD,
  selfie: EMPTY_UPLOAD,
  authLetter: EMPTY_UPLOAD,
  certificate: EMPTY_UPLOAD,
  ubos: [{ ...EMPTY_UBO }],
  maxStep: 1,
}

function InstitutionalKybInner() {
  const router = useRouter()
  const [step, setStep] = useStepParam(STEP_NAMES.length)
  const [draft, setDraft, clearDraft] = usePersistedState<Draft>(DRAFT_KEY, EMPTY_DRAFT)

  const [errors, setErrors] = useState<Record<string, string | null>>({})
  const [uboErrors, setUboErrors] = useState<Record<string, string | null>[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [savedStep, setSavedStep] = useState(1)
  const [resumeDismissed, setResumeDismissed] = useState(false)

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft(d => ({ ...d, [key]: value }))

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
    draft.firstName || draft.lastName || draft.idNumber || draft.entityName ||
    draft.regNumber || draft.address ||
    draft.front.status !== 'idle' || draft.certificate.status !== 'idle'
  )
  useBeforeUnload(dirty && !submitted)

  const backRequired = draft.docType !== 'passport'
  const missingUploads = useMemo(() => {
    const missing: string[] = []
    if (draft.front.status !== 'success') missing.push('front of document')
    if (backRequired && draft.back.status !== 'success') missing.push('back of document')
    if (draft.selfie.status !== 'success') missing.push('liveness selfie')
    return missing
  }, [draft.front.status, draft.back.status, draft.selfie.status, backRequired])

  /* ── UBO repeater ── */
  const addUbo = () => setDraft(d => ({ ...d, ubos: [...d.ubos, { ...EMPTY_UBO }] }))
  const removeUbo = (index: number) =>
    setDraft(d => ({ ...d, ubos: d.ubos.length > 1 ? d.ubos.filter((_, i) => i !== index) : d.ubos }))
  const updateUbo = (index: number, field: keyof Ubo, value: string) =>
    setDraft(d => ({ ...d, ubos: d.ubos.map((u, i) => (i === index ? { ...u, [field]: value } : u)) }))

  const totalOwnership = draft.ubos.reduce((sum, u) => sum + (Number(u.ownership) || 0), 0)

  /* ── Validation per step ── */
  const validateRep = () => {
    const next = {
      firstName: validators.name('First name')(draft.firstName),
      lastName: validators.name('Last name')(draft.lastName),
      idNumber: validators.idNumber(draft.idNumber),
      repRole: validators.role(draft.repRole),
    }
    setErrors(e => ({ ...e, ...next }))
    return Object.values(next).every(v => !v)
  }

  const validateEntity = () => {
    const next = {
      entityName: validators.entityName(draft.entityName),
      regNumber: validators.regNumber(draft.regNumber),
      address: validators.address(draft.address),
      certificate: draft.certificate.status === 'success' ? null : 'Upload your certificate of incorporation.',
    }
    setErrors(e => ({ ...e, ...next }))
    return Object.values(next).every(v => !v)
  }

  const validateUbos = () => {
    const rows = draft.ubos.map(u => ({
      name: validators.name('Full name')(u.name),
      role: validators.role(u.role),
      ownership: validators.ownership(u.ownership),
      email: validators.email(u.email),
    }))
    setUboErrors(rows)
    const rowsOk = rows.every(r => Object.values(r).every(v => !v))
    const totalError = totalOwnership > 100 ? 'Combined ownership cannot exceed 100%.' : null
    setErrors(e => ({ ...e, uboTotal: totalError }))
    return rowsOk && !totalError
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateUbos()) return

    setSubmitError(null)
    setIsSubmitting(true)
    const res = await postAuth('SUBMIT_KYB', {
      entityName: draft.entityName.trim(),
      regNumber: draft.regNumber.trim(),
      jurisdiction: draft.entityCountry,
      representative: {
        firstName: draft.firstName.trim(),
        lastName: draft.lastName.trim(),
        idNumber: draft.idNumber.trim(),
        role: draft.repRole.trim(),
        isDirector: draft.isDirector === 'yes',
      },
      ubos: draft.ubos.map(u => ({ ...u, ownership: Number(u.ownership) })),
    })
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
          <span className="fk-badge fk-badge-brand">CORPORATE KYB</span>
        </div>

        <div className="fk-card" style={{ borderRadius: 'var(--r-xl)', padding: '32px 28px' }}>
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
              <Step key="step1">
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--fk-blue-tint)', border: '1px solid var(--fk-blue)', color: 'var(--fk-blue-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                    <Building size={30} aria-hidden="true" />
                  </div>
                  <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h2)', fontWeight: 700, color: 'var(--fk-text-hi)', marginBottom: 10 }}>
                    Institutional verification
                  </h1>
                  <p style={{ fontSize: 'var(--fs-body)', color: 'var(--fk-text-mid)', lineHeight: 1.6 }}>
                    To comply with AML/CTF regulations we verify the authorised representative, the entity itself, and everyone who ultimately owns it.
                  </p>
                </div>

                <div style={{ display: 'grid', gap: 12, marginBottom: 28 }}>
                  <Phase icon={<User size={18} />} title="Phase 1: Personal KYC" body="Your identity document and a liveness selfie." />
                  <Phase icon={<Briefcase size={18} />} title="Phase 2: Corporate KYB" body="Entity details and the certificate of incorporation." />
                  <Phase icon={<Users size={18} />} title="Phase 3: Directors & UBOs" body="Everyone holding 25% or more, plus registered directors." />
                </div>

                <button type="button" onClick={() => setStep(2)} className="fk-btn fk-btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 'var(--fs-card-title)' }}>
                  Begin onboarding
                </button>
              </Step>
            )}

            {/* STEP 2 — Identity document */}
            {step === 2 && (
              <Step key="step2">
                <StepHeading title="Personal verification" body="Choose your issuing country and identity document type." />
                <div style={{ display: 'grid', gap: 22, marginBottom: 28 }}>
                  <SelectField
                    id="kyb-personal-country"
                    label="Issuing country"
                    value={draft.personalCountry}
                    onChange={v => set('personalCountry', v)}
                    options={ALLOWED_COUNTRIES.map(c => ({ value: c.name, label: `${c.flag} ${c.name}` }))}
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
              </Step>
            )}

            {/* STEP 3 — Uploads */}
            {step === 3 && (
              <Step key="step3">
                <StepHeading
                  title={`Upload your ${docLabel(draft.docType).toLowerCase()}`}
                  body="Three separate files — front, back and a liveness selfie."
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
                  <UploadSlot id="kyb-front" label="Front of document" description="The side showing your photo and document number." value={draft.front} onChange={v => set('front', v)} />
                  {backRequired && (
                    <UploadSlot id="kyb-back" label="Back of document" description="The reverse side, including any machine-readable zone." value={draft.back} onChange={v => set('back', v)} />
                  )}
                  <UploadSlot id="kyb-selfie" label="Liveness selfie" description="Face the camera in good light, without a hat or sunglasses." accept={['image/jpeg', 'image/png']} value={draft.selfie} onChange={v => set('selfie', v)} />
                </div>

                {missingUploads.length > 0 && (
                  <p className="fk-hint" style={{ marginBottom: 12 }}>Still required: {missingUploads.join(', ')}.</p>
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
              </Step>
            )}

            {/* STEP 4 — Representative details */}
            {step === 4 && (
              <Step key="step4">
                <StepHeading title="Verify your details" body="Enter your details exactly as they appear on your document." />
                <form
                  noValidate
                  onSubmit={e => { e.preventDefault(); if (validateRep()) setStep(5) }}
                >
                  <div style={{ display: 'grid', gap: 18, marginBottom: 26 }}>
                    <TextField
                      id="kyb-first-name" label="First name" value={draft.firstName}
                      onChange={v => set('firstName', v)}
                      onBlur={() => setErrors(e => ({ ...e, firstName: validators.name('First name')(draft.firstName) }))}
                      error={errors.firstName} placeholder="e.g. Satoshi" maxLength={40} autoComplete="given-name"
                    />
                    <TextField
                      id="kyb-last-name" label="Last name" value={draft.lastName}
                      onChange={v => set('lastName', v)}
                      onBlur={() => setErrors(e => ({ ...e, lastName: validators.name('Last name')(draft.lastName) }))}
                      error={errors.lastName} placeholder="e.g. Nakamoto" maxLength={40} autoComplete="family-name"
                    />
                    <TextField
                      id="kyb-id-number" label={`${docLabel(draft.docType)} number`} value={draft.idNumber}
                      onChange={v => set('idNumber', v.toUpperCase())}
                      onBlur={() => setErrors(e => ({ ...e, idNumber: validators.idNumber(draft.idNumber) }))}
                      error={errors.idNumber} placeholder="E1234567X" maxLength={20} mono
                      hint="5–20 characters: letters, digits or hyphens."
                    />
                    <TextField
                      id="kyb-rep-role" label="Company role / title" value={draft.repRole}
                      onChange={v => set('repRole', v)}
                      onBlur={() => setErrors(e => ({ ...e, repRole: validators.role(draft.repRole) }))}
                      error={errors.repRole} placeholder="e.g. CEO, CFO, Compliance Officer" maxLength={60}
                    />
                  </div>
                  <button type="submit" className="fk-btn fk-btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 'var(--fs-card-title)' }}>
                    Continue to authorization
                  </button>
                </form>
              </Step>
            )}

            {/* STEP 5 — Authorization */}
            {step === 5 && (
              <Step key="step5">
                <StepHeading title="Authorization" body="We must confirm you are entitled to act for the entity." />
                <form
                  noValidate
                  onSubmit={e => {
                    e.preventDefault()
                    const problem = !draft.isDirector
                      ? 'Select whether you are a registered director.'
                      : draft.isDirector === 'no' && draft.authLetter.status !== 'success'
                        ? 'Upload the signed letter of authorization to continue.'
                        : null
                    setErrors(er => ({ ...er, authorization: problem }))
                    if (!problem) setStep(6)
                  }}
                >
                  <div style={{ marginBottom: 20 }}>
                    <RadioCardGroup
                      name="isDirector"
                      legend="Are you a registered director of this company?"
                      value={draft.isDirector}
                      onChange={v => { set('isDirector', v as 'yes' | 'no'); setErrors(e => ({ ...e, authorization: null })) }}
                      options={[
                        { value: 'yes', label: 'Yes, I am a registered director' },
                        { value: 'no', label: 'No, I act under authorization' },
                      ]}
                    />
                  </div>

                  <AnimatePresence>
                    {draft.isDirector === 'no' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                        <div style={{ marginBottom: 20 }}>
                          <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--fk-text-mid)', lineHeight: 1.6, marginBottom: 14 }}>
                            Because you are not a registered director, we need a signed letter empowering you to open an account on behalf of the company.
                          </p>
                          <UploadSlot
                            id="kyb-auth-letter"
                            label="Letter of authorization"
                            description="Signed PDF on company letterhead."
                            accept={['application/pdf']}
                            value={draft.authLetter}
                            onChange={v => set('authLetter', v)}
                            compact
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {errors.authorization && (
                    <p className="fk-hint fk-err" role="alert" style={{ marginBottom: 12 }}>{errors.authorization}</p>
                  )}

                  <button type="submit" className="fk-btn fk-btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 'var(--fs-card-title)' }}>
                    Continue to entity details
                  </button>
                </form>
              </Step>
            )}

            {/* STEP 6 — Entity details */}
            {step === 6 && (
              <Step key="step6">
                <StepHeading title="Entity details" body="Enter the company's legal information and upload its formation document." />
                <form noValidate onSubmit={e => { e.preventDefault(); if (validateEntity()) setStep(7) }}>
                  <div style={{ display: 'grid', gap: 18, marginBottom: 24 }}>
                    <SelectField
                      id="kyb-jurisdiction"
                      label="Jurisdiction"
                      value={draft.entityCountry}
                      onChange={v => set('entityCountry', v)}
                      options={ALLOWED_COUNTRIES.map(c => ({ value: c.name, label: `${c.flag} ${c.name}` }))}
                    />
                    <TextField
                      id="kyb-entity-name" label="Legal entity name" value={draft.entityName}
                      onChange={v => set('entityName', v)}
                      onBlur={() => setErrors(e => ({ ...e, entityName: validators.entityName(draft.entityName) }))}
                      error={errors.entityName} placeholder="e.g. Frakta Capital Ltd." maxLength={120}
                      hint="Exactly as registered, up to 120 characters."
                    />
                    <TextField
                      id="kyb-reg-number" label="Registration number" value={draft.regNumber}
                      onChange={v => set('regNumber', v)}
                      onBlur={() => setErrors(e => ({ ...e, regNumber: validators.regNumber(draft.regNumber) }))}
                      error={errors.regNumber} placeholder="e.g. 201912345K" maxLength={24} mono
                      hint="4–24 characters: letters, digits, hyphens or slashes."
                    />
                    <TextAreaField
                      id="kyb-address" label="Registered address" value={draft.address}
                      onChange={v => set('address', v)}
                      onBlur={() => setErrors(e => ({ ...e, address: validators.address(draft.address) }))}
                      error={errors.address} placeholder="Building, street, city, postal code" maxLength={240} rows={3}
                    />
                  </div>

                  <div style={{ borderTop: '1px solid var(--fk-line)', paddingTop: 22, marginBottom: 22 }}>
                    <UploadSlot
                      id="kyb-certificate"
                      label="Certificate of incorporation"
                      description="The registry-issued PDF, dated within the last 12 months."
                      accept={['application/pdf']}
                      value={draft.certificate}
                      onChange={v => { set('certificate', v); setErrors(e => ({ ...e, certificate: null })) }}
                      compact
                    />
                    {errors.certificate && <p className="fk-hint fk-err" role="alert">{errors.certificate}</p>}
                  </div>

                  <button type="submit" className="fk-btn fk-btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 'var(--fs-card-title)' }}>
                    Continue to directors & UBOs
                  </button>
                </form>
              </Step>
            )}

            {/* STEP 7 — Directors & UBOs */}
            {step === 7 && (
              <Step key="step7">
                <StepHeading
                  title="Directors & beneficial owners"
                  body="List every registered director and anyone who ultimately owns 25% or more of the entity."
                />

                {submitError && <FailureBanner message={submitError} onRetry={() => setSubmitError(null)} retryLabel="Dismiss" />}

                <form noValidate onSubmit={handleSubmit}>
                  <div style={{ display: 'grid', gap: 16, marginBottom: 16 }}>
                    {draft.ubos.map((ubo, i) => (
                      <fieldset
                        key={i}
                        style={{ border: '1px solid var(--fk-line)', borderRadius: 'var(--r-lg)', padding: 16, background: 'var(--fk-surface-2)' }}
                      >
                        <legend style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--fk-text-low)', padding: '0 6px' }}>
                          Person {i + 1}
                        </legend>
                        <div style={{ display: 'grid', gap: 14 }}>
                          <TextField
                            id={`ubo-${i}-name`} label="Full name" value={ubo.name}
                            onChange={v => updateUbo(i, 'name', v)}
                            error={uboErrors[i]?.name} placeholder="e.g. Aiko Tanaka" maxLength={40}
                          />
                          <TextField
                            id={`ubo-${i}-role`} label="Role" value={ubo.role}
                            onChange={v => updateUbo(i, 'role', v)}
                            error={uboErrors[i]?.role} placeholder="e.g. Director, Shareholder" maxLength={60}
                          />
                          <TextField
                            id={`ubo-${i}-ownership`} label="Ownership (%)" value={ubo.ownership}
                            onChange={v => updateUbo(i, 'ownership', v.replace(/[^0-9.]/g, '').slice(0, 5))}
                            error={uboErrors[i]?.ownership} placeholder="25" inputMode="numeric" mono
                          />
                          <TextField
                            id={`ubo-${i}-email`} label="Email address" value={ubo.email}
                            onChange={v => updateUbo(i, 'email', v)}
                            error={uboErrors[i]?.email} type="email" placeholder="name@company.com" maxLength={120}
                            hint="Each person receives their own verification link."
                          />
                        </div>
                        {draft.ubos.length > 1 && (
                          <button
                            type="button"
                            className="fk-btn fk-btn-danger"
                            onClick={() => { removeUbo(i); setUboErrors(errs => errs.filter((_, j) => j !== i)) }}
                            style={{ marginTop: 14 }}
                          >
                            <Trash2 size={13} /> Remove person {i + 1}
                          </button>
                        )}
                      </fieldset>
                    ))}
                  </div>

                  <button type="button" className="fk-btn fk-btn-secondary" onClick={addUbo} style={{ width: '100%', justifyContent: 'center', marginBottom: 14 }}>
                    <Plus size={14} /> Add another person
                  </button>

                  <p
                    className={`fk-hint${errors.uboTotal ? ' fk-err' : ''}`}
                    role={errors.uboTotal ? 'alert' : undefined}
                    style={{ marginBottom: 18 }}
                  >
                    {errors.uboTotal ?? `Declared ownership: ${totalOwnership || 0}% of 100%.`}
                  </p>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="fk-btn fk-btn-primary"
                    style={{ width: '100%', justifyContent: 'center', padding: 14, fontSize: 'var(--fs-card-title)' }}
                  >
                    {isSubmitting ? 'Submitting…' : 'Submit entity application'}
                    {!isSubmitting && <Check size={16} />}
                  </button>
                </form>
              </Step>
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

function Step({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
      {children}
    </motion.div>
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

function Phase({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
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

export default function InstitutionalKybPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', background: 'var(--fk-bg)', color: 'var(--fk-text-mid)' }}>
        Loading verification…
      </div>
    }>
      <InstitutionalKybInner />
    </Suspense>
  )
}
