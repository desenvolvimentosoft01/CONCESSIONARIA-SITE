# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (Next.js)
npm run build    # Build for production
npm run start    # Start production server
```

No test runner or linter is configured in this project.

## Environment Variables

Required in `.env.local`:

```
DATABASE_URL=                # PostgreSQL connection string
CLOUDINARY_CLOUD_NAME=       # Cloudinary cloud name
CLOUDINARY_API_KEY=          # Cloudinary API key
CLOUDINARY_API_SECRET=       # Cloudinary API secret
EMAIL_USER=                  # Gmail address for sending contact emails
EMAIL_PASS=                  # Gmail app password
CONTACT_RECIPIENT_EMAIL=     # Email address that receives contact form submissions
EVOLUTION_API_URL=           # Evolution API base URL (e.g. https://chat.exemplo.com)
EVOLUTION_API_KEY=           # Evolution API key
EVOLUTION_INSTANCE=          # WhatsApp instance name in Evolution API
WHATSAPP_NUMERO_DONO=        # Owner's WhatsApp number in E.164 format (e.g. 5518999999999)
NEXT_PUBLIC_SITE_URL=        # Public URL of the deployed site
```

## Architecture Overview

This is a **Next.js 14 (App Router)** site for a car dealership ("Lucas Veículos", Araçatuba/SP). The project is split into a public-facing site and an admin panel.

### Database

PostgreSQL accessed via `src/lib/db.ts` using a connection pool (`pg`). All queries go through the exported `query()` helper. Table naming convention is `TAB_*`:

- `TAB_CARRO` — vehicle records (`disponivel` boolean controls visibility in public estoque)
- `TAB_CARRO_IMAGEM` — vehicle images (supports multiple per car, ordered by `ordem`)
- `TAB_MIDIA` — site media (images/videos per section, e.g. carousels)
- `TAB_CONFIGURACAO` — key-value store for theme colors and site settings
- `TAB_USUARIO` — admin users (plain-text password comparison — not hashed)
- `TAB_AUDITORIA` — audit log of CREATE/UPDATE/DELETE actions
- `TAB_LEAD` — CRM leads (nome, email, telefone, origem, etapa_id, carro_id FK, valor_estimado)
- `TAB_LEAD_ETAPA` — pipeline stages (nome, cor, ordem) — e.g. Novo, Contactado, Negociação, Ganho, Perdido
- `TAB_LEAD_INTERACAO` — timeline entries per lead (tipo, texto, usuario, criado_em)
- `TAB_LEAD_TAREFA` — tasks per lead (descricao, tipo, prazo, status pendente/concluida)

### Authentication

Session-based via `sessionStorage` on the client. On login (`/api/login`), the server sets a `admin_usuario` cookie (non-httpOnly) for audit tracking, and the client stores `admin_logado` / `admin_nome` in `sessionStorage`. The `src/app/admin/layout.tsx` client component redirects to `/entrar` if `sessionStorage.admin_logado` is missing.

**Note:** Passwords in `TAB_USUARIO` are stored and compared as plain text. The `bcryptjs` package is installed but not used.

### Audit System

`src/lib/auditoria.ts` provides `registrarAuditoria()` and `getClientInfo()`. Every API route that mutates data should call both. `getClientInfo()` reads the admin username from the `admin_usuario` cookie.

### Theme/Personalization

`TAB_CONFIGURACAO` stores CSS color values keyed by names like `cor_primaria`, `cor_header`, etc. `src/components/TemaProvider.tsx` fetches these on mount and injects a `<style>` block with CSS variables and class overrides. This runs client-side on every page load via the root layout.

### Image & Media Management

- **Vehicle images**: uploaded via `src/app/api/upload/route.tsx` → Cloudinary (`src/lib/cloudinary.ts`). Multiple images per car stored in `TAB_CARRO_IMAGEM` with `ordem` field.
- **Site media**: managed via `src/app/api/midia/` routes — images/videos assigned to named `secao` slots (e.g. carousels, about page gallery).
- Cloudinary is configured in `src/lib/cloudinary.ts` and used server-side only.

### Public Routes

| Route | Purpose |
|---|---|
| `/` | Home page |
| `/estoque` | Vehicle inventory listing |
| `/carro/[id]` | Individual vehicle detail page |
| `/empresa` | About page |
| `/servicos` | Services page |
| `/contato` | Contact form (sends email via Nodemailer/Gmail) |

### Admin Routes (`/admin/*`)

All protected by the `sessionStorage` check in `src/app/admin/layout.tsx`.

| Route | Purpose |
|---|---|
| `/admin/dashboard` | Main panel — live metrics (carros, leads, tarefas vencidas) |
| `/admin/carros` | List/delete vehicles |
| `/admin/carros/novo` | Add new vehicle |
| `/admin/carros/editar/[id]` | Edit existing vehicle |
| `/admin/midia` | Manage site media per section |
| `/admin/personalizacao` | Edit theme colors (saved to `TAB_CONFIGURACAO`) |
| `/admin/auditoria` | View audit log |
| `/admin/crm` | CRM dashboard — metrics, pipeline funnel, leads esfriando alert |
| `/admin/crm/leads` | Lead list with filters |
| `/admin/crm/leads/[id]` | Lead detail — etapa, tarefas, interações, veículo vinculado |
| `/admin/crm/funil` | Kanban-style pipeline view |
| `/admin/crm/tarefas` | All pending tasks across leads |
| `/admin/crm/relatorios` | Reports |
| `/admin/crm/configuracoes` | CRM settings (etapas, etc.) |

### API Routes (`/api/*`)

All API routes are Next.js Route Handlers in `src/app/api/`. They return JSON and use the `query()` helper directly — no ORM.

### CRM and Leads

The CRM system captures leads from three entry points and manages them through a sales pipeline:

**Lead capture (automatic):**
- Public contact form (`/contato`) → `src/app/api/contact/route.ts` → `criarLeadAutomatico()` + `enviarWhatsAppLead()`
- Financing form (`/financiamento`) → `src/app/api/financiamento-contato/route.ts` → same helpers
- Vehicle interest button (`/carro/[id]`) → `src/app/api/carros/[id]/interesse/route.ts` → direct INSERT with `carro_id`

Both forms read `?carro_id=X` from the URL (set when navigating from a vehicle page) and include it in the lead, so the CRM shows which vehicle the contact came from.

**Key libraries:**
- `src/lib/crm.ts` — exports `criarLeadAutomatico(dados: DadosLead)`. Inserts into `TAB_LEAD`, calls `registrarAuditoria()`. Accepts optional `carro_id`.
- `src/lib/whatsapp.ts` — exports `enviarWhatsAppLead(dados)`. Sends a notification to the owner via Evolution API (`POST /message/sendText/{instance}`). Uses env vars `EVOLUTION_API_URL`, `EVOLUTION_API_KEY`, `EVOLUTION_INSTANCE`, `WHATSAPP_NUMERO_DONO`. Fails silently — never blocks the user flow.

**API routes:**
- `GET/POST /api/leads` — list all leads / create lead
- `GET/PUT /api/leads/[id]` — get or update a lead (etapa, responsavel, carro_id, valor_estimado, etc.)
- `GET/POST /api/leads/[id]/interacoes` — lead timeline entries
- `GET/POST/PATCH /api/leads/[id]/tarefas` — lead tasks
- `GET /api/leads/dashboard` — aggregated metrics (totals, por etapa, leadsEsfriando, etc.)
- `POST /api/carros/[id]/interesse` — records a WhatsApp button click as a lead

**Automation on stage change (PUT /api/leads/[id]):**
- When `etapa_id` changes to the stage named **"Ganho"** and the lead has `carro_id`: automatically sets `TAB_CARRO.disponivel = false` and registers an audit entry. Returns `carro_marcado_vendido: true` in the response.
- When changed to **"Perdido"** and lead has `carro_id`: inserts an automatic interaction warning to check vehicle availability manually. Does NOT revert `disponivel`.

**Leads esfriando alert:**
- The CRM dashboard shows leads without any interaction in the last 3 days (or with no interactions at all) that are not in Ganho/Perdido stages. Max 5 results, ordered by oldest interaction first.

### Styling

CSS Modules via co-located `.css` files (e.g. `admin-carros.css` next to `page.tsx`). Global styles in `src/app/globals.css`. Class names are in Portuguese (e.g. `.botaoDetalhes`, `.cardPreco`). No Tailwind or CSS-in-JS except the dynamic `<style>` injection in `TemaProvider`.

## 📚 Documentação do Projeto

**Toda a documentação está em `docs/` — sempre consultada automaticamente antes de implementar ou corrigir.**

Arquivos disponíveis:

- **[docs/00-Index.md](docs/00-Index.md)** — Visão geral, índice, setup rápido
- **[docs/01-Arquitetura.md](docs/01-Arquitetura.md)** — Stack, estrutura técnica, padrões
- **[docs/02-Banco-de-Dados.md](docs/02-Banco-de-Dados.md)** — Schema, tabelas, SQL
- **[docs/03-Autenticacao.md](docs/03-Autenticacao.md)** — Login, sessão, cookies
- **[docs/04-Rotas.md](docs/04-Rotas.md)** — Rotas públicas e admin, estrutura
- **[docs/05-API.md](docs/05-API.md)** — Endpoints, request/response, tratamento de erros
- **[docs/06-Configuracao.md](docs/06-Configuracao.md)** — Setup local, .env, tema, deploy
- **[docs/07-Cloudinary.md](docs/07-Cloudinary.md)** — Upload, transformações, gerenciamento

### Como usar:

Eu consulto automaticamente a documentação relevante antes de qualquer implementação. Você pode também:

**Referência direta:**
> "Preciso adicionar autenticação com JWT. Ver docs/03-Autenticacao.md"

**Ou deixar que eu detecte:**
> "Preciso fazer upload de imagens. Como faço?"

A documentação evolui com o projeto e fica versionada no git.
