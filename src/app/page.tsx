'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { BRAND_IMAGES } from '@/lib/data'
import { Mail, ArrowRight, CheckCircle, Calculator, BarChart2, Eye, Users } from 'lucide-react'

type View = 'login' | 'request' | 'sent'

export default function LandingPage() {
  const [view, setView]       = useState<View>('login')
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [req, setReq]         = useState({ optica_name: '', contact_name: '', email: '', phone: '', city: '', message: '' })
  const [reqLoading, setReqLoading] = useState(false)
  const [reqDone, setReqDone]       = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('pending') === '1') setError('O seu acesso ainda está a aguardar aprovação pela equipa BOD.')
    if (params.get('error') === '1')   setError('Erro ao verificar acesso. Tente novamente.')
  }, [])

  const sendMagicLink = async () => {
    if (!email) { setError('Indique o seu email.'); return }
    setLoading(true); setError('')
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback`, shouldCreateUser: false },
    })
    setLoading(false)
    if (err) setError('Email não encontrado ou sem acesso aprovado.')
    else setView('sent')
  }

  const submitRequest = async () => {
    if (!req.optica_name || !req.contact_name || !req.email) { setError('Preencha os campos obrigatórios.'); return }
    setReqLoading(true); setError('')
    const { error: err } = await supabase.from('access_requests').insert([req])
    setReqLoading(false)
    if (err) setError('Erro ao enviar. Tente novamente.')
    else setReqDone(true)
  }

  const features = [
    { icon: Calculator, label: 'Calculadora de preços' },
    { icon: BarChart2,  label: 'Dashboard de margens' },
    { icon: Eye,        label: 'Catálogo completo' },
    { icon: Users,      label: 'Apoio dedicado 24/7' },
  ]

  return (
    <div className="h-screen overflow-hidden flex flex-col md:flex-row bg-white">

      {/* ── LEFT PANEL — desktop only ── */}
      <div className="relative hidden md:flex md:w-[48%] flex-shrink-0 bg-bod-dark">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-bod-dark via-[#0f2d5a] to-[#1a4a8a]/60" />

        {/* Decorative circles */}
        <div className="absolute top-[-80px] right-[-80px] w-80 h-80 rounded-full bg-bod-blue/10 blur-3xl" />
        <div className="absolute bottom-[-60px] left-[-60px] w-60 h-60 rounded-full bg-bod-sky/8 blur-3xl" />

        {/* Content */}
        <div className="relative flex flex-col justify-between h-full w-full p-10">
          {/* Logo area */}
          <div className="flex items-center gap-3">
            <Image src={BRAND_IMAGES.logo} alt="BOD Lenses" width={150} height={40}
              className="h-9 w-auto brightness-0 invert" priority />
          </div>

          <div className="space-y-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-bod-sky mb-4">Portal exclusivo para óticas</p>
              <h1 className="font-display text-4xl font-bold text-white leading-tight mb-4">
                A sua ótica,<br /><span className="text-bod-sky">a sua vantagem.</span>
              </h1>
              <p className="text-white/50 text-base leading-relaxed max-w-sm">
                Aceda à calculadora de preços, dashboard de margens e canal direto com a equipa BOD Lenses.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {features.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3.5 hover:bg-white/8 transition-colors">
                  <Icon size={15} className="text-bod-sky shrink-0" />
                  <span className="text-xs text-white/70 font-medium leading-tight">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-white/20">© 2026 BOD Lenses Portugal</p>
        </div>
      </div>

      {/* ── RIGHT PANEL — auth forms ── */}
      <div className="flex-1 flex flex-col justify-center px-5 py-8 md:px-12 bg-white overflow-y-auto">
        <div className="w-full max-w-sm mx-auto">
          {/* Mobile logo — centered above form */}
          <div className="md:hidden flex justify-center mb-8">
            <Image src={BRAND_IMAGES.logo} alt="BOD Lenses" width={120} height={32} className="h-8 w-auto" />
          </div>

          {/* LOGIN */}
          {view === 'login' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-bold text-bod-dark mb-1">Bem-vindo</h2>
                <p className="text-sm text-gray-400">Enviamos um link de acesso para o seu email.</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="label">Email da ótica</label>
                  <input type="email" className="input text-base" placeholder="email@otica.pt"
                    value={email} onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMagicLink()} />
                </div>
                {error && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                    <p className="text-xs text-red-600 font-medium leading-relaxed">{error}</p>
                  </div>
                )}
                <button className="btn-primary w-full py-3.5 text-base" onClick={sendMagicLink} disabled={loading}>
                  <Mail size={17} />
                  {loading ? 'A enviar...' : 'Enviar link de acesso'}
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
                <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-300 font-medium">ou</span></div>
              </div>

              <div className="space-y-2 text-center">
                <p className="text-sm text-gray-400">Ainda não é parceiro BOD?</p>
                <button className="btn-outline w-full py-3" onClick={() => { setView('request'); setError('') }}>
                  Solicitar acesso <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* SENT */}
          {view === 'sent' && (
            <div className="text-center space-y-5">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-bod-dark mb-2">Verifique o seu email</h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Enviámos um link de acesso para<br />
                  <strong className="text-bod-dark">{email}</strong>.<br /><br />
                  Clique no link para entrar — é válido por 1 hora.
                </p>
              </div>
              <button className="text-sm text-bod-blue font-semibold hover:underline" onClick={() => setView('login')}>
                ← Usar outro email
              </button>
            </div>
          )}

          {/* REQUEST ACCESS */}
          {view === 'request' && (
            <>
              {reqDone ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-bod-light rounded-2xl flex items-center justify-center mx-auto">
                    <CheckCircle size={32} className="text-bod-blue" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold text-bod-dark mb-2">Pedido recebido!</h2>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      A equipa BOD irá analisar o seu pedido e entrará em contacto nas próximas 24–48h.
                    </p>
                  </div>
                  <button className="text-sm text-bod-blue font-semibold hover:underline" onClick={() => setView('login')}>
                    ← Voltar ao login
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <button className="text-sm text-gray-400 hover:text-bod-blue flex items-center gap-1 mb-4"
                      onClick={() => { setView('login'); setError('') }}>
                      ← Voltar
                    </button>
                    <h2 className="font-display text-2xl font-bold text-bod-dark mb-1">Solicitar acesso</h2>
                    <p className="text-sm text-gray-400">A BOD irá analisar e aprovar o seu pedido em 24–48h.</p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="label">Nome da ótica *</label>
                      <input className="input text-base" placeholder="Ótica Exemplo"
                        value={req.optica_name} onChange={e => setReq(p => ({ ...p, optica_name: e.target.value }))} />
                    </div>
                    <div>
                      <label className="label">Nome do responsável *</label>
                      <input className="input text-base" placeholder="João Silva"
                        value={req.contact_name} onChange={e => setReq(p => ({ ...p, contact_name: e.target.value }))} />
                    </div>
                    <div>
                      <label className="label">Email *</label>
                      <input type="email" className="input text-base" placeholder="email@otica.pt"
                        value={req.email} onChange={e => setReq(p => ({ ...p, email: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="label">Telefone</label>
                        <input className="input text-base" placeholder="+351 9XX"
                          value={req.phone} onChange={e => setReq(p => ({ ...p, phone: e.target.value }))} />
                      </div>
                      <div>
                        <label className="label">Cidade</label>
                        <input className="input text-base" placeholder="Lisboa"
                          value={req.city} onChange={e => setReq(p => ({ ...p, city: e.target.value }))} />
                      </div>
                    </div>
                    <div>
                      <label className="label">Mensagem (opcional)</label>
                      <textarea className="input resize-none text-base" rows={3} placeholder="Conte-nos sobre a sua ótica..."
                        value={req.message} onChange={e => setReq(p => ({ ...p, message: e.target.value }))} />
                    </div>
                    {error && (
                      <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                        <p className="text-xs text-red-600 font-medium">{error}</p>
                      </div>
                    )}
                    <button className="btn-primary w-full py-3.5 text-base" onClick={submitRequest} disabled={reqLoading}>
                      {reqLoading ? 'A enviar...' : 'Submeter pedido'} <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  )
}
