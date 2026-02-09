'use client'

import { Moon, Bell, TrendingUp, BookOpen, Users, Calendar, Baby, Sparkles, Crown, Check } from 'lucide-react'

export default function PromoCard() {
  const features = [
    { icon: Baby, text: 'Cadastro completo do bebê' },
    { icon: Moon, text: 'Diário de sono inteligente' },
    { icon: Bell, text: 'Alertas personalizados' },
    { icon: Calendar, text: 'Agenda de consultas e vacinas' },
    { icon: TrendingUp, text: 'Relatórios e estatísticas' },
    { icon: BookOpen, text: 'Dicas de especialistas' },
    { icon: Users, text: 'Comunidade de pais' },
    { icon: Sparkles, text: 'Recomendações com IA' }
  ]

  const plans = [
    {
      name: 'Free',
      description: 'Para começar',
      features: ['Diário básico', 'Alertas simples', 'Agenda']
    },
    {
      name: 'Basic',
      price: 'R$ 19,90',
      description: 'Para famílias ativas',
      features: ['Tudo do Free', 'Relatórios completos', 'Histórico ilimitado'],
      popular: false
    },
    {
      name: 'Pro',
      price: 'R$ 39,90',
      description: 'Experiência completa',
      features: ['Tudo do Basic', 'Recomendações IA', 'Comunidade Premium', 'Suporte prioritário'],
      popular: true
    }
  ]

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-card rounded-2xl shadow-2xl border border-border">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center gap-3 mb-4">
          <Moon className="w-16 h-16 text-blue-600 dark:text-blue-400" />
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
            SONINHO
          </h1>
        </div>
        <p className="text-2xl text-muted-foreground mb-3">
          Gerenciador Inteligente de Cochilos
        </p>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          O app que transforma a rotina de sono do seu bebê em dados inteligentes,
          ajudando você a tomar as melhores decisões para o desenvolvimento saudável.
        </p>
      </div>

      {/* Features Grid */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold text-center mb-6 text-foreground">
          ✨ Recursos Principais
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <Icon className="w-10 h-10 text-blue-600 dark:text-blue-400 mb-2" />
                <p className="text-sm font-medium text-foreground">{feature.text}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-center mb-6 text-foreground">
          💎 Planos que Cabem no seu Bolso
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative p-6 rounded-2xl border-2 transition-all hover:scale-105 ${
                plan.popular
                  ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30'
                  : 'border-border bg-card'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold rounded-full flex items-center gap-1">
                  <Crown className="w-4 h-4" />
                  Mais Popular
                </div>
              )}

              <div className="text-center mb-4">
                <h3 className="text-2xl font-bold text-foreground mb-1">{plan.name}</h3>
                {plan.price && (
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                    {plan.price}
                    <span className="text-sm text-muted-foreground">/mês</span>
                  </div>
                )}
                {!plan.price && (
                  <div className="text-3xl font-bold text-muted-foreground mb-1">
                    Grátis
                  </div>
                )}
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <ul className="space-y-3">
                {plan.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl p-8 mb-8">
        <h2 className="text-2xl font-semibold text-center mb-6 text-foreground">
          🎯 Por que escolher o SONINHO?
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-400 flex items-center justify-center text-white flex-shrink-0">
              1
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Controle Total</h3>
              <p className="text-sm text-muted-foreground">
                Registre horários de sono, sonecas e padrões de forma simples e visual
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-600 dark:bg-purple-400 flex items-center justify-center text-white flex-shrink-0">
              2
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Inteligência Artificial</h3>
              <p className="text-sm text-muted-foreground">
                Receba recomendações personalizadas baseadas nos dados do seu bebê
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-pink-600 dark:bg-pink-400 flex items-center justify-center text-white flex-shrink-0">
              3
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Comunidade Ativa</h3>
              <p className="text-sm text-muted-foreground">
                Compartilhe experiências e aprenda com outros pais na mesma jornada
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 dark:bg-indigo-400 flex items-center justify-center text-white flex-shrink-0">
              4
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Acesso Multiplataforma</h3>
              <p className="text-sm text-muted-foreground">
                Use no celular, tablet ou computador. Dados sempre sincronizados
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center">
        <div className="inline-flex flex-col items-center gap-4 p-8 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 rounded-2xl text-white">
          <Sparkles className="w-12 h-12" />
          <h3 className="text-2xl font-bold">Comece Grátis Hoje!</h3>
          <p className="text-white/90 max-w-md">
            Experimente todos os recursos básicos sem compromisso.
            Faça upgrade quando estiver pronto.
          </p>
          <button className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-full hover:bg-gray-100 transition-colors shadow-lg">
            Criar Conta Grátis
          </button>
          <p className="text-sm text-white/70">
            💡 Não precisa cartão de crédito
          </p>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="mt-8 pt-8 border-t border-border">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">10k+</div>
            <div className="text-sm text-muted-foreground">Famílias Ativas</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">50k+</div>
            <div className="text-sm text-muted-foreground">Sonos Registrados</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-pink-600 dark:text-pink-400">4.9⭐</div>
            <div className="text-sm text-muted-foreground">Avaliação dos Pais</div>
          </div>
        </div>
      </div>
    </div>
  )
}
