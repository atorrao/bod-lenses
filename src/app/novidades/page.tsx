'use client'

import { useState } from 'react'
import Image from 'next/image'
import AppShell from '@/components/layout/AppShell'
import { supabase } from '@/lib/supabase'
import { BRAND_IMAGES } from '@/lib/data'
import { ExternalLink, MessageCircle, CheckCircle, X, Star } from 'lucide-react'

const news = [
  // DESTAQUES (featured: true)
  {
    featured: true,
    date: 'Março 2026', tag: 'Lançamento', tagColor: 'bg-green-100 text-green-700',
    category: 'Produtos',
    title: 'Coloração Terapêutica — alívio de enxaquecas e fotossensibilidade',
    body: 'A BOD Lenses lança a sua nova linha de lentes com coloração terapêutica, desenvolvidas especificamente para pacientes com enxaquecas crónicas e hipersensibilidade à luz. Disponível em 5 tonalidades com indicação clínica validada.',
    image: BRAND_IMAGES.therapeutic, url: 'https://bodlensesportugal.com',
  },
  {
    featured: true,
    date: 'Setembro 2025', tag: 'Programa', tagColor: 'bg-amber-100 text-amber-700',
    category: 'Programas',
    title: 'BOD Start — abrir uma ótica nunca foi tão simples',
    body: 'O programa BOD Start apoia novos projetos óticos desde o primeiro dia: consultoria, condições especiais de lançamento e suporte técnico dedicado para quem está a começar.',
    image: BRAND_IMAGES.opticas, url: 'https://bodlensesportugal.com',
  },
  // RESTANTES
  {
    featured: false,
    date: 'Março 2026', tag: 'Novidade', tagColor: 'bg-bod-light text-bod-blue',
    category: 'Produtos',
    title: 'Cores terapêuticas — guia de seleção para óticas',
    body: 'Guia completo de seleção das cores terapêuticas BOD com indicações clínicas e perfis de paciente.',
    image: BRAND_IMAGES.therapeuticColors, url: 'https://bodlensesportugal.com',
  },
  {
    featured: false,
    date: 'Fevereiro 2026', tag: 'Material', tagColor: 'bg-purple-100 text-purple-700',
    category: 'Produtos',
    title: 'Solis II disponível em toda a gama de prescrições',
    body: 'O exclusivo material Solis II está agora disponível para toda a gama, incluindo prescrições elevadas.',
    image: BRAND_IMAGES.coatings, url: 'https://bodlensesportugal.com',
  },
  {
    featured: false,
    date: 'Janeiro 2026', tag: 'Plataforma', tagColor: 'bg-blue-100 text-blue-700',
    category: 'Tecnologia',
    title: 'Nova plataforma MyBOD com rastreamento em tempo real',
    body: 'Atualização completa com rastreamento em tempo real e notificações automáticas de entrega.',
    image: BRAND_IMAGES.linkedin, url: 'https://bodlensesportugal.com',
  },
  {
    featured: false,
    date: 'Dezembro 2025', tag: 'Programa', tagColor: 'bg-amber-100 text-amber-700',
    category: 'Programas',
    title: 'Pioneiros BOD — vantagens exclusivas alargadas para 2026',
    body: 'Preços diferenciados, suporte prioritário e acesso antecipado a novos produtos.',
    image: BRAND_IMAGES.opticas, url: 'https://bodlensesportugal.com',
  },
  {
    featured: false,
    date: 'Novembro 2025', tag: 'Certificação', tagColor: 'bg-green-100 text-green-700',
    category: 'Empresa',
    title: 'BOD renova certificação ISO 14001 com nota máxima',
    body: 'Reforço do compromisso com a sustentabilidade na produção europeia de lentes oftálmicas.',
    image: BRAND_IMAGES.technology, url: 'https://bodlensesportugal.com',
  },
  {
    featured: false,
    date: 'Outubro 2025', tag: 'Formação', tagColor: 'bg-indigo-100 text-indigo-700',
    category: 'Formação',
    title: 'Ciclo de formações técnicas 2026 — inscrições abertas',
    body: 'Workshops presenciais e online sobre adaptação de progressivas e novos materiais.',
    image: BRAND_IMAGES.coloring, url: 'https://bodlensesportugal.com',
  },
]

