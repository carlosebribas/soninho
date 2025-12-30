'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, ArrowRight, ArrowLeft, Baby, Moon, Clock, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { BackButton } from '@/components/BackButton'

interface Question {
  id: string
  question: string
  icon: React.ElementType
  options: {
    value: string
    label: string
    description?: string
  }[]
}

const questions: Question[] = [
  {
    id: 'age',
    question: 'Qual a idade do seu bebê?',
    icon: Baby,
    options: [
      { value: '0-3', label: '0-3 meses', description: 'Recém-nascido' },
      { value: '4-6', label: '4-6 meses', description: 'Primeiros cochilos regulares' },
      { value: '7-12', label: '7-12 meses', description: 'Rotina estabelecida' },
      { value: '12+', label: '12+ meses', description: 'Transição para menos sonecas' }
    ]
  },
  {
    id: 'sleep-issues',
    question: 'Qual o principal desafio com o sono?',
    icon: Moon,
    options: [
      { value: 'falling-asleep', label: 'Dificuldade para adormecer', description: 'Demora muito para pegar no sono' },
      { value: 'night-waking', label: 'Acorda muito à noite', description: 'Despertares frequentes' },
      { value: 'short-naps', label: 'Sonecas muito curtas', description: 'Cochilos de menos de 30 minutos' },
      { value: 'irregular', label: 'Horários irregulares', description: 'Sem rotina definida' }
    ]
  },
  {
    id: 'nap-count',
    question: 'Quantas sonecas por dia o bebê faz?',
    icon: Clock,
    options: [
      { value: '1', label: '1 soneca', description: 'Geralmente após o almoço' },
      { value: '2', label: '2 sonecas', description: 'Manhã e tarde' },
      { value: '3+', label: '3 ou mais', description: 'Vários cochilos curtos' },
      { value: 'irregular', label: 'Varia muito', description: 'Sem padrão definido' }
    ]
  },
  {
    id: 'urgency',
    question: 'Qual seu nível de urgência para melhorar o sono?',
    icon: Calendar,
    options: [
      { value: 'urgent', label: 'Urgente', description: 'Preciso de ajuda agora!' },
      { value: 'soon', label: 'Em breve', description: 'Nas próximas semanas' },
      { value: 'planning', label: 'Planejando', description: 'Quero me organizar melhor' },
      { value: 'curious', label: 'Curiosidade', description: 'Apenas explorando' }
    ]
  }
]

export default function QuizPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [selectedOption, setSelectedOption] = useState<string>('')

  const currentQuestion = questions[currentStep]
  const progress = ((currentStep + 1) / questions.length) * 100
  const isLastQuestion = currentStep === questions.length - 1

  const handleSelectOption = (value: string) => {
    setSelectedOption(value)
  }

  const handleNext = () => {
    if (!selectedOption) return

    const newAnswers = { ...answers, [currentQuestion.id]: selectedOption }
    setAnswers(newAnswers)

    if (isLastQuestion) {
      // Salva as respostas e vai para o checkout
      localStorage.setItem('quizAnswers', JSON.stringify(newAnswers))
      router.push('/checkout')
    } else {
      setCurrentStep(currentStep + 1)
      setSelectedOption('')
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setSelectedOption(answers[questions[currentStep - 1].id] || '')
    }
  }

  const Icon = currentQuestion.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <BackButton />
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            🌙 Descubra o Plano Ideal
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Responda algumas perguntas para personalizar sua experiência
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Pergunta {currentStep + 1} de {questions.length}
            </span>
            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="p-6 sm:p-8 mb-6 border-none shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-full">
              <Icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {currentQuestion.question}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelectOption(option.value)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedOption === option.value
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-400 shadow-md'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white mb-1">
                      {option.label}
                    </div>
                    {option.description && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {option.description}
                      </div>
                    )}
                  </div>
                  {selectedOption === option.value && (
                    <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-4">
          <Button
            onClick={handleBack}
            disabled={currentStep === 0}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>

          <Button
            onClick={handleNext}
            disabled={!selectedOption}
            size="lg"
            className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            {isLastQuestion ? 'Ver Planos' : 'Próxima'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Steps Indicator */}
        <div className="flex justify-center gap-2 mt-8">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index <= currentStep
                  ? 'w-8 bg-indigo-600 dark:bg-indigo-400'
                  : 'w-2 bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
