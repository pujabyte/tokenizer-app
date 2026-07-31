'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Globe, Wallet, User, Sun, Moon } from 'lucide-react'
import FraktaHorizontalLogo from '../ui/FraktaHorizontalLogo'
import { useTheme } from '@/components/ThemeProvider'

export default function InvestorTopHeader() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()

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

        <button className="fk-btn fk-btn-ghost" style={{ padding: '8px 16px', fontSize: 13 }}>
          Connect Wallet
        </button>

        <button style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #085CF0, #2BBCB4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={16} color="#fff" />
          </div>
        </button>
      </div>
    </header>
  )
}
