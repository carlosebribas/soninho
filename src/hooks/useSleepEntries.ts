import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface SleepEntry {
  id: string
  date: string
  startTime: string
  endTime: string | null
  notes: string
  moodBefore?: string
  moodAfter?: string
  type: 'sono' | 'soneca'
  isPending: boolean
}

export function useSleepEntries() {
  const [entries, setEntries] = useState<SleepEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  // Verificar autenticação e carregar dados
  useEffect(() => {
    initializeData()
  }, [])

  const initializeData = async () => {
    await checkAuth()
  }

  // Carregar entradas quando o usuário mudar
  useEffect(() => {
    if (user !== null || !supabase) {
      loadEntries()
    }
  }, [user])

  // Migrar dados do localStorage para Supabase quando usuário logar
  useEffect(() => {
    if (user && supabase) {
      migrateLocalDataToSupabase()
    }
  }, [user])

  const checkAuth = async () => {
    if (!supabase) {
      setLoading(false)
      return
    }

    const { data: { session } } = await supabase.auth.getSession()
    setUser(session?.user ?? null)
  }

  const loadEntries = async () => {
    try {
      if (supabase && user) {
        // Carregar do Supabase
        const { data, error } = await supabase
          .from('sleep_entries')
          .select('*')
          .order('date', { ascending: false })
          .order('start_time', { ascending: false })

        if (error) throw error

        if (data) {
          const formattedEntries: SleepEntry[] = data.map(entry => ({
            id: entry.id,
            date: entry.date,
            startTime: entry.start_time,
            endTime: entry.end_time,
            notes: entry.notes || '',
            moodBefore: entry.mood_before,
            moodAfter: entry.mood_after,
            type: entry.type as 'sono' | 'soneca',
            isPending: entry.is_pending
          }))
          setEntries(formattedEntries)
        }
      } else {
        // Carregar do localStorage como fallback
        const saved = localStorage.getItem('sleepDiary')
        if (saved) {
          setEntries(JSON.parse(saved))
        }
      }
    } catch (error) {
      console.error('Erro ao carregar registros:', error)
      // Fallback para localStorage
      const saved = localStorage.getItem('sleepDiary')
      if (saved) {
        setEntries(JSON.parse(saved))
      }
    } finally {
      setLoading(false)
    }
  }

  const addEntry = async (entry: Omit<SleepEntry, 'id'>) => {
    try {
      if (supabase && user) {
        // Salvar no Supabase
        const { data, error } = await supabase
          .from('sleep_entries')
          .insert({
            user_id: user.id,
            date: entry.date,
            start_time: entry.startTime,
            end_time: entry.endTime,
            notes: entry.notes,
            mood_before: entry.moodBefore,
            mood_after: entry.moodAfter,
            type: entry.type,
            is_pending: entry.isPending
          })
          .select()
          .single()

        if (error) throw error

        if (data) {
          const newEntry: SleepEntry = {
            id: data.id,
            date: data.date,
            startTime: data.start_time,
            endTime: data.end_time,
            notes: data.notes || '',
            moodBefore: data.mood_before,
            moodAfter: data.mood_after,
            type: data.type,
            isPending: data.is_pending
          }
          setEntries([newEntry, ...entries])
        }
      } else {
        // Salvar no localStorage
        const newEntry: SleepEntry = {
          id: Date.now().toString(),
          ...entry
        }
        const updated = [newEntry, ...entries]
        setEntries(updated)
        localStorage.setItem('sleepDiary', JSON.stringify(updated))
      }
    } catch (error) {
      console.error('Erro ao adicionar registro:', error)
      throw error
    }
  }

  const updateEntry = async (id: string, updates: Partial<SleepEntry>) => {
    try {
      if (supabase && user) {
        // Atualizar no Supabase
        const { error } = await supabase
          .from('sleep_entries')
          .update({
            end_time: updates.endTime,
            mood_after: updates.moodAfter,
            notes: updates.notes,
            is_pending: updates.isPending
          })
          .eq('id', id)
          .eq('user_id', user.id)

        if (error) throw error

        setEntries(entries.map(entry =>
          entry.id === id ? { ...entry, ...updates } : entry
        ))
      } else {
        // Atualizar no localStorage
        const updated = entries.map(entry =>
          entry.id === id ? { ...entry, ...updates } : entry
        )
        setEntries(updated)
        localStorage.setItem('sleepDiary', JSON.stringify(updated))
      }
    } catch (error) {
      console.error('Erro ao atualizar registro:', error)
      throw error
    }
  }

  const deleteEntry = async (id: string) => {
    try {
      if (supabase && user) {
        // Deletar do Supabase
        const { error } = await supabase
          .from('sleep_entries')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id)

        if (error) throw error

        setEntries(entries.filter(entry => entry.id !== id))
      } else {
        // Deletar do localStorage
        const updated = entries.filter(entry => entry.id !== id)
        setEntries(updated)
        localStorage.setItem('sleepDiary', JSON.stringify(updated))
      }
    } catch (error) {
      console.error('Erro ao deletar registro:', error)
      throw error
    }
  }

  const migrateLocalDataToSupabase = async () => {
    try {
      const localData = localStorage.getItem('sleepDiary')
      if (!localData || !user || !supabase) return

      const localEntries: SleepEntry[] = JSON.parse(localData)
      if (localEntries.length === 0) return

      // Verificar se já existem dados no Supabase
      const { data: existingData } = await supabase
        .from('sleep_entries')
        .select('id')
        .limit(1)

      // Se já tem dados no Supabase, não migrar (evitar duplicação)
      if (existingData && existingData.length > 0) {
        console.log('Dados já existem no Supabase, pulando migração')
        return
      }

      console.log(`Migrando ${localEntries.length} registros para o Supabase...`)

      // Migrar cada entrada
      for (const entry of localEntries) {
        await supabase.from('sleep_entries').insert({
          user_id: user.id,
          date: entry.date,
          start_time: entry.startTime,
          end_time: entry.endTime,
          notes: entry.notes,
          mood_before: entry.moodBefore,
          mood_after: entry.moodAfter,
          type: entry.type,
          is_pending: entry.isPending
        })
      }

      console.log('Migração concluída com sucesso!')

      // Limpar localStorage após migração bem-sucedida
      localStorage.removeItem('sleepDiary')

      // Recarregar dados do Supabase
      await loadEntries()
    } catch (error) {
      console.error('Erro ao migrar dados:', error)
      // Não joga erro para não bloquear o app
    }
  }

  return {
    entries,
    loading,
    user,
    addEntry,
    updateEntry,
    deleteEntry,
    refreshEntries: loadEntries
  }
}
