'use client'

import Link from 'next/link'
import { useState } from 'react'

interface NapRecord {
  id: number
  date: string
  duration: number
  quality: 'Excelente' | 'Bom' | 'Regular' | 'Ruim'
}

export default function HistoricoPage() {
  // Dados mock - em um app real, viria do banco de dados
  const [napHistory] = useState<NapRecord[]>([
    { id: 1, date: '2024-10-08 14:30', duration: 20, quality: 'Excelente' },
    { id: 2, date: '2024-10-07 16:00', duration: 15, quality: 'Bom' },
    { id: 3, date: '2024-10-06 13:15', duration: 25, quality: 'Regular' },
    { id: 4, date: '2024-10-05 15:45', duration: 10, quality: 'Ruim' },
  ])

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'Excelente': return 'text-green-600'
      case 'Bom': return 'text-blue-600'
      case 'Regular': return 'text-yellow-600'
      case 'Ruim': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="text-center max-w-2xl bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-indigo-900 mb-6">Histórico de Cochilos</h1>

        <div className="space-y-4 mb-6">
          {napHistory.map((nap) => (
            <div key={nap.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-800">{nap.date}</p>
                  <p className="text-sm text-gray-600">Duração: {nap.duration} minutos</p>
                </div>
                <div className={`font-semibold ${getQualityColor(nap.quality)}`}>
                  {nap.quality}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Link
          href="/"
          className="block w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-center"
        >
          Voltar ao Início
        </Link>
      </div>
    </div>
  )
}