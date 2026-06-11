import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { BRAND_IMAGES } from '@/lib/data'

const news = [
  {
    date: 'Março 2026',
    tag: 'Lançamento',
    tagColor: 'bg-green-100 text-green-700',
    title: 'Coloração Terapêutica — alívio de enxaquecas e fotossensibilidade',
    body: 'A BOD Lenses lança a sua nova linha de lentes com coloração terapêutica, desenvolvidas especificamente para pacientes com enxaquecas crónicas e hipersensibilidade à luz. Disponível em 5 tonalidades com indicação clínica validada.',
    image: BRAND_IMAGES.therapeutic,
  },
  {
    date: 'Março 2026',
    tag: 'Novidade',
    tagColor: 'bg-bod-light text-bod-blue',
    title: 'Cores terapêuticas disponíveis — guia de seleção para óticas',
    body: 'Publicamos o guia completo de seleção das cores terapêuticas BOD, com indicações clínicas, perfis de paciente e recomendações de adaptação para ajudar os profissionais de ótica.',
    image: BRAND_IMAGES.therapeuticColors,
  },
  {
    date: 'Fevereiro 2026',
    tag: 'Material',
    tagColor: 'bg-purple-100 text-purple-700',
    title: 'Solis II disponível em toda a gama de prescrições',
    body: 'O exclusivo material Solis II da BOD Lenses está agora disponível para toda a gama de prescrições, incluindo valores elevados de esfera e cilindro. Leveza e resistência sem compromissos.',
    image: BRAND_IMAGES.coatings,
  },
  {
    date: 'Janeiro 2026',
    tag: 'Plataforma',
    tagColor: 'bg-blue-100 text-blue-700',
    title: 'Nova plataforma MyBOD com rastreamento em tempo real',
    body: 'A plataforma de encomendas MyBOD recebeu uma atualização completa com rastreamento em tempo real, histórico detalhado e notificações automáticas de entrega para as óticas parceiras.',
    image: BRAND_IMAGES.linkedin,
  },
  {
    date: 'Dezembro 2025',
    tag: 'Programa',
    tagColor: 'bg-amber-100 text-amber-700',
    title: 'Pioneiros BOD — vantagens exclusivas alargadas para 2026',
    body: 'O programa Pioneiros BOD foi alargado com novos benefícios: preços diferenciados, suporte prioritário, acesso antecipado a novos produtos e materiais exclusivos de marketing.',
    image: BRAND_IMAGES.opticas,
  },
  {
    date: 'Novembro 2025',
    tag: 'Sustentabilidade',
    tagColor: 'bg-green-100 text-green-700',
    title: 'BOD Lenses renova certificação ISO 14001 com nota máxima',
    body: 'A BOD Lenses renovou a sua certificação ambiental ISO 14001:2015, reforçando o compromisso com a sustentabilidade na produção de lentes oftálmicas na Europa.',
    image: BRAND_IMAGES.technology,
  },
  {
    date: 'Outubro 2025',
    tag: 'Formação',
    tagColor: 'bg-indigo-100 text-indigo-700',
    title: 'Ciclo de formações técnicas para óticas — inscrições abertas 2026',
    body: 'O novo ciclo de formações técnicas BOD para profissionais de ótica está aberto. Workshops presenciais e online sobre adaptação de progressivas e novos materiais.',
    image: BRAND_IMAGES.coloring,
  },
  {
    date: 'Setembro 2025',
    tag: 'Parcerias',
    tagColor: 'bg-bod-light text-bod-blue',
    title: 'BOD Start — abrir uma ótica nunca foi tão simples',
    body: 'O programa BOD Start apoia novos projetos óticos desde o primeiro dia: consultoria, condições especiais de lançamento e suporte técnico dedicado para quem está a começar.',
    image: BRAND_IMAGES.bodStart,
  },
]

export default function NovidadesPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Hero */}
        <section className="relative bg-bod-dark overflow-hidden">
          <div className="absolute inset-0">
            <Image src={BRAND_IMAGES.linkedin} alt="Novidades BOD" fill className="object-cover opacity-25" priority />
            <div className="absolute inset-0 bg-gradient-to-r from-bod-dark to-bod-dark/50" />
          </div>
          <div className="relative max-w-6xl mx-auto px-6 py-16">
            <p className="text-xs font-bold uppercase tracking-widest text-bod-sky mb-3">Novidades</p>
            <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight mb-4">
              Últimas notícias BOD Lenses
            </h1>
            <p className="text-white/60 text-lg max-w-xl leading-relaxed">
              Fique a par das últimas inovações, lançamentos e iniciativas da BOD Lenses Portugal.
            </p>
          </div>
        </section>

        {/* Featured */}
        <section className="max-w-6xl mx-auto px-6 pt-16 pb-8">
          <div className="grid md:grid-cols-2 gap-6">
            {news.slice(0, 2).map(n => (
              <article key={n.title} className="card p-0 overflow-hidden group hover:shadow-lg hover:shadow-bod-light/40 transition-shadow">
                <div className="relative h-56 overflow-hidden">
                  <Image src={n.image} alt={n.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span className={`absolute top-3 left-3 text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${n.tagColor}`}>
                    {n.tag}
                  </span>
                </div>
                <div className="p-6">
                  <p className="text-xs text-gray-400 font-medium mb-2">{n.date}</p>
                  <h2 className="font-display text-lg font-bold text-bod-dark mb-3 leading-snug">{n.title}</h2>
                  <p className="text-sm text-gray-500 leading-relaxed">{n.body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Grid */}
        <section className="max-w-6xl mx-auto px-6 pb-16">
          <div className="grid md:grid-cols-3 gap-5">
            {news.slice(2).map(n => (
              <article key={n.title} className="card p-0 overflow-hidden group hover:shadow-md transition-shadow">
                <div className="relative h-40 overflow-hidden">
                  <Image src={n.image} alt={n.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <span className={`absolute top-2.5 left-2.5 text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${n.tagColor}`}>
                    {n.tag}
                  </span>
                </div>
                <div className="p-5">
                  <p className="text-xs text-gray-400 font-medium mb-1.5">{n.date}</p>
                  <h3 className="font-semibold text-sm text-bod-dark mb-2 leading-snug">{n.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{n.body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
