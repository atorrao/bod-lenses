'use client'

import { useEffect, useState, useCallback } from 'react'
import AppShell from '@/components/layout/AppShell'
import { supabase } from '@/lib/supabase'
import { fmt } from '@/lib/data'
import { Search, Filter, X, ChevronRight, Calculator } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Product = {
  id: number
  name: string
  barcode: string
  category: string
  product_type: string
  optician_price: number | null
  pvpr: number | null
  design: string
  lens_type: string
  index_val: string
  coating: string
  filter_type: string
  diameter: string
  sphere: string
  cylinder: string
  color: string
  treatment: string
  addition: string
  brand_series: string
}

const CATEGORIES = [
  'RX MONOFOCAL','RX PROGRESSIVA','RX BIFOCAL','RX COLORAÇÃO/TINT',
  'STOCK NANO BASIC','STOCK NANO LONGUS','STOCK NANO BLUELINE',
  'STOCK NANO ACHROMATIC','STOCK NANO SOLIS','STOCK NANO TINTING',
  'STOCK NANO TRANS GENS','STOCK TRANS XTRA','STOCK BLUE420','SUPLEMENTOS',
]

const CAT_LABELS: Record<string,string> = {
  'RX MONOFOCAL':'Monofocal','RX PROGRESSIVA':'Progressiva',
  'RX BIFOCAL':'Bifocal','RX COLORAÇÃO/TINT':'Coloração / Tint',
  'STOCK NANO BASIC':'Stock Basic','STOCK NANO LONGUS':'Stock Longus',
  'STOCK NANO BLUELINE':'Stock Blueline','STOCK NANO ACHROMATIC':'Stock Achromatic',
  'STOCK NANO SOLIS':'Stock Solis','STOCK NANO TINTING':'Stock Tinting',
  'STOCK NANO TRANS GENS':'Trans Gens','STOCK TRANS XTRA':'Trans Xtra',
  'STOCK BLUE420':'Blue420','SUPLEMENTOS':'Suplementos',
}

const PAGE_SIZE = 30

