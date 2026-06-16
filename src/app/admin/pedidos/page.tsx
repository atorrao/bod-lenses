'use client'

import { useEffect, useState } from 'react'
import AdminShell from '@/components/layout/AdminShell'
import { supabase } from '@/lib/supabase'
import { Download, Search, MessageSquare, Filter } from 'lucide-react'

type Message = {
  id: string
  created_at: string
  name: string
  optica: string
  email: string
  subject: string
  message: string
  status: string
  optica_id: string
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

export default function AdminPedidos() {
  const [activeTab, setActiveTab]   = useState<ActiveTab>('mensagens')
  const [messages,  setMessages]    = useState<Message[]>([])
  const [requests,  setRequests]    = useState<Request[]>([])
  const [search,    setSearch]      = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterSubject, setFilterSubject] = useState('')
  const [expanded,  setExpanded]    = useState<string | null>(null)

  useEffect(() => { load() }, [])

  const load = async () => {
    const [{ data: msgs }, { data: reqs }] = await Promise.all([
      supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
      supabase.from('access_requests').select('*').order('created_at', { ascending: false }),
    ])
    setMessages(msgs ?? [])
    setRequests(reqs ?? [])
  }

  const setMsgStatus = async (id: string, status: string) => {
    await supabase.from('contact_messages').update({ status }).eq('id', id)
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m))
  }

  const setReqStatus = async (id: string, status: string) => {
    await supabase.from('access_requests').update({ status }).eq('id', id)
    load()
  }

  const msgStatusStyle = (s: string) => ({
    new:     'bg-amber-100 text-amber-600',
    read:    'bg-blue-100 text-blue-600',
    replied: 'bg-green-100 text-green-700',
  }[s] ?? 'bg-gray-100 text-gray-500')

  const msgStatusLabel = (s: string) => ({ new:'Nova', read:'Lida', replied:'Respondida' }[s] ?? s)

  const reqStatusStyle = (s: string) => ({
    pending:  'bg-amber-100 text-amber-600',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-500',
  }[s] ?? 'bg-gray-100 text-gray-500')

  const subjects = Array.from(new Set(messages.map(m => m.subject))).sort()

  const filteredMsgs = messages.filter(m => {
    const matchSearch  = !search || m.optica?.toLowerCase().includes(search.toLowerCase()) || m.subject?.toLowerCase().includes(search.toLowerCase()) || m.name?.toLowerCase().includes(search.toLowerCase())
    const matchStatus  = !filterStatus  || m.status === filterStatus
    const matchSubject = !filterSubject || m.subject === filterSubject
    return matchSearch && matchStatus && matchSubject
  })

  const filteredReqs = requests.filter(r =>
    !search || r.optica_name?.toLowerCase().includes(search.toLowerCase()) || r.email?.toLowerCase().includes(search.toLowerCase())
  )

  const exportMsgsCSV = () => {
    const headers = ['Ótica','Nome','Email','Assunto','Mensagem','Estado','Data']
    const rows = filteredMsgs.map(m => [m.optica, m.name, m.email, m.subject, m.message, m.status, new Date(m.created_at).toLocaleString('pt-PT')])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], {type:'text/csv'})); a.download = 'mensagens.csv'; a.click()
  }

  const newCount = messages.filter(m => m.status === 'new').length
  const pendingCount = requests.filter(r => r.status === 'pending').length

  return (
    <AdminShell>
      <div className="px-4 md:px-8 py-6 max-w-6xl mx-auto space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-bod-dark">Comunicações</h1>
            <p className="text-sm text-gray-400 mt-0.5">Mensagens e pedidos de acesso</p>
          </div>
          {activeTab === 'mensagens' && (
            <button className="btn-outline shrink-0" onClick={exportMsgsCSV}>
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
                <option value="new">Novas</option>
                <option value="read">Lidas</option>
                <option value="replied">Respondidas</option>
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
            {filteredMsgs.map(m => (
              <div key={m.id} className={`card p-5 cursor-pointer hover:shadow-sm transition-shadow ${m.status === 'new' ? 'border-l-4 border-l-amber-400' : ''}`}
                onClick={() => { setExpanded(expanded === m.id ? null : m.id); if (m.status === 'new') setMsgStatus(m.id, 'read') }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-sm font-bold text-bod-dark">{m.optica || m.name}</p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${msgStatusStyle(m.status)}`}>{msgStatusLabel(m.status)}</span>
                      <span className="text-xs bg-bod-light text-bod-blue font-semibold px-2 py-0.5 rounded-full">{m.subject}</span>
                    </div>
                    <p className={`text-sm text-gray-500 ${expanded === m.id ? '' : 'line-clamp-2'}`}>{m.message}</p>
                    <p className="text-xs text-gray-300 mt-2">{new Date(m.created_at).toLocaleString('pt-PT')} · {m.email}</p>
                  </div>
                </div>
                {expanded === m.id && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-bod-light">
                    {['new','read','replied'].map(s => (
                      <button key={s}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${m.status === s ? msgStatusStyle(s) : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                        onClick={e => { e.stopPropagation(); setMsgStatus(m.id, s) }}>
                        {msgStatusLabel(s)}
                      </button>
                    ))}
                    <a href={`mailto:${m.email}?subject=Re: ${m.subject}`}
                      className="ml-auto text-xs font-semibold text-bod-blue hover:underline flex items-center gap-1"
                      onClick={e => e.stopPropagation()}>
                      Responder por email →
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* REQUESTS */}
        {activeTab === 'pedidos' && (
          <div className="space-y-3">
            {filteredReqs.filter(r => !filterStatus || r.status === filterStatus).length === 0 && (
              <div className="card p-10 text-center text-gray-300 text-sm">Nenhum pedido encontrado.</div>
            )}
            {filteredReqs.filter(r => !filterStatus || r.status === filterStatus).map(r => (
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
