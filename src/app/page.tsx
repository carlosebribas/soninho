import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="text-center max-w-md">
        <h1 className="text-5xl font-bold text-green-900 mb-4">
          SONINHO
        </h1>
        <p className="text-xl text-gray-700 mb-8">
          Gerencie seus cochilos de forma inteligente
        </p>
        <div className="space-y-4">
          <Link
            href="/timer"
            className="block w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Iniciar Cochilo
          </Link>
          <Link
            href="/historico"
            className="block w-full bg-white text-indigo-600 py-3 px-6 rounded-lg font-semibold border border-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            Ver Histórico
          </Link>
          <Link
            href="/configuracoes"
            className="block w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Configurações
          </Link>
        </div>
      </div>
    </div>
  )
}