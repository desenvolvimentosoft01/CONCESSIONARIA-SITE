# 🏗️ Arquitetura Técnica

## Stack Principal

- **Frontend:** Next.js 14 (App Router)
- **Backend:** Next.js Route Handlers (API routes)
- **Banco de Dados:** PostgreSQL (com pool de conexões)
- **Autenticação:** Session-based (sessionStorage + cookies)
- **Imagens:** Cloudinary
- **Email:** Nodemailer + Gmail
- **Styling:** CSS Modules (sem Tailwind)

## Arquitetura Geral

```
┌─────────────────────────────────────────┐
│         NAVEGADOR (Cliente)             │
│  - Páginas públicas                     │
│  - Painel admin                         │
│  - sessionStorage (sessão)              │
└──────────────┬──────────────────────────┘
               │ HTTP/HTTPS
┌──────────────▼──────────────────────────┐
│    NEXT.JS 14 (Servidor)                │
│  - App Router (/app)                    │
│  - API Routes (/api)                    │
│  - TemaProvider (tema dinâmico)         │
└──────────────┬──────────────────────────┘
               │
    ┌──────────┼──────────┬─────────────┐
    │          │          │             │
┌───▼──┐  ┌───▼──┐  ┌────▼───┐  ┌─────▼────┐
│  PG  │  │Cloud │  │ Gmail  │  │ Auditoria│
│      │  │dinary│  │Nodemailer    │      │
└──────┘  └──────┘  └────────┘  └──────────┘
```

## Camadas

### 1. **Apresentação (Frontend)**

Componentes React em `src/components/` e páginas em `src/app/`:

- **Páginas Públicas:** `/`, `/estoque`, `/carro/[id]`, `/empresa`, `/servicos`, `/contato`
- **Painel Admin:** `/admin/dashboard`, `/admin/carros`, `/admin/midia`, `/admin/personalizacao`, `/admin/auditoria`
- **Login:** `/entrar`

### 2. **Negócio (Server-side logic)**

Lógica em API routes (`src/app/api/`) e server-side utils:

- `/api/login` — autenticação
- `/api/upload` — upload de imagens para Cloudinary
- `/api/carros` — CRUD de veículos
- `/api/midia/*` — gerenciamento de mídia por seção
- `/api/config` — tema e configurações
- `/api/auditoria` — log de mudanças

### 3. **Dados (Persistência)**

PostgreSQL via `src/lib/db.ts`:

- Tabelas: `TAB_CARRO`, `TAB_CARRO_IMAGEM`, `TAB_MIDIA`, `TAB_CONFIGURACAO`, `TAB_USUARIO`, `TAB_AUDITORIA`
- Convenção: nomes em MAIÚSCULAS com prefixo `TAB_`
- Sem ORM — SQL puro via helper `query()`

## Fluxo de Dados

### Buscar Veículos
```
GET /api/carros
  ↓
query("SELECT * FROM TAB_CARRO")
  ↓
JSON response
  ↓
Frontend renderiza lista
```

### Upload de Imagem
```
POST /api/upload (multipart/form-data)
  ↓
Cloudinary.uploader.upload()
  ↓
Salvar URL em TAB_CARRO_IMAGEM
  ↓
registrarAuditoria()
  ↓
JSON { success, url }
```

### Login
```
POST /api/login { usuario, senha }
  ↓
Validar em TAB_USUARIO
  ↓
Set cookie admin_usuario
  ↓
sessionStorage.admin_logado = true
  ↓
Redirecionar para /admin/dashboard
```

## Padrões de Código

### Nomenclatura

- **Arquivos/Pastas:** camelCase (ex: `TemaProvider.tsx`)
- **Classes CSS:** PascalCase português (ex: `.botaoDetalhes`, `.cardPreco`)
- **Variáveis banco:** SNAKE_CASE (ex: `TAB_CARRO`, `data_criacao`)
- **Commits:** Padrão convencional em português (`feat:`, `fix:`, `refactor:`, `docs:`)

### API Routes

Padrão básico:

```typescript
// src/app/api/exemplo/route.ts
import { query } from '@/lib/db';
import { registrarAuditoria, getClientInfo } from '@/lib/auditoria';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const result = await query("SELECT * FROM TAB_EXEMPLO");
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await query("INSERT INTO TAB_EXEMPLO (...) VALUES (...)", [body.x]);
    
    await registrarAuditoria({
      tabela: 'TAB_EXEMPLO',
      acao: 'INSERT',
      dados_antigos: null,
      dados_novos: result,
      usuario: getClientInfo(req),
    });
    
    return NextResponse.json(result);
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
- `bcryptjs` — (instalado, mas não usado atualmente)

## Sem Testes/Linter

Este projeto não possui:
- Jest, Vitest ou framework de testes
- ESLint ou Prettier configurados

Validação é manual + inspeção visual.
