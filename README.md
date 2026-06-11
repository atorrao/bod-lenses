# BOD Lenses Portugal — App

App web para a BOD Lenses Portugal, construída com **Next.js 14**, **Tailwind CSS**, **Supabase** e deployada no **Vercel**.

---

## Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS + DM Sans + Inter (Google Fonts)
- **Base de dados**: Supabase (PostgreSQL)
- **Deploy**: Vercel
- **Assets**: Imagens diretamente do CDN da bodlensesportugal.com

---

## Funcionalidades

| Página | Descrição |
|--------|-----------|
| `/` | Homepage com hero, stats, features e CTA |
| `/produtos` | Catálogo completo com imagens, badges e materiais |
| `/novidades` | Feed de notícias e lançamentos da marca |
| `/calculadora` | Calculadora de preços com config persistida no Supabase |
| `/contacto` | Formulário de contacto + formulário de leads/parcerias |

### Supabase — 3 tabelas
- `contact_messages` — mensagens do formulário de contacto
- `optica_leads` — pedidos de parceria/BOD Start/Pioneiros
- `price_configs` — configurações de preços por ótica (email único)

---

## Setup Local

### 1. Clonar o repositório

```bash
git clone https://github.com/SEU_USER/bod-lenses-portugal.git
cd bod-lenses-portugal
npm install
```

### 2. Configurar Supabase

1. Acede a [supabase.com](https://supabase.com) e abre o teu projeto
2. Vai a **SQL Editor** e corre o ficheiro `supabase/schema.sql`
3. Copia o **Project URL** e a **anon key** (Settings → API)

### 3. Variáveis de ambiente

Cria o ficheiro `.env.local` na raiz:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Correr localmente

```bash
npm run dev
```

Acede a [http://localhost:3000](http://localhost:3000)

---

## Deploy no Vercel

### 1. Push para GitHub

```bash
git init
git add .
git commit -m "feat: initial BOD Lenses app"
git branch -M main
git remote add origin https://github.com/SEU_USER/bod-lenses-portugal.git
git push -u origin main
```

### 2. Ligar ao Vercel

1. Acede a [vercel.com](https://vercel.com) → **New Project**
2. Importa o repositório `bod-lenses-portugal` do GitHub
3. Framework: **Next.js** (detectado automaticamente)
4. Adiciona as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Clica **Deploy**

### 3. (Opcional) Domínio personalizado

No Vercel → Settings → Domains → adiciona `app.bodlensesportugal.com`

---

## Estrutura do Projeto

```
bod-lenses-portugal/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout + fonts + metadata
│   │   ├── globals.css         # Tailwind + design tokens
│   │   ├── page.tsx            # Homepage
│   │   ├── produtos/page.tsx   # Catálogo
│   │   ├── novidades/page.tsx  # Notícias
│   │   ├── calculadora/page.tsx # Calculadora (client)
│   │   └── contacto/page.tsx   # Contacto + leads (client)
│   ├── components/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   └── lib/
│       ├── supabase.ts         # Cliente Supabase + tipos
│       └── data.ts             # Dados, preços default, assets
├── supabase/
│   └── schema.sql              # SQL para criar as tabelas
├── .env.local                  # Variáveis locais (não commitar)
├── .env.example                # Template de variáveis
├── next.config.mjs
├── tailwind.config.ts
└── package.json
```

---

## Próximos passos sugeridos

- [ ] Painel admin simples para ver mensagens e leads (Supabase Auth)
- [ ] Exportar orçamento da calculadora em PDF
- [ ] Tabela de preços real da BOD (atualizar `DEFAULT_PRICES` em `src/lib/data.ts`)
- [ ] Notificações por email quando chega um lead (Supabase Edge Functions + Resend)
- [ ] Analytics (Vercel Analytics já incluído)
