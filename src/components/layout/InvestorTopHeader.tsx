'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Search, Globe, Sun, Moon, Copy, Check, Briefcase, Sparkles, LogOut, X } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import FraktaHorizontalLogo from '../ui/FraktaHorizontalLogo'
import { useTheme } from '@/components/ThemeProvider'
import { useFetch } from '@/lib/useFetch'
import { TokenLogo } from '@/components/ui/token-logo'
import { EM_DASH, formatMoney, formatPct, trendColor } from '@/lib/format'

const WALLET_ADDRESS = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D'

type SearchAsset = {
  id: string
  symbol: string
  name: string
  logo: string | null
  priceUsd: number | null
  currencySymbol: string
  priceNative: number | null
  changePct: number | null
  trend: 'up' | 'down' | 'flat' | null
}

export default function InvestorTopHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const accountRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  /* ── Search ────────────────────────────────────────────────────────────
     The input used to be uncontrolled with no handler at all, so the most
     prominent control in the portal did nothing. */
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  // The asset list is only fetched once, and only after the user actually
  // engages with the search box — the header renders on every route.
  const [assetsUrl, setAssetsUrl] = useState<string | null>(null)
  const { data } = useFetch<{ assets: SearchAsset[] }>(assetsUrl)
  const assets = data?.assets ?? []

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim().toLowerCase()), 180)
    return () => clearTimeout(t)
  }, [query])

  const matches = useMemo(() => {
    if (!debounced) return []
    return assets
      .filter(a => a.name.toLowerCase().includes(debounced) || a.symbol.toLowerCase().includes(debounced))
      .slice(0, 6)
  }, [assets, debounced])

  useEffect(() => { setActiveIndex(-1) }, [debounced])

  const links = [
    { label: 'Explore', href: '/investor/dashboard' },
    { label: 'Portfolio', href: '/investor/dashboard/portfolio' },
    { label: 'Rewards', href: '/investor/dashboard/rewards' },
    { label: 'Swap', href: '/investor/dashboard/swap' },
    { label: 'Resources', href: '/investor/dashboard/resources' },
  ]

  /* Click-outside + Escape for both popovers. The account menu previously
     closed on `onBlur` after a 200ms timeout, which raced the click on its own
     menu items — the link sometimes never fired. */
  useEffect(() => {
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node
      if (accountRef.current && !accountRef.current.contains(target)) setIsDropdownOpen(false)
      if (searchRef.current && !searchRef.current.contains(target)) setIsSearchOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setIsDropdownOpen(false); setIsSearchOpen(false) }
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  // Close the results panel after a route change (selecting a result navigates).
  useEffect(() => { setIsSearchOpen(false); setIsDropdownOpen(false) }, [pathname])

  const openSearchData = () => { if (!assetsUrl) setAssetsUrl('/api/investor/tokens') }

  const goToResults = () => {
    const q = query.trim()
    if (!q) return
    setIsSearchOpen(false)
    inputRef.current?.blur()
    router.push(`/investor/dashboard?q=${encodeURIComponent(q)}`)
  }

  const selectAsset = (asset: SearchAsset) => {
    setIsSearchOpen(false)
    setQuery('')
    inputRef.current?.blur()
    router.push(`/investor/dashboard/token/${asset.id}`)
  }

  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && matches.length) {
      e.preventDefault()
      setIsSearchOpen(true)
      setActiveIndex(i => (i + 1) % matches.length)
    } else if (e.key === 'ArrowUp' && matches.length) {
      e.preventDefault()
      setActiveIndex(i => (i <= 0 ? matches.length - 1 : i - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIndex >= 0 && matches[activeIndex]) selectAsset(matches[activeIndex])
      else goToResults()
    } else if (e.key === 'Escape') {
      setIsSearchOpen(false)
    }
  }

  const clearSearch = () => {
    setQuery('')
    setDebounced('')
    setIsSearchOpen(false)
    inputRef.current?.focus()
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await fetch('/api/investor/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'LOGOUT' }),
      })
    } catch {
      // Even if the request fails the user asked to leave — clear the UI anyway.
    } finally {
      setIsDropdownOpen(false)
      setLoggingOut(false)
      router.push('/investor/auth')
    }
  }

  const menuItemStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
    textDecoration: 'none', color: 'var(--fk-text-hi)', fontSize: 13, fontWeight: 500,
    borderRadius: 8, transition: 'all 0.2s',
  }

  const showResults = isSearchOpen && debounced.length > 0

  return (
    <header
      className="iv-header"
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 'var(--header-height)',
        backgroundColor: 'var(--glass-bg)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--fk-line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', zIndex: 40,
      }}
    >

      {/* Left: Logo and Links */}
      <div className="iv-header-left" style={{ display: 'flex', alignItems: 'center', gap: 48, flexShrink: 0 }}>
        <Link href="/investor/dashboard" style={{ textDecoration: 'none' }} aria-label="Frakta investor home">
          <FraktaHorizontalLogo height={24} />
        </Link>

        <nav className="iv-header-nav" style={{ display: 'flex', gap: 32 }} aria-label="Investor portal">
          {links.map((link) => {
            const isActive = pathname === link.href
              || (link.href !== '/investor/dashboard' && pathname.startsWith(link.href))
              || (link.href === '/investor/dashboard' && pathname.startsWith('/investor/dashboard/token'))
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                style={{
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--fk-text-hi)' : 'var(--fk-text-mid)',
                  transition: 'color .2s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--fk-text-hi)'}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'var(--fk-text-mid)' }}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Center: Search */}
      <div style={{ flex: '1 1 auto', minWidth: 24, display: 'flex', justifyContent: 'center', padding: '0 16px' }}>
        <div ref={searchRef} style={{ position: 'relative', width: '100%', maxWidth: 400, minWidth: 0 }}>
          <div
            style={{
              display: 'flex', alignItems: 'center', background: 'var(--fk-surface-1)',
              border: '1px solid var(--fk-line)', borderRadius: 'var(--r-md)',
              padding: '8px 12px 8px 16px', width: '100%', minWidth: 0,
            }}
          >
            <Search size={16} color="var(--fk-text-low)" style={{ flexShrink: 0 }} aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              aria-expanded={showResults}
              aria-controls="iv-search-results"
              aria-autocomplete="list"
              aria-activedescendant={activeIndex >= 0 && matches[activeIndex] ? `iv-search-opt-${matches[activeIndex].id}` : undefined}
              aria-label="Search assets"
              value={query}
              placeholder="Search assets..."
              onFocus={() => { openSearchData(); setIsSearchOpen(true) }}
              onChange={e => { openSearchData(); setQuery(e.target.value); setIsSearchOpen(true) }}
              onKeyDown={onSearchKeyDown}
              style={{
                background: 'transparent', border: 'none', outline: 'none', color: 'var(--fk-text-hi)',
                fontSize: 13, marginLeft: 12, width: '100%', minWidth: 0, padding: 0,
              }}
            />
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                aria-label="Clear search"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: 2, marginLeft: 6,
                  display: 'flex', color: 'var(--fk-text-low)', flexShrink: 0,
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <AnimatePresence>
            {showResults && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.12, ease: 'easeOut' }}
                id="iv-search-results"
                role="listbox"
                aria-label="Asset search results"
                style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 8,
                  background: 'var(--fk-surface-1)', border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--r-md)', boxShadow: 'var(--el-3)', padding: 6, zIndex: 50,
                  maxHeight: 380, overflowY: 'auto',
                }}
              >
                {matches.length === 0 ? (
                  <div style={{ padding: '14px 12px', fontSize: 13, color: 'var(--fk-text-mid)' }}>
                    No assets match “{query.trim()}”
                  </div>
                ) : (
                  <>
                    {matches.map((asset, i) => (
                      <div
                        key={asset.id}
                        id={`iv-search-opt-${asset.id}`}
                        role="option"
                        aria-selected={i === activeIndex}
                        tabIndex={-1}
                        onMouseEnter={() => setActiveIndex(i)}
                        onClick={() => selectAsset(asset)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                          borderRadius: 8, cursor: 'pointer',
                          background: i === activeIndex ? 'var(--fk-surface-2)' : 'transparent',
                        }}
                      >
                        <TokenLogo logo={asset.logo} symbol={asset.symbol} isGain={asset.trend === null ? null : asset.trend === 'up'} size={28} />
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <p className="fk-mono" style={{ fontSize: 12, fontWeight: 600, color: 'var(--fk-text-hi)' }}>{asset.symbol}</p>
                          <p className="fk-truncate" style={{ fontSize: 11, color: 'var(--fk-text-low)' }}>{asset.name}</p>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <p className="fk-mono" style={{ fontSize: 12, color: 'var(--fk-text-hi)' }}>
                            {asset.priceNative === null
                              ? EM_DASH
                              : formatMoney(asset.priceNative, { symbol: asset.currencySymbol })}
                          </p>
                          <p className="fk-mono" style={{ fontSize: 11, color: trendColor(asset.trend) }}>
                            {formatPct(asset.changePct)}
                          </p>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={goToResults}
                      style={{
                        width: '100%', textAlign: 'left', padding: '8px 10px', marginTop: 4,
                        borderTop: '1px solid var(--fk-line)', background: 'none', border: 'none',
                        color: 'var(--fk-blue-soft)', fontSize: 12, cursor: 'pointer',
                      }}
                    >
                      See all results for “{query.trim()}”
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="iv-header-actions" style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
        <button
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          style={{ width: 36, height: 36, borderRadius: '50%', background: 'transparent', border: '1px solid var(--fk-line)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--fk-text-mid)' }}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <button
          className="iv-header-icon-btn"
          aria-label="Language and region"
          title="Language and region"
          style={{ width: 36, height: 36, borderRadius: '50%', background: 'transparent', border: '1px solid var(--fk-line)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--fk-text-mid)' }}
        >
          <Globe size={16} />
        </button>

        {/* Wallet Address */}
        <div className="iv-header-wallet" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--fk-surface-1)', border: '1px solid var(--fk-line)', padding: '8px 16px', borderRadius: 999 }}>
          <span
            aria-hidden="true"
            style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--fk-gain)', boxShadow: '0 0 8px var(--fk-gain)', flexShrink: 0 }}
          />
          <span className="fk-mono iv-header-wallet-addr" style={{ fontSize: 13, fontWeight: 500, color: 'var(--fk-text-hi)', letterSpacing: '.05em' }}>
            0x7a...3F9c
          </span>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(WALLET_ADDRESS)
              setIsCopied(true)
              setTimeout(() => setIsCopied(false), 2000)
            }}
            aria-label={isCopied ? 'Wallet address copied' : 'Copy wallet address'}
            title="Copy wallet address"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: isCopied ? 'var(--fk-gain)' : 'var(--fk-text-mid)', transition: 'color 0.2s', flexShrink: 0 }}
          >
            {isCopied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>

        {/* User Dropdown */}
        <div ref={accountRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setIsDropdownOpen(o => !o)}
            aria-label="Account menu"
            aria-haspopup="menu"
            aria-expanded={isDropdownOpen}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, transition: 'transform 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div aria-hidden="true" style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', background: '#F58319' }}>
              <svg x="0" y="0" width="36" height="36">
                <rect x="0" y="0" width="36" height="36" transform="translate(6 -4) rotate(45 18 18)" fill="#0018BB" />
                <rect x="0" y="0" width="36" height="36" transform="translate(-10 12) rotate(130 18 18)" fill="#19A0A8" />
                <rect x="0" y="0" width="36" height="36" transform="translate(18 -10) rotate(190 18 18)" fill="#E31464" />
              </svg>
            </div>
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                role="menu"
                aria-label="Account"
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: 12,
                  width: 220,
                  background: 'var(--fk-surface-1)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 16,
                  boxShadow: 'var(--el-3)',
                  padding: 8,
                  zIndex: 50,
                }}
              >
                <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--fk-line)', marginBottom: 8, paddingBottom: 12 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--fk-text-hi)' }}>My Account</p>
                </div>

                {/* The inline nav is hidden below 768px (.iv-header-nav), so the
                    same destinations are repeated here to stay reachable. */}
                {links.map(link => (
                  <Link
                    key={`menu-${link.href}`}
                    href={link.href}
                    role="menuitem"
                    className="iv-menu-nav-link"
                    style={{ ...menuItemStyle, display: 'none' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--fk-surface-2)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                  >
                    {link.label}
                  </Link>
                ))}

                <Link
                  href="/investor/dashboard/portfolio"
                  role="menuitem"
                  style={menuItemStyle}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--fk-surface-2)'; e.currentTarget.style.color = 'var(--fk-blue)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--fk-text-hi)' }}
                >
                  <Briefcase size={16} style={{ color: 'inherit' }} /> Portfolio
                </Link>

                {/* Was href="#". The tokenizer-side signup lives at /auth/register. */}
                <Link
                  href="/auth/register"
                  role="menuitem"
                  style={menuItemStyle}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--fk-surface-2)'; e.currentTarget.style.color = 'var(--fk-blue-soft)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--fk-text-hi)' }}
                >
                  <Sparkles size={16} style={{ color: 'inherit' }} /> Register as Creator
                </Link>

                <div style={{ height: 1, background: 'var(--fk-line)', margin: '8px 0' }} />

                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  style={{
                    ...menuItemStyle,
                    width: '100%', textAlign: 'left', background: 'transparent',
                    border: 'none', cursor: loggingOut ? 'progress' : 'pointer',
                    color: 'var(--fk-loss)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--fk-loss-tint)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <LogOut size={16} /> {loggingOut ? 'Signing out…' : 'Logout'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile-only: reveal the duplicated nav links inside the account menu.
          Scoped here rather than in globals.css because it only exists to pair
          with .iv-header-nav's mobile `display:none`. */}
      <style>{`
        @media (max-width: 768px) {
          .iv-menu-nav-link { display: flex !important; }
        }
      `}</style>
    </header>
  )
}
