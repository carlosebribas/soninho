import Link from 'next/link'
import { Moon, Bell, TrendingUp, BookOpen, Users, History, Settings, Baby, Calendar, LogIn } from 'lucide-react'

export default function Home() {
  const features = [
    {
      href: '/auth',
      icon: LogIn,
      title: 'Login / Cadastro',
      description: 'Entre ou crie sua conta para começar',
      highlight: true
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
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🌙 SONINHO
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Gerenciador Inteligente de Cochilos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Link
                key={feature.href}
                href={feature.href}
                className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300 border ${
                  feature.highlight
                    ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-200 dark:ring-blue-800'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  <Icon className={`w-12 h-12 mb-4 ${
                    feature.highlight
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-blue-600 dark:text-blue-400'
                  }`} />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {feature.description}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
