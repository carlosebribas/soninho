import { useState, useEffect } from 'react'
import { supabase, Profile, Subscription, PlanType } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  profile: Profile | null
  subscription: Subscription | null
  loading: boolean
  isAuthenticated: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    subscription: null,
    loading: true,
    isAuthenticated: false
  })

  useEffect(() => {
    if (!supabase) {
      setAuthState(prev => ({ ...prev, loading: false }))
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserData(session.user)
      } else {
        setAuthState({
          user: null,
          profile: null,
          subscription: null,
          loading: false,
          isAuthenticated: false
        })
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserData(session.user)
      } else {
        setAuthState({
          user: null,
          profile: null,
          subscription: null,
          loading: false,
          isAuthenticated: false
        })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserData = async (user: User) => {
    try {
      // Fetch profile
      const { data: profile } = await supabase!
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      // Fetch subscription
      const { data: subscription } = await supabase!
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()

      setAuthState({
        user,
        profile: profile || null,
        subscription: subscription || null,
        loading: false,
        isAuthenticated: true
      })
    } catch (error) {
      console.error('Error fetching user data:', error)
      setAuthState(prev => ({ ...prev, loading: false }))
    }
  }

  const signIn = async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase not configured')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
    return data
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    if (!supabase) throw new Error('Supabase not configured')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    })

    if (error) throw error
    return data
  }

  const signOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
  }

  const updateSubscription = async (planType: PlanType) => {
    if (!supabase || !authState.user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('subscriptions')
      .update({ plan_type: planType, updated_at: new Date().toISOString() })
      .eq('user_id', authState.user.id)
      .select()
      .single()

    if (error) throw error

    // Update local state
    setAuthState(prev => ({
      ...prev,
      subscription: data
    }))

    return data
  }

  const hasAccess = (requiredPlan: PlanType): boolean => {
    if (!authState.isAuthenticated || !authState.subscription) return false

    const planHierarchy: Record<PlanType, number> = {
      free: 0,
      basic: 1,
      pro: 2
    }

    const userPlanLevel = planHierarchy[authState.subscription.plan_type]
    const requiredLevel = planHierarchy[requiredPlan]

    return userPlanLevel >= requiredLevel
  }

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    updateSubscription,
    hasAccess,
    planType: authState.subscription?.plan_type || 'free'
  }
}
