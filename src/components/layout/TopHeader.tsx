'use client'
import { Search, Bell, ChevronDown, PanelLeft } from 'lucide-react'

export default function TopHeader() {
  return (
    <header
      className="fixed top-0 right-0 flex items-center z-20"
      style={{
        left: 'var(--sidebar-width)',
        height: 'var(--header-height)',
        backgroundColor: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0 24px',
        gap: '16px',
      }}
    >
      {/* Sidebar Toggle */}
      <button
        className="flex items-center justify-center hover:bg-white/[0.05] transition-colors rounded-md flex-shrink-0"
        style={{ width: '40px', height: '40px', color: '#f8fafc', border: 'none', background: 'transparent' }}
      >
        <PanelLeft size={18} />
      </button>

      {/* Search Bar */}
      <div className="relative flex-1" style={{ maxWidth: '448px' }}>
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#94a3b8',
            pointerEvents: 'none',
          }}
        />
        <input
          type="text"
          placeholder="Search assets, investors, or transactions..."
          className="focus:outline-none"
          style={{
            width: '100%',
            height: '36px',
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            border: 'none',
            borderRadius: '6px',
            padding: '4px 12px 4px 36px',
            fontSize: '14px',
            color: '#94a3b8',
          }}
        />
      </div>

      {/* Right section */}
      <div className="flex items-center ml-auto" style={{ gap: '8px' }}>
        {/* Creator Mode */}
        <button
          className="flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium hover:bg-white/[0.05] transition-colors"
          style={{
            fontSize: '14px',
            color: '#f8fafc',
            fontWeight: 500,
            padding: '8px 16px',
            height: '40px',
            background: 'transparent',
            border: 'none',
            borderRadius: '6px',
          }}
        >
          Creator Mode
        </button>

        {/* Notifications */}
        <button
          className="flex items-center justify-center hover:bg-white/[0.05] transition-colors rounded-md"
          style={{ width: '40px', height: '40px', color: '#f8fafc', border: 'none', background: 'transparent' }}
        >
          <Bell size={18} />
        </button>

        {/* Wallet Address */}
        <button
          className="flex items-center hover:bg-white/[0.05] transition-colors"
          style={{
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            padding: '8px 12px',
            height: '40px',
            gap: '8px',
            background: 'transparent',
            color: '#f8fafc',
          }}
        >
          <span
            className="rounded-full flex-shrink-0"
            style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#22c55e',
              boxShadow: '0 0 6px #22c55e',
            }}
          />
          <span style={{ color: '#f1f5f9', fontSize: '14px', fontFamily: 'monospace' }}>
            0xF7aB...B48e
          </span>
          <ChevronDown size={13} style={{ color: '#94a3b8' }} />
        </button>
      </div>
    </header>
  )
}
