import type { Metadata } from 'next'
import './globals.css'
import StyledComponentsRegistry from '@/lib/registry'

export const metadata: Metadata = {
  title: 'Tokenizer - Create and Manage Your Tokens',
  description: 'A Web3 tokenizer platform for creating and managing ERC20 tokens with compliance features',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StyledComponentsRegistry>
          {children}
        </StyledComponentsRegistry>
      </body>
    </html>
  )
}