const CATEGORIES = ['Todos', 'Produtos', 'Programas', 'Tecnologia', 'Formação', 'Empresa']

type NewsItem = typeof news[0]

export default function NovidadesPage() {
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [infoModal, setInfoModal]           = useState<NewsItem | null>(null)
  const [infoMsg, setInfoMsg]               = useState('')
  const [sending, setSending]               = useState(false)
  const [sent, setSent]                     = useState(false)

  const featured  = news.filter(n => n.featured)
  const rest      = news.filter(n => !n.featured && (activeCategory === 'Todos' || n.category === activeCategory))

  const requestInfo = async () => {
    if (!infoMsg || !infoModal) return
    setSending(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      await supabase.from('contact_messages').insert([{
        optica_id: session.user.id,
        name: '', optica: '',
        email: session.user.email ?? '',
        subject: `Pedido de informação: ${infoModal.title}`,
        message: infoMsg,
      }])
    }
    setSending(false); setSent(true)
    setTimeout(() => { setSent(false); setInfoModal(null); setInfoMsg('') }, 2000)
  }

  return (
    <AppShell>
      <div className="px-4 md:px-8 py-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-bod-blue mb-1">Novidades</p>
          <h1 className="font-display text-2xl font-bold text-bod-dark">Últimas notícias BOD</h1>
          <p className="text-sm text-gray-400 mt-1">Lançamentos, inovações e iniciativas da BOD Lenses Portugal.</p>
        </div>

        {/* DESTAQUES */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Star size={14} className="text-amber-500" />
            <p className="text-xs font-bold uppercase tracking-widest text-amber-600">Em destaque</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {featured.map(n => (
              <article key={n.title} className="card overflow-hidden group hover:shadow-md transition-shadow border-2 border-amber-100">
                <div className="relative h-52 overflow-hidden">
                  <Image src={n.image} alt={n.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className={`text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${n.tagColor}`}>{n.tag}</span>
                    <span className="text-xs font-bold bg-amber-400 text-white px-2 py-1 rounded-full flex items-center gap-1">
                      <Star size={10} /> Destaque
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-xs text-gray-400 mb-2">{n.date}</p>
                  <h2 className="font-display text-base font-bold text-bod-dark mb-2 leading-snug">{n.title}</h2>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">{n.body}</p>
                  <div className="flex items-center gap-3">
                    <a href={n.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-semibold text-bod-blue hover:underline">
                      <ExternalLink size={13} /> Ver no website
                    </a>
                    <button onClick={() => setInfoModal(n)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-bod-blue ml-auto">
                      <MessageCircle size={13} /> Pedir informações
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* CATEGORY FILTER */}
        <div className="flex flex-wrap gap-2 mb-5">
          {CATEGORIES.map(c => (
            <button key={c}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${activeCategory === c ? 'bg-bod-blue text-white' : 'bg-bod-xlight text-gray-500 hover:text-bod-blue'}`}
              onClick={() => setActiveCategory(c)}>
              {c}
            </button>
          ))}
        </div>

        {/* ALL NEWS GRID */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {rest.map(n => (
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
          {rest.length === 0 && (
            <div className="col-span-3 text-center py-10 text-gray-300 text-sm">
              Sem notícias nesta categoria.
            </div>
          )}
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
                    placeholder="Descreva o que gostaria de saber..."
                    value={infoMsg} onChange={e => setInfoMsg(e.target.value)} />
                </div>
                <div className="flex gap-3">
                  <button className="btn-ghost flex-1" onClick={() => setInfoModal(null)}>Cancelar</button>
                  <button className="btn-primary flex-1" onClick={requestInfo} disabled={sending || !infoMsg}>
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
