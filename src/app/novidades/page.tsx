import Image from 'next/image'
import AppShell from '@/components/layout/AppShell'
import { BRAND_IMAGES } from '@/lib/data'

const news = [
  { date: 'Março 2026',    tag: 'Lançamento',      tagColor: 'bg-green-100 text-green-700',   title: 'Coloração Terapêutica — alívio de enxaquecas',         body: 'Nova linha para pacientes com enxaquecas crónicas e hipersensibilidade à luz. Disponível em 5 tonalidades com indicação clínica validada.', image: BRAND_IMAGES.therapeutic },
  { date: 'Fevereiro 2026',tag: 'Material',        tagColor: 'bg-purple-100 text-purple-700', title: 'Solis II disponível em toda a gama de prescrições',     body: 'Material exclusivo BOD agora disponível para prescrições elevadas de esfera e cilindro. Leveza e resistência sem compromissos.',    image: BRAND_IMAGES.coatings },
  { date: 'Janeiro 2026',  tag: 'Plataforma',      tagColor: 'bg-blue-100 text-blue-700',     title: 'Nova plataforma MyBOD com rastreamento em tempo real',  body: 'Atualização completa com rastreamento em tempo real, histórico detalhado e notificações automáticas de entrega.',                  image: BRAND_IMAGES.linkedin },
  { date: 'Dezembro 2025', tag: 'Programa',        tagColor: 'bg-amber-100 text-amber-700',   title: 'Pioneiros BOD — vantagens exclusivas para 2026',       body: 'Novos benefícios: preços diferenciados, suporte prioritário e acesso antecipado a novos produtos e materiais.',                    image: BRAND_IMAGES.opticas },
  { date: 'Novembro 2025', tag: 'Certificação',    tagColor: 'bg-green-100 text-green-700',   title: 'BOD renova certificação ISO 14001 com nota máxima',     body: 'Reforço do compromisso com a sustentabilidade na produção europeia de lentes oftálmicas.',                                        image: BRAND_IMAGES.technology },
  { date: 'Outubro 2025',  tag: 'Formação',        tagColor: 'bg-indigo-100 text-indigo-700', title: 'Ciclo de formações técnicas 2026 — inscrições abertas', body: 'Workshops presenciais e online sobre adaptação de progressivas, novos materiais e coloração terapêutica.',                          image: BRAND_IMAGES.coloring },
]

export default function NovidadesPage() {
  return (
    <AppShell>
      <div className="px-4 md:px-8 py-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-bod-blue mb-1">Novidades</p>
          <h1 className="font-display text-2xl font-bold text-bod-dark">Últimas notícias BOD</h1>
          <p className="text-sm text-gray-400 mt-1">Lançamentos, inovações e iniciativas da BOD Lenses Portugal.</p>
        </div>

        {/* Featured */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {news.slice(0, 2).map(n => (
            <article key={n.title} className="card overflow-hidden group hover:shadow-md transition-shadow">
              <div className="relative h-48 overflow-hidden">
                <Image src={n.image} alt={n.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className={`absolute top-3 left-3 text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${n.tagColor}`}>{n.tag}</span>
              </div>
              <div className="p-5">
                <p className="text-xs text-gray-400 mb-2">{n.date}</p>
                <h2 className="font-semibold text-base text-bod-dark mb-2 leading-snug">{n.title}</h2>
                <p className="text-sm text-gray-500 leading-relaxed">{n.body}</p>
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
                <p className="text-xs text-gray-400 mb-1.5">{n.date}</p>
                <h3 className="font-semibold text-sm text-bod-dark mb-2 leading-snug">{n.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{n.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
