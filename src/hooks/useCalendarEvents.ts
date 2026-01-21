import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface CalendarEvent {
  id: string
  tipo: 'consulta' | 'vacina' | 'outro'
  titulo: string
  data: string
  hora: string
  observacoes: string
  alertas: {
    tresDias: boolean
    umDia: boolean
    umaHora: boolean
  }
  isPredefinido?: boolean
}

export function useCalendarEvents() {
  const [eventos, setEventos] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  // Verificar autenticação
  useEffect(() => {
    checkAuth()
  }, [])

  // Carregar eventos quando o usuário mudar
  useEffect(() => {
    if (user !== null || !supabase) {
      loadEvents()
    }
  }, [user])

  // Migrar dados do localStorage para Supabase quando usuário logar
  useEffect(() => {
    if (user && supabase) {
      migrateLocalEventsToSupabase()
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

  const loadEvents = async () => {
    try {
      if (supabase && user) {
        // Carregar do Supabase
        const { data, error } = await supabase
          .from('calendar_events')
          .select('*')
          .eq('user_id', user.id)
          .order('data', { ascending: true })

        if (error) throw error

        if (data) {
          const events: CalendarEvent[] = data.map(event => ({
            id: event.id,
            tipo: event.tipo,
            titulo: event.titulo,
            data: event.data,
            hora: event.hora,
            observacoes: event.observacoes || '',
            alertas: {
              tresDias: event.alerta_tres_dias,
              umDia: event.alerta_um_dia,
              umaHora: event.alerta_uma_hora
            },
            isPredefinido: event.is_predefinido
          }))
          setEventos(events)
        }
      } else {
        // Carregar do localStorage como fallback
        const saved = localStorage.getItem('eventosAgenda')
        if (saved) {
          setEventos(JSON.parse(saved))
        }
      }
    } catch (error) {
      console.error('Erro ao carregar eventos:', error)
      // Fallback para localStorage
      const saved = localStorage.getItem('eventosAgenda')
      if (saved) {
        setEventos(JSON.parse(saved))
      }
    } finally {
      setLoading(false)
    }
  }

  const saveEvent = async (evento: Omit<CalendarEvent, 'id'>) => {
    try {
      if (supabase && user) {
        // Salvar no Supabase
        const { data, error } = await supabase
          .from('calendar_events')
          .insert({
            user_id: user.id,
            tipo: evento.tipo,
            titulo: evento.titulo,
            data: evento.data,
            hora: evento.hora,
            observacoes: evento.observacoes,
            alerta_tres_dias: evento.alertas.tresDias,
            alerta_um_dia: evento.alertas.umDia,
            alerta_uma_hora: evento.alertas.umaHora,
            is_predefinido: evento.isPredefinido || false
          })
          .select()
          .single()

        if (error) throw error

        // Adicionar evento na lista local
        if (data) {
          const newEvent: CalendarEvent = {
            id: data.id,
            tipo: data.tipo,
            titulo: data.titulo,
            data: data.data,
            hora: data.hora,
            observacoes: data.observacoes || '',
            alertas: {
              tresDias: data.alerta_tres_dias,
              umDia: data.alerta_um_dia,
              umaHora: data.alerta_uma_hora
            },
            isPredefinido: data.is_predefinido
          }
          setEventos(prev => [...prev, newEvent])
          return newEvent
        }
      } else {
        // Salvar no localStorage
        const newEvent: CalendarEvent = {
          ...evento,
          id: Date.now().toString()
        }
        const updatedEvents = [...eventos, newEvent]
        setEventos(updatedEvents)
        localStorage.setItem('eventosAgenda', JSON.stringify(updatedEvents))
        return newEvent
      }
    } catch (error) {
      console.error('Erro ao salvar evento:', error)
      throw error
    }
  }

  const saveMultipleEvents = async (eventosNovos: Omit<CalendarEvent, 'id'>[]) => {
    try {
      if (supabase && user) {
        // Salvar múltiplos eventos no Supabase
        const eventsToInsert = eventosNovos.map(evento => ({
          user_id: user.id,
          tipo: evento.tipo,
          titulo: evento.titulo,
          data: evento.data,
          hora: evento.hora,
          observacoes: evento.observacoes,
          alerta_tres_dias: evento.alertas.tresDias,
          alerta_um_dia: evento.alertas.umDia,
          alerta_uma_hora: evento.alertas.umaHora,
          is_predefinido: evento.isPredefinido || false
        }))

        const { data, error } = await supabase
          .from('calendar_events')
          .insert(eventsToInsert)
          .select()

        if (error) throw error

        // Recarregar todos os eventos
        await loadEvents()
      } else {
        // Salvar no localStorage
        const newEvents: CalendarEvent[] = eventosNovos.map(evento => ({
          ...evento,
          id: `${Date.now()}-${Math.random()}`
        }))
        const updatedEvents = [...eventos, ...newEvents]
        setEventos(updatedEvents)
        localStorage.setItem('eventosAgenda', JSON.stringify(updatedEvents))
      }
    } catch (error) {
      console.error('Erro ao salvar múltiplos eventos:', error)
      throw error
    }
  }

  const deleteEvent = async (id: string) => {
    try {
      if (supabase && user) {
        // Deletar do Supabase
        const { error } = await supabase
          .from('calendar_events')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id)

        if (error) throw error

        // Remover da lista local
        setEventos(prev => prev.filter(e => e.id !== id))
      } else {
        // Deletar do localStorage
        const updatedEvents = eventos.filter(e => e.id !== id)
        setEventos(updatedEvents)
        localStorage.setItem('eventosAgenda', JSON.stringify(updatedEvents))
      }
    } catch (error) {
      console.error('Erro ao deletar evento:', error)
      throw error
    }
  }

  const regenerateAutomaticEvents = async (dataNascimento: string, eventosExistentes: CalendarEvent[]) => {
    try {
      if (supabase && user) {
        // Deletar apenas eventos predefinidos
        const { error } = await supabase
          .from('calendar_events')
          .delete()
          .eq('user_id', user.id)
          .eq('is_predefinido', true)

        if (error) throw error

        // Filtrar eventos do usuário localmente
        setEventos(prev => prev.filter(e => !e.isPredefinido))
      } else {
        // Filtrar no localStorage
        const eventosUsuario = eventosExistentes.filter(e => !e.isPredefinido)
        setEventos(eventosUsuario)
        localStorage.setItem('eventosAgenda', JSON.stringify(eventosUsuario))
      }
    } catch (error) {
      console.error('Erro ao regenerar eventos automáticos:', error)
      throw error
    }
  }

  const migrateLocalEventsToSupabase = async () => {
    try {
      const localData = localStorage.getItem('eventosAgenda')
      if (!localData || !user || !supabase) return

      const localEvents: CalendarEvent[] = JSON.parse(localData)
      if (localEvents.length === 0) return

      // Verificar se já existem eventos no Supabase
      const { data: existingData, count } = await supabase
        .from('calendar_events')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)

      // Se já tem eventos no Supabase, não migrar (evitar duplicação)
      if (count && count > 0) {
        console.log('Eventos já existem no Supabase, pulando migração')
        localStorage.removeItem('eventosAgenda')
        localStorage.removeItem('eventosPredefinidosGerados')
        return
      }

      console.log('Migrando eventos para o Supabase...')

      // Migrar eventos
      await saveMultipleEvents(localEvents)

      console.log('Migração de eventos concluída com sucesso!')

      // Limpar localStorage após migração bem-sucedida
      localStorage.removeItem('eventosAgenda')
      localStorage.removeItem('eventosPredefinidosGerados')
    } catch (error) {
      console.error('Erro ao migrar eventos:', error)
      // Não joga erro para não bloquear o app
    }
  }

  return {
    eventos,
    loading,
    user,
    saveEvent,
    saveMultipleEvents,
    deleteEvent,
    regenerateAutomaticEvents,
    refreshEvents: loadEvents
  }
}
