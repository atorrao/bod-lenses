'use client'

import { useEffect, useState, useCallback } from 'react'
import AdminShell from '@/components/layout/AdminShell'
import { supabase } from '@/lib/supabase'
import { Download, Search, MessageSquare, Send, ChevronDown, ChevronUp } from 'lucide-react'

type Message = {
  id: string
  created_at: string
  name: string
  optica: string
  email: string
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

type Request = {
  id: string
  created_at: string
  optica_name: string
  contact_name: string
  email: string
  phone: string
  city: string
  interest: string
  message: string
  status: string
}

type ActiveTab = 'mensagens' | 'pedidos'

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  new:       { label: 'Enviada',     color: 'bg-gray-100 text-gray-500' },
  read:      { label: 'Lida',        color: 'bg-blue-100 text-blue-600' },
  analysis:  { label: 'Em análise',  color: 'bg-yellow-100 text-yellow-600' },
  forwarded: { label: 'Encaminhada', color: 'bg-purple-100 text-purple-600' },
  replied:   { label: 'Respondida',  color: 'bg-green-100 text-green-700' },
  resolved:  { label: 'Resolvida',   color: 'bg-teal-100 text-teal-700' },
}

const STATUS_ORDER = ['new','read','analysis','forwarded','replied','resolved']

