import InvestorTopHeader from '@/components/layout/InvestorTopHeader'

export default function InvestorDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--fk-bg)' }}>
      <InvestorTopHeader />
      <main
        style={{
          marginTop: 'var(--header-height, 72px)',
          padding: '40px',
          minHeight: 'calc(100vh - var(--header-height, 72px))',
          maxWidth: 1440,
          margin: 'var(--header-height, 72px) auto 0',
        }}
      >
        {children}
      </main>
    </div>
  )
}
