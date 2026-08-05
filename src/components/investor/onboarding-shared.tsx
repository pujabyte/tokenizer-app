'use client'
/**
 * Shared pieces of the investor auth + onboarding flow.
 *
 * The KYC and KYB screens previously duplicated their own inputs, dropzones,
 * progress bars and country lists — each with slightly different colors,
 * validation and a11y behaviour. Everything reused by more than one screen
 * lives here so there is exactly one implementation to fix.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'motion/react'
import {
  AlertTriangle, Check, CheckCircle2, ChevronDown, FileText, RefreshCw,
  Upload, UploadCloud, X,
} from 'lucide-react'
import FraktaHorizontalLogo from '@/components/ui/FraktaHorizontalLogo'
import { useFetch } from '@/lib/useFetch'
import type { KycStatus } from '@/lib/constants'

/* ── Session ─────────────────────────────────────────────────────────────── */

export const SUPPORT_EMAIL = 'compliance@frakta.io'

export type ReviewItem = { field: string; message: string }

export type Session = {
  authenticated: boolean
  status: KycStatus
  accountType: 'personal' | 'institutional' | null
  email: string | null
  walletAddress: string | null
  review: { reason: string; items: ReviewItem[] } | null
  submittedAt: string | null
}

export type AuthAction =
  | 'LOGIN' | 'CONNECT_WALLET' | 'SUBMIT_KYC' | 'SUBMIT_KYB'
  | 'ADMIN_APPROVE' | 'ADMIN_REJECT' | 'ADMIN_REQUEST_INFO' | 'ADMIN_EXPIRE'
  | 'RESUBMIT' | 'LOGOUT'

export type AuthResult =
  | { ok: true; session: Session }
  | { ok: false; error: string; code?: string }

/** Never throws — every caller needs a renderable failure state. */
export async function postAuth(action: AuthAction, payload?: unknown): Promise<AuthResult> {
  try {
    const res = await fetch('/api/investor/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload }),
    })
    const body = await res.json().catch(() => ({} as Record<string, unknown>))
    if (!res.ok) {
      return {
        ok: false,
        error: typeof body?.error === 'string' ? body.error : `Request failed (${res.status})`,
        code: typeof body?.code === 'string' ? body.code : undefined,
      }
    }
    return { ok: true, session: body?.session as Session }
  } catch {
    return { ok: false, error: 'Network error — check your connection and try again.' }
  }
}

export function useSession() {
  return useFetch<Session>('/api/investor/auth')
}

/** Where a user in this status belongs. Mirrors STATUS_ROUTE in src/middleware.ts. */
export function routeForStatus(status: KycStatus | undefined | null): string {
  switch (status) {
    case 'pending_kyc':
    case 'pending_kyb': return '/investor/onboarding/pending'
    case 'more_info_required': return '/investor/onboarding/more-info'
    case 'rejected': return '/investor/onboarding/rejected'
    case 'expired': return '/investor/onboarding/expired'
    case 'kyc_approved':
    case 'kyc_kyb_approved':
    case 'whitelisted': return '/investor/dashboard'
    default: return '/investor/onboarding'
  }
}

/** The form a user should resume, based on the account type already chosen. */
export function formForAccountType(type: Session['accountType']) {
  return type === 'institutional'
    ? '/investor/onboarding/institutional'
    : '/investor/onboarding/personal'
}

/* ── Shared vocabulary ───────────────────────────────────────────────────── */

// Excluded: China, Afghanistan, Algeria, Bangladesh, Egypt, Nepal, Morocco, Tunisia, Qatar
export const ALLOWED_COUNTRIES = [
  { name: 'Australia', flag: '🇦🇺' },
  { name: 'Brazil', flag: '🇧🇷' },
  { name: 'Canada', flag: '🇨🇦' },
  { name: 'France', flag: '🇫🇷' },
  { name: 'Germany', flag: '🇩🇪' },
  { name: 'India', flag: '🇮🇳' },
  { name: 'Indonesia', flag: '🇮🇩' },
  { name: 'Japan', flag: '🇯🇵' },
  { name: 'Malaysia', flag: '🇲🇾' },
  { name: 'Mexico', flag: '🇲🇽' },
  { name: 'Singapore', flag: '🇸🇬' },
  { name: 'South Africa', flag: '🇿🇦' },
  { name: 'South Korea', flag: '🇰🇷' },
  { name: 'United Arab Emirates', flag: '🇦🇪' },
  { name: 'United Kingdom', flag: '🇬🇧' },
  { name: 'United States', flag: '🇺🇸' },
].sort((a, b) => a.name.localeCompare(b.name))

