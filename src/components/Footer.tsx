import Image from 'next/image'
import Link from 'next/link'
import { BRAND_IMAGES } from '@/lib/data'

export default function Footer() {
  return (
    <footer className="bg-bod-dark text-white/60 mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <Image
            src={BRAND_IMAGES.logo}
            alt="BOD Lenses Portugal"
            width={130}
            height={36}
            className="h-8 w-auto object-contain brightness-0 invert mb-4"
          />
          <p className="text-sm leading-relaxed text-white/50 max-w-xs">
            Lentes oftálmicas premium fabricadas na Europa. Tecnologia Free-Form e certificação ISO 9001 ao serviço das óticas portuguesas.
          </p>
          <div className="flex gap-3 mt-5">
            <a href="https://www.linkedin.com/company/bodlensesportugal" target="_blank" rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-bod-blue flex items-center justify-center transition-colors">
              <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
            </a>
            <a href="https://www.instagram.com/bodlensespt" target="_blank" rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-bod-blue flex items-center justify-center transition-colors">
              <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="white" strokeWidth="2"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" fill="none" stroke="white" strokeWidth="2"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
            </a>
            <a href="https://www.facebook.com/bodlensesportugal/" target="_blank" rel="noopener noreferrer"
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-bod-blue flex items-center justify-center transition-colors">
              <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
            </a>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Produtos</p>
          <ul className="space-y-2 text-sm">
            {['Monofocais', 'Progressivas', 'Bifocais', 'Indoor', 'Personalizadas', 'Junior', 'Condução', 'Coloração Terapêutica'].map(p => (
              <li key={p}><Link href="/produtos" className="hover:text-white transition-colors">{p}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Contacto</p>
          <ul className="space-y-3 text-sm">
            <li>
              <a href="tel:+351915234366" className="hover:text-white transition-colors">+351 915 234 366</a>
            </li>
            <li>
              <a href="tel:+351211248310" className="hover:text-white transition-colors">+351 211 248 310</a>
            </li>
            <li>
              <a href="mailto:suporte@bodlensesportugal.com" className="hover:text-white transition-colors break-all">
                suporte@bodlensesportugal.com
              </a>
            </li>
            <li className="leading-snug text-white/40">
              Alameda da Beloura, Ed.4 Of. 0.5<br />
              Sintra, Lisboa 2714-561
            </li>
            <li className="text-white/40 text-xs">Apoio: Seg–Sex 9h30–18h00</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-white/30">
        <span>© 2026 BOD Lenses Portugal. Todos os direitos reservados.</span>
        <div className="flex gap-4">
          <a href="https://bodlensesportugal.com/politica-de-privacidade" target="_blank" rel="noopener noreferrer" className="hover:text-white/60 transition-colors">Privacidade</a>
          <a href="https://bodlensesportugal.com" target="_blank" rel="noopener noreferrer" className="hover:text-white/60 transition-colors">Website principal</a>
        </div>
      </div>
    </footer>
  )
}
