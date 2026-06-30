import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TOR Analyzer — AI-Powered Blueprint Dashboard',
  description: 'วิเคราะห์เอกสาร TOR ด้วย Typhoon AI',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  )
}
