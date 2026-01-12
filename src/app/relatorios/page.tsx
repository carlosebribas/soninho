'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Calendar, Clock, Moon, Download, FileText } from 'lucide-react'
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { BackButton } from '@/components/BackButton'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/hooks/useAuth'

interface SleepEntry {
  id: string
  date: string
  startTime: string
  endTime: string
  notes: string
  mood?: string
}

export default function Relatorios() {
  const { hasAccess } = useAuth()
  const [entries, setEntries] = useState<SleepEntry[]>([])
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d')

  useEffect(() => {
    const saved = localStorage.getItem('sleepDiary')
    if (saved) {
      setEntries(JSON.parse(saved))
    }
  }, [])

  const getFilteredEntries = () => {
    const now = new Date()
    let startDate: Date

    switch (timeRange) {
      case '7d':
        startDate = subDays(now, 7)
        break
      case '30d':
        startDate = subDays(now, 30)
        break
      case '90d':
        startDate = subDays(now, 90)
        break
      default:
        startDate = subDays(now, 7)
    }

    return entries.filter(entry => new Date(entry.date) >= startDate)
  }

  const getSleepData = () => {
    const filtered = getFilteredEntries()
    return filtered.map(entry => {
      const start = new Date(`2000-01-01T${entry.startTime}`)
      const end = new Date(`2000-01-01T${entry.endTime}`)
      const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60) // hours

      return {
        date: format(new Date(entry.date), 'dd/MM', { locale: ptBR }),
        fullDate: entry.date,
        duration: Number(duration.toFixed(1)),
        startTime: entry.startTime,
        endTime: entry.endTime,
        mood: entry.mood || 'N/A'
      }
    }).reverse() // Most recent first
  }

  const getWeeklyAverage = () => {
    const filtered = getFilteredEntries()
    const weeklyData: { [key: string]: number[] } = {}

    filtered.forEach(entry => {
      const start = new Date(`2000-01-01T${entry.startTime}`)
      const end = new Date(`2000-01-01T${entry.endTime}`)
      const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60)

      const weekStart = startOfWeek(new Date(entry.date), { weekStartsOn: 1 })
      const weekKey = format(weekStart, 'yyyy-MM-dd')

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = []
      }
      weeklyData[weekKey].push(duration)
    })

    return Object.entries(weeklyData).map(([week, durations]) => ({
      week: format(new Date(week), "'Sem' ww", { locale: ptBR }),
      average: Number((durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(1))
    }))
  }

  const getMoodDistribution = () => {
    const filtered = getFilteredEntries()
    const moodCount: { [key: string]: number } = {}

    filtered.forEach(entry => {
      const mood = entry.mood?.toLowerCase() || 'não informado'
      moodCount[mood] = (moodCount[mood] || 0) + 1
    })

    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1']
    return Object.entries(moodCount).map(([mood, count], index) => ({
      name: mood.charAt(0).toUpperCase() + mood.slice(1),
      value: count,
      color: colors[index % colors.length]
    }))
  }

  const getStats = () => {
    const filtered = getFilteredEntries()
    if (filtered.length === 0) return null

    const durations = filtered.map(entry => {
      const start = new Date(`2000-01-01T${entry.startTime}`)
      const end = new Date(`2000-01-01T${entry.endTime}`)
      return (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    })

    const totalSleep = durations.reduce((a, b) => a + b, 0)
    const avgSleep = totalSleep / filtered.length
    const maxSleep = Math.max(...durations)
    const minSleep = Math.min(...durations)

    return {
      totalSleep: Number(totalSleep.toFixed(1)),
      avgSleep: Number(avgSleep.toFixed(1)),
      maxSleep: Number(maxSleep.toFixed(1)),
      minSleep: Number(minSleep.toFixed(1)),
      entriesCount: filtered.length
    }
  }

  const sleepData = getSleepData()
  const weeklyData = getWeeklyAverage()
  const moodData = getMoodDistribution()
  const stats = getStats()

  const exportToCSV = () => {
    const filtered = getFilteredEntries()
    if (filtered.length === 0) {
      alert('Não há dados para exportar!')
      return
    }

    // Create CSV content
    const headers = ['Data', 'Hora Início', 'Hora Fim', 'Duração (horas)', 'Humor', 'Observações']
    const rows = filtered.map(entry => {
      const start = new Date(`2000-01-01T${entry.startTime}`)
      const end = new Date(`2000-01-01T${entry.endTime}`)
      const duration = ((end.getTime() - start.getTime()) / (1000 * 60 * 60)).toFixed(1)

      return [
        format(new Date(entry.date), 'dd/MM/yyyy', { locale: ptBR }),
        entry.startTime,
        entry.endTime,
        duration,
        entry.mood || 'N/A',
        entry.notes || ''
      ]
    })

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `relatorio-sono-${format(new Date(), 'yyyy-MM-dd')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToPDF = () => {
    const filtered = getFilteredEntries()
    if (filtered.length === 0) {
      alert('Não há dados para exportar!')
      return
    }

    // Create printable HTML content
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Relatório de Sono - SONINHO</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
          }
          h1 {
            color: #4F46E5;
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
            grid-template-columns: repeat(3, 1fr);
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
            color: #4F46E5;
          }
          .stat-label {
            color: #6B7280;
            font-size: 14px;
            margin-top: 5px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #E5E7EB;
            padding: 12px;
            text-align: left;
          }
          th {
            background-color: #4F46E5;
            color: white;
          }
          tr:nth-child(even) {
            background-color: #F9FAFB;
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
        <h1>🌙 SONINHO - Relatório de Sono</h1>
        <p class="subtitle">Período: ${format(new Date(), 'dd/MM/yyyy', { locale: ptBR })}</p>

        ${stats ? `
          <div class="stats">
            <div class="stat-card">
              <div class="stat-value">${stats.entriesCount}</div>
              <div class="stat-label">Registros</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${stats.avgSleep}h</div>
              <div class="stat-label">Média/dia</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${stats.totalSleep}h</div>
              <div class="stat-label">Total</div>
            </div>
          </div>
        ` : ''}

        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Início</th>
              <th>Fim</th>
              <th>Duração</th>
              <th>Humor</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(entry => {
              const start = new Date(`2000-01-01T${entry.startTime}`)
              const end = new Date(`2000-01-01T${entry.endTime}`)
              const duration = ((end.getTime() - start.getTime()) / (1000 * 60 * 60)).toFixed(1)

              return `
                <tr>
                  <td>${format(new Date(entry.date), 'dd/MM/yyyy', { locale: ptBR })}</td>
                  <td>${entry.startTime}</td>
                  <td>${entry.endTime}</td>
                  <td>${duration}h</td>
                  <td>${entry.mood || 'N/A'}</td>
                </tr>
              `
            }).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Relatório gerado automaticamente pelo SONINHO - Gerenciador Inteligente de Cochilos</p>
        </div>
      </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()

    // Wait for content to load before printing
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <BackButton />
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-900 mb-2 flex items-center justify-center gap-2">
            <TrendingUp className="w-8 h-8" />
            Relatórios Detalhados
          </h1>
          <p className="text-gray-600">Gráficos e estatísticas sobre os padrões de sono</p>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Select value={timeRange} onValueChange={(value: '7d' | '30d' | '90d') => setTimeRange(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-3">
            <Button
              onClick={exportToCSV}
              variant="outline"
              disabled={!hasAccess('pro')}
              className="flex items-center gap-2 bg-green-50 hover:bg-green-100 border-green-300 text-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title={!hasAccess('pro') ? 'Disponível apenas no plano Pro' : ''}
            >
              <Download className="w-4 h-4" />
              Exportar CSV
              {!hasAccess('pro') && <span className="text-xs ml-1">(Pro)</span>}
            </Button>
            <Button
              onClick={exportToPDF}
              variant="outline"
              disabled={!hasAccess('pro')}
              className="flex items-center gap-2 bg-red-50 hover:bg-red-100 border-red-300 text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title={!hasAccess('pro') ? 'Disponível apenas no plano Pro' : ''}
            >
              <FileText className="w-4 h-4" />
              Exportar PDF
              {!hasAccess('pro') && <span className="text-xs ml-1">(Pro)</span>}
            </Button>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Calendar className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-indigo-900">{stats.entriesCount}</div>
                  <p className="text-sm text-gray-600">Registros</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-900">{stats.avgSleep}h</div>
                  <p className="text-sm text-gray-600">Média/dia</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Moon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-900">{stats.totalSleep}h</div>
                  <p className="text-sm text-gray-600">Total</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-900">{stats.maxSleep}h</div>
                  <p className="text-sm text-gray-600">Maior</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Clock className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-900">{stats.minSleep}h</div>
                  <p className="text-sm text-gray-600">Menor</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Sono Diário</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sleepData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}h`, 'Duração']} />
                  <Bar dataKey="duration" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Média Semanal</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}h`, 'Média']} />
                  <Line type="monotone" dataKey="average" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Humor</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={moodData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {moodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Horários de Sono</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sleepData.slice(0, 7).map((entry, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold">{entry.date}</div>
                      <div className="text-sm text-gray-600">
                        {entry.startTime} - {entry.endTime}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{entry.duration}h</div>
                      <div className="text-sm text-gray-500">{entry.mood}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {sleepData.length === 0 && (
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Adicione registros de sono para ver os relatórios!</p>
          </div>
        )}
      </div>
    </div>
  )
}