# Arquitetura Tecnica

## Stack Principal

- **Frontend:** Next.js 14 (App Router)
- **Backend:** Next.js Route Handlers (API routes)
- **Banco de Dados:** PostgreSQL (com pool de conexoes via `pg`)
- **Autenticacao:** Session-based (sessionStorage + cookies)
- **Imagens:** Cloudinary
- **Email:** Nodemailer + Gmail
- **WhatsApp:** Evolution API (notificacoes de leads)
- **Styling:** CSS Modules (sem Tailwind)
- **Deploy:** Vercel

## Arquitetura Geral

```
+------------------------------------------+
|         NAVEGADOR (Cliente)              |
|  - Paginas publicas                      |
|  - Painel admin                          |
|  - sessionStorage (sessao)               |
+-------------------+----------------------+
                    | HTTP/HTTPS
+-------------------v----------------------+
|    NEXT.JS 14 (Servidor)                 |
|  - App Router (/app)                     |
|  - API Routes (/api)                     |
|  - TemaProvider (tema dinamico)          |
+-------------------+----------------------+
                    |
     +--------------+-----------+----------+
     |              |           |          |
+----v---+  +-------v-+ +-------v-+ +------v------+
|  PG    |  |Cloudinary| | Gmail  | | Evolution   |
|        |  |          | |Nodemailer |  API (WA)  |
+--------+  +----------+ +---------+ +-------------+
```

## Camadas

### 1. Apresentacao (Frontend)

Componentes React em `src/components/` e paginas em `src/app/`:

- **Paginas Publicas:** `/`, `/estoque`, `/carro/[id]`, `/empresa`, `/servicos`, `/contato`, `/financiamento`
- **Painel Admin:** `/admin/dashboard`, `/admin/carros`, `/admin/crm/*`, `/admin/configuracoes/*`
- **Login:** `/entrar`

### 2. Negocio (Server-side logic)

Logica em API routes (`src/app/api/`) e server-side utils:

- `/api/login` — autenticacao
- `/api/upload` — upload de imagens para Cloudinary
- `/api/carros` — CRUD de veiculos
- `/api/midia` — gerenciamento de midia por secao
- `/api/configuracao` — tema e configuracoes gerais
- `/api/auditoria` — log de mudancas
- `/api/leads` — CRM (leads, etapas, interacoes, tarefas, dashboard)
- `/api/contact` — formulario de contato (email + lead)
- `/api/financiamento-contato` — formulario de financiamento (lead)

### 3. Dados (Persistencia)

PostgreSQL via `src/lib/db.ts`:

- Tabelas: `TAB_CARRO`, `TAB_CARRO_IMAGEM`, `TAB_MIDIA`, `TAB_CONFIGURACAO`, `TAB_USUARIO`, `TAB_AUDITORIA`, `TAB_LEAD`, `TAB_LEAD_ETAPA`, `TAB_LEAD_INTERACAO`, `TAB_LEAD_TAREFA`
- Convencao: nomes em MAIUSCULAS com prefixo `TAB_`
- Sem ORM — SQL puro via helper `query()`

### 4. Helpers e Libs

- `src/lib/crm.ts` — `criarLeadAutomatico()`: insere lead no banco e chama auditoria
- `src/lib/whatsapp.ts` — `enviarWhatsAppLead()`: envia notificacao ao dono via Evolution API (falha silenciosamente)
- `src/lib/auditoria.ts` — `registrarAuditoria()` e `getClientInfo()`: log de todas as mutacoes

## Fluxo de Dados

### Buscar Veiculos
```
GET /api/carros
  v
query("SELECT * FROM TAB_CARRO WHERE disponivel = true")
  v
JSON response
  v
Frontend renderiza lista
```

### Upload de Imagem
```
POST /api/upload (multipart/form-data)
  v
Cloudinary.uploader.upload()
  v
Salvar URL em TAB_CARRO_IMAGEM
  v
registrarAuditoria()
  v
JSON { success, url }
```

### Captura de Lead (Formulario)
```
POST /api/contact ou /api/financiamento-contato
  v
criarLeadAutomatico() -> INSERT TAB_LEAD
  v
registrarAuditoria()
  v
enviarWhatsAppLead() -> Evolution API (fire-and-forget)
  v
Nodemailer -> Gmail (email de notificacao)
```

### Login
```
POST /api/login { usuario, senha }
  v
Validar em TAB_USUARIO (plain text)
  v
Set cookie admin_usuario
  v
sessionStorage.admin_logado = true
  v
Redirecionar para /admin/dashboard
```

## Padroes de Codigo

### Nomenclatura

- **Arquivos/Pastas:** camelCase (ex: `TemaProvider.tsx`)
- **Classes CSS:** camelCase portugues (ex: `.botaoDetalhes`, `.cardPreco`)
- **Variaveis banco:** SNAKE_CASE (ex: `TAB_CARRO`, `data_criacao`)
- **Commits:** Padrao convencional em portugues (`feat:`, `fix:`, `refactor:`, `docs:`)

### API Routes

Padrao basico:

```typescript
// src/app/api/exemplo/route.ts
import { query } from '@/lib/db';
import { registrarAuditoria, getClientInfo } from '@/lib/auditoria';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const result = await query("SELECT * FROM TAB_EXEMPLO");
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await query(
      "INSERT INTO TAB_EXEMPLO (...) VALUES (...) RETURNING *",
      [body.x]
    );

    await registrarAuditoria({
      tabela: 'TAB_EXEMPLO',
      acao: 'CREATE',
      dados_antes: null,
      dados_depois: result.rows[0],
      usuario: getClientInfo(req),
    });

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

## Libs Principais

- `next` — framework
- `pg` — driver PostgreSQL
- `cloudinary` — SDK imagens
- `nodemailer` — envio de emails
- `bcryptjs` — instalado, mas nao usado atualmente (senhas em plain text)

## Sem Testes/Linter

Este projeto nao possui:
- Jest, Vitest ou framework de testes
- ESLint ou Prettier configurados

Validacao e manual + inspecao visual.
