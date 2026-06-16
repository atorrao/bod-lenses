'use client'

import { useEffect, useState, useCallback } from 'react'
import AdminShell from '@/components/layout/AdminShell'
import { supabase } from '@/lib/supabase'
import { fmt } from '@/lib/data'
import { Download, Search, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react'

const CAT_LABELS: Record<string,string> = {
  'RX MONOFOCAL':'Monofocal RX','RX PROGRESSIVA':'Progressiva RX',
  'RX BIFOCAL':'Bifocal RX','RX COLORAÇÃO/TINT':'Coloração / Tint',
  'STOCK NANO BASIC':'Stock Basic','STOCK NANO LONGUS':'Stock Longus',
  'STOCK NANO BLUELINE':'Stock Blueline','STOCK NANO ACHROMATIC':'Stock Achromatic',
  'STOCK NANO SOLIS':'Stock Solis','STOCK NANO TINTING':'Stock Tinting',
  'STOCK NANO TRANS GENS':'Trans Gens','STOCK TRANS XTRA':'Trans Xtra',
  'STOCK BLUE420':'Blue420','SUPLEMENTOS':'Suplementos',
}

const PAGE_SIZE = 50

export default function AdminVendas() {
  const [sales,         setSales]         = useState<any[]>([])
  const [oticas,        setOticas]        = useState<any[]>([])
  const [total,         setTotal]         = useState(0)
  const [loading,       setLoading]       = useState(true)
  const [search,        setSearch]        = useState('')
  const [filterOptica,  setFilterOptica]  = useState('')
  const [filterMonth,   setFilterMonth]   = useState('')
  const [page,          setPage]          = useState(0)
  const [expanded,      setExpanded]      = useState<string | null>(null)
  const [months,        setMonths]        = useState<string[]>([])

  const load = useCallback(async (s: string, optica: string, month: string, p: number) => {
    setLoading(true)
    let q = supabase.from('sales_log').select('*', { count: 'exact' })
    if (optica) q = (q as any).eq('optica_id', optica)
    if (month)  q = (q as any).eq('month', month)
    if (s)      q = (q as any).ilike('product_name', `%${s}%`)
    q = (q as any).order('created_at', { ascending: false }).range(p * PAGE_SIZE, (p+1) * PAGE_SIZE - 1)
    const { data, count } = await q
    setSales(data ?? [])
    setTotal(count ?? 0)
    setLoading(false)
  }, [])

  const loadMeta = useCallback(async () => {
    const [{ data: ops }, { data: sl }] = await Promise.all([
      supabase.from('optica_profiles').select('id, optica_name, email').eq('status', 'approved'),
      supabase.from('sales_log').select('month'),
    ])
    setOticas(ops ?? [])
    const ms = Array.from(new Set((sl ?? []).map((s: any) => s.month))).sort().reverse() as string[]
    setMonths(ms)
  }, [])

  useEffect(() => { loadMeta() }, [loadMeta])
  useEffect(() => { load(search, filterOptica, filterMonth, page) }, [search, filterOptica, filterMonth, page, load])

  const opticaName = (id: string) => oticas.find(o => o.id === id)?.optica_name ?? '—'

  // Aggregates of filtered sales
  const totalRevenue = sales.reduce((a, s) => a + s.pvp_per_pair * s.quantity, 0)
  const totalMargin  = sales.reduce((a, s) => a + (s.pvp_per_pair - s.cost_per_pair) * s.quantity, 0)
  const totalPairs   = sales.reduce((a, s) => a + s.quantity, 0)

  const exportCSV = () => {
    const headers = ['Ótica','Produto','Tipo de lente','Material','Qtd','Custo/par','PVP/par','Margem/par','Margem total','Mês','Data']
    const rows = sales.map(s => [
      opticaName(s.optica_id),
      s.product_name ?? s.lens_type,
      s.lens_type, s.material ?? '',
      s.quantity,
      (s.cost_per_pair ?? 0).toFixed(2),
      (s.pvp_per_pair ?? 0).toFixed(2),
      (s.pvp_per_pair - s.cost_per_pair).toFixed(2),
      ((s.pvp_per_pair - s.cost_per_pair) * s.quantity).toFixed(2),
      s.month,
      new Date(s.created_at).toLocaleString('pt-PT')
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], {type:'text/csv'})); a.download = 'bod-vendas.csv'; a.click()
  }

  return (
    <AdminShell>
      <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-bod-dark">Vendas</h1>
            <p className="text-sm text-gray-400 mt-0.5">Registo de vendas de todas as óticas</p>
          </div>
          <button className="btn-outline shrink-0" onClick={exportCSV}>
            <Download size={15} /> Exportar CSV
          </button>
        </div>

        {/* Summary KPIs */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Pares (filtrados)',   value: totalPairs },
            { label: 'Faturação PVP',       value: fmt(totalRevenue) },
            { label: 'Margem bruta total',  value: fmt(totalMargin) },
          ].map(s => (
            <div key={s.label} className="card p-4 text-center">
              <p className="font-display text-xl font-bold text-bod-dark">{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-10" placeholder="Pesquisar produto..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} />
          </div>
          <select className="input" value={filterOptica} onChange={e => { setFilterOptica(e.target.value); setPage(0) }}>
            <option value="">Todas as óticas</option>
            {oticas.map(o => <option key={o.id} value={o.id}>{o.optica_name ?? o.email}</option>)}
          </select>
          <select className="input" value={filterMonth} onChange={e => { setFilterMonth(e.target.value); setPage(0) }}>
            <option value="">Todos os meses</option>
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        {/* Sales list */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-14">
              <div className="w-7 h-7 border-2 border-bod-blue border-t-transparent rounded-full animate-spin" />
            </div>
          ) : sales.length === 0 ? (
            <div className="text-center py-14 text-gray-300 text-sm">Sem vendas registadas.</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {sales.map(s => {
                const isOpen   = expanded === s.id
                const margin   = (s.pvp_per_pair - s.cost_per_pair) * s.quantity
                const marginPct = s.margin_pct ?? Math.round(((s.pvp_per_pair - s.cost_per_pair) / s.cost_per_pair) * 100)

                return (
                  <div key={s.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Row */}
                    <div className="flex items-center gap-3 px-4 py-3.5 cursor-pointer"
                      onClick={() => setExpanded(isOpen ? null : s.id)}>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-bod-dark truncate">
                          {s.product_name ?? s.lens_type}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-xs text-gray-400">{opticaName(s.optica_id)}</span>
                          <span className="text-xs text-gray-300">·</span>
                          <span className="text-xs text-gray-400">{s.month}</span>
                          {s.material && <>
                            <span className="text-xs text-gray-300">·</span>
                            <span className="text-xs bg-bod-light text-bod-blue font-medium px-1.5 py-0.5 rounded">{s.material}</span>
                          </>}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right hidden sm:block">
                          <p className="text-xs text-gray-400">{s.quantity} par{s.quantity > 1 ? 'es' : ''}</p>
                          <p className="text-xs text-gray-400">PVP {fmt(s.pvp_per_pair)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-green-600">+{fmt(margin)}</p>
                          <p className="text-xs text-gray-400">{marginPct}% margem</p>
                        </div>
                        {isOpen
                          ? <ChevronUp size={16} className="text-gray-400 shrink-0" />
                          : <ChevronDown size={16} className="text-gray-400 shrink-0" />}
                      </div>
                    </div>

                    {/* Expanded detail */}
                    {isOpen && (
                      <div className="px-4 pb-4 border-t border-gray-100">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                          {[
                            { label: 'Ótica',            value: opticaName(s.optica_id) },
                            { label: 'Tipo de lente',    value: s.lens_type },
                            { label: 'Material / Índice',value: s.material || '—' },
                            { label: 'Quantidade',       value: `${s.quantity} par${s.quantity > 1 ? 'es' : ''}` },
                            { label: 'Custo BOD / par',  value: fmt(s.cost_per_pair) },
                            { label: 'PVP / par',        value: fmt(s.pvp_per_pair) },
                            { label: 'Margem / par',     value: fmt(s.pvp_per_pair - s.cost_per_pair) },
                            { label: 'Margem total',     value: fmt(margin) },
                            { label: 'Custo total',      value: fmt(s.cost_per_pair * s.quantity) },
                            { label: 'Faturação total',  value: fmt(s.pvp_per_pair * s.quantity) },
                            { label: 'Mês',              value: s.month },
                            { label: 'Data / hora',      value: new Date(s.created_at).toLocaleString('pt-PT') },
                          ].map(d => (
                            <div key={d.label} className="bg-gray-50 rounded-xl px-3 py-2.5">
                              <p className="text-xs text-gray-400 mb-0.5">{d.label}</p>
                              <p className="text-sm font-semibold text-bod-dark">{d.value}</p>
                            </div>
                          ))}
                        </div>
                        {s.product_name && (
                          <div className="mt-3 bg-bod-xlight rounded-xl px-3 py-2.5">
                            <p className="text-xs text-gray-400 mb-0.5">Produto</p>
                            <p className="text-sm font-semibold text-bod-dark">{s.product_name}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {total > PAGE_SIZE && (
          <div className="flex items-center justify-between text-sm">
            <p className="text-gray-400">{page*PAGE_SIZE+1}–{Math.min((page+1)*PAGE_SIZE,total)} de {total.toLocaleString('pt-PT')}</p>
            <div className="flex gap-2">
              <button className="btn-outline py-2 px-4 disabled:opacity-40" disabled={page===0} onClick={() => setPage(p=>p-1)}>← Anterior</button>
              <button className="btn-outline py-2 px-4 disabled:opacity-40" disabled={(page+1)*PAGE_SIZE>=total} onClick={() => setPage(p=>p+1)}>Seguinte →</button>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  )
}
