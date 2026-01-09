'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Calendar, Syringe, Stethoscope, Trash2, Baby, ChevronLeft, ChevronRight, Bell, Clock, Download, Share2 } from 'lucide-react'
import { BackButton } from '@/components/BackButton'

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
  isPredefinido?: boolean
}

interface Vacina {
  nome: string
  dose: string
  idadeMeses: number
  idadeDias?: number
  observacoes: string
}

interface SaltoDesenvolvimento {
  idade: string
  semanas: number
  descricao: string
  marco: string
  duracaoDias: number // Duração do período de adaptação (1-2 semanas)
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
  const [saltoSelecionado, setSaltoSelecionado] = useState<SaltoDesenvolvimento | null>(null)
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

  // Calendário Nacional de Vacinação - Criança
  const calendarioVacinacao: Vacina[] = [
    // Ao nascer
    { nome: 'BCG', dose: 'Dose única', idadeMeses: 0, idadeDias: 0, observacoes: 'Proteção contra formas graves de tuberculose. Aplicada na maternidade.' },
    { nome: 'Hepatite B', dose: '1ª dose', idadeMeses: 0, idadeDias: 0, observacoes: 'Primeira dose ao nascer. Proteção contra hepatite B.' },

    // 2 meses
    { nome: 'Pentavalente', dose: '1ª dose', idadeMeses: 2, observacoes: 'Protege contra difteria, tétano, coqueluche, hepatite B e Haemophilus influenzae tipo B.' },
    { nome: 'VIP (Poliomielite inativada)', dose: '1ª dose', idadeMeses: 2, observacoes: 'Proteção contra poliomielite (paralisia infantil).' },
    { nome: 'Pneumocócica 10', dose: '1ª dose', idadeMeses: 2, observacoes: 'Proteção contra pneumonia, meningite e otite.' },
    { nome: 'Rotavírus', dose: '1ª dose', idadeMeses: 2, observacoes: 'Proteção contra diarreia por rotavírus. Limite: até 3 meses e 15 dias.' },

    // 3 meses
    { nome: 'Meningocócica C', dose: '1ª dose', idadeMeses: 3, observacoes: 'Proteção contra meningite meningocócica tipo C.' },

    // 4 meses
    { nome: 'Pentavalente', dose: '2ª dose', idadeMeses: 4, observacoes: 'Segunda dose da vacina que protege contra 5 doenças.' },
    { nome: 'VIP (Poliomielite inativada)', dose: '2ª dose', idadeMeses: 4, observacoes: 'Segunda dose contra poliomielite.' },
    { nome: 'Pneumocócica 10', dose: '2ª dose', idadeMeses: 4, observacoes: 'Segunda dose contra pneumonia e meningite.' },
    { nome: 'Rotavírus', dose: '2ª dose', idadeMeses: 4, observacoes: 'Segunda dose contra diarreia. Limite: até 7 meses e 29 dias.' },

    // 5 meses
    { nome: 'Meningocócica C', dose: '2ª dose', idadeMeses: 5, observacoes: 'Segunda dose contra meningite tipo C.' },

    // 6 meses
    { nome: 'Pentavalente', dose: '3ª dose', idadeMeses: 6, observacoes: 'Terceira dose da pentavalente.' },
    { nome: 'VIP (Poliomielite inativada)', dose: '3ª dose', idadeMeses: 6, observacoes: 'Terceira dose contra poliomielite.' },

    // 9 meses
    { nome: 'Febre Amarela', dose: 'Dose inicial', idadeMeses: 9, observacoes: 'Proteção contra febre amarela. Recomendada para todo o Brasil.' },

    // 12 meses (1 ano)
    { nome: 'Tríplice Viral (SCR)', dose: '1ª dose', idadeMeses: 12, observacoes: 'Proteção contra sarampo, caxumba e rubéola.' },
    { nome: 'Pneumocócica 10', dose: 'Reforço', idadeMeses: 12, observacoes: 'Dose de reforço contra pneumonia e meningite.' },
    { nome: 'Meningocócica C', dose: 'Reforço', idadeMeses: 12, observacoes: 'Dose de reforço contra meningite tipo C.' },

    // 15 meses (1 ano e 3 meses)
    { nome: 'Tetraviral (SCR-V)', dose: 'Dose única', idadeMeses: 15, observacoes: 'Proteção contra sarampo, caxumba, rubéola e varicela (catapora).' },
    { nome: 'Hepatite A', dose: 'Dose única', idadeMeses: 15, observacoes: 'Proteção contra hepatite A.' },
    { nome: 'DTP', dose: '1º reforço', idadeMeses: 15, observacoes: 'Primeiro reforço contra difteria, tétano e coqueluche.' },
    { nome: 'VOP (Poliomielite oral)', dose: '1º reforço', idadeMeses: 15, observacoes: 'Primeiro reforço contra poliomielite (gotinha).' },

    // 4 anos
    { nome: 'DTP', dose: '2º reforço', idadeMeses: 48, observacoes: 'Segundo reforço contra difteria, tétano e coqueluche.' },
    { nome: 'VOP (Poliomielite oral)', dose: '2º reforço', idadeMeses: 48, observacoes: 'Segundo reforço contra poliomielite (gotinha).' },
    { nome: 'Febre Amarela', dose: 'Reforço', idadeMeses: 48, observacoes: 'Dose de reforço contra febre amarela.' },
    { nome: 'Varicela', dose: 'Reforço', idadeMeses: 48, observacoes: 'Dose de reforço contra catapora (se não tomou a Tetraviral).' },

    // 9 anos (meninas)
    { nome: 'HPV', dose: '1ª dose', idadeMeses: 108, observacoes: 'Proteção contra HPV. Para meninas de 9 a 14 anos e meninos de 11 a 14 anos.' },
    { nome: 'HPV', dose: '2ª dose', idadeMeses: 114, observacoes: 'Segunda dose do HPV (6 meses após a primeira dose).' }
  ]

