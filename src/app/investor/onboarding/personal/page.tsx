'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { 
  ArrowLeft, UploadCloud, CheckCircle2, 
  ShieldCheck, FileText, Camera, 
  Check, Info, XCircle, CreditCard,
  Book, Car, FileSignature
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

export default function PersonalKycPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  
  // Form State
  const [country, setCountry] = useState('Singapore')
  const [docType, setDocType] = useState('id_card')
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success'>('idle')
  
  // Manual Data
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [idNumber, setIdNumber] = useState('')
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleNext = () => setStep(prev => prev + 1)
  const handleBack = () => setStep(prev => prev - 1)

  const simulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadStatus('uploading')
      setTimeout(() => {
        setUploadStatus('success')
      }, 1500)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      router.push('/investor/onboarding/pending')
    }, 1500)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--fk-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '64px 24px', position: 'relative', overflowX: 'hidden' }}>
      
      {/* Background glow */}
      <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(46,92,255,.05) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

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
            STEP {step} OF 4
          </div>
        </div>

        <div style={{ background: 'var(--fk-surface-1)', border: '1px solid var(--glass-border)', borderRadius: 24, padding: '40px 32px', position: 'relative', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
          
          {/* Progress bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'var(--fk-surface-2)' }}>
            <motion.div 
              style={{ height: '100%', background: 'linear-gradient(90deg, #6B85FF, #25D48A)' }}
              initial={{ width: '25%' }}
              animate={{ width: `${(step / 4) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <AnimatePresence mode="wait">
            
            {/* STEP 1: Preparation */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                  <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(46,92,255,.2), rgba(46,92,255,.05))', border: '1px solid rgba(46,92,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                    <ShieldCheck size={32} color="#6B85FF" />
                  </div>
                  <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--fk-text-hi)', marginBottom: 12 }}>
                    Let's get you verified
                  </h1>
                  <p style={{ fontSize: 15, color: 'var(--fk-text-mid)' }}>
                    Verifikasi identitas diperlukan sebagai langkah kepatuhan. Selesaikan sekarang untuk mengakses pasar.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', background: 'var(--fk-surface-2)', borderRadius: 16, border: '1px solid var(--fk-line)' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--fk-surface-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FileText size={20} color="var(--fk-text-hi)" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: 15, fontWeight: 600, color: 'var(--fk-text-hi)' }}>Identity Document</h4>
                      <p style={{ fontSize: 13, color: 'var(--fk-text-mid)' }}>Provide your ID card, passport, or driver's license.</p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', background: 'var(--fk-surface-2)', borderRadius: 16, border: '1px solid var(--fk-line)' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--fk-surface-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Camera size={20} color="var(--fk-text-hi)" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: 15, fontWeight: 600, color: 'var(--fk-text-hi)' }}>Selfie (Liveness)</h4>
                      <p style={{ fontSize: 13, color: 'var(--fk-text-mid)' }}>A quick scan to verify you are a real person.</p>
                    </div>
                  </div>
                </div>

                <button onClick={handleNext} className="fk-btn fk-btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: 16, borderRadius: 12 }}>
                  Continue
                </button>
              </motion.div>
            )}

            {/* STEP 2: Document Selection */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--fk-text-hi)', marginBottom: 8 }}>Select document type</h2>
                <p style={{ fontSize: 14, color: 'var(--fk-text-mid)', marginBottom: 28 }}>Choose the issuing country and type of your identity document.</p>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--fk-text-hi)', marginBottom: 12 }}>Issuing country</label>
                  <select 
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
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

                <button onClick={handleNext} className="fk-btn fk-btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: 16, borderRadius: 12 }}>
                  Next Step
                </button>
              </motion.div>
            )}

            {/* STEP 3: Upload Document */}
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
                  ref={fileInputRef} 
                  onChange={simulateUpload} 
                  accept="image/jpeg, image/png, application/pdf" 
                  style={{ display: 'none' }} 
                />

                <div 
                  onClick={() => uploadStatus === 'idle' && fileInputRef.current?.click()}
                  style={{ 
                    border: `2px dashed ${uploadStatus === 'success' ? '#25D48A' : 'var(--fk-blue)'}`, 
                    borderRadius: 16, padding: '40px 24px', textAlign: 'center', 
                    background: uploadStatus === 'success' ? 'rgba(37,212,138,.05)' : 'rgba(46,92,255,.05)', 
                    cursor: uploadStatus === 'idle' ? 'pointer' : 'default',
                    marginBottom: 32, transition: 'all 0.3s'
                  }}
                >
                  {uploadStatus === 'idle' && (
                    <>
                      <UploadCloud size={32} color="var(--fk-blue)" style={{ margin: '0 auto 16px' }} />
                      <h4 style={{ fontSize: 16, fontWeight: 600, color: 'var(--fk-blue)', marginBottom: 8 }}>Click to upload front side</h4>
                      <p style={{ fontSize: 13, color: 'var(--fk-text-mid)' }}>JPEG, PNG, or PDF (Max 5MB)</p>
                    </>
                  )}
                  {uploadStatus === 'uploading' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div className="spinner" style={{ width: 32, height: 32, border: '3px solid rgba(46,92,255,.2)', borderTopColor: 'var(--fk-blue)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: 16 }} />
                      <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--fk-text-hi)' }}>Uploading...</p>
                    </div>
                  )}
                  {uploadStatus === 'success' && (
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                      <CheckCircle2 size={36} color="#25D48A" style={{ margin: '0 auto 16px' }} />
                      <h4 style={{ fontSize: 16, fontWeight: 600, color: '#25D48A', marginBottom: 4 }}>Document uploaded</h4>
                      <p style={{ fontSize: 13, color: 'var(--fk-text-mid)' }}>Ready to proceed</p>
                    </motion.div>
                  )}
                </div>

                <button 
                  onClick={handleNext} 
                  disabled={uploadStatus !== 'success'}
                  className="fk-btn fk-btn-primary" 
                  style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: 16, borderRadius: 12, opacity: uploadStatus === 'success' ? 1 : 0.5 }}
                >
                  Continue
                </button>
              </motion.div>
            )}

            {/* STEP 4: Manual Verification */}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--fk-text-hi)', marginBottom: 8 }}>Verify your details</h2>
                <p style={{ fontSize: 14, color: 'var(--fk-text-mid)', marginBottom: 28 }}>Please enter your details exactly as they appear on your uploaded document.</p>

                <form onSubmit={handleSubmit}>
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

                  </div>

                  <button type="submit" disabled={isSubmitting} className="fk-btn fk-btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: 16, borderRadius: 12, opacity: isSubmitting ? 0.7 : 1 }}>
                    {isSubmitting ? 'Verifying...' : 'Submit Verification'}
                    {!isSubmitting && <Check size={18} />}
                  </button>
                </form>
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
