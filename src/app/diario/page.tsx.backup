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
  const [sleepType, setSleepType] = useState<'sono' | 'soneca'>('soneca')
  const [newEntry, setNewEntry] = useState({
    startTime: '',
    endTime: '',
    notes: '',
    moodBefore: '',
    moodAfter: ''
  })
  const [editingEntry, setEditingEntry] = useState<string | null>(null)

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

  // Iniciar registro (apenas hora de dormir)
  const startSleepEntry = () => {
    if (!newEntry.startTime) return

    const entry: SleepEntry = {
      id: Date.now().toString(),
      date: format(new Date(), 'yyyy-MM-dd'),
      startTime: newEntry.startTime,
      endTime: null,
      notes: newEntry.notes,
      moodBefore: newEntry.moodBefore,
      type: sleepType,
      isPending: true
    }

    setEntries([entry, ...entries])
    setNewEntry({ startTime: '', endTime: '', notes: '', moodBefore: '', moodAfter: '' })
  }

  // Completar registro (adicionar hora de acordar)
  const completeSleepEntry = (entryId: string) => {
    if (!newEntry.endTime) return

    setEntries(entries.map(entry =>
      entry.id === entryId
        ? {
            ...entry,
            endTime: newEntry.endTime,
            moodAfter: newEntry.moodAfter,
            notes: newEntry.notes || entry.notes,
            isPending: false
          }
        : entry
    ))

    setEditingEntry(null)
    setNewEntry({ startTime: '', endTime: '', notes: '', moodBefore: '', moodAfter: '' })
  }

  // Cancelar edição
  const cancelEdit = () => {
    setEditingEntry(null)
    setNewEntry({ startTime: '', endTime: '', notes: '', moodBefore: '', moodAfter: '' })
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
      .filter(e => e.date === today && !e.isPending && e.endTime)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))

    const windows: SleepWindow[] = []

    for (let i = 0; i < todayEntries.length - 1; i++) {
      const currentEnd = todayEntries[i].endTime
      const nextStart = todayEntries[i + 1].startTime

      if (!currentEnd) continue

      const endDate = new Date(`2000-01-01T${currentEnd}`)
      const startDate = new Date(`2000-01-01T${nextStart}`)

      const awakeDuration = differenceInMinutes(startDate, endDate)

      if (todayEntries[i].type === 'soneca' && currentEnd) {
        const napDuration = calculateDuration(todayEntries[i].startTime, currentEnd)
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
    const todayEntries = entries.filter(e => e.date === today && !e.isPending)

    const naps = todayEntries.filter(e => e.type === 'soneca')
    const nightSleep = todayEntries.filter(e => e.type === 'sono')

    let totalNapTime = 0
    naps.forEach(nap => {
      if (nap.endTime) {
        const duration = calculateDuration(nap.startTime, nap.endTime)
        totalNapTime += duration.hours * 60 + duration.minutes
      }
    })

    let totalNightSleep = 0
    nightSleep.forEach(sleep => {
      if (sleep.endTime) {
        const duration = calculateDuration(sleep.startTime, sleep.endTime)
        totalNightSleep += duration.hours * 60 + duration.minutes
      }
    })

    return {
      napCount: naps.length,
      totalNapTime,
      totalNightSleep,
      totalSleep: totalNapTime + totalNightSleep
    }
  }

  const getPendingEntries = () => {
    return entries.filter(e => e.isPending)
  }

  const stats = getTodayStats()
  const suggestions = getSleepSuggestions()
  const pendingEntries = getPendingEntries()

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

        {/* Registros Pendentes (em andamento) */}
        {pendingEntries.length > 0 && (
          <Card className="mb-6 border-2 border-orange-400 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <Clock className="w-5 h-5 animate-pulse" />
                {pendingEntries.length === 1 ? 'Registro em Andamento' : `${pendingEntries.length} Registros em Andamento`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-orange-800 mb-4">
                Clique em "Completar Registro" quando o bebê acordar
              </p>
              <div className="space-y-3">
                {pendingEntries.map((entry) => (
                  <div key={entry.id} className="bg-white p-4 rounded-lg border border-orange-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {entry.type === 'soneca' ? (
                          <Coffee className="w-5 h-5 text-orange-600" />
                        ) : (
                          <Moon className="w-5 h-5 text-indigo-600" />
                        )}
                        <span className="font-semibold text-gray-800">
                          {entry.type === 'soneca' ? 'Soneca' : 'Sono Noturno'}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">Começou às {entry.startTime}</span>
                    </div>
                    {entry.moodBefore && (
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Humor antes:</strong> {entry.moodBefore}
                      </p>
                    )}
                    {entry.notes && (
                      <p className="text-sm text-gray-600 mb-3">
                        <strong>Notas:</strong> {entry.notes}
                      </p>
                    )}
                    <Button
                      onClick={() => setEditingEntry(entry.id)}
                      size="sm"
                      className="w-full bg-orange-600 hover:bg-orange-700"
                    >
                      Completar Registro
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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
              {editingEntry ? 'Completar Registro' : 'Novo Registro'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {editingEntry ? (
              // Modo de completar registro
              <>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                  <p className="text-sm text-blue-800">
                    Completando registro iniciado às {entries.find(e => e.id === editingEntry)?.startTime}
                  </p>
                </div>

                <div>
                  <Label htmlFor="endTime">Horário que acordou *</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={newEntry.endTime}
                    onChange={(e) => setNewEntry({...newEntry, endTime: e.target.value})}
                    className="text-lg"
                  />
                </div>

                <div>
                  <Label htmlFor="moodAfter">Humor ao acordar (opcional)</Label>
                  <Input
                    id="moodAfter"
                    placeholder="Ex: Feliz, Irritado, Calmo..."
                    value={newEntry.moodAfter}
                    onChange={(e) => setNewEntry({...newEntry, moodAfter: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Anotações adicionais (opcional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Alguma observação adicional..."
                    value={newEntry.notes}
                    onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})}
                    rows={2}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => completeSleepEntry(editingEntry)} className="flex-1">
                    Salvar Registro Completo
                  </Button>
                  <Button onClick={cancelEdit} variant="outline">
                    Cancelar
                  </Button>
                </div>
              </>
            ) : (
              // Modo de iniciar registro
              <>
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

                <div>
                  <Label htmlFor="startTime">Horário que começou a dormir *</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={newEntry.startTime}
                    onChange={(e) => setNewEntry({...newEntry, startTime: e.target.value})}
                    className="text-lg"
                  />
                </div>

                <div>
                  <Label htmlFor="moodBefore">Humor antes de dormir (opcional)</Label>
                  <Input
                    id="moodBefore"
                    placeholder="Ex: Irritado, Cansado, Tranquilo..."
                    value={newEntry.moodBefore}
                    onChange={(e) => setNewEntry({...newEntry, moodBefore: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Anotações (opcional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Observações antes de dormir..."
                    value={newEntry.notes}
                    onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})}
                    rows={2}
                  />
                </div>

                <Button onClick={startSleepEntry} className="w-full" disabled={!newEntry.startTime}>
                  Iniciar Registro
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Você poderá completar o registro depois quando o bebê acordar
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Sleep Entries */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Histórico de Registros</h2>
          {entries.filter(e => !e.isPending).map((entry) => (
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
                  {entry.endTime && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      {calculateDuration(entry.startTime, entry.endTime).text}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-gray-500" />
                    <span className="font-semibold">{entry.startTime}</span>
                  </div>
                  {entry.endTime && (
                    <>
                      <span className="text-gray-400">→</span>
                      <div className="flex items-center gap-2">
                        <Sun className="w-4 h-4 text-yellow-600" />
                        <span className="font-semibold">{entry.endTime}</span>
                      </div>
                    </>
                  )}
                </div>
                {(entry.moodBefore || entry.moodAfter) && (
                  <div className="mt-3 space-y-1">
                    {entry.moodBefore && (
                      <p className="text-sm text-gray-600">
                        <strong>Humor antes de dormir:</strong> {entry.moodBefore}
                      </p>
                    )}
                    {entry.moodAfter && (
                      <p className="text-sm text-gray-600">
                        <strong>Humor ao acordar:</strong> {entry.moodAfter}
                      </p>
                    )}
                  </div>
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
