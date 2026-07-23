'use client'

// Mock Privy user hook — swap this with real usePrivy() when Privy SDK is integrated
// Login types: 'email' = connected via email+wallet, 'wallet' = wallet-only

export type LoginType = 'email' | 'wallet'

export interface PrivyUser {
  loginType: LoginType
  displayName: string   // name for email users, truncated wallet for wallet users
  email?: string        // only present for email login
  walletAddress: string // always present
  avatarInitial: string // single char for avatar
}

// Truncate wallet: 0x1234...abcd
function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

// Switch MOCK_LOGIN_TYPE to test both flows
const MOCK_LOGIN_TYPE: LoginType = 'email'

const MOCK_EMAIL_USER: PrivyUser = {
  loginType: 'email',
  displayName: 'I Ketut Puja Arsana',
  email: 'ketut.puja@nanovest.io',
  walletAddress: '0x3d5f9a2c1e8b4f7a6d0c2e1b3a5f9d8c7e6b4a2b',
  avatarInitial: 'K',
}

const MOCK_WALLET_USER: PrivyUser = {
  loginType: 'wallet',
  displayName: truncateAddress('0x3d5f9a2c1e8b4f7a6d0c2e1b3a5f9d8c7e6b4a2b'),
  walletAddress: '0x3d5f9a2c1e8b4f7a6d0c2e1b3a5f9d8c7e6b4a2b',
  avatarInitial: '0x',
}

export function usePrivyUser(): PrivyUser {
  return MOCK_LOGIN_TYPE === 'email' ? MOCK_EMAIL_USER : MOCK_WALLET_USER
}
