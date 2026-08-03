'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { 
  ArrowLeft, UploadCloud, CheckCircle2, 
  Building, FileText, Briefcase, 
  Check, User, MapPin, BadgeCheck,
  ShieldCheck, Camera, XCircle, CreditCard,
  Book, Car, FileSignature, Users, Plus, Trash2, Mail
} from 'lucide-react'
import Link from 'next/link'

// Excluded: China, Afghanistan, Algeria, Bangladesh, Egypt, Nepal, Morocco, Tunisia, Qatar
const ALLOWED_COUNTRIES = [
  { name: 'Australia', flag: '🇦🇺' },
  { name: 'Brazil', flag: '🇧🇷' },
  { name: 'Canada', flag: '🇨🇦' },
  { name: 'France', flag: '🇫🇷' },
  { name: 'Germany', flag: '🇩🇪' },
  { name: 'India', flag: '🇮🇳' },
  { name: 'Indonesia', flag: '🇮🇩' },
  { name: 'Japan', flag: '🇯🇵' },
  { name: 'Malaysia', flag: '🇲🇾' },
  { name: 'Mexico', flag: '🇲🇽' },
  { name: 'Singapore', flag: '🇸🇬' },
  { name: 'South Africa', flag: '🇿🇦' },
  { name: 'South Korea', flag: '🇰🇷' },
  { name: 'United Arab Emirates', flag: '🇦🇪' },
  { name: 'United Kingdom', flag: '🇬🇧' },
  { name: 'United States', flag: '🇺🇸' }
].sort((a, b) => a.name.localeCompare(b.name))

const DOC_TYPES = [
  { id: 'id_card', label: 'ID card', icon: CreditCard },
  { id: 'residence_permit', label: 'Residence permit', icon: FileSignature },
  { id: 'passport', label: 'Passport', icon: Book },
  { id: 'driver_license', label: 'Driver’s license', icon: Car },
]

