'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Moon, Sun, Clock, Plus, Coffee, TrendingUp, AlertCircle, Lightbulb } from 'lucide-react'
import { format, differenceInMinutes, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { BackButton } from '@/components/BackButton'

interface SleepEntry {
  id: string
  date: string
  startTime: string
  endTime: string | null // null quando ainda está dormindo
  notes: string
  moodBefore?: string // humor antes de dormir
  moodAfter?: string // humor após acordar
  type: 'sono' | 'soneca'
  isPending: boolean // true quando ainda não completou o registro
}

interface SleepWindow {
  awakeDuration: number
  napDuration?: number
}

export default function DiarioSono() {
  const [entries, setEntries] = useState<SleepEntry[]>([])
  const [sleepType, setSleepType] = useState<'sono' | 'soneca'>('sono')
  const [newEntry, setNewEntry] = useState({
    startTime: '',
    endTime: '',
    notes: '',
    mood: ''
  })

  // Load entries from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sleepDiary')
    if (saved) {
      setEntries(JSON.parse(saved))
    }
  }, [])

  // Save entries to localStorage whenever entries change
  useEffect(() => {
    localStorage.setItem('sleepDiary', JSON.stringify(entries))
  }, [entries])

  const addEntry = () => {
    if (!newEntry.startTime || !newEntry.endTime) return

    const entry: SleepEntry = {
      id: Date.now().toString(),
      date: format(new Date(), 'yyyy-MM-dd'),
      startTime: newEntry.startTime,
      endTime: newEntry.endTime,
      notes: newEntry.notes,
      mood: newEntry.mood,
      type: sleepType
    }

    setEntries([entry, ...entries])
    setNewEntry({ startTime: '', endTime: '', notes: '', mood: '' })
  }

  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(`2000-01-01T${start}`)
    let endDate = new Date(`2000-01-01T${end}`)
    
    // Se o horário de fim for menor que o de início, adiciona um dia
    if (endDate < startDate) {
      endDate = new Date(`2000-01-02T${end}`)
    }
    
    const diff = endDate.getTime() - startDate.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return { hours, minutes, text: `${hours}h ${minutes}min` }
  }

  const analyzeSleepWindows = () => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const todayEntries = entries
      .filter(e => e.date === today)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))

    const windows: SleepWindow[] = []
    
    for (let i = 0; i < todayEntries.length - 1; i++) {
      const currentEnd = todayEntries[i].endTime
      const nextStart = todayEntries[i + 1].startTime
      
      const endDate = new Date(`2000-01-01T${currentEnd}`)
      const startDate = new Date(`2000-01-01T${nextStart}`)
      
      const awakeDuration = differenceInMinutes(startDate, endDate)
      
      if (todayEntries[i].type === 'soneca') {
        const napDuration = calculateDuration(todayEntries[i].startTime, todayEntries[i].endTime)
        windows.push({
          awakeDuration,
          napDuration: napDuration.hours * 60 + napDuration.minutes
        })
      } else {
        windows.push({ awakeDuration })
      }
    }

    return windows
  }

  const getSleepSuggestions = () => {
    const windows = analyzeSleepWindows()
    const suggestions: string[] = []
    
    const naps = entries.filter(e => e.type === 'soneca' && e.date === format(new Date(), 'yyyy-MM-dd'))
    const totalNaps = naps.length
    
    // Análise baseada em idade (assumindo bebê de 3-6 meses)
    if (totalNaps === 0) {
      suggestions.push('💤 Considere adicionar 2-3 sonecas durante o dia para bebês de 3-6 meses.')
    } else if (totalNaps > 4) {
      suggestions.push('⚠️ Muitas sonecas podem afetar o sono noturno. Tente consolidar em 2-3 sonecas.')
    }

    // Análise de janelas de sono
    windows.forEach((window, index) => {
      if (window.awakeDuration > 180) { // Mais de 3 horas acordado
        suggestions.push(`⏰ Janela ${index + 1}: Tempo acordado muito longo (${Math.floor(window.awakeDuration / 60)}h). Ideal: 1.5-2.5h para bebês pequenos.`)
      } else if (window.awakeDuration < 60) { // Menos de 1 hora acordado
        suggestions.push(`⏰ Janela ${index + 1}: Tempo acordado muito curto (${window.awakeDuration}min). Pode não estar cansado o suficiente.`)
      }

      if (window.napDuration && window.napDuration > 120) { // Soneca > 2h
        suggestions.push(`😴 Soneca ${index + 1} muito longa (${Math.floor(window.napDuration / 60)}h). Considere limitar a 1.5-2h.`)
      }
    })

    // Sugestões gerais
    if (suggestions.length === 0) {
      suggestions.push('✅ Padrão de sono está dentro do esperado! Continue monitorando.')
      suggestions.push('💡 Dica: Mantenha horários consistentes para ajudar na rotina do bebê.')
    }

    return suggestions
  }

  const getTodayStats = () => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const todayEntries = entries.filter(e => e.date === today)
    
    const naps = todayEntries.filter(e => e.type === 'soneca')
    const nightSleep = todayEntries.filter(e => e.type === 'sono')
    
    let totalNapTime = 0
    naps.forEach(nap => {
      const duration = calculateDuration(nap.startTime, nap.endTime)
      totalNapTime += duration.hours * 60 + duration.minutes
    })

    let totalNightSleep = 0
    nightSleep.forEach(sleep => {
      const duration = calculateDuration(sleep.startTime, sleep.endTime)
      totalNightSleep += duration.hours * 60 + duration.minutes
    })

    return {
      napCount: naps.length,
      totalNapTime,
      totalNightSleep,
      totalSleep: totalNapTime + totalNightSleep
    }
  }

  const stats = getTodayStats()
  const suggestions = getSleepSuggestions()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <BackButton />
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-900 mb-2 flex items-center justify-center gap-2">
            <Moon className="w-8 h-8" />
            Diário de Sono
          </h1>
          <p className="text-gray-600">Registre os horários de sono e sonecas do seu bebê</p>
        </div>

        {/* Estatísticas do Dia */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <Coffee className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{stats.napCount}</p>
              <p className="text-sm text-gray-600">Sonecas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{Math.floor(stats.totalNapTime / 60)}h {stats.totalNapTime % 60}m</p>
              <p className="text-sm text-gray-600">Tempo Sonecas</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Moon className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{Math.floor(stats.totalNightSleep / 60)}h {stats.totalNightSleep % 60}m</p>
              <p className="text-sm text-gray-600">Sono Noturno</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{Math.floor(stats.totalSleep / 60)}h {stats.totalSleep % 60}m</p>
              <p className="text-sm text-gray-600">Total Hoje</p>
            </CardContent>
          </Card>
        </div>

        {/* Sugestões de Rotina */}
        {suggestions.length > 0 && (
          <Card className="mb-6 border-l-4 border-l-yellow-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-700">
                <Lightbulb className="w-5 h-5" />
                Sugestões de Rotina
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-yellow-600" />
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Add New Entry */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Novo Registro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Tipo de Sono */}
            <div>
              <Label>Tipo de Registro</Label>
              <div className="flex gap-4 mt-2">
                <Button
                  type="button"
                  variant={sleepType === 'sono' ? 'default' : 'outline'}
                  onClick={() => setSleepType('sono')}
                  className="flex-1"
                >
                  <Moon className="w-4 h-4 mr-2" />
                  Sono Noturno
                </Button>
                <Button
                  type="button"
                  variant={sleepType === 'soneca' ? 'default' : 'outline'}
                  onClick={() => setSleepType('soneca')}
                  className="flex-1"
                >
                  <Coffee className="w-4 h-4 mr-2" />
                  Soneca
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Horário de dormir</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={newEntry.startTime}
                  onChange={(e) => setNewEntry({...newEntry, startTime: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="endTime">Horário de acordar</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={newEntry.endTime}
                  onChange={(e) => setNewEntry({...newEntry, endTime: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="mood">Humor (opcional)</Label>
              <Input
                id="mood"
                placeholder="Ex: Feliz, Irritado, Calmo..."
                value={newEntry.mood}
                onChange={(e) => setNewEntry({...newEntry, mood: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="notes">Anotações</Label>
              <Textarea
                id="notes"
                placeholder="Observações sobre o sono, eventos especiais..."
                value={newEntry.notes}
                onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})}
                rows={3}
              />
            </div>
            <Button onClick={addEntry} className="w-full">
              Adicionar Registro
            </Button>
          </CardContent>
        </Card>

        {/* Sleep Entries */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Histórico de Registros</h2>
          {entries.map((entry) => (
            <Card key={entry.id} className={entry.type === 'soneca' ? 'border-l-4 border-l-orange-400' : 'border-l-4 border-l-indigo-600'}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {entry.type === 'soneca' ? (
                      <Coffee className="w-5 h-5 text-orange-600" />
                    ) : (
                      <Moon className="w-5 h-5 text-indigo-600" />
                    )}
                    <span className="font-semibold text-gray-700">
                      {entry.type === 'soneca' ? 'Soneca' : 'Sono Noturno'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    {calculateDuration(entry.startTime, entry.endTime).text}
                  </div>
                </div>
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-gray-500" />
                    <span className="font-semibold">{entry.startTime}</span>
                  </div>
                  <span className="text-gray-400">→</span>
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-yellow-600" />
                    <span className="font-semibold">{entry.endTime}</span>
                  </div>
                </div>
                {entry.mood && (
                  <p className="mt-2 text-sm text-gray-600">
                    <strong>Humor:</strong> {entry.mood}
                  </p>
                )}
                {entry.notes && (
                  <p className="mt-2 text-sm text-gray-600">
                    <strong>Anotações:</strong> {entry.notes}
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  {format(new Date(entry.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {entries.length === 0 && (
          <div className="text-center py-12">
            <Moon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum registro ainda. Adicione o primeiro sono ou soneca!</p>
          </div>
        )}
      </div>
    </div>
  )
}