  const saltosDesenvolvimento: SaltoDesenvolvimento[] = [
    // Primeiro Ano - Os 10 saltos clássicos
    {
      idade: '1 mês (5 semanas)',
      semanas: 5,
      descricao: 'Melhora na visão e foco',
      marco: 'Bebê começa a observar rostos e sorrir espontaneamente',
      duracaoDias: 7
    },
    {
      idade: '2 meses (8 semanas)',
      semanas: 8,
      descricao: 'Descobre as mãos e pés',
      marco: 'Visão mais apurada e tentativa de controlar movimentos',
      duracaoDias: 7
    },
    {
      idade: '3 meses (12 semanas)',
      semanas: 12,
      descricao: 'Sustenta a cabeça',
      marco: 'Interage mais com o ambiente e segue objetos com o olhar',
      duracaoDias: 10
    },
    {
      idade: '4-5 meses (19 semanas)',
      semanas: 19,
      descricao: 'Começa a rolar e agarrar objetos',
      marco: 'Inicia a fase de levar tudo à boca',
      duracaoDias: 14
    },
    {
      idade: '6 meses (26 semanas)',
      semanas: 26,
      descricao: 'Senta com apoio e inicia lalação',
      marco: 'Sons repetidos; pode começar a estranhar desconhecidos',
      duracaoDias: 10
    },
    {
      idade: '7-8 meses (37 semanas)',
      semanas: 37,
      descricao: 'Permanência do objeto',
      marco: 'Compreende que objetos existem mesmo escondidos; senta sem apoio',
      duracaoDias: 14
    },
    {
      idade: '9-10 meses (46 semanas)',
      semanas: 46,
      descricao: 'Começa a engatinhar',
      marco: 'Usa movimento de pinça com os dedos; entende comandos simples',
      duracaoDias: 14
    },
    {
      idade: '11-12 meses (55 semanas)',
      semanas: 55,
      descricao: 'Primeiros passos',
      marco: 'Com ou sem apoio; primeiras palavras com sentido (mamãe, papai)',
      duracaoDias: 14
    },
    {
      idade: '12 meses (64 semanas)',
      semanas: 64,
      descricao: 'Consolidação da marcha',
      marco: 'Maior confiança ao andar e vocabulário expandindo',
      duracaoDias: 7
    },

    // Segundo Ano - Marcos de Independência
    {
      idade: '14 meses (1 ano e 2 meses)',
      semanas: 60,
      descricao: 'Testa a independência',
      marco: 'Tenta comer sozinho e imita comportamentos dos adultos',
      duracaoDias: 10
    },
    {
      idade: '16 meses (1 ano e 4 meses)',
      semanas: 68,
      descricao: 'Anda com confiança',
      marco: 'Pode começar a subir degraus com apoio; demonstra vontades claras',
      duracaoDias: 10
    },
    {
      idade: '18 meses (1 ano e meio)',
      semanas: 78,
      descricao: 'Expansão rápida do vocabulário',
      marco: 'Constrói torres de blocos; usa colher; reconhece nomes de objetos',
      duracaoDias: 14
    },
    {
      idade: '20-24 meses (até 2 anos)',
      semanas: 96,
      descricao: 'Corre e chuta bola',
      marco: 'Forma frases simples com duas palavras; usa "eu" e "meu"',
      duracaoDias: 14
    }
  ]

