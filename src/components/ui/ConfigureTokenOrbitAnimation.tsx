'use client'

import { motion } from 'motion/react'
import { Layers, Shield, Share2, Scale } from 'lucide-react'

const PARAMS = [
  { id: 'supply',       label: 'SUPPLY',       Icon: Layers, style: { left: '50%', top: 55  } as React.CSSProperties },
  { id: 'distribution', label: 'DISTRIBUTION', Icon: Share2, style: { left: '72%', top: 150 } as React.CSSProperties },
  { id: 'governance',   label: 'GOVERNANCE',   Icon: Scale,  style: { left: '50%', top: 245 } as React.CSSProperties },
  { id: 'compliance',   label: 'COMPLIANCE',   Icon: Shield, style: { left: '28%', top: 150 } as React.CSSProperties },
]

export default function ConfigureTokenOrbitAnimation({
  supply = 1000,
  kyc = true,
}: {
  supply?: number
  kyc?: boolean
}) {
  const orbitDur = Math.max(3, 15 - supply / 1000)

  return (
    <div className="absolute inset-0">

      {/* ── Orbit rings + connector spokes (SVG) ── */}
      <svg
        className="absolute inset-0"
        width="100%"
        height="100%"
        viewBox="0 0 500 300"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
      >
        {/* Outer dashed orbit ring */}
        <circle cx="250" cy="150" r="110" stroke="rgba(107,133,255,0.16)" strokeWidth="1" strokeDasharray="5 4"/>
        {/* Inner orbit ring */}
        <circle cx="250" cy="150" r="66"  stroke="rgba(107,133,255,0.08)" strokeWidth="1"/>
        {/* Connector spokes — center → icon box edges */}
        <line x1="250" y1="150" x2="250" y2="83"  stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3"/>
        <line x1="250" y1="150" x2="332" y2="150" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3"/>
        <line x1="250" y1="150" x2="250" y2="217" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3"/>
        <line x1="250" y1="150" x2="168" y2="150" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3"/>
      </svg>

      {/* ── Icon boxes at cardinal positions ── */}
      {PARAMS.map(({ id, label, Icon, style }) => (
        <div
          key={id}
          style={{
            position: 'absolute',
            ...style,
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <div style={{
            width: 56, height: 56,
            borderRadius: 16,
            background: 'rgba(22,24,34,0.96)',
            border: '1px solid rgba(107,133,255,0.22)',
            boxShadow: '0 0 20px rgba(46,92,255,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Icon size={24} strokeWidth={1.5} color="rgba(107,133,255,0.8)"/>
          </div>
          <span style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.13em',
            color: 'rgba(107,133,255,0.55)',
            fontFamily: 'sans-serif',
            whiteSpace: 'nowrap',
          }}>
            {label}
          </span>
        </div>
      ))}

      {/* ── Center token orb ── */}
      <div style={{
        position: 'absolute',
        top: 150,
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }}>
        <div style={{
          width: 64, height: 64,
          borderRadius: '50%',
          background: 'rgba(34,36,47,1)',
          border: '1px solid rgba(107,133,255,0.35)',
          boxShadow: '0 0 28px rgba(46,92,255,0.35), 0 0 56px rgba(46,92,255,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Inner gradient */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, rgba(14,27,77,0.9) 0%, transparent 100%)',
          }}/>
          {/* Inner ring highlight */}
          <div style={{
            position: 'absolute',
            inset: 3,
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.05)',
          }}/>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 22,
            color: '#fff',
            position: 'relative',
            zIndex: 1,
          }}>F</span>
        </div>
      </div>

      {/* ── Orbit dots — zero-size anchor at center ── */}
      {/* Math: dot at (left: -4, top: -(r+4)), transformOrigin: '50% {r+4}px'
          rotates around (50%-4+4, -(r+4)+(r+4)) = (0, 0) of this anchor = center. */}
      <div style={{ position: 'absolute', top: 150, left: '50%', width: 0, height: 0 }}>

        {/* Blue dot — CW on outer ring (r=110) */}
        <motion.div
          style={{
            position: 'absolute',
            width: 8, height: 8,
            borderRadius: '50%',
            background: '#6B85FF',
            top: -114, left: -4,
            transformOrigin: '50% 114px',
            boxShadow: '0 0 6px rgba(107,133,255,0.9)',
          }}
          initial={{ rotate: 90 }}
          animate={{ rotate: 90 + 360 }}
          transition={{ repeat: Infinity, duration: orbitDur, ease: 'linear', repeatDelay: 0 }}
        />

        {/* Green dot — CCW on inner ring (r=66), only when kyc=true */}
        {kyc && (
          <motion.div
            style={{
              position: 'absolute',
              width: 6, height: 6,
              borderRadius: '50%',
              background: '#25D48A',
              top: -69, left: -3,
              transformOrigin: '50% 69px',
              boxShadow: '0 0 5px rgba(37,212,138,0.9)',
            }}
            initial={{ rotate: 270 }}
            animate={{ rotate: 270 - 360 }}
            transition={{ repeat: Infinity, duration: 6, ease: 'linear', repeatDelay: 0 }}
          />
        )}
      </div>

    </div>
  )
}
