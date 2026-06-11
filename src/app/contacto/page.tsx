'use client'

import { useState } from 'react'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { BRAND_IMAGES } from '@/lib/data'
import { supabase } from '@/lib/supabase'
import { Send, Phone, Mail, MapPin, Clock, CheckCircle } from 'lucide-react'

type Tab = 'contacto' | 'parceria'

export default function ContactoPage() {
  const [tab, setTab] = useState<Tab>('contacto')

  // Contact form
  const [cForm, setCForm] = useState({ name: '', optica: '', email: '', subject: 'Informações sobre produtos', message: '' })
  const [cSending, setCSending] = useState(false)
  const [cDone, setCDone] = useState(false)
  const [cError, setCError] = useState('')

  // Lead form
  const [lForm, setLForm] = useState({ name: '', optica: '', email: '', phone: '', city: '', interest: 'parceria' as const, message: '' })
  const [lSending, setLSending] = useState(false)
  const [lDone, setLDone] = useState(false)
  const [lError, setLError] = useState('')

  const submitContact = async () => {
    if (!cForm.name || !cForm.email || !cForm.message) { setCError('Preencha todos os campos obrigatórios.'); return }
    setCSending(true); setCError('')
    const { error } = await supabase.from('contact_messages').insert([cForm])
    setCSending(false)
    if (error) { setCError('Erro ao enviar. Tente novamente.') }
    else { setCDone(true) }
  }

  const submitLead = async () => {
    if (!lForm.name || !lForm.email || !lForm.optica) { setLError('Preencha os campos obrigatórios.'); return }
    setLSending(true); setLError('')
    const { error } = await supabase.from('optica_leads').insert([lForm])
    setLSending(false)
    if (error) { setLError('Erro ao enviar. Tente novamente.') }
    else { setLDone(true) }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Header */}
        <section className="relative bg-bod-dark overflow-hidden">
          <div className="absolute inset-0">
            <Image src={BRAND_IMAGES.opticas} alt="Contacto" fill className="object-cover opacity-20" priority />
            <div className="absolute inset-0 bg-gradient-to-r from-bod-dark to-bod-dark/50" />
          </div>
          <div className="relative max-w-6xl mx-auto px-6 py-16">
            <p className="text-xs font-bold uppercase tracking-widest text-bod-sky mb-3">Fale connosco</p>
            <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">Contacto</h1>
            <p className="text-white/60 text-lg max-w-xl leading-relaxed">
              A nossa equipa está disponível para apoio técnico, comercial e de encomendas.
            </p>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-3 gap-8">

            {/* Left: contact info */}
            <div className="space-y-5">
              <div className="card">
                <h2 className="font-semibold text-base text-bod-dark mb-5">Contactos diretos</h2>
                <div className="space-y-4">
                  {[
                    { icon: Phone, label: 'Telefone', value: '+351 915 234 366', href: 'tel:+351915234366' },
                    { icon: Phone, label: 'Linha fixa', value: '+351 211 248 310', href: 'tel:+351211248310' },
                    { icon: Mail, label: 'Email', value: 'suporte@bodlensesportugal.com', href: 'mailto:suporte@bodlensesportugal.com' },
                    { icon: MapPin, label: 'Morada', value: 'Alameda da Beloura, Ed.4, Of. 0.5\nSintra, Lisboa 2714-561', href: null },
                    { icon: Clock, label: 'Horário', value: 'Seg–Sex, 9h30–18h00', href: null },
                  ].map(({ icon: Icon, label, value, href }) => (
                    <div key={label} className="flex gap-3 items-start">
                      <div className="w-9 h-9 bg-bod-xlight rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                        <Icon size={16} className="text-bod-blue" />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-0.5">{label}</p>
                        {href ? (
                          <a href={href} className="text-sm text-bod-blue font-medium hover:underline">{value}</a>
                        ) : (
                          <p className="text-sm text-gray-600 whitespace-pre-line">{value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card bg-bod-dark text-white">
                <p className="text-xs font-bold uppercase tracking-widest text-bod-sky mb-3">BOD Start</p>
                <h3 className="font-semibold mb-2">Quer abrir uma ótica?</h3>
                <p className="text-sm text-white/60 leading-relaxed mb-4">
                  O programa BOD Start apoia novos projetos desde o primeiro dia com consultoria, condições especiais e suporte dedicado.
                </p>
                <button className="text-xs font-bold text-bod-sky hover:text-white transition-colors"
                  onClick={() => setTab('parceria')}>
                  Saber mais →
                </button>
              </div>
            </div>

            {/* Right: forms */}
            <div className="md:col-span-2">
              {/* Tabs */}
              <div className="flex gap-1 p-1 bg-bod-xlight rounded-xl mb-6 w-fit">
                {[
                  { key: 'contacto', label: 'Mensagem de contacto' },
                  { key: 'parceria', label: 'Tornar-me parceiro' },
                ].map(t => (
                  <button key={t.key}
                    className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors ${tab === t.key ? 'bg-white text-bod-blue shadow-sm' : 'text-gray-500 hover:text-bod-blue'}`}
                    onClick={() => setTab(t.key as Tab)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* CONTACT FORM */}
              {tab === 'contacto' && (
                <div className="card">
                  {cDone ? (
                    <div className="text-center py-12">
                      <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                      <h3 className="font-semibold text-lg text-bod-dark mb-2">Mensagem enviada!</h3>
                      <p className="text-gray-500 text-sm">A nossa equipa entrará em contacto em breve.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="label">Nome *</label>
                          <input className="input" placeholder="O seu nome"
                            value={cForm.name} onChange={e => setCForm(p => ({ ...p, name: e.target.value }))} />
                        </div>
                        <div>
                          <label className="label">Ótica *</label>
                          <input className="input" placeholder="Nome da ótica"
                            value={cForm.optica} onChange={e => setCForm(p => ({ ...p, optica: e.target.value }))} />
                        </div>
                      </div>
                      <div>
                        <label className="label">Email *</label>
                        <input type="email" className="input" placeholder="email@otica.pt"
                          value={cForm.email} onChange={e => setCForm(p => ({ ...p, email: e.target.value }))} />
                      </div>
                      <div>
                        <label className="label">Assunto</label>
                        <select className="input" value={cForm.subject} onChange={e => setCForm(p => ({ ...p, subject: e.target.value }))}>
                          <option>Informações sobre produtos</option>
                          <option>Preços e condições comerciais</option>
                          <option>Apoio técnico</option>
                          <option>Programa Pioneiros BOD</option>
                          <option>BOD Start — nova ótica</option>
                          <option>Outro</option>
                        </select>
                      </div>
                      <div>
                        <label className="label">Mensagem *</label>
                        <textarea className="input resize-none" rows={5} placeholder="Como podemos ajudar?"
                          value={cForm.message} onChange={e => setCForm(p => ({ ...p, message: e.target.value }))} />
                      </div>
                      {cError && <p className="text-sm text-red-500 font-medium">{cError}</p>}
                      <button className="btn-primary w-full justify-center py-3.5" onClick={submitContact} disabled={cSending}>
                        <Send size={16} />
                        {cSending ? 'A enviar...' : 'Enviar mensagem'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* LEAD FORM */}
              {tab === 'parceria' && (
                <div className="card">
                  {lDone ? (
                    <div className="text-center py-12">
                      <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                      <h3 className="font-semibold text-lg text-bod-dark mb-2">Pedido recebido!</h3>
                      <p className="text-gray-500 text-sm">A equipa comercial BOD entrará em contacto nas próximas 24–48h.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="label">Nome *</label>
                          <input className="input" placeholder="O seu nome"
                            value={lForm.name} onChange={e => setLForm(p => ({ ...p, name: e.target.value }))} />
                        </div>
                        <div>
                          <label className="label">Ótica / Projeto *</label>
                          <input className="input" placeholder="Nome da ótica"
                            value={lForm.optica} onChange={e => setLForm(p => ({ ...p, optica: e.target.value }))} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="label">Email *</label>
                          <input type="email" className="input" placeholder="email@otica.pt"
                            value={lForm.email} onChange={e => setLForm(p => ({ ...p, email: e.target.value }))} />
                        </div>
                        <div>
                          <label className="label">Telefone</label>
                          <input type="tel" className="input" placeholder="+351 9XX XXX XXX"
                            value={lForm.phone} onChange={e => setLForm(p => ({ ...p, phone: e.target.value }))} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="label">Cidade</label>
                          <input className="input" placeholder="Lisboa"
                            value={lForm.city} onChange={e => setLForm(p => ({ ...p, city: e.target.value }))} />
                        </div>
                        <div>
                          <label className="label">Interesse</label>
                          <select className="input" value={lForm.interest}
                            onChange={e => setLForm(p => ({ ...p, interest: e.target.value as any }))}>
                            <option value="parceria">Parceria BOD Lenses</option>
                            <option value="bod-start">BOD Start (nova ótica)</option>
                            <option value="pioneiros">Programa Pioneiros BOD</option>
                            <option value="outro">Outro</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="label">Mensagem</label>
                        <textarea className="input resize-none" rows={4} placeholder="Conte-nos o seu projeto ou dúvida..."
                          value={lForm.message} onChange={e => setLForm(p => ({ ...p, message: e.target.value }))} />
                      </div>
                      {lError && <p className="text-sm text-red-500 font-medium">{lError}</p>}
                      <button className="btn-primary w-full justify-center py-3.5" onClick={submitLead} disabled={lSending}>
                        <Send size={16} />
                        {lSending ? 'A enviar...' : 'Submeter pedido de parceria'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
