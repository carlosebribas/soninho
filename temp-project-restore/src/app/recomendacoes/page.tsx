'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Target, Clock, Zap } from 'lucide-react'

interface SleepEntry {
  id: string
  date: string
  startTime: string
  endTime: string
  notes: string
  mood?: string
}

export default function Recomendacoes() {
  const [entries, setEntries] = useState<SleepEntry[]>([])
  const [recommendations, setRecommendations] = useState<string[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('sleepDiary')
    if (saved) {
      const parsedEntries = JSON.parse(saved)
      setEntries(parsedEntries)
      generateRecommendations(parsedEntries)
    }
  }, [])

  const generateRecommendations = (sleepEntries: SleepEntry[]) => {
    const recs: string[] = []

    if (sleepEntries.length === 0) {
      recs.push("Comece registrando seus primeiros sonos para receber recomendações personalizadas!")
      setRecommendations(recs)
      return
    }

    // Calculate average sleep duration
    const durations = sleepEntries.map(entry => {
      const start = new Date(`2000-01-01T${entry.startTime}`)
      const end = new Date(`2000-01-01T${entry.endTime}`)
      return (end.getTime() - start.getTime()) / (1000 * 60 * 60) // hours
    })

    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length

    // Analyze sleep patterns
    if (avgDuration < 2) {
      recs.push("Seu bebê está dormindo menos que o recomendado. Considere ajustar a rotina para mais tempo de sono.")
    } else if (avgDuration > 4) {
      recs.push("Excelente! Seu bebê está tendo um bom tempo de sono.")
    }

    // Check for consistency
    const bedtimeVariance = calculateVariance(sleepEntries.map(e => {
      const [hours, minutes] = e.startTime.split(':').map(Number)
      return hours * 60 + minutes
    }))

    if (bedtimeVariance > 60) { // More than 1 hour variance
      recs.push("A hora de dormir varia muito. Tente estabelecer uma rotina mais consistente.")
    } else {
      recs.push("Parabéns! Você mantém uma rotina de sono consistente.")
    }

    // Mood analysis
    const moods = sleepEntries.filter(e => e.mood).map(e => e.mood!.toLowerCase())
    if (moods.includes('irritado') || moods.includes('choroso')) {
      recs.push("Quando o bebê acorda irritado, considere verificar se há desconfortos como fome, frio ou calor.")
    }

    // Recent patterns
    const recentEntries = sleepEntries.slice(0, 7) // Last 7 entries
    const recentAvg = recentEntries.length > 0 ?
      recentEntries.reduce((sum, e) => {
        const start = new Date(`2000-01-01T${e.startTime}`)
        const end = new Date(`2000-01-01T${e.endTime}`)
        return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60)
      }, 0) / recentEntries.length : 0

    if (recentAvg < avgDuration * 0.8) {
      recs.push("O sono recente está abaixo da média. Verifique se há mudanças na rotina.")
    }

    setRecommendations(recs)
  }

  const calculateVariance = (values: number[]) => {
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const variance = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length
    return Math.sqrt(variance)
  }

  const getSleepStats = () => {
    if (entries.length === 0) return null

    const durations = entries.map(entry => {
      const start = new Date(`2000-01-01T${entry.startTime}`)
      const end = new Date(`2000-01-01T${entry.endTime}`)
      return (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    })

    const totalSleep = durations.reduce((a, b) => a + b, 0)
    const avgSleep = totalSleep / entries.length
    const maxSleep = Math.max(...durations)
    const minSleep = Math.min(...durations)

    return { totalSleep, avgSleep, maxSleep, minSleep, entriesCount: entries.length }
  }

  const stats = getSleepStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-orange-900 mb-2 flex items-center justify-center gap-2">
            <TrendingUp className="w-8 h-8" />
            Recomendações Personalizadas
          </h1>
          <p className="text-gray-600">Sugestões baseadas nos dados do seu bebê</p>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-900">{stats.avgSleep.toFixed(1)}h</div>
                  <p className="text-sm text-gray-600">Média de sono</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-900">{stats.entriesCount}</div>
                  <p className="text-sm text-gray-600">Registros</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Zap className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-900">{stats.maxSleep.toFixed(1)}h</div>
                  <p className="text-sm text-gray-600">Maior sono</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-900">{stats.totalSleep.toFixed(1)}h</div>
                  <p className="text-sm text-gray-600">Total registrado</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>💡 Recomendações Personalizadas</CardTitle>
          </CardHeader>
          <CardContent>
            {recommendations.length === 0 ? (
              <p className="text-gray-500">Adicione alguns registros de sono para receber recomendações!</p>
            ) : (
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-orange-50 rounded-lg">
                    <Badge variant="secondary" className="mt-1">
                      {index + 1}
                    </Badge>
                    <p className="text-gray-700">{rec}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>🎯 Próximos Passos</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Mantenha registros diários consistentes</li>
                <li>• Observe padrões de humor e energia</li>
                <li>• Ajuste a rotina gradualmente</li>
                <li>• Consulte um pediatra se necessário</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📚 Dicas Gerais</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Ambiente escuro e silencioso</li>
                <li>• Temperatura entre 20-22°C</li>
                <li>• Rotina consistente antes de dormir</li>
                <li>• Evite telas 1 hora antes</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}