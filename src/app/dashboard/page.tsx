'use client'

import { useState, useEffect, useCallback } from 'react'
import AppShell from '@/components/layout/AppShell'
import { supabase } from '@/lib/supabase'
import { fmt, currentMonth } from '@/lib/data'
import type { SaleEntry, Profile } from '@/lib/supabase'
import { TrendingUp, Euro, Users, Plus, Trash2, BarChart2, MessageSquare, Bell, X, ChevronDown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// ── Same cascade types as calculator ───────────────────────
const LENS_TYPE_MAP: Record<string, string[]> = {
  'Monofocal':        ['RX MONOFOCAL','STOCK NANO BASIC','STOCK NANO LONGUS','STOCK NANO BLUELINE','STOCK NANO ACHROMATIC','STOCK NANO SOLIS','STOCK BLUE420'],
  'Progressiva':      ['RX PROGRESSIVA'],
  'Bifocal':          ['RX BIFOCAL'],
  'Coloração / Tint': ['RX COLORAÇÃO/TINT','STOCK NANO TINTING'],
  'Fotocromática':    ['STOCK NANO TRANS GENS','STOCK TRANS XTRA'],
  'Suplementos':      ['SUPLEMENTOS'],
}
const LENS_TYPES_ORDER = ['Monofocal','Progressiva','Bifocal','Coloração / Tint','Fotocromática','Suplementos']

type SaleStep = 'lensType' | 'product' | 'config'

export default function DashboardPage() {
  const router = useRouter()
  const [profile, setProfile]   = useState<Profile | null>(null)
  const [sales,   setSales]     = useState<SaleEntry[]>([])
  const [loading, setLoading]   = useState(true)
  const [showAdd, setShowAdd]   = useState(false)

  // Messages notification
  const [unreplied, setUnreplied]   = useState(0)  // messages with BOD reply not yet seen
  const [newReplies, setNewReplies] = useState(0)  // replies from BOD since last visit

  // Sale form — cascade like calculator
  const [saleStep,    setSaleStep]    = useState<SaleStep>('lensType')
  const [saleLensType, setSaleLensType] = useState('')
  const [products,    setProducts]    = useState<any[]>([])
  const [prodSearch,  setProdSearch]  = useState('')
  const [selectedProd, setSelectedProd] = useState<any | null>(null)
  const [quantity,    setQuantity]    = useState(1)
  const [margem,      setMargem]      = useState(60)
  const [loadingProd, setLoadingProd] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const [{ data: prof }, { data: sl }, { data: msgs }, { data: replies }] = await Promise.all([
      supabase.from('optica_profiles').select('*').eq('id', session.user.id).single(),
      supabase.from('sales_log').select('*').eq('optica_id', session.user.id).order('created_at', { ascending: false }),
      supabase.from('contact_messages').select('id, status').eq('optica_id', session.user.id),
      supabase.from('message_replies').select('message_id').eq('author', 'admin'),
    ])
    setProfile(prof)
    setSales(sl ?? [])

    // Show banner when any of the optica's messages have a BOD reply
    const msgIds = (msgs ?? []).map((m: any) => m.id)
    const repliedMsgIds = new Set((replies ?? []).map((r: any) => r.message_id))
    const countWithReplies = msgIds.filter((id: string) => repliedMsgIds.has(id)).length
    setNewReplies(countWithReplies)

    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // Load products for selected lens type
  const loadProducts = async (lensType: string) => {
    setLoadingProd(true)
    const cats = LENS_TYPE_MAP[lensType] ?? []
    const { data } = await (supabase.from('products').select('id,name,optician_price,pvpr,category,index_val,coating').in('category', cats) as any).order('name').limit(500)
    setProducts(data ?? [])
    setLoadingProd(false)
  }

  const selectLensType = async (lt: string) => {
    setSaleLensType(lt)
    await loadProducts(lt)
    setSaleStep('product')
  }

  const selectProduct = (p: any) => {
    setSelectedProd(p)
    setSaleStep('config')
  }

  const resetSaleForm = () => {
    setSaleStep('lensType')
    setSaleLensType('')
    setSelectedProd(null)
    setProducts([])
    setProdSearch('')
    setQuantity(1)
    setMargem(60)
  }

  const cost = selectedProd?.optician_price ?? 0
  const pvp  = cost * (1 + margem / 100)
  const margin = pvp - cost

  const addSale = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session || !selectedProd) return
    const entry: SaleEntry = {
      optica_id:      session.user.id,
      lens_type:      saleLensType,
      material:       selectedProd.index_val ?? '',
      quantity,
      cost_per_pair:  cost,
      pvp_per_pair:   pvp,
      margin_pct:     margem,
      month:          currentMonth(),
    }
    await Promise.all([
      supabase.from('sales_log').insert([{ ...entry, product_id: selectedProd.id, product_name: selectedProd.name }]),
      // Increment sales_count on the product
      supabase.rpc('increment_product_sales_by', { p_id: selectedProd.id, p_qty: quantity }),
    ])
    setShowAdd(false)
    resetSaleForm()
    load()
  }

  const deleteSale = async (id: string) => {
    await supabase.from('sales_log').delete().eq('id', id)
    setSales(prev => prev.filter(s => s.id !== id))
  }

  // Aggregates
  const totalPairs   = sales.reduce((a, s) => a + s.quantity, 0)
  const totalRevenue = sales.reduce((a, s) => a + s.pvp_per_pair * s.quantity, 0)
  const totalCost    = sales.reduce((a, s) => a + s.cost_per_pair * s.quantity, 0)
  const totalMargin  = totalRevenue - totalCost
  const clientSaving = totalCost * 0.20

  const byMonth = sales.reduce<Record<string, { revenue: number; margin: number }>>((acc, s) => {
    if (!acc[s.month]) acc[s.month] = { revenue: 0, margin: 0 }
    acc[s.month].revenue += s.pvp_per_pair * s.quantity
    acc[s.month].margin  += (s.pvp_per_pair - s.cost_per_pair) * s.quantity
    return acc
  }, {})
  const months    = Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b)).slice(-6)
  const maxMargin = Math.max(...months.map(([, v]) => v.margin), 1)

  const filteredProds = products.filter(p =>
    !prodSearch || p.name.toLowerCase().includes(prodSearch.toLowerCase())
  )

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

        {/* MESSAGE NOTIFICATION BANNER */}
        {newReplies > 0 && (
          <Link href="/contacto" className="flex items-center gap-3 p-4 bg-bod-blue rounded-2xl text-white hover:bg-bod-dark transition-colors">
            <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center shrink-0">
              <MessageSquare size={18} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">A equipa BOD respondeu às suas mensagens</p>
              <p className="text-xs text-white/70">{newReplies} mensagem{newReplies !== 1 ? 's' : ''} com resposta — clique para ver</p>
            </div>
            <span className="text-xs font-semibold text-white/80">Ver →</span>
          </Link>
        )}

        {/* KPI CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Euro,       label: 'Margem bruta total',        value: fmt(totalMargin),        sub: 'acumulado',          color: 'text-green-600',  bg: 'bg-green-50' },
            { icon: TrendingUp, label: 'Faturação total (PVP)',     value: fmt(totalRevenue),       sub: 'valor faturado',     color: 'text-bod-blue',   bg: 'bg-bod-light' },
            { icon: Users,      label: 'Poupança para os clientes', value: fmt(clientSaving),       sub: 'vs. concorrência',   color: 'text-purple-600', bg: 'bg-purple-50' },
            { icon: BarChart2,  label: 'Pares vendidos',            value: totalPairs.toString(),   sub: 'pares registados',   color: 'text-amber-600',  bg: 'bg-amber-50' },
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

        {/* CHART */}
        {months.length > 0 && (
          <div className="card p-5 md:p-6">
            <h2 className="font-semibold text-sm text-bod-dark mb-5">Margem bruta por mês</h2>
            <div className="flex items-end gap-3 h-32">
              {months.map(([month, v]) => {
                const pct   = (v.margin / maxMargin) * 100
                const label = new Date(month + '-01').toLocaleDateString('pt-PT', { month: 'short', year: '2-digit' })
                return (
                  <div key={month} className="flex-1 flex flex-col items-center gap-1.5">
                    <span className="text-xs text-gray-400 font-medium hidden md:block">{fmt(v.margin)}</span>
                    <div className="w-full flex items-end justify-center" style={{ height: '80px' }}>
                      <div className="w-full bg-bod-blue rounded-t-lg transition-all" style={{ height: `${Math.max(pct, 4)}%` }} />
                    </div>
                    <span className="text-xs text-gray-400 font-medium">{label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* BOTTOM GRID */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Vantagem */}
          <div className="card p-5">
            <h2 className="font-semibold text-sm text-bod-dark mb-4">A sua vantagem BOD</h2>
            <div className="space-y-3">
              {[
                { label: 'Custo total BOD',            value: fmt(totalCost),    dot: 'bg-bod-blue' },
                { label: 'Poupança estimada clientes',  value: fmt(clientSaving), dot: 'bg-purple-400' },
                { label: 'Margem bruta gerada',         value: fmt(totalMargin),  dot: 'bg-green-400' },
              ].map(r => (
                <div key={r.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${r.dot}`} />
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
                <p className="text-sm text-gray-300">Sem vendas registadas.</p>
                <button className="btn-outline mt-3 text-xs py-2" onClick={() => setShowAdd(true)}>
                  <Plus size={13} /> Registar primeira venda
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {sales.slice(0, 6).map(s => (
                  <div key={s.id} className="flex items-center justify-between py-2 border-b border-bod-light last:border-0">
                    <div>
                      <p className="text-sm font-medium text-bod-dark">{s.lens_type}</p>
                      <p className="text-xs text-gray-400">{s.material ? `${s.material} · ` : ''}{s.quantity} par{s.quantity > 1 ? 'es' : ''}</p>
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
      </div>

      {/* ADD SALE MODAL */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
          onClick={() => { setShowAdd(false); resetSaleForm() }}>
          <div className="bg-white w-full md:max-w-lg rounded-t-3xl md:rounded-2xl max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>

            {/* Modal header */}
            <div className="sticky top-0 bg-white px-5 pt-5 pb-4 border-b border-bod-light rounded-t-3xl md:rounded-t-2xl flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-lg text-bod-dark">Registar venda</h3>
                {saleLensType && <p className="text-xs text-gray-400 mt-0.5">{saleLensType}{selectedProd ? ` · ${selectedProd.name}` : ''}</p>}
              </div>
              <button onClick={() => { setShowAdd(false); resetSaleForm() }} className="text-gray-300 hover:text-gray-500">
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4">

              {/* STEP 1 — Tipo de lente */}
              {saleStep === 'lensType' && (
                <div>
                  <p className="label mb-3">Tipo de lente</p>
                  <div className="grid grid-cols-2 gap-2">
                    {LENS_TYPES_ORDER.map(lt => (
                      <button key={lt}
                        className="flex items-center justify-between px-4 py-3 rounded-xl border border-bod-light hover:border-bod-blue hover:bg-bod-xlight text-left transition-all group"
                        onClick={() => selectLensType(lt)}>
                        <span className="text-sm font-medium text-bod-dark">{lt}</span>
                        <ChevronDown size={14} className="text-gray-300 group-hover:text-bod-blue -rotate-90 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 2 — Produto */}
              {saleStep === 'product' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="label">Selecionar produto</p>
                    <button className="text-xs text-gray-400 hover:text-bod-blue" onClick={() => setSaleStep('lensType')}>← Voltar</button>
                  </div>
                  <input className="input mb-3" placeholder="Pesquisar produto..."
                    value={prodSearch} onChange={e => setProdSearch(e.target.value)} />
                  {loadingProd ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-6 h-6 border-2 border-bod-blue border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-72 overflow-y-auto">
                      {filteredProds.slice(0, 50).map(p => (
                        <button key={p.id}
                          className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl border border-bod-light hover:border-bod-blue hover:bg-bod-xlight text-left transition-all"
                          onClick={() => selectProduct(p)}>
                          <div className="flex-1 min-w-0 pr-3">
                            <p className="text-sm font-medium text-bod-dark truncate">{p.name}</p>
                            {p.index_val && <p className="text-xs text-gray-400">{p.index_val}</p>}
                          </div>
                          {p.optician_price && <span className="text-sm font-bold text-bod-blue shrink-0">{fmt(p.optician_price)}</span>}
                        </button>
                      ))}
                      {filteredProds.length === 0 && <p className="text-sm text-gray-300 text-center py-6">Nenhum produto encontrado.</p>}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3 — Config */}
              {saleStep === 'config' && selectedProd && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="label">Configurar venda</p>
                    <button className="text-xs text-gray-400 hover:text-bod-blue" onClick={() => setSaleStep('product')}>← Alterar produto</button>
                  </div>

                  {/* Product info */}
                  <div className="bg-bod-xlight rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1">Produto selecionado</p>
                    <p className="text-sm font-semibold text-bod-dark leading-snug">{selectedProd.name}</p>
                    {selectedProd.coating && <p className="text-xs text-gray-400 mt-0.5">{selectedProd.coating}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Margem ótica (%)</label>
                      <input type="number" step="5" min="0" max="500" className="input font-semibold"
                        value={margem} onChange={e => setMargem(parseFloat(e.target.value) || 0)} />
                    </div>
                    <div>
                      <label className="label">Quantidade (pares)</label>
                      <input type="number" min="1" className="input"
                        value={quantity} onChange={e => setQuantity(parseInt(e.target.value) || 1)} />
                    </div>
                  </div>

                  {/* Price summary — same as calculator */}
                  <div className="bg-bod-dark rounded-2xl p-4 space-y-2">
                    {[
                      { label: 'Custo BOD (par)',  value: fmt(cost),           muted: true },
                      { label: 'PVP ao cliente',   value: fmt(pvp),            muted: false, big: true },
                      { label: 'Margem / par',     value: '+' + fmt(margin),   muted: false, green: true },
                      ...(quantity > 1 ? [
                        { label: `Total custo (${quantity} pares)`, value: fmt(cost * quantity),   muted: true },
                        { label: `Total PVP (${quantity} pares)`,   value: fmt(pvp * quantity),    muted: false },
                        { label: 'Margem total',                    value: '+' + fmt(margin * quantity), muted: false, green: true },
                      ] : []),
                    ].map(r => (
                      <div key={r.label} className="flex justify-between items-baseline">
                        <span className="text-xs text-white/50">{r.label}</span>
                        <span className={`font-semibold ${'big' in r && r.big ? 'text-lg text-bod-sky' : ''} ${'green' in r && r.green ? 'text-green-400 text-sm' : ''} ${r.muted ? 'text-sm text-white/70' : 'text-sm text-white'}`}>
                          {r.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button className="btn-primary w-full py-3.5" onClick={addSale}>
                    <Plus size={16} /> Guardar venda
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}