export default function AdminComunicacoes() {
  const [activeTab,     setActiveTab]     = useState<ActiveTab>('mensagens')
  const [messages,      setMessages]      = useState<Message[]>([])
  const [requests,      setRequests]      = useState<Request[]>([])
  const [search,        setSearch]        = useState('')
  const [filterStatus,  setFilterStatus]  = useState('')
  const [filterSubject, setFilterSubject] = useState('')
  const [expanded,      setExpanded]      = useState<string | null>(null)
  const [replyText,     setReplyText]     = useState<Record<string, string>>({})
  const [sendingReply,  setSendingReply]  = useState<string | null>(null)

  const load = useCallback(async () => {
    const [{ data: msgs }, { data: reqs }] = await Promise.all([
      supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
      supabase.from('access_requests').select('*').order('created_at', { ascending: false }),
    ])

    // Load replies for all messages
    const msgsWithReplies = await Promise.all((msgs ?? []).map(async (m: Message) => {
      const { data: replies } = await supabase
        .from('message_replies').select('*')
        .eq('message_id', m.id).order('created_at', { ascending: true })
      return { ...m, replies: replies ?? [] }
    }))

    setMessages(msgsWithReplies)
    setRequests(reqs ?? [])
  }, [])

  useEffect(() => { load() }, [load])

  const setMsgStatus = async (id: string, status: string) => {
    await supabase.from('contact_messages').update({ status }).eq('id', id)
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m))
  }

  const setReqStatus = async (id: string, status: string) => {
    if (status === 'approved') {
      // Call Edge Function to create user + send magic link
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/approve-optica`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ request_id: id }),
      })
      const result = await res.json()
      if (!res.ok) {
        alert(`Erro ao aprovar: ${result.error}`)
        return
      }
    } else {
      await supabase.from('access_requests').update({ status }).eq('id', id)
    }
    load()
  }

  const toggleExpand = async (msgId: string) => {
    if (expanded === msgId) { setExpanded(null); return }
    setExpanded(msgId)
    const msg = messages.find(m => m.id === msgId)
    if (msg?.status === 'new') setMsgStatus(msgId, 'read')
  }

  const sendReply = async (msg: Message) => {
    const body = replyText[msg.id]
    if (!body) return
    setSendingReply(msg.id)
    await supabase.from('message_replies').insert([{
      message_id:  msg.id,
      author:      'admin',
      author_name: 'BOD Lenses',
      body,
    }])
    // Auto-advance to replied if not already resolved
    if (!['replied','resolved'].includes(msg.status)) {
      await supabase.from('contact_messages').update({ status: 'replied' }).eq('id', msg.id)
    }
    setReplyText(prev => ({ ...prev, [msg.id]: '' }))
    setSendingReply(null)
    load()
  }

  const subjects = Array.from(new Set(messages.map(m => m.subject))).sort()

  const filteredMsgs = messages.filter(m => {
    const matchSearch  = !search || m.optica?.toLowerCase().includes(search.toLowerCase()) || m.subject?.toLowerCase().includes(search.toLowerCase()) || m.name?.toLowerCase().includes(search.toLowerCase())
    const matchStatus  = !filterStatus  || m.status === filterStatus
    const matchSubject = !filterSubject || m.subject === filterSubject
    return matchSearch && matchStatus && matchSubject
  })

  const filteredReqs = requests.filter(r =>
    (!search || r.optica_name?.toLowerCase().includes(search.toLowerCase()) || r.email?.toLowerCase().includes(search.toLowerCase())) &&
    (!filterStatus || r.status === filterStatus)
  )

  const newCount     = messages.filter(m => m.status === 'new').length
  const pendingCount = requests.filter(r => r.status === 'pending').length

  const exportCSV = () => {
    const headers = ['Ótica','Nome','Email','Assunto','Mensagem','Estado','Data']
    const rows = filteredMsgs.map(m => [m.optica, m.name, m.email, m.subject, m.message, STATUS_CONFIG[m.status]?.label ?? m.status, new Date(m.created_at).toLocaleString('pt-PT')])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], {type:'text/csv'})); a.download = 'mensagens.csv'; a.click()
  }

  const reqStatusStyle = (s: string) => ({ pending:'bg-amber-100 text-amber-600', approved:'bg-green-100 text-green-700', rejected:'bg-red-100 text-red-500' }[s] ?? 'bg-gray-100 text-gray-500')

  return (
    <AdminShell>
      <div className="px-4 md:px-8 py-6 max-w-6xl mx-auto space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-bod-dark">Comunicações</h1>
            <p className="text-sm text-gray-400 mt-0.5">Mensagens e pedidos de acesso</p>
          </div>
          {activeTab === 'mensagens' && (
            <button className="btn-outline shrink-0" onClick={exportCSV}>
              <Download size={15} /> Exportar CSV
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
          <button
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'mensagens' ? 'bg-white text-bod-blue shadow-sm' : 'text-gray-400 hover:text-bod-blue'}`}
            onClick={() => setActiveTab('mensagens')}>
            <MessageSquare size={14} />
            Mensagens {newCount > 0 && <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{newCount}</span>}
          </button>
          <button
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'pedidos' ? 'bg-white text-bod-blue shadow-sm' : 'text-gray-400 hover:text-bod-blue'}`}
            onClick={() => setActiveTab('pedidos')}>
            Pedidos de acesso {pendingCount > 0 && <span className="bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5">{pendingCount}</span>}
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-10" placeholder={activeTab === 'mensagens' ? 'Pesquisar por ótica, assunto...' : 'Pesquisar por ótica, email...'}
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {activeTab === 'mensagens' && (
            <>
              <select className="input sm:w-44" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="">Todos os estados</option>
                {STATUS_ORDER.map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
              </select>
              <select className="input sm:w-56" value={filterSubject} onChange={e => setFilterSubject(e.target.value)}>
                <option value="">Todos os assuntos</option>
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </>
          )}
          {activeTab === 'pedidos' && (
            <select className="input sm:w-44" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">Todos os estados</option>
              <option value="pending">Pendentes</option>
              <option value="approved">Aprovados</option>
              <option value="rejected">Rejeitados</option>
            </select>
          )}
        </div>

        {/* MESSAGES */}
        {activeTab === 'mensagens' && (
          <div className="space-y-3">
            {filteredMsgs.length === 0 && (
              <div className="card p-10 text-center text-gray-300 text-sm">Nenhuma mensagem encontrada.</div>
            )}
            {filteredMsgs.map(m => {
              const st = STATUS_CONFIG[m.status] ?? STATUS_CONFIG.new
              const isOpen = expanded === m.id
              return (
                <div key={m.id} className={`card overflow-hidden ${m.status === 'new' ? 'border-l-4 border-l-amber-400' : ''}`}>
                  {/* Header */}
                  <div className="px-4 py-3.5 flex items-start justify-between gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleExpand(m.id)}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="text-sm font-bold text-bod-dark">{m.optica || m.name}</p>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                        <span className="text-xs bg-bod-light text-bod-blue font-semibold px-2 py-0.5 rounded-full">{m.subject}</span>
                        {(m.replies?.length ?? 0) > 0 && (
                          <span className="text-xs text-gray-400">{m.replies!.length} resposta{m.replies!.length !== 1 ? 's' : ''}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">{new Date(m.created_at).toLocaleString('pt-PT')} · {m.email}</p>
                    </div>
                    {isOpen ? <ChevronUp size={16} className="text-gray-400 shrink-0 mt-1" /> : <ChevronDown size={16} className="text-gray-400 shrink-0 mt-1" />}
                  </div>

                  {isOpen && (
                    <div className="border-t border-gray-100">
                      {/* Original message */}
                      <div className="px-4 py-3 bg-gray-50">
                        <p className="text-xs font-bold text-gray-400 mb-1">Mensagem original</p>
                        <p className="text-sm text-gray-600 leading-relaxed">{m.message}</p>
                      </div>

                      {/* Reply thread */}
                      {(m.replies?.length ?? 0) > 0 && (
                        <div className="px-4 py-3 space-y-3">
                          {m.replies!.map(r => (
                            <div key={r.id} className={`flex gap-3 ${r.author === 'admin' ? 'flex-row-reverse' : ''}`}>
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

                      {/* Status + Reply */}
                      <div className="px-4 py-3 border-t border-gray-100 space-y-3">
                        {/* Status buttons */}
                        <div className="flex flex-wrap gap-1.5">
                          <p className="text-xs text-gray-400 font-medium w-full mb-1">Estado:</p>
                          {STATUS_ORDER.map(s => (
                            <button key={s}
                              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${m.status === s ? STATUS_CONFIG[s].color : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                              onClick={() => setMsgStatus(m.id, s)}>
                              {STATUS_CONFIG[s].label}
                            </button>
                          ))}
                        </div>

                        {/* Reply input */}
                        {m.status !== 'resolved' && (
                          <div className="flex gap-2">
                            <input
                              className="input flex-1 text-sm"
                              placeholder="Escrever resposta..."
                              value={replyText[m.id] ?? ''}
                              onChange={e => setReplyText(prev => ({ ...prev, [m.id]: e.target.value }))}
                              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendReply(m)}
                            />
                            <button
                              className="btn-primary px-3 shrink-0"
                              onClick={() => sendReply(m)}
                              disabled={sendingReply === m.id || !replyText[m.id]}>
                              <Send size={15} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* REQUESTS */}
        {activeTab === 'pedidos' && (
          <div className="space-y-3">
            {filteredReqs.length === 0 && (
              <div className="card p-10 text-center text-gray-300 text-sm">Nenhum pedido encontrado.</div>
            )}
            {filteredReqs.map(r => (
              <div key={r.id} className="card p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-bod-dark">{r.optica_name}</p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${reqStatusStyle(r.status)}`}>{r.status}</span>
                      {r.interest && <span className="text-xs bg-bod-light text-bod-blue font-semibold px-2 py-0.5 rounded-full">{r.interest}</span>}
                    </div>
                    <p className="text-sm text-gray-500">{r.contact_name} · <a href={`mailto:${r.email}`} className="text-bod-blue hover:underline">{r.email}</a></p>
                    {r.phone && <p className="text-sm text-gray-400">{r.phone}{r.city ? ` · ${r.city}` : ''}</p>}
                    {r.message && <p className="text-sm text-gray-500 mt-2 bg-gray-50 rounded-lg p-3 italic">"{r.message}"</p>}
                    <p className="text-xs text-gray-300">{new Date(r.created_at).toLocaleString('pt-PT')}</p>
                  </div>
                  {r.status === 'pending' && (
                    <div className="flex gap-2 shrink-0">
                      <button className="text-xs font-bold px-4 py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200" onClick={() => setReqStatus(r.id, 'approved')}>Aprovar</button>
                      <button className="text-xs font-bold px-4 py-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100" onClick={() => setReqStatus(r.id, 'rejected')}>Rejeitar</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  )
}
