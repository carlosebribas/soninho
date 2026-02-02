import { createClient } from '@supabase/supabase-js'

// Cliente admin com service role key (somente para operações server-side)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

/**
 * Função para inicializar o schema do banco de dados
 * IMPORTANTE: Esta função deve ser chamada apenas uma vez, em um ambiente server-side
 */
export async function initializeDatabase() {
  if (!supabaseAdmin) {
    console.error('Supabase Admin não está configurado')
    return { success: false, error: 'Supabase Admin não configurado' }
  }

  try {
    console.log('Verificando se as tabelas existem...')

    // Verificar se a tabela sleep_entries existe
    const { data: tables, error: tableError } = await supabaseAdmin
      .from('sleep_entries')
      .select('id')
      .limit(1)

    if (!tableError) {
      console.log('✓ Tabelas já existem no banco de dados')
      return { success: true, message: 'Tabelas já existem' }
    }

    console.log('Tabelas não encontradas, inicializando banco de dados...')

    // Se chegou aqui, precisa criar as tabelas
    // Mas não podemos executar DDL via REST API
    // A solução é usar o Supabase Dashboard ou CLI

    return {
      success: false,
      error: 'Tabelas não existem. Execute a migração via CLI: npx supabase db push'
    }
  } catch (error) {
    console.error('Erro ao inicializar banco:', error)
    return { success: false, error: String(error) }
  }
}
