import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface BabyProfile {
  nome: string
  dataNascimento: string
  horaNascimento: string
  hospital: string
  cidadeNascimento: string
  nomeMae: string
  nomePai: string
  pediatra: string
  telefonePediatra: string
  hospitalReferencia: string
}

export function useBabyProfile() {
  const [profile, setProfile] = useState<BabyProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  // Verificar autenticação e carregar dados
  useEffect(() => {
    initializeData()
  }, [])

  const initializeData = async () => {
    await checkAuth()
  }

  // Carregar perfil quando o usuário mudar
  useEffect(() => {
    if (user !== null || !supabase) {
      loadProfile()
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

  const loadProfile = async () => {
    try {
      if (supabase && user) {
        // Carregar do Supabase
        const { data, error } = await supabase
          .from('baby_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (error) {
          // Se não encontrou, não é erro crítico
          if (error.code === 'PGRST116') {
            console.log('Nenhum perfil encontrado no Supabase')
            setProfile(null)
          } else {
            console.error('Erro ao carregar do Supabase:', error)
            // Se a tabela não existe, usar localStorage
            throw error
          }
        } else if (data) {
          const babyProfile: BabyProfile = {
            nome: data.nome,
            dataNascimento: data.data_nascimento,
            horaNascimento: data.hora_nascimento,
            hospital: data.hospital || '',
            cidadeNascimento: data.cidade_nascimento || '',
            nomeMae: data.nome_mae || '',
            nomePai: data.nome_pai || '',
            pediatra: data.pediatra || '',
            telefonePediatra: data.telefone_pediatra || '',
            hospitalReferencia: data.hospital_referencia || ''
          }
          setProfile(babyProfile)
        }
      } else {
        // Carregar do localStorage como fallback
        const saved = localStorage.getItem('cadastroBebe')
        if (saved) {
          setProfile(JSON.parse(saved))
        }
      }
    } catch (error) {
      console.error('Erro ao carregar perfil, usando localStorage:', error)
      // Fallback para localStorage
      const saved = localStorage.getItem('cadastroBebe')
      if (saved) {
        setProfile(JSON.parse(saved))
      }
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async (profileData: BabyProfile) => {
    try {
      if (supabase && user) {
        // Salvar no Supabase (upsert - insere ou atualiza)
        const { error } = await supabase
          .from('baby_profiles')
          .upsert({
            user_id: user.id,
            nome: profileData.nome,
            data_nascimento: profileData.dataNascimento,
            hora_nascimento: profileData.horaNascimento,
            hospital: profileData.hospital,
            cidade_nascimento: profileData.cidadeNascimento,
            nome_mae: profileData.nomeMae,
            nome_pai: profileData.nomePai,
            pediatra: profileData.pediatra,
            telefone_pediatra: profileData.telefonePediatra,
            hospital_referencia: profileData.hospitalReferencia
          }, {
            onConflict: 'user_id'
          })

        if (error) throw error

        setProfile(profileData)
      } else {
        // Salvar no localStorage
        localStorage.setItem('cadastroBebe', JSON.stringify(profileData))
        setProfile(profileData)
      }
    } catch (error) {
      console.error('Erro ao salvar perfil do bebê:', error)
      throw error
    }
  }

  const migrateLocalDataToSupabase = async () => {
    try {
      const localData = localStorage.getItem('cadastroBebe')
      if (!localData || !user || !supabase) return

      const localProfile: BabyProfile = JSON.parse(localData)

      // Verificar se já existe perfil no Supabase
      const { data: existingData } = await supabase
        .from('baby_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      // Se já tem dados no Supabase, não migrar (evitar sobrescrever)
      if (existingData) {
        console.log('Perfil já existe no Supabase, pulando migração')
        // Limpar localStorage após confirmar que tem no Supabase
        localStorage.removeItem('cadastroBebe')
        return
      }

      console.log('Migrando perfil do bebê para o Supabase...')

      // Migrar dados
      await saveProfile(localProfile)

      console.log('Migração do perfil concluída com sucesso!')

      // Limpar localStorage após migração bem-sucedida
      localStorage.removeItem('cadastroBebe')

      // Recarregar dados do Supabase
      await loadProfile()
    } catch (error) {
      console.error('Erro ao migrar perfil:', error)
      // Não joga erro para não bloquear o app
    }
  }

  return {
    profile,
    loading,
    user,
    saveProfile,
    refreshProfile: loadProfile
  }
}
