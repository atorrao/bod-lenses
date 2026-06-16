'use client'

import { useState, useEffect } from 'react'
import AppShell from '@/components/layout/AppShell'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/lib/supabase'
import { Send, Phone, Mail, MapPin, Clock, CheckCircle, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react'

type Message = {
  id: string
  created_at: string
  subject: string
  message: string
  status: string
  replies?: Reply[]
}

type Reply = {
  id: string
  created_at: string
  author: string
  author_name: string
  body: string
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  new:       { label: 'Enviada',     color: 'bg-gray-100 text-gray-500' },
  read:      { label: 'Lida',        color: 'bg-blue-100 text-blue-600' },
  analysis:  { label: 'Em análise',  color: 'bg-yellow-100 text-yellow-600' },
  forwarded: { label: 'Encaminhada', color: 'bg-purple-100 text-purple-600' },
  replied:   { label: 'Respondida',  color: 'bg-green-100 text-green-700' },
  resolved:  { label: 'Resolvida',   color: 'bg-teal-100 text-teal-700' },
}

export default function ContactoPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [form, setForm]       = useState({ subject: 'Informações sobre produtos', message: '' })
  const [sending, setSending] = useState(false)
  const [done, setDone]       = useState(false)
  const [error, setError]     = useState('')
  const [history, setHistory] = useState<Message[]>([])
  const [tab, setTab]         = useState<'new' | 'history'>('new')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [replyText, setReplyText] = useState<Record<string, string>>({})
  const [sendingReply, setSendingReply] = useState<string | null>(null)

  useEffect(() => { load() }, [])

  const load = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const [{ data: prof }, { data: msgs }] = await Promise.all([
      supabase.from('optica_profiles').select('*').eq('id', session.user.id).single(),
      supabase.from('contact_messages').select('*').eq('optica_id', session.user.id).order('created_at', { ascending: false })
    ])
    setProfile(prof)

    // Load replies for each message
    const msgsWithReplies = await Promise.all((msgs ?? []).map(async (m: Message) => {
      const { data: replies } = await supabase
        .from('message_replies')
        .select('*')
        .eq('message_id', m.id)
        .order('created_at', { ascending: true })
      return { ...m, replies: replies ?? [] }
    }))
    setHistory(msgsWithReplies)
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

  const sendReply = async (msgId: string) => {
    const body = replyText[msgId]
    if (!body) return
    setSendingReply(msgId)
    await supabase.from('message_replies').insert([{
      message_id:  msgId,
      author:      'optica',
      author_name: profile?.optica_name ?? 'Ótica',
      body,
    }])
    setReplyText(prev => ({ ...prev, [msgId]: '' }))
    setSendingReply(null)
    load()
  }

  const toggleExpand = async (msgId: string) => {
    if (expanded === msgId) { setExpanded(null); return }
    setExpanded(msgId)
    // Mark as read if new
    const msg = history.find(m => m.id === msgId)
    if (msg?.status === 'new') {
      await supabase.from('contact_messages').update({ status: 'read' }).eq('id', msgId)
      setHistory(prev => prev.map(m => m.id === msgId ? { ...m, status: 'read' } : m))
    }
  }

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
                { icon: Phone,  label: 'Telefone',  value: '+351 915 234 366',              href: 'tel:+351915234366' },
                { icon: Phone,  label: 'Linha fixa', value: '+351 211 248 310',              href: 'tel:+351211248310' },
                { icon: Mail,   label: 'Email',      value: 'suporte@bodlensesportugal.com', href: 'mailto:suporte@bodlensesportugal.com' },
                { icon: MapPin, label: 'Morada',     value: 'Alameda da Beloura, Ed.4\nSintra, Lisboa', href: null },
                { icon: Clock,  label: 'Horário',    value: 'Seg–Sex, 9h30–18h00',           href: null },
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
                  const st = STATUS_CONFIG[m.status] ?? STATUS_CONFIG.new
                  const isOpen = expanded === m.id
                  return (
                    <div key={m.id} className={`card overflow-hidden ${m.status === 'new' ? 'border-l-4 border-l-bod-blue' : ''}`}>
                      {/* Header */}
                      <div className="px-4 py-3.5 flex items-start justify-between gap-3 cursor-pointer hover:bg-bod-xlight transition-colors"
                        onClick={() => toggleExpand(m.id)}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="text-sm font-semibold text-bod-dark">{m.subject}</p>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                            {(m.replies?.length ?? 0) > 0 && (
                              <span className="text-xs text-gray-400">{m.replies!.length} resposta{m.replies!.length !== 1 ? 's' : ''}</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400">{new Date(m.created_at).toLocaleString('pt-PT')}</p>
                        </div>
                        {isOpen ? <ChevronUp size={16} className="text-gray-400 shrink-0 mt-1" /> : <ChevronDown size={16} className="text-gray-400 shrink-0 mt-1" />}
                      </div>

                      {/* Expanded */}
                      {isOpen && (
                        <div className="border-t border-bod-light">
                          {/* Original message */}
                          <div className="px-4 py-3 bg-bod-xlight">
                            <p className="text-xs font-bold text-gray-400 mb-1">A sua mensagem</p>
                            <p className="text-sm text-gray-600 leading-relaxed">{m.message}</p>
                          </div>

                          {/* Replies thread */}
                          {(m.replies?.length ?? 0) > 0 && (
                            <div className="px-4 py-3 space-y-3">
                              {m.replies!.map(r => (
                                <div key={r.id} className={`flex gap-3 ${r.author === 'optica' ? 'flex-row-reverse' : ''}`}>
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${r.author === 'admin' ? 'bg-bod-blue text-white' : 'bg-gray-200 text-gray-600'}`}>
                                    {r.author === 'admin' ? 'B' : 'O'}
                                  </div>
                                  <div className={`flex-1 rounded-xl p-3 text-sm leading-relaxed ${r.author === 'admin' ? 'bg-bod-light text-bod-dark' : 'bg-gray-100 text-gray-600'}`}>
                                    <p className="text-xs font-semibold mb-1 text-gray-400">{r.author_name} · {new Date(r.created_at).toLocaleString('pt-PT')}</p>
                                    {r.body}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Reply input — only if not resolved */}
                          {m.status !== 'resolved' && (
                            <div className="px-4 py-3 border-t border-bod-light flex gap-2">
                              <input
                                className="input flex-1 text-sm"
                                placeholder="Escreva uma resposta..."
                                value={replyText[m.id] ?? ''}
                                onChange={e => setReplyText(prev => ({ ...prev, [m.id]: e.target.value }))}
                                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendReply(m.id)}
                              />
                              <button
                                className="btn-primary px-3 py-2 shrink-0"
                                onClick={() => sendReply(m.id)}
                                disabled={sendingReply === m.id || !replyText[m.id]}>
                                <Send size={15} />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
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
