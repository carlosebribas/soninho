'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { AlertCircle, CheckCircle, Database, X } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function DatabaseSetupAlert() {
  const [showAlert, setShowAlert] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkDatabase()
  }, [])

  const checkDatabase = async () => {
    if (!supabase) {
      setIsChecking(false)
      return
    }

    try {
      // Verificar autenticação
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)

      if (!session?.user) {
        setIsChecking(false)
        return
      }

      // Tentar acessar a tabela
      const { error } = await supabase
        .from('sleep_entries')
        .select('id')
        .limit(1)

      if (error) {
        // Se a tabela não existe, mostrar alerta
        console.log('Tabelas não encontradas:', error)
        setShowAlert(true)
      }
    } catch (error) {
      console.error('Erro ao verificar banco:', error)
    } finally {
      setIsChecking(false)
    }
  }

  if (isChecking || !showAlert || !user) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Card className="border-2 border-yellow-400 bg-yellow-50 shadow-lg">
        <CardContent className="pt-6 relative">
          <button
            onClick={() => setShowAlert(false)}
            className="absolute top-2 right-2 p-1 hover:bg-yellow-100 rounded transition-colors"
            aria-label="Fechar"
          >
            <X className="w-4 h-4 text-yellow-700" />
          </button>

          <div className="flex items-start gap-3">
            <Database className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900 mb-2">
                Configure o Banco de Dados
              </h3>
              <p className="text-sm text-yellow-800 mb-3">
                Para sincronizar seus dados na nuvem, você precisa configurar as tabelas do banco de dados.
              </p>
              <div className="space-y-2 text-sm text-yellow-800">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Seus dados estão salvos localmente</span>
                </div>
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <span>Configure o banco para sincronizar entre dispositivos</span>
                </div>
              </div>
              <div className="mt-4">
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                    Abrir Supabase Dashboard
                  </Button>
                </a>
                <p className="text-xs text-yellow-700 mt-2">
                  Consulte o arquivo <code className="bg-yellow-200 px-1 rounded">SETUP_DATABASE.md</code> para instruções
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
