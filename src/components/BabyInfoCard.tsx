'use client'

import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Baby, Calendar, MapPin, User, Stethoscope, Edit2, Loader2 } from 'lucide-react'
import { Button } from './ui/button'
import Link from 'next/link'
import { differenceInDays, differenceInMonths, differenceInYears, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useBabyProfile } from '@/hooks/useBabyProfile'

export function BabyInfoCard() {
  const { profile: babyData, loading } = useBabyProfile()

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
        <CardContent className="pt-6">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-purple-400 mx-auto mb-3 animate-spin" />
            <p className="text-gray-600 dark:text-gray-300">
              Carregando informações...
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!babyData || !babyData.nome) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
        <CardContent className="pt-6">
          <div className="text-center">
            <Baby className="w-12 h-12 text-purple-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Cadastre as informações do seu bebê para começar
            </p>
            <Link href="/cadastro">
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                <Baby className="w-4 h-4 mr-2" />
                Cadastrar Bebê
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  const calculateAge = (birthDate: string) => {
    // Parse da data no formato YYYY-MM-DD sem conversão de timezone
    const [year, month, day] = birthDate.split('-').map(Number)
    const birth = new Date(year, month - 1, day) // month é 0-indexed
    const now = new Date()

    const years = differenceInYears(now, birth)
    const months = differenceInMonths(now, birth) % 12
    const days = differenceInDays(now, new Date(now.getFullYear(), now.getMonth() - months, birth.getDate()))

    if (years > 0) {
      return `${years} ano${years > 1 ? 's' : ''} e ${months} mês${months !== 1 ? 'es' : ''}`
    } else if (months > 0) {
      return `${months} mês${months !== 1 ? 'es' : ''} e ${days} dia${days !== 1 ? 's' : ''}`
    } else {
      return `${days} dia${days !== 1 ? 's' : ''}`
    }
  }

  const formatBirthDate = (date: string, time: string) => {
    try {
      // Parse da data no formato YYYY-MM-DD sem conversão de timezone
      const [year, month, day] = date.split('-').map(Number)
      const birthDate = new Date(year, month - 1, day) // month é 0-indexed
      return `${format(birthDate, "dd/MM/yyyy", { locale: ptBR })} às ${time}`
    } catch {
      return `${date} às ${time}`
    }
  }

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-purple-900 dark:text-purple-100">
            <Baby className="w-6 h-6" />
            Informações do Bebê
          </CardTitle>
          <Link href="/cadastro">
            <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700 hover:bg-purple-100">
              <Edit2 className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Nome e Idade */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
          <h3 className="text-2xl font-bold text-purple-900 dark:text-purple-100 mb-1">
            {babyData.nome}
          </h3>
          <p className="text-lg text-purple-600 dark:text-purple-300 font-medium">
            {calculateAge(babyData.dataNascimento)}
          </p>
        </div>

        {/* Informações de Nascimento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-gray-600 dark:text-gray-400">Nascimento</p>
              <p className="text-gray-900 dark:text-white font-medium">
                {formatBirthDate(babyData.dataNascimento, babyData.horaNascimento)}
              </p>
            </div>
          </div>

          {babyData.cidadeNascimento && (
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-gray-600 dark:text-gray-400">Cidade</p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {babyData.cidadeNascimento}
                </p>
              </div>
            </div>
          )}

          {babyData.nomeMae && (
            <div className="flex items-start gap-2">
              <User className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-gray-600 dark:text-gray-400">Mãe</p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {babyData.nomeMae}
                </p>
              </div>
            </div>
          )}

          {babyData.nomePai && (
            <div className="flex items-start gap-2">
              <User className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-gray-600 dark:text-gray-400">Pai</p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {babyData.nomePai}
                </p>
              </div>
            </div>
          )}

          {babyData.pediatra && (
            <div className="flex items-start gap-2">
              <Stethoscope className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-gray-600 dark:text-gray-400">Pediatra</p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {babyData.pediatra}
                </p>
                {babyData.telefonePediatra && (
                  <p className="text-gray-600 dark:text-gray-400 text-xs">
                    {babyData.telefonePediatra}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
