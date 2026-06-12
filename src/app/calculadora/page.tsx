'use client'

import { useState, useEffect, useCallback } from 'react'
import AppShell from '@/components/layout/AppShell'
import { supabase } from '@/lib/supabase'
import { fmt } from '@/lib/data'
import { ChevronDown, RotateCcw, Calculator, CheckCircle } from 'lucide-react'

// ── Lens type mapping ────────────────────────────────────────
const LENS_TYPE_MAP: Record<string, string[]> = {
  'Monofocal':        ['RX MONOFOCAL','STOCK NANO BASIC','STOCK NANO LONGUS','STOCK NANO BLUELINE','STOCK NANO ACHROMATIC','STOCK NANO SOLIS','STOCK BLUE420'],
  'Progressiva':      ['RX PROGRESSIVA'],
  'Bifocal':          ['RX BIFOCAL'],
  'Coloração / Tint': ['RX COLORAÇÃO/TINT','STOCK NANO TINTING'],
  'Fotocromática':    ['STOCK NANO TRANS GENS','STOCK TRANS XTRA'],
  'Suplementos':      ['SUPLEMENTOS'],
}

const LENS_TYPES_ORDER = ['Monofocal','Progressiva','Bifocal','Coloração / Tint','Fotocromática','Suplementos']

const CAT_LABELS: Record<string,string> = {
  'RX MONOFOCAL':'Monofocal RX (prescrição)',
  'RX PROGRESSIVA':'Progressiva RX (prescrição)',
  'RX BIFOCAL':'Bifocal RX (prescrição)',
  'RX COLORAÇÃO/TINT':'Coloração / Tint RX',
  'STOCK NANO BASIC':'Stock Nano Basic',
  'STOCK NANO LONGUS':'Stock Nano Longus',
  'STOCK NANO BLUELINE':'Stock Nano Blueline',
  'STOCK NANO ACHROMATIC':'Stock Nano Achromatic',
  'STOCK NANO SOLIS':'Stock Nano Solis',
  'STOCK NANO TINTING':'Stock Nano Tinting',
  'STOCK NANO TRANS GENS':'Stock Nano Trans Gens',
  'STOCK TRANS XTRA':'Stock Trans Xtra',
  'STOCK BLUE420':'Stock Blue420',
  'SUPLEMENTOS':'Suplementos',
}

// ── Types ────────────────────────────────────────────────────
type Step = 'lensType' | 'category' | 'design' | 'index_val' | 'coating' | 'filter_type' | 'color' | 'addition' | 'result'

type Selection = {
  lensType: string
  category: string
  design: string
  index_val: string
  coating: string
  filter_type: string
  color: string
  addition: string
}

type Product = {
  id: number
  name: string
  optician_price: number | null
  pvpr: number | null
  category: string
  design: string
  index_val: string
  coating: string
  filter_type: string
  color: string
  addition: string
}

const EMPTY: Selection = { lensType:'', category:'', design:'', index_val:'', coating:'', filter_type:'', color:'', addition:'' }

const DB_STEPS: Step[] = ['category','design','index_val','coating','filter_type','color','addition']

const STEP_LABELS: Record<string,string> = {
  lensType:    'Tipo de lente',
  category:    'Gama / Stock',
  design:      'Design',
  index_val:   'Índice',
  coating:     'Revestimento',
  filter_type: 'Filtro / Tratamento',
  color:       'Cor',
  addition:    'Adição',
}

