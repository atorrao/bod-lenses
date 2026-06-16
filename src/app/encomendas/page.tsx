'use client'

import { useState, useEffect, useCallback } from 'react'
import AppShell from '@/components/layout/AppShell'
import { supabase } from '@/lib/supabase'
import { fmt } from '@/lib/data'
import { Trash2, Search, ChevronDown, ChevronUp, BarChart2 } from 'lucide-react'

type Sale = {
  id: string
  created_at: string
  lens_type: string
  material: string
  quantity: number
  cost_per_pair: number
  pvp_per_pair: number
  margin_pct: number
  month: string
  product_name?: string
}

export default function EncomendasPage() {
  const [sales,        setSales]        = useState<Sale[]>([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [filterMonth,  setFilterMonth]  = useState('')
  const [expanded,     setExpanded]     = useState<string | null>(null)
  const [months,       setMonths]       = useState<string[]>([])

  const load = useCallback(async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const { data } = await supabase
      .from('sales_log')
      .select('*')
      .eq('optica_id', session.user.id)
      .order('created_at', { ascending: false })
    setSales(data ?? [])
    const ms = Array.from(new Set((data ?? []).map((s: any) => s.month))).sort().reverse() as string[]
    setMonths(ms)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const deleteSale = async (id: string) => {
    await supabase.from('sales_log').delete().eq('id', id)
    setSales(prev => prev.filter(s => s.id !== id))
  }

  const filtered = sales.filter(s => {
    const matchSearch = !search || (s.product_name ?? s.lens_type).toLowerCase().includes(search.toLowerCase())
    const matchMonth  = !filterMonth || s.month === filterMonth
    return matchSearch && matchMonth
  })

  const totalPairs   = filtered.reduce((a, s) => a + s.quantity, 0)
  const totalRevenue = filtered.reduce((a, s) => a + s.pvp_per_pair * s.quantity, 0)
  const totalMargin  = filtered.reduce((a, s) => a + (s.pvp_per_pair - s.cost_per_pair) * s.quantity, 0)

  return (
    <AppShell>
      <div className="px-4 md:px-8 py-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-widests text-bod-blue mb-1">Histórico</p>
          <h1 className="font-display text-2xl font-bold text-bod-dark">Encomendas registadas</h1>
          <p className="text-sm text-gray-400 mt-1">Todas as vendas registadas na sua conta.</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Pares',          value: totalPairs },
            { label: 'Faturação PVP',  value: fmt(totalRevenue) },
            { label: 'Margem bruta',   value: fmt(totalMargin) },
          ].map(k => (
            <div key={k.label} className="card p-4 text-center">
              <p className="font-display text-xl font-bold text-bod-dark">{k.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{k.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-10" placeholder="Pesquisar produto..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input w-40" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
            <option value="">Todos os meses</option>
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        {/* List */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-14">
              <div className="w-7 h-7 border-2 border-bod-blue border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-14 text-gray-300 text-sm">Sem encomendas registadas.</div>
          ) : (
            <div className="divide-y divide-bod-light">
              {filtered.map(s => {
                const isOpen   = expanded === s.id
                const margin   = (s.pvp_per_pair - s.cost_per_pair) * s.quantity
                return (
                  <div key={s.id}>
                    <div className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-bod-xlight transition-colors"
                      onClick={() => setExpanded(isOpen ? null : s.id)}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-bod-dark truncate">
                          {s.product_name ?? s.lens_type}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-xs text-gray-400">{s.month}</span>
                          {s.material && <>
                            <span className="text-xs text-gray-300">·</span>
                            <span className="text-xs bg-bod-light text-bod-blue font-medium px-1.5 py-0.5 rounded">{s.material}</span>
                          </>}
                          <span className="text-xs text-gray-300">·</span>
                          <span className="text-xs text-gray-400">{s.quantity} par{s.quantity > 1 ? 'es' : ''}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <p className="text-sm font-bold text-green-600">+{fmt(margin)}</p>
                          <p className="text-xs text-gray-400">PVP {fmt(s.pvp_per_pair * s.quantity)}</p>
                        </div>
                        {isOpen
                          ? <ChevronUp size={16} className="text-gray-400" />
                          : <ChevronDown size={16} className="text-gray-400" />}
                      </div>
                    </div>

                    {isOpen && (
                      <div className="px-4 pb-4 border-t border-bod-light">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                          {[
                            { label: 'Tipo de lente',   value: s.lens_type },
                            { label: 'Material',        value: s.material || '—' },
                            { label: 'Quantidade',      value: `${s.quantity} par${s.quantity > 1 ? 'es' : ''}` },
                            { label: 'Margem aplicada', value: `${Math.round(s.margin_pct)}%` },
                            { label: 'Custo BOD / par', value: fmt(s.cost_per_pair) },
                            { label: 'PVP / par',       value: fmt(s.pvp_per_pair) },
                            { label: 'Margem / par',    value: fmt(s.pvp_per_pair - s.cost_per_pair) },
                            { label: 'Margem total',    value: fmt(margin) },
                            { label: 'Custo total',     value: fmt(s.cost_per_pair * s.quantity) },
                            { label: 'Faturação total', value: fmt(s.pvp_per_pair * s.quantity) },
                            { label: 'Mês',             value: s.month },
                            { label: 'Data',            value: new Date(s.created_at).toLocaleString('pt-PT') },
                          ].map(d => (
                            <div key={d.label} className="bg-bod-xlight rounded-xl px-3 py-2.5">
                              <p className="text-xs text-gray-400 mb-0.5">{d.label}</p>
                              <p className="text-sm font-semibold text-bod-dark">{d.value}</p>
                            </div>
                          ))}
                        </div>
                        {s.product_name && (
                          <div className="mt-3 bg-white border border-bod-light rounded-xl px-3 py-2.5">
                            <p className="text-xs text-gray-400 mb-0.5">Produto</p>
                            <p className="text-sm font-semibold text-bod-dark">{s.product_name}</p>
                          </div>
                        )}
                        <button onClick={() => deleteSale(s.id)}
                          className="mt-3 flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 font-medium transition-colors">
                          <Trash2 size={13} /> Remover registo
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
