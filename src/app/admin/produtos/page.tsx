'use client'

import { useEffect, useState, useCallback } from 'react'
import AdminShell from '@/components/layout/AdminShell'
import { supabase } from '@/lib/supabase'
import { fmt } from '@/lib/data'
import { Search, TrendingUp, Download, Filter } from 'lucide-react'

type Product = {
  id: number
  name: string
  barcode: string
  category: string
  optician_price: number | null
  pvpr: number | null
  index_val: string
  coating: string
  design: string
  sales_count: number
}

const CAT_LABELS: Record<string,string> = {
  'RX MONOFOCAL':'Monofocal','RX PROGRESSIVA':'Progressiva',
  'RX BIFOCAL':'Bifocal','RX COLORAÇÃO/TINT':'Coloração / Tint',
  'STOCK NANO BASIC':'Basic','STOCK NANO LONGUS':'Longus',
  'STOCK NANO BLUELINE':'Blueline','STOCK NANO ACHROMATIC':'Achromatic',
  'STOCK NANO SOLIS':'Solis','STOCK NANO TINTING':'Tinting',
  'STOCK NANO TRANS GENS':'Trans Gens','STOCK TRANS XTRA':'Trans Xtra',
  'STOCK BLUE420':'Blue420','SUPLEMENTOS':'Suplementos',
}

const PAGE_SIZE = 50

export default function AdminProdutos() {
  const [products,    setProducts]    = useState<Product[]>([])
  const [topSellers,  setTopSellers]  = useState<Product[]>([])
  const [total,       setTotal]       = useState(0)
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [category,    setCategory]    = useState('')
  const [sortBy,      setSortBy]      = useState<'name'|'sales_count'|'optician_price'>('sales_count')
  const [page,        setPage]        = useState(0)

  const load = useCallback(async (s: string, cat: string, sort: string, p: number) => {
    setLoading(true)
    let q = supabase.from('products').select('*', { count: 'exact' })
    if (cat) q = q.eq('category', cat)
    if (s)   q = q.ilike('name', `%${s}%`)
    q = q.order(sort, { ascending: sort === 'name' }).range(p * PAGE_SIZE, (p+1) * PAGE_SIZE - 1)
    const { data, count } = await q
    setProducts(data ?? [])
    setTotal(count ?? 0)
    setLoading(false)
  }, [])

  const loadTop = useCallback(async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('sales_count', { ascending: false })
      .gt('sales_count', 0)
      .limit(5)
    setTopSellers(data ?? [])
  }, [])

  useEffect(() => { load(search, category, sortBy, page); loadTop() }, [search, category, sortBy, page, load, loadTop])

  const exportCSV = () => {
    const headers = ['Nome','Categoria','Índice','Coating','Preço Ótico','PVPR','Vendas']
    const rows = products.map(p => [
      p.name, CAT_LABELS[p.category] ?? p.category,
      p.index_val ?? '', p.coating ?? '',
      p.optician_price ?? '', p.pvpr ?? '', p.sales_count
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], {type:'text/csv'})); a.download='bod-produtos.csv'; a.click()
  }

  return (
    <AdminShell>
      <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-bod-dark">Produtos</h1>
            <p className="text-sm text-gray-400 mt-0.5">{total.toLocaleString('pt-PT')} produtos no catálogo</p>
          </div>
          <button className="btn-outline shrink-0" onClick={exportCSV}>
            <Download size={15} /> Exportar CSV
          </button>
        </div>

        {/* TOP SELLERS */}
        {topSellers.length > 0 && (
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-green-600" />
              <h2 className="font-semibold text-sm text-bod-dark">Mais vendidos</h2>
              <span className="text-xs text-gray-400">— em destaque</span>
            </div>
            <div className="space-y-2">
              {topSellers.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-transparent rounded-xl">
                  <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-700 shrink-0">
                    {i+1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-bod-dark truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">{CAT_LABELS[p.category] ?? p.category}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-green-600">{p.sales_count} vendas</p>
                    {p.optician_price && <p className="text-xs text-gray-400">{fmt(p.optician_price)}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {topSellers.length === 0 && (
          <div className="card p-4 flex items-center gap-3 bg-amber-50 border-amber-100">
            <TrendingUp size={16} className="text-amber-500" />
            <p className="text-sm text-amber-700">Ainda sem vendas registadas. Os produtos mais vendidos aparecerão aqui em destaque.</p>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-10" placeholder="Pesquisar produto..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} />
          </div>
          <select className="input sm:w-48" value={category} onChange={e => { setCategory(e.target.value); setPage(0) }}>
            <option value="">Todas as categorias</option>
            {Object.entries(CAT_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select className="input sm:w-44" value={sortBy} onChange={e => setSortBy(e.target.value as any)}>
            <option value="sales_count">Mais vendidos</option>
            <option value="name">Nome A–Z</option>
            <option value="optician_price">Preço</option>
          </select>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Produto','Categoria','Índice','Coating','Preço ótico','PVPR','Vendas'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide text-gray-400 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-12">
                    <div className="w-7 h-7 border-2 border-bod-blue border-t-transparent rounded-full animate-spin mx-auto" />
                  </td></tr>
                ) : products.map(p => (
                  <tr key={p.id} className={`border-b border-gray-50 hover:bg-gray-50/50 ${p.sales_count > 0 ? 'bg-green-50/30' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {p.sales_count > 0 && <TrendingUp size={13} className="text-green-500 shrink-0" />}
                        <span className="font-medium text-bod-dark text-xs max-w-xs truncate">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{CAT_LABELS[p.category] ?? p.category}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{p.index_val || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{p.coating || '—'}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-bod-blue whitespace-nowrap">
                      {p.optician_price ? fmt(p.optician_price) : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                      {p.pvpr ? fmt(p.pvpr) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {p.sales_count > 0
                        ? <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{p.sales_count}</span>
                        : <span className="text-xs text-gray-300">0</span>
                      }
                    </td>
                  </tr>
                ))}
                {!loading && products.length === 0 && (
                  <tr><td colSpan={7} className="text-center text-gray-300 py-10 text-sm">Nenhum produto encontrado.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

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
