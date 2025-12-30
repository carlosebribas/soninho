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
      className="mb-4 flex items-center gap-2 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 transition-colors"
    >
      <ArrowLeft className="w-4 h-4" />
      Voltar ao Início
    </Button>
  )
}
