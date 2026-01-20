-- Adicionar coluna 'type' para diferenciar sono noturno de sonecas

ALTER TABLE sleep_entries
ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'soneca';

-- Adicionar constraint para validar valores permitidos
ALTER TABLE sleep_entries
DROP CONSTRAINT IF EXISTS sleep_entries_type_check;

ALTER TABLE sleep_entries
ADD CONSTRAINT sleep_entries_type_check
CHECK (type IN ('sono', 'soneca'));

-- Criar índice para filtrar por tipo
CREATE INDEX IF NOT EXISTS idx_sleep_entries_type
ON sleep_entries(user_id, type);

-- Comentário
COMMENT ON COLUMN sleep_entries.type IS 'Tipo de sono: sono (noturno) ou soneca (diurna)';
