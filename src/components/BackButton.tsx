'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export function BackButton() {
  const router = useRouter()

  return (
    <Button
      onClick={() => router.push('/')}
      variant="outline"
      className="mb-4 flex items-center gap-2 hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:text-teal-700 dark:hover:text-teal-300 hover:border-teal-300 dark:hover:border-teal-700 transition-colors"
    >
      <ArrowLeft className="w-4 h-4" />
      Voltar ao Início
    </Button>
  )
}
