'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { BRAND_IMAGES } from '@/lib/data'
import { LayoutDashboard, Building2, ShoppingBag, UserCheck, LogOut, Menu, X, ChevronRight } from 'lucide-react'

const navItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/oticas',    icon: Building2,       label: 'Óticas' },
  { href: '/admin/vendas',    icon: ShoppingBag,     label: 'Vendas' },
  { href: '/admin/pedidos',   icon: UserCheck,       label: 'Pedidos de acesso' },
]

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const logout = async () => {
    await fetch('/api/admin-logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-60 bg-white border-r border-gray-100 flex flex-col
        transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
      `}>
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <Image src={BRAND_IMAGES.logo} alt="BOD" width={90} height={26} className="h-6 w-auto mb-1" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Admin</span>
          </div>
          <button className="md:hidden text-gray-400" onClick={() => setOpen(false)}><X size={18} /></button>
        </div>

        <nav className="flex-1 px-3 py-3 space-y-0.5">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active ? 'bg-bod-blue text-white' : 'text-gray-500 hover:text-bod-blue hover:bg-bod-xlight'
                }`}
                onClick={() => setOpen(false)}>
                <Icon size={17} />
                {label}
                {active && <ChevronRight size={13} className="ml-auto opacity-60" />}
              </Link>
            )
          })}
        </nav>

        <div className="px-3 py-3 border-t border-gray-100">
          <button onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors w-full">
            <LogOut size={16} /> Sair
          </button>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setOpen(false)} />}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
          <button onClick={() => setOpen(true)} className="text-gray-500"><Menu size={22} /></button>
          <span className="font-semibold text-sm text-bod-dark">BOD Admin</span>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
