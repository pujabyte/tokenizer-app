'use client'
import { useState, useRef, useEffect } from 'react'
import { Search, ChevronDown, Check, Plus, Settings, PanelLeft, X, Building2 } from 'lucide-react'

const WORKSPACES = [
  { id: 'openano', name: 'openano', color: '#2BBCB4', initial: 'O' },
  { id: 'nanovest', name: 'Nanovest RWA', color: '#D4A520', initial: 'N' },
  { id: 'triink', name: 'Triink Treasury', color: '#8B5CF6', initial: 'T' },
]

function WorkspaceAvatar({ name, color, size = 24 }: { name: string; color: string; size?: number }) {
  return (
    <span
      className="flex items-center justify-center flex-shrink-0 font-semibold"
      style={{
        width: size,
        height: size,
        borderRadius: '6px',
        backgroundColor: color,
        fontSize: size * 0.45,
        color: '#fff',
      }}
    >
      {name[0].toUpperCase()}
    </span>
  )
}

const COLORS = ['#2BBCB4', '#D4A520', '#8B5CF6', '#E55C5C', '#3B82F6', '#10B981']

function pickColor(seed: string) {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  return COLORS[Math.abs(hash) % COLORS.length]
}

export default function TopHeader() {
  const [activeWs, setActiveWs] = useState(WORKSPACES[0])
  const [open, setOpen] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [wsName, setWsName] = useState('')
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header
      className="fixed top-0 right-0 flex items-center z-20"
      style={{
        left: 'var(--sidebar-width)',
        height: 'var(--header-height)',
        backgroundColor: 'var(--fk-bg)',
        borderBottom: '1px solid var(--fk-line-soft)',
        padding: '0 20px',
      }}
    >
      {/* Left — Sidebar Toggle + Workspace Switcher */}
      <div className="flex items-center flex-shrink-0" style={{ gap: '4px', position: 'relative', zIndex: 2 }}>
        <button
          className="flex items-center justify-center hover:bg-white/[0.05] transition-colors rounded-md flex-shrink-0"
          style={{ width: '32px', height: '32px', color: 'var(--fk-text-hi)', border: 'none', background: 'transparent' }}
        >
          <PanelLeft size={16} />
        </button>

        {/* Workspace Switcher */}
        <div className="relative" ref={dropRef}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 hover:bg-white/[0.05] transition-colors"
          style={{
            height: '32px',
            padding: '0 10px',
            borderRadius: 'var(--r-md)',
            border: 'none',
            background: 'transparent',
          }}
        >
          <WorkspaceAvatar name={activeWs.name} color={activeWs.color} size={22} />
          <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--fk-text-hi)' }}>{activeWs.name}</span>
          <ChevronDown size={13} style={{ color: 'var(--fk-text-mid)' }} className={open ? 'rotate-180 transition-transform' : 'transition-transform'} />
        </button>

        {open && (
          <div
            className="absolute left-0 top-full mt-1.5 flex flex-col overflow-hidden"
            style={{
              width: '220px',
              backgroundColor: 'var(--fk-surface-2)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--r-lg)',
              boxShadow: 'var(--el-3)',
              zIndex: 50,
            }}
          >
            <div style={{ padding: '10px 14px 6px', fontSize: '10px', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--fk-text-low)' }}>
              Workspace
            </div>
            {WORKSPACES.map((ws) => (
              <button
                key={ws.id}
                onClick={() => { setActiveWs(ws); setOpen(false) }}
                className="flex items-center gap-2.5 transition-colors hover:bg-white/[0.05]"
                style={{
                  padding: '8px 14px',
                  background: ws.id === activeWs.id ? 'var(--fk-soft-tint)' : 'transparent',
                  border: 'none',
                  width: '100%',
                  textAlign: 'left',
                }}
              >
                <WorkspaceAvatar name={ws.name} color={ws.color} size={26} />
                <span style={{ flex: 1, fontSize: '13px', fontWeight: 500, color: ws.id === activeWs.id ? 'var(--fk-blue-soft)' : 'var(--fk-text-hi)' }}>
                  {ws.name}
                </span>
                {ws.id === activeWs.id && <Check size={13} style={{ color: 'var(--fk-blue-soft)', flexShrink: 0 }} />}
              </button>
            ))}
            <div style={{ height: '1px', backgroundColor: 'var(--fk-line-soft)', margin: '4px 0' }} />
            <button
              className="flex items-center gap-2.5 transition-colors hover:bg-white/[0.05]"
              style={{ padding: '8px 14px', background: 'transparent', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}
              onClick={() => { setOpen(false); setShowModal(true) }}
            >
              <Plus size={15} style={{ color: 'var(--fk-text-mid)', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: 'var(--fk-text-mid)' }}>Create new workspace</span>
            </button>
            <button
              className="flex items-center gap-2.5 transition-colors hover:bg-white/[0.05]"
              style={{ padding: '8px 14px 10px', background: 'transparent', border: 'none', width: '100%', textAlign: 'left' }}
            >
              <Settings size={15} style={{ color: 'var(--fk-text-mid)', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: 'var(--fk-text-mid)' }}>Workspace settings</span>
            </button>
          </div>
        )}
      </div>
      </div>{/* end left */}

      {/* Center — Search Bar, absolutely centered in header */}
      <div className="relative" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', width: '400px', zIndex: 1, pointerEvents: 'none' }}>
        <Search
          size={14}
          style={{
            position: 'absolute',
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--fk-text-mid)',
            pointerEvents: 'none',
          }}
        />
        <input
          type="text"
          placeholder="Search assets, investors, or transactions..."
          className="focus:outline-none"
          style={{
            width: '100%',
            height: '32px',
            backgroundColor: 'var(--fk-surface-1)',
            border: '1px solid var(--glass-border)',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,.3)',
            borderRadius: 'var(--r-md)',
            padding: '4px 12px 4px 32px',
            fontSize: '13px',
            color: 'var(--fk-text-mid)',
            pointerEvents: 'auto',
          }}
        />
      </div>

      {/* Create Workspace Modal */}
    {showModal && (
      <>
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(6px)' }}
          onClick={() => { setShowModal(false); setWsName('') }}
        />
        <div style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          zIndex: 201, width: 440,
          background: 'var(--fk-surface-2)', border: '1px solid var(--glass-border)',
          borderRadius: 16, overflow: 'hidden',
          boxShadow: '0 32px 96px rgba(0,0,0,.8)',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px' }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--fk-text-hi)' }}>Create new workspace</p>
            <button
              onClick={() => { setShowModal(false); setWsName('') }}
              style={{ background: 'var(--fk-surface-3)', border: '1px solid var(--glass-border)', cursor: 'pointer', color: 'var(--fk-text-low)', display: 'flex', padding: 6, borderRadius: 8, transition: 'color .15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--fk-text-hi)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--fk-text-low)')}
            >
              <X size={14} strokeWidth={2} />
            </button>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'var(--fk-line-soft)' }} />

          {/* Body */}
          <div style={{ padding: '24px 20px' }}>

            {/* Workspace name field */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--fk-text-mid)', display: 'block', marginBottom: 8 }}>
                Workspace
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                  background: wsName.trim() ? pickColor(wsName) : 'var(--fk-surface-3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: '#fff',
                  transition: 'background .2s',
                }}>
                  {wsName.trim() ? wsName.trim()[0].toUpperCase() : <Building2 size={12} strokeWidth={2} style={{ color: 'var(--fk-text-low)' }} />}
                </div>
                <input
                  type="text"
                  value={wsName}
                  onChange={e => setWsName(e.target.value)}
                  placeholder="e.g. Nanovest RWA, Triink Treasury..."
                  autoFocus
                  style={{
                    width: '100%', padding: '11px 14px 11px 42px',
                    background: 'var(--fk-surface-1)', border: '1px solid var(--glass-border)',
                    borderRadius: 10, fontSize: 14, color: 'var(--fk-text-hi)',
                    outline: 'none', boxSizing: 'border-box', transition: 'border-color .15s',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'var(--fk-blue-soft)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'var(--glass-border)')}
                />
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: 'var(--fk-line-soft)', margin: '0 0 20px' }} />

            {/* Visual connection diagram */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 20 }}>
              {/* Frakta logo box */}
              <div style={{
                width: 56, height: 56, borderRadius: 14,
                background: 'rgba(8,92,240,0.12)', border: '1px solid rgba(8,92,240,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 0 4px rgba(8,92,240,0.06)',
              }}>
                <svg width="26" height="26" viewBox="0 0 504 289" fill="none">
                  <path d="M372.6 12.3C397.4 2.8 437.3-4.6 463.2 3.4C481.2 9 496.1 21.5 504.8 38.2C513.7 55.2 515.4 75.1 509.6 93.4C503.8 111.7 490.8 127 473.7 135.7C465.2 140.1 456.1 142.8 446.6 143.7C433.6 144.9 406 141.9 391.6 140.8C373.5 139.4 359.4 139.4 341.4 139.1C336.7 139.2 325.1 139.3 321.1 140.2C302.5 140.6 279.5 146.6 262.4 153.6C251.3 158.7 244.3 163.7 235.3 171.7C248.1 150.8 257.3 120.7 271.4 100.4C272.4 97.8 277.3 90.4 278.9 87.9C290.6 69.9 313.7 44.0 332.5 33.2C333.3 32.0 343.1 26.2 344.9 25.1C353.9 20.3 363.1 15.9 372.6 12.3Z" fill="#085CF0"/>
                  <path d="M335 23.4C334.9 23.9 319 34.2 317.5 35.5C253.5 81.6 241.6 157.9 199.3 219.4C165.3 269 75.3 316.9 21.7 268.4C1.5 248.5-5.2 219.2 4.5 192.5C14.4 165.3 41.9 146.6 70.6 145.4C87.3 144.7 104.4 147.4 121.3 146.1C144.2 144.4 163.7 140.2 184.5 130.1C216.8 114.4 238.8 89.4 265.5 66.6C286.9 48.2 309.3 35.0 335 23.4Z" fill="url(#mg0)"/>
                  <defs>
                    <linearGradient id="mg0" x1="167.7" y1="23.4" x2="167.7" y2="288.6" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#085CF0"/><stop offset="1" stopColor="#0A2677"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Connector line + dots */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                {[1, 0.4, 1, 0.4, 1].map((op, i) => (
                  <div key={i} style={{
                    width: i % 2 === 0 ? 5 : 3,
                    height: i % 2 === 0 ? 5 : 3,
                    borderRadius: '50%',
                    background: 'var(--fk-blue-soft)',
                    opacity: op,
                  }} />
                ))}
              </div>

              {/* Workspace preview box */}
              <div style={{
                width: 56, height: 56, borderRadius: 14,
                background: wsName.trim() ? pickColor(wsName) : 'var(--fk-surface-1)',
                border: wsName.trim() ? `1px solid ${pickColor(wsName)}44` : '1.5px dashed rgba(255,255,255,.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, fontWeight: 700, color: '#fff',
                transition: 'background .25s, border .25s',
                boxShadow: wsName.trim() ? `0 0 0 4px ${pickColor(wsName)}22` : 'none',
              }}>
                {wsName.trim()
                  ? wsName.trim()[0].toUpperCase()
                  : <Building2 size={20} strokeWidth={1.5} style={{ color: 'rgba(255,255,255,.25)' }} />
                }
              </div>
            </div>

            {/* Description */}
            <p style={{ fontSize: 13, color: 'var(--fk-text-low)', textAlign: 'center', lineHeight: 1.6, marginBottom: 20 }}>
              Your new workspace will have its own assets, tokens, and team members, isolated from other workspaces.
            </p>

            {/* CTA */}
            <button
              disabled={!wsName.trim()}
              onClick={() => {
                if (!wsName.trim()) return
                setShowModal(false)
                setWsName('')
              }}
              style={{
                width: '100%', padding: '13px', borderRadius: 10,
                background: wsName.trim() ? 'var(--fk-grad)' : 'var(--fk-surface-3)',
                border: 'none', cursor: wsName.trim() ? 'pointer' : 'default',
                color: wsName.trim() ? '#fff' : 'var(--fk-text-low)',
                fontSize: 14, fontWeight: 600, transition: 'opacity .2s',
              }}
              onMouseEnter={e => { if (wsName.trim()) e.currentTarget.style.opacity = '.85' }}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Create Workspace
            </button>

            {/* Footer */}
            <p style={{ fontSize: 12, color: 'var(--fk-text-low)', textAlign: 'center', marginTop: 14, lineHeight: 1.5 }}>
              Already have a workspace?{' '}
              <button
                onClick={() => { setShowModal(false); setWsName('') }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fk-blue-soft)', fontSize: 12, fontWeight: 500, padding: 0 }}
              >
                Switch workspace
              </button>
            </p>
          </div>
        </div>
      </>
    )}
    </header>
  )
}