export const DOC_TYPES = [
  { id: 'id_card', label: 'ID card' },
  { id: 'residence_permit', label: 'Residence permit' },
  { id: 'passport', label: 'Passport' },
  { id: 'driver_license', label: "Driver's license" },
] as const

export function docLabel(id: string) {
  return DOC_TYPES.find(d => d.id === id)?.label ?? 'document'
}

const FIELD_LABELS: Record<string, string> = {
  idDocument: 'Identity document',
  selfie: 'Liveness selfie',
  proofOfAddress: 'Proof of address',
  sourceOfFunds: 'Source of funds',
  certificateOfIncorporation: 'Certificate of incorporation',
  registeredAddress: 'Registered address',
  ubo: 'Directors & beneficial owners',
}

/** 'proofOfAddress' → 'Proof of address' for fields the API adds later. */
export function fieldLabel(field: string) {
  if (FIELD_LABELS[field]) return FIELD_LABELS[field]
  const spaced = field.replace(/([A-Z])/g, ' $1').replace(/[_-]+/g, ' ').trim().toLowerCase()
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

/** Which form step a rejected item should send the user back to. */
export const FIELD_STEP: Record<string, number> = {
  idDocument: 3,
  selfie: 3,
  proofOfAddress: 3,
  sourceOfFunds: 4,
  certificateOfIncorporation: 6,
  registeredAddress: 6,
  ubo: 7,
}

/* ── Page chrome ─────────────────────────────────────────────────────────── */

type Tone = 'brand' | 'gain' | 'warn' | 'loss' | 'info'

const TONE_COLOR: Record<Tone, string> = {
  brand: 'var(--fk-blue-soft)',
  gain: 'var(--fk-gain)',
  warn: 'var(--fk-warn)',
  loss: 'var(--fk-loss)',
  info: 'var(--fk-info)',
}

const TONE_TINT: Record<Tone, string> = {
  brand: 'var(--fk-blue-tint)',
  gain: 'var(--fk-gain-tint)',
  warn: 'var(--fk-warn-tint)',
  loss: 'var(--fk-loss-tint)',
  info: 'var(--fk-info-tint)',
}

/** Centered page frame used by every onboarding screen. */
export function OnboardingShell({
  children, width = 520, glow = 'var(--fk-blue-tint)', center = true,
}: {
  children: React.ReactNode
  width?: number
  glow?: string
  center?: boolean
}) {
  return (
    <div
      style={{
        minHeight: '100dvh', background: 'var(--fk-bg)', display: 'flex',
        flexDirection: 'column', alignItems: 'center',
        justifyContent: center ? 'center' : 'flex-start',
        padding: '48px 20px', position: 'relative',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'fixed', top: '16%', left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 520, pointerEvents: 'none', filter: 'blur(80px)',
          background: `radial-gradient(ellipse, ${glow} 0%, transparent 65%)`,
        }}
      />
      <div style={{ width: '100%', maxWidth: width, position: 'relative', zIndex: 1, display: 'grid', gap: 28, justifyItems: 'center' }}>
        <FraktaHorizontalLogo height={26} />
        <div style={{ width: '100%' }}>{children}</div>
      </div>
    </div>
  )
}

/** The card shared by pending / rejected / more-info / expired. */
export function StatusCard({ children, padding = '40px 32px' }: { children: React.ReactNode; padding?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="fk-card"
      style={{ borderRadius: 'var(--r-xl)', padding, width: '100%' }}
    >
      {children}
    </motion.div>
  )
}

export function StatusIcon({ tone, children, badge }: { tone: Tone; children: React.ReactNode; badge?: React.ReactNode }) {
  return (
    <div
      style={{
        width: 76, height: 76, borderRadius: '50%', background: TONE_TINT[tone],
        border: `1px solid ${TONE_COLOR[tone]}`, color: TONE_COLOR[tone],
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 20px', position: 'relative',
      }}
    >
      {children}
      {badge && (
        <span
          style={{
            position: 'absolute', right: -6, bottom: -6, background: 'var(--fk-surface-1)',
            borderRadius: '50%', padding: 3, display: 'flex', border: '1px solid var(--glass-border)',
          }}
        >
          {badge}
        </span>
      )}
    </div>
  )
}

export function StatusHeading({ children }: { children: React.ReactNode }) {
  return (
    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h2)', fontWeight: 700, color: 'var(--fk-text-hi)', marginBottom: 12, textAlign: 'center' }}>
      {children}
    </h1>
  )
}

