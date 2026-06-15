'use client'

import { useState, useEffect } from 'react'
import AppShell from '@/components/layout/AppShell'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/lib/supabase'
import { Send, Phone, Mail, MapPin, Clock, CheckCircle, MessageSquare } from 'lucide-react'

type Message = {
  id: string
  created_at: string
  subject: string
  message: string
  status: string
}

export default function ContactoPage() {
  const [profile, setProfile]   = useState<Profile | null>(null)
  const [form, setForm]         = useState({ subject: 'Informações sobre produtos', message: '' })
  const [sending, setSending]   = useState(false)
  const [done, setDone]         = useState(false)
  const [error, setError]       = useState('')
  const [history, setHistory]   = useState<Message[]>([])
  const [tab, setTab]           = useState<'new' | 'history'>('new')

  useEffect(() => { load() }, [])

  const load = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const [{ data: prof }, { data: msgs }] = await Promise.all([
      supabase.from('optica_profiles').select('*').eq('id', session.user.id).single(),
      supabase.from('contact_messages').select('*').eq('optica_id', session.user.id).order('created_at', { ascending: false })
    ])
    setProfile(prof)
    setHistory(msgs ?? [])
  }

  const send = async () => {
    if (!form.message) { setError('Escreva a sua mensagem.'); return }
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    setSending(true); setError('')
    const { error: err } = await supabase.from('contact_messages').insert([{
      optica_id: session.user.id,
      name:    profile?.contact_name ?? '',
      optica:  profile?.optica_name  ?? '',
      email:   profile?.email        ?? '',
      subject: form.subject,
      message: form.message,
    }])
    setSending(false)
    if (err) setError('Erro ao enviar. Tente novamente.')
    else {
      setDone(true)
      setForm({ subject: 'Informações sobre produtos', message: '' })
      setTimeout(() => { setDone(false); setTab('history'); load() }, 1500)
    }
  }

  const statusLabel = (s: string) => ({
    new: { label: 'Enviada', color: 'bg-amber-100 text-amber-600' },
    read: { label: 'Lida', color: 'bg-blue-100 text-blue-600' },
    replied: { label: 'Respondida', color: 'bg-green-100 text-green-700' },
  }[s] ?? { label: s, color: 'bg-gray-100 text-gray-500' })

  return (
    <AppShell>
      <div className="px-4 md:px-8 py-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-bod-blue mb-1">Suporte</p>
          <h1 className="font-display text-2xl font-bold text-bod-dark">Contacto</h1>
          <p className="text-sm text-gray-400 mt-1">Fale diretamente com a equipa BOD Lenses.</p>
        </div>

        <div className="grid md:grid-cols-5 gap-5">
          {/* INFO */}
          <div className="md:col-span-2 space-y-4">
            <div className="card p-5">
              <h2 className="font-semibold text-sm text-bod-dark mb-4">Contactos diretos</h2>
              {[
                { icon: Phone,  label: 'Telefone',  value: '+351 915 234 366',               href: 'tel:+351915234366' },
                { icon: Phone,  label: 'Linha fixa', value: '+351 211 248 310',               href: 'tel:+351211248310' },
                { icon: Mail,   label: 'Email',      value: 'suporte@bodlensesportugal.com',  href: 'mailto:suporte@bodlensesportugal.com' },
                { icon: MapPin, label: 'Morada',     value: 'Alameda da Beloura, Ed.4\nSintra, Lisboa', href: null },
                { icon: Clock,  label: 'Horário',    value: 'Seg–Sex, 9h30–18h00',            href: null },
              ].map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex gap-3 items-start py-2.5 border-b border-bod-light last:border-0">
                  <div className="w-8 h-8 bg-bod-xlight rounded-lg flex items-center justify-center shrink-0">
                    <Icon size={15} className="text-bod-blue" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-0.5">{label}</p>
                    {href
                      ? <a href={href} className="text-sm text-bod-blue font-medium hover:underline">{value}</a>
                      : <p className="text-sm text-gray-600 whitespace-pre-line">{value}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FORM + HISTORY */}
          <div className="md:col-span-3">
            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-bod-xlight rounded-xl mb-4 w-fit">
              {[
                { key: 'new',     label: 'Nova mensagem' },
                { key: 'history', label: `Histórico${history.length > 0 ? ` (${history.length})` : ''}` },
              ].map(t => (
                <button key={t.key}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${tab === t.key ? 'bg-white text-bod-blue shadow-sm' : 'text-gray-400 hover:text-bod-blue'}`}
                  onClick={() => setTab(t.key as 'new' | 'history')}>
                  {t.key === 'history' && <MessageSquare size={14} />}
                  {t.label}
                </button>
              ))}
            </div>

            {tab === 'new' && (
              <div className="card p-5 md:p-6">
                {done ? (
                  <div className="text-center py-8">
                    <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <CheckCircle size={28} className="text-green-600" />
                    </div>
                    <h3 className="font-semibold text-lg text-bod-dark mb-1">Mensagem enviada!</h3>
                    <p className="text-sm text-gray-400">A redirecionar para o histórico...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label">Nome</label>
                        <input className="input bg-bod-xlight" value={profile?.contact_name ?? '...'} disabled />
                      </div>
                      <div>
                        <label className="label">Ótica</label>
                        <input className="input bg-bod-xlight" value={profile?.optica_name ?? '...'} disabled />
                      </div>
                    </div>
                    <div>
                      <label className="label">Assunto</label>
                      <select className="input" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}>
                        <option>Informações sobre produtos</option>
                        <option>Preços e condições comerciais</option>
                        <option>Apoio técnico</option>
                        <option>Encomenda — dúvida ou problema</option>
                        <option>Programa Pioneiros BOD</option>
                        <option>Outro</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Mensagem</label>
                      <textarea className="input resize-none" rows={5} placeholder="Como podemos ajudar?"
                        value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} />
                    </div>
                    {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
                    <button className="btn-primary w-full py-3" onClick={send} disabled={sending}>
                      <Send size={15} /> {sending ? 'A enviar...' : 'Enviar mensagem'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {tab === 'history' && (
              <div className="space-y-3">
                {history.length === 0 ? (
                  <div className="card p-10 text-center">
                    <MessageSquare size={32} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-sm text-gray-400">Ainda não enviou nenhuma mensagem.</p>
                    <button className="btn-outline mt-4 text-xs" onClick={() => setTab('new')}>Enviar primeira mensagem</button>
                  </div>
                ) : history.map(m => {
                  const st = statusLabel(m.status)
                  return (
                    <div key={m.id} className="card p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <p className="text-sm font-semibold text-bod-dark">{m.subject}</p>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${st.color}`}>{st.label}</span>
                      </div>
                      <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{m.message}</p>
                      <p className="text-xs text-gray-300 mt-2">{new Date(m.created_at).toLocaleString('pt-PT')}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
