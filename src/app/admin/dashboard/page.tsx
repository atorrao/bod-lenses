'use client'

import { useEffect, useState } from 'react'
import AdminShell from '@/components/layout/AdminShell'
import { supabase } from '@/lib/supabase'
import { fmt } from '@/lib/data'
import { Building2, ShoppingBag, Euro, UserCheck, MessageSquare } from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOticas: 0, approvedOticas: 0, pendingOticas: 0,
    totalSales: 0, totalRevenue: 0, totalMargin: 0,
    pendingRequests: 0, newMessages: 0,
  })
  const [recentOticas, setRecentOticas] = useState<any[]>([])
  const [recentSales,  setRecentSales]  = useState<any[]>([])

  useEffect(() => { load() }, [])

  const load = async () => {
    const [
      { data: oticas },
      { data: sales },
      { data: requests },
      { data: messages },
    ] = await Promise.all([
      supabase.from('optica_profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('sales_log').select('*').order('created_at', { ascending: false }),
      supabase.from('access_requests').select('*').eq('status', 'pending').order('created_at', { ascending: false }),
      supabase.from('contact_messages').select('id, status'),
    ])

    const approved   = (oticas ?? []).filter((o: any) => o.status === 'approved').length
    const pending    = (oticas ?? []).filter((o: any) => o.status === 'pending').length
    const revenue    = (sales ?? []).reduce((a: number, s: any) => a + s.pvp_per_pair * s.quantity, 0)
    const margin     = (sales ?? []).reduce((a: number, s: any) => a + (s.pvp_per_pair - s.cost_per_pair) * s.quantity, 0)
    const newMsgs    = (messages ?? []).filter((m: any) => m.status === 'new').length

    setStats({
      totalOticas: (oticas ?? []).length,
      approvedOticas: approved,
      pendingOticas: pending,
      totalSales: (sales ?? []).reduce((a: number, s: any) => a + s.quantity, 0),
      totalRevenue: revenue,
      totalMargin: margin,
      pendingRequests: (requests ?? []).length,
      newMessages: newMsgs,
    })
    setRecentOticas((oticas ?? []).slice(0, 5))
    setRecentSales((sales ?? []).slice(0, 6))
  }

  return (
    <AdminShell>
      <div className="px-4 md:px-8 py-6 max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-bod-dark">Dashboard Admin</h1>
          <p className="text-sm text-gray-400 mt-1">Visão geral da plataforma BOD Lenses</p>
        </div>

        {/* NEW MESSAGES BANNER */}
        {(stats.newMessages > 0 || stats.pendingRequests > 0) && (
          <div className="flex flex-col sm:flex-row gap-3">
            {stats.newMessages > 0 && (
              <Link href="/admin/pedidos" className="flex-1 flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl hover:bg-amber-100 transition-colors">
                <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                  <MessageSquare size={18} className="text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-800">{stats.newMessages} nova{stats.newMessages !== 1 ? 's' : ''} mensagem{stats.newMessages !== 1 ? 's' : ''}</p>
                  <p className="text-xs text-amber-600">A aguardar resposta — clique para ver</p>
                </div>
                <span className="w-6 h-6 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center justify-center shrink-0">{stats.newMessages}</span>
              </Link>
            )}
            {stats.pendingRequests > 0 && (
              <Link href="/admin/pedidos" className="flex-1 flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-2xl hover:bg-purple-100 transition-colors">
                <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                  <UserCheck size={18} className="text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-purple-800">{stats.pendingRequests} pedido{stats.pendingRequests !== 1 ? 's' : ''} de acesso pendente{stats.pendingRequests !== 1 ? 's' : ''}</p>
                  <p className="text-xs text-purple-600">A aguardar aprovação</p>
                </div>
                <span className="w-6 h-6 bg-purple-500 text-white text-xs font-bold rounded-full flex items-center justify-center shrink-0">{stats.pendingRequests}</span>
              </Link>
            )}
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Building2, label: 'Óticas aprovadas',    value: stats.approvedOticas, sub: `${stats.pendingOticas} pendentes`,  color: 'text-bod-blue',   bg: 'bg-bod-light' },
            { icon: ShoppingBag,label: 'Pares vendidos',      value: stats.totalSales,     sub: 'total registado',                  color: 'text-amber-600',  bg: 'bg-amber-50' },
            { icon: Euro,       label: 'Faturação total PVP', value: fmt(stats.totalRevenue), sub: 'todas as óticas',               color: 'text-green-600',  bg: 'bg-green-50' },
            { icon: UserCheck,  label: 'Pedidos pendentes',   value: stats.pendingRequests, sub: 'a aguardar aprovação',            color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map(c => (
            <div key={c.label} className="card p-4">
              <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center mb-3`}>
                <c.icon size={18} className={c.color} />
              </div>
              <p className="font-display text-xl font-bold text-bod-dark">{c.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{c.label}</p>
              <p className="text-xs text-gray-300">{c.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Recent óticas */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm text-bod-dark">Óticas recentes</h2>
              <Link href="/admin/oticas" className="text-xs text-bod-blue font-semibold hover:underline">Ver todas →</Link>
            </div>
            <div className="space-y-2">
              {recentOticas.map((o: any) => (
                <div key={o.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-bod-dark">{o.optica_name ?? '—'}</p>
                    <p className="text-xs text-gray-400">{o.email}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    o.status === 'approved' ? 'bg-green-100 text-green-700' :
                    o.status === 'pending'  ? 'bg-amber-100 text-amber-600' :
                    'bg-red-100 text-red-500'
                  }`}>{o.status}</span>
                </div>
              ))}
              {recentOticas.length === 0 && <p className="text-xs text-gray-300 text-center py-4">Sem óticas registadas.</p>}
            </div>
          </div>

          {/* Recent sales */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm text-bod-dark">Vendas recentes</h2>
              <Link href="/admin/vendas" className="text-xs text-bod-blue font-semibold hover:underline">Ver todas →</Link>
            </div>
            <div className="space-y-2">
              {recentSales.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-bod-dark capitalize">{s.lens_type} · {s.material}</p>
                    <p className="text-xs text-gray-400">{s.quantity} par{s.quantity > 1 ? 'es' : ''} · {s.month}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">+{fmt((s.pvp_per_pair - s.cost_per_pair) * s.quantity)}</p>
                    <p className="text-xs text-gray-400">PVP {fmt(s.pvp_per_pair * s.quantity)}</p>
                  </div>
                </div>
              ))}
              {recentSales.length === 0 && <p className="text-xs text-gray-300 text-center py-4">Sem vendas registadas.</p>}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
