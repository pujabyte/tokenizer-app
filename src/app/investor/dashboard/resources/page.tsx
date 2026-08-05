'use client'
import { useEffect, useMemo, useState } from 'react'
import { Book, ChevronRight, Download, FileText } from 'lucide-react'
import { useFetch } from '@/lib/useFetch'
import { EmptyState, ErrorState, LoadingAnnouncer, Skeleton } from '@/components/ui/states'

type DocSection = { id: string; title: string; content: string }
type DocChapter = { id: string; title: string; sections: DocSection[] }
type DocsResponse = { chapters: DocChapter[] }

function renderContent(content: string) {
  return content.split('\n').map((line, i) => {
    if (line.startsWith('# ')) return <h1 key={i} style={{ fontSize: 'var(--fs-h1)', fontWeight: 700, color: 'var(--fk-text-hi)', margin: '32px 0 24px' }}>{line.replace('# ', '')}</h1>
    if (line.startsWith('### ')) return <h3 key={i} style={{ fontSize: 'var(--fs-h3)', fontWeight: 600, color: 'var(--fk-text-hi)', margin: '32px 0 16px' }}>{line.replace('### ', '')}</h3>
    if (/^\d+\.\s/.test(line)) {
      const marker = line.slice(0, line.indexOf('.') + 1)
      return (
        <div key={i} style={{ marginLeft: 24, marginBottom: 12, color: 'var(--fk-text-hi)', lineHeight: 1.6 }}>
          <span style={{ color: 'var(--fk-blue-bright)', fontWeight: 600, marginRight: 8 }}>{marker}</span>
          {line.slice(marker.length).trim()}
        </div>
      )
    }
    if (line.startsWith('- ')) {
      const parts = line.replace('- ', '').split(/(\*\*.*?\*\*)/g)
      return (
        <li key={i} style={{ marginLeft: 24, marginBottom: 12, color: 'var(--fk-text-mid)', lineHeight: 1.6 }}>
          {parts.map((p, j) => p.startsWith('**') ? <strong key={j} style={{ color: 'var(--fk-text-hi)' }}>{p.replace(/\*\*/g, '')}</strong> : p)}
        </li>
      )
    }
    if (line.startsWith('> ')) {
      const parts = line.replace('> ', '').split(/(\*\*.*?\*\*)/g)
      return (
        <div
          key={i}
          style={{
            padding: '20px 24px', background: 'var(--fk-blue-tint)',
            borderLeft: '4px solid var(--fk-blue)', borderRadius: '0 var(--r-sm) var(--r-sm) 0',
            margin: '32px 0', color: 'var(--fk-text-hi)',
          }}
        >
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

export default function ResourcesPage() {
  const { data, loading, error, offline, refetch } = useFetch<DocsResponse>('/api/investor/docs')
  const [activeId, setActiveId] = useState<string | null>(null)

  const chapters = useMemo(() => data?.chapters ?? [], [data])
  const sections = useMemo(() => chapters.flatMap(c => c.sections ?? []), [chapters])

  // Select the first article once data lands, and recover if the selected id
  // disappears on a refetch (previously a stale id rendered a blank pane).
  useEffect(() => {
    if (sections.length === 0) { setActiveId(null); return }
    setActiveId(prev => (prev && sections.some(s => s.id === prev) ? prev : sections[0].id))
  }, [sections])

  const activeSection = sections.find(s => s.id === activeId) ?? null

  const downloadArticle = () => {
    if (!activeSection) return
    const blob = new Blob([activeSection.content.trim()], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeSection.id}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="iv-resources" style={{ display: 'flex', gap: 48, maxWidth: 1200, margin: '0 auto', alignItems: 'flex-start' }}>
        <LoadingAnnouncer label="Loading knowledge base" />
        <aside className="iv-resources-side" style={{ width: 280, flexShrink: 0, display: 'grid', gap: 12 }}>
          <Skeleton w="60%" h={18} />
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} h={32} />)}
        </aside>
        <main style={{ flex: 1, minWidth: 0 }}>
          <div className="fk-card" style={{ padding: '32px 40px 56px', display: 'grid', gap: 16 }}>
            <Skeleton w="55%" h={28} />
            <Skeleton w="90%" />
            <Skeleton w="82%" />
            <Skeleton w="70%" />
            <Skeleton w="40%" h={20} style={{ marginTop: 16 }} />
            <Skeleton w="88%" />
            <Skeleton w="76%" />
          </div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h1 className="iv-page-title" style={{ fontSize: 'var(--fs-h1)', fontWeight: 700, color: 'var(--fk-text-hi)', marginBottom: 24 }}>Knowledge Base</h1>
        <div className="fk-card">
          <ErrorState
            title="Could not load the knowledge base"
            body={error}
            offline={offline}
            onRetry={refetch}
          />
        </div>
      </div>
    )
  }

  if (chapters.length === 0) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h1 className="iv-page-title" style={{ fontSize: 'var(--fs-h1)', fontWeight: 700, color: 'var(--fk-text-hi)', marginBottom: 24 }}>Knowledge Base</h1>
        <div className="fk-card">
          <EmptyState
            icon={<Book size={20} />}
            title="No articles published yet"
            body="Guides and asset documentation will appear here as soon as they are released."
            action={{ label: 'Explore markets', href: '/investor/dashboard' }}
          />
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="iv-page-title" style={{ fontSize: 'var(--fs-h1)', fontWeight: 700, color: 'var(--fk-text-hi)', marginBottom: 24, maxWidth: 1200, marginLeft: 'auto', marginRight: 'auto' }}>
        Knowledge Base
      </h1>

      <div className="iv-resources" style={{ display: 'flex', gap: 48, maxWidth: 1200, margin: '0 auto', alignItems: 'flex-start' }}>

        {/* Sidebar */}
        <aside className="iv-resources-side" style={{ width: 280, flexShrink: 0, position: 'sticky', top: 120 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32, padding: '0 16px' }}>
            <div style={{ width: 32, height: 32, borderRadius: 'var(--r-sm)', background: 'var(--fk-blue-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Book size={16} style={{ color: 'var(--fk-blue-bright)' }} />
            </div>
            <h2 style={{ fontSize: 'var(--fs-card-title)', fontWeight: 700, color: 'var(--fk-text-hi)' }}>Articles</h2>
          </div>

          <nav aria-label="Knowledge base articles" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {chapters.map(chapter => (
              <div key={chapter.id}>
                <h4 className="fk-mono" style={{ fontSize: 'var(--fs-2xs)', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--fk-text-mid)', marginBottom: 12, padding: '0 16px' }}>
                  {chapter.title}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {(chapter.sections ?? []).map(sec => {
                    const isActive = activeId === sec.id
                    return (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => setActiveId(sec.id)}
                        aria-current={isActive ? 'page' : undefined}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          width: '100%', textAlign: 'left', padding: '10px 16px',
                          borderRadius: 'var(--r-sm)', border: '1px solid transparent', cursor: 'pointer',
                          background: isActive ? 'var(--fk-surface-2)' : 'transparent',
                          borderColor: isActive ? 'var(--glass-border)' : 'transparent',
                          color: isActive ? 'var(--fk-text-hi)' : 'var(--fk-text-mid)',
                          fontWeight: isActive ? 600 : 500,
                          fontSize: 'var(--fs-body)',
                          transition: 'background .15s, color .15s',
                        }}
                        onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'var(--fk-surface-hover)'; e.currentTarget.style.color = 'var(--fk-text-hi)' } }}
                        onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--fk-text-mid)' } }}
                        onFocus={e => { if (!isActive) { e.currentTarget.style.background = 'var(--fk-surface-hover)'; e.currentTarget.style.color = 'var(--fk-text-hi)' } }}
                        onBlur={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--fk-text-mid)' } }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                          <FileText size={14} style={{ opacity: isActive ? 1 : 0.5, flexShrink: 0 }} aria-hidden="true" />
                          <span className="fk-truncate">{sec.title}</span>
                        </span>
                        {isActive && <ChevronRight size={14} style={{ color: 'var(--fk-blue-bright)', flexShrink: 0 }} aria-hidden="true" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, minWidth: 0, paddingBottom: 100 }}>
          <div className="fk-card" style={{ padding: '24px 40px 56px' }}>
            {activeSection ? (
              // The keyed wrapper restarts the transition on every article change.
              <div key={activeSection.id} style={{ animation: 'fadeIn 0.3s ease-out' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: 8 }}>
                  <button
                    type="button"
                    className="fk-btn fk-btn-secondary"
                    onClick={downloadArticle}
                    aria-label={`Download “${activeSection.title}” as Markdown`}
                  >
                    <Download size={13} aria-hidden="true" /> Download
                  </button>
                </div>
                {renderContent(activeSection.content)}
              </div>
            ) : (
              <EmptyState
                compact
                icon={<FileText size={20} />}
                title="Article unavailable"
                body="This article could not be found. Pick another one from the list."
              />
            )}
          </div>
        </main>

      </div>
    </div>
  )
}
