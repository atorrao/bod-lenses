'use client'

import { useEffect, useState } from 'react'
import AdminShell from '@/components/layout/AdminShell'
import { supabase } from '@/lib/supabase'
import { Download, Search, Edit2, Save, X, Check, Ban } from 'lucide-react'

export default function AdminOticas() {
  const [oticas, setOticas]   = useState<any[]>([])
  const [search, setSearch]   = useState('')
  const [editing, setEditing] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<any>({})
  const [saving, setSaving]   = useState(false)

  useEffect(() => { load() }, [])

  const load = async () => {
    const { data } = await supabase
      .from('optica_profiles')
      .select('*')
      .order('created_at', { ascending: false })
    setOticas(data ?? [])
  }

  const startEdit = (o: any) => {
    setEditing(o.id)
    setEditForm({ ...o })
  }

  const saveEdit = async () => {
    setSaving(true)
    await supabase.from('optica_profiles').update({
      optica_name:  editForm.optica_name,
      contact_name: editForm.contact_name,
      phone:        editForm.phone,
      nif:          editForm.nif,
      address:      editForm.address,
      city:         editForm.city,
      postal_code:  editForm.postal_code,
      status:       editForm.status,
    }).eq('id', editing)
    setSaving(false)
    setEditing(null)
    load()
  }

  const setStatus = async (id: string, status: string) => {
    await supabase.from('optica_profiles').update({ status }).eq('id', id)
    load()
  }

  const exportCSV = () => {
    const headers = ['Nome Ótica','Responsável','Email','Telefone','NIF','Morada','Cidade','CP','Status','Criado em']
    const rows = oticas.map(o => [
      o.optica_name ?? '', o.contact_name ?? '', o.email ?? '', o.phone ?? '',
      o.nif ?? '', o.address ?? '', o.city ?? '', o.postal_code ?? '',
      o.status, new Date(o.created_at).toLocaleDateString('pt-PT')
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a'); a.href = url; a.download = 'bod-oticas.csv'; a.click()
  }

  const filtered = oticas.filter(o =>
    [o.optica_name, o.email, o.city, o.contact_name].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  )

  const ef = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setEditForm((p: any) => ({ ...p, [k]: e.target.value }))

  return (
    <AdminShell>
      <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-bod-dark">Óticas</h1>
            <p className="text-sm text-gray-400 mt-0.5">{oticas.length} óticas registadas</p>
          </div>
          <button className="btn-outline shrink-0" onClick={exportCSV}>
            <Download size={15} /> Exportar CSV
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input className="input pl-10" placeholder="Pesquisar por nome, email, cidade..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Ótica','Responsável','Email','Telefone','NIF','Cidade','Status','Ações'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide text-gray-400 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    {editing === o.id ? (
                      <>
                        <td className="px-4 py-2"><input className="input text-xs py-1.5" value={editForm.optica_name ?? ''} onChange={ef('optica_name')} /></td>
                        <td className="px-4 py-2"><input className="input text-xs py-1.5" value={editForm.contact_name ?? ''} onChange={ef('contact_name')} /></td>
                        <td className="px-4 py-2 text-xs text-gray-400">{o.email}</td>
                        <td className="px-4 py-2"><input className="input text-xs py-1.5" value={editForm.phone ?? ''} onChange={ef('phone')} /></td>
                        <td className="px-4 py-2"><input className="input text-xs py-1.5" value={editForm.nif ?? ''} onChange={ef('nif')} /></td>
                        <td className="px-4 py-2"><input className="input text-xs py-1.5" value={editForm.city ?? ''} onChange={ef('city')} /></td>
                        <td className="px-4 py-2">
                          <select className="input text-xs py-1.5" value={editForm.status} onChange={ef('status')}>
                            <option value="pending">pending</option>
                            <option value="approved">approved</option>
                            <option value="rejected">rejected</option>
                          </select>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex gap-1.5">
                            <button className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200" onClick={saveEdit} disabled={saving}>
                              <Save size={13} />
                            </button>
                            <button className="p-1.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200" onClick={() => setEditing(null)}>
                              <X size={13} />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 font-medium text-bod-dark whitespace-nowrap">{o.optica_name ?? '—'}</td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{o.contact_name ?? '—'}</td>
                        <td className="px-4 py-3 text-gray-500">{o.email}</td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{o.phone ?? '—'}</td>
                        <td className="px-4 py-3 text-gray-500">{o.nif ?? '—'}</td>
                        <td className="px-4 py-3 text-gray-500">{o.city ?? '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            o.status === 'approved' ? 'bg-green-100 text-green-700' :
                            o.status === 'pending'  ? 'bg-amber-100 text-amber-600' :
                            'bg-red-100 text-red-500'
                          }`}>{o.status}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5">
                            <button className="p-1.5 bg-bod-xlight text-bod-blue rounded-lg hover:bg-bod-light" title="Editar" onClick={() => startEdit(o)}>
                              <Edit2 size={13} />
                            </button>
                            {o.status !== 'approved' && (
                              <button className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100" title="Aprovar" onClick={() => setStatus(o.id, 'approved')}>
                                <Check size={13} />
                              </button>
                            )}
                            {o.status !== 'rejected' && (
                              <button className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100" title="Rejeitar" onClick={() => setStatus(o.id, 'rejected')}>
                                <Ban size={13} />
                              </button>
                            )}
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="text-center text-gray-300 py-10 text-sm">Nenhuma ótica encontrada.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
