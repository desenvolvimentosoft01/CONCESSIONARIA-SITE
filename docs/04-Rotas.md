# 🛣️ Rotas

## Rotas Públicas

Acessíveis sem autenticação.

| Rota | Arquivo | Descrição |
|------|---------|-----------|
| `/` | `src/app/page.tsx` | Home com destaque, últimos carros |
| `/estoque` | `src/app/estoque/page.tsx` | Listagem de todos os veículos |
| `/carro/[id]` | `src/app/carro/[id]/page.tsx` | Detalhes de um carro + imagens |
| `/empresa` | `src/app/empresa/page.tsx` | Sobre a concessionária |
| `/servicos` | `src/app/servicos/page.tsx` | Serviços oferecidos |
| `/contato` | `src/app/contato/page.tsx` | Formulário de contato (envia email) |
| `/entrar` | `src/app/entrar/page.tsx` | Página de login |

## Rotas Admin

Protegidas por autenticação (SessionStorage). Rota: `/admin/*`

**Layout:** `src/app/admin/layout.tsx` — valida `admin_logado`

| Rota | Arquivo | Descrição |
|------|---------|-----------|
| `/admin/dashboard` | `src/app/admin/dashboard/page.tsx` | Painel principal com links |
| `/admin/carros` | `src/app/admin/carros/page.tsx` | Listar e deletar veículos |
| `/admin/carros/novo` | `src/app/admin/carros/novo/page.tsx` | Adicionar novo carro |
| `/admin/carros/editar/[id]` | `src/app/admin/carros/editar/[id]/page.tsx` | Editar carro existente |
| `/admin/midia` | `src/app/admin/midia/page.tsx` | Gerenciar mídia por seção |
| `/admin/personalizacao` | `src/app/admin/personalizacao/page.tsx` | Editar tema (cores) |
| `/admin/auditoria` | `src/app/admin/auditoria/page.tsx` | Visualizar log de auditoria |

## Dinâmica de Rotas

### `/carro/[id]`

Utiliza `generateStaticParams` para pré-renderização estática:

```typescript
// src/app/carro/[id]/page.tsx
export async function generateStaticParams() {
  const carros = await query("SELECT id FROM TAB_CARRO");
  return carros.rows.map(c => ({ id: c.id.toString() }));
}
```

Permite acesso via URL: `https://exemplo.com/carro/5`

### `/admin/carros/editar/[id]`

Similar, mas sem pré-renderização (conteúdo dinâmico do admin).

```typescript
export default async function EditarCarro({ params: { id } }) {
  const carro = await query("SELECT * FROM TAB_CARRO WHERE id = $1", [id]);
  // ...
}
```

## API Routes

Endpoints de backend em `src/app/api/`:

### Autenticação
- `POST /api/login` — autenticar usuário
- `POST /api/logout` — fazer logout

### Veículos
- `GET /api/carros` — listar todos
- `GET /api/carros/[id]` — detalhes de um
- `POST /api/carros` — criar novo
- `PUT /api/carros/[id]` — atualizar
- `DELETE /api/carros/[id]` — deletar

### Imagens
- `POST /api/upload` — upload para Cloudinary
- `DELETE /api/upload` — deletar imagem (com `publicId`)

### Mídia por Seção
- `GET /api/midia/[secao]` — obter mídia de uma seção
- `POST /api/midia/[secao]` — adicionar mídia
- `DELETE /api/midia/[id]` — remover mídia

### Configurações
- `GET /api/config` — obter todas as configurações
- `PUT /api/config` — atualizar (tema, cores)

### Auditoria
- `GET /api/auditoria` — listar logs (paginado)

## Estrutura de Arquivos

```
src/app/
├── api/                           # API routes
│   ├── login/route.ts
│   ├── logout/route.ts
│   ├── carros/
│   │   ├── route.ts              # GET, POST
│   │   └── [id]/route.ts         # GET, PUT, DELETE
│   ├── upload/route.ts
│   ├── midia/
│   │   ├── [secao]/route.ts
│   │   └── [id]/route.ts
│   ├── config/route.ts
│   └── auditoria/route.ts
│
├── (public)/                      # Rotas públicas
│   ├── page.tsx                  # /
│   ├── estoque/
│   │   └── page.tsx
│   ├── carro/
│   │   └── [id]/
│   │       ├── page.tsx
│   │       └── layout.tsx
│   ├── empresa/
│   │   └── page.tsx
│   ├── servicos/
│   │   └── page.tsx
│   └── contato/
│       └── page.tsx
│
├── admin/                         # Admin (protected)
│   ├── layout.tsx                # Validação auth
│   ├── dashboard/
│   │   └── page.tsx
│   ├── carros/
│   │   ├── page.tsx
│   │   ├── novo/
│   │   │   └── page.tsx
│   │   └── editar/
│   │       └── [id]/
│   │           └── page.tsx
│   ├── midia/
│   │   └── page.tsx
│   ├── personalizacao/
│   │   └── page.tsx
│   └── auditoria/
│       └── page.tsx
│
├── entrar/
│   └── page.tsx
│
├── layout.tsx                     # Layout raiz
└── globals.css
```

## Redirecionamentos

Implementados via `next/navigation`:

```typescript
import { useRouter } from 'next/navigation';

const router = useRouter();
router.push('/carro/123');  // Ir para outra página
```

## Status Codes HTTP

APIs retornam:
- `200` — Sucesso
- `201` — Criado (POST)
- `204` — Sem conteúdo (DELETE bem-sucedido)
- `400` — Erro de validação
- `401` — Não autenticado
- `403` — Não autorizado
- `404` — Não encontrado
- `500` — Erro interno
