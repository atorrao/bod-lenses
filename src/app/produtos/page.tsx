import Image from 'next/image'
import AppShell from '@/components/layout/AppShell'
import { BRAND_IMAGES } from '@/lib/data'

const products = [
  { key: 'monofocal',     title: 'Monofocal',               badge: 'Popular',          image: BRAND_IMAGES.lenses,      features: ['Free-Form','Índices 1.5–1.74','Solis II disponível'] },
  { key: 'progressiva',   title: 'Progressiva',             badge: 'Popular',          image: BRAND_IMAGES.technology,  features: ['Sem linha visível','Adaptação rápida','Zona intermédia ampla'] },
  { key: 'bifocal',       title: 'Bifocal',                 badge: null,               image: BRAND_IMAGES.coatings,    features: ['Linha definida','Todos os índices','Alta durabilidade'] },
  { key: 'indoor',        title: 'Indoor / Ocupacional',    badge: null,               image: BRAND_IMAGES.coloring,    features: ['Anti-fadiga digital','Filtro luz azul','Ideal para escritório'] },
  { key: 'personalizada', title: 'Personalizada',           badge: null,               image: BRAND_IMAGES.technology,  features: ['Parâmetros à medida','Casos complexos','Consultoria incluída'] },
  { key: 'junior',        title: 'Junior',                  badge: null,               image: BRAND_IMAGES.lenses,      features: ['UV 400','Ultra-leves','Alta resistência'] },
  { key: 'conducao',      title: 'Condução',                badge: null,               image: BRAND_IMAGES.colorSight,  features: ['Anti-encadeamento','Visão noturna','Contraste aumentado'] },
  { key: 'terapeutica',   title: 'Coloração Terapêutica',   badge: 'Novo 2026',        image: BRAND_IMAGES.therapeutic, features: ['Alívio de enxaquecas','5 cores','Uso interior e exterior'] },
]

export default function ProdutosPage() {
  return (
    <AppShell>
      <div className="px-4 md:px-8 py-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-bod-blue mb-1">Catálogo</p>
          <h1 className="font-display text-2xl font-bold text-bod-dark">Produtos & Tecnologias</h1>
          <p className="text-sm text-gray-400 mt-1">Gama completa de lentes premium fabricadas na Europa.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(p => (
            <div key={p.key} className="card overflow-hidden group hover:shadow-md transition-shadow">
              <div className="relative h-40 overflow-hidden">
                <Image src={p.image} alt={p.title} fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                {p.badge && (
                  <span className={`absolute top-2.5 right-2.5 text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full ${
                    p.badge.includes('Novo') ? 'bg-green-100 text-green-700' : 'bg-bod-light text-bod-blue'
                  }`}>{p.badge}</span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-sm text-bod-dark mb-3">{p.title}</h3>
                <div className="flex flex-wrap gap-1.5">
                  {p.features.map(f => (
                    <span key={f} className="text-xs bg-bod-xlight text-bod-blue font-medium px-2 py-0.5 rounded-lg">{f}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Coatings */}
        <div className="mt-8 card p-5 md:p-6">
          <h2 className="font-semibold text-base text-bod-dark mb-4">Revestimentos disponíveis</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { name: 'Anti-reflexo (AR)',     desc: 'Elimina reflexos e melhora a nitidez' },
              { name: 'Proteção UV 400',        desc: 'Bloqueio total de radiação ultravioleta' },
              { name: 'Filtro luz azul',        desc: 'Protege de ecrãs digitais' },
              { name: 'Fotocromática',          desc: 'Adaptação automática à luminosidade' },
              { name: 'Anti-riscos reforçado',  desc: 'Resistência superior ao desgaste' },
              { name: 'Solis II (material)',    desc: 'Material exclusivo BOD — leveza máxima' },
            ].map(c => (
              <div key={c.name} className="flex items-start gap-3 p-3 bg-bod-xlight rounded-xl">
                <div className="w-2 h-2 rounded-full bg-bod-blue mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-bod-dark">{c.name}</p>
                  <p className="text-xs text-gray-400">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