// ── Component ────────────────────────────────────────────────
export default function CalculadoraPage() {
  const [sel, setSel]             = useState<Selection>(EMPTY)
  const [step, setStep]           = useState<Step>('lensType')
  const [options, setOptions]     = useState<string[]>([])
  const [loading, setLoading]     = useState(false)
  const [margem, setMargem]       = useState(60)
  const [qty, setQty]             = useState(1)
  const [matchedProducts, setMatchedProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  // ── Fetch distinct values for a DB step ──────────────────
  const fetchOptions = useCallback(async (currentStep: Step, currentSel: Selection) => {
    if (currentStep === 'result' || currentStep === 'lensType') return
    setLoading(true)

    const cats = currentSel.lensType ? LENS_TYPE_MAP[currentSel.lensType] ?? [] : []

    let q = supabase.from('products').select(currentStep)
    if (cats.length > 0)           q = (q as any).in('category', cats)
    if (currentSel.category)       q = (q as any).eq('category',    currentSel.category)
    if (currentSel.design)         q = (q as any).eq('design',      currentSel.design)
    if (currentSel.index_val)      q = (q as any).eq('index_val',   currentSel.index_val)
    if (currentSel.coating)        q = (q as any).eq('coating',     currentSel.coating)
    if (currentSel.filter_type)    q = (q as any).eq('filter_type', currentSel.filter_type)
    if (currentSel.color)          q = (q as any).eq('color',       currentSel.color)
    if (currentSel.addition)       q = (q as any).eq('addition',    currentSel.addition)

    const { data } = await (q as any).limit(3000)
    const vals = Array.from(new Set((data ?? []).map((r: any) => r[currentStep]).filter(Boolean))).sort() as string[]

    // If 0 options, skip to next
    if (vals.length === 0) {
      const nextStep = getNextDbStep(currentStep)
      if (nextStep === 'result') { await fetchProducts(currentSel) }
      else { await fetchOptions(nextStep, currentSel) }
      setLoading(false)
      return
    }

    // If only 1 option, auto-select and advance
    if (vals.length === 1) {
      const newSel = { ...currentSel, [currentStep]: vals[0] }
      setSel(newSel)
      const nextStep = getNextDbStep(currentStep)
      if (nextStep === 'result') { await fetchProducts(newSel) }
      else { await fetchOptions(nextStep, newSel) }
      setLoading(false)
      return
    }

    setOptions(vals)
    setStep(currentStep)
    setLoading(false)
  }, [])

  const getNextDbStep = (current: Step): Step => {
    const idx = DB_STEPS.indexOf(current)
    if (idx === -1 || idx === DB_STEPS.length - 1) return 'result'
    return DB_STEPS[idx + 1]
  }

  // ── Select lens type (step 1) ────────────────────────────
  const selectLensType = async (lensType: string) => {
    const cats = LENS_TYPE_MAP[lensType] ?? []
    const newSel = { ...EMPTY, lensType }

    // If multiple categories → show category step
    if (cats.length > 1) {
      setSel(newSel)
      setOptions(cats)
      setStep('category')
    } else {
      // Single category — skip directly to design
      const withCat = { ...newSel, category: cats[0] ?? '' }
      setSel(withCat)
      await fetchOptions('design', withCat)
    }
  }

  // ── Select category (step 2, only if multiple) ───────────
  const selectCategory = async (category: string) => {
    const newSel = { ...sel, category }
    setSel(newSel)
    await fetchOptions('design', newSel)
  }

  // ── Select a DB option ───────────────────────────────────
  const selectOption = async (field: Step, value: string) => {
    const newSel = { ...sel, [field]: value }
    setSel(newSel)
    const nextStep = getNextDbStep(field)
    if (nextStep === 'result') { await fetchProducts(newSel) }
    else { await fetchOptions(nextStep, newSel) }
  }

  // ── Fetch matching products ──────────────────────────────
  const fetchProducts = async (s: Selection) => {
    setLoading(true)
    const cats = s.lensType ? LENS_TYPE_MAP[s.lensType] ?? [] : []
    let q = supabase.from('products').select('*')
    if (cats.length > 0)  q = (q as any).in('category', cats)
    if (s.category)       q = (q as any).eq('category',    s.category)
    if (s.design)         q = (q as any).eq('design',      s.design)
    if (s.index_val)      q = (q as any).eq('index_val',   s.index_val)
    if (s.coating)        q = (q as any).eq('coating',     s.coating)
    if (s.filter_type)    q = (q as any).eq('filter_type', s.filter_type)
    if (s.color)          q = (q as any).eq('color',       s.color)
    if (s.addition)       q = (q as any).eq('addition',    s.addition)
    const { data } = await (q as any).order('name').limit(100)
    setMatchedProducts(data ?? [])
    setSelectedProduct((data ?? [])[0] ?? null)
    setStep('result')
    setLoading(false)
  }

  // ── Reset ────────────────────────────────────────────────
  const reset = () => {
    setSel(EMPTY)
    setStep('lensType')
    setOptions([])
    setMatchedProducts([])
    setSelectedProduct(null)
  }

  // ── Back ─────────────────────────────────────────────────
  const back = () => {
    if (step === 'result' || step === 'addition') {
      // Go back to last filled DB step
      const fields: (keyof Selection)[] = ['addition','color','filter_type','coating','index_val','design','category']
      for (const f of fields) {
        if (sel[f]) {
          const newSel = { ...sel, [f]: '' }
          fields.slice(0, fields.indexOf(f)).forEach(pf => { newSel[pf] = '' })
          setSel(newSel)
          fetchOptions(f as Step, newSel)
          return
        }
      }
    }
    if (step === 'category') { reset(); return }
    if (step === 'design') {
      // If only 1 cat, go back to lensType
      const cats = LENS_TYPE_MAP[sel.lensType] ?? []
      if (cats.length <= 1) { reset(); return }
      setSel({ ...sel, design: '', category: '' })
      setOptions(cats)
      setStep('category')
      return
    }
    const idx = DB_STEPS.indexOf(step)
    if (idx > 0) {
      const prevStep = DB_STEPS[idx - 1]
      const newSel = { ...sel, [step]: '' }
      setSel(newSel)
      fetchOptions(prevStep, { ...newSel, [prevStep]: '' })
    }
  }

  // ── Breadcrumb ───────────────────────────────────────────
  const breadcrumb = [
    sel.lensType   && { key: 'lensType',    val: sel.lensType },
    sel.category   && { key: 'category',    val: CAT_LABELS[sel.category] ?? sel.category },
    sel.design     && { key: 'design',      val: sel.design },
    sel.index_val  && { key: 'index_val',   val: sel.index_val },
    sel.coating    && { key: 'coating',     val: sel.coating },
    sel.filter_type&& { key: 'filter_type', val: sel.filter_type },
    sel.color      && { key: 'color',       val: sel.color },
    sel.addition   && { key: 'addition',    val: sel.addition },
  ].filter(Boolean) as { key: string; val: string }[]

  // ── Calculation ──────────────────────────────────────────
  const price    = selectedProduct?.optician_price ?? 0
  const pvpCalc  = price * (1 + margem / 100)
  const pvpSug   = selectedProduct?.pvpr ?? null
  const margin   = pvpCalc - price
  const barWidth = Math.min((margem / 150) * 100, 100)

  return (
    <AppShell>
      <div className="px-4 md:px-8 py-6 max-w-5xl mx-auto">
        {/* Header */}
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
              <span key={b.key} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-gray-300 text-xs">›</span>}
                <span className="text-xs font-semibold text-bod-blue bg-white border border-bod-light px-2.5 py-1 rounded-lg">{b.val}</span>
              </span>
            ))}
          </div>
        )}

        <div className="grid lg:grid-cols-5 gap-5 items-start">
          {/* LEFT — selector */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="card p-10 flex items-center justify-center">
                <div className="w-7 h-7 border-2 border-bod-blue border-t-transparent rounded-full animate-spin" />
              </div>
            ) : step === 'lensType' ? (
              <div className="card p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Tipo de lente</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {LENS_TYPES_ORDER.map(lt => (
                    <button key={lt}
                      className="flex items-center justify-between px-4 py-3.5 rounded-xl border border-bod-light hover:border-bod-blue hover:bg-bod-xlight text-left transition-all group"
                      onClick={() => selectLensType(lt)}>
                      <span className="text-sm font-semibold text-bod-dark">{lt}</span>
                      <ChevronDown size={14} className="text-gray-300 group-hover:text-bod-blue -rotate-90 transition-colors shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            ) : step === 'category' ? (
              <div className="card p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Gama / Stock</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {options.map(opt => (
                    <button key={opt}
                      className="flex items-center justify-between px-4 py-3.5 rounded-xl border border-bod-light hover:border-bod-blue hover:bg-bod-xlight text-left transition-all group"
                      onClick={() => selectCategory(opt)}>
                      <span className="text-sm font-medium text-bod-dark">{CAT_LABELS[opt] ?? opt}</span>
                      <ChevronDown size={14} className="text-gray-300 group-hover:text-bod-blue -rotate-90 transition-colors shrink-0" />
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
                      <ChevronDown size={14} className="text-gray-300 group-hover:text-bod-blue -rotate-90 transition-colors shrink-0" />
                    </button>
                  ))}
                </div>
                <button onClick={back} className="mt-4 text-xs text-gray-400 hover:text-bod-blue font-medium">← Voltar atrás</button>
              </div>
            ) : (
              /* RESULTS */
              <div className="space-y-4">
                <div className="card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                      {matchedProducts.length} produto{matchedProducts.length !== 1 ? 's' : ''} encontrado{matchedProducts.length !== 1 ? 's' : ''}
                    </p>
                    <button onClick={back} className="text-xs text-bod-blue font-semibold hover:underline">← Alterar</button>
                  </div>
                  <div className="space-y-1.5 max-h-64 overflow-y-auto">
                    {matchedProducts.map(p => (
                      <button key={p.id}
                        className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl border text-left transition-all ${selectedProduct?.id === p.id ? 'border-bod-blue bg-bod-xlight' : 'border-bod-light hover:border-bod-blue/50 hover:bg-gray-50'}`}
                        onClick={() => setSelectedProduct(p)}>
                        <div className="flex-1 min-w-0 pr-3">
                          <p className="text-sm font-medium text-bod-dark truncate">{p.name}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {p.optician_price && <span className="text-sm font-bold text-bod-blue">{fmt(p.optician_price)}</span>}
                          {selectedProduct?.id === p.id && <CheckCircle size={16} className="text-bod-blue" />}
                        </div>
                      </button>
                    ))}
                    {matchedProducts.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-4">Nenhum produto encontrado para esta combinação.</p>
                    )}
                  </div>
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

          {/* RIGHT — result panel */}
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
                    { label: 'Custo para si (par)', value: selectedProduct.optician_price ? fmt(selectedProduct.optician_price) : '—' },
                    { label: 'PVPR sugerido',        value: pvpSug ? fmt(pvpSug) : '—' },
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
                      <span>Margem aplicada</span>
                      <span className="font-semibold text-white/60">{Math.round(margem)}%</span>
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
