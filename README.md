# BOD Lenses Portugal — App v2

Portal privado para óticas parceiras BOD Lenses Portugal.

## Stack
- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** + DM Sans + Inter
- **Supabase** — Auth (magic link) + PostgreSQL
- **Vercel** — deploy

## Setup

### 1. Supabase — correr schema
SQL Editor → colar e executar `supabase/schema.sql`

### 2. Supabase — configurar magic link
Authentication → URL Configuration:
- **Site URL**: `https://SEU-PROJETO.vercel.app`
- **Redirect URLs**: `https://SEU-PROJETO.vercel.app/auth/callback`

### 3. Aprovar uma ótica manualmente
Após uma ótica fazer login pela primeira vez (via pedido de acesso aprovado), vai à tabela `optica_profiles` no Supabase e muda o campo `status` de `pending` para `approved`.

### 4. Env vars
```
NEXT_PUBLIC_SUPABASE_URL=https://yemzyuyahsydjhuzdeyv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1...
```

### 5. Deploy Vercel
```bash
git add . && git commit -m "feat: v2 private portal" && git push
```
Vercel faz deploy automático. Adicionar as 2 env vars nas Settings.

## Fluxo de acesso
1. Ótica preenche formulário "Solicitar acesso" → registo em `access_requests`
2. BOD aprova manualmente → envia magic link ao email da ótica
3. Ótica clica no link → entra no portal
4. BOD vai a `optica_profiles` e muda `status` para `approved`
5. Na próxima sessão, a ótica tem acesso completo

## Estrutura
```
src/app/
├── page.tsx              # Landing (login + request access)
├── auth/callback/        # Callback do magic link
├── dashboard/            # Dashboard de margens e valor
├── calculadora/          # Calculadora de preços
├── produtos/             # Catálogo
├── novidades/            # Notícias
├── perfil/               # Perfil + faturação
└── contacto/             # Contacto direto com BOD
```