export function StatusBody({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 'var(--fs-body)', color: 'var(--fk-text-mid)', lineHeight: 1.65, textAlign: 'center' }}>
      {children}
    </p>
  )
}

/** Submission / action failure. Every mutating screen needs this. */
export function FailureBanner({ message, onRetry, retryLabel = 'Try again' }: { message: string; onRetry?: () => void; retryLabel?: string }) {
  return (
    <div className="fk-fbanner fk-fb-loss" role="alert" style={{ marginBottom: 20 }}>
      <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2, color: 'var(--fk-fb-loss-title)' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p className="fk-ft">Something went wrong</p>
        <p className="fk-fd">{message}</p>
        {onRetry && (
          <button type="button" className="fk-btn fk-btn-secondary" style={{ marginTop: 10 }} onClick={onRetry}>
            <RefreshCw size={13} /> {retryLabel}
          </button>
        )}
      </div>
    </div>
  )
}

/* ── Step progress ───────────────────────────────────────────────────────── */

/**
 * One progress component for the whole flow. `current` is 1-based; pass
 * `current = steps.length + 1` (or `complete`) for the submitted state so the
 * flow visually closes on the pending screen.
 */
export function StepProgress({ steps, current, complete }: { steps: string[]; current: number; complete?: boolean }) {
  const done = complete ? steps.length + 1 : current
  const activeName = complete ? 'Submitted for review' : steps[Math.min(current, steps.length) - 1]
  return (
    <nav aria-label="Progress" style={{ display: 'grid', gap: 8, marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {steps.map((name, i) => {
          const n = i + 1
          const state = n < done ? 'done' : n === done ? 'active' : 'todo'
          return (
            <span
              key={name}
              title={name}
              style={{
                flex: 1, height: 4, borderRadius: 'var(--r-pill)',
                background: state === 'todo' ? 'var(--fk-surface-3)' : 'var(--fk-blue)',
                opacity: state === 'active' ? 1 : state === 'done' ? 0.75 : 1,
                transition: 'background .25s, opacity .25s',
              }}
            />
          )
        })}
        {/* Final node — the flow never visually closed before. */}
        <span
          aria-hidden="true"
          style={{
            width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: complete ? 'var(--fk-gain-tint)' : 'var(--fk-surface-3)',
            color: complete ? 'var(--fk-gain)' : 'var(--fk-text-low)',
            border: `1px solid ${complete ? 'var(--fk-gain)' : 'var(--fk-line)'}`,
          }}
        >
          <Check size={11} strokeWidth={3} />
        </span>
      </div>
      <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--fk-text-low)', fontWeight: 600, letterSpacing: '.04em' }}>
        {complete
          ? `All ${steps.length} steps complete`
          : `Step ${Math.min(current, steps.length)} of ${steps.length}`}
        <span style={{ color: 'var(--fk-text-mid)', fontWeight: 500 }}> · {activeName}</span>
      </p>
    </nav>
  )
}

/* ── Form fields ─────────────────────────────────────────────────────────── */

export function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      style={{ display: 'block', fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--fk-text-hi)', marginBottom: 8 }}
    >
      {children}
    </label>
  )
}

type TextFieldProps = {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  onBlur?: () => void
  error?: string | null
  hint?: string
  placeholder?: string
  type?: 'text' | 'email' | 'number'
  maxLength?: number
  autoComplete?: string
  inputMode?: 'text' | 'email' | 'numeric'
  mono?: boolean
  disabled?: boolean
}

export function TextField({
  id, label, value, onChange, onBlur, error, hint, placeholder,
  type = 'text', maxLength, autoComplete, inputMode, mono, disabled,
}: TextFieldProps) {
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined
  return (
    <div>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <input
        id={id}
        name={id}
        type={type}
        className={`fk-input${mono ? ' fk-mono' : ''}${error ? ' fk-err' : ''}`}
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        maxLength={maxLength}
        autoComplete={autoComplete}
        inputMode={inputMode}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        style={{ padding: '12px 14px', fontSize: 'var(--fs-body)' }}
      />
      {error
        ? <p id={`${id}-err`} className="fk-hint fk-err" role="alert">{error}</p>
        : hint ? <p id={`${id}-hint`} className="fk-hint">{hint}</p> : null}
    </div>
  )
}

