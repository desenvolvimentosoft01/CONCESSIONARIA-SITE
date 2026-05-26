# Manual Técnico — Concessionária Site

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14 (App Router) |
| Banco de dados | PostgreSQL via `pg` (pool) |
| Imagens | Cloudinary |
| WhatsApp | Evolution API |
| E-mail | Nodemailer + Gmail |
| Deploy | Vercel |
| Estilização | CSS Modules (nomes em PT-BR) |

---

## Setup Local

```bash
# 1. Instalar dependências
npm install

# 2. Criar variáveis de ambiente
cp .env.example .env.local   # preencher conforme abaixo

# 3. Rodar em desenvolvimento
npm run dev

# 4. Build de produção
npm run build && npm run start
```

### Variáveis de ambiente (`.env.local`)

```env
DATABASE_URL=                  # PostgreSQL connection string
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
EMAIL_USER=                    # Gmail remetente
EMAIL_PASS=                    # App password do Gmail
CONTACT_RECIPIENT_EMAIL=       # Destinatário dos formulários
EVOLUTION_API_URL=             # Ex: https://chat.exemplo.com
EVOLUTION_API_KEY=
EVOLUTION_INSTANCE=            # Nome da instância WhatsApp
WHATSAPP_NUMERO_DONO=          # E.164, ex: 5518999999999
NEXT_PUBLIC_SITE_URL=          # URL pública do site
```

> `.env.local` está no `.gitignore` — nunca commitar.

---

## Banco de Dados

Helper principal: `src/lib/db.ts` — exporta `query(sql, params?)` que retorna `rows[]`.

### Tabelas principais

| Tabela | Descrição |
|---|---|
| `TAB_CARRO` | Veículos. `disponivel=false` oculta do estoque público. |
| `TAB_CARRO_IMAGEM` | Múltiplas imagens por carro, ordenadas por `ordem`. |
| `TAB_MIDIA` | Mídia por seção do site (carrosséis, galeria, etc.). |
| `TAB_CONFIGURACAO` | Chave-valor para tema (cores CSS) e configurações gerais. |
| `TAB_USUARIO` | Usuários admin. Senha em texto plano (não usa bcrypt). |
| `TAB_AUDITORIA` | Log de CREATE/UPDATE/DELETE de todas as mutações. |
| `TAB_LEAD` | Leads do CRM. Campos: nome, email, telefone, origem, etapa_id, carro_id, valor_estimado. |
| `TAB_LEAD_ETAPA` | Etapas do pipeline (nome, cor hex, ordem). |
| `TAB_LEAD_INTERACAO` | Timeline de interações por lead (tipo, texto, usuario, criado_em). |
| `TAB_LEAD_TAREFA` | Tarefas por lead (descricao, tipo, prazo, status: pendente/concluida). |

---

## Padrões de Código

### Queries resilientes (server components)

```typescript
async function safeQuery(sql: string): Promise<any[]> {
  try { return await query(sql); } catch { return []; }
}

// Usar Promise.allSettled para proteger múltiplas queries
const results = await Promise.allSettled([safeQuery(sql1), safeQuery(sql2)]);
const get = (r: PromiseSettledResult<any[]>) =>
  r.status === 'fulfilled' ? r.value : [];
```

### Auditoria (toda mutação deve registrar)

```typescript
import { registrarAuditoria, getClientInfo } from '@/lib/auditoria';

const { usuario } = getClientInfo(request); // lê cookie admin_usuario
await registrarAuditoria({
  usuario,
  acao: 'CREATE' | 'UPDATE' | 'DELETE',
  tabela: 'TAB_CARRO',
  registroId: id,
  dadosAntes: {},
  dadosDepois: {},
});
```

### Server vs Client Components

- **Server components** (padrão): sem `'use client'`, sem hooks, sem event handlers.
- **Client components**: obrigatório `'use client'` no topo quando usar `useState`, `useEffect`, `onClick`, `useSearchParams`, etc.
- `useSearchParams()` exige `<Suspense>` no componente pai.

---

## Rotas Públicas

| Rota | Descrição |
|---|---|
| `/` | Home |
| `/estoque` | Lista de veículos disponíveis |
| `/carro/[id]` | Detalhe do veículo |
| `/empresa` | Sobre a empresa |
| `/servicos` | Serviços |
| `/contato` | Formulário de contato |
| `/financiamento` | Página de financiamento |

---

## Rotas Admin (`/admin/*`)

Protegidas pelo `src/app/admin/layout.tsx` (verifica `sessionStorage.admin_logado`).

| Rota | Descrição |
|---|---|
| `/admin/dashboard` | Métricas gerais |
| `/admin/carros` | CRUD de veículos |
| `/admin/midia` | Gerenciar mídia por seção |
| `/admin/personalizacao` | Tema e cores |
| `/admin/auditoria` | Histórico de alterações |
| `/admin/crm` | Dashboard CRM |
| `/admin/crm/leads` | Lista de leads |
| `/admin/crm/leads/[id]` | Detalhe do lead |
| `/admin/crm/funil` | Kanban do pipeline |
| `/admin/crm/tarefas` | Tarefas pendentes |
| `/admin/crm/relatorios` | Relatórios e gráficos |
| `/admin/crm/configuracoes` | Etapas do pipeline |

---

## API Routes (`/api/*`)

| Endpoint | Métodos | Descrição |
|---|---|---|
| `/api/login` | POST | Autenticação, seta cookie `admin_usuario` |
| `/api/carros` | GET, POST | Lista / cria veículo |
| `/api/carros/[id]` | GET, PUT, DELETE | CRUD de veículo individual |
| `/api/carros/[id]/imagens` | GET, POST, DELETE | Imagens do veículo |
| `/api/carros/[id]/interesse` | POST | Registra lead via botão WhatsApp |
| `/api/leads` | GET, POST | Lista / cria lead |
| `/api/leads/[id]` | GET, PUT | Lê / atualiza lead |
| `/api/leads/[id]/interacoes` | GET, POST | Timeline do lead |
| `/api/leads/[id]/tarefas` | GET, POST, PATCH | Tarefas do lead |
| `/api/leads/etapas` | GET, POST | Lista / cria etapa |
| `/api/leads/etapas/[id]` | PUT, DELETE | Edita / remove etapa |
| `/api/leads/dashboard` | GET | Métricas agregadas do CRM |
| `/api/midia` | GET, POST, DELETE | Mídia por seção |
| `/api/configuracao` | GET, PUT | Tema e configurações |
| `/api/auditoria` | GET | Log de auditoria |
| `/api/contact` | POST | Formulário de contato → e-mail + lead |
| `/api/financiamento-contato` | POST | Formulário financiamento → e-mail + lead |

### Automações no PUT `/api/leads/[id]`

- **Etapa → "Ganho"** com `carro_id`: marca `TAB_CARRO.disponivel = false` automaticamente.
- **Etapa → "Perdido"** com `carro_id`: cria interação automática avisando para verificar o estoque.

---

## CRM — Captura de Leads

Três pontos de entrada:

1. **Formulário de contato** (`/contato`) → `criarLeadAutomatico()` + `enviarWhatsAppLead()`
2. **Formulário de financiamento** (`/financiamento`) → mesmos helpers
3. **Botão "Negociar via WhatsApp"** (`/carro/[id]`) → INSERT direto com `carro_id`

Helpers em `src/lib/crm.ts` e `src/lib/whatsapp.ts`.

---

## Deploy

```bash
git add <arquivos>
git commit -m "mensagem"
git push   # Vercel detecta e faz deploy automático
```

Variáveis de ambiente de produção ficam no painel da Vercel (não no repositório).
