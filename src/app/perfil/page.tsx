'use client'

import { useState, useEffect } from 'react'
import AppShell from '@/components/layout/AppShell'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/lib/supabase'
import { Save, CheckCircle, Building2, CreditCard, User } from 'lucide-react'

type Section = 'perfil' | 'faturacao'

export default function PerfilPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [form, setForm] = useState({
    optica_name: '', contact_name: '', phone: '',
    nif: '', address: '', city: '', postal_code: '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)
  const [section, setSection] = useState<Section>('perfil')

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return
      const { data } = await supabase.from('optica_profiles').select('*').eq('id', session.user.id).single()
      if (data) {
        setProfile(data)
        setForm({
          optica_name:  data.optica_name  ?? '',
          contact_name: data.contact_name ?? '',
          phone:        data.phone        ?? '',
          nif:          data.nif          ?? '',
          address:      data.address      ?? '',
          city:         data.city         ?? '',
          postal_code:  data.postal_code  ?? '',
        })
      }
    })
  }, [])

  const save = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    setSaving(true)
    await supabase.from('optica_profiles').update(form).eq('id', session.user.id)
    setProfile(p => p ? { ...p, ...form } : p)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }))

  const tabs: { key: Section; icon: typeof User; label: string }[] = [
    { key: 'perfil',    icon: User,       label: 'Dados da ótica' },
    { key: 'faturacao', icon: CreditCard, label: 'Faturação' },
  ]

  return (
    <AppShell>
      <div className="px-4 md:px-8 py-6 max-w-2xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-bod-blue flex items-center justify-center text-xl font-bold text-white shrink-0">
            {form.optica_name ? form.optica_name[0].toUpperCase() : '?'}
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-bod-dark">{form.optica_name || 'Perfil'}</h1>
            <p className="text-sm text-gray-400">{profile?.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-bod-xlight rounded-xl mb-5 w-fit">
          {tabs.map(({ key, icon: Icon, label }) => (
            <button key={key}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
                section === key ? 'bg-white text-bod-blue shadow-sm' : 'text-gray-400 hover:text-bod-blue'
              }`}
              onClick={() => setSection(key)}>
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        <div className="card p-6 space-y-4">
          {section === 'perfil' && (
            <>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-bod-blue mb-2">
                <Building2 size={14} /> Dados da ótica
              </div>
              <div>
                <label className="label">Nome da ótica</label>
                <input className="input" placeholder="Ótica Exemplo" value={form.optica_name} onChange={f('optica_name')} />
              </div>
              <div>
                <label className="label">Nome do responsável</label>
                <input className="input" placeholder="João Silva" value={form.contact_name} onChange={f('contact_name')} />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input bg-bod-xlight" value={profile?.email ?? ''} disabled />
              </div>
              <div>
                <label className="label">Telefone</label>
                <input className="input" placeholder="+351 9XX XXX XXX" value={form.phone} onChange={f('phone')} />
              </div>
            </>
          )}

          {section === 'faturacao' && (
            <>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-bod-blue mb-2">
                <CreditCard size={14} /> Dados de faturação
              </div>
              <div>
                <label className="label">NIF</label>
                <input className="input" placeholder="501234567" value={form.nif} onChange={f('nif')} />
              </div>
              <div>
                <label className="label">Morada</label>
                <input className="input" placeholder="Rua Exemplo, nº 1" value={form.address} onChange={f('address')} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Cidade</label>
                  <input className="input" placeholder="Lisboa" value={form.city} onChange={f('city')} />
                </div>
                <div>
                  <label className="label">Código postal</label>
                  <input className="input" placeholder="1000-001" value={form.postal_code} onChange={f('postal_code')} />
                </div>
              </div>
            </>
          )}

          <div className="pt-2 flex items-center gap-3">
            <button className="btn-primary" onClick={save} disabled={saving}>
              <Save size={15} /> {saving ? 'A guardar...' : 'Guardar alterações'}
            </button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                <CheckCircle size={16} /> Guardado!
              </span>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
