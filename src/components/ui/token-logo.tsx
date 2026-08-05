'use client'
import React, { useState } from 'react'

interface TokenLogoProps {
  logo?: string | null
  symbol: string
  /** Only tints the initials fallback. Pass null for a neutral (flat) asset. */
  isGain?: boolean | null
  size?: number
}

/** Deterministic tint from the symbol so logo-less assets stay visually distinct
 *  instead of all rendering the same blue. */
const CAT_VARS = ['--fk-cat-1', '--fk-cat-2', '--fk-cat-3', '--fk-cat-4', '--fk-cat-5', '--fk-cat-6', '--fk-cat-7', '--fk-cat-8']
function tintFor(symbol: string) {
  let h = 0
  for (let i = 0; i < symbol.length; i++) h = symbol.charCodeAt(i) + ((h << 5) - h)
  return CAT_VARS[Math.abs(h) % CAT_VARS.length]
}

export function TokenLogo({ logo, symbol, isGain = true, size = 44 }: TokenLogoProps) {
  // Most logos are remote (Unsplash / cryptologos / Wikipedia). A blocked or
  // 404 URL used to leave a broken-image glyph in every list, so a load error
  // now falls through to the initials badge.
  const [failed, setFailed] = useState(false)

  if (logo && !failed) {
    return (
      <div
        style={{
          width: size, height: size, borderRadius: '50%',
          background: 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', flexShrink: 0,
        }}
      >
        <img
          src={logo}
          alt=""
          aria-hidden="true"
          loading="lazy"
          onError={() => setFailed(true)}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>
    )
  }

  const initials = (symbol || '?').replace(/[^A-Za-z0-9]/g, '').slice(0, symbol.length > 3 ? 2 : 3)
  const fallbackBg =
    isGain === null ? 'var(--fk-surface-3)' : `var(${tintFor(symbol || '?')})`

  return (
    <div
      className="fk-mono"
      aria-hidden="true"
      style={{
        width: size, height: size, borderRadius: '50%',
        background: fallbackBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: Math.max(10, Math.floor(size * 0.34)),
        fontWeight: 700, letterSpacing: '-.02em',
        color: '#0A0B10',
        flexShrink: 0,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,.25)',
      }}
    >
      {initials.toUpperCase() || '?'}
    </div>
  )
}
