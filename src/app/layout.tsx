import type { Metadata } from 'next'
import { Inter, DM_Sans } from 'next/font/google'
import './globals.css'

const inter   = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const dmSans  = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap' })

export const metadata: Metadata = {
  title: 'BOD Lenses Portugal — Área Privada',
  description: 'Portal exclusivo para óticas parceiras BOD Lenses Portugal.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" className={`${inter.variable} ${dmSans.variable}`}>
      <body className="font-sans antialiased bg-bod-xlight text-bod-dark">
        {children}
      </body>
    </html>
  )
}