  const gerarEventosVacinacao = (dataNasc: string) => {
    if (!dataNasc) return []

    const [ano, mes, dia] = dataNasc.split('-').map(Number)
    const nascimento = new Date(ano, mes - 1, dia)
    const eventosVacinas: Evento[] = []

    calendarioVacinacao.forEach((vacina, index) => {
      const dataVacina = new Date(nascimento)

      if (vacina.idadeDias !== undefined) {
        // Para vacinas ao nascer
        dataVacina.setDate(dataVacina.getDate() + vacina.idadeDias)
      } else {
        // Para vacinas com idade em meses
        dataVacina.setMonth(dataVacina.getMonth() + vacina.idadeMeses)
      }

      // Definir horário padrão: 08:00 para facilitar o agendamento
      const dataFormatada = dataVacina.toISOString().split('T')[0]

      eventosVacinas.push({
        id: `vacina-${index}-${Date.now()}`,
        tipo: 'vacina',
        titulo: `💉 ${vacina.nome} - ${vacina.dose}`,
        data: dataFormatada,
        hora: '08:00',
        observacoes: vacina.observacoes,
        alertas: {
          tresDias: true,
          umDia: true,
          umaHora: true
        },
        isPredefinido: true
      })
    })

    return eventosVacinas
  }

  const gerarEventosMesversarios = (dataNasc: string) => {
    if (!dataNasc) return []

    const [ano, mes, dia] = dataNasc.split('-').map(Number)
    const eventosMesversarios: Evento[] = []

    // Gerar mesversários de 1 a 11 meses (o 12º mês será o primeiro aniversário)
    for (let mesVida = 1; mesVida <= 11; mesVida++) {
      // Criar data mantendo o mesmo dia do nascimento
      const dataMesversario = new Date(ano, mes - 1 + mesVida, dia)
      const dataFormatada = dataMesversario.toISOString().split('T')[0]

      eventosMesversarios.push({
        id: `mesversario-${mesVida}-${Date.now()}`,
        tipo: 'outro',
        titulo: `🎂 Mesversário - ${mesVida} ${mesVida === 1 ? 'mês' : 'meses'}`,
        data: dataFormatada,
        hora: '08:00',
        observacoes: `Celebração de ${mesVida} ${mesVida === 1 ? 'mês' : 'meses'} de vida do bebê! 🎉`,
        alertas: {
          tresDias: true,
          umDia: true,
          umaHora: false
        },
        isPredefinido: true
      })
    }

    return eventosMesversarios
  }

  const gerarEventosAniversarios = (dataNasc: string) => {
    if (!dataNasc) return []

    const [ano, mes, dia] = dataNasc.split('-').map(Number)
    const nascimento = new Date(ano, mes - 1, dia)
    const eventosAniversarios: Evento[] = []
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0) // Zerar horas para comparação apenas de data

    // Gerar aniversários dos próximos 10 anos
    for (let idade = 1; idade <= 10; idade++) {
      const dataAniversario = new Date(nascimento)
      dataAniversario.setFullYear(nascimento.getFullYear() + idade)
      dataAniversario.setHours(0, 0, 0, 0)

      // Adicionar se a data do aniversário for hoje ou no futuro
      if (dataAniversario >= hoje) {
        const dataFormatada = dataAniversario.toISOString().split('T')[0]

        eventosAniversarios.push({
          id: `aniversario-${idade}-${Date.now()}`,
          tipo: 'outro',
          titulo: `🎉 Aniversário - ${idade} ${idade === 1 ? 'ano' : 'anos'}`,
          data: dataFormatada,
          hora: '08:00',
          observacoes: `Parabéns! O bebê está completando ${idade} ${idade === 1 ? 'ano' : 'anos'} de vida! 🎈🎁`,
          alertas: {
            tresDias: true,
            umDia: true,
            umaHora: false
          },
          isPredefinido: true
        })
      }
    }

