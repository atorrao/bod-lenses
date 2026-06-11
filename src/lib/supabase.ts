import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export type ContactMessage = {
  id?: string
  created_at?: string
  name: string
  optica: string
  email: string
  subject: string
  message: string
  status?: 'new' | 'read' | 'replied'
}

export type OpticaLead = {
  id?: string
  created_at?: string
  name: string
  optica: string
  email: string
  phone?: string
  city?: string
  message?: string
  interest?: 'parceria' | 'bod-start' | 'pioneiros' | 'outro'
  status?: 'new' | 'contacted' | 'converted' | 'rejected'
}

export type PriceConfig = {
  id?: string
  optica_email: string
  optica_name?: string
  prices: PriceTable
  coatings: CoatingPrices
}

export type PriceTable = {
  [lensType: string]: {
    '1.5': number
    '1.6': number
    '1.67': number
    solisII: number
  }
}

export type CoatingPrices = {
  ar: number
  uv: number
  blue: number
  foto: number
  antiriscos: number
}
