import Link from 'next/link'
import { Moon, Bell, TrendingUp, BookOpen, Users, History, Settings, Baby, Calendar, LogIn, Sparkles } from 'lucide-react'

export default function Home() {
  const features = [
    {
      href: '/quiz',
      icon: Sparkles,
      title: 'Descobrir Plano Ideal',
      description: 'Faça um quiz e encontre o melhor plano para você',
      highlight: true,
      special: true
    },
    {
      href: '/auth',
      icon: LogIn,
      title: 'Login / Cadastro',
      description: 'Entre ou crie sua conta para começar'
    },
    {
      href: '/cadastro',
      icon: Baby,
      title: 'Cadastro do Bebê',
      description: 'Registre informações importantes do seu bebê'
    },
    {
      href: '/agenda',
      icon: Calendar,
      title: 'Agenda',
      description: 'Consultas, vacinas e marcos de desenvolvimento'
    },
    {
      href: '/diario',
      icon: Moon,
      title: 'Diário de Sono',
      description: 'Registre os horários de sono do seu bebê'
    },
    {
      href: '/alertas',
      icon: Bell,
      title: 'Alertas',
      description: 'Lembretes personalizados para sonecas'
    },
    {
      href: '/recomendacoes',
      icon: TrendingUp,
      title: 'Recomendações',
      description: 'Sugestões baseadas nos dados coletados'
    },
    {
      href: '/relatorios',
      icon: TrendingUp,
      title: 'Relatórios',
      description: 'Estatísticas e gráficos do sono'
    },
    {
      href: '/dicas',
      icon: BookOpen,
      title: 'Dicas',
      description: 'Artigos e conselhos sobre sono infantil'
    },
    {
      href: '/comunidade',
      icon: Users,
      title: 'Comunidade',
      description: 'Compartilhe experiências com outros pais'
    },
    {
      href: '/historico',
      icon: History,
      title: 'Histórico',
      description: 'Marcos importantes no desenvolvimento'
    },
    {
      href: '/configuracoes',
      icon: Settings,
      title: 'Configurações',
      description: 'Personalize o ambiente do app'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 max-w-7xl">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            🌙 SONINHO
          </h1>
          <p className="text-base sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 px-4">
            Gerenciador Inteligente de Cochilos
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Link
                key={feature.href}
                href={feature.href}
                className={`rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border active:scale-95 ${
                  feature.special
                    ? 'bg-gradient-to-br from-purple-500 to-pink-600 border-purple-400 ring-2 ring-purple-200 dark:ring-purple-800'
                    : feature.highlight
                    ? 'bg-white dark:bg-gray-800 border-blue-500 dark:border-blue-400 ring-2 ring-blue-200 dark:ring-blue-800'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <Icon className={`w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4 ${
                    feature.special
                      ? 'text-white'
                      : feature.highlight
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-blue-600 dark:text-blue-400'
                  }`} />
                  <h3 className={`text-base sm:text-lg font-semibold mb-2 ${
                    feature.special
                      ? 'text-white'
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {feature.title}
                  </h3>
                  <p className={`text-xs sm:text-sm leading-relaxed ${
                    feature.special
                      ? 'text-white/90'
                      : 'text-gray-600 dark:text-gray-300'
                  }`}>
                    {feature.description}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Install prompt for PWA */}
        <div className="mt-8 sm:mt-12 text-center">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 px-4">
            💡 Dica: Adicione o SONINHO à tela inicial do seu celular para acesso rápido!
          </p>
        </div>
      </div>
    </div>
  )
}
