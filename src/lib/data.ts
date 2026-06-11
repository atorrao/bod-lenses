import { PriceTable, CoatingPrices } from './supabase'

export const LENS_TYPES = [
  { key: 'monofocal',    label: 'Monofocal',                badge: 'popular' },
  { key: 'progressiva',  label: 'Progressiva',              badge: 'popular' },
  { key: 'bifocal',      label: 'Bifocal',                  badge: null },
  { key: 'indoor',       label: 'Indoor / Ocupacional',     badge: null },
  { key: 'personalizada',label: 'Personalizada',            badge: null },
  { key: 'junior',       label: 'Junior',                   badge: null },
  { key: 'conducao',     label: 'Condução',                 badge: null },
  { key: 'terapeutica',  label: 'Coloração Terapêutica',    badge: 'new' },
] as const

export type LensKey = typeof LENS_TYPES[number]['key']

export const MATERIALS = [
  { key: '1.5',    label: 'Standard 1.5' },
  { key: '1.6',    label: 'Alto índice 1.6' },
  { key: '1.67',   label: 'Alto índice 1.67' },
  { key: 'solisII',label: 'Solis II (exclusivo BOD)' },
] as const

export const DEFAULT_PRICES: PriceTable = {
  monofocal:    { '1.5': 18,  '1.6': 26,  '1.67': 36,  solisII: 42 },
  progressiva:  { '1.5': 52,  '1.6': 68,  '1.67': 86,  solisII: 98 },
  bifocal:      { '1.5': 28,  '1.6': 38,  '1.67': 50,  solisII: 58 },
  indoor:       { '1.5': 45,  '1.6': 58,  '1.67': 72,  solisII: 82 },
  personalizada:{ '1.5': 70,  '1.6': 90,  '1.67': 110, solisII: 130 },
  junior:       { '1.5': 22,  '1.6': 30,  '1.67': 40,  solisII: 48 },
  conducao:     { '1.5': 38,  '1.6': 50,  '1.67': 64,  solisII: 74 },
  terapeutica:  { '1.5': 60,  '1.6': 75,  '1.67': 92,  solisII: 108 },
}

export const DEFAULT_COATINGS: CoatingPrices = {
  ar: 8, uv: 5, blue: 10, foto: 22, antiriscos: 6,
}

// Brand images from the website CDN
export const BRAND_IMAGES = {
  logo:           'https://bodlensesportugal.com/wp-content/uploads/2025/01/img_bdb3d28958de0ff96d5b53b511067225_288_78_0_0_crop.png',
  lenses:         'https://bodlensesportugal.com/wp-content/uploads/2025/02/as-nossas-lentes-.jpg',
  technology:     'https://bodlensesportugal.com/wp-content/uploads/2025/02/a-nossa-tecnologia.jpg',
  coatings:       'https://bodlensesportugal.com/wp-content/uploads/2025/02/os-nossas-revestimentos-.jpg',
  coloring:       'https://bodlensesportugal.com/wp-content/uploads/2025/02/as-nossas-coloracoes.jpg',
  colorSight:     'https://bodlensesportugal.com/wp-content/uploads/2025/02/color.jpg',
  opticas:        'https://bodlensesportugal.com/wp-content/uploads/2025/02/opticas.jpg',
  therapeutic:    'https://bodlensesportugal.com/wp-content/uploads/2026/03/Coloracao-Terapeutica-Novo-Banner-Person-V2.png',
  therapeuticColors: 'https://bodlensesportugal.com/wp-content/uploads/2026/03/Coloracao-Terapeutica-Cores-Disponiveis.png',
  bodStart:       'https://bodlensesportugal.com/wp-content/uploads/2026/02/LogoPrincipal-Cores-scaled.png',
  linkedin:       'https://bodlensesportugal.com/wp-content/uploads/2025/03/LinkedIn-cover.jpg',
}
