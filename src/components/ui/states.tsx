'use client'
import React from 'react'
import Link from 'next/link'
import { AlertTriangle, Inbox, RefreshCw, SearchX, WifiOff } from 'lucide-react'

/* ── Empty state ───────────────────────────────────────────────────────────
   Every list in the portal used to render a bare .map(), so "no results" was
   an unexplained void below the filter bar. */

type EmptyStateProps = {
  icon?: React.ReactNode
  title: string
  body?: string
  action?: { label: string; href?: string; onClick?: () => void }
  compact?: boolean
}

export function EmptyState({ icon, title, body, action, compact }: EmptyStateProps) {
  return (
    <div className="fk-state" style={compact ? { padding: '32px 20px' } : undefined} role="status">
      <div className="fk-state-icon" aria-hidden="true">{icon ?? <Inbox size={20} />}</div>
      <p className="fk-state-title">{title}</p>
      {body && <p className="fk-state-body">{body}</p>}
      {action && (action.href
        ? <Link href={action.href} className="fk-btn fk-btn-primary" style={{ marginTop: 8 }}>{action.label}</Link>
        : <button className="fk-btn fk-btn-secondary" style={{ marginTop: 8 }} onClick={action.onClick}>{action.label}</button>
      )}
    </div>
  )
}

/** Search-specific empty state with a clear affordance. */
export function NoResults({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <EmptyState
      compact
      icon={<SearchX size={20} />}
      title={`No assets match “${query}”`}
      body="Try a different symbol or name, or clear the search to see everything."
      action={{ label: 'Clear search', onClick: onClear }}
    />
  )
}

/* ── Error state ─────────────────────────────────────────────────────────── */

export function ErrorState({
  title = 'Could not load this data',
  body,
  onRetry,
  offline,
}: { title?: string; body?: string; onRetry?: () => void; offline?: boolean }) {
  return (
    <div className="fk-state" role="alert">
      <div
        className="fk-state-icon"
        aria-hidden="true"
        style={{ background: 'var(--fk-loss-tint)', color: 'var(--fk-loss)' }}
      >
        {offline ? <WifiOff size={20} /> : <AlertTriangle size={20} />}
      </div>
      <p className="fk-state-title">{offline ? 'You appear to be offline' : title}</p>
      <p className="fk-state-body">
        {body ?? (offline
          ? 'Check your connection and try again — nothing has been lost.'
          : 'Something went wrong on our side. This is usually temporary.')}
      </p>
      {onRetry && (
        <button className="fk-btn fk-btn-secondary" style={{ marginTop: 8 }} onClick={onRetry}>
          <RefreshCw size={13} /> Try again
        </button>
      )}
    </div>
  )
}

/* ── Skeletons ───────────────────────────────────────────────────────────── */

export function Skeleton({ w = '100%', h = 14, r, style }: { w?: number | string; h?: number | string; r?: number; style?: React.CSSProperties }) {
  return <div className="fk-skeleton" style={{ width: w, height: h, borderRadius: r ?? 6, ...style }} aria-hidden="true" />
}

/** Card-shaped skeleton that keeps the page heading visible, so the layout
 *  doesn't jump when data lands. */
export function SkeletonCard({ rows = 3, height }: { rows?: number; height?: number }) {
  return (
    <div
      style={{
        background: 'var(--fk-surface-2)', border: '1px solid var(--fk-line)',
        borderRadius: 'var(--r-lg)', padding: 20, display: 'grid', gap: 14,
        minHeight: height,
      }}
      aria-hidden="true"
    >
      <Skeleton w="42%" h={16} />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Skeleton w={32} h={32} r={999} />
          <div style={{ flex: 1, display: 'grid', gap: 6 }}>
            <Skeleton w={`${70 - i * 8}%`} h={12} />
            <Skeleton w={`${45 - i * 5}%`} h={10} />
          </div>
          <Skeleton w={64} h={12} />
        </div>
      ))}
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div style={{ display: 'grid', gap: 10 }} aria-hidden="true">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12 }}>
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} h={r === 0 ? 10 : 13} w={c === 0 ? '80%' : '60%'} />
          ))}
        </div>
      ))}
    </div>
  )
}

/** Announces loading to screen readers without stealing focus. */
export function LoadingAnnouncer({ label = 'Loading' }: { label?: string }) {
  return <span className="fk-sr-only" role="status" aria-live="polite">{label}</span>
}
