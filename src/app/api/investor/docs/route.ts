import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    chapters: [
      {
        id: 'getting-started',
        title: 'Getting Started',
        sections: [
          {
            id: 'what-is-frakta',
            title: 'What is Frakta?',
            content: `
# What is Frakta?

Frakta is a premier **Real-World Asset (RWA)** and institutional-grade tokenization platform. We bridge the gap between traditional finance (TradFi) and decentralized finance (DeFi) by bringing highly vetted, real-world assets onto the blockchain.

### Our Mission
To democratize access to exclusive investment opportunities that were previously only available to institutional investors or ultra-high-net-worth individuals.

### Key Benefits
- **Fractional Ownership:** Invest in high-value assets (like commercial real estate or fine art) with low capital requirements.
- **24/7 Liquidity:** Trade your tokenized assets instantly on our decentralized swap interface without waiting for market hours.
- **Transparency:** All asset proofs, legal documents, and yield distributions are cryptographically verifiable on-chain.
            `
          },
          {
            id: 'account-funding',
            title: 'Funding Your Account',
            content: `
# Funding Your Account

To start investing on Frakta, you need to fund your account with a supported stablecoin (primarily **USDC**).

### Deposit Methods
1. **Direct Crypto Deposit:** Send USDC (ERC-20, Polygon, or Solana) directly to your Frakta custodial wallet address.
2. **Fiat On-Ramp:** Use our integrated banking partners to wire USD, EUR, or IDR, which will be automatically converted to USDC at a 1:1 ratio.

> **Note:** Frakta covers all gas fees for deposits. The amount you send is exactly the amount you receive in your portfolio.
            `
          }
        ]
      },
      {
        id: 'trading-swap',
        title: 'Trading & Swap',
        sections: [
          {
            id: 'how-to-swap',
            title: 'How to Swap Assets',
            content: `
# How to Swap Assets

Frakta features a built-in decentralized exchange (DEX) interface specifically tailored for RWA tokens. 

### Step-by-step Guide
1. Navigate to the **Swap** menu at the top of your dashboard.
2. In the **You Pay** section, select the asset you want to sell (e.g., USDC).
3. In the **You Receive** section, select the asset you want to acquire (e.g., AAPLon or NYCRE).
4. Enter the amount you wish to swap. The system will automatically calculate the exchange rate.
5. Review the **Slippage Tolerance** in the settings (gear icon) if you are trading large volumes.
6. Click **Confirm Swap**.

The transaction will settle almost instantly, and your new balances will be reflected in your Portfolio immediately.
            `
          }
        ]
      },
      {
        id: 'yield-rewards',
        title: 'Yields & Rewards',
        sections: [
          {
            id: 'understanding-yield',
            title: 'Understanding Yield',
            content: `
# Understanding Yield

Many assets on Frakta generate passive income. The type of yield depends on the underlying asset class.

### Types of Yield
- **Real Estate (e.g., NYCRE):** Generates rental income, usually distributed monthly or quarterly in USDC.
- **Bonds (e.g., UST3M):** Generates fixed interest (coupons), distributed upon maturity or at regular intervals.
- **Equities (e.g., AAPLon):** May distribute synthetic dividends when the underlying stock issues a dividend.

### Claiming Rewards
Most yields are **auto-distributed** directly to your wallet. However, certain assets require manual claims due to tax or compliance reasons. You can track and claim all pending yields via the **Rewards** hub in your navigation menu.
            `
          }
        ]
      }
    ]
  })
}
