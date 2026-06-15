'use client'

import { useState } from 'react'
import Image from 'next/image'
import AppShell from '@/components/layout/AppShell'
import { supabase } from '@/lib/supabase'
import { BRAND_IMAGES } from '@/lib/data'
import { ExternalLink, MessageCircle, CheckCircle, X } from 'lucide-react'

const news = [
  { date: 'Março 2026',    tag: 'Lançamento',   tagColor: 'bg-green-100 text-green-700',   title: 'Coloração Terapêutica — alívio de enxaquecas e fotossensibilidade',  body: 'A BOD Lenses lança a sua nova linha de lentes com coloração terapêutica, desenvolvidas especificamente para pacientes com enxaquecas crónicas e hipersensibilidade à luz. Disponível em 5 tonalidades com indicação clínica validada.', image: BRAND_IMAGES.therapeutic, url: 'https://bodlensesportugal.com' },
  { date: 'Março 2026',    tag: 'Novidade',      tagColor: 'bg-bod-light text-bod-blue',    title: 'Cores terapêuticas — guia de seleção para óticas',                   body: 'Publicamos o guia completo de seleção das cores terapêuticas BOD, com indicações clínicas, perfis de paciente e recomendações de adaptação.', image: BRAND_IMAGES.therapeuticColors, url: 'https://bodlensesportugal.com' },
  { date: 'Fevereiro 2026',tag: 'Material',      tagColor: 'bg-purple-100 text-purple-700', title: 'Solis II disponível em toda a gama de prescrições',                   body: 'O exclusivo material Solis II da BOD Lenses está agora disponível para toda a gama de prescrições. Leveza e resistência sem compromissos.', image: BRAND_IMAGES.coatings, url: 'https://bodlensesportugal.com' },
  { date: 'Janeiro 2026',  tag: 'Plataforma',    tagColor: 'bg-blue-100 text-blue-700',     title: 'Nova plataforma MyBOD com rastreamento em tempo real',                body: 'Atualização completa com rastreamento em tempo real, histórico detalhado e notificações automáticas de entrega para as óticas parceiras.', image: BRAND_IMAGES.linkedin, url: 'https://bodlensesportugal.com' },
  { date: 'Dezembro 2025', tag: 'Programa',      tagColor: 'bg-amber-100 text-amber-700',   title: 'Pioneiros BOD — vantagens exclusivas alargadas para 2026',            body: 'Novos benefícios: preços diferenciados, suporte prioritário e acesso antecipado a novos produtos e materiais.', image: BRAND_IMAGES.opticas, url: 'https://bodlensesportugal.com' },
  { date: 'Novembro 2025', tag: 'Certificação',  tagColor: 'bg-green-100 text-green-700',   title: 'BOD renova certificação ISO 14001 com nota máxima',                   body: 'Reforço do compromisso com a sustentabilidade na produção europeia de lentes oftálmicas.', image: BRAND_IMAGES.technology, url: 'https://bodlensesportugal.com' },
  { date: 'Outubro 2025',  tag: 'Formação',      tagColor: 'bg-indigo-100 text-indigo-700', title: 'Ciclo de formações técnicas 2026 — inscrições abertas',               body: 'Workshops presenciais e online sobre adaptação de progressivas, novos materiais e coloração terapêutica.', image: BRAND_IMAGES.coloring, url: 'https://bodlensesportugal.com' },
  { date: 'Setembro 2025', tag: 'Parcerias',     tagColor: 'bg-bod-light text-bod-blue',    title: 'BOD Start — abrir uma ótica nunca foi tão simples',                   body: 'O programa BOD Start apoia novos projetos óticos desde o primeiro dia: consultoria, condições especiais e suporte técnico dedicado.', image: BRAND_IMAGES.bodStart, url: 'https://bodlensesportugal.com' },
]

type NewsItem = typeof news[0]