export default function InstitutionalKybPage() {
  const router = useRouter()
  const TOTAL_STEPS = 6
  const [step, setStep] = useState(1)
  
  // Phase 1: Personal KYC
  const [personalCountry, setPersonalCountry] = useState('Singapore')
  const [docType, setDocType] = useState('id_card')
  const [personalUploadStatus, setPersonalUploadStatus] = useState<'idle' | 'uploading' | 'success'>('idle')
  const personalFileInputRef = useRef<HTMLInputElement>(null)
  
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [idNumber, setIdNumber] = useState('')
  const [repRole, setRepRole] = useState('')

  // Phase 2: Authorization
  const [isDirector, setIsDirector] = useState<boolean | null>(null)
  const [authUploadStatus, setAuthUploadStatus] = useState<'idle' | 'uploading' | 'success'>('idle')
  const authFileInputRef = useRef<HTMLInputElement>(null)

  // Phase 3: Entity Details
  const [entityCountry, setEntityCountry] = useState('Singapore')
  const [entityName, setEntityName] = useState('')
  const [regNumber, setRegNumber] = useState('')
  const [address, setAddress] = useState('')
  const [entityUploadStatus, setEntityUploadStatus] = useState<'idle' | 'uploading' | 'success'>('idle')
  const entityFileInputRef = useRef<HTMLInputElement>(null)
  
  // Phase 4: Directors & UBOs
  const [ubos, setUbos] = useState([{ name: '', email: '' }])

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleNext = () => setStep(prev => prev + 1)
  const handleBack = () => setStep(prev => prev - 1)

  const addUbo = () => setUbos([...ubos, { name: '', email: '' }])
  const removeUbo = (index: number) => setUbos(ubos.filter((_, i) => i !== index))
  const updateUbo = (index: number, field: 'name'|'email', value: string) => {
    const newUbos = [...ubos]
    newUbos[index][field] = value
    setUbos(newUbos)
  }

  const simulateUpload = (setter: React.Dispatch<React.SetStateAction<any>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setter('uploading')
      setTimeout(() => {
        setter('success')
      }, 1500)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setTimeout(() => {
      router.push('/investor/onboarding/pending')
    }, 2000)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--fk-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 24px', position: 'relative', overflowX: 'hidden' }}>
      
      {/* Background glow */}
      <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, var(--fk-blue-tint) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 480, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          {step === 1 ? (
            <Link href="/investor/onboarding" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--fk-text-mid)', fontSize: 14, textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }}>
              <ArrowLeft size={16} /> Back to selection
            </Link>
          ) : (
            <button onClick={handleBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--fk-text-mid)', fontSize: 14, textDecoration: 'none', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <ArrowLeft size={16} /> Back
            </button>
          )}
          
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fk-text-low)', letterSpacing: '.05em' }}>
            STEP {step} OF {TOTAL_STEPS}
          </div>
        </div>

        <div style={{ background: 'var(--fk-surface-1)', border: '1px solid var(--glass-border)', borderRadius: 24, padding: '40px 32px', position: 'relative', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
          
          {/* Progress bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'var(--fk-surface-2)' }}>
            <motion.div 
              style={{ height: '100%', background: 'linear-gradient(90deg, var(--fk-blue), var(--fk-gain))' }}
              initial={{ width: `${((step - 1) / TOTAL_STEPS) * 100}%` }}
              animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <AnimatePresence mode="wait">
            
            {/* STEP 1: Preparation */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(46,92,255,.2), rgba(46,92,255,.05))', border: '1px solid rgba(46,92,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                    <Building size={32} color="var(--fk-blue)" />
                  </div>
                  <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--fk-text-hi)', marginBottom: 12 }}>
                    Institutional Verification
                  </h1>
                  <p style={{ fontSize: 15, color: 'var(--fk-text-mid)' }}>
                    To comply with AML/CTF regulations, we require both personal verification for the representative and legal documents for the entity.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', background: 'var(--fk-surface-2)', borderRadius: 16, border: '1px solid var(--fk-line)' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--fk-surface-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <User size={20} color="var(--fk-text-hi)" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: 15, fontWeight: 600, color: 'var(--fk-text-hi)' }}>Phase 1: Personal KYC</h4>
                      <p style={{ fontSize: 13, color: 'var(--fk-text-mid)' }}>Your personal ID and Liveness check.</p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', background: 'var(--fk-surface-2)', borderRadius: 16, border: '1px solid var(--fk-line)' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--fk-surface-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Briefcase size={20} color="var(--fk-text-hi)" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: 15, fontWeight: 600, color: 'var(--fk-text-hi)' }}>Phase 2: Corporate KYB</h4>
                      <p style={{ fontSize: 13, color: 'var(--fk-text-mid)' }}>Entity details and official documents.</p>
                    </div>
                  </div>
                </div>

                <button onClick={handleNext} className="fk-btn fk-btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: 16, borderRadius: 12, background: 'var(--fk-blue)', color: '#fff' }}>
                  Begin Onboarding
                </button>
              </motion.div>
            )}

            {/* STEP 2: Document Selection (Personal) */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--fk-text-hi)', marginBottom: 8 }}>Personal Verification</h2>
                <p style={{ fontSize: 14, color: 'var(--fk-text-mid)', marginBottom: 28 }}>Choose your issuing country and identity document type.</p>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--fk-text-hi)', marginBottom: 12 }}>Issuing country</label>
                  <select 
                    value={personalCountry}
                    onChange={(e) => setPersonalCountry(e.target.value)}
                    style={{ 
                      width: '100%', padding: '14px 16px', background: 'var(--fk-surface-2)', 
                      border: '1px solid var(--fk-line)', borderRadius: 12, color: 'var(--fk-text-hi)', 
                      fontSize: 15, outline: 'none', appearance: 'none', cursor: 'pointer'
                    }}
                  >
                    {ALLOWED_COUNTRIES.map(c => (
                      <option key={c.name} value={c.name}>{c.flag} {c.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: 32 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--fk-text-hi)', marginBottom: 12 }}>Upload document</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {DOC_TYPES.map(type => (
                      <label key={type.id} style={{ 
                        display: 'flex', alignItems: 'center', gap: 12, padding: '16px', 
                        background: docType === type.id ? 'rgba(46,92,255,.05)' : 'var(--fk-surface-2)', 
                        border: `1px solid ${docType === type.id ? 'var(--fk-blue)' : 'var(--fk-line)'}`, 
                        borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s' 
                      }}>
                        <div style={{ 
                          width: 20, height: 20, borderRadius: '50%', border: `2px solid ${docType === type.id ? 'var(--fk-blue)' : 'var(--fk-text-low)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          {docType === type.id && <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--fk-blue)' }} />}
                        </div>
                        <input 
                          type="radio" 
                          name="docType" 
                          value={type.id} 
                          checked={docType === type.id} 
                          onChange={() => setDocType(type.id)}
                          style={{ display: 'none' }} 
                        />
                        <type.icon size={20} color={docType === type.id ? 'var(--fk-blue)' : 'var(--fk-text-mid)'} />
                        <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--fk-text-hi)' }}>{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button onClick={handleNext} className="fk-btn fk-btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: 16, borderRadius: 12, background: 'var(--fk-blue)', color: '#fff' }}>
                  Next Step
                </button>
              </motion.div>
            )}

            {/* STEP 3: Upload Document (Personal) */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--fk-text-hi)', marginBottom: 8 }}>Upload your {DOC_TYPES.find(d => d.id === docType)?.label}</h2>
                <p style={{ fontSize: 14, color: 'var(--fk-text-mid)', marginBottom: 28 }}>Please ensure the document is clear and readable.</p>

                <div style={{ background: 'var(--fk-surface-2)', borderRadius: 16, padding: '24px', marginBottom: 28, border: '1px solid var(--fk-line)' }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--fk-text-hi)', marginBottom: 16 }}>Tips for a good photo</h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'var(--fk-text-mid)' }}>
                      <CheckCircle2 size={16} color="#25D48A" style={{ flexShrink: 0, marginTop: 2 }} />
                      Upload a color photo or file
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'var(--fk-text-mid)' }}>
                      <CheckCircle2 size={16} color="#25D48A" style={{ flexShrink: 0, marginTop: 2 }} />
                      Take the photo in a well lit room
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: 'var(--fk-text-mid)' }}>
                      <XCircle size={16} color="#FF4B4B" style={{ flexShrink: 0, marginTop: 2 }} />
                      Don't edit images of your document
                    </li>
                  </ul>
                </div>

                <input 
                  type="file" 
                  ref={personalFileInputRef} 
                  onChange={simulateUpload(setPersonalUploadStatus)} 
                  accept="image/jpeg, image/png, application/pdf" 
                  style={{ display: 'none' }} 
                />

                <div 
                  onClick={() => personalUploadStatus === 'idle' && personalFileInputRef.current?.click()}
                  style={{ 
                    border: `2px dashed ${personalUploadStatus === 'success' ? '#25D48A' : 'var(--fk-blue)'}`, 
                    borderRadius: 16, padding: '40px 24px', textAlign: 'center', 
                    background: personalUploadStatus === 'success' ? 'rgba(37,212,138,.05)' : 'rgba(46,92,255,.05)', 
                    cursor: personalUploadStatus === 'idle' ? 'pointer' : 'default',
                    marginBottom: 32, transition: 'all 0.3s'
                  }}
                >
                  {personalUploadStatus === 'idle' && (
                    <>
                      <UploadCloud size={32} color="var(--fk-blue)" style={{ margin: '0 auto 16px' }} />
                      <h4 style={{ fontSize: 16, fontWeight: 600, color: 'var(--fk-blue)', marginBottom: 8 }}>Click to upload document</h4>
                      <p style={{ fontSize: 13, color: 'var(--fk-text-mid)' }}>Front, Back & Selfie (JPEG, PNG, PDF)</p>
                    </>
                  )}
                  {personalUploadStatus === 'uploading' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div className="spinner" style={{ width: 32, height: 32, border: '3px solid rgba(46,92,255,.2)', borderTopColor: 'var(--fk-blue)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: 16 }} />
                      <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--fk-text-hi)' }}>Uploading...</p>
                    </div>
                  )}
                  {personalUploadStatus === 'success' && (
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                      <CheckCircle2 size={36} color="#25D48A" style={{ margin: '0 auto 16px' }} />
                      <h4 style={{ fontSize: 16, fontWeight: 600, color: '#25D48A', marginBottom: 4 }}>Identity verified</h4>
                      <p style={{ fontSize: 13, color: 'var(--fk-text-mid)' }}>Ready to proceed</p>
                    </motion.div>
                  )}
                </div>

                <button 
                  onClick={handleNext} 
                  disabled={personalUploadStatus !== 'success'}
                  className="fk-btn fk-btn-primary" 
                  style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: 16, borderRadius: 12, background: personalUploadStatus === 'success' ? 'var(--fk-blue)' : 'var(--fk-surface-3)', color: personalUploadStatus === 'success' ? '#fff' : 'var(--fk-text-low)', opacity: personalUploadStatus === 'success' ? 1 : 0.5 }}
                >
                  Continue
                </button>
              </motion.div>
            )}

            {/* STEP 4: Personal Verification details */}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--fk-text-hi)', marginBottom: 8 }}>Verify your details</h2>
                <p style={{ fontSize: 14, color: 'var(--fk-text-mid)', marginBottom: 28 }}>Please enter your personal details exactly as they appear on your document.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 32 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--fk-text-low)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.05em' }}>First Name</label>
                    <input 
                      type="text" 
                      required 
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      placeholder="e.g. Satoshi" 
                      style={{ width: '100%', padding: '14px 16px', background: 'var(--fk-surface-2)', border: '1px solid var(--fk-line)', borderRadius: 12, color: 'var(--fk-text-hi)', fontSize: 15, outline: 'none', transition: 'border-color 0.2s' }}
                      onFocus={e => e.target.style.borderColor = 'var(--fk-blue)'}
                      onBlur={e => e.target.style.borderColor = 'var(--fk-line)'}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--fk-text-low)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.05em' }}>Last Name</label>
                    <input 
                      type="text" 
                      required 
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      placeholder="e.g. Nakamoto" 
                      style={{ width: '100%', padding: '14px 16px', background: 'var(--fk-surface-2)', border: '1px solid var(--fk-line)', borderRadius: 12, color: 'var(--fk-text-hi)', fontSize: 15, outline: 'none', transition: 'border-color 0.2s' }}
                      onFocus={e => e.target.style.borderColor = 'var(--fk-blue)'}
                      onBlur={e => e.target.style.borderColor = 'var(--fk-line)'}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--fk-text-low)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.05em' }}>
                      {DOC_TYPES.find(d => d.id === docType)?.label} Number
                    </label>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', top: '50%', left: 16, transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
                        <CreditCard size={18} color="var(--fk-text-low)" />
                      </div>
                      <input 
                        type="text" 
                        required 
                        value={idNumber}
                        onChange={e => setIdNumber(e.target.value.toUpperCase())}
                        placeholder="Document ID Number" 
                        style={{ width: '100%', padding: '14px 16px 14px 44px', background: 'var(--fk-surface-2)', border: '1px solid var(--fk-line)', borderRadius: 12, color: 'var(--fk-text-hi)', fontSize: 15, outline: 'none', transition: 'border-color 0.2s', letterSpacing: '.05em' }}
                        onFocus={e => e.target.style.borderColor = 'var(--fk-blue)'}
                        onBlur={e => e.target.style.borderColor = 'var(--fk-line)'}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--fk-text-low)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.05em' }}>Company Role / Title</label>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', top: '50%', left: 16, transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
                        <BadgeCheck size={18} color="var(--fk-text-low)" />
                      </div>
                      <input 
                        type="text" 
                        required 
                        value={repRole}
                        onChange={e => setRepRole(e.target.value)}
                        placeholder="e.g. CEO, CFO, Compliance Officer" 
                        style={{ width: '100%', padding: '14px 16px 14px 44px', background: 'var(--fk-surface-2)', border: '1px solid var(--fk-line)', borderRadius: 12, color: 'var(--fk-text-hi)', fontSize: 15, outline: 'none', transition: 'border-color 0.2s' }}
                        onFocus={e => e.target.style.borderColor = 'var(--fk-blue)'}
                        onBlur={e => e.target.style.borderColor = 'var(--fk-line)'}
                      />
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleNext} 
                  disabled={!firstName || !lastName || !idNumber || !repRole}
                  className="fk-btn fk-btn-primary" 
                  style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: 16, borderRadius: 12, background: (!firstName || !lastName || !idNumber || !repRole) ? 'var(--fk-surface-3)' : 'var(--fk-blue)', color: (!firstName || !lastName || !idNumber || !repRole) ? 'var(--fk-text-low)' : '#fff', opacity: (!firstName || !lastName || !idNumber || !repRole) ? 0.5 : 1 }}
                >
                  Continue to Entity Details
                </button>
              </motion.div>
            )}

            {/* STEP 5: Authorization */}
            {step === 5 && (
              <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--fk-text-hi)', marginBottom: 8 }}>Authorization</h2>
                <p style={{ fontSize: 14, color: 'var(--fk-text-mid)', marginBottom: 28 }}>Are you a registered Director of this company?</p>

                <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                  <button 
                    onClick={() => setIsDirector(true)}
                    style={{ flex: 1, padding: '16px', background: isDirector === true ? 'rgba(46,92,255,.1)' : 'var(--fk-surface-2)', border: `1px solid ${isDirector === true ? 'var(--fk-blue)' : 'var(--fk-line)'}`, borderRadius: 12, color: 'var(--fk-text-hi)', fontSize: 15, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    Yes, I am a Director
                  </button>
                  <button 
                    onClick={() => setIsDirector(false)}
                    style={{ flex: 1, padding: '16px', background: isDirector === false ? 'rgba(46,92,255,.1)' : 'var(--fk-surface-2)', border: `1px solid ${isDirector === false ? 'var(--fk-blue)' : 'var(--fk-line)'}`, borderRadius: 12, color: 'var(--fk-text-hi)', fontSize: 15, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    No, I am not
                  </button>
                </div>

                <AnimatePresence>
                  {isDirector === false && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                      <div style={{ marginBottom: 32 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--fk-text-hi)', marginBottom: 12 }}>Upload Letter of Authorization</label>
                        <p style={{ fontSize: 13, color: 'var(--fk-text-mid)', marginBottom: 16 }}>Since you are not a registered Director, we require a signed letter of authorization empowering you to open an account on behalf of the company.</p>
                        
                        <input 
                          type="file" 
                          ref={authFileInputRef} 
                          onChange={simulateUpload(setAuthUploadStatus)} 
                          accept="application/pdf" 
                          style={{ display: 'none' }} 
                        />

                        <div 
                          onClick={() => authUploadStatus === 'idle' && authFileInputRef.current?.click()}
                          style={{ 
                            border: `2px dashed ${authUploadStatus === 'success' ? '#25D48A' : 'var(--fk-line)'}`, 
                            borderRadius: 16, padding: '24px', textAlign: 'center', 
                            background: authUploadStatus === 'success' ? 'rgba(37,212,138,.05)' : 'var(--fk-surface-2)', 
                            cursor: authUploadStatus === 'idle' ? 'pointer' : 'default',
                            transition: 'all 0.3s'
                          }}
                        >
                          {authUploadStatus === 'idle' && (
                            <>
                              <UploadCloud size={24} color="var(--fk-text-mid)" style={{ margin: '0 auto 12px' }} />
                              <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--fk-text-hi)', marginBottom: 4 }}>Upload Authorization PDF</h4>
                            </>
                          )}
                          {authUploadStatus === 'uploading' && (
                            <div className="spinner" style={{ width: 24, height: 24, border: '2px solid rgba(46,92,255,.2)', borderTopColor: 'var(--fk-blue)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                          )}
                          {authUploadStatus === 'success' && (
                            <CheckCircle2 size={28} color="#25D48A" style={{ margin: '0 auto' }} />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button 
                  onClick={handleNext} 
                  disabled={isDirector === null || (isDirector === false && authUploadStatus !== 'success')}
                  className="fk-btn fk-btn-primary" 
                  style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: 16, borderRadius: 12, background: (isDirector === null || (isDirector === false && authUploadStatus !== 'success')) ? 'var(--fk-surface-3)' : 'var(--fk-blue)', color: (isDirector === null || (isDirector === false && authUploadStatus !== 'success')) ? 'var(--fk-text-low)' : '#fff', opacity: (isDirector === null || (isDirector === false && authUploadStatus !== 'success')) ? 0.5 : 1 }}
                >
                  Continue
                </button>
              </motion.div>
            )}

            {/* STEP 6: Entity Details */}
            {step === 6 && (
              <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--fk-text-hi)', marginBottom: 8 }}>Entity Details</h2>
                <p style={{ fontSize: 14, color: 'var(--fk-text-mid)', marginBottom: 28 }}>Please enter your company's legal information.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 28 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--fk-text-hi)', marginBottom: 12 }}>Jurisdiction</label>
                    <select 
                      value={entityCountry}
                      onChange={(e) => setEntityCountry(e.target.value)}
                      style={{ 
                        width: '100%', padding: '14px 16px', background: 'var(--fk-surface-2)', 
                        border: '1px solid var(--fk-line)', borderRadius: 12, color: 'var(--fk-text-hi)', 
                        fontSize: 15, outline: 'none', appearance: 'none', cursor: 'pointer'
                      }}
                    >
                      {ALLOWED_COUNTRIES.map(c => (
                        <option key={c.name} value={c.name}>{c.flag} {c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--fk-text-low)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.05em' }}>Legal Entity Name</label>
                    <input 
                      type="text" 
                      required 
                      value={entityName}
                      onChange={e => setEntityName(e.target.value)}
                      placeholder="e.g. Frakta Capital Ltd." 
                      style={{ width: '100%', padding: '14px 16px', background: 'var(--fk-surface-2)', border: '1px solid var(--fk-line)', borderRadius: 12, color: 'var(--fk-text-hi)', fontSize: 15, outline: 'none', transition: 'border-color 0.2s' }}
                      onFocus={e => e.target.style.borderColor = 'var(--fk-blue)'}
                      onBlur={e => e.target.style.borderColor = 'var(--fk-line)'}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--fk-text-low)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.05em' }}>Registration Number</label>
                    <input 
                      type="text" 
                      required 
                      value={regNumber}
                      onChange={e => setRegNumber(e.target.value)}
                      placeholder="Company Registration Number" 
                      style={{ width: '100%', padding: '14px 16px', background: 'var(--fk-surface-2)', border: '1px solid var(--fk-line)', borderRadius: 12, color: 'var(--fk-text-hi)', fontSize: 15, outline: 'none', transition: 'border-color 0.2s', letterSpacing: '.05em' }}
                      onFocus={e => e.target.style.borderColor = 'var(--fk-blue)'}
                      onBlur={e => e.target.style.borderColor = 'var(--fk-line)'}
                    />
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--fk-line)', margin: '32px 0 24px 0' }} />
                
                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--fk-text-hi)', marginBottom: 8 }}>Corporate Documents</h3>
                <p style={{ fontSize: 13, color: 'var(--fk-text-mid)', marginBottom: 24 }}>Provide your certificate of incorporation and registered address.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 32 }}>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--fk-text-low)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.05em' }}>Certificate of Incorporation</label>
                    <input 
                      type="file" 
                      ref={entityFileInputRef} 
                      onChange={simulateUpload(setEntityUploadStatus)} 
                      accept="application/pdf" 
                      style={{ display: 'none' }} 
                    />

                    <div 
                      onClick={() => entityUploadStatus === 'idle' && entityFileInputRef.current?.click()}
                      style={{ 
                        border: `2px dashed ${entityUploadStatus === 'success' ? '#25D48A' : 'var(--fk-line)'}`, 
                        borderRadius: 16, padding: '24px', textAlign: 'center', 
                        background: entityUploadStatus === 'success' ? 'rgba(37,212,138,.05)' : 'var(--fk-surface-2)', 
                        cursor: entityUploadStatus === 'idle' ? 'pointer' : 'default',
                        transition: 'all 0.3s'
                      }}
                    >
                      {entityUploadStatus === 'idle' && (
                        <>
                          <UploadCloud size={28} color="var(--fk-blue)" style={{ margin: '0 auto 12px' }} />
                          <h4 style={{ fontSize: 15, fontWeight: 600, color: 'var(--fk-text-hi)', marginBottom: 4 }}>Upload PDF Document</h4>
                        </>
                      )}
                      {entityUploadStatus === 'uploading' && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div className="spinner" style={{ width: 28, height: 28, border: '3px solid rgba(46,92,255,.2)', borderTopColor: 'var(--fk-blue)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: 12 }} />
                          <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--fk-text-hi)' }}>Uploading...</p>
                        </div>
                      )}
                      {entityUploadStatus === 'success' && (
                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                          <CheckCircle2 size={32} color="#25D48A" style={{ margin: '0 auto 12px' }} />
                          <h4 style={{ fontSize: 15, fontWeight: 600, color: '#25D48A' }}>Document uploaded</h4>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--fk-text-low)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.05em' }}>Registered Address</label>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', alignItems: 'center' }}>
                        <MapPin size={18} color="var(--fk-text-low)" />
                      </div>
                      <textarea 
                        required 
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        placeholder="Building, Street, City, Postal Code" 
                        rows={3}
                        style={{ width: '100%', padding: '14px 16px 14px 44px', background: 'var(--fk-surface-2)', border: '1px solid var(--fk-line)', borderRadius: 12, color: 'var(--fk-text-hi)', fontSize: 15, outline: 'none', transition: 'border-color 0.2s', resize: 'none' }}
                        onFocus={e => e.target.style.borderColor = 'var(--fk-blue)'}
                        onBlur={e => e.target.style.borderColor = 'var(--fk-line)'}
                      />
                    </div>
                  </div>

                </div>

                <button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting || !entityName || !regNumber || !address || entityUploadStatus !== 'success'}
                  className="fk-btn fk-btn-primary" 
                  style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: 16, borderRadius: 12, background: (isSubmitting || !entityName || !regNumber || !address || entityUploadStatus !== 'success') ? 'var(--fk-surface-3)' : 'var(--fk-blue)', color: (isSubmitting || !entityName || !regNumber || !address || entityUploadStatus !== 'success') ? 'var(--fk-text-low)' : '#fff', opacity: (isSubmitting || !entityName || !regNumber || !address || entityUploadStatus !== 'success') ? 0.5 : 1 }}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Entity Application'}
                  {!isSubmitting && <Check size={18} />}
                </button>
              </motion.div>
            )}



          </AnimatePresence>
        </div>
      </div>
      
      {/* Global styles for spinner if not exists */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}} />
    </div>
  )
}
