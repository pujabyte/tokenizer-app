'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarClock, LogOut, RefreshCw } from 'lucide-react'
import { ErrorState, Skeleton } from '@/components/ui/states'
import { formatDateTime, formatRelativeTime } from '@/lib/format'
import {
  FailureBanner, OnboardingShell, StatusBody, StatusCard, StatusHeading,
  StatusIcon, SupportFooter, formForAccountType, postAuth, useSession,
} from '@/components/investor/onboarding-shared'

export default function ExpiredVerificationPage() {
  const router = useRouter()
  const { data: session, loading, error, offline, refetch } = useSession()
  const [busy, setBusy] = useState<'restart' | 'logout' | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const restart = async () => {
    setActionError(null)
    setBusy('restart')
    const res = await postAuth('RESUBMIT')
    setBusy(null)
    if (!res.ok) {
      setActionError(res.error)
      return
    }
    router.push(`${formForAccountType(session?.accountType ?? null)}?step=1`)
  }

  const logout = async () => {
    setBusy('logout')
    const res = await postAuth('LOGOUT')
    setBusy(null)
    if (!res.ok) { setActionError(res.error); return }
    router.push('/investor/auth')
  }

  const entity = session?.accountType === 'institutional'

  return (
    <OnboardingShell glow="var(--fk-warn-tint)">
      <StatusCard>
        {loading ? (
          <div style={{ display: 'grid', gap: 14, justifyItems: 'center' }}>
            <Skeleton w={76} h={76} r={999} />
            <Skeleton w="60%" h={20} />
            <Skeleton w="90%" h={12} />
          </div>
        ) : error ? (
          <ErrorState title="Could not load your verification status" offline={offline} onRetry={refetch} />
        ) : (
          <>
            <StatusIcon tone="warn">
              <CalendarClock size={34} aria-hidden="true" />
            </StatusIcon>

            <StatusHeading>Your verification has expired</StatusHeading>
            <StatusBody>
              {session?.review?.reason ??
                'Your verification has expired. Documents must be re-submitted every 24 months.'}
            </StatusBody>

            <div
              style={{
                marginTop: 22, padding: 16, borderRadius: 'var(--r-md)',
                background: 'var(--fk-surface-2)', border: '1px dashed var(--fk-line)',
                fontSize: 'var(--fs-sm)', color: 'var(--fk-text-mid)', lineHeight: 1.65,
              }}
            >
              <p style={{ marginBottom: 10 }}>
                Regulations require us to re-check identity documents every{' '}
                <b style={{ color: 'var(--fk-text-hi)' }}>24 months</b>. Until re-verification
                completes:
              </p>
              <ul style={{ listStyle: 'none', display: 'grid', gap: 6, margin: 0, padding: 0 }}>
                <li>· Your existing holdings stay in your wallet and are unaffected.</li>
                <li>· New purchases, swaps and transfers are paused.</li>
                <li>· {entity ? 'Entity and beneficial-ownership details' : 'Your identity document and selfie'} must be provided again.</li>
              </ul>
              {session?.submittedAt && (
                <p style={{ marginTop: 10, color: 'var(--fk-text-low)', fontSize: 'var(--fs-xs)' }} title={formatDateTime(session.submittedAt)}>
                  Last verified {formatRelativeTime(session.submittedAt)}.
                </p>
              )}
            </div>

            {actionError && (
              <div style={{ marginTop: 20 }}>
                <FailureBanner message={actionError} onRetry={() => setActionError(null)} retryLabel="Dismiss" />
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 22 }}>
              <button
                type="button"
                className="fk-btn fk-btn-primary"
                onClick={restart}
                disabled={busy !== null}
                style={{ flex: 1, justifyContent: 'center', padding: 13, fontSize: 'var(--fs-body)' }}
              >
                <RefreshCw size={14} />
                {busy === 'restart' ? 'Preparing…' : 'Start re-verification'}
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
