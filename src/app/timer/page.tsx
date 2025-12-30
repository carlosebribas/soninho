'use client'

import { useState, useEffect } from 'react'
import { BackButton } from '@/components/BackButton'

export default function TimerPage() {
  const [time, setTime] = useState(0) // tempo em segundos
  const [isRunning, setIsRunning] = useState(false)
  const [selectedDuration, setSelectedDuration] = useState(20) // minutos padrão

  const durations = [5, 10, 15, 20, 25, 30] // minutos

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1)
      }, 1000)
    } else if (time === 0 && isRunning) {
      setIsRunning(false)
      // Aqui poderia tocar um alarme
      alert('Cochilo terminado!')
    }
    return () => clearInterval(interval)
  }, [isRunning, time])

  const startTimer = () => {
    setTime(selectedDuration * 60)
    setIsRunning(true)
  }

  const pauseTimer = () => {
    setIsRunning(false)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTime(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="absolute top-4 left-4">
        <BackButton />
      </div>
      <div className="text-center max-w-md bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-indigo-900 mb-6">Timer de Cochilo</h1>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duração (minutos):
          </label>
          <select
            value={selectedDuration}
            onChange={(e) => setSelectedDuration(Number(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded-md"
            disabled={isRunning}
          >
            {durations.map((duration) => (
              <option key={duration} value={duration}>
                {duration} minutos
              </option>
            ))}
          </select>
        </div>

        <div className="text-6xl font-mono text-indigo-600 mb-6">
          {formatTime(time)}
        </div>

        <div className="space-y-3 mb-6">
          {!isRunning && time === 0 && (
            <button
              onClick={startTimer}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Iniciar Cochilo
            </button>
          )}

          {isRunning && (
            <button
              onClick={pauseTimer}
              className="w-full bg-yellow-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-yellow-700 transition-colors"
            >
              Pausar
            </button>
          )}

          {!isRunning && time > 0 && (
            <button
              onClick={() => setIsRunning(true)}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Continuar
            </button>
          )}

          <button
            onClick={resetTimer}
            className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Resetar
          </button>
        </div>
      </div>
    </div>
  )
}