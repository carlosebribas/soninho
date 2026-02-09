'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Save, Baby, Loader2, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BabyInfoCard } from '@/components/BabyInfoCard'
import { useBabyProfile } from '@/hooks/useBabyProfile'

export default function CadastroPage() {
  const router = useRouter()
  const { profile, loading, saveProfile } = useBabyProfile()
  const [showEditForm, setShowEditForm] = useState(false) // Controla se mostra o formulário de edição
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    dataNascimento: '',
    horaNascimento: '',
    hospital: '',
    cidadeNascimento: '',
    nomeMae: '',
    nomePai: '',
    pediatra: '',
    telefonePediatra: '',
    hospitalReferencia: ''
  })

  useEffect(() => {
    // Carregar dados do perfil quando disponível
    if (profile) {
      setFormData(profile)
      // Se não há perfil cadastrado, mostra o formulário automaticamente
      setShowEditForm(false)
    } else {
      // Se não há perfil, mostra o formulário para cadastro inicial
      setShowEditForm(true)
    }
  }, [profile])

  const handleEditClick = () => {
    setShowEditForm(true)
  }

  const handleCancelEdit = () => {
    if (profile) {
      // Se já tem perfil, restaura os dados originais e esconde o formulário
      setFormData(profile)
      setShowEditForm(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      await saveProfile(formData)
      alert(profile ? 'Cadastro atualizado com sucesso!' : 'Cadastro salvo com sucesso!')
      setShowEditForm(false) // Esconde o formulário após salvar
      if (!profile) {
        // Se era um cadastro novo, volta para home
        router.push('/')
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 dark:text-purple-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Carregando cadastro...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar
          </Link>
        </div>

        {/* Baby Info Card - mostra quando tem perfil E o formulário não está visível */}
        {profile && !showEditForm && (
          <div className="max-w-3xl mx-auto">
            <BabyInfoCard onEdit={handleEditClick} />
          </div>
        )}

        {/* Formulário - mostra quando não tem perfil OU quando usuário clicou para editar */}
        {showEditForm && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-3xl mx-auto">
            <div className="flex items-center justify-center mb-8">
              <Baby className="w-12 h-12 text-purple-600 dark:text-purple-400 mr-4" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {profile ? 'Editar Dados do Bebê' : 'Cadastro do Bebê'}
                </h1>
                {profile && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-1">
                    Atualize as informações conforme necessário
                  </p>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome do Bebê */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nome do Bebê *
              </label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Digite o nome do bebê"
              />
            </div>

            {/* Data e Hora de Nascimento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Data de Nascimento *
                </label>
                <input
                  type="date"
                  name="dataNascimento"
                  value={formData.dataNascimento}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Hora de Nascimento *
                </label>
                <input
                  type="time"
                  name="horaNascimento"
                  value={formData.horaNascimento}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Hospital e Cidade de Nascimento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Hospital de Nascimento
                </label>
                <input
                  type="text"
                  name="hospital"
                  value={formData.hospital}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Nome do hospital"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cidade de Nascimento
                </label>
                <input
                  type="text"
                  name="cidadeNascimento"
                  value={formData.cidadeNascimento}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Cidade onde nasceu"
                />
              </div>
            </div>

            {/* Nome dos Pais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome da Mãe
                </label>
                <input
                  type="text"
                  name="nomeMae"
                  value={formData.nomeMae}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Nome completo da mãe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome do Pai
                </label>
                <input
                  type="text"
                  name="nomePai"
                  value={formData.nomePai}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Nome completo do pai"
                />
              </div>
            </div>

            {/* Pediatra */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome do Pediatra
                </label>
                <input
                  type="text"
                  name="pediatra"
                  value={formData.pediatra}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Dr(a). Nome do pediatra"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Telefone do Pediatra
                </label>
                <input
                  type="tel"
                  name="telefonePediatra"
                  value={formData.telefonePediatra}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>

            {/* Hospital de Referência */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hospital de Referência
              </label>
              <input
                type="text"
                name="hospitalReferencia"
                value={formData.hospitalReferencia}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Hospital para emergências"
              />
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Botão Cancelar - só aparece em modo de edição */}
              {profile && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={submitting}
                  className="sm:w-1/3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-4 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="w-5 h-5 mr-2" />
                  Cancelar
                </button>
              )}

              {/* Botão Salvar */}
              <button
                type="submit"
                disabled={submitting}
                className={`${profile ? 'sm:w-2/3' : 'w-full'} bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Salvar Cadastro
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
        )}
      </div>
    </div>
  )
}
