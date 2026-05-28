'use client'
import { Copy, Key } from 'lucide-react'
import { useState } from 'react'

const WALLET_ADDRESS = '0xF7aBd08D1b15121469c78CC4a473324fF4CfB48e'

export default function SettingsPage() {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(WALLET_ADDRESS)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col" style={{ gap: '40px' }}>
      {/* Header */}
      <div>
        <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
          ACCOUNT
        </p>
        <h1 style={{ fontSize: '30px', fontWeight: 700, color: '#ffffff' }}>Settings</h1>
        <p style={{ fontSize: '16px', color: '#94a3b8', marginTop: '4px' }}>
          Manage your profile, wallet, and security in one place.
        </p>
      </div>

      {/* Profile Card */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
      >
        <div style={{ padding: '32px' }}>
          {/* Avatar Row */}
          <div className="flex items-center" style={{ gap: '24px', marginBottom: '24px' }}>
            <div
              className="flex items-center justify-center rounded-full flex-shrink-0 text-white font-semibold"
              style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
                fontSize: '20px',
              }}
            >
              IK
            </div>
            <div>
              <p style={{ fontSize: '20px', fontWeight: 600, color: '#f8fafc' }}>I Ketut Puja Arsana Sujana</p>
              <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '2px' }}>ketut.puja@nanovest.io</p>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: '1px', backgroundColor: 'var(--border-color)', marginBottom: '20px' }} />

          {/* Fields */}
          <div className="grid grid-cols-2" style={{ columnGap: '32px', rowGap: '20px' }}>
            <div>
              <p style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '6px' }}>
                Full name
              </p>
              <p style={{ fontSize: '14px', color: '#f8fafc' }}>I Ketut Puja Arsana Sujana</p>
            </div>
            <div>
              <p style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '6px' }}>
                Email
              </p>
              <p style={{ fontSize: '14px', color: '#f8fafc' }}>ketut.puja@nanovest.io</p>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Section */}
      <div className="flex flex-col" style={{ gap: '16px' }}>
        {/* Wallet heading row — OUTSIDE the card */}
        <div className="flex items-end justify-between" style={{ gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#f8fafc' }}>Wallet</h2>
            <p style={{ fontSize: '14px', color: '#94a3b8' }}>Your embedded wallet, secured by Privy.</p>
          </div>
          <span
            className="flex items-center rounded-full"
            style={{
              gap: '6px',
              backgroundColor: 'rgba(34,197,94,0.1)',
              border: '1px solid var(--border-color)',
              color: '#4ade80',
              padding: '4px 10px',
              fontSize: '12px',
              fontWeight: 500,
              whiteSpace: 'nowrap',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            Connected
          </span>
        </div>

        {/* Wallet Card */}
        <div
          className="rounded-xl"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
        >
          <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Wallet Address */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p style={{ fontSize: '12px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8' }}>
                Wallet address
              </p>
              <div
                className="flex items-center justify-between"
                style={{
                  padding: '12px 16px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'rgba(30, 41, 59, 0.4)',
                }}
              >
                <span style={{ fontSize: '14px', color: '#f8fafc', fontFamily: 'monospace' }}>
                  {WALLET_ADDRESS}
                </span>
                <button
                  onClick={handleCopy}
                  className="hover:text-gray-300 transition-colors"
                  style={{ color: '#64748b', marginLeft: '12px' }}
                >
                  <Copy size={14} />
                </button>
              </div>
              {copied && <p style={{ fontSize: '12px', color: '#4ade80' }}>Copied!</p>}
            </div>

            {/* Divider */}
            <div style={{ height: '1px', backgroundColor: 'var(--border-color)' }} />

            {/* Export Private Key */}
            <div className="flex items-start justify-between" style={{ gap: '16px' }}>
              <div className="flex items-start" style={{ gap: '12px' }}>
                <div
                  className="flex items-center justify-center flex-shrink-0"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(245,158,11,0.1)',
                  }}
                >
                  <Key size={16} className="text-amber-500" />
                </div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc' }}>Export private key</p>
                  <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '2px' }}>
                    Reveal your wallet&apos;s signing key. Anyone with this key controls your assets — keep it offline and never share it.
                  </p>
                </div>
              </div>
              <button
                className="flex items-center flex-shrink-0 hover:bg-white/[0.05] transition-colors"
                style={{
                  gap: '8px',
                  padding: '8px 16px',
                  height: '40px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-card)',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#f8fafc',
                }}
              >
                <Key size={14} />
                Export Wallet
              </button>
            </div>
          </div>
        </div>

        {/* Safety note — OUTSIDE card */}
        <div className="flex items-start" style={{ gap: '8px', padding: '0 4px' }}>
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              backgroundColor: 'rgba(99,102,241,0.2)',
              marginTop: '1px',
            }}
          >
            <span style={{ fontSize: '10px', color: '#818cf8', fontWeight: 700 }}>i</span>
          </div>
          <p style={{ fontSize: '12px', color: '#64748b' }}>
            Your private key never leaves your device. Nanobyte and Privy cannot recover it for you.
          </p>
        </div>
      </div>
    </div>
  )
}
