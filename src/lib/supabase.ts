import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Browser client (components)
export const supabase = createBrowserClient(url, anon)

// Server client (server components / route handlers)
export const supabaseServer = createClient(url, anon)

export type Profile = {
  id: string
  optica_name: string | null
  contact_name: string | null
  email: string | null
  phone: string | null
  nif: string | null
  address: string | null
  city: string | null
  postal_code: string | null
  status: 'pending' | 'approved' | 'rejected'
  prices: Record<string, Record<string, number>>
  coatings: Record<string, number>
}

export type SaleEntry = {
  id?: string
  created_at?: string
  optica_id?: string
  lens_type: string
  material: string
  quantity: number
  cost_per_pair: number
  pvp_per_pair: number
  margin_pct: number
  month: string
}
