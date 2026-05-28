'use client'
import { useState } from 'react'
import { Upload, HelpCircle, ArrowRight } from 'lucide-react'
import { ArrowLeftRight, Users, PauseCircle, Plus, Flame } from 'lucide-react'
import WizardStepIndicator from '@/components/ui/WizardStepIndicator'
import WizardStepFloating from '@/components/ui/WizardStepFloating'
import ToggleFeatureCard from '@/components/ui/ToggleFeatureCard'

const features = [
  {
    icon: <ArrowLeftRight size={18} className="text-blue-400" />,
    iconBg: 'rgba(59,130,246,0.2)',
    title: 'Transferable',
    description: 'Enable peer-to-peer token transfers. When disabled, all transfers will revert.',
    defaultEnabled: true,
  },
  {
    icon: <Users size={18} className="text-green-400" />,
    iconBg: 'rgba(34,197,94,0.2)',
    title: 'Public',
    description: 'Anyone can freely buy and sell these tokens.',
    defaultEnabled: true,
  },
  {
    icon: <PauseCircle size={18} className="text-amber-400" />,
    iconBg: 'rgba(245,158,11,0.2)',
    title: 'Pausable',
    description: 'Emergency halt — freeze all transfers and mint actions when triggered.',
    defaultEnabled: true,
  },
  {
    icon: <Plus size={18} className="text-pink-400" />,
    iconBg: 'rgba(236,72,153,0.2)',
    title: 'Mintable',
    description: 'Allow minting new tokens (Max Cap or Unlimited). Requires selecting a minting rule.',
    defaultEnabled: false,
  },
  {
    icon: <Flame size={18} className="text-orange-400" />,
    iconBg: 'rgba(249,115,22,0.2)',
    title: 'Burnable',
    description: 'Destroy tokens — total supply decreases permanently when tokens are burned.',
    defaultEnabled: false,
  },
]

const inputStyle = {
  height: '36px',
  padding: '4px 12px',
  borderRadius: '6px',
  border: '1px solid var(--border-color)',
  backgroundColor: 'transparent',
  width: '100%',
  fontSize: '14px',
  color: '#f8fafc',
}

const selectStyle = {
  height: '36px',
  padding: '4px 12px',
  borderRadius: '6px',
  border: '1px solid var(--border-color)',
  backgroundColor: 'var(--bg-input)',
  width: '100%',
  fontSize: '14px',
  color: '#94a3b8',
}

const labelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '14px',
  fontWeight: 500,
  color: '#f8fafc',
  marginBottom: '8px',
}

