import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface SleepAlert {
  id: string
  alertType: 'bedtime' | 'naptime' | 'wake_window' | 'custom'
  title: string
  description?: string
  alertTime: string
  daysOfWeek: string[]
  isActive: boolean
}

export function useSleepAlerts() {
  const [alerts, setAlerts] = useState<SleepAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (user !== null || !supabase) {
      loadAlerts()
    }
  }, [user])

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

  const loadAlerts = async () => {
    try {
      if (supabase && user) {
        const { data, error } = await supabase
          .from('sleep_alerts')
          .select('*')
          .order('alert_time', { ascending: true })

        if (error) throw error

        if (data) {
          const formatted: SleepAlert[] = data.map(a => ({
            id: a.id,
            alertType: a.alert_type,
            title: a.title,
            description: a.description,
            alertTime: a.alert_time,
            daysOfWeek: a.days_of_week || [],
            isActive: a.is_active
          }))
          setAlerts(formatted)
        }
      } else {
        const saved = localStorage.getItem('sleepAlerts')
        if (saved) {
          setAlerts(JSON.parse(saved))
        }
      }
    } catch (error) {
      console.error('Erro ao carregar alertas:', error)
      const saved = localStorage.getItem('sleepAlerts')
      if (saved) {
        setAlerts(JSON.parse(saved))
      }
    } finally {
      setLoading(false)
    }
  }

  const addAlert = async (alert: Omit<SleepAlert, 'id'>) => {
    try {
      if (supabase && user) {
        const { data, error } = await supabase
          .from('sleep_alerts')
          .insert({
            user_id: user.id,
            alert_type: alert.alertType,
            title: alert.title,
            description: alert.description,
            alert_time: alert.alertTime,
            days_of_week: alert.daysOfWeek,
            is_active: alert.isActive
          })
          .select()
          .single()

        if (error) throw error

        if (data) {
          const newAlert: SleepAlert = {
            id: data.id,
            alertType: data.alert_type,
            title: data.title,
            description: data.description,
            alertTime: data.alert_time,
            daysOfWeek: data.days_of_week || [],
            isActive: data.is_active
          }
          setAlerts([...alerts, newAlert])
        }
      } else {
        const newAlert: SleepAlert = {
          id: Date.now().toString(),
          ...alert
        }
        const updated = [...alerts, newAlert]
        setAlerts(updated)
        localStorage.setItem('sleepAlerts', JSON.stringify(updated))
      }
    } catch (error) {
      console.error('Erro ao adicionar alerta:', error)
      throw error
    }
  }

  const updateAlert = async (id: string, updates: Partial<SleepAlert>) => {
    try {
      if (supabase && user) {
        const updateData: any = {}
        if (updates.alertType) updateData.alert_type = updates.alertType
        if (updates.title) updateData.title = updates.title
        if (updates.description !== undefined) updateData.description = updates.description
        if (updates.alertTime) updateData.alert_time = updates.alertTime
        if (updates.daysOfWeek) updateData.days_of_week = updates.daysOfWeek
        if (updates.isActive !== undefined) updateData.is_active = updates.isActive

        const { error } = await supabase
          .from('sleep_alerts')
          .update(updateData)
          .eq('id', id)
          .eq('user_id', user.id)

        if (error) throw error

        setAlerts(alerts.map(a => a.id === id ? { ...a, ...updates } : a))
      } else {
        const updated = alerts.map(a => a.id === id ? { ...a, ...updates } : a)
        setAlerts(updated)
        localStorage.setItem('sleepAlerts', JSON.stringify(updated))
      }
    } catch (error) {
      console.error('Erro ao atualizar alerta:', error)
      throw error
    }
  }

  const deleteAlert = async (id: string) => {
    try {
      if (supabase && user) {
        const { error } = await supabase
          .from('sleep_alerts')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id)

        if (error) throw error

        setAlerts(alerts.filter(a => a.id !== id))
      } else {
        const updated = alerts.filter(a => a.id !== id)
        setAlerts(updated)
        localStorage.setItem('sleepAlerts', JSON.stringify(updated))
      }
    } catch (error) {
      console.error('Erro ao deletar alerta:', error)
      throw error
    }
  }

  const migrateLocalDataToSupabase = async () => {
    try {
      const localData = localStorage.getItem('sleepAlerts')
      if (!localData || !user || !supabase) return

      const localAlerts: SleepAlert[] = JSON.parse(localData)
      if (localAlerts.length === 0) return

      const { data: existingData } = await supabase
        .from('sleep_alerts')
        .select('id')
        .limit(1)

      if (existingData && existingData.length > 0) {
        console.log('Alertas já existem no Supabase, pulando migração')
        localStorage.removeItem('sleepAlerts')
        return
      }

      console.log(`Migrando ${localAlerts.length} alertas para o Supabase...`)

      for (const alert of localAlerts) {
        await supabase.from('sleep_alerts').insert({
          user_id: user.id,
          alert_type: alert.alertType,
          title: alert.title,
          description: alert.description,
          alert_time: alert.alertTime,
          days_of_week: alert.daysOfWeek,
          is_active: alert.isActive
        })
      }

      console.log('Migração de alertas concluída!')
      localStorage.removeItem('sleepAlerts')
      await loadAlerts()
    } catch (error) {
      console.error('Erro ao migrar alertas:', error)
    }
  }

  return {
    alerts,
    loading,
    user,
    addAlert,
    updateAlert,
    deleteAlert,
    refreshAlerts: loadAlerts
  }
}
