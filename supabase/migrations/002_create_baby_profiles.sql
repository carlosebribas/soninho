-- Migration: Criar tabela de perfis de bebê
-- Descrição: Armazena informações do bebê de cada usuário
-- Data: 2025-01-21

-- Criar tabela de perfis de bebê
CREATE TABLE IF NOT EXISTS baby_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  data_nascimento DATE NOT NULL,
  hora_nascimento TIME NOT NULL,
  hospital TEXT,
  cidade_nascimento TEXT,
  nome_mae TEXT,
  nome_pai TEXT,
  pediatra TEXT,
  telefone_pediatra TEXT,
  hospital_referencia TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Apenas um perfil de bebê por usuário
  UNIQUE(user_id)
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE baby_profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Usuários podem ver seu próprio perfil de bebê"
  ON baby_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seu próprio perfil de bebê"
  ON baby_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil de bebê"
  ON baby_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seu próprio perfil de bebê"
  ON baby_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_baby_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER baby_profiles_updated_at
  BEFORE UPDATE ON baby_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_baby_profiles_updated_at();

-- Índice para melhorar performance
CREATE INDEX idx_baby_profiles_user_id ON baby_profiles(user_id);
