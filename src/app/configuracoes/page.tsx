'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function ConfiguracoesPage() {
  const [defaultDuration, setDefaultDuration] = useState(20)
  const [alarmEnabled, setAlarmEnabled] = useState(true)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  const handleSave = () => {
    // Aqui salvaria as configurações no localStorage ou banco
    alert('Configurações salvas!')
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="text-center max-w-md bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-indigo-900 mb-6">Configurações</h1>

        <div className="space-y-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duração Padrão (minutos):
            </label>
            <select
              value={defaultDuration}
              onChange={(e) => setDefaultDuration(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              {[5, 10, 15, 20, 25, 30].map((duration) => (
                <option key={duration} value={duration}>
                  {duration} minutos
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Alarme ao Finalizar Cochilo
            </label>
            <input
              type="checkbox"
              checked={alarmEnabled}
              onChange={(e) => setAlarmEnabled(e.target.checked)}
              className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Notificações de Lembretes
            </label>
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={(e) => setNotificationsEnabled(e.target.checked)}
              className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleSave}
            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Salvar Configurações
          </button>

          <Link
            href="/"
            className="block w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-center"
          >
            Voltar ao Início
          </Link>
        </div>
      </div>
    </div>
  )
}