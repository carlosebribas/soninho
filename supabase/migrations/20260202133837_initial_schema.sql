-- Tabela de perfis de bebês
CREATE TABLE IF NOT EXISTS baby_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  nome TEXT NOT NULL,
  data_nascimento DATE NOT NULL,
  hora_nascimento TIME,
  peso_nascimento DECIMAL(5,2),
  altura_nascimento DECIMAL(5,2),
  hospital TEXT,
  cidade_nascimento TEXT,
  nome_mae TEXT,
  nome_pai TEXT,
  pediatra TEXT,
  telefone_pediatra TEXT,
  hospital_referencia TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para busca rápida por user_id
CREATE INDEX IF NOT EXISTS baby_profiles_user_id_idx ON baby_profiles(user_id);

-- RLS (Row Level Security) para baby_profiles
ALTER TABLE baby_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seus próprios perfis de bebês"
  ON baby_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios perfis de bebês"
  ON baby_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios perfis de bebês"
  ON baby_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios perfis de bebês"
  ON baby_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Tabela de registros de sono
CREATE TABLE IF NOT EXISTS sleep_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  notes TEXT,
  mood_before TEXT,
  mood_after TEXT,
  type TEXT NOT NULL CHECK (type IN ('sono', 'soneca')),
  is_pending BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS sleep_entries_user_id_idx ON sleep_entries(user_id);
CREATE INDEX IF NOT EXISTS sleep_entries_date_idx ON sleep_entries(date DESC);
CREATE INDEX IF NOT EXISTS sleep_entries_user_date_idx ON sleep_entries(user_id, date DESC);

-- RLS para sleep_entries
ALTER TABLE sleep_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seus próprios registros de sono"
  ON sleep_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios registros de sono"
  ON sleep_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios registros de sono"
  ON sleep_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios registros de sono"
  ON sleep_entries FOR DELETE
  USING (auth.uid() = user_id);

-- Tabela de alertas/lembretes
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('vacina', 'consulta', 'medicamento', 'outro')),
  title TEXT NOT NULL,
  description TEXT,
  alert_date DATE NOT NULL,
  alert_time TIME,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS alerts_user_id_idx ON alerts(user_id);
CREATE INDEX IF NOT EXISTS alerts_date_idx ON alerts(alert_date DESC);

-- RLS para alerts
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seus próprios alertas"
  ON alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios alertas"
  ON alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios alertas"
  ON alerts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios alertas"
  ON alerts FOR DELETE
  USING (auth.uid() = user_id);

-- Tabela de histórico de crescimento
CREATE TABLE IF NOT EXISTS growth_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  baby_profile_id UUID REFERENCES baby_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  head_circumference DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS growth_history_user_id_idx ON growth_history(user_id);
CREATE INDEX IF NOT EXISTS growth_history_baby_id_idx ON growth_history(baby_profile_id);
CREATE INDEX IF NOT EXISTS growth_history_date_idx ON growth_history(date DESC);

-- RLS para growth_history
ALTER TABLE growth_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seu próprio histórico de crescimento"
  ON growth_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seu próprio histórico de crescimento"
  ON growth_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seu próprio histórico de crescimento"
  ON growth_history FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seu próprio histórico de crescimento"
  ON growth_history FOR DELETE
  USING (auth.uid() = user_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_baby_profiles_updated_at
  BEFORE UPDATE ON baby_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sleep_entries_updated_at
  BEFORE UPDATE ON sleep_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alerts_updated_at
  BEFORE UPDATE ON alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_growth_history_updated_at
  BEFORE UPDATE ON growth_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
