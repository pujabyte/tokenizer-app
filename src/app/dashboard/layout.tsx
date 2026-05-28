import Sidebar from '@/components/layout/Sidebar'
import TopHeader from '@/components/layout/TopHeader'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Sidebar />
      <TopHeader />
      <main
        style={{
          marginLeft: 'var(--sidebar-width)',
          marginTop: 'var(--header-height)',
          padding: '24px',
          minHeight: 'calc(100vh - var(--header-height))',
        }}
      >
        {children}
      </main>
    </div>
  )
}