    return eventosAniversarios
  }

  useEffect(() => {
    // Carregar data de nascimento do cadastro
    const cadastro = localStorage.getItem('cadastroBebe')
    if (cadastro) {
      const dados = JSON.parse(cadastro)
      setDataNascimento(dados.dataNascimento)

      // Verificar se já existem eventos predefinidos gerados
      const eventosSalvos = localStorage.getItem('eventosAgenda')
      const eventosPredefinidosGerados = localStorage.getItem('eventosPredefinidosGerados')

      if (!eventosPredefinidosGerados && dados.dataNascimento) {
        // Gerar todos os eventos predefinidos automaticamente
        const eventosVacinas = gerarEventosVacinacao(dados.dataNascimento)
        const eventosMesversarios = gerarEventosMesversarios(dados.dataNascimento)
        const eventosAniversarios = gerarEventosAniversarios(dados.dataNascimento)

        // Combinar todos os eventos predefinidos
        let todosEventos = [...eventosVacinas, ...eventosMesversarios, ...eventosAniversarios]

        // Se já existem eventos salvos (criados pelo usuário), mesclar
        if (eventosSalvos) {
          const eventosExistentes = JSON.parse(eventosSalvos)
          todosEventos = [...eventosExistentes, ...todosEventos]
        }

        setEventos(todosEventos)
        localStorage.setItem('eventosAgenda', JSON.stringify(todosEventos))
        localStorage.setItem('eventosPredefinidosGerados', 'true')
        // Remover a flag antiga se existir
        localStorage.removeItem('vacinacoesGeradas')
      } else if (eventosSalvos) {
        // Carregar eventos existentes
        setEventos(JSON.parse(eventosSalvos))
      }
    } else {
      // Carregar apenas eventos salvos se não houver cadastro
      const eventosSalvos = localStorage.getItem('eventosAgenda')
      if (eventosSalvos) {
        setEventos(JSON.parse(eventosSalvos))
      }
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

  const calcularDataSalto = (semanas: number): Date => {
    if (!dataNascimento) return new Date()
    // Corrigir para evitar problemas de fuso horário
    const [ano, mes, dia] = dataNascimento.split('-').map(Number)
    const nascimento = new Date(ano, mes - 1, dia)
    const dataSalto = new Date(nascimento)
    dataSalto.setDate(dataSalto.getDate() + (semanas * 7))
    return dataSalto
  }

  const getSaltosDoMes = (mes: Date): SaltoDesenvolvimento[] => {
    return saltosDesenvolvimento.filter(salto => {
      const dataInicio = calcularDataSalto(salto.semanas)
      const dataFim = new Date(dataInicio)
      dataFim.setDate(dataFim.getDate() + salto.duracaoDias)

      // Verificar se o salto está ativo durante este mês
      return (dataInicio.getMonth() === mes.getMonth() && dataInicio.getFullYear() === mes.getFullYear()) ||
             (dataFim.getMonth() === mes.getMonth() && dataFim.getFullYear() === mes.getFullYear())
    })
  }

  const getSaltosDoDia = (dia: number): SaltoDesenvolvimento[] => {
    const dataComparacao = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), dia)
    return saltosDesenvolvimento.filter(salto => {
      const dataInicio = calcularDataSalto(salto.semanas)
      const dataFim = new Date(dataInicio)
      dataFim.setDate(dataFim.getDate() + salto.duracaoDias)

      // Verificar se este dia está dentro do período do salto
      return dataComparacao >= dataInicio && dataComparacao <= dataFim
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

  const calcularIdade = (dataEvento: string): string => {
    if (!dataNascimento) return ''

    // Corrigir para evitar problemas de fuso horário
    const [anoNasc, mesNasc, diaNasc] = dataNascimento.split('-').map(Number)
    const nascimento = new Date(anoNasc, mesNasc - 1, diaNasc)

    const [anoEvento, mesEvento, diaEvento] = dataEvento.split('-').map(Number)
    const evento = new Date(anoEvento, mesEvento - 1, diaEvento)

    // Calcular diferença em meses
    let meses = (evento.getFullYear() - nascimento.getFullYear()) * 12
    meses += evento.getMonth() - nascimento.getMonth()

    // Ajustar se o dia do evento for antes do dia de nascimento no mês
    if (evento.getDate() < nascimento.getDate()) {
      meses--
    }

    if (meses < 0) return ''

    if (meses === 0) {
      return 'Recém-nascido'
    } else if (meses < 12) {
      return `${meses} ${meses === 1 ? 'mês' : 'meses'}`
    } else {
      const anos = Math.floor(meses / 12)
      const mesesRestantes = meses % 12

      if (mesesRestantes === 0) {
        return `${anos} ${anos === 1 ? 'ano' : 'anos'}`
      } else {
        return `${anos} ${anos === 1 ? 'ano' : 'anos'} e ${mesesRestantes} ${mesesRestantes === 1 ? 'mês' : 'meses'}`
      }
    }
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

  const formatarDataParaICS = (data: string, hora: string): string => {
    const dataObj = new Date(`${data}T${hora}`)
    return dataObj.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }

  const exportarParaGoogleCalendar = (evento: Evento) => {
    const dataInicio = formatarDataParaICS(evento.data, evento.hora)
    const dataFim = new Date(new Date(`${evento.data}T${evento.hora}`).getTime() + 60 * 60 * 1000)
    const dataFimFormatada = dataFim.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

    const titulo = encodeURIComponent(evento.titulo)
    const descricao = encodeURIComponent(evento.observacoes || '')
    const idadeBebe = calcularIdade(evento.data)
    const detalhes = encodeURIComponent(`${evento.observacoes ? evento.observacoes + '\n\n' : ''}Idade do bebê: ${idadeBebe}`)

    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${titulo}&dates=${dataInicio}/${dataFimFormatada}&details=${detalhes}&sf=true&output=xml`

    window.open(url, '_blank')
  }

  const exportarParaOutlook = (evento: Evento) => {
    const dataInicio = new Date(`${evento.data}T${evento.hora}`).toISOString()
    const dataFim = new Date(new Date(`${evento.data}T${evento.hora}`).getTime() + 60 * 60 * 1000).toISOString()

    const titulo = encodeURIComponent(evento.titulo)
    const idadeBebe = calcularIdade(evento.data)
    const descricao = encodeURIComponent(`${evento.observacoes ? evento.observacoes + '\n\n' : ''}Idade do bebê: ${idadeBebe}`)

    const url = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${titulo}&startdt=${dataInicio}&enddt=${dataFim}&body=${descricao}`

    window.open(url, '_blank')
  }

  const gerarArquivoICS = (evento: Evento) => {
    const dataInicio = formatarDataParaICS(evento.data, evento.hora)
    const dataFim = new Date(new Date(`${evento.data}T${evento.hora}`).getTime() + 60 * 60 * 1000)
    const dataFimFormatada = dataFim.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    const idadeBebe = calcularIdade(evento.data)

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Lasy AI//Agenda do Bebê//PT
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
DTSTART:${dataInicio}
DTEND:${dataFimFormatada}
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'}
UID:${evento.id}@lasyai.com
SUMMARY:${evento.titulo}
DESCRIPTION:${evento.observacoes ? evento.observacoes + '\\n\\n' : ''}Idade do bebê: ${idadeBebe}
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-P3D
ACTION:DISPLAY
DESCRIPTION:Lembrete: ${evento.titulo} em 3 dias
END:VALARM
BEGIN:VALARM
TRIGGER:-P1D
ACTION:DISPLAY
DESCRIPTION:Lembrete: ${evento.titulo} amanhã
END:VALARM
BEGIN:VALARM
TRIGGER:-PT1H
ACTION:DISPLAY
DESCRIPTION:Lembrete: ${evento.titulo} em 1 hora
END:VALARM
END:VEVENT
END:VCALENDAR`

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${evento.titulo.replace(/[^a-z0-9]/gi, '_')}.ics`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportarTodosEventos = () => {
    if (eventos.length === 0) return

    const eventosICS = eventos.map(evento => {
      const dataInicio = formatarDataParaICS(evento.data, evento.hora)
      const dataFim = new Date(new Date(`${evento.data}T${evento.hora}`).getTime() + 60 * 60 * 1000)
      const dataFimFormatada = dataFim.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
      const idadeBebe = calcularIdade(evento.data)

      let alarmes = ''
      if (evento.alertas?.tresDias) {
        alarmes += `BEGIN:VALARM
TRIGGER:-P3D
ACTION:DISPLAY
DESCRIPTION:Lembrete: ${evento.titulo} em 3 dias
END:VALARM
`
      }
      if (evento.alertas?.umDia) {
        alarmes += `BEGIN:VALARM
TRIGGER:-P1D
ACTION:DISPLAY
DESCRIPTION:Lembrete: ${evento.titulo} amanhã
END:VALARM
`
      }
      if (evento.alertas?.umaHora) {
        alarmes += `BEGIN:VALARM
TRIGGER:-PT1H
ACTION:DISPLAY
DESCRIPTION:Lembrete: ${evento.titulo} em 1 hora
END:VALARM
`
      }

      return `BEGIN:VEVENT
DTSTART:${dataInicio}
DTEND:${dataFimFormatada}
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'}
UID:${evento.id}@lasyai.com
SUMMARY:${evento.titulo}
DESCRIPTION:${evento.observacoes ? evento.observacoes + '\\n\\n' : ''}Idade do bebê: ${idadeBebe}
STATUS:CONFIRMED
SEQUENCE:0
${alarmes}END:VEVENT`
    }).join('\n')

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Lasy AI//Agenda do Bebê//PT
CALSCALE:GREGORIAN
METHOD:PUBLISH
${eventosICS}
END:VCALENDAR`

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'agenda_bebe_completa.ics'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
        <BackButton />

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div className="flex items-center">
              <Calendar className="w-10 h-10 text-purple-600 dark:text-purple-400 mr-4" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Agenda do Bebê
              </h1>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={exportarTodosEventos}
                disabled={eventos.length === 0}
                className={`${
                  eventos.length === 0
                    ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
                } text-white px-4 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center text-sm`}
                title="Exportar todos os eventos para Google/Outlook/Apple Calendar"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar Todos
              </button>
              <button
                onClick={() => setMostrarForm(!mostrarForm)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Novo Evento
              </button>
            </div>
          </div>

          {/* Info sobre Eventos Automáticos */}
          {dataNascimento && eventos.some(e => e.isPredefinido) && (
            <div className="mb-6 bg-gradient-to-r from-purple-50 via-pink-50 to-green-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-green-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    ✨ Eventos Automáticos Adicionados!
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Com base na data de nascimento, estes eventos foram adicionados automaticamente:
                  </p>
                  <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                    <li>• 💉 <strong>Vacinas:</strong> Todas do Calendário Nacional de Vacinação do Ministério da Saúde</li>
                    <li>• 🎂 <strong>Mesversários:</strong> Celebração mensal do 1º ao 11º mês de vida</li>
                    <li>• 🎉 <strong>Aniversários:</strong> Comemorações anuais dos próximos 10 anos</li>
                  </ul>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
                    💡 Você pode editar ou excluir qualquer evento conforme necessário!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Info sobre Integração */}
          <div className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Receba Alertas no seu Celular! 📱
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Para receber notificações efetivas dos compromissos, exporte os eventos para o seu calendário:
                </p>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                  <li>• <strong>Google Calendar:</strong> Sincroniza automaticamente com Android e iOS</li>
                  <li>• <strong>Outlook:</strong> Sincroniza com Microsoft 365 e Outlook mobile</li>
                  <li>• <strong>Arquivo .ics:</strong> Compatível com Apple Calendar, Gmail e outros</li>
                </ul>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
                  💡 Os alertas configurados (3 dias, 1 dia, 1 hora antes) serão incluídos automaticamente!
                </p>
              </div>
            </div>
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
                          className={`flex flex-col text-xs rounded px-1 py-0.5 ${
                            evento.isPredefinido && (evento.titulo.includes('Mesversário') || evento.titulo.includes('Aniversário'))
                              ? 'bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 border border-pink-300 dark:border-pink-700'
                              : evento.tipo === 'vacina' && evento.isPredefinido
                              ? 'bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700'
                              : evento.tipo === 'vacina'
                              ? 'bg-emerald-100 dark:bg-emerald-900/30'
                              : 'bg-blue-100 dark:bg-blue-900/30'
                          }`}
                          title={`${evento.titulo} - ${evento.hora}${calcularIdade(evento.data) ? ` - ${calcularIdade(evento.data)}` : ''}${evento.isPredefinido ? ' (Evento Automático)' : ''}`}
                        >
                          <div className="flex items-center">
                            {getIconeTipo(evento.tipo)}
                            <span className="ml-1 truncate text-gray-900 dark:text-white">
                              {evento.hora}
                            </span>
                          </div>
                          {calcularIdade(evento.data) && (
                            <span className="text-[10px] font-semibold text-purple-700 dark:text-purple-300 truncate">
                              {calcularIdade(evento.data)}
                            </span>
                          )}
                        </div>
                      ))}
                      {saltosDoDia.map((salto, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSaltoSelecionado(salto)}
                          className="flex items-center text-xs bg-pink-100 dark:bg-pink-900/30 hover:bg-pink-200 dark:hover:bg-pink-800/40 rounded px-1 py-0.5 transition-colors cursor-pointer w-full"
                          title={`Clique para ver detalhes - ${salto.descricao}`}
                        >
                          <Baby className="w-3 h-3 text-pink-600 flex-shrink-0" />
                          <span className="ml-1 truncate text-gray-900 dark:text-white text-left">
                            Salto
                          </span>
                        </button>
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

          {/* Modal de Detalhes do Salto */}
          {saltoSelecionado && (
            <div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setSaltoSelecionado(null)}
            >
              <div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center">
                    <Baby className="w-12 h-12 text-pink-600 mr-4" />
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {saltoSelecionado.idade}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Salto de Desenvolvimento
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSaltoSelecionado(null)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                  >
                    ×
                  </button>
                </div>

                {dataNascimento && (
                  <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      📅 Período do Salto:
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Início:</strong> {calcularDataSalto(saltoSelecionado.semanas).toLocaleDateString('pt-BR')}
                      <br />
                      <strong>Duração:</strong> {saltoSelecionado.duracaoDias === 7 ? '1 semana' : `${Math.ceil(saltoSelecionado.duracaoDias / 7)} semanas`} ({saltoSelecionado.duracaoDias} dias)
                      <br />
                      <strong>Término estimado:</strong> {(() => {
                        const fim = new Date(calcularDataSalto(saltoSelecionado.semanas))
                        fim.setDate(fim.getDate() + saltoSelecionado.duracaoDias)
                        return fim.toLocaleDateString('pt-BR')
                      })()}
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                      <span className="text-2xl mr-2">🎯</span>
                      Desenvolvimento Esperado
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 pl-8">
                      {saltoSelecionado.descricao}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                      <span className="text-2xl mr-2">⭐</span>
                      Marco Importante
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 pl-8">
                      {saltoSelecionado.marco}
                    </p>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mt-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                      <span className="text-xl mr-2">💡</span>
                      Dica
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Durante os saltos de desenvolvimento, é normal que o bebê fique mais irritado,
                      com o sono alterado e mais dependente. Esse período é temporário e dura de 1 a 2 semanas
                      até que o bebê se adapte à nova habilidade.
                    </p>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                      <span className="text-xl mr-2">📖</span>
                      Referência
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Para acompanhar o progresso oficial, consulte a{' '}
                      <span className="font-semibold">Caderneta da Criança do Ministério da Saúde</span>.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSaltoSelecionado(null)}
                  className="w-full mt-6 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 transition-all"
                >
                  Fechar
                </button>
              </div>
            </div>
          )}

          {/* Lista de Eventos do Mês */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Eventos de {meses[mesAtual.getMonth()]} {mesAtual.getFullYear()}
            </h2>
            {(() => {
              const eventosDoMes = eventos.filter(evento => {
                const dataEvento = new Date(evento.data)
                return dataEvento.getMonth() === mesAtual.getMonth() &&
                       dataEvento.getFullYear() === mesAtual.getFullYear()
              }).sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())

              return eventosDoMes.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Nenhum evento agendado para este mês.</p>
                  <p className="text-sm">Clique em "Novo Evento" para adicionar ou navegue pelos meses.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {eventosDoMes.map((evento) => (
                    <div
                      key={evento.id}
                      className={`rounded-lg p-4 hover:shadow-lg transition-shadow ${
                        evento.isPredefinido && (evento.titulo.includes('Mesversário') || evento.titulo.includes('Aniversário'))
                          ? 'bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 border border-pink-200 dark:border-pink-700'
                          : evento.isPredefinido
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700'
                          : 'bg-gray-50 dark:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center flex-1">
                          <div className="mr-4">
                            {getIconeTipo(evento.tipo)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {evento.titulo}
                              </h3>
                              {evento.isPredefinido && (
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                  evento.titulo.includes('Mesversário') || evento.titulo.includes('Aniversário')
                                    ? 'bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300'
                                    : 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                                }`}>
                                  {evento.titulo.includes('Mesversário') || evento.titulo.includes('Aniversário')
                                    ? 'Celebração'
                                    : 'Calendário Nacional'}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {new Date(evento.data).toLocaleDateString('pt-BR')} às {evento.hora}
                              {calcularIdade(evento.data) && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span className="font-semibold text-purple-600 dark:text-purple-400">
                                    {calcularIdade(evento.data)}
                                  </span>
                                </>
                              )}
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
                          title="Excluir evento"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => exportarParaGoogleCalendar(evento)}
                          className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-800/40 transition-colors"
                          title="Adicionar ao Google Calendar"
                        >
                          <Share2 className="w-3 h-3" />
                          Google Calendar
                        </button>
                        <button
                          onClick={() => exportarParaOutlook(evento)}
                          className="flex items-center gap-2 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-cyan-200 dark:hover:bg-cyan-800/40 transition-colors"
                          title="Adicionar ao Outlook Calendar"
                        >
                          <Share2 className="w-3 h-3" />
                          Outlook
                        </button>
                        <button
                          onClick={() => gerarArquivoICS(evento)}
                          className="flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-purple-200 dark:hover:bg-purple-800/40 transition-colors"
                          title="Baixar arquivo .ics (compatível com Apple Calendar e outros)"
                        >
                          <Download className="w-3 h-3" />
                          Baixar .ics
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })()}
          </div>

          {/* Saltos de Desenvolvimento do Mês */}
          {dataNascimento && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Saltos de Desenvolvimento - {meses[mesAtual.getMonth()]} {mesAtual.getFullYear()}
              </h2>
              <div className="space-y-3">
                {(() => {
                  const saltosDoMes = getSaltosDoMes(mesAtual)

                  return saltosDoMes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Baby className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">
                        Nenhum salto de desenvolvimento previsto para este mês.
                      </p>
                    </div>
                  ) : (
                    saltosDoMes.map((salto, index) => {
                    const dataInicio = calcularDataSalto(salto.semanas)
                    const dataFim = new Date(dataInicio)
                    dataFim.setDate(dataFim.getDate() + salto.duracaoDias)

                    return (
                      <button
                        key={index}
                        onClick={() => setSaltoSelecionado(salto)}
                        className="w-full bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-lg p-4 hover:shadow-lg transition-all border border-pink-200 dark:border-pink-800 text-left"
                      >
                        <div className="flex items-start">
                          <Baby className="w-8 h-8 text-pink-600 mr-4 flex-shrink-0 mt-1" />
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                              <span>{salto.idade}</span>
                              {calcularIdade(dataInicio.toISOString().split('T')[0]) && (
                                <span className="text-sm font-medium bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">
                                  {calcularIdade(dataInicio.toISOString().split('T')[0])}
                                </span>
                              )}
                            </h3>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                              {salto.descricao}
                            </p>
                            <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                              <Clock className="w-3 h-3 mr-1" />
                              {dataInicio.toLocaleDateString('pt-BR')} até {dataFim.toLocaleDateString('pt-BR')}
                              <span className="mx-2">•</span>
                              {salto.duracaoDias === 7 ? '1 semana' : `${Math.ceil(salto.duracaoDias / 7)} semanas`}
                            </div>
                          </div>
                        </div>
                      </button>
                    )
                  })
                  )
                })()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
