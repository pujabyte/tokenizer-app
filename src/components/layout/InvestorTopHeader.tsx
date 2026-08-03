'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Globe, User, Sun, Moon, Copy, Check, Briefcase, Sparkles, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import FraktaHorizontalLogo from '../ui/FraktaHorizontalLogo'
import { useTheme } from '@/components/ThemeProvider'

export default function InvestorTopHeader() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const links = [
    { label: 'Explore', href: '/investor/dashboard' },
    { label: 'Portfolio', href: '/investor/dashboard/portfolio' },
    { label: 'Rewards', href: '/investor/dashboard/rewards' },
    { label: 'Swap', href: '/investor/dashboard/swap' },
    { label: 'Resources', href: '/investor/dashboard/resources' },
  ]

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: 'var(--header-height, 72px)',
      backgroundColor: 'var(--glass-bg)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--fk-line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px', zIndex: 40
    }}>
      
      {/* Left: Logo and Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 48 }}>
        <Link href="/investor/dashboard" style={{ textDecoration: 'none' }}>
          <FraktaHorizontalLogo height={24} />
        </Link>

        <nav style={{ display: 'flex', gap: 32 }}>
          {links.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/investor/dashboard' && pathname.startsWith(link.href)) || (link.href === '/investor/dashboard' && pathname.startsWith('/investor/dashboard/token'))
            return (
              <Link key={link.href} href={link.href} style={{ 
                textDecoration: 'none', 
                fontSize: 14, 
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--fk-text-hi)' : 'var(--fk-text-mid)',
                transition: 'color .2s'
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--fk-text-hi)'}
              onMouseLeave={e => { if(!isActive) e.currentTarget.style.color = 'var(--fk-text-mid)' }}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Center: Search */}
      <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', width: 400 }}>
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--fk-surface-1)', border: '1px solid var(--fk-line)', borderRadius: 'var(--r-md)', padding: '8px 16px' }}>
          <Search size={16} color="var(--fk-text-low)" />
          <input type="text" placeholder="Search assets..." style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--fk-text-hi)', fontSize: 13, marginLeft: 12, width: '100%', padding: 0 }} />
        </div>
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button 
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          style={{ width: 36, height: 36, borderRadius: '50%', background: 'transparent', border: '1px solid var(--fk-line)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--fk-text-mid)' }}>
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <button style={{ width: 36, height: 36, borderRadius: '50%', background: 'transparent', border: '1px solid var(--fk-line)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--fk-text-mid)' }}>
          <Globe size={16} />
        </button>

        {/* Wallet Address */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--fk-surface-1)', border: '1px solid var(--fk-line)', padding: '8px 16px', borderRadius: 999 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#25D48A', boxShadow: '0 0 8px #25D48A' }} />
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--fk-text-hi)', fontFamily: 'monospace', letterSpacing: '.05em' }}>0x7a...3F9c</span>
          <button 
            onClick={() => {
              navigator.clipboard.writeText('0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D')
              setIsCopied(true)
              setTimeout(() => setIsCopied(false), 2000)
            }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: isCopied ? '#25D48A' : 'var(--fk-text-mid)', transition: 'color 0.2s' }}>
            {isCopied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>

        {/* User Dropdown */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, transition: 'transform 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', background: '#F58319' }}>
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
                  boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
                  padding: 8,
                  zIndex: 50
                }}
              >
                <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--fk-line)', marginBottom: 8, paddingBottom: 12 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--fk-text-hi)' }}>My Account</p>
                </div>
                
                <Link href="/investor/dashboard/portfolio" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', textDecoration: 'none', color: 'var(--fk-text-hi)', fontSize: 13, fontWeight: 500, borderRadius: 8, transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = 'var(--fk-surface-2)'; e.currentTarget.style.color = 'var(--fk-blue)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--fk-text-hi)'; }}>
                  <Briefcase size={16} style={{ color: 'inherit' }} /> Portfolio
                </Link>
                
                <Link href="#" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', textDecoration: 'none', color: 'var(--fk-text-hi)', fontSize: 13, fontWeight: 500, borderRadius: 8, transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = 'var(--fk-surface-2)'; e.currentTarget.style.color = '#A78BFA'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--fk-text-hi)'; }}>
                  <Sparkles size={16} style={{ color: 'inherit' }} /> Register as Creator
                </Link>
                
                <div style={{ height: 1, background: 'var(--fk-line)', margin: '8px 0' }} />
                
                <Link href="/investor/auth" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', textDecoration: 'none', color: '#FF4B4B', fontSize: 13, fontWeight: 500, borderRadius: 8, transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,75,75,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <LogOut size={16} color="#FF4B4B" /> Logout
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
