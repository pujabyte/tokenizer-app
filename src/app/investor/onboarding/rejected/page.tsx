'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, RefreshCw, Upload, XCircle } from 'lucide-react'
import { ErrorState, Skeleton } from '@/components/ui/states'
import { formatDateTime, formatRelativeTime } from '@/lib/format'
import {
  FIELD_STEP, FailureBanner, OnboardingShell, ReviewItemList, StatusBody,
  StatusCard, StatusHeading, StatusIcon, SupportFooter, formForAccountType,
  postAuth, useSession, type ReviewItem,
} from '@/components/investor/onboarding-shared'

export default function RejectedPage() {
  const router = useRouter()
  const { data: session, loading, error, offline, refetch } = useSession()
  const [busy, setBusy] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const items = session?.review?.items ?? []
  const form = formForAccountType(session?.accountType ?? null)

  /** Resubmission needs the status cleared first, or the middleware bounces the
   *  user straight back to this screen after the form. */
  const restart = async (field?: string) => {
    setActionError(null)
    setBusy(field ?? '__all__')
    const res = await postAuth('RESUBMIT')
    setBusy(null)
    if (!res.ok) {
      setActionError(res.error)
      return
    }
    const step = field ? FIELD_STEP[field] ?? 1 : 1
    router.push(`${form}?step=${step}`)
  }

  const logout = async () => {
    setBusy('logout')
    const res = await postAuth('LOGOUT')
    setBusy(null)
    if (!res.ok) { setActionError(res.error); return }
    router.push('/investor/auth')
  }

  return (
    <OnboardingShell glow="var(--fk-loss-tint)">
      <StatusCard>
        {loading ? (
          <div style={{ display: 'grid', gap: 14, justifyItems: 'center' }}>
            <Skeleton w={76} h={76} r={999} />
            <Skeleton w="60%" h={20} />
            <Skeleton w="90%" h={12} />
          </div>
        ) : error ? (
          <ErrorState title="Could not load your review result" offline={offline} onRetry={refetch} />
        ) : (
          <>
            <StatusIcon tone="loss">
              <XCircle size={34} aria-hidden="true" />
            </StatusIcon>

            <StatusHeading>Verification not approved</StatusHeading>
            <StatusBody>
              {session?.review?.reason ??
                'We could not verify your identity with the documents provided.'}
            </StatusBody>

            {session?.submittedAt && (
              <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--fk-text-low)', textAlign: 'center', marginTop: 8 }} title={formatDateTime(session.submittedAt)}>
                Reviewed {formatRelativeTime(session.submittedAt)}
              </p>
            )}

            {items.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <h2 style={{ fontSize: 'var(--fs-sm)', fontWeight: 700, color: 'var(--fk-text-hi)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 12 }}>
                  What needs fixing ({items.length})
                </h2>
                <ReviewItemList
                  items={items}
                  tone="loss"
                  renderAction={(item: ReviewItem) => (
                    <button
                      type="button"
                      className="fk-btn fk-btn-secondary"
                      onClick={() => restart(item.field)}
                      disabled={busy !== null}
                    >
                      <Upload size={12} /> {busy === item.field ? 'Opening…' : 'Re-upload'}
                    </button>
                  )}
                />
              </div>
            )}

            {actionError && (
              <div style={{ marginTop: 20 }}>
                <FailureBanner message={actionError} onRetry={() => setActionError(null)} retryLabel="Dismiss" />
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 24 }}>
              <button
                type="button"
                className="fk-btn fk-btn-primary"
                onClick={() => restart()}
                disabled={busy !== null}
                style={{ flex: 1, justifyContent: 'center', padding: 13, fontSize: 'var(--fs-body)' }}
              >
                <RefreshCw size={14} />
                {busy === '__all__' ? 'Preparing…' : 'Start a new submission'}
              </button>
              <button type="button" className="fk-btn fk-btn-ghost" onClick={logout} disabled={busy !== null}>
                <LogOut size={13} /> Log out
              </button>
            </div>

            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--fk-text-mid)', lineHeight: 1.6, marginTop: 18 }}>
              Documents you re-upload replace the previous versions. If you believe this
              decision is wrong, contact compliance before resubmitting.
            </p>
          </>
        )}
      </StatusCard>

      <SupportFooter />
    </OnboardingShell>
  )
}
