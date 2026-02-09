'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendingUp, Target, Clock, Zap, Download, FileText, Loader2 } from 'lucide-react'
import { format, differenceInMonths, differenceInYears } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { BackButton } from '@/components/BackButton'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useSleepEntries } from '@/hooks/useSleepEntries'

interface SleepEntry {
  id: string
  date: string
  startTime: string
  endTime: string | null
  notes: string
  moodBefore?: string
  moodAfter?: string
  type: 'sono' | 'soneca'
  isPending: boolean
}

export default function Recomendacoes() {
  const { entries: rawEntries, loading } = useSleepEntries()
  const entries = rawEntries.filter(e => !e.isPending && e.endTime) // Apenas registros completos
  const [recommendations, setRecommendations] = useState<string[]>([])
  const [babyAgeInMonths, setBabyAgeInMonths] = useState<number>(0)
  const [babyBirthDate, setBabyBirthDate] = useState<Date | null>(null)

  // Função para formatar idade de forma legível
  const formatBabyAge = (totalMonths: number, birthDate?: Date) => {
    if (!birthDate) {
      if (totalMonths < 12) {
        return `${totalMonths} ${totalMonths === 1 ? 'mês' : 'meses'}`
      } else {
        const years = Math.floor(totalMonths / 12)
        const months = totalMonths % 12
        if (months === 0) {
          return `${years} ${years === 1 ? 'ano' : 'anos'}`
        }
        return `${years} ${years === 1 ? 'ano' : 'anos'} e ${months} ${months === 1 ? 'mês' : 'meses'}`
      }
    }

    const now = new Date()
    const years = differenceInYears(now, birthDate)
    const remainingMonths = differenceInMonths(now, birthDate) % 12

    if (years > 0) {
      return `${years} ${years > 1 ? 'anos' : 'ano'} e ${remainingMonths} ${remainingMonths !== 1 ? 'meses' : 'mês'}`
    } else {
      return `${remainingMonths} ${remainingMonths !== 1 ? 'meses' : 'mês'}`
    }
  }

  // Calcular idade do bebê
  useEffect(() => {
    const saved = localStorage.getItem('cadastroBebe')
    if (saved) {
      try {
        const babyData = JSON.parse(saved)
        if (babyData.dataNascimento) {
          const [year, month, day] = babyData.dataNascimento.split('-').map(Number)
          const birthDate = new Date(year, month - 1, day)
          const ageInMonths = differenceInMonths(new Date(), birthDate)
          setBabyAgeInMonths(ageInMonths)
          setBabyBirthDate(birthDate)
        }
      } catch (error) {
        console.error('Erro ao calcular idade:', error)
      }
    }
  }, [])

  const generateRecommendations = useCallback((sleepEntries: SleepEntry[]) => {
    const recs: string[] = []

    if (sleepEntries.length === 0) {
      recs.push("Comece registrando seus primeiros sonos para receber recomendações personalizadas!")
      setRecommendations(recs)
      return
    }

    // Parâmetros ideais por idade
    let idealNapCount = { min: 2, max: 3 }
    let idealTotalSleep = { min: 12, max: 16 } // horas por dia
    let ageRange = ''

    if (babyAgeInMonths < 3) {
      ageRange = '0-3 meses'
      idealNapCount = { min: 4, max: 6 }
      idealTotalSleep = { min: 14, max: 17 }
    } else if (babyAgeInMonths < 6) {
      ageRange = '3-6 meses'
      idealNapCount = { min: 3, max: 4 }
      idealTotalSleep = { min: 12, max: 16 }
    } else if (babyAgeInMonths < 9) {
      ageRange = '6-9 meses'
      idealNapCount = { min: 2, max: 3 }
      idealTotalSleep = { min: 12, max: 15 }
    } else if (babyAgeInMonths < 12) {
      ageRange = '9-12 meses'
      idealNapCount = { min: 2, max: 2 }
      idealTotalSleep = { min: 11, max: 14 }
    } else if (babyAgeInMonths < 18) {
      ageRange = '12-18 meses'
      idealNapCount = { min: 1, max: 2 }
      idealTotalSleep = { min: 11, max: 14 }
    } else {
      ageRange = '18+ meses'
      idealNapCount = { min: 1, max: 1 }
      idealTotalSleep = { min: 11, max: 14 }
    }

    // Análise dos últimos 7 dias
    const last7Days = sleepEntries.slice(0, 7)
    const naps = last7Days.filter(e => e.type === 'soneca')
    const nightSleep = last7Days.filter(e => e.type === 'sono')

    // Duração média das sonecas
    const napDurations = naps.map(entry => {
      if (!entry.endTime) return 0
      const start = new Date(`2000-01-01T${entry.startTime}`)
      let end = new Date(`2000-01-01T${entry.endTime}`)
      if (end < start) end = new Date(`2000-01-02T${entry.endTime}`)
      return (end.getTime() - start.getTime()) / (1000 * 60 * 60) // hours
    }).filter(d => d > 0)

    const avgNapDuration = napDurations.length > 0
      ? napDurations.reduce((a, b) => a + b, 0) / napDurations.length
      : 0

    // Duração média do sono noturno
    const nightDurations = nightSleep.map(entry => {
      if (!entry.endTime) return 0
      const start = new Date(`2000-01-01T${entry.startTime}`)
      let end = new Date(`2000-01-01T${entry.endTime}`)
      if (end < start) end = new Date(`2000-01-02T${entry.endTime}`)
      return (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    }).filter(d => d > 0)

    const avgNightSleep = nightDurations.length > 0
      ? nightDurations.reduce((a, b) => a + b, 0) / nightDurations.length
      : 0

    const totalAvgSleep = avgNapDuration * (naps.length / 7) + avgNightSleep

    // Recomendações baseadas em idade
    if (ageRange && babyBirthDate) {
      const ageFormatted = formatBabyAge(babyAgeInMonths, babyBirthDate)
      recs.push(`📊 Análise para bebê de ${ageFormatted} (faixa ${ageRange})`)
    } else if (ageRange) {
      recs.push(`📊 Análise para bebê de ${ageRange}`)
    }

    // Quantidade de sonecas
    const avgNapsPerDay = naps.length / 7
    if (avgNapsPerDay < idealNapCount.min) {
      recs.push(`💤 Seu bebê tem ${avgNapsPerDay.toFixed(1)} sonecas por dia em média. Para ${ageRange}, o ideal é ${idealNapCount.min}-${idealNapCount.max} sonecas.`)
    } else if (avgNapsPerDay > idealNapCount.max) {
      recs.push(`⚠️ Muitas sonecas (${avgNapsPerDay.toFixed(1)}/dia). Tente consolidar para ${idealNapCount.min}-${idealNapCount.max} sonecas por dia.`)
    } else {
      recs.push(`✅ Número de sonecas adequado (${avgNapsPerDay.toFixed(1)}/dia) para ${ageRange}!`)
    }

    // Total de sono
    if (totalAvgSleep < idealTotalSleep.min) {
      recs.push(`⏰ Sono total abaixo do recomendado (${totalAvgSleep.toFixed(1)}h/dia). Ideal: ${idealTotalSleep.min}-${idealTotalSleep.max}h para ${ageRange}.`)
    } else if (totalAvgSleep > idealTotalSleep.max) {
      recs.push(`😴 Seu bebê está dormindo mais que o esperado (${totalAvgSleep.toFixed(1)}h/dia). Observe se isso afeta o sono noturno.`)
    } else {
      recs.push(`🎯 Total de sono ideal (${totalAvgSleep.toFixed(1)}h/dia) para ${ageRange}!`)
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
    const moodsAfter = sleepEntries.filter(e => e.moodAfter).map(e => e.moodAfter!.toLowerCase())
    if (moodsAfter.includes('irritado') || moodsAfter.includes('choroso')) {
      recs.push("🔍 Bebê acorda irritado frequentemente. Verifique desconfortos como fome, fralda ou temperatura.")
    }

    const moodsBefore = sleepEntries.filter(e => e.moodBefore).map(e => e.moodBefore!.toLowerCase())
    if (moodsBefore.includes('agitado') || moodsBefore.includes('irritado')) {
      recs.push("😌 Bebê agitado antes de dormir? Tente acalmar com rotina relaxante (banho, música suave).")
    }

    // Consistência de horários
    if (nightSleep.length >= 3) {
      const bedtimes = nightSleep.map(e => {
        const [hours, minutes] = e.startTime.split(':').map(Number)
        return hours * 60 + minutes
      })
      const variance = calculateVariance(bedtimes)

      if (variance > 60) {
        recs.push("🕐 Horário de dormir varia muito. Rotina consistente ajuda o bebê a dormir melhor.")
      } else {
        recs.push("✅ Horário de dormir consistente! Continue assim.")
      }
    }

    setRecommendations(recs)
  }, [babyAgeInMonths, babyBirthDate])

  useEffect(() => {
    if (entries.length > 0) {
      generateRecommendations(entries)
    }
  }, [entries, generateRecommendations])

  const calculateVariance = (values: number[]) => {
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const variance = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length
    return Math.sqrt(variance)
  }

  const getSleepStats = () => {
    if (entries.length === 0) return null

    const durations = entries.map(entry => {
      if (!entry.endTime) return 0
      const start = new Date(`2000-01-01T${entry.startTime}`)
      let end = new Date(`2000-01-01T${entry.endTime}`)
      if (end < start) end = new Date(`2000-01-02T${entry.endTime}`)
      return (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    }).filter(d => d > 0)

    if (durations.length === 0) return null

    const totalSleep = durations.reduce((a, b) => a + b, 0)
    const avgSleep = totalSleep / durations.length
    const maxSleep = Math.max(...durations)
    const minSleep = Math.min(...durations)

    return { totalSleep, avgSleep, maxSleep, minSleep, entriesCount: durations.length }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-950 flex items-center justify-center transition-colors">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Carregando recomendações...</p>
        </div>
      </div>
    )
  }

  const stats = getSleepStats()

  const exportRecommendationsToPDF = () => {
    if (recommendations.length === 0) {
      alert('Não há recomendações para exportar!')
      return
    }

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Recomendações Personalizadas - SONINHO</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
          }
          h1 {
            color: #EA580C;
            text-align: center;
            margin-bottom: 10px;
          }
          .subtitle {
            text-align: center;
            color: #6B7280;
            margin-bottom: 30px;
          }
          .stats {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-bottom: 30px;
          }
          .stat-card {
            border: 1px solid #E5E7EB;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
          }
          .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #EA580C;
          }
          .stat-label {
            color: #6B7280;
            font-size: 14px;
            margin-top: 5px;
          }
          .recommendations {
            margin: 30px 0;
          }
          .recommendation {
            background-color: #FFF7ED;
            border-left: 4px solid #EA580C;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 4px;
          }
          .recommendation-number {
            display: inline-block;
            background-color: #EA580C;
            color: white;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            text-align: center;
            line-height: 28px;
            font-weight: bold;
            margin-right: 10px;
          }
          .tips-section {
            margin-top: 40px;
          }
          .tips-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
          .tips-card {
            border: 1px solid #E5E7EB;
            border-radius: 8px;
            padding: 15px;
          }
          .tips-card h3 {
            color: #EA580C;
            margin-bottom: 10px;
          }
          .tips-card ul {
            list-style: none;
            padding: 0;
          }
          .tips-card li {
            margin-bottom: 8px;
            color: #4B5563;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            color: #6B7280;
            font-size: 12px;
          }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <h1>🌙 SONINHO - Recomendações Personalizadas</h1>
        <p class="subtitle">Gerado em: ${format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}</p>

        ${stats ? `
          <div class="stats">
            <div class="stat-card">
              <div class="stat-value">${stats.avgSleep.toFixed(1)}h</div>
              <div class="stat-label">Média de Sono</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${stats.entriesCount}</div>
              <div class="stat-label">Registros Analisados</div>
            </div>
          </div>
        ` : ''}

        <div class="recommendations">
          <h2 style="color: #EA580C;">💡 Suas Recomendações</h2>
          ${recommendations.map((rec, index) => `
            <div class="recommendation">
              <span class="recommendation-number">${index + 1}</span>
              <span>${rec}</span>
            </div>
          `).join('')}
        </div>

        <div class="tips-section">
          <div class="tips-grid">
            <div class="tips-card">
              <h3>🎯 Próximos Passos</h3>
              <ul>
                <li>• Mantenha registros diários consistentes</li>
                <li>• Observe padrões de humor e energia</li>
                <li>• Ajuste a rotina gradualmente</li>
                <li>• Consulte um pediatra se necessário</li>
              </ul>
            </div>

            <div class="tips-card">
              <h3>📚 Dicas Gerais</h3>
              <ul>
                <li>• Ambiente escuro e silencioso</li>
                <li>• Temperatura entre 20-22°C</li>
                <li>• Rotina consistente antes de dormir</li>
                <li>• Evite telas 1 hora antes</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>Relatório gerado automaticamente pelo SONINHO - Gerenciador Inteligente de Cochilos</p>
        </div>
      </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()

    setTimeout(() => {
      printWindow.print()
    }, 250)
  }

  return (
    <ProtectedRoute requiredPlan="pro" featureName="Recomendações Personalizadas com IA">
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 p-4">
        <div className="max-w-4xl mx-auto">
        <BackButton />
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-orange-900 mb-2 flex items-center justify-center gap-2">
            <TrendingUp className="w-8 h-8" />
            Recomendações Personalizadas
          </h1>
          <p className="text-gray-600">Sugestões baseadas nos dados do seu bebê</p>

          <div className="mt-4 flex justify-center">
            <Button
              onClick={exportRecommendationsToPDF}
              variant="outline"
              className="flex items-center gap-2 bg-orange-50 hover:bg-orange-100 border-orange-300 text-orange-700"
            >
              <FileText className="w-4 h-4" />
              Exportar Recomendações (PDF)
            </Button>
          </div>
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
    </ProtectedRoute>
  )
}