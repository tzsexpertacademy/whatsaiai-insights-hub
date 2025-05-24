
-- Adicionar coluna metadata para armazenar informações do assistente
ALTER TABLE insights ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Adicionar comentário na coluna
COMMENT ON COLUMN insights.metadata IS 'Metadados adicionais incluindo informações do assistente que gerou o insight';
