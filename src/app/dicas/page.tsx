'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookOpen, Star, Clock, Heart, Lightbulb } from 'lucide-react'
import { BackButton } from '@/components/BackButton'

interface Tip {
  id: string
  title: string
  content: string
  category: 'ambiente' | 'rotina' | 'alimentacao' | 'desenvolvimento'
  ageRange: string
  featured: boolean
}

export default function DicasSono() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const tips: Tip[] = [
    {
      id: '1',
      title: 'Ambiente Ideal para Dormir',
      content: 'Mantenha o quarto escuro, silencioso e com temperatura entre 20-22°C. Use cortinas blackout e um humidificador se o ar estiver muito seco.',
      category: 'ambiente',
      ageRange: '0-12 meses',
      featured: true
    },
    {
      id: '2',
      title: 'Rotina de Sono Consistente',
      content: 'Estabeleça horários fixos para dormir e acordar, mesmo nos fins de semana. Uma rotina previsível ajuda o bebê a entender quando é hora de dormir.',
      category: 'rotina',
      ageRange: '0-6 meses',
      featured: true
    },
    {
      id: '3',
      title: 'Banho Antes de Dormir',
      content: 'Um banho morno 1-2 horas antes da hora de dormir pode ajudar a relaxar o bebê e sinalizar que é hora de descansar.',
      category: 'rotina',
      ageRange: '2-12 meses',
      featured: false
    },
    {
      id: '4',
      title: 'Massagem Relaxante',
      content: 'Uma massagem suave com óleo de bebê pode ajudar a acalmar o bebê antes de dormir. Foque em movimentos circulares gentis.',
      category: 'rotina',
      ageRange: '1-6 meses',
      featured: false
    },
    {
      id: '5',
      title: 'Alimentação e Sono',
      content: 'Certifique-se de que o bebê esteja bem alimentado antes de dormir, mas evite alimentações pesadas imediatamente antes da hora de dormir.',
      category: 'alimentacao',
      ageRange: '0-12 meses',
      featured: true
    },
    {
      id: '6',
      title: 'Ruídos Brancos',
      content: 'Sons constantes como ventiladores, máquinas de ruído branco ou até mesmo o som de uma secadora podem ajudar a bloquear ruídos externos.',
      category: 'ambiente',
      ageRange: '0-12 meses',
      featured: false
    },
    {
      id: '7',
      title: 'Objeto de Transição',
      content: 'Introduza um objeto de conforto como uma manta macia ou ursinho para ajudar o bebê a se sentir seguro durante a noite.',
      category: 'desenvolvimento',
      ageRange: '6-12 meses',
      featured: false
    },
    {
      id: '8',
      title: 'Exposição à Luz Natural',
      content: 'Durante o dia, maximize a exposição à luz natural para regular o ritmo circadiano do bebê.',
      category: 'ambiente',
      ageRange: '0-12 meses',
      featured: false
    },
    {
      id: '9',
      title: 'Evitar Telas',
      content: 'Mantenha o bebê longe de telas pelo menos 1 hora antes de dormir, pois a luz azul pode interferir na produção de melatonina.',
      category: 'rotina',
      ageRange: '0-12 meses',
      featured: true
    },
    {
      id: '10',
      title: 'Sono Seguro',
      content: 'Sempre coloque o bebê para dormir de costas. Certifique-se de que não há objetos soltos no berço que possam causar asfixia.',
      category: 'ambiente',
      ageRange: '0-12 meses',
      featured: true
    }
  ]

  const categories = [
    { id: 'all', name: 'Todas', icon: BookOpen },
    { id: 'ambiente', name: 'Ambiente', icon: Lightbulb },
    { id: 'rotina', name: 'Rotina', icon: Clock },
    { id: 'alimentacao', name: 'Alimentação', icon: Heart },
    { id: 'desenvolvimento', name: 'Desenvolvimento', icon: Star }
  ]

  const filteredTips = selectedCategory === 'all'
    ? tips
    : tips.filter(tip => tip.category === selectedCategory)

  const featuredTips = tips.filter(tip => tip.featured)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-6xl mx-auto">
        <BackButton />
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-900 mb-2 flex items-center justify-center gap-2">
            <BookOpen className="w-8 h-8" />
            Dicas de Sono
          </h1>
          <p className="text-gray-600">Artigos e conselhos para melhorar o sono do seu bebê</p>
        </div>

        {/* Featured Tips */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-purple-900 mb-4 flex items-center gap-2">
            <Star className="w-6 h-6" />
            Dicas em Destaque
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTips.map((tip) => (
              <Card key={tip.id} className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{tip.title}</CardTitle>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      {tip.ageRange}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{tip.content}</p>
                  <Badge variant="outline" className="capitalize">
                    {tip.category}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center gap-2"
              >
                <category.icon className="w-4 h-4" />
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* All Tips */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTips.map((tip) => (
            <Card key={tip.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{tip.title}</CardTitle>
                  <div className="flex gap-2">
                    {tip.featured && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                    <Badge variant="secondary">{tip.ageRange}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{tip.content}</p>
                <Badge variant="outline" className="capitalize">
                  {categories.find(c => c.id === tip.category)?.name}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Resources */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>📚 Recursos Adicionais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-3">Livros Recomendados</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• "A Solução do Sono do Bebê" - Elizabeth Pantley</li>
                  <li>• "O Sono dos Justos" - Marc Weissbluth</li>
                  <li>• "Como seu bebê dorme" - Tracy Hogg</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-3">Sites Úteis</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Sociedade Brasileira de Pediatria</li>
                  <li>• La Leche League International</li>
                  <li>• KellyMom (amamentação e sono)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}