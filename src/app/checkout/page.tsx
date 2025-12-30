'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Star, Zap, Shield, Clock, ArrowLeft, CreditCard, Lock, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

interface Plan {
  id: string
  name: string
  price: number
  originalPrice?: number
  period: string
  badge?: string
  badgeColor?: string
  features: string[]
  popular?: boolean
  icon: React.ElementType
}

const plans: Plan[] = [
  {
    id: 'basic',
    name: 'Básico',
    price: 19.90,
    period: 'mês',
    icon: Clock,
    features: [
      'Registro ilimitado de sonecas',
      'Alertas personalizados',
      'Relatórios básicos',
      'Suporte por email'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 34.90,
    originalPrice: 49.90,
    period: 'mês',
    badge: 'MAIS POPULAR',
    badgeColor: 'bg-gradient-to-r from-purple-600 to-pink-600',
    icon: Zap,
    popular: true,
    features: [
      'Tudo do plano Básico',
      'Recomendações personalizadas com IA',
      'Análises avançadas e insights',
      'Múltiplos bebês',
      'Exportação de dados',
      'Suporte prioritário',
      'Acesso à comunidade premium'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 54.90,
    originalPrice: 79.90,
    period: 'mês',
    badge: 'MELHOR VALOR',
    badgeColor: 'bg-gradient-to-r from-amber-500 to-orange-600',
    icon: Sparkles,
    features: [
      'Tudo do plano Pro',
      'Consultoria 1-1 com especialista',
      'Plano de sono personalizado',
      'Relatórios semanais detalhados',
      'Acesso antecipado a novos recursos',
      'Suporte 24/7',
      'Garantia de satisfação de 30 dias'
    ]
  }
]

export default function CheckoutPage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState<string>('pro')
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string> | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('quizAnswers')
    if (stored) {
      setQuizAnswers(JSON.parse(stored))
    }
  }, [])

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulação de processamento
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Aqui você integraria com um gateway de pagamento real
    alert('Pagamento processado com sucesso! 🎉')
    router.push('/diario')
  }

  const selectedPlanData = plans.find(p => p.id === selectedPlan)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>

          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Escolha seu Plano
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Comece sua jornada para noites mais tranquilas
            </p>
          </div>
        </div>

        {/* Personalized Message */}
        {quizAnswers && (
          <Card className="p-4 mb-8 border-indigo-200 dark:border-indigo-800 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white mb-1">
                  Recomendação Personalizada
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Baseado nas suas respostas, o plano <span className="font-bold">Pro</span> é ideal para suas necessidades!
                </p>
              </div>
            </div>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Plans Section */}
          <div className="lg:col-span-2">
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              {plans.map((plan) => {
                const Icon = plan.icon
                return (
                  <Card
                    key={plan.id}
                    className={`relative p-6 cursor-pointer transition-all duration-200 ${
                      selectedPlan === plan.id
                        ? 'border-2 border-indigo-500 dark:border-indigo-400 shadow-lg scale-105'
                        : 'border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md'
                    } ${plan.popular ? 'ring-2 ring-indigo-200 dark:ring-indigo-800' : ''}`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {plan.badge && (
                      <Badge className={`absolute -top-3 left-1/2 -translate-x-1/2 ${plan.badgeColor} text-white border-none text-xs px-3`}>
                        {plan.badge}
                      </Badge>
                    )}

                    <div className="text-center">
                      <div className="flex justify-center mb-3">
                        <div className={`p-2 rounded-full ${
                          selectedPlan === plan.id
                            ? 'bg-indigo-100 dark:bg-indigo-900'
                            : 'bg-gray-100 dark:bg-gray-800'
                        }`}>
                          <Icon className={`w-5 h-5 ${
                            selectedPlan === plan.id
                              ? 'text-indigo-600 dark:text-indigo-400'
                              : 'text-gray-600 dark:text-gray-400'
                          }`} />
                        </div>
                      </div>

                      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                        {plan.name}
                      </h3>

                      <div className="mb-3">
                        {plan.originalPrice && (
                          <span className="text-sm text-gray-500 line-through mr-2">
                            R$ {plan.originalPrice.toFixed(2)}
                          </span>
                        )}
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">
                          R$ {plan.price.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          por {plan.period}
                        </div>
                      </div>

                      <div className="space-y-2 text-left text-sm">
                        {plan.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedPlan === plan.id && (
                      <div className="absolute top-4 right-4">
                        <div className="w-6 h-6 bg-indigo-600 dark:bg-indigo-400 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <Card className="p-4 text-center border-none shadow-sm bg-white/50 dark:bg-gray-800/50">
                <Shield className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-gray-900 dark:text-white">
                  Pagamento Seguro
                </p>
              </Card>
              <Card className="p-4 text-center border-none shadow-sm bg-white/50 dark:bg-gray-800/50">
                <Star className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                <p className="text-xs font-semibold text-gray-900 dark:text-white">
                  4.9/5 Avaliação
                </p>
              </Card>
              <Card className="p-4 text-center border-none shadow-sm bg-white/50 dark:bg-gray-800/50">
                <Zap className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-gray-900 dark:text-white">
                  Acesso Imediato
                </p>
              </Card>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-8 shadow-xl border-none bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Finalizar Pagamento
              </h3>

              {selectedPlanData && (
                <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-950 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {selectedPlanData.name}
                    </span>
                    <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      R$ {selectedPlanData.price.toFixed(2)}
                    </span>
                  </div>
                  {selectedPlanData.originalPrice && (
                    <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-none">
                      Economize R$ {(selectedPlanData.originalPrice - selectedPlanData.price).toFixed(2)}
                    </Badge>
                  )}
                </div>
              )}

              <form onSubmit={handleCheckout} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    placeholder="João Silva"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="joao@exemplo.com"
                    required
                    className="mt-1"
                  />
                </div>

                <Separator className="my-4" />

                <div>
                  <Label htmlFor="card">Número do Cartão</Label>
                  <div className="relative">
                    <Input
                      id="card"
                      placeholder="1234 5678 9012 3456"
                      required
                      className="mt-1 pl-10"
                    />
                    <CreditCard className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 mt-0.5" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry">Validade</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/AA"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      required
                      maxLength={3}
                      className="mt-1"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-6 text-lg"
                  disabled={loading}
                >
                  {loading ? (
                    'Processando...'
                  ) : (
                    <>
                      <Lock className="w-5 h-5 mr-2" />
                      Confirmar Pagamento
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-gray-600 dark:text-gray-400 mt-4">
                  Pagamento seguro e criptografado. Cancele a qualquer momento.
                </p>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