export function TextAreaField({
  id, label, value, onChange, onBlur, error, hint, placeholder, maxLength, rows = 3,
}: Omit<TextFieldProps, 'type' | 'mono' | 'inputMode' | 'autoComplete'> & { rows?: number }) {
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined
  return (
    <div>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <textarea
        id={id}
        name={id}
        rows={rows}
        className={`fk-input${error ? ' fk-err' : ''}`}
        value={value}
        onChange={e => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        style={{ padding: '12px 14px', fontSize: 'var(--fs-body)', resize: 'vertical', lineHeight: 1.5 }}
      />
      {error
        ? <p id={`${id}-err`} className="fk-hint fk-err" role="alert">{error}</p>
        : hint ? <p id={`${id}-hint`} className="fk-hint">{hint}</p> : null}
    </div>
  )
}

/** Select with a real chevron — `appearance:none` left a flat box before. */
export function SelectField({
  id, label, value, onChange, options, hint,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  hint?: string
}) {
  return (
    <div>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div style={{ position: 'relative' }}>
        <select
          id={id}
          name={id}
          className="fk-input"
          value={value}
          onChange={e => onChange(e.target.value)}
          aria-describedby={hint ? `${id}-hint` : undefined}
          style={{ padding: '12px 40px 12px 14px', fontSize: 'var(--fs-body)', appearance: 'none', cursor: 'pointer' }}
        >
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown
          size={16}
          aria-hidden="true"
          style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--fk-text-low)', pointerEvents: 'none' }}
        />
      </div>
      {hint && <p id={`${id}-hint`} className="fk-hint">{hint}</p>}
    </div>
  )
}

/* ── Radio card group (keyboard reachable) ───────────────────────────────── */

const RADIO_CSS = `
.fk-radio-card {
  display: flex; align-items: center; gap: 12px; padding: 14px 16px;
  background: var(--fk-surface-2); border: 1px solid var(--fk-line);
  border-radius: var(--r-md); cursor: pointer; transition: all .18s;
}
.fk-radio-card:hover { border-color: var(--fk-blue-soft); }
.fk-radio-card:has(input:checked) { border-color: var(--fk-blue); background: var(--fk-blue-tint); }
/* The input is visually hidden, so the ring has to be drawn on the card. */
.fk-radio-card:has(input:focus-visible) {
  outline: 2px solid var(--fk-blue-bright); outline-offset: 2px;
}
.fk-radio-dot {
  width: 20px; height: 20px; border-radius: 50%; flex-shrink: 0;
  border: 2px solid var(--fk-text-low); display: flex;
  align-items: center; justify-content: center; transition: border-color .18s;
}
.fk-radio-card:has(input:checked) .fk-radio-dot { border-color: var(--fk-blue); }
.fk-radio-dot::after {
  content: ""; width: 10px; height: 10px; border-radius: 50%;
  background: var(--fk-blue); opacity: 0; transition: opacity .18s;
}
.fk-radio-card:has(input:checked) .fk-radio-dot::after { opacity: 1; }
.fk-radio-label { font-size: var(--fs-body); font-weight: 500; color: var(--fk-text-hi); }
`

