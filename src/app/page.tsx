import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { BRAND_IMAGES } from '@/lib/data'
import { Calculator, Package, Newspaper, MessageCircle, Award, Clock, Globe, Zap } from 'lucide-react'

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* HERO */}
        <section className="relative bg-bod-dark overflow-hidden">
          {/* Background image with overlay */}
          <div className="absolute inset-0">
            <Image
              src={BRAND_IMAGES.lenses}
              alt="BOD Lenses"
              fill
              className="object-cover opacity-20"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-bod-dark via-bod-dark/90 to-bod-blue/40" />
          </div>

          <div className="relative max-w-6xl mx-auto px-6 py-24 md:py-32">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold text-white/80 uppercase tracking-widest mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-bod-sky animate-pulse" />
                Lentes Premium · Fabricadas na Europa
              </div>
              <h1 className="font-display text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight mb-6">
                See better.<br />
                <span className="text-bod-sky">Live better.</span>
              </h1>
              <p className="text-lg text-white/70 leading-relaxed mb-10 max-w-xl">
                Lentes oftálmicas de alta performance para óticas que exigem o melhor — tecnologia Free-Form, certificação ISO e suporte 24/7.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/calculadora" className="btn-primary text-base px-6 py-3.5">
                  <Calculator size={18} />
                  Calcular preços
                </Link>
                <Link href="/produtos" className="btn-secondary text-base px-6 py-3.5">
                  Ver produtos →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="bg-bod-xlight border-b border-bod-light">
          <div className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: '10+', label: 'Anos de experiência' },
              { value: 'ISO 9001', label: 'Certificação internacional' },
              { value: '24/7', label: 'Apoio técnico' },
              { value: 'Free-Form', label: 'Tecnologia de topo' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="font-display text-2xl font-bold text-bod-blue">{s.value}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wide mt-0.5 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURE SECTIONS */}
        <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="section-eyebrow">As nossas lentes</p>
            <h2 className="section-heading mb-4">Uma solução única porque a nossa visão é única</h2>
            <p className="section-sub mb-8">
              Gama completa de lentes monofocais, progressivas, bifocais, ocupacionais e personalizadas, fabricadas com tecnologia Free-Form de última geração.
            </p>
            <Link href="/produtos" className="btn-outline">
              <Package size={16} />
              Ver catálogo completo
            </Link>
          </div>
          <div className="relative h-72 md:h-80 rounded-2xl overflow-hidden">
            <Image src={BRAND_IMAGES.lenses} alt="Lentes BOD" fill className="object-cover" />
          </div>
        </section>

        <section className="bg-bod-xlight">
          <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
            <div className="relative h-72 md:h-80 rounded-2xl overflow-hidden order-2 md:order-1">
              <Image src={BRAND_IMAGES.technology} alt="Tecnologia BOD" fill className="object-cover" />
            </div>
            <div className="order-1 md:order-2">
              <p className="section-eyebrow">Tecnologia</p>
              <h2 className="section-heading mb-4">A inovação ao serviço da saúde e bem-estar</h2>
              <p className="section-sub mb-6">
                Free-Form, fotocromáticas, filtros de luz azul e proteção UV avançada — tecnologia de vanguarda em cada par de lentes.
              </p>
            </div>
          </div>
        </section>

        {/* NOVIDADE TERAPEUTICA */}
        <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full mb-4">Novidade 2026</span>
            <h2 className="section-heading mb-4">Lentes com Coloração Terapêutica</h2>
            <p className="section-sub mb-8">
              Desenvolvidas para aliviar enxaquecas e sensibilidade à luz. Uma solução inovadora que abre um novo mercado para a sua ótica.
            </p>
            <Link href="/novidades" className="btn-outline">
              <Newspaper size={16} />
              Saber mais
            </Link>
          </div>
          <div className="relative h-72 md:h-80 rounded-2xl overflow-hidden">
            <Image src={BRAND_IMAGES.therapeutic} alt="Coloração Terapêutica" fill className="object-cover object-top" />
          </div>
        </section>

        {/* WHY BOD */}
        <section className="bg-bod-dark text-white">
          <div className="max-w-6xl mx-auto px-6 py-20">
            <div className="text-center mb-14">
              <p className="text-xs font-bold uppercase tracking-widest text-bod-sky mb-3">Para as óticas</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">Por que escolher a BOD Lenses?</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Award, title: 'Qualidade premium', desc: 'Certificação ISO 9001, 14001 e 45001. Cada lente passa por controlo rigoroso.' },
                { icon: Clock, title: 'Entrega rápida', desc: 'Produção ágil e prazos curtos para que as encomendas cheguem sempre a tempo.' },
                { icon: Globe, title: 'Parceria internacional', desc: 'Rede global presente em todo o mundo ao serviço das óticas portuguesas.' },
                { icon: Zap, title: 'Plataforma 24/7', desc: 'Encomendas online a qualquer hora, com rastreamento em tempo real.' },
                { icon: Calculator, title: 'Margens competitivas', desc: 'Preços que permitem às óticas ser competitivas sem sacrificar qualidade.' },
                { icon: MessageCircle, title: 'Apoio especializado', desc: 'Equipa técnica disponível 24/7, em português. Sempre ao seu lado.' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-colors">
                  <div className="w-10 h-10 bg-bod-blue/30 rounded-xl flex items-center justify-center mb-4">
                    <Icon size={20} className="text-bod-sky" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">{title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-6xl mx-auto px-6 py-20 text-center">
          <p className="section-eyebrow">Calculadora</p>
          <h2 className="section-heading mb-4">Calcule a vantagem para a sua ótica</h2>
          <p className="section-sub mx-auto mb-8">
            Introduza o tipo de lente, material e margem desejada. Veja o custo BOD e o PVP sugerido ao cliente em segundos.
          </p>
          <Link href="/calculadora" className="btn-primary text-base px-8 py-4">
            <Calculator size={18} />
            Abrir calculadora
          </Link>
        </section>
      </main>
      <Footer />
    </>
  )
}
