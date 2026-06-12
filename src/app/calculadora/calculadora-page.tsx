'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import { supabase } from '@/lib/supabase'
import { fmt, LENS_TYPES, MATERIALS, DEFAULT_PRICES, DEFAULT_COATINGS } from '@/lib/data'
import type { Profile } from '@/lib/supabase'
import { Settings, Save, Info, Package, X } from 'lucide-react'

type MatKey = '1.5' | '1.6' | '1.67' | 'solisII'

export default function CalculadoraPage() {
  const searchParams = useSearchParams()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [lensType, setLensType]   = useState('monofocal')
  const [material, setMaterial]   = useState<MatKey>('1.5')
  const [esfera,   setEsfera]     = useState(0)
  const [cilindro, setCilindro]   = useState(0)
  const [margem,   setMargem]     = useState(60)
  const [qty,      setQty]        = useState(1)
  const [coatings, setCoatings]   = useState({ ar: false, uv: false, blue: false, foto: false, antiriscos: false })
  const [showConfig, setShowConfig] = useState(false)
  const [editPrices,   setEditPrices]   = useState(DEFAULT_PRICES)
  const [editCoatings, setEditCoatings] = useState(DEFAULT_COATINGS)
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')

  // Product from catalogue
  const [productName,  setProductName]  = useState('')
  const [productPrice, setProductPrice] = useState<number | null>(null)

  useEffect(() => {
    // Load product from URL if coming from catalogue
    const name  = searchParams.get('name')
    const price = searchParams.get('price')
    if (name)  setProductName(decodeURIComponent(name))
    if (price) setProductPrice(parseFloat(price))
  }, [searchParams])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return
      const { data } = await supabase.from('optica_profiles').select('*').eq('id', session.user.id).single()
      setProfile(data)
    })
  }, [])

  const prices   = profile?.prices && Object.keys(profile.prices).length ? profile.prices : DEFAULT_PRICES
  const cPrices  = profile?.coatings && Object.keys(profile.coatings).length ? profile.coatings : DEFAULT_COATINGS

  const prescSurcharge = (Math.abs(esfera) > 4 || Math.abs(cilindro) > 2) ? 8 : 0
  // Use product price from catalogue if available, otherwise use table prices
  const baseCost  = productPrice !== null
    ? productPrice + prescSurcharge
    : (prices[lensType]?.[material] ?? 0) + prescSurcharge
  const coatCost  = (coatings.ar ? cPrices.ar : 0) + (coatings.uv ? cPrices.uv : 0)
    + (coatings.blue ? cPrices.blue : 0) + (coatings.foto ? cPrices.foto : 0)
    + (coatings.antiriscos ? cPrices.antiriscos : 0)
  const totalPar  = baseCost + coatCost
  const pvp       = totalPar * (1 + margem / 100)
  const margin    = pvp - totalPar
  const barWidth  = Math.min((margem / 150) * 100, 100)

  const openConfig = () => {
    setEditPrices(JSON.parse(JSON.stringify(prices)))
    setEditCoatings({ ...cPrices })
    setShowConfig(true)
  }

  const saveConfig = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    setSaving(true)
    await supabase.from('optica_profiles').update({ prices: editPrices, coatings: editCoatings }).eq('id', session.user.id)
    setProfile(p => p ? { ...p, prices: editPrices, coatings: editCoatings } : p)
    setSaving(false)
    setSavedMsg('Preços guardados!')
    setTimeout(() => setSavedMsg(''), 3000)
    setShowConfig(false)
  }

  const lensLabel = LENS_TYPES.find(l => l.key === lensType)?.label ?? lensType
  const matLabel  = MATERIALS.find(m => m.key === material)?.label ?? material

  return (
    <AppShell>
      <div className="px-4 md:px-8 py-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-bod-blue mb-1">Ferramenta</p>
          <h1 className="font-display text-2xl font-bold text-bod-dark">Calculadora de Preços</h1>
          <p className="text-sm text-gray-400 mt-1">Calcule o custo BOD e o PVP ao cliente em tempo real.</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-5 items-start">
          {/* INPUTS */}
          <div className="lg:col-span-3 space-y-4">

            {/* Product from catalogue banner */}
            {productName && (
              <div className="flex items-start justify-between gap-3 bg-bod-light border border-bod-blue/20 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <Package size={18} className="text-bod-blue shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-bod-blue mb-0.5">Produto do catálogo</p>
                    <p className="text-sm font-semibold text-bod-dark leading-snug">{productName}</p>
                    {productPrice !== null && (
                      <p className="text-xs text-gray-500 mt-0.5">Preço base: <strong className="text-bod-blue">{fmt(productPrice)}</strong></p>
                    )}
                  </div>
                </div>
                <button onClick={() => { setProductName(''); setProductPrice(null) }}
                  className="text-gray-300 hover:text-gray-500 shrink-0"><X size={16} /></button>
              </div>
            )}

            <div className="card p-5 md:p-6">
              {/* Only show lens type/material when no product selected */}
              {!productName && (
                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className="label">Tipo de lente</label>
                    <select className="input" value={lensType} onChange={e => setLensType(e.target.value)}>
                      {LENS_TYPES.map(l => <option key={l.key} value={l.key}>{l.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Material</label>
                    <select className="input" value={material} onChange={e => setMaterial(e.target.value as MatKey)}>
                      {MATERIALS.map(m => <option key={m.key} value={m.key}>{m.label}</option>)}
                    </select>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="label">Esfera (Dpt)</label>
                  <input type="number" step="0.25" min="-20" max="20" className="input"
                    value={esfera} onChange={e => setEsfera(parseFloat(e.target.value) || 0)} />
                </div>
                <div>
                  <label className="label">Cilindro (Dpt)</label>
                  <input type="number" step="0.25" min="-8" max="8" className="input"
                    value={cilindro} onChange={e => setCilindro(parseFloat(e.target.value) || 0)} />
                </div>
              </div>

              {prescSurcharge > 0 && (
                <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mb-5">
                  <Info size={14} /> Prescrição elevada: suplemento +{fmt(prescSurcharge)} aplicado.
                </div>
              )}

              <div className="border-t border-bod-light pt-4 mb-5">
                <p className="label mb-3">Revestimentos</p>
                <div className="space-y-1">
                  {[
                    { key: 'ar',         label: 'Anti-reflexo (AR)',        price: cPrices.ar },
                    { key: 'uv',         label: 'Proteção UV 400',          price: cPrices.uv },
                    { key: 'blue',       label: 'Filtro luz azul',          price: cPrices.blue },
                    { key: 'foto',       label: 'Fotocromática',            price: cPrices.foto },
                    { key: 'antiriscos', label: 'Anti-riscos reforçado',    price: cPrices.antiriscos },
                  ].map(c => (
                    <label key={c.key} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-bod-xlight cursor-pointer">
                      <div className="flex items-center gap-3">
                        <input type="checkbox" className="w-4 h-4 accent-bod-blue cursor-pointer"
                          checked={coatings[c.key as keyof typeof coatings]}
                          onChange={e => setCoatings(p => ({ ...p, [c.key]: e.target.checked }))} />
                        <span className="text-sm text-gray-700">{c.label}</span>
                      </div>
                      <span className="text-xs font-semibold text-bod-blue">+{fmt(c.price)}</span>
                    </label>
                  ))}
                </div>
              </div>

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

            <button onClick={openConfig}
              className="w-full flex items-center justify-between p-4 card hover:bg-bod-xlight transition-colors cursor-pointer">
              <div>
                <p className="text-sm font-semibold text-bod-dark">Personalizar tabela de preços</p>
                <p className="text-xs text-gray-400">Edite os preços BOD e guarde no seu perfil</p>
              </div>
              <Settings size={18} className="text-gray-400 shrink-0" />
            </button>
            {savedMsg && <p className="text-xs text-green-600 font-semibold text-center">{savedMsg}</p>}
          </div>

          {/* RESULTS */}
          <div className="lg:col-span-2 lg:sticky lg:top-6">
            <div className="bg-bod-dark rounded-2xl p-6 text-white">
              <h2 className="text-xs font-bold uppercase tracking-widest text-bod-sky mb-5">Resultado</h2>
              <div className="space-y-0">
                {[
                  { label: 'Custo BOD (par)',      value: fmt(baseCost),   muted: true },
                  { label: 'Revestimentos',         value: coatCost > 0 ? fmt(coatCost) : '—', muted: true },
                ].map(r => (
                  <div key={r.label} className="flex justify-between py-2.5 border-b border-white/8">
                    <span className="text-sm text-white/50">{r.label}</span>
                    <span className="text-sm text-white/70 font-medium">{r.value}</span>
                  </div>
                ))}
                <div className="flex justify-between py-3 border-b border-white/15">
                  <span className="text-sm text-white/70">Custo total / par</span>
                  <span className="text-base font-bold">{fmt(totalPar)}</span>
                </div>
                <div className="flex justify-between py-4">
                  <span className="text-sm text-white/70">PVP ao cliente</span>
                  <span className="text-2xl font-bold text-bod-sky">{fmt(pvp)}</span>
                </div>
                <div className="flex justify-between py-2.5 border-t border-white/10">
                  <span className="text-sm text-white/50">Margem / par</span>
                  <span className="text-sm font-semibold text-green-400">+{fmt(margin)}</span>
                </div>
                {qty > 1 && (
                  <>
                    <div className="flex justify-between py-2.5 border-t border-white/10">
                      <span className="text-sm text-white/50">Total custo ({qty} pares)</span>
                      <span className="text-sm font-semibold">{fmt(totalPar * qty)}</span>
                    </div>
                    <div className="flex justify-between py-2.5">
                      <span className="text-sm text-white/70">Total PVP ({qty} pares)</span>
                      <span className="text-sm font-bold text-white">{fmt(pvp * qty)}</span>
                    </div>
                    <div className="flex justify-between py-2.5 border-t border-white/10">
                      <span className="text-sm text-white/50">Margem total</span>
                      <span className="text-sm font-bold text-green-400">+{fmt(margin * qty)}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-xs text-white/40 mb-1.5">
                  <span>Margem</span><span className="font-semibold text-white/60">{Math.round(margem)}%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-bod-sky rounded-full transition-all duration-300" style={{ width: `${barWidth}%` }} />
                </div>
              </div>

              <div className="mt-4 bg-white/8 border border-white/10 rounded-xl p-4">
                <p className="text-xs text-white/60 leading-relaxed">
                  <span className="text-white font-medium">{lensLabel}</span> em {matLabel} —
                  custo <span className="text-bod-sky font-semibold">{fmt(totalPar)}</span> · PVP{' '}
                  <span className="text-white font-semibold">{fmt(pvp)}</span> · margem{' '}
                  <span className="text-green-400 font-semibold">+{fmt(margin)}</span> por par.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PRICE CONFIG MODAL */}
      {showConfig && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
          onClick={() => setShowConfig(false)}>
          <div className="bg-white w-full md:max-w-2xl rounded-t-3xl md:rounded-2xl max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-bod-light sticky top-0 bg-white rounded-t-3xl md:rounded-t-2xl">
              <h2 className="font-display text-lg font-bold text-bod-dark">Tabela de preços</h2>
              <p className="text-xs text-gray-400 mt-1">Preços de custo BOD por tipo de lente (€ por par).</p>
            </div>
            <div className="p-5 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs font-bold uppercase tracking-wide text-gray-400">
                    <th className="text-left pb-3 pr-4">Tipo</th>
                    <th className="text-center pb-3 px-2">1.5</th>
                    <th className="text-center pb-3 px-2">1.6</th>
                    <th className="text-center pb-3 px-2">1.67</th>
                    <th className="text-center pb-3 px-2">Solis II</th>
                  </tr>
                </thead>
                <tbody>
                  {LENS_TYPES.map(l => (
                    <tr key={l.key} className="border-t border-bod-light">
                      <td className="py-2 pr-4 text-gray-500 text-xs font-medium whitespace-nowrap">{l.label}</td>
                      {(['1.5','1.6','1.67','solisII'] as MatKey[]).map(mk => (
                        <td key={mk} className="py-2 px-2">
                          <input type="number" step="0.5" min="0"
                            className="w-16 px-2 py-1.5 border border-bod-light rounded-lg text-sm text-right font-semibold focus:outline-none focus:border-bod-blue"
                            value={editPrices[l.key]?.[mk] ?? 0}
                            onChange={e => setEditPrices(p => ({ ...p, [l.key]: { ...p[l.key], [mk]: parseFloat(e.target.value)||0 } }))} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-5 pt-4 border-t border-bod-light">
                <p className="label mb-3">Revestimentos</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { key: 'ar', label: 'Anti-reflexo' }, { key: 'uv', label: 'UV 400' },
                    { key: 'blue', label: 'Blue-Cut' }, { key: 'foto', label: 'Fotocromática' },
                    { key: 'antiriscos', label: 'Anti-riscos' },
                  ].map(c => (
                    <div key={c.key}>
                      <label className="label">{c.label}</label>
                      <input type="number" step="0.5" min="0"
                        className="w-full px-3 py-2 border border-bod-light rounded-xl text-sm font-semibold text-right focus:outline-none focus:border-bod-blue"
                        value={editCoatings[c.key] ?? 0}
                        onChange={e => setEditCoatings(p => ({ ...p, [c.key]: parseFloat(e.target.value)||0 }))} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-bod-light flex gap-3 sticky bottom-0 bg-white">
              <button className="btn-ghost flex-1" onClick={() => setShowConfig(false)}>Cancelar</button>
              <button className="btn-primary flex-1" onClick={saveConfig} disabled={saving}>
                <Save size={15} /> {saving ? 'A guardar...' : 'Guardar preços'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}
