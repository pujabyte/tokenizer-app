'use client'
import React, { useCallback, useEffect, useId, useRef } from 'react'
import { X } from 'lucide-react'

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

type ModalProps = {
  open: boolean
  onClose: () => void
  title: string
  /** Hides the visible header but keeps the accessible name. */
  hideTitle?: boolean
  children: React.ReactNode
  footer?: React.ReactNode
  width?: number
  /** Set while a transaction is in flight — blocks scrim/Escape dismissal. */
  busy?: boolean
}

/**
 * Accessible dialog. The portal's modals were plain divs: no role, no focus
 * trap, no Escape, no scrim click, no scroll lock, and the scrim used an
 * undefined `--glass-bg` so there was no dim layer at all.
 */
export function Modal({ open, onClose, title, hideTitle, children, footer, width, busy }: ModalProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const restoreTo = useRef<HTMLElement | null>(null)
  const titleId = useId()

  const requestClose = useCallback(() => { if (!busy) onClose() }, [busy, onClose])

  // Remember the trigger, move focus in, restore it on close.
  useEffect(() => {
    if (!open) return
    restoreTo.current = document.activeElement as HTMLElement | null
    const card = cardRef.current
    const first = card?.querySelector<HTMLElement>(FOCUSABLE)
    ;(first ?? card)?.focus()
    return () => restoreTo.current?.focus?.()
  }, [open])

  // Scroll lock — without it the page scrolls behind the sheet on mobile.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [open])

  // Escape to dismiss + Tab cycling inside the dialog.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); requestClose(); return }
      if (e.key !== 'Tab') return
      const nodes = Array.from(cardRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])
        .filter(n => n.offsetParent !== null)
      if (nodes.length === 0) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [open, requestClose])

  if (!open) return null

  return (
    <>
      <div className="fk-scrim-layer" onClick={requestClose} aria-hidden="true" />
      <div
        ref={cardRef}
        className="fk-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        style={width ? { width: `min(${width}px, calc(100vw - 32px))` } : undefined}
      >
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 16, padding: '18px 20px',
            borderBottom: '1px solid var(--fk-line-soft)',
          }}
        >
          <p
            id={titleId}
            className={hideTitle ? 'fk-sr-only' : undefined}
            style={hideTitle ? undefined : {
              fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600,
              color: 'var(--fk-text-hi)',
            }}
          >
            {title}
          </p>
          <button
            type="button"
            onClick={requestClose}
            disabled={busy}
            aria-label={`Close ${title}`}
            style={{
              marginLeft: 'auto',
              background: 'var(--fk-surface-3)', border: '1px solid var(--glass-border)',
              color: 'var(--fk-text-low)', display: 'flex', padding: 6,
              borderRadius: 'var(--r-sm)', transition: 'color .15s',
              opacity: busy ? .4 : 1,
            }}
            onMouseEnter={e => { if (!busy) e.currentTarget.style.color = 'var(--fk-text-hi)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--fk-text-low)' }}
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>

        <div style={{ padding: 20 }}>{children}</div>

        {footer && (
          <div style={{ padding: '0 20px 20px', display: 'grid', gap: 10 }}>{footer}</div>
        )}
      </div>
    </>
  )
}