export default function NovidadesPage() {
  const [infoModal, setInfoModal] = useState<NewsItem | null>(null)
  const [infoForm, setInfoForm]   = useState({ message: '' })
  const [sending, setSending]     = useState(false)
  const [sent, setSent]           = useState(false)

  const requestInfo = async () => {
    if (!infoForm.message || !infoModal) return
    setSending(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      await supabase.from('contact_messages').insert([{
        optica_id: session.user.id,
        name: '',
        optica: '',
        email: session.user.email ?? '',
        subject: `Pedido de informação: ${infoModal.title}`,
        message: infoForm.message,
      }])
    }
    setSending(false)
    setSent(true)
    setTimeout(() => { setSent(false); setInfoModal(null); setInfoForm({ message: '' }) }, 2000)
  }

  return (
    <AppShell>
      <div className="px-4 md:px-8 py-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-bod-blue mb-1">Novidades</p>
          <h1 className="font-display text-2xl font-bold text-bod-dark">Últimas notícias BOD</h1>
          <p className="text-sm text-gray-400 mt-1">Lançamentos, inovações e iniciativas da BOD Lenses Portugal.</p>
        </div>

        {/* Featured 2 */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {news.slice(0, 2).map(n => (
            <article key={n.title} className="card overflow-hidden group hover:shadow-md transition-shadow">
              <div className="relative h-52 overflow-hidden">
                <Image src={n.image} alt={n.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className={`absolute top-3 left-3 text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${n.tagColor}`}>{n.tag}</span>
              </div>
              <div className="p-5">
                <p className="text-xs text-gray-400 mb-2">{n.date}</p>
                <h2 className="font-display text-base font-bold text-bod-dark mb-2 leading-snug">{n.title}</h2>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">{n.body}</p>
                <div className="flex gap-2">
                  <a href={n.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-semibold text-bod-blue hover:underline">
                    <ExternalLink size={13} /> Ver no website
                  </a>
                  <button onClick={() => setInfoModal(n)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-bod-blue ml-auto">
                    <MessageCircle size={13} /> Pedir mais informações
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {news.slice(2).map(n => (
            <article key={n.title} className="card overflow-hidden group hover:shadow-md transition-shadow">
              <div className="relative h-36 overflow-hidden">
                <Image src={n.image} alt={n.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <span className={`absolute top-2.5 left-2.5 text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${n.tagColor}`}>{n.tag}</span>
              </div>
              <div className="p-4">
                <p className="text-xs text-gray-400 mb-1">{n.date}</p>
                <h3 className="font-semibold text-sm text-bod-dark mb-2 leading-snug">{n.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">{n.body}</p>
                <div className="flex items-center gap-3">
                  <a href={n.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-semibold text-bod-blue hover:underline">
                    <ExternalLink size={12} /> Website
                  </a>
                  <button onClick={() => setInfoModal(n)}
                    className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-bod-blue ml-auto">
                    <MessageCircle size={12} /> Mais informações
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* INFO REQUEST MODAL */}
      {infoModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 p-0 md:p-4"
          onClick={() => setInfoModal(null)}>
          <div className="bg-white w-full md:max-w-md rounded-t-3xl md:rounded-2xl p-6 space-y-4"
            onClick={e => e.stopPropagation()}>
            {sent ? (
              <div className="text-center py-6">
                <CheckCircle size={40} className="text-green-500 mx-auto mb-3" />
                <p className="font-semibold text-bod-dark">Pedido enviado!</p>
                <p className="text-sm text-gray-400 mt-1">A equipa BOD entrará em contacto em breve.</p>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-bod-blue mb-1">Pedido de informação</p>
                    <h3 className="font-semibold text-sm text-bod-dark leading-snug">{infoModal.title}</h3>
                  </div>
                  <button onClick={() => setInfoModal(null)} className="text-gray-300 hover:text-gray-500 shrink-0"><X size={18} /></button>
                </div>
                <div>
                  <label className="label">A sua mensagem / dúvida</label>
                  <textarea className="input resize-none" rows={4}
                    placeholder="Descreva o que gostaria de saber sobre este produto ou novidade..."
                    value={infoForm.message} onChange={e => setInfoForm({ message: e.target.value })} />
                </div>
                <div className="flex gap-3">
                  <button className="btn-ghost flex-1" onClick={() => setInfoModal(null)}>Cancelar</button>
                  <button className="btn-primary flex-1" onClick={requestInfo} disabled={sending || !infoForm.message}>
                    <MessageCircle size={15} /> {sending ? 'A enviar...' : 'Enviar pedido'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </AppShell>
  )
}
