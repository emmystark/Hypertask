import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HyperTask - AI Agent Marketplace on Monad',
  description: 'Decentralized AI-agent marketplace where Manager Agents hire specialized Worker Agents to complete tasks with instant on-chain payments.',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
