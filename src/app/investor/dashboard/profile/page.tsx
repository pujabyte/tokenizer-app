'use client'
import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight, Building2, Calendar, Check, Copy, Mail, ShieldCheck, User, Wallet } from 'lucide-react'
import {
  KYC_COPY, KYC_STATUS_LABEL, KycStatusBadge, ReviewItemList, SupportFooter, useKycGate,
} from '@/components/investor/onboarding-shared'
import { formatDateTime, shortenAddress } from '@/lib/format'
import { APPROVED_KYC_STATUSES } from '@/lib/constants'

const cardStyle = {
  border: '1px solid var(--fk-line)', borderRadius: 'var(--r-lg)', padding: 24,
  background: 'var(--fk-surface-2)',
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof User; label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--fk-line-soft)' }}>
      <span style={{ width: 32, height: 32, borderRadius: 'var(--r-sm)', background: 'var(--fk-surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fk-text-mid)', flexShrink: 0 }}>
        <Icon size={15} aria-hidden="true" />
      </span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{ fontSize: 'var(--fs-2xs)', color: 'var(--fk-text-low)', marginBottom: 2 }}>{label}</p>
        <p className="fk-truncate" style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--fk-text-hi)' }}>{value}</p>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { session, loading, approved, status } = useKycGate()
  const [copied, setCopied] = useState(false)

  const copyWallet = () => {
    if (!session?.walletAddress) return
    navigator.clipboard.writeText(session.walletAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const initial = (session?.email?.[0] ?? session?.walletAddress?.[2] ?? '?').toUpperCase()
  const copy = KYC_COPY[status]
  const isTerminalIssue = status === 'rejected' || status === 'more_info_required'

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <h1 className="iv-page-title" style={{ fontSize: 'var(--fs-h1)', fontWeight: 700, color: 'var(--fk-text-hi)', marginBottom: 24 }}>
        My Profile
      </h1>

      {/* Identity header */}
      <div className="fk-card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <div
          aria-hidden="true"
          style={{
            width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
            background: 'var(--fk-grad)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 700, color: '#fff',
          }}
        >
          {initial}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p className="fk-truncate" style={{ fontSize: 'var(--fs-card-title)', fontWeight: 700, color: 'var(--fk-text-hi)' }}>
            {session?.email ?? shortenAddress(session?.walletAddress)}
          </p>
          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--fk-text-mid)' }}>
            {session?.accountType === 'institutional' ? 'Institutional / Corporate account' : 'Personal investor account'}
          </p>
        </div>
        {!loading && <KycStatusBadge status={status} />}
      </div>

      {/* KYC status */}
      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <ShieldCheck size={16} color={approved ? 'var(--fk-gain)' : 'var(--fk-warn)'} aria-hidden="true" />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-card-title)', fontWeight: 600, color: 'var(--fk-text-hi)' }}>
            Identity Verification
          </h2>
        </div>

        <p style={{ fontSize: 'var(--fs-body)', color: 'var(--fk-text-mid)', lineHeight: 1.65, marginBottom: session?.submittedAt ? 12 : 20 }}>
          {approved
            ? 'Your identity has been verified. You have full access to buy, sell, swap and claim rewards.'
            : copy.body}
        </p>

        {session?.submittedAt && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, fontSize: 'var(--fs-xs)', color: 'var(--fk-text-low)' }}>
            <Calendar size={13} aria-hidden="true" />
            Submitted {formatDateTime(session.submittedAt)}
          </div>
        )}

        {isTerminalIssue && session?.review && (
          <div style={{ marginBottom: 20 }}>
            <ReviewItemList items={session.review.items} tone={status === 'rejected' ? 'loss' : 'warn'} />
          </div>
        )}

        {!approved && (
          <Link href="/investor/onboarding" className="fk-btn fk-btn-primary">
            {copy.cta} <ArrowRight size={13} />
          </Link>
        )}
      </div>

      {/* Account details */}
      <div style={cardStyle}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-card-title)', fontWeight: 600, color: 'var(--fk-text-hi)', marginBottom: 8 }}>
          Account Details
        </h2>

        <InfoRow
          icon={session?.accountType === 'institutional' ? Building2 : User}
          label="Account type"
          value={session?.accountType === 'institutional' ? 'Institutional / Corporate' : session?.accountType === 'personal' ? 'Personal Investor' : 'Not selected yet'}
        />
        <InfoRow icon={Mail} label="Email" value={session?.email ?? '—'} />
        <InfoRow
          icon={Wallet}
          label="Wallet address"
          value={
            session?.walletAddress ? (
              <span className="fk-mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                {shortenAddress(session.walletAddress)}
                <button
                  type="button"
                  onClick={copyWallet}
                  aria-label={copied ? 'Wallet address copied' : 'Copy wallet address'}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: copied ? 'var(--fk-gain)' : 'var(--fk-text-mid)' }}
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                </button>
              </span>
            ) : '—'
          }
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0 0' }}>
          <span style={{ width: 32, height: 32, borderRadius: 'var(--r-sm)', background: 'var(--fk-surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fk-text-mid)', flexShrink: 0 }}>
            <ShieldCheck size={15} aria-hidden="true" />
          </span>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontSize: 'var(--fs-2xs)', color: 'var(--fk-text-low)', marginBottom: 2 }}>Verification status</p>
            <p style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--fk-text-hi)' }}>
              {KYC_STATUS_LABEL[status]}
              {APPROVED_KYC_STATUSES.includes(status) && (
                <span style={{ color: 'var(--fk-text-mid)', fontWeight: 400 }}> · renew every 24 months</span>
              )}
            </p>
          </div>
        </div>
      </div>

      <SupportFooter />
    </div>
  )
}
