'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Wallet, History, Settings, Sun, Moon } from 'lucide-react'
import FraktaHorizontalLogo from '../ui/FraktaHorizontalLogo'
import { useTheme } from '../ThemeProvider'

export default function InvestorSidebar() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()

  const links = [
    { label: 'Markets', href: '/investor/dashboard', icon: LayoutDashboard },
    { label: 'Portfolio', href: '/investor/dashboard/portfolio', icon: Wallet },
    { label: 'Transaction History', href: '/investor/dashboard/history', icon: History },
    { label: 'Settings', href: '/investor/dashboard/settings', icon: Settings },
  ]

  return (
    <aside style={{
      position: 'fixed', top: 0, left: 0, bottom: 0, width: 'var(--sidebar-width)',
      backgroundColor: 'var(--fk-surface-1)', borderRight: '1px solid var(--glass-border)',
      padding: '24px 16px', display: 'flex', flexDirection: 'column', zIndex: 40
    }}>
      <div style={{ padding: '0 8px', marginBottom: 40 }}>
        <FraktaHorizontalLogo height={24} />
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--fk-text-low)', textTransform: 'uppercase', letterSpacing: '.1em', padding: '0 8px', marginBottom: 8 }}>INVESTOR PORTAL</p>
        {links.map((link) => {
          const isActive = pathname === link.href || (link.href !== '/investor/dashboard' && pathname.startsWith(link.href)) || (link.href === '/investor/dashboard' && pathname.startsWith('/investor/dashboard/token'))
          return (
            <Link key={link.href} href={link.href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                borderRadius: 'var(--r-md)',
                backgroundColor: isActive ? 'rgba(46,92,255,.1)' : 'transparent',
                color: isActive ? 'var(--fk-blue)' : 'var(--fk-text-mid)',
                transition: 'all .2s'
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,.03)' }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <link.icon size={18} />
                <span style={{ fontSize: 14, fontWeight: isActive ? 600 : 500 }}>{link.label}</span>
              </div>
            </Link>
          )
        })}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
            borderRadius: 'var(--r-md)', backgroundColor: 'transparent',
            color: 'var(--fk-text-mid)', transition: 'all .2s', cursor: 'pointer', border: 'none',
            textAlign: 'left', width: '100%', marginTop: '4px'
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,.03)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          <span style={{ fontSize: 14, fontWeight: 500 }}>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </nav>

      <div style={{ marginTop: 'auto', padding: '16px', borderRadius: 'var(--r-md)', background: 'linear-gradient(135deg, rgba(37,212,138,.1), rgba(37,212,138,.02))', border: '1px solid rgba(37,212,138,.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#25D48A', boxShadow: '0 0 8px rgba(37,212,138,.8)' }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#25D48A' }}>KYC VERIFIED</span>
        </div>
        <p style={{ fontSize: 11, color: 'var(--fk-text-mid)', lineHeight: 1.5 }}>
          Your identity is verified. You have full trading access.
        </p>
      </div>
    </aside>
  )
}
