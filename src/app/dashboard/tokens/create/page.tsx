'use client'
import { useState } from 'react'
import { Upload, HelpCircle, ArrowRight } from 'lucide-react'
import { ArrowLeftRight, Users, PauseCircle, Plus, Flame } from 'lucide-react'
import WizardStepIndicator from '@/components/ui/WizardStepIndicator'
import WizardStepFloating from '@/components/ui/WizardStepFloating'
import ToggleFeatureCard from '@/components/ui/ToggleFeatureCard'

const features = [
  {
    icon: <ArrowLeftRight size={18} style={{ color: 'var(--fk-info)' }} />,
    iconBg: 'var(--fk-info-tint)',
    title: 'Transferable',
    description: 'Enable peer-to-peer token transfers. When disabled, all transfers will revert.',
    defaultEnabled: true,
  },
  {
    icon: <Users size={18} style={{ color: 'var(--fk-gain)' }} />,
    iconBg: 'var(--fk-gain-tint)',
    title: 'Public',
    description: 'Anyone can freely buy and sell these tokens.',
    defaultEnabled: true,
  },
  {
    icon: <PauseCircle size={18} style={{ color: 'var(--fk-warn)' }} />,
    iconBg: 'var(--fk-warn-tint)',
    title: 'Pausable',
    description: 'Emergency halt — freeze all transfers and mint actions when triggered.',
    defaultEnabled: true,
  },
  {
    icon: <Plus size={18} style={{ color: 'var(--fk-cat-5)' }} />,
    iconBg: 'rgba(217,123,196,.15)',
    title: 'Mintable',
    description: 'Allow minting new tokens (Max Cap or Unlimited). Requires selecting a minting rule.',
    defaultEnabled: false,
  },
  {
    icon: <Flame size={18} style={{ color: 'var(--fk-cat-6)' }} />,
    iconBg: 'rgba(217,142,107,.15)',
    title: 'Burnable',
    description: 'Destroy tokens — total supply decreases permanently when tokens are burned.',
    defaultEnabled: false,
  },
]

const inputStyle = {
  height: '38px',
  padding: '4px 14px',
  borderRadius: 'var(--r-md)',
  border: '1px solid var(--glass-border)',
  boxShadow: 'inset 0 2px 4px rgba(0,0,0,.3)',
  backgroundColor: 'var(--fk-surface-1)',
  width: '100%',
  fontSize: '14px',
  color: 'var(--fk-text-hi)',
}

const selectStyle = {
  ...inputStyle,
  color: 'var(--fk-text-mid)',
}

const labelStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '13px',
  fontWeight: 600,
  color: 'var(--fk-text-mid)',
  marginBottom: '8px',
}

