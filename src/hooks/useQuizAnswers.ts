import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface QuizAnswer {
  id: string
  quizType: string
  questionId: string
  answerValue: string
  answerData?: any
}

export function useQuizAnswers(quizType: string = 'sleep') {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (user !== null || !supabase) {
      loadAnswers()
    }
  }, [user, quizType])

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

  const loadAnswers = async () => {
    try {
      if (supabase && user) {
        const { data, error } = await supabase
          .from('quiz_answers')
          .select('*')
          .eq('quiz_type', quizType)

        if (error) throw error

        if (data) {
          const answersMap: Record<string, string> = {}
          data.forEach(answer => {
            answersMap[answer.question_id] = answer.answer_value
          })
          setAnswers(answersMap)
        }
      } else {
        const saved = localStorage.getItem('quizAnswers')
        if (saved) {
          setAnswers(JSON.parse(saved))
        }
      }
    } catch (error) {
      console.error('Erro ao carregar respostas:', error)
      const saved = localStorage.getItem('quizAnswers')
      if (saved) {
        setAnswers(JSON.parse(saved))
      }
    } finally {
      setLoading(false)
    }
  }

  const saveAnswer = async (questionId: string, answerValue: string, answerData?: any) => {
    try {
      if (supabase && user) {
        const { error } = await supabase
          .from('quiz_answers')
          .upsert({
            user_id: user.id,
            quiz_type: quizType,
            question_id: questionId,
            answer_value: answerValue,
            answer_data: answerData
          }, {
            onConflict: 'user_id,quiz_type,question_id'
          })

        if (error) throw error

        setAnswers({ ...answers, [questionId]: answerValue })
      } else {
        const updated = { ...answers, [questionId]: answerValue }
        setAnswers(updated)
        localStorage.setItem('quizAnswers', JSON.stringify(updated))
      }
    } catch (error) {
      console.error('Erro ao salvar resposta:', error)
      throw error
    }
  }

  const clearAnswers = async () => {
    try {
      if (supabase && user) {
        const { error } = await supabase
          .from('quiz_answers')
          .delete()
          .eq('quiz_type', quizType)
          .eq('user_id', user.id)

        if (error) throw error

        setAnswers({})
      } else {
        setAnswers({})
        localStorage.removeItem('quizAnswers')
      }
    } catch (error) {
      console.error('Erro ao limpar respostas:', error)
      throw error
    }
  }

  const migrateLocalDataToSupabase = async () => {
    try {
      const localData = localStorage.getItem('quizAnswers')
      if (!localData || !user || !supabase) return

      const localAnswers: Record<string, string> = JSON.parse(localData)
      const entries = Object.entries(localAnswers)
      if (entries.length === 0) return

      const { data: existingData } = await supabase
        .from('quiz_answers')
        .select('id')
        .eq('quiz_type', quizType)
        .limit(1)

      if (existingData && existingData.length > 0) {
        console.log('Respostas já existem no Supabase, pulando migração')
        localStorage.removeItem('quizAnswers')
        return
      }

      console.log(`Migrando ${entries.length} respostas para o Supabase...`)

      for (const [questionId, answerValue] of entries) {
        await supabase.from('quiz_answers').insert({
          user_id: user.id,
          quiz_type: quizType,
          question_id: questionId,
          answer_value: answerValue
        })
      }

      console.log('Migração de respostas concluída!')
      localStorage.removeItem('quizAnswers')
      await loadAnswers()
    } catch (error) {
      console.error('Erro ao migrar respostas:', error)
    }
  }

  return {
    answers,
    loading,
    user,
    saveAnswer,
    clearAnswers,
    refreshAnswers: loadAnswers
  }
}