export default function CreateTokenPage() {
  const [currentStep] = useState(0)

  return (
    <div className="flex flex-col pb-12 overflow-x-hidden" style={{ gap: '16px' }}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: '30px', fontWeight: 700, color: '#ffffff' }}>Create New Asset</h1>
        <p style={{ fontSize: '16px', color: '#94a3b8', marginTop: '4px' }}>
          Deploy a fully compliant RWA token with detailed product configuration
        </p>
      </div>

      {/* Step Indicator */}
      <WizardStepIndicator currentStep={currentStep} />

      {/* Single Card */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '24px',
        }}
      >
        {/* Card Header */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#f8fafc', marginBottom: '8px' }}>
            Basics &amp; Configuration
          </h2>
          <p style={{ fontSize: '16px', color: '#94a3b8' }}>
            Deploy a fully compliant RWA token with detailed product configuration
          </p>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', backgroundColor: 'var(--border-color)', marginBottom: '24px' }} />

        {/* Form Sections */}
        <div className="flex flex-col" style={{ gap: '32px' }}>

          {/* Row 1: Token Icon + Asset Name / Token Ticker */}
          <div className="flex flex-col md:flex-row" style={{ gap: '24px' }}>
            {/* Token Icon */}
            <div>
              <label style={labelStyle}>
                Token Icon
                <HelpCircle size={13} className="text-gray-500" />
              </label>
              <div
                className="flex flex-col items-center justify-center cursor-pointer hover:bg-white/[0.04] transition-colors"
                style={{
                  width: '131px',
                  height: '131px',
                  borderRadius: '16px',
                  border: '2px dashed var(--border-color)',
                  backgroundColor: 'var(--bg-input)',
                  gap: '8px',
                }}
              >
                <Upload size={20} className="text-gray-500" />
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Click to upload</span>
              </div>
            </div>

            {/* Asset Name + Token Ticker */}
            <div className="flex flex-col flex-1" style={{ gap: '16px' }}>
              {/* Asset Name */}
              <div>
                <label style={{ ...labelStyle, justifyContent: 'space-between' }}>
                  <span className="flex items-center" style={{ gap: '6px' }}>
                    Asset Name <span className="text-red-400">*</span>
                    <HelpCircle size={13} className="text-gray-500" />
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>0/120</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Luxury Real Estate Token"
                  className="focus:outline-none placeholder-slate-400"
                  style={inputStyle}
                />
              </div>

              {/* Token Ticker */}
              <div>
                <label style={labelStyle}>
                  Token Ticker <span className="text-red-400">*</span>
                  <HelpCircle size={13} className="text-gray-500" />
                </label>
                <input
                  type="text"
                  placeholder="E.G., LRET"
                  className="focus:outline-none placeholder-slate-400"
                  style={inputStyle}
                />
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                  3-12 characters. Letters, numbers and &lt; &gt; ! @ # % * / . $ _ - allowed.
                </p>
              </div>
            </div>
          </div>

          {/* Row 2: Token Model (half width) */}
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '16px' }}>
            <div>
              <label style={labelStyle}>
                Token Model <span className="text-red-400">*</span>
                <HelpCircle size={13} className="text-gray-500" />
              </label>
              <select className="focus:outline-none" style={selectStyle}>
                <option value="">Select token model</option>
                <option value="STABLECOIN">Stablecoin</option>
                <option value="UTILITY_TOKEN">Utility Token</option>
                <option value="REAL_WORLD_ASSETS_TOKEN">Real World Assets Token</option>
                <option value="GOVERNANCE_TOKEN">Governance Token</option>
                <option value="REVENUE_SHARE_TOKEN">Revenue Share Token</option>
              </select>
            </div>
          </div>

          {/* Row 3: Initial Supply (half width) */}
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '16px' }}>
            <div>
              <label style={labelStyle}>
                Initial Supply <span className="text-red-400">*</span>
                <HelpCircle size={13} className="text-gray-500" />
              </label>
              <input
                type="text"
                placeholder="1,000,000"
                className="focus:outline-none placeholder-slate-400"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Row 4: Decimal + Blockchain Network */}
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '16px' }}>
            <div>
              <label style={labelStyle}>
                Decimal <span className="text-red-400">*</span>
                <HelpCircle size={13} className="text-gray-500" />
              </label>
              <input
                type="text"
                placeholder="input decimal"
                className="focus:outline-none placeholder-slate-400"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>
                Blockchain Network <span className="text-red-400">*</span>
                <HelpCircle size={13} className="text-gray-500" />
              </label>
              <select className="focus:outline-none" style={selectStyle}>
                <option value="">Select network</option>
                <option value="ETHEREUM">Ethereum</option>
                <option value="BNB_CHAIN">BNB Chain</option>
                <option value="BASE">Base</option>
                <option value="SEPOLIA">Sepolia</option>
                <option value="BNB_CHAIN_TESTNET">BNB Chain Testnet</option>
                <option value="BASE_SEPOLIA">Base Sepolia</option>
              </select>
            </div>
          </div>

          {/* Row 5: Investor Type + Legal Jurisdiction */}
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '16px' }}>
            <div>
              <label style={labelStyle}>
                Investor Type <span className="text-red-400">*</span>
                <HelpCircle size={13} className="text-gray-500" />
              </label>
              <select className="focus:outline-none" style={selectStyle}>
                <option value="">Select investor type</option>
                <option value="ACCREDITED">Accredited</option>
                <option value="RETAIL">Retail</option>
                <option value="WHITELISTED">Whitelisted</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>
                Legal Jurisdiction <span className="text-red-400">*</span>
                <HelpCircle size={13} className="text-gray-500" />
              </label>
              <select className="focus:outline-none" style={selectStyle}>
                <option value="">Select jurisdiction</option>
                <option value="US">United States</option>
                <option value="EU">European Union</option>
                <option value="UK">United Kingdom</option>
                <option value="SINGAPORE">Singapore</option>
                <option value="CAYMAN_ISLANDS">Cayman Islands</option>
                <option value="SWITZERLAND">Switzerland</option>
                <option value="UAE">United Arab Emirates</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          {/* Advance Smart Contract Controls */}
          <div className="flex flex-col" style={{ gap: '24px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#f8fafc', marginBottom: '4px' }}>
                Advance Smart Contract Controls
              </h3>
              <p style={{ fontSize: '14px', color: '#94a3b8' }}>
                Setting your advance smart contract
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: '16px' }}>
              {features.map((f) => (
                <ToggleFeatureCard key={f.title} {...f} />
              ))}
            </div>
          </div>
        </div>

        {/* Continue button — inside the card with top border */}
        <div
          className="flex items-center justify-end"
          style={{
            gap: '12px',
            marginTop: '32px',
            paddingTop: '24px',
            borderTop: '1px solid var(--border-color)',
          }}
        >
          <button
            className="flex items-center gap-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{
              backgroundColor: '#4f46e5',
              borderRadius: '6px',
              height: '40px',
              padding: '8px 16px',
            }}
          >
            Continue
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* Floating Step Counter */}
      <WizardStepFloating currentStep={currentStep} />
    </div>
  )
}
