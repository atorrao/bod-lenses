import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { BRAND_IMAGES } from '@/lib/data'

const products = [
  {
    key: 'monofocal',
    title: 'Lentes Monofocais',
    desc: 'Correção para visão ao longe ou ao perto. Alta precisão com tecnologia Free-Form para máximo conforto visual e mínima distorção.',
    badge: { label: 'Popular', color: 'bg-bod-light text-bod-blue' },
    image: BRAND_IMAGES.lenses,
    features: ['Tecnologia Free-Form', 'Índices 1.5 a 1.74', 'Solis II disponível', 'Entrega em 24–48h'],
  },
  {
    key: 'progressiva',
    title: 'Lentes Progressivas',
    desc: 'Visão contínua ao longe, intermédio e ao perto sem linha visível. Personalização total por Free-Form.',
    badge: { label: 'Popular', color: 'bg-bod-light text-bod-blue' },
    image: BRAND_IMAGES.technology,
    features: ['Free-Form personalizado', 'Sem linha visível', 'Zona intermédia ampla', 'Adaptação rápida'],
  },
  {
    key: 'bifocal',
    title: 'Lentes Bifocais',
    desc: 'Duas zonas de visão numa só lente. Solução clássica e fiável para prescrições combinadas.',
    badge: null,
    image: BRAND_IMAGES.coatings,
    features: ['Linha definida', 'Varios segmentos', 'Todos os índices', 'Alta durabilidade'],
  },
  {
    key: 'indoor',
    title: 'Indoor / Ocupacional',
    desc: 'Desenhadas para uso prolongado em ambientes fechados e ecrãs. Reduzem a fadiga visual em 40%.',
    badge: null,
    image: BRAND_IMAGES.coloring,
    features: ['Anti-fadiga digital', 'Filtro luz azul', 'Zona intermédia larga', 'Ideal para escritório'],
  },
  {
    key: 'personalizada',
    title: 'Lentes Personalizadas',
    desc: 'Fabrico à medida para casos especiais, com parâmetros completamente individualizados para cada paciente.',
    badge: null,
    image: BRAND_IMAGES.technology,
    features: ['Parâmetros à medida', 'Casos complexos', 'Consulta técnica incluída', 'Garantia alargada'],
  },
  {
    key: 'junior',
    title: 'Lentes Junior',
    desc: 'Especialmente desenvolvidas para crianças e jovens. Proteção UV total e leveza superior para o uso diário.',
    badge: null,
    image: BRAND_IMAGES.lenses,
    features: ['UV 400 incluído', 'Ultra-leves', 'Alta resistência', 'Seguras para crianças'],
  },
  {
    key: 'conducao',
    title: 'Lentes para Condução',
    desc: 'Filtros especializados para visão noturna e diurna ao volante. Redução de reflexos e luz azul.',
    badge: null,
    image: BRAND_IMAGES.colorSight,
    features: ['Anti-encadeamento', 'Visão noturna melhorada', 'Contraste aumentado', 'Certificadas CE'],
  },
  {
    key: 'terapeutica',
    title: 'Coloração Terapêutica',
    desc: 'Desenvolvidas para aliviar enxaquecas crónicas e hipersensibilidade à luz — a grande novidade BOD 2026.',
    badge: { label: 'Novidade 2026', color: 'bg-green-100 text-green-700' },
    image: BRAND_IMAGES.therapeutic,
    features: ['Alívio de enxaquecas', '5 cores disponíveis', 'Uso interior e exterior', 'Indicação clínica'],
  },
]

const materials = [
  { name: 'Standard 1.5', desc: 'Solução clássica para prescrições baixas a médias.' },
  { name: 'Alto índice 1.6', desc: 'Mais fino e leve. Ideal para prescrições médias a altas.' },
  { name: 'Alto índice 1.67', desc: 'Excelente para prescrições altas com máxima esteticidade.' },
  { name: 'Ultra índice 1.74', desc: 'O mais fino disponível. Para prescrições muito elevadas.' },
  { name: 'Solis II', desc: 'Material exclusivo BOD. Leveza e resistência superiores em toda a gama.', exclusive: true },
]

export default function ProdutosPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Hero */}
        <section className="relative bg-bod-dark overflow-hidden">
          <div className="absolute inset-0">
            <Image src={BRAND_IMAGES.coloring} alt="Produtos BOD" fill className="object-cover opacity-20" priority />
            <div className="absolute inset-0 bg-gradient-to-r from-bod-dark to-bod-dark/60" />
          </div>
          <div className="relative max-w-6xl mx-auto px-6 py-16">
            <p className="text-xs font-bold uppercase tracking-widest text-bod-sky mb-3">Catálogo</p>
            <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight mb-4">
              Produtos & Tecnologias
            </h1>
            <p className="text-white/60 text-lg max-w-xl leading-relaxed">
              Gama completa de lentes premium para cada necessidade visual, fabricadas na Europa com os mais elevados padrões de qualidade.
            </p>
          </div>
        </section>

        {/* Products */}
        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-2 gap-6">
            {products.map(p => (
              <div key={p.key} className="card hover:shadow-lg hover:shadow-bod-light/50 transition-shadow group overflow-hidden p-0">
                <div className="relative h-48 overflow-hidden">
                  <Image src={p.image} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-bod-dark/80 via-transparent to-transparent" />
                  {p.badge && (
                    <span className={`absolute top-3 right-3 text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${p.badge.color}`}>
                      {p.badge.label}
                    </span>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="font-display text-lg font-bold text-bod-dark mb-2">{p.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">{p.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {p.features.map(f => (
                      <span key={f} className="text-xs bg-bod-xlight text-bod-blue font-medium px-2.5 py-1 rounded-lg">{f}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Materials */}
        <section className="bg-bod-xlight border-y border-bod-light">
          <div className="max-w-6xl mx-auto px-6 py-16">
            <p className="section-eyebrow">Materiais</p>
            <h2 className="section-heading mb-10">Escolha o índice certo para cada prescrição</h2>
            <div className="grid md:grid-cols-5 gap-4">
              {materials.map(m => (
                <div key={m.name} className={`card p-5 ${m.exclusive ? 'border-bod-blue border-2 bg-bod-xlight' : ''}`}>
                  {m.exclusive && (
                    <span className="text-xs font-bold uppercase tracking-wide bg-bod-blue text-white px-2 py-0.5 rounded-full mb-3 inline-block">Exclusivo</span>
                  )}
                  <h3 className="font-semibold text-sm text-bod-dark mb-2">{m.name}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Coatings */}
        <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
          <div className="relative h-64 rounded-2xl overflow-hidden">
            <Image src={BRAND_IMAGES.coatings} alt="Revestimentos BOD" fill className="object-cover" />
          </div>
          <div>
            <p className="section-eyebrow">Revestimentos</p>
            <h2 className="section-heading mb-4">Mais durabilidade e conforto em cada lente</h2>
            <div className="space-y-3 mt-6">
              {[
                { name: 'Anti-reflexo (AR)', desc: 'Elimina reflexos e melhora a nitidez visual' },
                { name: 'Proteção UV 400', desc: 'Bloqueio total de radiação ultravioleta' },
                { name: 'Filtro luz azul', desc: 'Protege os olhos de ecrãs digitais' },
                { name: 'Fotocromática', desc: 'Adaptação automática à luminosidade' },
                { name: 'Anti-riscos reforçado', desc: 'Resistência superior ao desgaste diário' },
              ].map(c => (
                <div key={c.name} className="flex items-start gap-3 p-3 bg-bod-xlight rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-bod-blue mt-1.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-bod-dark">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
