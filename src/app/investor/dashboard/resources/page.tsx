'use client'
import { useState, useEffect } from 'react'
import { Book, ChevronRight, FileText } from 'lucide-react'

export default function ResourcesPage() {
  const [chapters, setChapters] = useState<any[]>([])
  const [activeSection, setActiveSection] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/investor/docs')
      .then(res => res.json())
      .then(d => {
        setChapters(d.chapters)
        if (d.chapters.length > 0 && d.chapters[0].sections.length > 0) {
          setActiveSection(d.chapters[0].sections[0])
        }
        setLoading(false)
      })
  }, [])

  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('# ')) return <h1 key={i} style={{ fontSize: 32, fontWeight: 700, color: 'var(--fk-text-hi)', margin: '32px 0 24px' }}>{line.replace('# ', '')}</h1>
      if (line.startsWith('### ')) return <h3 key={i} style={{ fontSize: 20, fontWeight: 600, color: 'var(--fk-text-hi)', margin: '32px 0 16px' }}>{line.replace('### ', '')}</h3>
      if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ')) return <div key={i} style={{ marginLeft: 24, marginBottom: 12, color: 'var(--fk-text-hi)', lineHeight: 1.6 }}><span style={{ color: 'var(--fk-blue)', fontWeight: 600, marginRight: 8 }}>{line.substring(0,2)}</span>{line.substring(3)}</div>
      if (line.startsWith('- ')) {
        const text = line.replace('- ', '')
        const parts = text.split(/(\*\*.*?\*\*)/g)
        return (
          <li key={i} style={{ marginLeft: 24, marginBottom: 12, color: 'var(--fk-text-mid)', lineHeight: 1.6 }}>
            {parts.map((p, j) => p.startsWith('**') ? <strong key={j} style={{ color: 'var(--fk-text-hi)' }}>{p.replace(/\*\*/g, '')}</strong> : p)}
          </li>
        )
      }
      if (line.startsWith('> ')) {
        const text = line.replace('> ', '')
        const parts = text.split(/(\*\*.*?\*\*)/g)
        return (
          <div key={i} style={{ padding: '20px 24px', background: 'rgba(37, 99, 235, 0.05)', borderLeft: '4px solid var(--fk-blue)', borderRadius: '0 8px 8px 0', margin: '32px 0', color: 'var(--fk-text-hi)' }}>
            {parts.map((p, j) => p.startsWith('**') ? <strong key={j} style={{ color: 'var(--fk-blue-bright)' }}>{p.replace(/\*\*/g, '')}</strong> : p)}
          </div>
        )
      }
      if (line.trim() === '') return null
      
      const parts = line.split(/(\*\*.*?\*\*)/g)
      return (
        <p key={i} style={{ color: 'var(--fk-text-mid)', fontSize: 16, lineHeight: 1.8, marginBottom: 20 }}>
          {parts.map((p, j) => p.startsWith('**') ? <strong key={j} style={{ color: 'var(--fk-text-hi)' }}>{p.replace(/\*\*/g, '')}</strong> : p)}
        </p>
      )
    })
  }

  if (loading) {
    return <div style={{ color: 'var(--fk-text-mid)', padding: 48 }}>Loading Knowledge Base...</div>
  }

  return (
    <div style={{ display: 'flex', gap: 48, maxWidth: 1200, margin: '0 auto', alignItems: 'flex-start' }}>
      
      {/* Sidebar */}
      <aside style={{ width: 280, flexShrink: 0, position: 'sticky', top: 120 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32, padding: '0 16px' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--fk-blue-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Book size={16} style={{ color: 'var(--fk-blue)' }} />
          </div>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--fk-text-hi)' }}>Knowledge Base</h2>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {chapters.map((chapter) => (
            <div key={chapter.id}>
              <h4 className="fk-mono" style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--fk-text-low)', marginBottom: 12, padding: '0 16px' }}>
                {chapter.title}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {chapter.sections.map((sec: any) => {
                  const isActive = activeSection?.id === sec.id
                  return (
                    <button
                      key={sec.id}
                      onClick={() => setActiveSection(sec)}
                      style={{ 
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        width: '100%', textAlign: 'left', padding: '10px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                        background: isActive ? 'var(--fk-surface-1)' : 'transparent',
                        color: isActive ? 'var(--fk-text-hi)' : 'var(--fk-text-mid)',
                        fontWeight: isActive ? 600 : 500,
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => { if(!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = 'var(--fk-text-hi)' } }}
                      onMouseLeave={e => { if(!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--fk-text-mid)' } }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <FileText size={14} style={{ opacity: isActive ? 1 : 0.5 }} />
                        <span>{sec.title}</span>
                      </div>
                      {isActive && <ChevronRight size={14} style={{ color: 'var(--fk-blue)' }} />}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, minWidth: 0, paddingBottom: 100 }}>
        <div className="fk-card" style={{ padding: '24px 64px 64px' }}>
          {activeSection ? (
            <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
              {renderContent(activeSection.content)}
            </div>
          ) : (
            <div style={{ color: 'var(--fk-text-mid)' }}>Select an article to read.</div>
          )}
        </div>
      </main>

    </div>
  )
}
