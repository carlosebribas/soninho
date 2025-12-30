'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Calendar, Syringe, Stethoscope, Trash2, Baby, ChevronLeft, ChevronRight, Bell, Clock } from 'lucide-react'
import Link from 'next/link'

interface Evento {
  id: string
  tipo: 'consulta' | 'vacina' | 'outro'
  titulo: string
  data: string
  hora: string
  observacoes: string
  alertas: {
    tresDias: boolean
    umDia: boolean
    umaHora: boolean
  }
}

interface SaltoDesenvolvimento {
  idade: string
  descricao: string
  marco: string
  meses: number
}

interface Alerta {
  eventoId: string
  titulo: string
  tipo: string
  dataEvento: string
  horaEvento: string
  tipoAlerta: '3 dias' | '1 dia' | '1 hora'
}

export default function AgendaPage() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [dataNascimento, setDataNascimento] = useState<string>('')
  const [mesAtual, setMesAtual] = useState(new Date())
  const [alertasAtivos, setAlertasAtivos] = useState<Alerta[]>([])
  const [novoEvento, setNovoEvento] = useState<Evento>({
    id: '',
    tipo: 'consulta',
    titulo: '',
    data: '',
    hora: '',
    observacoes: '',
    alertas: {
      tresDias: true,
      umDia: true,
      umaHora: true
    }
  })

  const saltosDesenvolvimento: SaltoDesenvolvimento[] = [
    { idade: '1 mês', descricao: 'Primeiros sorrisos sociais', marco: 'Começa a reconhecer rostos familiares', meses: 1 },
    { idade: '2 meses', descricao: 'Sustenta a cabeça', marco: 'Maior controle do pescoço', meses: 2 },
    { idade: '3 meses', descricao: 'Agarra objetos', marco: 'Coordenação mão-olho se desenvolve', meses: 3 },
    { idade: '4 meses', descricao: 'Rola de barriga para cima', marco: 'Maior mobilidade corporal', meses: 4 },
    { idade: '6 meses', descricao: 'Senta sem apoio', marco: 'Fortalecimento do tronco', meses: 6 },
    { idade: '7 meses', descricao: 'Engatinha', marco: 'Exploração do ambiente', meses: 7 },
    { idade: '9 meses', descricao: 'Fica em pé com apoio', marco: 'Preparação para andar', meses: 9 },
    { idade: '12 meses', descricao: 'Primeiros passos', marco: 'Independência motora', meses: 12 },
    { idade: '18 meses', descricao: 'Fala palavras simples', marco: 'Desenvolvimento da linguagem', meses: 18 },
    { idade: '24 meses', descricao: 'Forma frases curtas', marco: 'Comunicação mais complexa', meses: 24 }
  ]

  useEffect(() => {
    // Carregar eventos do localStorage
    const eventossalvos = localStorage.getItem('eventosAgenda')
    if (eventossalvos) {
      setEventos(JSON.parse(eventossalvos))
    }

    // Carregar data de nascimento do cadastro
    const cadastro = localStorage.getItem('cadastroBebe')
    if (cadastro) {
      const dados = JSON.parse(cadastro)
      setDataNascimento(dados.dataNascimento)
    }
  }, [])

  useEffect(() => {
    // Verificar alertas
    verificarAlertas()
  }, [eventos])

  const verificarAlertas = () => {
    const agora = new Date()
    const novosAlertas: Alerta[] = []

    eventos.forEach(evento => {
      // Verificar se o evento tem a propriedade alertas definida
      if (!evento.alertas) {
        return
      }

      const dataEvento = new Date(`${evento.data}T${evento.hora}`)
      const diffMs = dataEvento.getTime() - agora.getTime()
      const diffHoras = diffMs / (1000 * 60 * 60)
      const diffDias = diffHoras / 24

      // Alerta 3 dias antes
      if (evento.alertas.tresDias && diffDias <= 3 && diffDias > 1) {
        novosAlertas.push({
          eventoId: evento.id,
          titulo: evento.titulo,
          tipo: evento.tipo,
          dataEvento: evento.data,
          horaEvento: evento.hora,
          tipoAlerta: '3 dias'
        })
      }

      // Alerta 1 dia antes
      if (evento.alertas.umDia && diffDias <= 1 && diffHoras > 1) {
        novosAlertas.push({
          eventoId: evento.id,
          titulo: evento.titulo,
          tipo: evento.tipo,
          dataEvento: evento.data,
          horaEvento: evento.hora,
          tipoAlerta: '1 dia'
        })
      }

      // Alerta 1 hora antes
      if (evento.alertas.umaHora && diffHoras <= 1 && diffHoras > 0) {
        novosAlertas.push({
          eventoId: evento.id,
          titulo: evento.titulo,
          tipo: evento.tipo,
          dataEvento: evento.data,
          horaEvento: evento.hora,
          tipoAlerta: '1 hora'
        })
      }
    })

    setAlertasAtivos(novosAlertas)
  }

  const calcularDataSalto = (meses: number): Date => {
    if (!dataNascimento) return new Date()
    const nascimento = new Date(dataNascimento)
    const dataSalto = new Date(nascimento)
    dataSalto.setMonth(dataSalto.getMonth() + meses)
    return dataSalto
  }

  const getSaltosDoMes = (mes: Date): SaltoDesenvolvimento[] => {
    return saltosDesenvolvimento.filter(salto => {
      const dataSalto = calcularDataSalto(salto.meses)
      return dataSalto.getMonth() === mes.getMonth() && 
             dataSalto.getFullYear() === mes.getFullYear()
    })
  }

  const getDiasDoMes = (mes: Date) => {
    const ano = mes.getFullYear()
    const mesNum = mes.getMonth()
    const primeiroDia = new Date(ano, mesNum, 1)
    const ultimoDia = new Date(ano, mesNum + 1, 0)
    const diasNoMes = ultimoDia.getDate()
    const diaSemanaInicio = primeiroDia.getDay()

    const dias = []
    
    // Dias vazios antes do primeiro dia
    for (let i = 0; i < diaSemanaInicio; i++) {
      dias.push(null)
    }
    
    // Dias do mês
    for (let dia = 1; dia <= diasNoMes; dia++) {
      dias.push(dia)
    }
    
    return dias
  }

  const getEventosDoDia = (dia: number) => {
    const dataComparacao = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), dia)
    return eventos.filter(evento => {
      const dataEvento = new Date(evento.data)
      return dataEvento.getDate() === dia &&
             dataEvento.getMonth() === mesAtual.getMonth() &&
             dataEvento.getFullYear() === mesAtual.getFullYear()
    })
  }

  const getSaltosDoDia = (dia: number) => {
    const saltosDoMes = getSaltosDoMes(mesAtual)
    return saltosDoMes.filter(salto => {
      const dataSalto = calcularDataSalto(salto.meses)
      return dataSalto.getDate() === dia
    })
  }

  const mesAnterior = () => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() - 1))
  }

  const mesPosterior = () => {
    setMesAtual(new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const evento: Evento = {
      ...novoEvento,
      id: Date.now().toString()
    }
    const novosEventos = [...eventos, evento]
    setEventos(novosEventos)
    localStorage.setItem('eventosAgenda', JSON.stringify(novosEventos))
    setMostrarForm(false)
    setNovoEvento({
      id: '',
      tipo: 'consulta',
      titulo: '',
      data: '',
      hora: '',
      observacoes: '',
      alertas: {
        tresDias: true,
        umDia: true,
        umaHora: true
      }
    })
  }

  const deletarEvento = (id: string) => {
    const novosEventos = eventos.filter(e => e.id !== id)
    setEventos(novosEventos)
    localStorage.setItem('eventosAgenda', JSON.stringify(novosEventos))
  }

  const getIconeTipo = (tipo: string) => {
    switch (tipo) {
      case 'consulta':
        return <Stethoscope className="w-4 h-4 text-blue-600" />
      case 'vacina':
        return <Syringe className="w-4 h-4 text-green-600" />
      default:
        return <Calendar className="w-4 h-4 text-purple-600" />
    }
  }

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link 
            href="/"
            className="inline-flex items-center text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Calendar className="w-10 h-10 text-purple-600 dark:text-purple-400 mr-4" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Agenda do Bebê
              </h1>
            </div>
            <button
              onClick={() => setMostrarForm(!mostrarForm)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Novo Evento
            </button>
          </div>

          {/* Alertas Ativos */}
          {alertasAtivos.length > 0 && (
            <div className="mb-8 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Bell className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Alertas Ativos
                </h3>
              </div>
              <div className="space-y-2">
                {alertasAtivos.map((alerta, index) => (
                  <div key={index} className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                    <Clock className="w-4 h-4 mr-2 text-yellow-600" />
                    <span className="font-medium">{alerta.titulo}</span>
                    <span className="mx-2">•</span>
                    <span>{new Date(alerta.dataEvento).toLocaleDateString('pt-BR')} às {alerta.horaEvento}</span>
                    <span className="mx-2">•</span>
                    <span className="text-yellow-600 dark:text-yellow-400 font-semibold">
                      Faltam {alerta.tipoAlerta}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Formulário de Novo Evento */}
          {mostrarForm && (
            <div className="bg-purple-50 dark:bg-gray-700 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Adicionar Evento
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tipo de Evento
                    </label>
                    <select
                      value={novoEvento.tipo}
                      onChange={(e) => setNovoEvento({...novoEvento, tipo: e.target.value as 'consulta' | 'vacina' | 'outro'})}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="consulta">Consulta</option>
                      <option value="vacina">Vacina</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Título
                    </label>
                    <input
                      type="text"
                      value={novoEvento.titulo}
                      onChange={(e) => setNovoEvento({...novoEvento, titulo: e.target.value})}
                      required
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Ex: Consulta com pediatra"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Data
                    </label>
                    <input
                      type="date"
                      value={novoEvento.data}
                      onChange={(e) => setNovoEvento({...novoEvento, data: e.target.value})}
                      required
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Hora
                    </label>
                    <input
                      type="time"
                      value={novoEvento.hora}
                      onChange={(e) => setNovoEvento({...novoEvento, hora: e.target.value})}
                      required
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Observações
                  </label>
                  <textarea
                    value={novoEvento.observacoes}
                    onChange={(e) => setNovoEvento({...novoEvento, observacoes: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    rows={3}
                    placeholder="Informações adicionais..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Alertas
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={novoEvento.alertas.tresDias}
                        onChange={(e) => setNovoEvento({
                          ...novoEvento,
                          alertas: {...novoEvento.alertas, tresDias: e.target.checked}
                        })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">3 dias antes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={novoEvento.alertas.umDia}
                        onChange={(e) => setNovoEvento({
                          ...novoEvento,
                          alertas: {...novoEvento.alertas, umDia: e.target.checked}
                        })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">1 dia antes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={novoEvento.alertas.umaHora}
                        onChange={(e) => setNovoEvento({
                          ...novoEvento,
                          alertas: {...novoEvento.alertas, umaHora: e.target.checked}
                        })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">1 hora antes</span>
                    </label>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
                  >
                    Salvar
                  </button>
                  <button
                    type="button"
                    onClick={() => setMostrarForm(false)}
                    className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white py-2 rounded-lg font-semibold hover:bg-gray-400 dark:hover:bg-gray-500 transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Calendário */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={mesAnterior}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </button>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {meses[mesAtual.getMonth()]} {mesAtual.getFullYear()}
              </h2>
              <button
                onClick={mesPosterior}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </button>
            </div>

            {/* Cabeçalho dos dias da semana */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {diasSemana.map(dia => (
                <div key={dia} className="text-center font-semibold text-gray-700 dark:text-gray-300 text-sm py-2">
                  {dia}
                </div>
              ))}
            </div>

            {/* Dias do mês */}
            <div className="grid grid-cols-7 gap-2">
              {getDiasDoMes(mesAtual).map((dia, index) => {
                if (dia === null) {
                  return <div key={`empty-${index}`} className="aspect-square" />
                }

                const eventosDoDia = getEventosDoDia(dia)
                const saltosDoDia = getSaltosDoDia(dia)
                const hoje = new Date()
                const ehHoje = dia === hoje.getDate() && 
                              mesAtual.getMonth() === hoje.getMonth() && 
                              mesAtual.getFullYear() === hoje.getFullYear()

                return (
                  <div
                    key={dia}
                    className={`aspect-square border rounded-lg p-2 ${
                      ehHoje 
                        ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-500' 
                        : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                    } hover:shadow-lg transition-shadow`}
                  >
                    <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                      {dia}
                    </div>
                    <div className="space-y-1">
                      {eventosDoDia.map(evento => (
                        <div
                          key={evento.id}
                          className="flex items-center text-xs bg-blue-100 dark:bg-blue-900/30 rounded px-1 py-0.5"
                          title={`${evento.titulo} - ${evento.hora}`}
                        >
                          {getIconeTipo(evento.tipo)}
                          <span className="ml-1 truncate text-gray-900 dark:text-white">
                            {evento.hora}
                          </span>
                        </div>
                      ))}
                      {saltosDoDia.map((salto, idx) => (
                        <div
                          key={idx}
                          className="flex items-center text-xs bg-pink-100 dark:bg-pink-900/30 rounded px-1 py-0.5"
                          title={salto.descricao}
                        >
                          <Baby className="w-3 h-3 text-pink-600" />
                          <span className="ml-1 truncate text-gray-900 dark:text-white">
                            {salto.idade}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Legenda */}
          <div className="flex flex-wrap gap-4 mb-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center">
              <Stethoscope className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Consulta</span>
            </div>
            <div className="flex items-center">
              <Syringe className="w-4 h-4 text-green-600 mr-2" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Vacina</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 text-purple-600 mr-2" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Outro</span>
            </div>
            <div className="flex items-center">
              <Baby className="w-4 h-4 text-pink-600 mr-2" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Salto de Desenvolvimento</span>
            </div>
          </div>

          {/* Lista de Eventos Próximos */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Próximos Eventos
            </h2>
            {eventos.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Nenhum evento agendado ainda.</p>
                <p className="text-sm">Clique em "Novo Evento" para adicionar.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {eventos
                  .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
                  .slice(0, 5)
                  .map((evento) => (
                    <div key={evento.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex items-center justify-between hover:shadow-lg transition-shadow">
                      <div className="flex items-center flex-1">
                        <div className="mr-4">
                          {getIconeTipo(evento.tipo)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {evento.titulo}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {new Date(evento.data).toLocaleDateString('pt-BR')} às {evento.hora}
                          </p>
                          {evento.observacoes && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {evento.observacoes}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deletarEvento(evento.id)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors ml-4"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
