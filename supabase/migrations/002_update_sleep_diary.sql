-- Atualizar tabela de registros de sono com novos campos

-- Adicionar colunas para humor antes e depois de dormir
ALTER TABLE sleep_entries
ADD COLUMN IF NOT EXISTS mood_before TEXT,
ADD COLUMN IF NOT EXISTS mood_after TEXT,
ADD COLUMN IF NOT EXISTS is_pending BOOLEAN DEFAULT false;

-- Permitir que end_time seja NULL (para registros pendentes)
ALTER TABLE sleep_entries
ALTER COLUMN end_time DROP NOT NULL;

-- Remover coluna mood antiga se existir
ALTER TABLE sleep_entries
DROP COLUMN IF EXISTS mood;

-- Criar índice para buscar registros pendentes rapidamente
CREATE INDEX IF NOT EXISTS idx_sleep_entries_pending
ON sleep_entries(user_id, is_pending)
WHERE is_pending = true;

-- Comentários
COMMENT ON COLUMN sleep_entries.mood_before IS 'Humor do bebê antes de dormir';
COMMENT ON COLUMN sleep_entries.mood_after IS 'Humor do bebê após acordar';
COMMENT ON COLUMN sleep_entries.is_pending IS 'Indica se o registro está aguardando conclusão (bebê ainda dormindo)';
