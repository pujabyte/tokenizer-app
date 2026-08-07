import InvestorTopHeader from '@/components/layout/InvestorTopHeader'
import { KycBanner } from '@/components/investor/onboarding-shared'

export default function InvestorDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--fk-bg)' }}>
      <InvestorTopHeader />
      {/*
        Single source of truth for the portal content width. Individual pages
        must NOT set their own max-width — when portfolio capped itself at 1000
        and this shell at 1440, the header tabs visibly jumped width between
        routes. 1200 keeps the explore grid comfortable at 3 cards without the
        text columns on portfolio/history becoming unreadably long.

        --header-height is 56px in globals.css; the old `72px` fallbacks here
        were dead code that disagreed with the real header, so they are gone.
      */}
      <main
        className="iv-shell"
        style={{
          padding: 40,
          minHeight: 'calc(100vh - var(--header-height))',
          maxWidth: 1200,
          margin: '0 auto',
          marginTop: 'var(--header-height)',
        }}
      >
        <KycBanner />
        {children}
      </main>
    </div>
  )
}
