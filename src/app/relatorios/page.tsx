'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Calendar, Clock, Moon } from 'lucide-react'
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { BackButton } from '@/components/BackButton'

interface SleepEntry {
  id: string
  date: string
  startTime: string
  endTime: string
  notes: string
  mood?: string
}

export default function Relatorios() {
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

        <div className="mb-6 flex justify-center">
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