export function RadioCardGroup({
  name, legend, value, onChange, options,
}: {
  name: string
  legend: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <fieldset style={{ border: 'none' }}>
      <style>{RADIO_CSS}</style>
      <legend style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--fk-text-hi)', marginBottom: 8 }}>
        {legend}
      </legend>
      <div style={{ display: 'grid', gap: 10 }}>
        {options.map(o => (
          <label key={o.value} className="fk-radio-card">
            {/* .fk-sr-only keeps the radio in tab order and the a11y tree */}
            <input
              className="fk-sr-only"
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
            />
            <span className="fk-radio-dot" aria-hidden="true" />
            <span className="fk-radio-label">{o.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

/* ── Uploads ─────────────────────────────────────────────────────────────── */

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024
export const IMAGE_DOC_TYPES = ['image/jpeg', 'image/png', 'application/pdf']

export function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB'
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export type UploadValue = {
  status: 'idle' | 'uploading' | 'success' | 'error'
  name?: string
  size?: number
  /** Blob URL for image previews. Not persisted — it dies with the document. */
  previewUrl?: string
  error?: string
}

export const EMPTY_UPLOAD: UploadValue = { status: 'idle' }

export function validateFile(file: File, accept: string[]): string | null {
  if (accept.length && !accept.includes(file.type)) {
    const names = accept.map(t => t.split('/')[1].toUpperCase()).join(', ')
    return `Unsupported file type. Accepted formats: ${names}.`
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return `That file is ${formatBytes(file.size)} — the maximum is 5 MB.`
  }
  if (file.size === 0) return 'That file is empty. Choose a different file.'
  return null
}

const DROPZONE_CSS = `
.fk-dropzone {
  width: 100%; display: block; text-align: center; cursor: pointer;
  border: 2px dashed var(--fk-blue); border-radius: var(--r-lg);
  background: var(--fk-blue-tint); padding: 28px 20px; transition: all .2s;
  color: var(--fk-text-hi); font-family: var(--font-body);
}
.fk-dropzone:hover { background: var(--fk-soft-tint); }
.fk-dropzone.fk-dz-err { border-color: var(--fk-loss); background: var(--fk-loss-tint); }
.fk-dropzone.fk-dz-compact { padding: 20px 16px; border-color: var(--fk-line); background: var(--fk-surface-2); }
.fk-dropzone.fk-dz-compact:hover { border-color: var(--fk-blue); }
`

/**
 * One upload slot with the states the flow was missing: type/size validation,
 * an inline error with retry, and a filename + preview with Replace/Remove so
 * a wrong file is not permanent.
 */
export function UploadSlot({
  id, label, description, accept = IMAGE_DOC_TYPES, value, onChange, compact,
}: {
  id: string
  label: string
  description?: string
  accept?: string[]
  value: UploadValue
  onChange: (v: UploadValue) => void
  compact?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hintId = `${id}-constraints`

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  const acceptAttr = accept.join(',')
  const constraints = `${accept.map(t => t.split('/')[1].toUpperCase()).join(', ')} · max 5 MB`

  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    // Reset so re-selecting the same file still fires onChange.
    e.target.value = ''
    if (!file) return

    const problem = validateFile(file, accept)
    if (problem) {
      onChange({ status: 'error', name: file.name, size: file.size, error: problem })
      return
    }

    const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    onChange({ status: 'uploading', name: file.name, size: file.size, previewUrl })
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      onChange({ status: 'success', name: file.name, size: file.size, previewUrl })
    }, 1200)
  }

  const reset = () => {
    if (value.previewUrl) URL.revokeObjectURL(value.previewUrl)
    onChange(EMPTY_UPLOAD)
  }

  return (
    <div>
      <style>{DROPZONE_CSS}</style>
      <p style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--fk-text-hi)', marginBottom: 6 }} id={`${id}-label`}>
        {label}
      </p>
      {description && (
        <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--fk-text-mid)', marginBottom: 10 }}>{description}</p>
      )}

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={acceptAttr}
        onChange={pick}
        className="fk-sr-only"
        aria-describedby={hintId}
      />

      {value.status === 'idle' && (
        <button
          type="button"
          className={`fk-dropzone${compact ? ' fk-dz-compact' : ''}`}
          onClick={() => inputRef.current?.click()}
          aria-describedby={hintId}
        >
          <UploadCloud size={compact ? 22 : 28} style={{ margin: '0 auto 10px', color: 'var(--fk-blue)' }} />
          <span style={{ display: 'block', fontSize: 'var(--fs-body)', fontWeight: 600, color: 'var(--fk-blue)', marginBottom: 4 }}>
            Upload {label.toLowerCase()}
          </span>
          <span id={hintId} style={{ display: 'block', fontSize: 'var(--fs-xs)', color: 'var(--fk-text-mid)' }}>
            {constraints}
          </span>
        </button>
      )}

      {value.status === 'uploading' && (
        <div
          style={{
            border: '2px dashed var(--fk-blue)', borderRadius: 'var(--r-lg)',
            background: 'var(--fk-blue-tint)', padding: '24px 20px', textAlign: 'center',
          }}
          role="status"
        >
          <span
            aria-hidden="true"
            style={{
              display: 'block', width: 26, height: 26, margin: '0 auto 10px', borderRadius: '50%',
              border: '3px solid var(--fk-blue-tint)', borderTopColor: 'var(--fk-blue)',
              animation: 'spin 1s linear infinite',
            }}
          />
          <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--fk-text-hi)', fontWeight: 500 }}>
            Uploading {value.name}…
          </span>
        </div>
      )}

      {value.status === 'success' && (
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: 12,
            borderRadius: 'var(--r-lg)', background: 'var(--fk-gain-tint)',
            border: '1px solid var(--fk-gain)',
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 44, height: 44, borderRadius: 'var(--r-sm)', flexShrink: 0, overflow: 'hidden',
              background: 'var(--fk-surface-1)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: 'var(--fk-gain)',
            }}
          >
            {value.previewUrl
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={value.previewUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <FileText size={20} />}
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="fk-truncate" style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--fk-text-hi)' }}>
              {value.name ?? 'Document'}
            </p>
            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--fk-text-mid)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <CheckCircle2 size={12} style={{ color: 'var(--fk-gain)' }} />
              Uploaded{value.size ? ` · ${formatBytes(value.size)}` : ''}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            <button type="button" className="fk-btn fk-btn-secondary" onClick={() => inputRef.current?.click()}>
              <Upload size={12} /> Replace
            </button>
            <button type="button" className="fk-btn fk-btn-danger" onClick={reset} aria-label={`Remove ${value.name ?? label}`}>
              <X size={12} /> Remove
            </button>
          </div>
        </div>
      )}

      {value.status === 'error' && (
        <div
          role="alert"
          style={{
            padding: 14, borderRadius: 'var(--r-lg)', background: 'var(--fk-loss-tint)',
            border: '1px solid var(--fk-loss)',
          }}
        >
          <p style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--fk-loss)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertTriangle size={14} /> Upload failed
          </p>
          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--fk-text-mid)', margin: '4px 0 10px' }}>
            {value.error ?? 'That file could not be uploaded.'}
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="fk-btn fk-btn-secondary" onClick={() => inputRef.current?.click()}>
              <RefreshCw size={12} /> Try again
            </button>
            <button type="button" className="fk-btn fk-btn-ghost" onClick={reset}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Reviewer feedback list ──────────────────────────────────────────────── */

