'use client'

import { useState, useEffect } from 'react'
import AppShell from '@/components/layout/AppShell'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/lib/supabase'
import { Send, Phone, Mail, MapPin, Clock, CheckCircle } from 'lucide-react'

export default function ContactoPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [form, setForm] = useState({ subject: 'Informações sobre produtos', message: '' })
  const [sending, setSending] = useState(false)
  const [done, setDone]       = useState(false)
  const [error, setError]     = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return
      const { data } = await supabase.from('optica_profiles').select('*').eq('id', session.user.id).single()
      setProfile(data)
    })
  }, [])

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
    else setDone(true)
  }

  return (
    <AppShell>
      <div className="px-4 md:px-8 py-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-bod-blue mb-1">Suporte</p>
          <h1 className="font-display text-2xl font-bold text-bod-dark">Contacto</h1>
          <p className="text-sm text-gray-400 mt-1">Fale diretamente com a equipa BOD Lenses.</p>
        </div>

        <div className="grid md:grid-cols-5 gap-5">
          {/* INFO */}
          <div className="md:col-span-2 space-y-3">
            <div className="card p-5">
              <h2 className="font-semibold text-sm text-bod-dark mb-4">Contactos diretos</h2>
              {[
                { icon: Phone, label: 'Telefone', value: '+351 915 234 366', href: 'tel:+351915234366' },
                { icon: Phone, label: 'Linha fixa', value: '+351 211 248 310', href: 'tel:+351211248310' },
                { icon: Mail, label: 'Email', value: 'suporte@bodlensesportugal.com', href: 'mailto:suporte@bodlensesportugal.com' },
                { icon: MapPin, label: 'Morada', value: 'Alameda da Beloura, Ed.4\nSintra, Lisboa', href: null },
                { icon: Clock, label: 'Horário', value: 'Seg–Sex, 9h30–18h00', href: null },
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

          {/* FORM */}
          <div className="md:col-span-3">
            <div className="card p-5 md:p-6">
              {done ? (
                <div className="text-center py-10">
                  <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={28} className="text-green-600" />
                  </div>
                  <h3 className="font-semibold text-lg text-bod-dark mb-2">Mensagem enviada!</h3>
                  <p className="text-sm text-gray-400">A equipa BOD entrará em contacto em breve.</p>
                  <button className="btn-outline mt-5" onClick={() => { setDone(false); setForm({ subject: form.subject, message: '' }) }}>
                    Enviar outra mensagem
                  </button>
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
                    <label className="label">Email</label>
                    <input className="input bg-bod-xlight" value={profile?.email ?? '...'} disabled />
                  </div>
                  <div>
                    <label className="label">Assunto</label>
                    <select className="input" value={form.subject}
                      onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}>
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
                    <Send size={15} />
                    {sending ? 'A enviar...' : 'Enviar mensagem'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
