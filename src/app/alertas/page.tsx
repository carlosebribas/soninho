'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Bell, Clock, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { BackButton } from '@/components/BackButton'

interface Alert {
  id: string
  time: string
  message: string
  enabled: boolean
  type: 'nap' | 'bedtime' | 'wake'
}

export default function AlertasPersonalizados() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [newAlert, setNewAlert] = useState({
    time: '',
    message: '',
    type: 'nap' as const
  })

  // Load alerts from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sleepAlerts')
    if (saved) {
      setAlerts(JSON.parse(saved))
    }
  }, [])

  // Save alerts to localStorage
  useEffect(() => {
    localStorage.setItem('sleepAlerts', JSON.stringify(alerts))
  }, [alerts])

  // Check for alerts every minute
  useEffect(() => {
    const checkAlerts = () => {
      const now = new Date()
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

      alerts.forEach(alert => {
        if (alert.enabled && alert.time === currentTime) {
          // In a real app, this would trigger a notification
          toast.success(`🔔 ${alert.message}`, {
            description: `Horário: ${alert.time}`,
            duration: 5000,
          })
        }
      })
    }

    const interval = setInterval(checkAlerts, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [alerts])

  const addAlert = () => {
    if (!newAlert.time || !newAlert.message) return

    const alert: Alert = {
      id: Date.now().toString(),
      time: newAlert.time,
      message: newAlert.message,
      enabled: true,
      type: newAlert.type
    }

    setAlerts([...alerts, alert])
    setNewAlert({ time: '', message: '', type: 'nap' })
    toast.success('Alerta adicionado com sucesso!')
  }

  const toggleAlert = (id: string) => {
    setAlerts(alerts.map(alert =>
      alert.id === id ? { ...alert, enabled: !alert.enabled } : alert
    ))
  }

  const deleteAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id))
    toast.success('Alerta removido!')
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'nap': return '😴'
      case 'bedtime': return '🌙'
      case 'wake': return '🌅'
      default: return '🔔'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'nap': return 'Soneca'
      case 'bedtime': return 'Hora de dormir'
      case 'wake': return 'Hora de acordar'
      default: return 'Alerta'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="max-w-4xl mx-auto">
        <BackButton />
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-900 mb-2 flex items-center justify-center gap-2">
            <Bell className="w-8 h-8" />
            Alertas Personalizados
          </h1>
          <p className="text-gray-600">Configure lembretes para a rotina de sono do seu bebê</p>
        </div>

        {/* Add New Alert */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Novo Alerta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="time">Horário</Label>
                <Input
                  id="time"
                  type="time"
                  value={newAlert.time}
                  onChange={(e) => setNewAlert({...newAlert, time: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="type">Tipo de alerta</Label>
                <select
                  id="type"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={newAlert.type}
                  onChange={(e) => setNewAlert({...newAlert, type: e.target.value as any})}
                >
                  <option value="nap">Soneca</option>
                  <option value="bedtime">Hora de dormir</option>
                  <option value="wake">Hora de acordar</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="message">Mensagem</Label>
              <Input
                id="message"
                placeholder="Ex: Hora da soneca da tarde!"
                value={newAlert.message}
                onChange={(e) => setNewAlert({...newAlert, message: e.target.value})}
              />
            </div>
            <Button onClick={addAlert} className="w-full">
              Adicionar Alerta
            </Button>
          </CardContent>
        </Card>

        {/* Alerts List */}
        <div className="space-y-4">
          {alerts.map((alert) => (
            <Card key={alert.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{getTypeIcon(alert.type)}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="font-semibold">{alert.time}</span>
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {getTypeLabel(alert.type)}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-1">{alert.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={alert.enabled}
                      onCheckedChange={() => toggleAlert(alert.id)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteAlert(alert.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {alerts.length === 0 && (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum alerta configurado. Adicione o primeiro!</p>
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Dicas para Alertas</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Configure alertas 15-30 minutos antes da rotina</li>
            <li>• Use mensagens curtas e claras</li>
            <li>• Ative alertas apenas quando necessário</li>
            <li>• Ajuste conforme a rotina do seu bebê evolui</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