/** The per-item list used by the rejected and more-info screens. */
export function ReviewItemList({
  items, tone = 'loss', renderAction,
}: {
  items: ReviewItem[]
  tone?: Tone
  renderAction?: (item: ReviewItem) => React.ReactNode
}) {
  if (items.length === 0) return null
  return (
    <ul style={{ listStyle: 'none', display: 'grid', gap: 12, margin: 0, padding: 0 }}>
      {items.map(item => (
        <li
          key={item.field}
          style={{
            display: 'flex', gap: 12, alignItems: 'flex-start', padding: 14,
            background: 'var(--fk-surface-2)', border: '1px solid var(--fk-line)',
            borderRadius: 'var(--r-md)', textAlign: 'left',
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 26, height: 26, borderRadius: 'var(--r-sm)', flexShrink: 0,
              background: TONE_TINT[tone], color: TONE_COLOR[tone],
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <AlertTriangle size={13} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--fk-text-hi)' }}>
              {fieldLabel(item.field)}
            </p>
            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--fk-text-mid)', lineHeight: 1.55, marginTop: 2 }}>
              {item.message}
            </p>
            {renderAction && <div style={{ marginTop: 10 }}>{renderAction(item)}</div>}
          </div>
        </li>
      ))}
    </ul>
  )
}

export function SupportFooter() {
  return (
    <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--fk-text-low)', textAlign: 'center', marginTop: 24 }}>
      Need help? Email{' '}
      <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: 'var(--fk-blue-bright)', textDecoration: 'underline' }}>
        {SUPPORT_EMAIL}
      </a>{' '}
      and quote your account email.
    </p>
  )
}

/* ── Flow state helpers ──────────────────────────────────────────────────── */

/**
 * Keeps the wizard step in the URL so refresh and browser Back behave.
 * `step` was local state before: refresh reset to 1, Back left the flow.
 */
export function useStepParam(total: number): [number, (n: number) => void] {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  const raw = Number.parseInt(params.get('step') ?? '1', 10)
  const step = Number.isFinite(raw) ? Math.min(Math.max(raw, 1), total) : 1

  const setStep = useCallback((n: number) => {
    const next = Math.min(Math.max(n, 1), total)
    const sp = new URLSearchParams(params.toString())
    sp.set('step', String(next))
    router.push(`${pathname}?${sp.toString()}`, { scroll: false })
  }, [params, pathname, router, total])

  return [step, setStep]
}

