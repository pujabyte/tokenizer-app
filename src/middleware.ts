import { NextResponse, type NextRequest } from 'next/server'

/**
 * Gates the investor dashboard. Previously there was no middleware at all, so
 * /investor/dashboard/token/[id] rendered a full trade panel to anyone with the
 * URL, and there was no route for "session expired" or "still under review".
 *
 * Mock only — the session is a readable cookie written by /api/investor/auth.
 * A real deployment must verify a signed token server-side.
 */

const SESSION_COOKIE = 'fk_investor_session'

const APPROVED = new Set(['kyc_approved', 'kyc_kyb_approved', 'whitelisted'])

/** status → where the user belongs while in that status */
const STATUS_ROUTE: Record<string, string> = {
  unverified: '/investor/onboarding',
  pending_kyc: '/investor/onboarding/pending',
  pending_kyb: '/investor/onboarding/pending',
  more_info_required: '/investor/onboarding/more-info',
  rejected: '/investor/onboarding/rejected',
  expired: '/investor/onboarding/expired',
}

type Session = { authenticated?: boolean; status?: string }

function readSession(req: NextRequest): Session | null {
  const raw = req.cookies.get(SESSION_COOKIE)?.value
  if (!raw) return null
  try {
    return JSON.parse(decodeURIComponent(raw)) as Session
  } catch {
    return null // malformed cookie is treated as no session
  }
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl

  // Escape hatch for walkthroughs: set FK_BYPASS_AUTH=1 to browse the whole
  // portal without signing in. Never enable this outside a mockup.
  if (process.env.FK_BYPASS_AUTH === '1') return NextResponse.next()

  const session = readSession(req)

  const isDashboard = pathname.startsWith('/investor/dashboard')
  const isOnboarding = pathname.startsWith('/investor/onboarding')
  const isAuth = pathname === '/investor/auth'

  // Not signed in → auth, remembering where they were headed
  if (!session?.authenticated) {
    if (isDashboard || isOnboarding) {
      const url = req.nextUrl.clone()
      url.pathname = '/investor/auth'
      url.search = ''
      url.searchParams.set('next', pathname + search)
      // `reason` lets the auth page explain itself instead of appearing to be a
      // random redirect.
      url.searchParams.set('reason', 'signin_required')
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  const status = session.status ?? 'unverified'
  const approved = APPROVED.has(status)

  // Signed in and approved → keep them out of the onboarding flow
  if (approved && (isOnboarding || isAuth)) {
    const url = req.nextUrl.clone()
    url.pathname = '/investor/dashboard'
    url.search = ''
    return NextResponse.redirect(url)
  }

  // Signed in but not approved → dashboard is off limits
  if (!approved && isDashboard) {
    const url = req.nextUrl.clone()
    url.pathname = STATUS_ROUTE[status] ?? '/investor/onboarding'
    url.search = ''
    url.searchParams.set('reason', 'verification_required')
    return NextResponse.redirect(url)
  }

  // Keep the user on the screen that matches their status, but allow the KYC
  // forms themselves (personal/institutional) so resubmission can proceed.
  if (!approved && isOnboarding) {
    const target = STATUS_ROUTE[status]
    const isForm =
      pathname.startsWith('/investor/onboarding/personal') ||
      pathname.startsWith('/investor/onboarding/institutional')
    if (target && !isForm && pathname !== target && pathname !== '/investor/onboarding') {
      const url = req.nextUrl.clone()
      url.pathname = target
      url.search = ''
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/investor/dashboard/:path*', '/investor/onboarding/:path*', '/investor/auth'],
}
