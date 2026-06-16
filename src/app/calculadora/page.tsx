'use client'

import { useState, useEffect, useCallback } from 'react'
import AppShell from '@/components/layout/AppShell'
import { supabase } from '@/lib/supabase'
import { fmt } from '@/lib/data'
import { ChevronDown, RotateCcw, Calculator, CheckCircle, Search, ChevronLeft, ChevronRight } from 'lucide-react'

// ── Only 3 main lens types ───────────────────────────────────
const LENS_TYPE_CATS: Record<string, string[]> = {
  'Monofocal':  ['RX MONOFOCAL'],
  'Progressiva':['RX PROGRESSIVA'],
  'Bifocal':    ['RX BIFOCAL'],
}
const LENS_TYPES_ORDER = ['Monofocal', 'Progressiva', 'Bifocal']

// Stock lines shown as sub-option under Monofocal
const STOCK_CATS = [
  'STOCK NANO BASIC','STOCK NANO LONGUS','STOCK NANO BLUELINE',
  'STOCK NANO ACHROMATIC','STOCK NANO SOLIS','STOCK BLUE420',
]
const STOCK_LABELS: Record<string,string> = {
  'STOCK NANO BASIC':'Stock Nano Basic','STOCK NANO LONGUS':'Stock Nano Longus',
  'STOCK NANO BLUELINE':'Stock Nano Blueline','STOCK NANO ACHROMATIC':'Stock Nano Achromatic',
  'STOCK NANO SOLIS':'Stock Nano Solis','STOCK BLUE420':'Stock Blue420',
}

type Step = 'lensType' | 'stockType' | 'design' | 'index_val' | 'coating' | 'filter_type' | 'color' | 'addition' | 'result'

type Selection = {
  lensType: string
  categories: string[]   // resolved DB categories
  design: string
  index_val: string
  coating: string
  filter_type: string
  color: string
  addition: string
}

type Product = {
  id: number; name: string; optician_price: number | null; pvpr: number | null
  index_val: string; coating: string; filter_type: string; color: string; addition: string
}

const EMPTY: Selection = { lensType:'', categories:[], design:'', index_val:'', coating:'', filter_type:'', color:'', addition:'' }
const DB_STEPS: Step[] = ['design','index_val','coating','filter_type','color','addition']
const STEP_LABELS: Record<string,string> = {
  lensType:'Tipo de lente', stockType:'Gama stock',
  design:'Design', index_val:'Índice', coating:'Revestimento',
  filter_type:'Filtro / Tratamento', color:'Cor', addition:'Adição',
}

const PROD_PAGE = 40

