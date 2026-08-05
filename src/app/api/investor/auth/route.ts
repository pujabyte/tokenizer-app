import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
// Next.js forbids route files from exporting anything but handlers, so the
// shared vocabulary lives in src/lib/constants.ts.
import { SESSION_COOKIE, type KycStatus } from '@/lib/constants'

/**
 * Mock KYC/KYB state machine, persisted in a cookie rather than module-level
 * memory. Module state reset on every dev-server restart and was shared across
 * all viewers, so the flow was undemoable.
 *
 * Read by src/middleware.ts to gate /investor/dashboard/*.
 */

type Session = {
  authenticated: boolean
  status: KycStatus
  accountType: 'personal' | 'institutional' | null
  email: string | null
  walletAddress: string | null
  /** Populated when status is rejected / more_info_required / expired. */
  review: { reason: string; items: { field: string; message: string }[] } | null
  submittedAt: string | null
}

const GUEST: Session = {
  authenticated: false,
  status: 'unverified',
  accountType: null,
  email: null,
  walletAddress: null,
  review: null,
  submittedAt: null,
}

const REJECTION = {
  reason: 'We could not verify your identity with the documents provided.',
  items: [
    { field: 'idDocument', message: 'The ID photo is blurred — the document number is not readable.' },
    { field: 'selfie', message: 'The liveness check did not match the submitted ID photo.' },
  ],
}

const MORE_INFO = {
  reason: 'Your application is almost complete. Our compliance team needs two more items.',
  items: [
    { field: 'proofOfAddress', message: 'Upload a utility bill or bank statement issued within the last 3 months.' },
    { field: 'sourceOfFunds', message: 'Provide a short statement describing the source of your investment funds.' },
  ],
}

async function readSession(): Promise<Session> {
  const store = await cookies()
  const raw = store.get(SESSION_COOKIE)?.value
  if (!raw) return GUEST
  try {
    return { ...GUEST, ...(JSON.parse(decodeURIComponent(raw)) as Partial<Session>) }
  } catch {
    return GUEST
  }
}

function withSession(session: Session, body: Record<string, unknown>, status = 200) {
  const res = NextResponse.json({ ...body, session }, { status })
  res.cookies.set(SESSION_COOKIE, encodeURIComponent(JSON.stringify(session)), {
    path: '/',
    httpOnly: false, // mock only — the client reads this to render status screens
    sameSite: 'lax',
    maxAge: 60 * 60 * 24,
  })
  return res
}

export async function GET() {
  try {
    return NextResponse.json(await readSession())
  } catch {
    return NextResponse.json({ error: 'Failed to read session' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { action, payload } = await request.json()
    const session = await readSession()

    switch (action) {
      case 'LOGIN': {
        const email = typeof payload?.email === 'string' ? payload.email.trim() : ''
        // Basic validation so the invalid-credential state actually exists
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
          return NextResponse.json(
            { error: 'Enter a valid email address', code: 'INVALID_EMAIL' },
            { status: 400 }
          )
        }
        if (email.endsWith('@blocked.test')) {
          return NextResponse.json(
            { error: 'This account has been suspended. Contact support@frakta.io.', code: 'ACCOUNT_LOCKED' },
            { status: 403 }
          )
        }
        return withSession({ ...session, authenticated: true, email }, { success: true })
      }

      case 'CONNECT_WALLET': {
        const address = typeof payload?.address === 'string' ? payload.address : ''
        if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
          return NextResponse.json(
            { error: 'Invalid wallet address', code: 'INVALID_ADDRESS' },
            { status: 400 }
          )
        }
        return withSession({ ...session, authenticated: true, walletAddress: address }, { success: true })
      }

      case 'SUBMIT_KYC':
        return withSession(
          { ...session, authenticated: true, status: 'pending_kyc', accountType: 'personal', review: null, submittedAt: new Date().toISOString() },
          { success: true }
        )

      case 'SUBMIT_KYB':
        return withSession(
          { ...session, authenticated: true, status: 'pending_kyb', accountType: 'institutional', review: null, submittedAt: new Date().toISOString() },
          { success: true }
        )

      // ── Reviewer simulation (dev tools on the pending screen) ──
      case 'ADMIN_APPROVE':
        return withSession(
          { ...session, status: payload === 'kyb' || session.accountType === 'institutional' ? 'kyc_kyb_approved' : 'kyc_approved', review: null },
          { success: true }
        )

      case 'ADMIN_REJECT':
        return withSession({ ...session, status: 'rejected', review: REJECTION }, { success: true })

      case 'ADMIN_REQUEST_INFO':
        return withSession({ ...session, status: 'more_info_required', review: MORE_INFO }, { success: true })

      case 'ADMIN_EXPIRE':
        return withSession(
          {
            ...session, status: 'expired',
            review: { reason: 'Your verification has expired. Documents must be re-submitted every 24 months.', items: [] },
          },
          { success: true }
        )

      case 'RESUBMIT':
        // Back to square one, but keep the account type so the user resumes
        // the correct flow instead of re-picking it.
        return withSession({ ...session, status: 'unverified', review: null, submittedAt: null }, { success: true })

      case 'LOGOUT': {
        const res = NextResponse.json({ success: true, session: GUEST })
        res.cookies.delete(SESSION_COOKIE)
        return res
      }

      default:
        return NextResponse.json({ error: 'Invalid action', code: 'INVALID_ACTION' }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
