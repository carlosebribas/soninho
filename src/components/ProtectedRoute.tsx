'use client'

import { useAuth } from '@/hooks/useAuth'
import { PlanType } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Lock, Zap, ArrowRight } from 'lucide-react'
import { Button } from './ui/button'
import { Card } from './ui/card'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPlan?: PlanType
  featureName?: string
}

export function ProtectedRoute({ children, requiredPlan = 'basic', featureName = 'esta funcionalidade' }: ProtectedRouteProps) {
  const { isAuthenticated, hasAccess, planType, loading } = useAuth()
  const router = useRouter()
  const [showUpgrade, setShowUpgrade] = useState(false)

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push('/auth')
      } else if (!hasAccess(requiredPlan)) {
        setShowUpgrade(true)
      }
    }
  }, [isAuthenticated, loading, hasAccess, requiredPlan, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Redirecionando para login
  }

  if (showUpgrade) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="max-w-2xl w-full p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Funcionalidade Premium
            </h1>
            <p className="text-gray-600">
              {featureName} está disponível apenas no plano Pro
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-4 mb-4">
              <Zap className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Desbloqueie todo o potencial do SONINHO
                </h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                    Recomendações personalizadas com IA
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                    Análises avançadas e insights detalhados
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                    Exportação de dados (CSV e PDF)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-purple-600 rounded-full"></div>
                    Acesso à comunidade premium
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-amber-800">
              <strong>Seu plano atual:</strong> {planType === 'free' ? 'Gratuito' : planType === 'basic' ? 'Básico' : 'Pro'}
            </p>
          </div>

          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => router.push('/')}
              className="flex-1"
            >
              Voltar ao início
            </Button>
            <Button
              onClick={() => router.push('/checkout')}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              Fazer Upgrade
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