export default function CreateTokenPage() {
  const [currentStep] = useState(0)

  return (
    <div className="flex flex-col pb-12 overflow-x-hidden" style={{ gap: '16px' }}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, letterSpacing: '-.01em', color: 'var(--fk-text-hi)' }}>Create New Asset</h1>
        <p style={{ fontSize: '15px', color: 'var(--fk-text-mid)', marginTop: '4px' }}>
          Deploy a fully compliant RWA token with detailed product configuration
        </p>
      </div>

      {/* Step Indicator */}
      <WizardStepIndicator currentStep={currentStep} />

      {/* Single Card */}
      <div
        style={{
          backgroundColor: 'var(--fk-surface-1)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--r-lg)',
          padding: '24px',
        }}
      >
        {/* Card Header */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 600, color: 'var(--fk-text-hi)', marginBottom: '8px' }}>
            Basics &amp; Configuration
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--fk-text-mid)' }}>
            Deploy a fully compliant RWA token with detailed product configuration
          </p>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', backgroundColor: 'var(--fk-line-soft)', marginBottom: '24px' }} />

        {/* Form Sections */}
        <div className="flex flex-col" style={{ gap: '32px' }}>

          {/* Row 1: Token Icon + Asset Name / Token Ticker */}
          <div className="flex flex-col md:flex-row" style={{ gap: '24px' }}>
            {/* Token Icon */}
            <div>
              <label style={labelStyle}>
                Token Icon
                <HelpCircle size={13} style={{ color: 'var(--fk-text-low)' }} />
              </label>
              <div
                className="flex flex-col items-center justify-center cursor-pointer transition-colors"
                style={{
                  width: '131px',
                  height: '131px',
                  borderRadius: 'var(--r-lg)',
                  border: '2px dashed var(--fk-line)',
                  backgroundColor: 'var(--fk-surface-1)',
                  gap: '8px',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--fk-surface-2)' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--fk-surface-1)' }}
              >
                <Upload size={20} style={{ color: 'var(--fk-text-low)' }} />
                <span style={{ fontSize: '12px', color: 'var(--fk-text-low)' }}>Click to upload</span>
              </div>
            </div>

            {/* Asset Name + Token Ticker */}
            <div className="flex flex-col flex-1" style={{ gap: '16px' }}>
              {/* Asset Name */}
              <div>
                <label style={{ ...labelStyle, justifyContent: 'space-between' }}>
                  <span className="flex items-center" style={{ gap: '6px' }}>
                    Asset Name <span style={{ color: 'var(--fk-loss)' }}>*</span>
                    <HelpCircle size={13} style={{ color: 'var(--fk-text-low)' }} />
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--fk-text-low)' }}>0/120</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Luxury Real Estate Token"
                  className="focus:outline-none fk-input"
                  style={inputStyle}
                />
              </div>

              {/* Token Ticker */}
              <div>
                <label style={labelStyle}>
                  Token Ticker <span style={{ color: 'var(--fk-loss)' }}>*</span>
                  <HelpCircle size={13} style={{ color: 'var(--fk-text-low)' }} />
                </label>
                <input
                  type="text"
                  placeholder="E.G., LRET"
                  className="focus:outline-none fk-input"
                  style={inputStyle}
                />
                <p style={{ fontSize: '12px', color: 'var(--fk-text-low)', marginTop: '6px' }}>
                  3-12 characters. Letters, numbers and &lt; &gt; ! @ # % * / . $ _ - allowed.
                </p>
              </div>
            </div>
          </div>

          {/* Row 2: Token Model (half width) */}
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '16px' }}>
            <div>
              <label style={labelStyle}>
                Token Model <span style={{ color: 'var(--fk-loss)' }}>*</span>
                <HelpCircle size={13} style={{ color: 'var(--fk-text-low)' }} />
              </label>
              <select className="focus:outline-none fk-input" style={selectStyle}>
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
                Initial Supply <span style={{ color: 'var(--fk-loss)' }}>*</span>
                <HelpCircle size={13} style={{ color: 'var(--fk-text-low)' }} />
              </label>
              <input
                type="text"
                placeholder="1,000,000"
                className="focus:outline-none fk-input fk-mono"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Row 4: Decimal + Blockchain Network */}
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: '16px' }}>
            <div>
              <label style={labelStyle}>
                Decimal <span style={{ color: 'var(--fk-loss)' }}>*</span>
                <HelpCircle size={13} style={{ color: 'var(--fk-text-low)' }} />
              </label>
              <input
                type="text"
                placeholder="input decimal"
                className="focus:outline-none fk-input"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>
                Blockchain Network <span style={{ color: 'var(--fk-loss)' }}>*</span>
                <HelpCircle size={13} style={{ color: 'var(--fk-text-low)' }} />
              </label>
              <select className="focus:outline-none fk-input" style={selectStyle}>
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
                Investor Type <span style={{ color: 'var(--fk-loss)' }}>*</span>
                <HelpCircle size={13} style={{ color: 'var(--fk-text-low)' }} />
              </label>
              <select className="focus:outline-none fk-input" style={selectStyle}>
                <option value="">Select investor type</option>
                <option value="ACCREDITED">Accredited</option>
                <option value="RETAIL">Retail</option>
                <option value="WHITELISTED">Whitelisted</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>
                Legal Jurisdiction <span style={{ color: 'var(--fk-loss)' }}>*</span>
                <HelpCircle size={13} style={{ color: 'var(--fk-text-low)' }} />
              </label>
              <select className="focus:outline-none fk-input" style={selectStyle}>
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
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 600, color: 'var(--fk-text-hi)', marginBottom: '4px' }}>
                Advance Smart Contract Controls
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--fk-text-mid)' }}>
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
            borderTop: '1px solid var(--fk-line-soft)',
          }}
        >
          <button className="fk-btn fk-btn-primary">
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
