import { createClient } from '@supabase/supabase-js'

// Suporta tanto Next.js (NEXT_PUBLIC_) quanto Vite (VITE_)
const supabaseUrl =
  (typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SUPABASE_URL : undefined) ||
  process.env.NEXT_PUBLIC_SUPABASE_URL

const supabaseAnonKey =
  (typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SUPABASE_ANON_KEY : undefined) ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validar se as variáveis estão configuradas corretamente
const isValidConfig =
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  supabaseAnonKey.length > 20

// Exportar null se não estiver configurado, para evitar erros
export const supabase = isValidConfig
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null

// Types
export type PlanType = 'free' | 'basic' | 'pro'
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'trial'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan_type: PlanType
  status: SubscriptionStatus
  started_at: string
  expires_at: string | null
  cancelled_at: string | null
  created_at: string
  updated_at: string
}

export interface SleepEntry {
  id: string
  user_id: string
  baby_name: string | null
  date: string
  start_time: string
  end_time: string
  duration_hours: number | null
  mood: string | null
  notes: string | null
  created_at: string
  updated_at: string
}
