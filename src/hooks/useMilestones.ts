import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface Milestone {
  id: string
  milestoneType: 'motor' | 'cognitive' | 'social' | 'language'
  title: string
  description?: string
  expectedAgeMonths?: number
  achievedDate?: string
  notes?: string
  isAchieved: boolean
}

export function useMilestones() {
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (user !== null || !supabase) {
      loadMilestones()
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

  const loadMilestones = async () => {
    try {
      if (supabase && user) {
        const { data, error } = await supabase
          .from('development_milestones')
          .select('*')
          .order('expected_age_months', { ascending: true })

        if (error) throw error

        if (data) {
          const formatted: Milestone[] = data.map(m => ({
            id: m.id,
            milestoneType: m.milestone_type,
            title: m.title,
            description: m.description,
            expectedAgeMonths: m.expected_age_months,
            achievedDate: m.achieved_date,
            notes: m.notes,
            isAchieved: m.is_achieved
          }))
          setMilestones(formatted)
        }
      } else {
        // Fallback para localStorage
        const saved = localStorage.getItem('developmentMilestones')
        if (saved) {
          setMilestones(JSON.parse(saved))
        }
      }
    } catch (error) {
      console.error('Erro ao carregar marcos:', error)
      const saved = localStorage.getItem('developmentMilestones')
      if (saved) {
        setMilestones(JSON.parse(saved))
      }
    } finally {
      setLoading(false)
    }
  }

  const addMilestone = async (milestone: Omit<Milestone, 'id'>) => {
    try {
      if (supabase && user) {
        const { data, error } = await supabase
          .from('development_milestones')
          .insert({
            user_id: user.id,
            milestone_type: milestone.milestoneType,
            title: milestone.title,
            description: milestone.description,
            expected_age_months: milestone.expectedAgeMonths,
            achieved_date: milestone.achievedDate,
            notes: milestone.notes,
            is_achieved: milestone.isAchieved
          })
          .select()
          .single()

        if (error) throw error

        if (data) {
          const newMilestone: Milestone = {
            id: data.id,
            milestoneType: data.milestone_type,
            title: data.title,
            description: data.description,
            expectedAgeMonths: data.expected_age_months,
            achievedDate: data.achieved_date,
            notes: data.notes,
            isAchieved: data.is_achieved
          }
          setMilestones([...milestones, newMilestone])
        }
      } else {
        const newMilestone: Milestone = {
          id: Date.now().toString(),
          ...milestone
        }
        const updated = [...milestones, newMilestone]
        setMilestones(updated)
        localStorage.setItem('developmentMilestones', JSON.stringify(updated))
      }
    } catch (error) {
      console.error('Erro ao adicionar marco:', error)
      throw error
    }
  }

  const updateMilestone = async (id: string, updates: Partial<Milestone>) => {
    try {
      if (supabase && user) {
        const updateData: any = {}
        if (updates.milestoneType) updateData.milestone_type = updates.milestoneType
        if (updates.title) updateData.title = updates.title
        if (updates.description !== undefined) updateData.description = updates.description
        if (updates.expectedAgeMonths !== undefined) updateData.expected_age_months = updates.expectedAgeMonths
        if (updates.achievedDate !== undefined) updateData.achieved_date = updates.achievedDate
        if (updates.notes !== undefined) updateData.notes = updates.notes
        if (updates.isAchieved !== undefined) updateData.is_achieved = updates.isAchieved

        const { error } = await supabase
          .from('development_milestones')
          .update(updateData)
          .eq('id', id)
          .eq('user_id', user.id)

        if (error) throw error

        setMilestones(milestones.map(m => m.id === id ? { ...m, ...updates } : m))
      } else {
        const updated = milestones.map(m => m.id === id ? { ...m, ...updates } : m)
        setMilestones(updated)
        localStorage.setItem('developmentMilestones', JSON.stringify(updated))
      }
    } catch (error) {
      console.error('Erro ao atualizar marco:', error)
      throw error
    }
  }

  const deleteMilestone = async (id: string) => {
    try {
      if (supabase && user) {
        const { error } = await supabase
          .from('development_milestones')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id)

        if (error) throw error

        setMilestones(milestones.filter(m => m.id !== id))
      } else {
        const updated = milestones.filter(m => m.id !== id)
        setMilestones(updated)
        localStorage.setItem('developmentMilestones', JSON.stringify(updated))
      }
    } catch (error) {
      console.error('Erro ao deletar marco:', error)
      throw error
    }
  }

  const migrateLocalDataToSupabase = async () => {
    try {
      const localData = localStorage.getItem('developmentMilestones')
      if (!localData || !user || !supabase) return

      const localMilestones: Milestone[] = JSON.parse(localData)
      if (localMilestones.length === 0) return

      const { data: existingData } = await supabase
        .from('development_milestones')
        .select('id')
        .limit(1)

      if (existingData && existingData.length > 0) {
        console.log('Marcos já existem no Supabase, pulando migração')
        localStorage.removeItem('developmentMilestones')
        return
      }

      console.log(`Migrando ${localMilestones.length} marcos para o Supabase...`)

      for (const milestone of localMilestones) {
        await supabase.from('development_milestones').insert({
          user_id: user.id,
          milestone_type: milestone.milestoneType,
          title: milestone.title,
          description: milestone.description,
          expected_age_months: milestone.expectedAgeMonths,
          achieved_date: milestone.achievedDate,
          notes: milestone.notes,
          is_achieved: milestone.isAchieved
        })
      }

      console.log('Migração de marcos concluída!')
      localStorage.removeItem('developmentMilestones')
      await loadMilestones()
    } catch (error) {
      console.error('Erro ao migrar marcos:', error)
    }
  }

  return {
    milestones,
    loading,
    user,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    refreshMilestones: loadMilestones
  }
}
