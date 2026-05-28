'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Plus, Briefcase, Shield, FileText, Settings, ChevronsUpDown
} from 'lucide-react'
import clsx from 'clsx'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Create Token', href: '/dashboard/tokens/create', icon: Plus },
  { label: 'Assets', href: '/dashboard/assets', icon: Briefcase },
  { label: 'Compliance', href: '/dashboard/compliance', icon: Shield },
  { label: 'Contract Admin', href: '/dashboard/admin', icon: FileText },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="fixed top-0 left-0 h-screen flex flex-col z-30"
      style={{
        width: 'var(--sidebar-width)',
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-color)',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2 px-6"
        style={{ borderBottom: '1px solid var(--border-color)', height: 'var(--header-height)', minHeight: 'var(--header-height)' }}
      >
        <div
          className="w-8 h-8 rounded-lg flex-shrink-0"
          style={{ backgroundColor: '#f8fafc' }}
        />
        <span className="text-white font-semibold text-lg">Tokenizer</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 flex flex-col gap-1">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive =
            href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(href)

          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                !isActive && 'hover:bg-white/[0.05]'
              )}
              style={{
                color: isActive ? '#fff' : '#94a3b8',
                backgroundColor: isActive ? '#1e293b' : 'transparent',
              }}
            >
              <Icon size={24} strokeWidth={1.5} />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Profile */}
      <div
        className="px-4 pb-4 pt-3"
        style={{ borderTop: '1px solid var(--border-color)' }}
      >
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.05] transition-colors">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
            style={{ backgroundColor: '#1e293b' }}
          >
            I
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-white text-sm font-medium truncate">I Ketut Puja Arsana S...</p>
            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>ketut.puja@nanovest.io</p>
          </div>
          <ChevronsUpDown size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        </button>
      </div>
    </aside>
  )
}
