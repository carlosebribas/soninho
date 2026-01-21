-- Tabela de marcos de desenvolvimento (milestones)
CREATE TABLE IF NOT EXISTS development_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_type VARCHAR(50) NOT NULL, -- 'motor', 'cognitive', 'social', 'language'
  title VARCHAR(255) NOT NULL,
  description TEXT,
  expected_age_months INTEGER, -- Idade esperada em meses
  achieved_date DATE, -- Data em que foi alcançado
  notes TEXT,
  is_achieved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de alertas de sono
CREATE TABLE IF NOT EXISTS sleep_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL, -- 'bedtime', 'naptime', 'wake_window', 'custom'
  title VARCHAR(255) NOT NULL,
  description TEXT,
  alert_time TIME NOT NULL,
  days_of_week TEXT[], -- Array com dias da semana ['monday', 'tuesday', etc]
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de respostas do quiz
CREATE TABLE IF NOT EXISTS quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_type VARCHAR(50) NOT NULL, -- 'sleep', 'development', etc
  question_id VARCHAR(100) NOT NULL,
  answer_value TEXT NOT NULL,
  answer_data JSONB, -- Para armazenar respostas complexas
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, quiz_type, question_id)
);

-- Índices para performance
CREATE INDEX idx_milestones_user ON development_milestones(user_id);
CREATE INDEX idx_milestones_achieved ON development_milestones(user_id, is_achieved);
CREATE INDEX idx_sleep_alerts_user ON sleep_alerts(user_id);
CREATE INDEX idx_sleep_alerts_active ON sleep_alerts(user_id, is_active);
CREATE INDEX idx_quiz_answers_user ON quiz_answers(user_id, quiz_type);

-- Row Level Security (RLS)
ALTER TABLE development_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_answers ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - development_milestones
CREATE POLICY "Usuários podem ver apenas seus próprios marcos"
  ON development_milestones FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios marcos"
  ON development_milestones FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios marcos"
  ON development_milestones FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios marcos"
  ON development_milestones FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas RLS - sleep_alerts
CREATE POLICY "Usuários podem ver apenas seus próprios alertas"
  ON sleep_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios alertas"
  ON sleep_alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios alertas"
  ON sleep_alerts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios alertas"
  ON sleep_alerts FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas RLS - quiz_answers
CREATE POLICY "Usuários podem ver apenas suas próprias respostas"
  ON quiz_answers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias respostas"
  ON quiz_answers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias respostas"
  ON quiz_answers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias respostas"
  ON quiz_answers FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_milestones_updated_at
  BEFORE UPDATE ON development_milestones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sleep_alerts_updated_at
  BEFORE UPDATE ON sleep_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quiz_answers_updated_at
  BEFORE UPDATE ON quiz_answers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