export default function CalculadoraPage() {
  const [sel, setSel]           = useState<Selection>(EMPTY)
  const [step, setStep]         = useState<Step>('lensType')
  const [options, setOptions]   = useState<string[]>([])
  const [loading, setLoading]   = useState(false)
  const [margem, setMargem]     = useState(60)
  const [qty, setQty]           = useState(1)
  const [products, setProducts] = useState<Product[]>([])
  const [prodTotal, setProdTotal] = useState(0)
  const [prodPage, setProdPage] = useState(0)
  const [prodSearch, setProdSearch] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  // ── Fetch distinct values ────────────────────────────────
  const fetchOptions = useCallback(async (currentStep: Step, s: Selection) => {
    if (currentStep === 'result') return
    setLoading(true)

    let q = (supabase.from('products').select(currentStep) as any)
    if (s.categories.length) q = q.in('category', s.categories)
    if (s.design)      q = q.eq('design',      s.design)
    if (s.index_val)   q = q.eq('index_val',   s.index_val)
    if (s.coating)     q = q.eq('coating',     s.coating)
    if (s.filter_type) q = q.eq('filter_type', s.filter_type)
    if (s.color)       q = q.eq('color',       s.color)
    if (s.addition)    q = q.eq('addition',    s.addition)

    const { data } = await q.limit(5000)
    const vals = Array.from(new Set((data ?? []).map((r: any) => r[currentStep]).filter(Boolean))).sort() as string[]

    if (vals.length === 0) {
      const next = nextStep(currentStep)
      if (next === 'result') await fetchProducts(s, 0, '')
      else await fetchOptions(next, s)
      setLoading(false); return
    }
    if (vals.length === 1) {
      const newSel = { ...s, [currentStep]: vals[0] }
      setSel(newSel)
      const next = nextStep(currentStep)
      if (next === 'result') await fetchProducts(newSel, 0, '')
      else await fetchOptions(next, newSel)
      setLoading(false); return
    }

    setOptions(vals); setStep(currentStep); setLoading(false)
  }, [])

  const nextStep = (cur: Step): Step => {
    const i = DB_STEPS.indexOf(cur)
    if (i === -1 || i === DB_STEPS.length - 1) return 'result'
    return DB_STEPS[i + 1]
  }

  // ── Fetch products ───────────────────────────────────────
  const fetchProducts = async (s: Selection, page: number, search: string) => {
    setLoading(true)
    let q = (supabase.from('products').select('id,name,optician_price,pvpr,index_val,coating,filter_type,color,addition', { count: 'exact' }) as any)
    if (s.categories.length) q = q.in('category', s.categories)
    if (s.design)      q = q.eq('design',      s.design)
    if (s.index_val)   q = q.eq('index_val',   s.index_val)
    if (s.coating)     q = q.eq('coating',     s.coating)
    if (s.filter_type) q = q.eq('filter_type', s.filter_type)
    if (s.color)       q = q.eq('color',       s.color)
    if (s.addition)    q = q.eq('addition',    s.addition)
    if (search)        q = q.ilike('name', `%${search}%`)
    q = q.order('name').range(page * PROD_PAGE, (page + 1) * PROD_PAGE - 1)
    const { data, count } = await q
    setProducts(data ?? [])
    setProdTotal(count ?? 0)
    setSelectedProduct((data ?? [])[0] ?? null)
    setStep('result'); setLoading(false)
  }

  // ── Lens type selection ──────────────────────────────────
  const selectLensType = async (lt: string) => {
    if (lt === 'Monofocal') {
      // Show stock sub-options
      const newSel = { ...EMPTY, lensType: lt, categories: ['RX MONOFOCAL'] }
      setSel(newSel)
      setStep('stockType')
      setOptions(['RX MONOFOCAL (prescrição)', ...STOCK_CATS])
    } else {
      const cats = LENS_TYPE_CATS[lt] ?? []
      const newSel = { ...EMPTY, lensType: lt, categories: cats }
      setSel(newSel)
      await fetchOptions('design', newSel)
    }
  }

  const selectStockType = async (opt: string) => {
    let cats: string[]
    if (opt === 'RX MONOFOCAL (prescrição)') cats = ['RX MONOFOCAL']
    else cats = [opt]
    const newSel = { ...sel, categories: cats }
    setSel(newSel)
    await fetchOptions('design', newSel)
  }

  const selectOption = async (field: Step, value: string) => {
    const newSel = { ...sel, [field]: value }
    setSel(newSel)
    const next = nextStep(field)
    if (next === 'result') { setProdPage(0); setProdSearch(''); await fetchProducts(newSel, 0, '') }
    else await fetchOptions(next, newSel)
  }

  const reset = () => {
    setSel(EMPTY); setStep('lensType'); setOptions([])
    setProducts([]); setSelectedProduct(null)
    setProdPage(0); setProdSearch('')
  }

  const back = () => {
    if (step === 'result' || step === 'addition' || step === 'color' || step === 'filter_type' || step === 'coating' || step === 'index_val') {
      const fields: (keyof Selection)[] = ['addition','color','filter_type','coating','index_val','design']
      for (const f of fields) {
        if (sel[f as keyof Selection]) {
          const newSel = { ...sel, [f]: '' }
          fields.slice(0, fields.indexOf(f)).forEach(pf => { (newSel as any)[pf] = '' })
          setSel(newSel)
          fetchOptions(f as Step, newSel)
          return
        }
      }
      // back to stock/lensType
      if (sel.lensType === 'Monofocal') { setSel({ ...EMPTY, lensType: 'Monofocal', categories: ['RX MONOFOCAL'] }); setStep('stockType'); setOptions(['RX MONOFOCAL (prescrição)', ...STOCK_CATS]) }
      else reset()
    } else if (step === 'design') {
      if (sel.lensType === 'Monofocal') { setSel({ ...EMPTY, lensType: 'Monofocal', categories: ['RX MONOFOCAL'] }); setStep('stockType'); setOptions(['RX MONOFOCAL (prescrição)', ...STOCK_CATS]) }
      else reset()
    } else if (step === 'stockType') {
      reset()
    }
  }

  const breadcrumb = [
    sel.lensType   && { val: sel.lensType },
    sel.categories.length && sel.lensType === 'Monofocal' && sel.categories[0] !== 'RX MONOFOCAL' && { val: STOCK_LABELS[sel.categories[0]] ?? sel.categories[0] },
    sel.design     && { val: sel.design },
    sel.index_val  && { val: sel.index_val },
    sel.coating    && { val: sel.coating },
    sel.filter_type && { val: sel.filter_type },
    sel.color      && { val: sel.color },
    sel.addition   && { val: sel.addition },
  ].filter(Boolean) as { val: string }[]

  const price    = selectedProduct?.optician_price ?? 0
  const pvpCalc  = price * (1 + margem / 100)
  const pvpSug   = selectedProduct?.pvpr ?? null
  const margin   = pvpCalc - price
  const barWidth = Math.min((margem / 150) * 100, 100)

  return (
    <AppShell>
      <div className="px-4 md:px-8 py-6 max-w-5xl mx-auto">
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-bod-blue mb-1">Configurador</p>
            <h1 className="font-display text-2xl font-bold text-bod-dark">Calculadora de Preços</h1>
            <p className="text-sm text-gray-400 mt-1">Selecione as características da lente passo a passo.</p>
          </div>
          {breadcrumb.length > 0 && (
            <button onClick={reset} className="btn-ghost text-xs gap-1.5 shrink-0">
              <RotateCcw size={13} /> Recomeçar
            </button>
          )}
        </div>

        {/* Breadcrumb */}
        {breadcrumb.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mb-5 p-3 bg-bod-xlight rounded-xl">
            {breadcrumb.map((b, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-gray-300 text-xs">›</span>}
                <span className="text-xs font-semibold text-bod-blue bg-white border border-bod-light px-2.5 py-1 rounded-lg">{b.val}</span>
              </span>
            ))}
          </div>
        )}

        <div className="grid lg:grid-cols-5 gap-5 items-start">
          <div className="lg:col-span-3">
            {loading ? (
              <div className="card p-10 flex items-center justify-center">
                <div className="w-7 h-7 border-2 border-bod-blue border-t-transparent rounded-full animate-spin" />
              </div>

            ) : step === 'lensType' ? (
              <div className="card p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Tipo de lente</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {LENS_TYPES_ORDER.map(lt => (
                    <button key={lt}
                      className="flex items-center justify-between px-4 py-3.5 rounded-xl border border-bod-light hover:border-bod-blue hover:bg-bod-xlight text-left transition-all group"
                      onClick={() => selectLensType(lt)}>
                      <span className="text-sm font-semibold text-bod-dark">{lt}</span>
                      <ChevronDown size={14} className="text-gray-300 group-hover:text-bod-blue -rotate-90 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

            ) : step === 'stockType' ? (
              <div className="card p-5">
                <p className="text-xs font-bold uppercase tracking-widests text-gray-400 mb-4">Gama</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {['RX MONOFOCAL (prescrição)', ...STOCK_CATS].map(opt => (
                    <button key={opt}
                      className="flex items-center justify-between px-4 py-3 rounded-xl border border-bod-light hover:border-bod-blue hover:bg-bod-xlight text-left transition-all group"
                      onClick={() => selectStockType(opt)}>
                      <span className="text-sm font-medium text-bod-dark">{opt === 'RX MONOFOCAL (prescrição)' ? 'Monofocal RX (prescrição)' : STOCK_LABELS[opt] ?? opt}</span>
                      <ChevronDown size={14} className="text-gray-300 group-hover:text-bod-blue -rotate-90 shrink-0" />
                    </button>
                  ))}
                </div>
                <button onClick={back} className="mt-4 text-xs text-gray-400 hover:text-bod-blue font-medium">← Voltar atrás</button>
              </div>

            ) : step !== 'result' ? (
              <div className="card p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">{STEP_LABELS[step]}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {options.map(opt => (
                    <button key={opt}
                      className="flex items-center justify-between px-4 py-3 rounded-xl border border-bod-light hover:border-bod-blue hover:bg-bod-xlight text-left transition-all group"
                      onClick={() => selectOption(step, opt)}>
                      <span className="text-sm font-medium text-bod-dark">{opt}</span>
                      <ChevronDown size={14} className="text-gray-300 group-hover:text-bod-blue -rotate-90 shrink-0" />
                    </button>
                  ))}
                  {(step === 'coating' || step === 'filter_type' || step === 'color') && (
                    <button
                      className="flex items-center justify-between px-4 py-3 rounded-xl border border-dashed border-gray-200 hover:border-bod-blue hover:bg-bod-xlight text-left transition-all group col-span-1 sm:col-span-2"
                      onClick={() => selectOption(step, '')}>
                      <span className="text-sm text-gray-400 group-hover:text-bod-blue">Não se aplica / Ver todos</span>
                      <ChevronDown size={14} className="text-gray-300 group-hover:text-bod-blue -rotate-90 shrink-0" />
                    </button>
                  )}
                </div>
                <button onClick={back} className="mt-4 text-xs text-gray-400 hover:text-bod-blue font-medium">← Voltar atrás</button>
              </div>

            ) : (
              <div className="space-y-4">
                <div className="card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                      {prodTotal.toLocaleString('pt-PT')} produto{prodTotal !== 1 ? 's' : ''} encontrado{prodTotal !== 1 ? 's' : ''}
                    </p>
                    <button onClick={back} className="text-xs text-bod-blue font-semibold hover:underline">← Alterar</button>
                  </div>

                  {/* Search within results */}
                  <div className="relative mb-3">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input className="input pl-9 text-sm" placeholder="Pesquisar nestes resultados..."
                      value={prodSearch}
                      onChange={e => { setProdSearch(e.target.value); setProdPage(0); fetchProducts(sel, 0, e.target.value) }} />
                  </div>

                  <div className="space-y-1.5 max-h-64 overflow-y-auto">
                    {products.map(p => (
                      <button key={p.id}
                        className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl border text-left transition-all ${selectedProduct?.id === p.id ? 'border-bod-blue bg-bod-xlight' : 'border-bod-light hover:border-bod-blue/50 hover:bg-gray-50'}`}
                        onClick={() => setSelectedProduct(p)}>
                        <div className="flex-1 min-w-0 pr-3">
                          <p className="text-sm font-medium text-bod-dark truncate">{p.name}</p>
                          {p.index_val && <p className="text-xs text-gray-400">{p.index_val}{p.coating ? ` · ${p.coating}` : ''}</p>}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {p.optician_price && <span className="text-sm font-bold text-bod-blue">{fmt(p.optician_price)}</span>}
                          {selectedProduct?.id === p.id && <CheckCircle size={16} className="text-bod-blue" />}
                        </div>
                      </button>
                    ))}
                    {products.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Nenhum produto encontrado.</p>}
                  </div>

                  {/* Pagination */}
                  {prodTotal > PROD_PAGE && (
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-bod-light text-xs text-gray-400">
                      <span>{prodPage * PROD_PAGE + 1}–{Math.min((prodPage + 1) * PROD_PAGE, prodTotal)} de {prodTotal.toLocaleString('pt-PT')}</span>
                      <div className="flex gap-1">
                        <button className="p-1.5 rounded-lg border border-bod-light hover:border-bod-blue disabled:opacity-30"
                          disabled={prodPage === 0}
                          onClick={() => { setProdPage(p => p-1); fetchProducts(sel, prodPage-1, prodSearch) }}>
                          <ChevronLeft size={14} />
                        </button>
                        <button className="p-1.5 rounded-lg border border-bod-light hover:border-bod-blue disabled:opacity-30"
                          disabled={(prodPage+1)*PROD_PAGE >= prodTotal}
                          onClick={() => { setProdPage(p => p+1); fetchProducts(sel, prodPage+1, prodSearch) }}>
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="card p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Configurar preço</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Margem ótica (%)</label>
                      <input type="number" step="5" min="0" max="500" className="input font-semibold"
                        value={margem} onChange={e => setMargem(parseFloat(e.target.value) || 0)} />
                    </div>
                    <div>
                      <label className="label">Quantidade (pares)</label>
                      <input type="number" min="1" className="input"
                        value={qty} onChange={e => setQty(parseInt(e.target.value) || 1)} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — result */}
          <div className="lg:col-span-2 lg:sticky lg:top-6">
            <div className="bg-bod-dark rounded-2xl p-6 text-white">
              <h2 className="text-xs font-bold uppercase tracking-widest text-bod-sky mb-5">Resultado</h2>
              {!selectedProduct || step !== 'result' ? (
                <div className="text-center py-8">
                  <Calculator size={32} className="text-white/20 mx-auto mb-3" />
                  <p className="text-sm text-white/40 leading-relaxed">Selecione as características da lente para ver o preço.</p>
                </div>
              ) : (
                <div className="space-y-0">
                  <div className="pb-3 mb-3 border-b border-white/10">
                    <p className="text-xs text-white/40 mb-1">Produto selecionado</p>
                    <p className="text-sm font-semibold text-white leading-snug">{selectedProduct.name}</p>
                  </div>
                  {[
                    { label: 'Custo para si (par)', value: price ? fmt(price) : '—' },
                    { label: 'PVPR sugerido',       value: pvpSug ? fmt(pvpSug) : '—' },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between py-2.5 border-b border-white/8">
                      <span className="text-sm text-white/50">{r.label}</span>
                      <span className="text-sm font-semibold text-white/80">{r.value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-4">
                    <span className="text-sm text-white/70">PVP calculado</span>
                    <span className="text-2xl font-bold text-bod-sky">{fmt(pvpCalc)}</span>
                  </div>
                  <div className="flex justify-between py-2.5 border-t border-white/10">
                    <span className="text-sm text-white/50">Margem / par</span>
                    <span className="text-sm font-bold text-green-400">+{fmt(margin)}</span>
                  </div>
                  {qty > 1 && (
                    <>
                      <div className="flex justify-between py-2.5 border-t border-white/10">
                        <span className="text-sm text-white/50">Total custo ({qty} pares)</span>
                        <span className="text-sm font-semibold text-white/70">{fmt(price * qty)}</span>
                      </div>
                      <div className="flex justify-between py-2.5">
                        <span className="text-sm text-white/70">Total PVP ({qty} pares)</span>
                        <span className="text-sm font-bold">{fmt(pvpCalc * qty)}</span>
                      </div>
                      <div className="flex justify-between py-2.5 border-t border-white/10">
                        <span className="text-sm text-white/50">Margem total</span>
                        <span className="text-sm font-bold text-green-400">+{fmt(margin * qty)}</span>
                      </div>
                    </>
                  )}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-white/40 mb-1.5">
                      <span>Margem</span><span className="font-semibold text-white/60">{Math.round(margem)}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-bod-sky rounded-full transition-all duration-300" style={{ width: `${barWidth}%` }} />
                    </div>
                  </div>
                  <div className="mt-4 bg-white/8 border border-white/10 rounded-xl p-3.5">
                    <p className="text-xs text-white/50 leading-relaxed">
                      Custo <span className="text-bod-sky font-semibold">{fmt(price)}</span> · PVP{' '}
                      <span className="text-white font-semibold">{fmt(pvpCalc)}</span> · margem{' '}
                      <span className="text-green-400 font-semibold">+{fmt(margin)}</span> por par.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