/**
 * sessionStorage-backed state. Blob preview URLs are dropped on write because
 * they are invalid after a reload.
 */
export function usePersistedState<T>(key: string, initial: T): [T, React.Dispatch<React.SetStateAction<T>>, () => void] {
  const [value, setValue] = useState<T>(initial)
  const loaded = useRef(false)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(key)
      if (raw) setValue(prev => ({ ...(prev as object), ...(JSON.parse(raw) as object) }) as T)
    } catch { /* corrupt entry — start clean */ }
    loaded.current = true
  }, [key])

  useEffect(() => {
    if (!loaded.current) return
    try {
      sessionStorage.setItem(key, JSON.stringify(value, (k, v) => (k === 'previewUrl' ? undefined : v)))
    } catch { /* quota or private mode — persistence is best-effort */ }
  }, [key, value])

  const clear = useCallback(() => {
    try { sessionStorage.removeItem(key) } catch { /* ignore */ }
  }, [key])

  return [value, setValue, clear]
}

/** Warns before a reload/close would discard in-progress form data. */
export function useBeforeUnload(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [enabled])
}

/** "Continue where you left off" — shown when a saved draft is found on step 1. */
export function ResumeBanner({ stepName, onResume, onDiscard }: { stepName: string; onResume: () => void; onDiscard: () => void }) {
  return (
    <div className="fk-fbanner fk-fb-brand" style={{ marginBottom: 24 }} role="status">
      <FileText size={16} style={{ flexShrink: 0, marginTop: 2, color: 'var(--fk-fb-brand-title)' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p className="fk-ft">Continue where you left off</p>
        <p className="fk-fd">We saved your progress up to “{stepName}”.</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          <button type="button" className="fk-btn fk-btn-primary" onClick={onResume}>Resume</button>
          <button type="button" className="fk-btn fk-btn-ghost" onClick={onDiscard}>Start over</button>
        </div>
      </div>
    </div>
  )
}

/* ── Validation ──────────────────────────────────────────────────────────── */

const NAME_RE = /^[A-Za-zÀ-ÿ' -]{2,40}$/
const ID_RE = /^[A-Z0-9-]{5,20}$/
const REG_RE = /^[A-Za-z0-9-/]{4,24}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const validators = {
  name: (label: string) => (v: string) => {
    if (!v.trim()) return `${label} is required.`
    if (!NAME_RE.test(v.trim())) return `${label} must be 2–40 letters. Hyphens and apostrophes are allowed.`
    return null
  },
  idNumber: (v: string) => {
    if (!v.trim()) return 'Document number is required.'
    if (!ID_RE.test(v.trim())) return 'Use 5–20 characters: letters, digits or hyphens.'
    return null
  },
  regNumber: (v: string) => {
    if (!v.trim()) return 'Registration number is required.'
    if (!REG_RE.test(v.trim())) return 'Use 4–24 characters: letters, digits, hyphens or slashes.'
    return null
  },
  entityName: (v: string) => {
    if (!v.trim()) return 'Legal entity name is required.'
    if (v.trim().length < 3) return 'Enter at least 3 characters.'
    if (v.trim().length > 120) return 'Keep the legal name under 120 characters.'
    return null
  },
  role: (v: string) => {
    if (!v.trim()) return 'Your role is required.'
    if (v.trim().length < 2 || v.trim().length > 60) return 'Enter between 2 and 60 characters.'
    return null
  },
  address: (v: string) => {
    if (!v.trim()) return 'Registered address is required.'
    if (v.trim().length < 10) return 'Enter the full address, including city and postal code.'
    if (v.trim().length > 240) return 'Keep the address under 240 characters.'
    return null
  },
  email: (v: string) => {
    if (!v.trim()) return 'Email address is required.'
    if (!EMAIL_RE.test(v.trim())) return 'Enter a valid email address, e.g. name@company.com.'
    return null
  },
  ownership: (v: string) => {
    if (!v.trim()) return 'Ownership percentage is required.'
    const n = Number(v)
    if (!Number.isFinite(n) || n <= 0 || n > 100) return 'Enter a number between 1 and 100.'
    return null
  },
}
