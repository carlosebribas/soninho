'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { History, Plus, Calendar, Baby, Star } from 'lucide-react'
import { format, differenceInMonths, differenceInDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { BackButton } from '@/components/BackButton'

interface Milestone {
  id: string
  date: string
  title: string
  description: string
  category: 'fisico' | 'cognitivo' | 'social' | 'linguagem' | 'sono'
  age: string
  notes: string
}

export default function HistoricoDesenvolvimento() {
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [newMilestone, setNewMilestone] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    title: '',
    description: '',
    category: 'fisico' as const,
    age: '',
    notes: ''
  })
  const [babyBirthDate, setBabyBirthDate] = useState<string | null>(null)

  // Load baby birth date from localStorage
  useEffect(() => {
    const cadastro = localStorage.getItem('cadastroBebe')
    if (cadastro) {
      const data = JSON.parse(cadastro)
      if (data.dataNascimento) {
        setBabyBirthDate(data.dataNascimento)
      }
    }
  }, [])

  // Calculate age based on milestone date and birth date
  const calculateAge = (milestoneDate: string): string => {
    if (!babyBirthDate) return ''
    
    const birthDate = new Date(babyBirthDate)
    const marcoDate = new Date(milestoneDate)
    
    const months = differenceInMonths(marcoDate, birthDate)
    const days = differenceInDays(marcoDate, birthDate) % 30
    
    if (months === 0) {
      return `${days} ${days === 1 ? 'dia' : 'dias'}`
    } else if (months < 12) {
      if (days === 0) {
        return `${months} ${months === 1 ? 'mês' : 'meses'}`
      }
      return `${months} ${months === 1 ? 'mês' : 'meses'} e ${days} ${days === 1 ? 'dia' : 'dias'}`
    } else {
      const years = Math.floor(months / 12)
      const remainingMonths = months % 12
      if (remainingMonths === 0) {
        return `${years} ${years === 1 ? 'ano' : 'anos'}`
      }
      return `${years} ${years === 1 ? 'ano' : 'anos'} e ${remainingMonths} ${remainingMonths === 1 ? 'mês' : 'meses'}`
    }
  }

  // Load milestones from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('developmentMilestones')
    if (saved) {
      setMilestones(JSON.parse(saved))
    } else {
      // Initialize with sample milestones
      const sampleMilestones: Milestone[] = [
        {
          id: '1',
          date: format(new Date(Date.now() - 86400000 * 30), 'yyyy-MM-dd'),
          title: 'Primeiro Sorriso',
          description: 'O bebê deu seu primeiro sorriso social',
          category: 'social',
          age: '2 meses',
          notes: 'Foi durante uma conversa comigo, muito fofo!'
        },
        {
          id: '2',
          date: format(new Date(Date.now() - 86400000 * 60), 'yyyy-MM-dd'),
          title: 'Controle da Cabeça',
          description: 'Consegue manter a cabeça erguida por alguns segundos',
          category: 'fisico',
          age: '3 meses',
          notes: 'Melhorou muito depois das sessões de fisioterapia'
        },
        {
          id: '3',
          date: format(new Date(Date.now() - 86400000 * 90), 'yyyy-MM-dd'),
          title: 'Primeira Palavra',
          description: 'Disse "mamã" pela primeira vez',
          category: 'linguagem',
          age: '1 ano',
          notes: 'Foi muito emocionante! Repetiu várias vezes.'
        }
      ]
      setMilestones(sampleMilestones)
      localStorage.setItem('developmentMilestones', JSON.stringify(sampleMilestones))
    }
  }, [])

  // Save milestones to localStorage
  useEffect(() => {
    localStorage.setItem('developmentMilestones', JSON.stringify(milestones))
  }, [milestones])

  // Auto-calculate age when date changes
  useEffect(() => {
    if (babyBirthDate && newMilestone.date) {
      const calculatedAge = calculateAge(newMilestone.date)
      setNewMilestone(prev => ({ ...prev, age: calculatedAge }))
    }
  }, [newMilestone.date, babyBirthDate])

  const addMilestone = () => {
    if (!newMilestone.title || !newMilestone.description) return

    const milestone: Milestone = {
      id: Date.now().toString(),
      date: newMilestone.date,
      title: newMilestone.title,
      description: newMilestone.description,
      category: newMilestone.category,
      age: newMilestone.age,
      notes: newMilestone.notes
    }

    setMilestones([milestone, ...milestones])
    setNewMilestone({
      date: format(new Date(), 'yyyy-MM-dd'),
      title: '',
      description: '',
      category: 'fisico',
      age: '',
      notes: ''
    })
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'fisico': return 'bg-red-100 text-red-800'
      case 'cognitivo': return 'bg-blue-100 text-blue-800'
      case 'social': return 'bg-green-100 text-green-800'
      case 'linguagem': return 'bg-purple-100 text-purple-800'
      case 'sono': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'fisico': return '💪'
      case 'cognitivo': return '🧠'
      case 'social': return '👥'
      case 'linguagem': return '🗣️'
      case 'sono': return '😴'
      default: return '⭐'
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'fisico': return 'Físico'
      case 'cognitivo': return 'Cognitivo'
      case 'social': return 'Social'
      case 'linguagem': return 'Linguagem'
      case 'sono': return 'Sono'
      default: return category
    }
  }

  const milestonesByCategory = milestones.reduce((acc, milestone) => {
    if (!acc[milestone.category]) {
      acc[milestone.category] = []
    }
    acc[milestone.category].push(milestone)
    return acc
  }, {} as Record<string, Milestone[]>)

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 p-4">
      <div className="max-w-6xl mx-auto">
        <BackButton />
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-orange-900 mb-2 flex items-center justify-center gap-2">
            <History className="w-8 h-8" />
            Histórico de Desenvolvimento
          </h1>
          <p className="text-gray-600">Registre os marcos importantes no desenvolvimento do seu bebê</p>
        </div>

        {/* Add New Milestone */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Novo Marco
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={newMilestone.date}
                  onChange={(e) => setNewMilestone({...newMilestone, date: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="age">Idade do bebê</Label>
                <Input
                  id="age"
                  placeholder="Calculada automaticamente"
                  value={newMilestone.age}
                  readOnly
                  className="bg-gray-50 cursor-not-allowed"
                  title={babyBirthDate ? "Idade calculada automaticamente com base na data de nascimento" : "Configure a data de nascimento no cadastro do bebê"}
                />
                {!babyBirthDate && (
                  <p className="text-xs text-orange-600 mt-1">
                    Configure a data de nascimento no cadastro do bebê para cálculo automático
                  </p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="title">Título do marco</Label>
              <Input
                id="title"
                placeholder="Ex: Primeiro passo, Primeira palavra"
                value={newMilestone.title}
                onChange={(e) => setNewMilestone({...newMilestone, title: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descreva o que aconteceu..."
                value={newMilestone.description}
                onChange={(e) => setNewMilestone({...newMilestone, description: e.target.value})}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Categoria</Label>
                <select
                  id="category"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={newMilestone.category}
                  onChange={(e) => setNewMilestone({...newMilestone, category: e.target.value as any})}
                >
                  <option value="fisico">Físico</option>
                  <option value="cognitivo">Cognitivo</option>
                  <option value="social">Social</option>
                  <option value="linguagem">Linguagem</option>
                  <option value="sono">Sono</option>
                </select>
              </div>
              <div>
                <Label htmlFor="notes">Anotações (opcional)</Label>
                <Input
                  id="notes"
                  placeholder="Observações adicionais"
                  value={newMilestone.notes}
                  onChange={(e) => setNewMilestone({...newMilestone, notes: e.target.value})}
                />
              </div>
            </div>
            <Button onClick={addMilestone} className="w-full">
              Adicionar Marco
            </Button>
          </CardContent>
        </Card>

        {/* Milestones by Category */}
        <div className="space-y-6">
          {Object.entries(milestonesByCategory).map(([category, categoryMilestones]) => (
            <div key={category}>
              <h2 className="text-2xl font-bold text-orange-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">{getCategoryIcon(category)}</span>
                {getCategoryLabel(category)}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryMilestones.map((milestone) => (
                  <Card key={milestone.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{milestone.title}</CardTitle>
                        <Badge className={getCategoryColor(milestone.category)}>
                          {milestone.age}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(milestone.date), "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 mb-3">{milestone.description}</p>
                      {milestone.notes && (
                        <div className="bg-orange-50 p-3 rounded-lg">
                          <p className="text-sm text-orange-800">
                            <strong>Anotações:</strong> {milestone.notes}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {milestones.length === 0 && (
          <div className="text-center py-12">
            <Baby className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Comece registrando os primeiros marcos do desenvolvimento!</p>
          </div>
        )}

        {/* Development Tips */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Dicas para Acompanhar o Desenvolvimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">O que registrar:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Primeiros sorrisos e interações sociais</li>
                  <li>• Controle da cabeça e movimentos</li>
                  <li>• Primeiras palavras e sons</li>
                  <li>• Marcos motores (sentar, engatinhar, andar)</li>
                  <li>• Hábitos de sono e rotinas</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Quando consultar um especialista:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Atrasos significativos nos marcos</li>
                  <li>• Regressão em habilidades já adquiridas</li>
                  <li>• Dificuldades persistentes de sono</li>
                  <li>• Preocupações com desenvolvimento</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
