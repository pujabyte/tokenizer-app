'use client'
import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface WalletAddressProps {
  address: string
  truncate?: boolean
}

export default function WalletAddress({ address, truncate = true }: WalletAddressProps) {
  const [copied, setCopied] = useState(false)

  const display = truncate
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : address

  const handleCopy = () => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-2">
      <span className="fk-mono text-sm" style={{ color: 'var(--fk-text-hi)' }}>{display}</span>
      <button
        onClick={handleCopy}
        className="transition-colors"
        style={{ color: 'var(--fk-text-low)' }}
        title="Copy address"
        aria-label="Copy address"
      >
        {copied ? <Check size={13} style={{ color: 'var(--fk-gain)' }} /> : <Copy size={13} />}
      </button>
    </div>
  )
}
