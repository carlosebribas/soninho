-- Migration: Criar tabela de eventos da agenda
-- Descrição: Armazena eventos (consultas, vacinas, aniversários, etc.)
-- Data: 2025-01-21

-- Criar tabela de eventos da agenda
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('consulta', 'vacina', 'outro')),
  titulo TEXT NOT NULL,
  data DATE NOT NULL,
  hora TIME NOT NULL,
  observacoes TEXT,
  alerta_tres_dias BOOLEAN DEFAULT true,
  alerta_um_dia BOOLEAN DEFAULT true,
  alerta_uma_hora BOOLEAN DEFAULT true,
  is_predefinido BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Usuários podem ver seus próprios eventos"
  ON calendar_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios eventos"
  ON calendar_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios eventos"
  ON calendar_events FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios eventos"
  ON calendar_events FOR DELETE
  USING (auth.uid() = user_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_calendar_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER calendar_events_updated_at
  BEFORE UPDATE ON calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION update_calendar_events_updated_at();

-- Índices para melhorar performance
CREATE INDEX idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX idx_calendar_events_data ON calendar_events(data);
CREATE INDEX idx_calendar_events_tipo ON calendar_events(tipo);
CREATE INDEX idx_calendar_events_user_data ON calendar_events(user_id, data);
