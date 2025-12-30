'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { AlertCircle } from 'lucide-react'

export default function AuthPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar se o Supabase está configurado
    if (!supabase) {
      setLoading(false)
      return
    }

    // Verificar se usuário já está logado
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
      if (session?.user) {
        router.push('/')
      }
    })

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        router.push('/')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Carregando...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return null // Redirecionando...
  }

  // Exibir mensagem se o Supabase não estiver configurado
  if (!supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-6">
              <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Configuração Necessária
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Para usar a autenticação, você precisa configurar o Supabase
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-3">
                Passos para configurar:
              </h2>
              <ol className="text-sm text-gray-700 dark:text-gray-300 space-y-2 list-decimal list-inside">
                <li>Crie uma conta gratuita em <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">supabase.com</a></li>
                <li>Crie um novo projeto</li>
                <li>Copie a URL e a chave anônima do projeto</li>
                <li>Crie um arquivo <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">.env.local</code> na raiz do projeto</li>
                <li>Adicione as variáveis de ambiente</li>
              </ol>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 font-mono text-xs overflow-x-auto">
              <div className="text-gray-700 dark:text-gray-300">
                NEXT_PUBLIC_SUPABASE_URL=sua-url-aqui<br />
                NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-aqui
              </div>
            </div>

            <button
              onClick={() => router.push('/')}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
            >
              Voltar para o início
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              🌙 SONINHO
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Faça login ou crie sua conta
            </p>
          </div>

          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#2563eb',
                    brandAccent: '#1d4ed8',
                  },
                },
              },
              className: {
                container: 'auth-container',
                button: 'auth-button',
                input: 'auth-input',
              },
            }}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Email',
                  password_label: 'Senha',
                  email_input_placeholder: 'seu@email.com',
                  password_input_placeholder: 'Sua senha',
                  button_label: 'Entrar',
                  loading_button_label: 'Entrando...',
                  social_provider_text: 'Entrar com {{provider}}',
                  link_text: 'Já tem uma conta? Entre',
                },
                sign_up: {
                  email_label: 'Email',
                  password_label: 'Senha',
                  email_input_placeholder: 'seu@email.com',
                  password_input_placeholder: 'Sua senha',
                  button_label: 'Criar conta',
                  loading_button_label: 'Criando conta...',
                  social_provider_text: 'Criar conta com {{provider}}',
                  link_text: 'Não tem uma conta? Cadastre-se',
                  confirmation_text: 'Verifique seu email para confirmar o cadastro',
                },
                forgotten_password: {
                  email_label: 'Email',
                  password_label: 'Senha',
                  email_input_placeholder: 'seu@email.com',
                  button_label: 'Enviar instruções',
                  loading_button_label: 'Enviando...',
                  link_text: 'Esqueceu sua senha?',
                  confirmation_text: 'Verifique seu email para redefinir a senha',
                },
                update_password: {
                  password_label: 'Nova senha',
                  password_input_placeholder: 'Sua nova senha',
                  button_label: 'Atualizar senha',
                  loading_button_label: 'Atualizando...',
                  confirmation_text: 'Sua senha foi atualizada',
                },
                magic_link: {
                  email_input_label: 'Email',
                  email_input_placeholder: 'seu@email.com',
                  button_label: 'Enviar link mágico',
                  loading_button_label: 'Enviando...',
                  link_text: 'Enviar um link mágico',
                  confirmation_text: 'Verifique seu email para o link de acesso',
                },
              },
            }}
            providers={['google']}
            redirectTo={typeof window !== 'undefined' ? window.location.origin : ''}
          />

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ao criar uma conta, você concorda com nossos{' '}
              <a href="#" className="text-blue-600 hover:underline">
                Termos de Uso
              </a>{' '}
              e{' '}
              <a href="#" className="text-blue-600 hover:underline">
                Política de Privacidade
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
