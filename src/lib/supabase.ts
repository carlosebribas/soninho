import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

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
