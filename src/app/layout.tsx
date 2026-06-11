import type { Metadata } from 'next'
import { Inter, DM_Sans } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'BOD Lenses Portugal — Lentes Ópticas Premium',
  description: 'Lentes oftálmicas premium fabricadas na Europa. Tecnologia Free-Form, certificação ISO e suporte 24/7 para óticas parceiras.',
  keywords: ['lentes oftálmicas', 'ótica', 'progressivas', 'monofocais', 'BOD Lenses', 'Portugal'],
  openGraph: {
    title: 'BOD Lenses Portugal',
    description: 'Lentes ópticas premium fabricadas na Europa com tecnologia avançada.',
    url: 'https://app.bodlensesportugal.com',
    siteName: 'BOD Lenses Portugal',
    locale: 'pt_PT',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt" className={`${inter.variable} ${dmSans.variable}`}>
      <body className="font-sans antialiased bg-white text-bod-dark">
        {children}
      </body>
    </html>
  )
}
