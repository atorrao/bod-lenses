'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { BRAND_IMAGES } from '@/lib/data'
import { Mail, ArrowRight, CheckCircle, Eye, BarChart2, Calculator, Users } from 'lucide-react'

type View = 'login' | 'request' | 'sent'

export default function LandingPage() {
  const [view, setView] = useState<View>('login')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('pending') === '1') setError('O seu acesso ainda está a aguardar aprovação pela equipa BOD.')
    if (params.get('error') === '1')   setError('Erro ao verificar acesso. Tente novamente.')
  }, [])

  // Request form
  const [req, setReq] = useState({ optica_name: '', contact_name: '', email: '', phone: '', city: '', message: '' })
  const [reqLoading, setReqLoading] = useState(false)
  const [reqDone, setReqDone] = useState(false)

  const sendMagicLink = async () => {
    if (!email) { setError('Indique o seu email.'); return }
    setLoading(true); setError('')
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    setLoading(false)
    if (err) { setError('Email não encontrado ou sem acesso aprovado.') }
    else { setView('sent') }
  }

  const submitRequest = async () => {
    if (!req.optica_name || !req.contact_name || !req.email) { setError('Preencha os campos obrigatórios.'); return }
    setReqLoading(true); setError('')
    const { error: err } = await supabase.from('access_requests').insert([req])
    setReqLoading(false)
    if (err) { setError('Erro ao enviar. Tente novamente.') }
    else { setReqDone(true) }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* LEFT — brand panel */}
      <div className="relative hidden md:flex md:w-1/2 flex-col justify-between bg-bod-dark p-10 overflow-hidden">
        <div className="absolute inset-0">
          <Image src={BRAND_IMAGES.lenses} alt="" fill className="object-cover opacity-15" />
          <div className="absolute inset-0 bg-gradient-to-br from-bod-dark via-bod-dark/95 to-bod-blue/30" />
        </div>
        <div className="relative">
          <Image src={BRAND_IMAGES.logo} alt="BOD Lenses" width={140} height={38} className="h-8 w-auto brightness-0 invert" />
        </div>
        <div className="relative space-y-8">
          <div>
            <h1 className="font-display text-4xl font-bold text-white leading-tight mb-3">
              Portal exclusivo<br /><span className="text-bod-sky">para óticas parceiras.</span>
            </h1>
            <p className="text-white/50 text-base leading-relaxed max-w-sm">
              Aceda à calculadora de preços, dashboard de margens, perfil da ótica e canal direto com a BOD Lenses.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Calculator, label: 'Calculadora de preços' },
              { icon: BarChart2,  label: 'Dashboard de margens' },
              { icon: Eye,        label: 'Catálogo completo' },
              { icon: Users,      label: 'Apoio dedicado 24/7' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
                <Icon size={16} className="text-bod-sky shrink-0" />
                <span className="text-xs text-white/70 font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative text-xs text-white/25">© 2026 BOD Lenses Portugal</div>
      </div>

      {/* RIGHT — auth panel */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 md:px-12 bg-white min-h-screen md:min-h-0">
        {/* Mobile logo */}
        <div className="flex justify-center mb-8 md:hidden">
          <Image src={BRAND_IMAGES.logo} alt="BOD Lenses" width={130} height={36} className="h-8 w-auto" />
        </div>

        <div className="max-w-sm w-full mx-auto">

          {/* LOGIN */}
          {view === 'login' && (
            <>
              <h2 className="font-display text-2xl font-bold text-bod-dark mb-1">Entrar</h2>
              <p className="text-sm text-gray-400 mb-8">Enviamos um link de acesso para o seu email.</p>
              <div className="space-y-4">
                <div>
                  <label className="label">Email da ótica</label>
                  <input type="email" className="input" placeholder="email@otica.pt"
                    value={email} onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMagicLink()} />
                </div>
                {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
                <button className="btn-primary w-full py-3" onClick={sendMagicLink} disabled={loading}>
                  <Mail size={16} />
                  {loading ? 'A enviar...' : 'Enviar link de acesso'}
                </button>
              </div>
              <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                <p className="text-sm text-gray-400 mb-3">Ainda não é parceiro BOD?</p>
                <button className="btn-outline w-full py-3" onClick={() => { setView('request'); setError('') }}>
                  Solicitar acesso
                  <ArrowRight size={15} />
                </button>
              </div>
            </>
          )}

          {/* SENT */}
          {view === 'sent' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h2 className="font-display text-2xl font-bold text-bod-dark mb-2">Verifique o seu email</h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Enviámos um link de acesso para <strong className="text-bod-dark">{email}</strong>.<br />
                Clique no link para entrar — é válido por 1 hora.
              </p>
              <button className="text-sm text-bod-blue font-medium hover:underline" onClick={() => setView('login')}>
                ← Usar outro email
              </button>
            </div>
          )}

          {/* REQUEST ACCESS */}
          {view === 'request' && (
            <>
              {reqDone ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-bod-light rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <CheckCircle size={32} className="text-bod-blue" />
                  </div>
                  <h2 className="font-display text-xl font-bold text-bod-dark mb-2">Pedido recebido!</h2>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    A equipa BOD irá analisar o seu pedido e entrará em contacto nas próximas 24–48h.
                  </p>
                </div>
              ) : (
                <>
                  <button className="text-sm text-gray-400 hover:text-bod-blue mb-6 flex items-center gap-1"
                    onClick={() => { setView('login'); setError('') }}>
                    ← Voltar
                  </button>
                  <h2 className="font-display text-2xl font-bold text-bod-dark mb-1">Solicitar acesso</h2>
                  <p className="text-sm text-gray-400 mb-7">A BOD irá analisar e aprovar o seu pedido.</p>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="label">Nome da ótica *</label>
                        <input className="input" placeholder="Ótica Exemplo"
                          value={req.optica_name} onChange={e => setReq(p => ({ ...p, optica_name: e.target.value }))} />
                      </div>
                      <div>
                        <label className="label">Nome do responsável *</label>
                        <input className="input" placeholder="João Silva"
                          value={req.contact_name} onChange={e => setReq(p => ({ ...p, contact_name: e.target.value }))} />
                      </div>
                    </div>
                    <div>
                      <label className="label">Email *</label>
                      <input type="email" className="input" placeholder="email@otica.pt"
                        value={req.email} onChange={e => setReq(p => ({ ...p, email: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="label">Telefone</label>
                        <input className="input" placeholder="+351 9XX XXX XXX"
                          value={req.phone} onChange={e => setReq(p => ({ ...p, phone: e.target.value }))} />
                      </div>
                      <div>
                        <label className="label">Cidade</label>
                        <input className="input" placeholder="Lisboa"
                          value={req.city} onChange={e => setReq(p => ({ ...p, city: e.target.value }))} />
                      </div>
                    </div>
                    <div>
                      <label className="label">Mensagem (opcional)</label>
                      <textarea className="input resize-none" rows={3} placeholder="Conte-nos sobre a sua ótica..."
                        value={req.message} onChange={e => setReq(p => ({ ...p, message: e.target.value }))} />
                    </div>
                    {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
                    <button className="btn-primary w-full py-3" onClick={submitRequest} disabled={reqLoading}>
                      {reqLoading ? 'A enviar...' : 'Submeter pedido'}
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
