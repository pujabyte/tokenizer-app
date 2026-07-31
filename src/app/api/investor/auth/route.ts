import { NextResponse } from 'next/server'

// In a real app, this would be in a database or session.
let mockAuthState = {
  status: 'unverified', // unverified, pending_kyc, pending_kyb, kyc_approved, kyc_kyb_approved, whitelisted, rejected
  user: {
    email: 'investor@example.com',
    walletAddress: '0x123...456'
  }
}

export async function GET() {
  return NextResponse.json(mockAuthState)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, payload } = body

    if (action === 'LOGIN') {
      // Simulate successful login, returns current state
      return NextResponse.json({ success: true, ...mockAuthState })
    }

    if (action === 'SUBMIT_KYC') {
      mockAuthState.status = 'pending_kyc'
      return NextResponse.json({ success: true, status: mockAuthState.status })
    }

    if (action === 'SUBMIT_KYB') {
      mockAuthState.status = 'pending_kyb'
      return NextResponse.json({ success: true, status: mockAuthState.status })
    }

    if (action === 'ADMIN_APPROVE') {
      mockAuthState.status = payload === 'kyb' ? 'kyc_kyb_approved' : 'kyc_approved'
      return NextResponse.json({ success: true, status: mockAuthState.status })
    }

    if (action === 'ADMIN_REJECT') {
      mockAuthState.status = 'rejected'
      return NextResponse.json({ success: true, status: mockAuthState.status })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
