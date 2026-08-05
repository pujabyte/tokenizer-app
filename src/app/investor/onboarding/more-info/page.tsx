'use client'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, HelpCircle, LogOut, Send } from 'lucide-react'
import { ErrorState, Skeleton } from '@/components/ui/states'
import { formatDateTime, formatRelativeTime } from '@/lib/format'
import {
  EMPTY_UPLOAD, FailureBanner, OnboardingShell, StatusBody, StatusCard,
  StatusHeading, StatusIcon, SupportFooter, UploadSlot, fieldLabel, postAuth,
  useSession, type UploadValue,
} from '@/components/investor/onboarding-shared'

/** Items the reviewer asks for in prose rather than as a file. */
const TEXT_FIELDS = new Set(['sourceOfFunds'])

export default function MoreInfoPage() {
  const router = useRouter()
  const { data: session, loading, error, offline, refetch } = useSession()

  const [uploads, setUploads] = useState<Record<string, UploadValue>>({})
  const [statements, setStatements] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState(false)
  const [busy, setBusy] = useState<'submit' | 'logout' | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const items = session?.review?.items ?? []

  const outstanding = useMemo(
    () => items.filter(item => (
      TEXT_FIELDS.has(item.field)
        ? (statements[item.field]?.trim().length ?? 0) < 20
        : uploads[item.field]?.status !== 'success'
    )),
    [items, uploads, statements]
  )

  const submit = async () => {
    setTouched(true)
    if (outstanding.length > 0) return

    setActionError(null)
    setBusy('submit')
    // Re-submitting puts the application back in the reviewer's queue.
    const action = session?.accountType === 'institutional' ? 'SUBMIT_KYB' : 'SUBMIT_KYC'
    const res = await postAuth(action, {
      additionalInfo: items.map(i => ({
        field: i.field,
        statement: statements[i.field]?.trim() || undefined,
        file: uploads[i.field]?.name,
      })),
    })
    setBusy(null)
    if (!res.ok) {
      setActionError(res.error)
      return
    }
    router.push('/investor/onboarding/pending')
  }

  const logout = async () => {
    setBusy('logout')
    const res = await postAuth('LOGOUT')
    setBusy(null)
    if (!res.ok) { setActionError(res.error); return }
    router.push('/investor/auth')
  }

  return (
    <OnboardingShell glow="var(--fk-info-tint)" center={false} width={560}>
      <StatusCard>
        {loading ? (
          <div style={{ display: 'grid', gap: 14, justifyItems: 'center' }}>
            <Skeleton w={76} h={76} r={999} />
            <Skeleton w="60%" h={20} />
            <Skeleton w="90%" h={12} />
          </div>
        ) : error ? (
          <ErrorState title="Could not load the reviewer's request" offline={offline} onRetry={refetch} />
        ) : (
          <>
            <StatusIcon tone="info">
              <HelpCircle size={34} aria-hidden="true" />
            </StatusIcon>

            <StatusHeading>More information needed</StatusHeading>
            <StatusBody>
              {session?.review?.reason ??
                'Our compliance team needs a few more items before they can finish your review.'}
            </StatusBody>

            {session?.submittedAt && (
              <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--fk-text-low)', textAlign: 'center', marginTop: 8 }} title={formatDateTime(session.submittedAt)}>
                Requested {formatRelativeTime(session.submittedAt)}
              </p>
            )}

            <div style={{ marginTop: 24 }}>
              <h2 style={{ fontSize: 'var(--fs-sm)', fontWeight: 700, color: 'var(--fk-text-hi)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>
                Requested items
              </h2>
              <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--fk-text-low)', marginBottom: 14 }}>
                {items.length - outstanding.length} of {items.length} provided
              </p>

              <ul style={{ listStyle: 'none', display: 'grid', gap: 16, margin: 0, padding: 0 }}>
                {items.map(item => {
                  const isText = TEXT_FIELDS.has(item.field)
                  const done = isText
                    ? (statements[item.field]?.trim().length ?? 0) >= 20
                    : uploads[item.field]?.status === 'success'
                  return (
                    <li
                      key={item.field}
                      style={{
                        padding: 16, borderRadius: 'var(--r-lg)',
                        background: 'var(--fk-surface-2)',
                        border: `1px solid ${done ? 'var(--fk-gain)' : 'var(--fk-line)'}`,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span
                          aria-hidden="true"
                          style={{
                            width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: done ? 'var(--fk-gain-tint)' : 'var(--fk-surface-3)',
                            color: done ? 'var(--fk-gain)' : 'var(--fk-text-low)',
                          }}
                        >
                          <CheckCircle2 size={12} />
                        </span>
                        <h3 style={{ fontSize: 'var(--fs-body)', fontWeight: 600, color: 'var(--fk-text-hi)' }}>
                          {fieldLabel(item.field)}
                        </h3>
                      </div>
                      <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--fk-text-mid)', lineHeight: 1.55, marginBottom: 14 }}>
                        {item.message}
                      </p>

                      {isText ? (
                        <div>
                          <label
                            htmlFor={`info-${item.field}`}
                            style={{ display: 'block', fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--fk-text-hi)', marginBottom: 8 }}
                          >
                            Your statement
                          </label>
                          <textarea
                            id={`info-${item.field}`}
                            rows={4}
                            maxLength={600}
                            className={`fk-input${touched && !done ? ' fk-err' : ''}`}
                            value={statements[item.field] ?? ''}
                            onChange={e => setStatements(s => ({ ...s, [item.field]: e.target.value }))}
                            placeholder="Describe the origin of the funds — employment income, business proceeds, sale of property, and so on."
                            aria-describedby={`info-${item.field}-hint`}
                            style={{ padding: '12px 14px', fontSize: 'var(--fs-body)', resize: 'vertical', lineHeight: 1.5 }}
                          />
                          <p
                            id={`info-${item.field}-hint`}
                            className={`fk-hint${touched && !done ? ' fk-err' : ''}`}
                          >
                            At least 20 characters. {(statements[item.field]?.length ?? 0)}/600 used.
                          </p>
                        </div>
                      ) : (
                        <>
                          <UploadSlot
                            id={`info-${item.field}`}
                            label={fieldLabel(item.field)}
                            value={uploads[item.field] ?? EMPTY_UPLOAD}
                            onChange={v => setUploads(u => ({ ...u, [item.field]: v }))}
                            compact
                          />
                          {touched && !done && (
                            <p className="fk-hint fk-err" role="alert">This item is still required.</p>
                          )}
                        </>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>

            {actionError && (
              <div style={{ marginTop: 20 }}>
                <FailureBanner message={actionError} onRetry={() => setActionError(null)} retryLabel="Dismiss" />
              </div>
            )}

            {touched && outstanding.length > 0 && (
              <p className="fk-hint fk-err" role="alert" style={{ marginTop: 16 }}>
                Still outstanding: {outstanding.map(i => fieldLabel(i.field)).join(', ')}.
              </p>
            )}

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 22 }}>
              <button
                type="button"
                className="fk-btn fk-btn-primary"
                onClick={submit}
                disabled={busy !== null}
                style={{ flex: 1, justifyContent: 'center', padding: 13, fontSize: 'var(--fs-body)' }}
              >
                <Send size={14} />
                {busy === 'submit' ? 'Submitting…' : 'Submit for review'}
              </button>
              <button type="button" className="fk-btn fk-btn-ghost" onClick={logout} disabled={busy !== null}>
                <LogOut size={13} /> Log out
              </button>
            </div>
          </>
        )}
      </StatusCard>

      <SupportFooter />
    </OnboardingShell>
  )
}
