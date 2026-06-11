'use client'

import { useEffect, useState } from 'react'
import AdminShell from '@/components/layout/AdminShell'
import { supabase } from '@/lib/supabase'
import { fmt, LENS_TYPES, MATERIALS } from '@/lib/data'
import { Download, Search } from 'lucide-react'

export default function AdminVendas() {
  const [sales,   setSales]   = useState<any[]>([])
  const [oticas,  setOticas]  = useState<any[]>([])
  const [search,  setSearch]  = useState('')
  const [filterOptica, setFilterOptica] = useState('')
  const [filterMonth,  setFilterMonth]  = useState('')

  useEffect(() => { load() }, [])

  const load = async () => {
    const [{ data: sl }, { data: op }] = await Promise.all([
      supabase.from('sales_log').select('*').order('created_at', { ascending: false }),
      supabase.from('optica_profiles').select('id, optica_name, email').eq('status', 'approved'),
    ])
    setSales(sl ?? [])
    setOticas(op ?? [])
  }

  const opticaName = (id: string) => oticas.find(o => o.id === id)?.optica_name ?? id

  const filtered = sales.filter(s => {
    const name = opticaName(s.optica_id).toLowerCase()
    const matchSearch = !search || name.includes(search.toLowerCase()) || s.lens_type.includes(search.toLowerCase())
    const matchOptica = !filterOptica || s.optica_id === filterOptica
    const matchMonth  = !filterMonth  || s.month === filterMonth
    return matchSearch && matchOptica && matchMonth
  })

  const totalRevenue = filtered.reduce((a, s) => a + s.pvp_per_pair * s.quantity, 0)
  const totalMargin  = filtered.reduce((a, s) => a + (s.pvp_per_pair - s.cost_per_pair) * s.quantity, 0)
  const totalPairs   = filtered.reduce((a, s) => a + s.quantity, 0)

  const months = Array.from(new Set(sales.map(s => s.month))).sort().reverse()
  const lensLabel = (k: string) => LENS_TYPES.find(l => l.key === k)?.label ?? k
  const matLabel  = (k: string) => MATERIALS.find(m => m.key === k)?.label ?? k

  const exportCSV = () => {
    const headers = ['Ótica','Tipo de lente','Material','Quantidade','Custo/par','PVP/par','Margem/par','Margem total','Mês','Data']
    const rows = filtered.map(s => [
      opticaName(s.optica_id),
      lensLabel(s.lens_type), matLabel(s.material),
      s.quantity, s.cost_per_pair.toFixed(2), s.pvp_per_pair.toFixed(2),
      (s.pvp_per_pair - s.cost_per_pair).toFixed(2),
      ((s.pvp_per_pair - s.cost_per_pair) * s.quantity).toFixed(2),
      s.month, new Date(s.created_at).toLocaleDateString('pt-PT')
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'bod-vendas.csv'; a.click()
  }

  return (
    <AdminShell>
      <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-bod-dark">Vendas</h1>
            <p className="text-sm text-gray-400 mt-0.5">Registo de vendas de todas as óticas</p>
          </div>
          <button className="btn-outline shrink-0" onClick={exportCSV}>
            <Download size={15} /> Exportar CSV
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Pares filtrados',    value: totalPairs },
            { label: 'Faturação (PVP)',    value: fmt(totalRevenue) },
            { label: 'Margem bruta total', value: fmt(totalMargin) },
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
            <input className="input pl-10" placeholder="Pesquisar..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input" value={filterOptica} onChange={e => setFilterOptica(e.target.value)}>
            <option value="">Todas as óticas</option>
            {oticas.map(o => <option key={o.id} value={o.id}>{o.optica_name ?? o.email}</option>)}
          </select>
          <select className="input" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
            <option value="">Todos os meses</option>
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Ótica','Lente','Material','Qtd','Custo/par','PVP/par','Margem','Mês'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide text-gray-400 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-bod-dark whitespace-nowrap">{opticaName(s.optica_id)}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{lensLabel(s.lens_type)}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{matLabel(s.material)}</td>
                    <td className="px-4 py-3 text-gray-500">{s.quantity}</td>
                    <td className="px-4 py-3 text-gray-500">{fmt(s.cost_per_pair)}</td>
                    <td className="px-4 py-3 font-medium text-bod-dark">{fmt(s.pvp_per_pair)}</td>
                    <td className="px-4 py-3 font-semibold text-green-600">+{fmt((s.pvp_per_pair - s.cost_per_pair) * s.quantity)}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{s.month}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="text-center text-gray-300 py-10 text-sm">Sem vendas registadas.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
