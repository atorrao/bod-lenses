'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { BRAND_IMAGES } from '@/lib/data'

const links = [
  { href: '/produtos',     label: 'Produtos' },
  { href: '/novidades',    label: 'Novidades' },
  { href: '/calculadora',  label: 'Calculadora' },
  { href: '/contacto',     label: 'Contacto' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-bod-light">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Image
            src={BRAND_IMAGES.logo}
            alt="BOD Lenses Portugal"
            width={140}
            height={38}
            className="h-8 w-auto object-contain"
            priority
          />
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-1">
          {links.map(({ href, label }) => {
            const active = pathname === href
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
                    active
                      ? 'text-bod-blue bg-bod-xlight font-semibold'
                      : 'text-gray-500 hover:text-bod-blue hover:bg-bod-xlight'
                  } ${href === '/contacto' ? '!bg-bod-blue !text-white hover:!bg-bod-dark ml-1' : ''}`}
                >
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 text-gray-500 hover:text-bod-blue"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-bod-light bg-white px-4 py-3 flex flex-col gap-1">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-3 py-2.5 text-sm font-medium text-gray-600 hover:text-bod-blue hover:bg-bod-xlight rounded-lg transition-colors"
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
