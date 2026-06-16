'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { BRAND_IMAGES } from '@/lib/data'
import type { Profile } from '@/lib/supabase'
import {
  LayoutDashboard, Calculator, Package, Newspaper,
  MessageCircle, User, LogOut, Menu, X, ChevronRight, ShoppingBag
} from 'lucide-react'

const navItems = [
  { href: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/calculadora', icon: Calculator,       label: 'Calculadora' },
  { href: '/produtos',    icon: Package,          label: 'Produtos' },
  { href: '/encomendas',  icon: ShoppingBag,      label: 'Encomendas' },
  { href: '/novidades',   icon: Newspaper,        label: 'Novidades' },
  { href: '/contacto',    icon: MessageCircle,    label: 'Contacto' },
  { href: '/perfil',      icon: User,             label: 'Perfil' },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/'); return }
      const { data } = await supabase.from('optica_profiles').select('*').eq('id', session.user.id).single()
      if (data?.status !== 'approved') { await supabase.auth.signOut(); router.push('/'); return }
      setProfile(data)
    })
  }, [router])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const initials = profile?.optica_name
    ? profile.optica_name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : '?'

  return (
    <div className="flex h-screen overflow-hidden bg-bod-xlight">
      {/* SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-bod-dark flex flex-col
        transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
      `}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between">
          <Image src={BRAND_IMAGES.logo} alt="BOD Lenses" width={110} height={30}
            className="h-7 w-auto brightness-0 invert" />
          <button className="md:hidden text-white/50 hover:text-white" onClick={() => setOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? 'bg-bod-blue text-white'
                    : 'text-white/50 hover:text-white hover:bg-white/8'
                }`}
                onClick={() => setOpen(false)}
              >
                <Icon size={18} />
                {label}
                {active && <ChevronRight size={14} className="ml-auto opacity-60" />}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-bod-blue flex items-center justify-center text-xs font-bold text-white shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{profile?.optica_name ?? '...'}</p>
              <p className="text-xs text-white/40 truncate">{profile?.email ?? ''}</p>
            </div>
          </div>
          <button onClick={signOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/8 transition-colors w-full mt-1">
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {open && <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setOpen(false)} />}

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar mobile */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-bod-light shrink-0">
          <button onClick={() => setOpen(true)} className="text-gray-500 hover:text-bod-blue">
            <Menu size={22} />
          </button>
          <Image src={BRAND_IMAGES.logo} alt="BOD Lenses" width={100} height={28} className="h-7 w-auto" />
          <div className="ml-auto w-8 h-8 rounded-lg bg-bod-blue flex items-center justify-center text-xs font-bold text-white">
            {initials}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {profile ? children : (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-2 border-bod-blue border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
