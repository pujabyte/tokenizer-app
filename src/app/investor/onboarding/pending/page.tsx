'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CheckCircle2, Clock, LogOut, RefreshCw, ShieldCheck, ThumbsDown, ThumbsUp,
  TimerOff, MessageSquare,
} from 'lucide-react'
import { ErrorState, Skeleton } from '@/components/ui/states'
import { formatDateTime, formatRelativeTime } from '@/lib/format'
import {
  FailureBanner, OnboardingShell, StatusBody, StatusCard, StatusHeading,
  StatusIcon, StepProgress, SupportFooter, postAuth, routeForStatus, useSession,
  type AuthAction,
} from '@/components/investor/onboarding-shared'

const PERSONAL_STEPS = ['Overview', 'Document type', 'Upload documents', 'Your details']
const ENTITY_STEPS = [
  'Overview', 'Identity document', 'Document upload', 'Your details',
  'Authorization', 'Entity details', 'Directors & UBOs',
]

const REVIEWER_ACTIONS: { action: AuthAction; label: string; icon: React.ReactNode; className: string }[] = [
  { action: 'ADMIN_APPROVE', label: 'Approve', icon: <ThumbsUp size={13} />, className: 'fk-btn fk-btn-primary' },
  { action: 'ADMIN_REQUEST_INFO', label: 'Request more info', icon: <MessageSquare size={13} />, className: 'fk-btn fk-btn-secondary' },
  { action: 'ADMIN_REJECT', label: 'Reject', icon: <ThumbsDown size={13} />, className: 'fk-btn fk-btn-danger' },
  { action: 'ADMIN_EXPIRE', label: 'Expire', icon: <TimerOff size={13} />, className: 'fk-btn fk-btn-secondary' },
]

export default function PendingApprovalPage() {
  const router = useRouter()
  const { data: session, loading, refreshing, error, offline, refetch } = useSession()
  const [busy, setBusy] = useState<AuthAction | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  // Poll so a reviewer decision taken elsewhere lands without a manual refresh.
  useEffect(() => {
    const id = setInterval(refetch, 20000)
    return () => clearInterval(id)
  }, [refetch])

  // A decision moved the user on — follow it.
  useEffect(() => {
    if (!session?.status) return
    if (session.status === 'pending_kyc' || session.status === 'pending_kyb') return
    router.replace(routeForStatus(session.status))
  }, [session?.status, router])

  const run = async (action: AuthAction) => {
    setActionError(null)
    setBusy(action)
    const res = await postAuth(action)
    setBusy(null)
    if (!res.ok) {
      setActionError(res.error)
      return
    }
    if (action === 'LOGOUT') {
      router.push('/investor/auth')
      return
    }
    router.push(routeForStatus(res.session?.status))
  }

  const steps = session?.accountType === 'institutional' ? ENTITY_STEPS : PERSONAL_STEPS

  return (
    <OnboardingShell glow="var(--fk-warn-tint)">
      <StatusCard>
        {loading ? (
          <div style={{ display: 'grid', gap: 14, justifyItems: 'center' }}>
            <Skeleton w={76} h={76} r={999} />
            <Skeleton w="60%" h={20} />
            <Skeleton w="90%" h={12} />
            <Skeleton w="75%" h={12} />
          </div>
        ) : error ? (
          <ErrorState
            title="Could not load your application status"
            offline={offline}
            onRetry={refetch}
          />
        ) : (
          <>
            <StatusIcon tone="warn" badge={<ShieldCheck size={16} style={{ color: 'var(--fk-gain)' }} />}>
              <Clock size={34} aria-hidden="true" />
            </StatusIcon>

            <StatusHeading>Under review</StatusHeading>
            <StatusBody>
              Your application has been received and is being reviewed by our compliance team.
              We will email {session?.email ?? 'you'} as soon as there is a decision.
            </StatusBody>

            <div style={{ margin: '24px 0 8px' }}>
              <StepProgress steps={steps} current={steps.length} complete />
            </div>

            <dl
              style={{
                display: 'grid', gap: 10, padding: 16, marginBottom: 22,
                borderRadius: 'var(--r-md)', background: 'var(--fk-surface-2)',
                border: '1px dashed var(--fk-line)', fontSize: 'var(--fs-xs)',
              }}
            >
              <Row label="Submitted">
                {session?.submittedAt ? (
                  <span title={formatDateTime(session.submittedAt)}>{formatRelativeTime(session.submittedAt)}</span>
                ) : 'Just now'}
              </Row>
              <Row label="Application">
                {session?.accountType === 'institutional' ? 'Corporate KYB' : 'Personal KYC'}
              </Row>
              <Row label="Estimated decision">24–48 hours</Row>
            </dl>

            {actionError && <FailureBanner message={actionError} onRetry={() => setActionError(null)} retryLabel="Dismiss" />}

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button type="button" className="fk-btn fk-btn-secondary" onClick={refetch} disabled={refreshing} style={{ flex: 1, justifyContent: 'center' }}>
                <RefreshCw size={13} style={refreshing ? { animation: 'spin 1s linear infinite' } : undefined} />
                {refreshing ? 'Checking…' : 'Check status'}
              </button>
              <button type="button" className="fk-btn fk-btn-ghost" onClick={() => run('LOGOUT')} disabled={busy === 'LOGOUT'}>
                <LogOut size={13} /> {busy === 'LOGOUT' ? 'Signing out…' : 'Log out'}
              </button>
            </div>

            {/* ── Reviewer simulation — mock only ── */}
            <div
              style={{
                marginTop: 28, paddingTop: 20, borderTop: '1px dashed var(--fk-line)',
              }}
            >
              <p
                style={{
                  fontSize: 'var(--fs-2xs)', color: 'var(--fk-warn)', textTransform: 'uppercase',
                  letterSpacing: '.1em', fontWeight: 700, marginBottom: 4,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <CheckCircle2 size={12} /> Reviewer simulation (mock only)
              </p>
              <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--fk-text-low)', marginBottom: 12 }}>
                Stands in for the compliance back office so every decision branch is reachable.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8 }}>
                {REVIEWER_ACTIONS.map(({ action, label, icon, className }) => (
                  <button
                    key={action}
                    type="button"
                    className={className}
                    onClick={() => run(action)}
                    disabled={busy !== null}
                    style={{ justifyContent: 'center' }}
                  >
                    {icon} {busy === action ? 'Applying…' : label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </StatusCard>

      <SupportFooter />
    </OnboardingShell>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
      <dt style={{ color: 'var(--fk-text-low)' }}>{label}</dt>
      <dd style={{ color: 'var(--fk-text-hi)', fontFamily: 'var(--font-mono)', textAlign: 'right' }}>{children}</dd>
    </div>
  )
}
