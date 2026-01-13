-- Configuração da autenticação no Supabase
-- Execute este SQL no SQL Editor do Supabase se necessário ajustar configurações

-- Habilitar confirmação de email (recomendado para produção)
-- Por padrão, o Supabase já vem com confirmação habilitada
-- Para desabilitar temporariamente (apenas desenvolvimento):
-- UPDATE auth.config SET enable_signup = true WHERE key = 'enable_signup';

-- Permitir cadastro público
-- O cadastro já está habilitado por padrão no Supabase

-- Configurar redirect URLs permitidas (ajuste conforme necessário)
-- Isso deve ser feito no painel do Supabase: Authentication > URL Configuration

-- Tempo de expiração do token (padrão: 3600 segundos = 1 hora)
-- Pode ser ajustado no painel do Supabase: Authentication > Settings

COMMENT ON SCHEMA auth IS 'Configurações de autenticação gerenciadas pelo painel do Supabase';
