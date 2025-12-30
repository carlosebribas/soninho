'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Settings, Thermometer, Volume2, Lightbulb, Wind, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { BackButton } from '@/components/BackButton'

interface EnvironmentSettings {
  temperature: number
  humidity: number
  noiseLevel: number
  lightLevel: number
  airQuality: boolean
  nightMode: boolean
  whiteNoise: boolean
}

export default function ConfiguracoesAmbiente() {
  const [settings, setSettings] = useState<EnvironmentSettings>({
    temperature: 22,
    humidity: 50,
    noiseLevel: 30,
    lightLevel: 20,
    airQuality: true,
    nightMode: false,
    whiteNoise: true
  })

  const { theme, setTheme } = useTheme()

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('environmentSettings')
    if (saved) {
      setSettings(JSON.parse(saved))
    }
  }, [])

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('environmentSettings', JSON.stringify(settings))
  }, [settings])

  const updateSetting = (key: keyof EnvironmentSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const getTemperatureColor = (temp: number) => {
    if (temp < 18) return 'text-blue-600'
    if (temp > 24) return 'text-red-600'
    return 'text-green-600'
  }

  const getHumidityStatus = (humidity: number) => {
    if (humidity < 30) return { status: 'Baixa', color: 'text-red-600', advice: 'Use um umidificador' }
    if (humidity > 60) return { status: 'Alta', color: 'text-blue-600', advice: 'Melhore a ventilação' }
    return { status: 'Ideal', color: 'text-green-600', advice: 'Perfeito!' }
  }

  const getNoiseStatus = (noise: number) => {
    if (noise > 50) return { status: 'Alto', color: 'text-red-600', advice: 'Reduza ruídos externos' }
    if (noise > 30) return { status: 'Moderado', color: 'text-yellow-600', advice: 'Considere ruído branco' }
    return { status: 'Baixo', color: 'text-green-600', advice: 'Ambiente tranquilo' }
  }

  const getLightStatus = (light: number) => {
    if (light > 70) return { status: 'Muito claro', color: 'text-yellow-600', advice: 'Use cortinas blackout' }
    if (light > 40) return { status: 'Claro', color: 'text-orange-600', advice: 'Reduza iluminação' }
    return { status: 'Escuro', color: 'text-green-600', advice: 'Ideal para dormir' }
  }

  const humidityInfo = getHumidityStatus(settings.humidity)
  const noiseInfo = getNoiseStatus(settings.noiseLevel)
  const lightInfo = getLightStatus(settings.lightLevel)

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-4">
      <div className="max-w-4xl mx-auto">
        <BackButton />
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-900 mb-2 flex items-center justify-center gap-2">
            <Settings className="w-8 h-8" />
            Configurações de Ambiente
          </h1>
          <p className="text-gray-600">Configure o ambiente ideal para o sono do seu bebê</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Temperature */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Thermometer className="w-5 h-5" />
                Temperatura
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Temperatura ideal: 20-22°C</Label>
                <span className={`text-2xl font-bold ${getTemperatureColor(settings.temperature)}`}>
                  {settings.temperature}°C
                </span>
              </div>
              <Slider
                value={[settings.temperature]}
                onValueChange={(value) => updateSetting('temperature', value[0])}
                max={30}
                min={15}
                step={1}
                className="w-full"
              />
              <div className="text-sm text-gray-600">
                {settings.temperature < 20 && "⚠️ Temperatura baixa pode causar desconforto"}
                {settings.temperature >= 20 && settings.temperature <= 22 && "✅ Temperatura ideal!"}
                {settings.temperature > 22 && "⚠️ Temperatura alta pode causar agitação"}
              </div>
            </CardContent>
          </Card>

          {/* Humidity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wind className="w-5 h-5" />
                Umidade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Umidade ideal: 40-60%</Label>
                <Badge className={humidityInfo.color}>
                  {humidityInfo.status}: {settings.humidity}%
                </Badge>
              </div>
              <Slider
                value={[settings.humidity]}
                onValueChange={(value) => updateSetting('humidity', value[0])}
                max={80}
                min={20}
                step={5}
                className="w-full"
              />
              <div className="text-sm text-gray-600">
                💡 {humidityInfo.advice}
              </div>
            </CardContent>
          </Card>

          {/* Noise Level */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="w-5 h-5" />
                Nível de Ruído
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Ruído ideal: baixo</Label>
                <Badge className={noiseInfo.color}>
                  {noiseInfo.status}
                </Badge>
              </div>
              <Slider
                value={[settings.noiseLevel]}
                onValueChange={(value) => updateSetting('noiseLevel', value[0])}
                max={100}
                min={0}
                step={10}
                className="w-full"
              />
              <div className="flex items-center gap-2">
                <Switch
                  checked={settings.whiteNoise}
                  onCheckedChange={(checked) => updateSetting('whiteNoise', checked)}
                />
                <Label>Ruído branco ativado</Label>
              </div>
              <div className="text-sm text-gray-600">
                💡 {noiseInfo.advice}
              </div>
            </CardContent>
          </Card>

          {/* Light Level */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Iluminação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Iluminação ideal: escuro</Label>
                <Badge className={lightInfo.color}>
                  {lightInfo.status}
                </Badge>
              </div>
              <Slider
                value={[settings.lightLevel]}
                onValueChange={(value) => updateSetting('lightLevel', value[0])}
                max={100}
                min={0}
                step={10}
                className="w-full"
              />
              <div className="text-sm text-gray-600">
                💡 {lightInfo.advice}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Configurações Adicionais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Qualidade do Ar</Label>
                <p className="text-sm text-gray-600">Monitorar e melhorar a qualidade do ar</p>
              </div>
              <Switch
                checked={settings.airQuality}
                onCheckedChange={(checked) => updateSetting('airQuality', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Modo Noturno</Label>
                <p className="text-sm text-gray-600">Interface otimizada para uso noturno</p>
              </div>
              <Switch
                checked={settings.nightMode}
                onCheckedChange={(checked) => {
                  updateSetting('nightMode', checked)
                  setTheme(checked ? 'dark' : 'light')
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Environment Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo do Ambiente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <Thermometer className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{settings.temperature}°C</div>
                <div className="text-sm text-gray-600">Temperatura</div>
              </div>
              <div className="text-center">
                <Wind className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{settings.humidity}%</div>
                <div className="text-sm text-gray-600">Umidade</div>
              </div>
              <div className="text-center">
                <Volume2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{settings.noiseLevel}%</div>
                <div className="text-sm text-gray-600">Ruído</div>
              </div>
              <div className="text-center">
                <Lightbulb className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{settings.lightLevel}%</div>
                <div className="text-sm text-gray-600">Luz</div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
              <h3 className="font-semibold text-indigo-900 mb-2">💡 Recomendações para Melhorar o Ambiente:</h3>
              <ul className="text-sm text-indigo-800 space-y-1">
                {settings.temperature < 20 || settings.temperature > 22 ? (
                  <li>• Ajuste a temperatura para 20-22°C</li>
                ) : (
                  <li>• ✅ Temperatura ideal mantida</li>
                )}
                {settings.humidity < 40 || settings.humidity > 60 ? (
                  <li>• Regule a umidade para 40-60%</li>
                ) : (
                  <li>• ✅ Umidade ideal mantida</li>
                )}
                {settings.noiseLevel > 30 ? (
                  <li>• Considere usar ruído branco</li>
                ) : (
                  <li>• ✅ Ambiente tranquilo</li>
                )}
                {settings.lightLevel > 40 ? (
                  <li>• Use cortinas blackout para escurecer</li>
                ) : (
                  <li>• ✅ Iluminação adequada</li>
                )}
                {settings.airQuality && <li>• ✅ Monitoramento da qualidade do ar ativado</li>}
                {settings.whiteNoise && <li>• ✅ Ruído branco ativado</li>}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}