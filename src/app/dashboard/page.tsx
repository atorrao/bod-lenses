'use client'

import { useState, useEffect } from 'react'
import AppShell from '@/components/layout/AppShell'
import { supabase } from '@/lib/supabase'
import { fmt, LENS_TYPES, MATERIALS, DEFAULT_PRICES, DEFAULT_COATINGS, currentMonth } from '@/lib/data'
import type { SaleEntry, Profile } from '@/lib/supabase'
import { TrendingUp, Euro, Users, Plus, Trash2, BarChart2 } from 'lucide-react'

type MatKey = '1.5' | '1.6' | '1.67' | 'solisII'

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [sales, setSales] = useState<SaleEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)

  // New sale form
  const [ns, setNs] = useState({
    lens_type: 'monofocal', material: '1.5' as MatKey,
    quantity: 1, margin_pct: 60
  })

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const [{ data: prof }, { data: sl }] = await Promise.all([
      supabase.from('optica_profiles').select('*').eq('id', session.user.id).single(),
      supabase.from('sales_log').select('*').eq('optica_id', session.user.id).order('created_at', { ascending: false })
    ])
    setProfile(prof)
    setSales(sl ?? [])
    setLoading(false)
  }

  const prices   = profile?.prices && Object.keys(profile.prices).length ? profile.prices : DEFAULT_PRICES
  const coatings = profile?.coatings && Object.keys(profile.coatings).length ? profile.coatings : DEFAULT_COATINGS

  const computedCost = () => prices[ns.lens_type]?.[ns.material] ?? 0
  const computedPvp  = () => computedCost() * (1 + ns.margin_pct / 100)
  const computedMargin = () => computedPvp() - computedCost()

  const addSale = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const entry: SaleEntry = {
      optica_id:    session.user.id,
      lens_type:    ns.lens_type,
      material:     ns.material,
      quantity:     ns.quantity,
      cost_per_pair: computedCost(),
      pvp_per_pair:  computedPvp(),
      margin_pct:    ns.margin_pct,
      month:         currentMonth(),
    }
    await supabase.from('sales_log').insert([entry])
    setShowAdd(false)
    load()
  }

  const deleteSale = async (id: string) => {
    await supabase.from('sales_log').delete().eq('id', id)
    setSales(prev => prev.filter(s => s.id !== id))
  }

  // Aggregates
  const totalPairs    = sales.reduce((a, s) => a + s.quantity, 0)
  const totalRevenue  = sales.reduce((a, s) => a + s.pvp_per_pair * s.quantity, 0)
  const totalCost     = sales.reduce((a, s) => a + s.cost_per_pair * s.quantity, 0)
  const totalMargin   = totalRevenue - totalCost
  // Competitor price estimate: BOD is ~20% cheaper
  const competitorEst = totalCost * 1.20
  const clientSaving  = competitorEst - totalCost

  // Monthly breakdown
  const byMonth = sales.reduce<Record<string, { revenue: number; margin: number; pairs: number }>>((acc, s) => {
    if (!acc[s.month]) acc[s.month] = { revenue: 0, margin: 0, pairs: 0 }
    acc[s.month].revenue += s.pvp_per_pair * s.quantity
    acc[s.month].margin  += (s.pvp_per_pair - s.cost_per_pair) * s.quantity
    acc[s.month].pairs   += s.quantity
    return acc
  }, {})
  const months = Object.entries(byMonth).sort(([a], [b]) => b.localeCompare(a)).slice(0, 6)
  const maxMargin = Math.max(...months.map(([, v]) => v.margin), 1)

  const lensLabel = (k: string) => LENS_TYPES.find(l => l.key === k)?.label ?? k
  const matLabel  = (k: string) => MATERIALS.find(m => m.key === k)?.label ?? k

  return (
    <AppShell>
      <div className="px-4 md:px-8 py-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-bod-blue mb-1">Dashboard</p>
            <h1 className="font-display text-2xl font-bold text-bod-dark">
              Bom dia{profile?.contact_name ? `, ${profile.contact_name.split(' ')[0]}` : ''}
            </h1>
            <p className="text-sm text-gray-400 mt-1">Resumo do valor gerado com BOD Lenses</p>
          </div>
          <button className="btn-primary shrink-0" onClick={() => setShowAdd(true)}>
            <Plus size={16} /> Registar venda
          </button>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Euro,      label: 'Margem bruta total',         value: fmt(totalMargin),  sub: 'acumulado',         color: 'text-green-600', bg: 'bg-green-50' },
            { icon: TrendingUp,label: 'Faturação total (PVP)',      value: fmt(totalRevenue), sub: 'valor faturado',    color: 'text-bod-blue',  bg: 'bg-bod-light' },
            { icon: Users,     label: 'Poupança para os clientes',  value: fmt(clientSaving), sub: 'vs. concorrência',  color: 'text-purple-600',bg: 'bg-purple-50' },
            { icon: BarChart2, label: 'Pares vendidos',             value: totalPairs.toString(), sub: 'pares registados', color: 'text-amber-600', bg: 'bg-amber-50' },
          ].map(c => (
            <div key={c.label} className="card p-4 md:p-5">
              <div className={`w-9 h-9 rounded-xl ${c.bg} flex items-center justify-center mb-3`}>
                <c.icon size={18} className={c.color} />
              </div>
              <p className="font-display text-xl md:text-2xl font-bold text-bod-dark">{c.value}</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-tight">{c.label}</p>
              <p className="text-xs text-gray-300 mt-0.5">{c.sub}</p>
            </div>
          ))}
        </div>

        {/* MARGIN BAR CHART */}
        {months.length > 0 && (
          <div className="card p-5 md:p-6">
            <h2 className="font-semibold text-sm text-bod-dark mb-5">Margem bruta por mês</h2>
            <div className="flex items-end gap-3 h-32">
              {months.reverse().map(([month, v]) => {
                const pct = (v.margin / maxMargin) * 100
                const label = new Date(month + '-01').toLocaleDateString('pt-PT', { month: 'short', year: '2-digit' })
                return (
                  <div key={month} className="flex-1 flex flex-col items-center gap-1.5">
                    <span className="text-xs text-gray-400 font-medium hidden md:block">{fmt(v.margin)}</span>
                    <div className="w-full flex items-end justify-center" style={{ height: '80px' }}>
                      <div className="w-full bg-bod-blue rounded-t-lg transition-all"
                        style={{ height: `${Math.max(pct, 4)}%` }} />
                    </div>
                    <span className="text-xs text-gray-400 font-medium">{label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ADVANTAGE BREAKDOWN */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="card p-5">
            <h2 className="font-semibold text-sm text-bod-dark mb-4">A sua vantagem BOD</h2>
            <div className="space-y-3">
              {[
                { label: 'Custo total BOD', value: fmt(totalCost), color: 'bg-bod-blue' },
                { label: 'Estimativa concorrência', value: fmt(competitorEst), color: 'bg-gray-200' },
                { label: 'Poupança para os clientes', value: fmt(clientSaving), color: 'bg-purple-400' },
                { label: 'Margem bruta gerada', value: fmt(totalMargin), color: 'bg-green-400' },
              ].map(r => (
                <div key={r.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${r.color}`} />
                    <span className="text-sm text-gray-500">{r.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-bod-dark">{r.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent sales */}
          <div className="card p-5">
            <h2 className="font-semibold text-sm text-bod-dark mb-4">Últimas vendas registadas</h2>
            {sales.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-gray-300">Sem vendas registadas ainda.</p>
                <button className="btn-outline mt-3 text-xs py-2" onClick={() => setShowAdd(true)}>
                  <Plus size={13} /> Registar primeira venda
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {sales.slice(0, 6).map(s => (
                  <div key={s.id} className="flex items-center justify-between py-2 border-b border-bod-light last:border-0">
                    <div>
                      <p className="text-sm font-medium text-bod-dark">{lensLabel(s.lens_type)}</p>
                      <p className="text-xs text-gray-400">{matLabel(s.material)} · {s.quantity} par{s.quantity > 1 ? 'es' : ''}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-green-600">+{fmt((s.pvp_per_pair - s.cost_per_pair) * s.quantity)}</p>
                        <p className="text-xs text-gray-400">PVP {fmt(s.pvp_per_pair)}</p>
                      </div>
                      <button onClick={() => deleteSale(s.id!)} className="text-gray-300 hover:text-red-400 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ADD SALE MODAL */}
        {showAdd && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
            onClick={() => setShowAdd(false)}>
            <div className="bg-white w-full md:max-w-md rounded-t-3xl md:rounded-2xl p-6 space-y-4"
              onClick={e => e.stopPropagation()}>
              <h3 className="font-display font-bold text-lg text-bod-dark">Registar venda</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Tipo de lente</label>
                  <select className="input" value={ns.lens_type} onChange={e => setNs(p => ({ ...p, lens_type: e.target.value }))}>
                    {LENS_TYPES.map(l => <option key={l.key} value={l.key}>{l.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Material</label>
                  <select className="input" value={ns.material} onChange={e => setNs(p => ({ ...p, material: e.target.value as MatKey }))}>
                    {MATERIALS.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Quantidade</label>
                  <input type="number" min="1" className="input" value={ns.quantity}
                    onChange={e => setNs(p => ({ ...p, quantity: parseInt(e.target.value) || 1 }))} />
                </div>
                <div>
                  <label className="label">Margem (%)</label>
                  <input type="number" min="0" className="input" value={ns.margin_pct}
                    onChange={e => setNs(p => ({ ...p, margin_pct: parseFloat(e.target.value) || 0 }))} />
                </div>
              </div>
              <div className="bg-bod-xlight rounded-xl p-4 space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Custo BOD</span><span className="font-semibold">{fmt(computedCost() * ns.quantity)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">PVP total</span><span className="font-semibold">{fmt(computedPvp() * ns.quantity)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Margem</span><span className="font-semibold text-green-600">+{fmt(computedMargin() * ns.quantity)}</span></div>
              </div>
              <div className="flex gap-3">
                <button className="btn-ghost flex-1" onClick={() => setShowAdd(false)}>Cancelar</button>
                <button className="btn-primary flex-1" onClick={addSale}>Guardar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}
