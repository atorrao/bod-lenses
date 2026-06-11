'use client'

import { useEffect, useState } from 'react'
import AdminShell from '@/components/layout/AdminShell'
import { supabase } from '@/lib/supabase'
import { Download, Check, Ban } from 'lucide-react'

export default function AdminPedidos() {
  const [requests, setRequests] = useState<any[]>([])
  const [filter, setFilter]     = useState('pending')

  useEffect(() => { load() }, [])

  const load = async () => {
    const { data } = await supabase
      .from('access_requests')
      .select('*')
      .order('created_at', { ascending: false })
    setRequests(data ?? [])
  }

  const setStatus = async (id: string, status: string) => {
    await supabase.from('access_requests').update({ status }).eq('id', id)
    load()
  }

  const exportCSV = () => {
    const headers = ['Nome Ótica','Responsável','Email','Telefone','Cidade','Interesse','Mensagem','Status','Data']
    const rows = filtered.map(r => [
      r.optica_name, r.contact_name, r.email, r.phone ?? '',
      r.city ?? '', r.interest ?? '', r.message ?? '', r.status,
      new Date(r.created_at).toLocaleDateString('pt-PT')
    ])
    const csv = [headers, ...rows].map(r => r.map((v: any) => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'bod-pedidos.csv'; a.click()
  }

  const filtered = requests.filter(r => filter === 'all' || r.status === filter)

  const counts = {
    pending:  requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  }

  return (
    <AdminShell>
      <div className="px-4 md:px-8 py-6 max-w-6xl mx-auto space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-bod-dark">Pedidos de acesso</h1>
            <p className="text-sm text-gray-400 mt-0.5">{counts.pending} pendentes · {counts.approved} aprovados · {counts.rejected} rejeitados</p>
          </div>
          <button className="btn-outline shrink-0" onClick={exportCSV}>
            <Download size={15} /> Exportar CSV
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
          {[
            { key: 'pending',  label: `Pendentes (${counts.pending})` },
            { key: 'approved', label: `Aprovados (${counts.approved})` },
            { key: 'rejected', label: `Rejeitados (${counts.rejected})` },
            { key: 'all',      label: 'Todos' },
          ].map(f => (
            <button key={f.key}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                filter === f.key ? 'bg-white text-bod-blue shadow-sm' : 'text-gray-400 hover:text-bod-blue'
              }`}
              onClick={() => setFilter(f.key)}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="space-y-3">
          {filtered.map(r => (
            <div key={r.id} className="card p-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-bod-dark">{r.optica_name}</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      r.status === 'approved' ? 'bg-green-100 text-green-700' :
                      r.status === 'pending'  ? 'bg-amber-100 text-amber-600' :
                      'bg-red-100 text-red-500'
                    }`}>{r.status}</span>
                    {r.interest && (
                      <span className="text-xs bg-bod-light text-bod-blue font-semibold px-2 py-0.5 rounded-full">{r.interest}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{r.contact_name} · <a href={`mailto:${r.email}`} className="text-bod-blue hover:underline">{r.email}</a></p>
                  {r.phone && <p className="text-sm text-gray-400">{r.phone}{r.city ? ` · ${r.city}` : ''}</p>}
                  {r.message && <p className="text-sm text-gray-500 mt-2 bg-gray-50 rounded-lg p-3 italic">"{r.message}"</p>}
                  <p className="text-xs text-gray-300 pt-1">{new Date(r.created_at).toLocaleString('pt-PT')}</p>
                </div>
                {r.status === 'pending' && (
                  <div className="flex gap-2 shrink-0">
                    <button className="flex items-center gap-1.5 px-4 py-2 bg-green-100 text-green-700 font-semibold text-sm rounded-xl hover:bg-green-200 transition-colors"
                      onClick={() => setStatus(r.id, 'approved')}>
                      <Check size={15} /> Aprovar
                    </button>
                    <button className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-500 font-semibold text-sm rounded-xl hover:bg-red-100 transition-colors"
                      onClick={() => setStatus(r.id, 'rejected')}>
                      <Ban size={15} /> Rejeitar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="card p-10 text-center text-gray-300 text-sm">Sem pedidos nesta categoria.</div>
          )}
        </div>
      </div>
    </AdminShell>
  )
}
