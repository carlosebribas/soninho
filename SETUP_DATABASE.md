# Configuração do Banco de Dados Supabase

## Como aplicar o schema no banco de dados

Existem **2 formas** de criar as tabelas necessárias:

---

### **Opção 1: Via Supabase Dashboard (Mais Fácil)** ✅

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. No menu lateral, clique em **"SQL Editor"**
4. Clique em **"New Query"**
5. Copie e cole o conteúdo do arquivo: `supabase/migrations/20260202133837_initial_schema.sql`
6. Clique em **"Run"** (ou pressione Ctrl+Enter)
7. Aguarde a execução concluir ✓

---

### **Opção 2: Via Supabase CLI**

Se você tem o Supabase CLI configurado localmente:

```bash
# 1. Vincular ao projeto (obtenha o project-ref no dashboard)
npx supabase link --project-ref SEU_PROJECT_REF

# 2. Aplicar a migração
npx supabase db push --yes
```

---

## Verificação

Após aplicar o schema, verifique se as seguintes tabelas foram criadas:

- ✅ `baby_profiles` - Perfis dos bebês
- ✅ `sleep_entries` - Registros de sono
- ✅ `alerts` - Alertas e lembretes
- ✅ `growth_history` - Histórico de crescimento

Para verificar, acesse o **"Table Editor"** no dashboard do Supabase.

---

## Estrutura das Tabelas

### `baby_profiles`
Armazena informações do bebê (nome, data de nascimento, peso, altura).

### `sleep_entries`
Registros de sono e sonecas com horários, notas e humor.

### `alerts`
Lembretes de vacinas, consultas, medicamentos.

### `growth_history`
Histórico de peso, altura e perímetro cefálico ao longo do tempo.

---

## Segurança

Todas as tabelas têm **Row Level Security (RLS)** habilitado:
- Cada usuário só pode ver/editar seus próprios dados
- Proteção automática contra acesso não autorizado

---

## Problemas?

Se encontrar erros ao aplicar o schema:

1. Verifique se você está logado no projeto correto
2. Certifique-se de que tem permissões de admin
3. Se já existirem tabelas com nomes conflitantes, delete-as primeiro

Para suporte técnico, acesse o Discord do Supabase: https://discord.supabase.com
