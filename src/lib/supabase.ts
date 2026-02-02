import { createClient } from '@supabase/supabase-js'

// Variáveis de ambiente do Next.js (com fallback para Vite)
// Para Next.js: process.env.NEXT_PUBLIC_*
// Para Vite: process.env.VITE_* (disponível via build)
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  ''
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  ''

// Validar se as variáveis estão configuradas corretamente
const isValidConfig =
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  supabaseAnonKey.length > 20

// Exportar null se não estiver configurado, para evitar erros
export const supabase = isValidConfig
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'soninho-auth-token', // chave única para evitar conflitos
        storage: typeof window !== 'undefined' ? window.localStorage : undefined
      }
    })
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
