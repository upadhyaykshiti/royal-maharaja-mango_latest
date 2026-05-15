import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Order = {
  id?: string
  created_at?: string
  customer_name: string
  customer_email: string
  customer_phone: string
  delivery_address: string
  city: string
  postal_code: string
  kesar_qty: number
  alphonso_qty: number
  total_amount: number
  delivery_date: string
  special_instructions?: string
  status?: string
}
