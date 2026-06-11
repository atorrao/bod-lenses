'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { BRAND_IMAGES, DEFAULT_PRICES, DEFAULT_COATINGS, LENS_TYPES, MATERIALS } from '@/lib/data'
import { supabase, PriceTable, CoatingPrices } from '@/lib/supabase'
import { Settings, ChevronDown, ChevronUp, Info, Save } from 'lucide-react'

type MatKey = '1.5' | '1.6' | '1.67' | 'solisII'

export default function CalculadoraPage() {
  const [lensType, setLensType] = useState('monofocal')
  const [material, setMaterial] = useState<MatKey>('1.5')
  const [esfera, setEsfera] = useState(0)
  const [cilindro, setCilindro] = useState(0)
  const [margem, setMargem] = useState(60)
  const [quantidade, setQuantidade] = useState(1)
  const [coatings, setCoatings] = useState({ ar: false, uv: false, blue: false, foto: false, antiriscos: false })

  const [prices, setPrices] = useState<PriceTable>(DEFAULT_PRICES)
  const [coatingPrices, setCoatingPrices] = useState<CoatingPrices>(DEFAULT_COATINGS)
  const [showConfig, setShowConfig] = useState(false)
  const [configEmail, setConfigEmail] = useState('')
  const [configOptica, setConfigOptica] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')

  const [editPrices, setEditPrices] = useState<PriceTable>(DEFAULT_PRICES)
  const [editCoatings, setEditCoatings] = useState<CoatingPrices>(DEFAULT_COATINGS)

  // Calculations
  const prescSurcharge = (Math.abs(esfera) > 4 || Math.abs(cilindro) > 2) ? 8 : 0
  const baseCost = (prices[lensType]?.[material] ?? 0) + prescSurcharge
  const coatCost =
    (coatings.ar ? coatingPrices.ar : 0) +
    (coatings.uv ? coatingPrices.uv : 0) +
    (coatings.blue ? coatingPrices.blue : 0) +
    (coatings.foto ? coatingPrices.foto : 0) +
    (coatings.antiriscos ? coatingPrices.antiriscos : 0)
  const totalPar = baseCost + coatCost
  const pvp = totalPar * (1 + margem / 100)
  const margemVal = pvp - totalPar
  const totalCusto = totalPar * quantidade
  const totalPvp = pvp * quantidade

  const fmt = (n: number) =>
    n.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 })

  const barPct = Math.min(Math.round(margem), 200)
  const barWidth = Math.min((barPct / 150) * 100, 100)

  const lensLabel = LENS_TYPES.find(l => l.key === lensType)?.label ?? lensType

  const loadConfig = useCallback(async (email: string) => {
    if (!email) return
    const { data } = await supabase
      .from('price_configs')
      .select('*')
      .eq('optica_email', email)
      .single()
    if (data) {
      if (data.prices && Object.keys(data.prices).length > 0) setPrices(data.prices)
      if (data.coatings && Object.keys(data.coatings).length > 0) setCoatingPrices(data.coatings)
    }
  }, [])

  const saveConfig = async () => {
    if (!configEmail) { setSavedMsg('Indique o email da ótica.'); return }
    setSaving(true)
    const payload = {
      optica_email: configEmail,
      optica_name: configOptica,
      prices: editPrices,
      coatings: editCoatings,
    }
    const { error } = await supabase.from('price_configs').upsert(payload, { onConflict: 'optica_email' })
    setSaving(false)
    if (!error) {
      setPrices(editPrices)
      setCoatingPrices(editCoatings)
      setSavedMsg('Preços guardados com sucesso!')
      setTimeout(() => setSavedMsg(''), 3000)
      setShowConfig(false)
    } else {
      setSavedMsg('Erro ao guardar. Tente novamente.')
    }
  }

  const openConfig = () => {
    setEditPrices(JSON.parse(JSON.stringify(prices)))
    setEditCoatings({ ...coatingPrices })
    setShowConfig(true)
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-bod-xlight">
        {/* Header */}
        <section className="relative bg-bod-dark overflow-hidden">
          <div className="absolute inset-0">
            <Image src={BRAND_IMAGES.colorSight} alt="Calculadora" fill className="object-cover opacity-20" priority />
            <div className="absolute inset-0 bg-gradient-to-r from-bod-dark to-bod-dark/60" />
          </div>
          <div className="relative max-w-6xl mx-auto px-6 py-12">
            <p className="text-xs font-bold uppercase tracking-widest text-bod-sky mb-3">Ferramenta</p>
            <h1 className="font-display text-4xl font-bold tracking-tight text-white mb-3">Calculadora de Preços</h1>
            <p className="text-white/60 max-w-lg leading-relaxed">
              Configure o tipo de lente, material e margem pretendida. Veja o custo BOD e o PVP ao cliente em tempo real.
            </p>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid lg:grid-cols-5 gap-6 items-start">

            {/* CONFIG PANEL */}
            <div className="lg:col-span-3 space-y-5">
              <div className="card">
                <h2 className="text-sm font-bold uppercase tracking-widest text-bod-blue mb-6 flex items-center gap-2">
                  <Settings size={16} /> Configurar lente
                </h2>

                <div className="grid grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className="label">Tipo de lente</label>
                    <select className="input" value={lensType} onChange={e => setLensType(e.target.value)}>
                      {LENS_TYPES.map(l => (
                        <option key={l.key} value={l.key}>{l.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Material</label>
                    <select className="input" value={material} onChange={e => setMaterial(e.target.value as MatKey)}>
                      {MATERIALS.map(m => (
                        <option key={m.key} value={m.key}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
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
                  <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-5">
                    <Info size={14} />
                    Prescrição elevada: suplemento de +{fmt(prescSurcharge)} aplicado automaticamente.
                  </div>
                )}

                {/* Coatings */}
                <div className="border-t border-bod-light pt-5 mb-6">
                  <p className="label mb-3">Revestimentos</p>
                  <div className="space-y-2">
                    {[
                      { key: 'ar', label: 'Anti-reflexo (AR)', price: coatingPrices.ar },
                      { key: 'uv', label: 'Proteção UV 400', price: coatingPrices.uv },
                      { key: 'blue', label: 'Filtro luz azul (Blue-Cut)', price: coatingPrices.blue },
                      { key: 'foto', label: 'Fotocromática', price: coatingPrices.foto },
                      { key: 'antiriscos', label: 'Anti-riscos reforçado', price: coatingPrices.antiriscos },
                    ].map(c => (
                      <label key={c.key} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-bod-xlight cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <input type="checkbox"
                            className="w-4 h-4 accent-bod-blue cursor-pointer"
                            checked={coatings[c.key as keyof typeof coatings]}
                            onChange={e => setCoatings(prev => ({ ...prev, [c.key]: e.target.checked }))}
                          />
                          <span className="text-sm text-gray-700">{c.label}</span>
                        </div>
                        <span className="text-xs font-semibold text-bod-blue">+{fmt(c.price)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Margem + Quantidade */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Margem ótica (%)</label>
                    <input type="number" step="5" min="0" max="500" className="input font-semibold"
                      value={margem} onChange={e => setMargem(parseFloat(e.target.value) || 0)} />
                  </div>
                  <div>
                    <label className="label">Quantidade (pares)</label>
                    <input type="number" step="1" min="1" max="999" className="input"
                      value={quantidade} onChange={e => setQuantidade(parseInt(e.target.value) || 1)} />
                  </div>
                </div>
              </div>

              {/* Config email */}
              <div className="card">
                <div className="flex items-center justify-between cursor-pointer" onClick={openConfig}>
                  <div>
                    <p className="text-sm font-semibold text-bod-dark">Tabela de preços personalizada</p>
                    <p className="text-xs text-gray-400 mt-0.5">Edite os preços de custo BOD e guarde por ótica</p>
                  </div>
                  <Settings size={18} className="text-gray-400" />
                </div>
                {savedMsg && (
                  <p className={`mt-3 text-xs font-semibold ${savedMsg.includes('sucesso') ? 'text-green-600' : 'text-red-500'}`}>
                    {savedMsg}
                  </p>
                )}
              </div>

              <div className="text-xs text-gray-400 bg-white border border-bod-light rounded-xl px-4 py-3 leading-relaxed">
                <strong className="text-bod-blue">Nota:</strong> Preços por par de lentes (sem IVA). Para encomendas {'>'} 10 pares do mesmo tipo, contacte a equipa BOD para condições especiais.
              </div>
            </div>

            {/* RESULTS PANEL */}
            <div className="lg:col-span-2 sticky top-20">
              <div className="bg-bod-dark rounded-2xl p-7 text-white">
                <h2 className="text-xs font-bold uppercase tracking-widest text-bod-sky mb-6">Resultado</h2>

                <div className="space-y-0">
                  {[
                    { label: 'Custo BOD (par)', value: fmt(baseCost) },
                    { label: 'Revestimentos', value: coatCost > 0 ? fmt(coatCost) : '—' },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between items-baseline py-3 border-b border-white/8">
                      <span className="text-sm text-white/50">{r.label}</span>
                      <span className="text-sm font-semibold text-white/80">{r.value}</span>
                    </div>
                  ))}

                  <div className="flex justify-between items-baseline py-3 border-b border-white/20">
                    <span className="text-sm text-white/70">Custo total por par</span>
                    <span className="text-base font-bold text-white">{fmt(totalPar)}</span>
                  </div>

                  <div className="flex justify-between items-baseline py-4">
                    <span className="text-sm text-white/70">PVP sugerido ao cliente</span>
                    <span className="text-2xl font-bold text-bod-sky">{fmt(pvp)}</span>
                  </div>

                  <div className="flex justify-between items-baseline py-3 border-t border-white/10">
                    <span className="text-sm text-white/50">Margem bruta / par</span>
                    <span className="text-sm font-semibold text-white/80">{fmt(margemVal)}</span>
                  </div>

                  {quantidade > 1 && (
                    <>
                      <div className="flex justify-between items-baseline py-3 border-t border-white/10">
                        <span className="text-sm text-white/50">Total custo ({quantidade} pares)</span>
                        <span className="text-sm font-semibold text-white/80">{fmt(totalCusto)}</span>
                      </div>
                      <div className="flex justify-between items-baseline py-3 border-t border-white/10">
                        <span className="text-sm text-white/70">Total PVP ({quantidade} pares)</span>
                        <span className="text-base font-bold text-white">{fmt(totalPvp)}</span>
                      </div>
                      <div className="flex justify-between items-baseline py-3 border-t border-white/10">
                        <span className="text-sm text-white/50">Margem bruta total</span>
                        <span className="text-sm font-semibold text-green-400">{fmt(margemVal * quantidade)}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Bar */}
                <div className="mt-5">
                  <div className="flex justify-between text-xs text-white/40 mb-2">
                    <span>Margem aplicada</span>
                    <span className="font-semibold text-white/60">{Math.round(margem)}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-bod-sky rounded-full transition-all duration-300" style={{ width: `${barWidth}%` }} />
                  </div>
                </div>

                {/* Advantage text */}
                <div className="mt-5 bg-white/8 border border-white/15 rounded-xl p-4">
                  <p className="text-xs text-white/60 leading-relaxed">
                    Com BOD Lenses, uma <span className="text-white font-medium">{lensLabel.toLowerCase()}</span> em {MATERIALS.find(m => m.key === material)?.label} tem custo de{' '}
                    <span className="text-bod-sky font-semibold">{fmt(totalPar)}</span> por par.
                    Com {Math.round(margem)}% de margem, o cliente paga{' '}
                    <span className="text-white font-semibold">{fmt(pvp)}</span>{' '}
                    — margem bruta de <span className="text-green-400 font-semibold">{fmt(margemVal)}</span> por par vendido.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PRICE CONFIG MODAL */}
        {showConfig && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowConfig(false)}>
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-bod-light">
                <h2 className="font-display text-xl font-bold text-bod-dark">Tabela de preços</h2>
                <p className="text-sm text-gray-500 mt-1">Edite os preços de custo BOD por tipo de lente e material. Guarde associado ao email da ótica.</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="label">Email da ótica</label>
                    <input type="email" className="input" placeholder="otica@email.pt"
                      value={configEmail} onChange={e => { setConfigEmail(e.target.value); loadConfig(e.target.value) }} />
                  </div>
                  <div>
                    <label className="label">Nome da ótica</label>
                    <input type="text" className="input" placeholder="Nome da ótica"
                      value={configOptica} onChange={e => setConfigOptica(e.target.value)} />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
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
                          <td className="py-2 pr-4 text-gray-600 font-medium whitespace-nowrap">{l.label}</td>
                          {(['1.5', '1.6', '1.67', 'solisII'] as MatKey[]).map(mk => (
                            <td key={mk} className="py-2 px-2">
                              <input type="number" step="0.5" min="0"
                                className="w-20 px-2 py-1.5 border border-bod-light rounded-lg text-sm text-right font-semibold focus:outline-none focus:border-bod-blue"
                                value={editPrices[l.key]?.[mk] ?? 0}
                                onChange={e => setEditPrices(prev => ({
                                  ...prev,
                                  [l.key]: { ...prev[l.key], [mk]: parseFloat(e.target.value) || 0 }
                                }))}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 pt-5 border-t border-bod-light">
                  <p className="label mb-3">Preços de revestimentos</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { key: 'ar', label: 'Anti-reflexo' },
                      { key: 'uv', label: 'UV 400' },
                      { key: 'blue', label: 'Blue-Cut' },
                      { key: 'foto', label: 'Fotocromática' },
                      { key: 'antiriscos', label: 'Anti-riscos' },
                    ].map(c => (
                      <div key={c.key}>
                        <label className="label">{c.label}</label>
                        <input type="number" step="0.5" min="0"
                          className="w-full px-3 py-2 border border-bod-light rounded-lg text-sm font-semibold text-right focus:outline-none focus:border-bod-blue"
                          value={editCoatings[c.key as keyof CoatingPrices]}
                          onChange={e => setEditCoatings(prev => ({ ...prev, [c.key]: parseFloat(e.target.value) || 0 }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-bod-light flex justify-end gap-3">
                <button className="btn-outline" onClick={() => setShowConfig(false)}>Cancelar</button>
                <button className="btn-primary" onClick={saveConfig} disabled={saving}>
                  <Save size={15} />
                  {saving ? 'A guardar...' : 'Guardar preços'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