export default function ProdutosPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [category, setCategory] = useState('')
  const [page, setPage]         = useState(0)
  const [selected, setSelected] = useState<Product | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const load = useCallback(async (s: string, cat: string, p: number) => {
    setLoading(true)
    let q = supabase.from('products').select('*', { count: 'exact' })
    if (cat) q = q.eq('category', cat)
    if (s)   q = q.ilike('name', `%${s}%`)
    q = q.order('name').range(p * PAGE_SIZE, (p + 1) * PAGE_SIZE - 1)
    const { data, count } = await q
    setProducts(data ?? [])
    setTotal(count ?? 0)
    setLoading(false)
  }, [])

  useEffect(() => { load(search, category, page) }, [search, category, page, load])

  const handleSearch = (v: string) => { setSearch(v); setPage(0) }
  const handleCat    = (v: string) => { setCategory(v); setPage(0) }

  const openCalc = (p: Product) => {
    router.push(`/calculadora?product=${p.id}&price=${p.optician_price ?? 0}&name=${encodeURIComponent(p.name)}`)
  }

  const infoRows = (p: Product) => [
    { label: 'Categoria',  value: CAT_LABELS[p.category] ?? p.category },
    { label: 'Índice',     value: p.index_val },
    { label: 'Design',     value: p.design },
    { label: 'Coating',    value: p.coating },
    { label: 'Filtro',     value: p.filter_type },
    { label: 'Diâmetro',   value: p.diameter },
    { label: 'Esfera',     value: p.sphere },
    { label: 'Cilindro',   value: p.cylinder },
    { label: 'Cor',        value: p.color },
    { label: 'Tratamento', value: p.treatment },
    { label: 'Adição',     value: p.addition },
    { label: 'Série',      value: p.brand_series },
  ].filter(r => r.value)

  return (
    <AppShell>
      <div className="px-4 md:px-8 py-6 max-w-6xl mx-auto">
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-widest text-bod-blue mb-1">Catálogo</p>
          <h1 className="font-display text-2xl font-bold text-bod-dark">Produtos BOD Lenses</h1>
          <p className="text-sm text-gray-400 mt-1">{total.toLocaleString('pt-PT')} lentes disponíveis</p>
        </div>

        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-10" placeholder="Pesquisar por nome, design, coating..."
              value={search} onChange={e => handleSearch(e.target.value)} />
            {search && (
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                onClick={() => handleSearch('')}><X size={15} /></button>
            )}
          </div>
          <button
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${showFilters ? 'bg-bod-blue text-white border-bod-blue' : 'border-bod-light text-gray-500 hover:border-bod-blue hover:text-bod-blue'}`}
            onClick={() => setShowFilters(!showFilters)}>
            <Filter size={15} /> Filtrar
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-2 mb-4 p-4 bg-bod-xlight rounded-2xl">
            <button
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${!category ? 'bg-bod-blue text-white' : 'bg-white text-gray-500 hover:text-bod-blue border border-bod-light'}`}
              onClick={() => handleCat('')}>Todas</button>
            {CATEGORIES.map(c => (
              <button key={c}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${category === c ? 'bg-bod-blue text-white' : 'bg-white text-gray-500 hover:text-bod-blue border border-bod-light'}`}
                onClick={() => handleCat(c)}>
                {CAT_LABELS[c] ?? c}
              </button>
            ))}
          </div>
        )}

        <div className="card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-bod-blue border-t-transparent rounded-full animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 text-gray-300 text-sm">Nenhum produto encontrado.</div>
          ) : (
            <div className="divide-y divide-bod-light">
              {products.map(p => (
                <div key={p.id}
                  className="flex items-center justify-between px-4 py-3.5 hover:bg-bod-xlight cursor-pointer transition-colors group"
                  onClick={() => setSelected(p)}>
                  <div className="flex-1 min-w-0 pr-3">
                    <p className="text-sm font-medium text-bod-dark truncate">{p.name}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs text-gray-400">{CAT_LABELS[p.category] ?? p.category}</span>
                      {p.index_val && <span className="text-xs bg-bod-light text-bod-blue font-semibold px-1.5 py-0.5 rounded">{p.index_val}</span>}
                      {p.coating && <span className="text-xs text-gray-400 hidden sm:inline">{p.coating}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {p.optician_price ? (
                      <div className="text-right">
                        <p className="text-sm font-bold text-bod-blue">{fmt(p.optician_price)}</p>
                        <p className="text-xs text-gray-400">para si</p>
                      </div>
                    ) : null}
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-bod-blue transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {total > PAGE_SIZE && (
          <div className="flex items-center justify-between mt-4 text-sm">
            <p className="text-gray-400">{page * PAGE_SIZE + 1}–{Math.min((page+1)*PAGE_SIZE, total)} de {total.toLocaleString('pt-PT')}</p>
            <div className="flex gap-2">
              <button className="btn-outline py-2 px-4 disabled:opacity-40" disabled={page === 0} onClick={() => setPage(p => p-1)}>← Anterior</button>
              <button className="btn-outline py-2 px-4 disabled:opacity-40" disabled={(page+1)*PAGE_SIZE >= total} onClick={() => setPage(p => p+1)}>Seguinte →</button>
            </div>
          </div>
        )}
      </div>

      {/* PRODUCT DETAIL DRAWER */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 p-0 md:p-4"
          onClick={() => setSelected(null)}>
          <div className="bg-white w-full md:max-w-lg rounded-t-3xl md:rounded-2xl max-h-[88vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white px-5 pt-5 pb-4 border-b border-bod-light rounded-t-3xl md:rounded-t-2xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wide text-bod-blue">
                    {CAT_LABELS[selected.category] ?? selected.category}
                  </span>
                  <h2 className="font-display text-base font-bold text-bod-dark mt-1 leading-snug">{selected.name}</h2>
                </div>
                <button onClick={() => setSelected(null)} className="text-gray-300 hover:text-gray-500 shrink-0 mt-1"><X size={20} /></button>
              </div>
            </div>

            <div className="px-5 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-bod-xlight rounded-2xl p-4 text-center">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-1">Preço para si</p>
                  <p className="font-display text-2xl font-bold text-bod-blue">
                    {selected.optician_price ? fmt(selected.optician_price) : '—'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">por par</p>
                </div>
                <div className="bg-green-50 rounded-2xl p-4 text-center">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-1">PVPR sugerido</p>
                  <p className="font-display text-2xl font-bold text-green-600">
                    {selected.pvpr ? fmt(selected.pvpr) : '—'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">ao cliente</p>
                </div>
              </div>

              {selected.optician_price && selected.pvpr && (
                <div className="bg-bod-dark rounded-2xl p-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-white/70">Margem bruta estimada</p>
                    <p className="text-lg font-bold text-green-400">+{fmt(selected.pvpr - selected.optician_price)}</p>
                  </div>
                  <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-green-400 rounded-full"
                      style={{ width: `${Math.min(((selected.pvpr - selected.optician_price) / selected.pvpr) * 100, 100)}%` }} />
                  </div>
                  <p className="text-xs text-white/40 mt-1.5">
                    {Math.round(((selected.pvpr - selected.optician_price) / selected.pvpr) * 100)}% de margem sobre PVP
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Detalhes da lente</p>
                <div className="grid grid-cols-2 gap-2">
                  {infoRows(selected).map(r => (
                    <div key={r.label} className="bg-bod-xlight rounded-xl px-3 py-2.5">
                      <p className="text-xs text-gray-400 font-medium mb-0.5">{r.label}</p>
                      <p className="text-sm font-semibold text-bod-dark">{r.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button className="btn-primary w-full py-3.5"
                onClick={() => { setSelected(null); openCalc(selected) }}>
                <Calculator size={16} /> Calcular preço para o cliente
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}
