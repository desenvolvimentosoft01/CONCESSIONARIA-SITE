# Rotas

## Rotas Publicas

Acessiveis sem autenticacao.

| Rota | Arquivo | Descricao |
|------|---------|-----------|
| `/` | `src/app/page.tsx` | Home com destaque, ultimos carros |
| `/estoque` | `src/app/estoque/page.tsx` | Listagem de veiculos disponiveis |
| `/carro/[id]` | `src/app/carro/[id]/page.tsx` | Detalhes de um carro + galeria + botao WhatsApp |
| `/empresa` | `src/app/empresa/page.tsx` | Sobre a concessionaria |
| `/servicos` | `src/app/servicos/page.tsx` | Servicos oferecidos |
| `/contato` | `src/app/contato/page.tsx` | Formulario de contato (envia email + cria lead) |
| `/financiamento` | `src/app/financiamento/page.tsx` | Formulario de financiamento (cria lead) |
| `/entrar` | `src/app/entrar/page.tsx` | Pagina de login |

## Rotas Admin

Protegidas por autenticacao (SessionStorage). Rota: `/admin/*`

**Layout:** `src/app/admin/layout.tsx` — valida `admin_logado` em sessionStorage e redireciona para `/entrar` se ausente.

### Principal

| Rota | Arquivo | Descricao |
|------|---------|-----------|
| `/admin/dashboard` | `src/app/admin/dashboard/page.tsx` | Painel principal com metricas ao vivo (carros, leads, tarefas vencidas) |

### Veiculos

| Rota | Arquivo | Descricao |
|------|---------|-----------|
| `/admin/carros` | `src/app/admin/carros/page.tsx` | Listar e deletar veiculos |
| `/admin/carros/novo` | `src/app/admin/carros/novo/page.tsx` | Adicionar novo carro |
| `/admin/carros/editar/[id]` | `src/app/admin/carros/editar/[id]/page.tsx` | Editar carro existente |

### CRM

| Rota | Arquivo | Descricao |
|------|---------|-----------|
| `/admin/crm` | `src/app/admin/crm/page.tsx` | Dashboard CRM — metricas, funil, leads esfriando |
| `/admin/crm/leads` | `src/app/admin/crm/leads/page.tsx` | Lista de leads com filtros |
| `/admin/crm/leads/[id]` | `src/app/admin/crm/leads/[id]/page.tsx` | Detalhe do lead — etapa, tarefas, interacoes, veiculo vinculado |
| `/admin/crm/funil` | `src/app/admin/crm/funil/page.tsx` | Kanban do pipeline de vendas |
| `/admin/crm/tarefas` | `src/app/admin/crm/tarefas/page.tsx` | Todas as tarefas pendentes (cross-leads) |
| `/admin/crm/relatorios` | `src/app/admin/crm/relatorios/page.tsx` | Relatorios de vendas |
| `/admin/crm/configuracoes` | `src/app/admin/crm/configuracoes/page.tsx` | Configurar etapas do pipeline |

### Configuracoes (agrupadas em sub-abas)

| Rota | Arquivo | Descricao |
|------|---------|-----------|
| `/admin/configuracoes` | `src/app/admin/configuracoes/page.tsx` | Pagina hub com sub-abas |
| `/admin/configuracoes/cores` | `src/app/admin/configuracoes/cores/page.tsx` | Editar tema (cores CSS) |
| `/admin/configuracoes/midia` | `src/app/admin/configuracoes/midia/page.tsx` | Gerenciar midia por secao |
| `/admin/configuracoes/textos` | `src/app/admin/configuracoes/textos/page.tsx` | Textos da pagina de financiamento |
| `/admin/configuracoes/auditoria` | `src/app/admin/configuracoes/auditoria/page.tsx` | Log de auditoria |

**Nota:** A rota antiga `/admin/personalizacao` foi substituida por `/admin/configuracoes/cores`. A rota `/admin/midia` foi movida para `/admin/configuracoes/midia`. A rota `/admin/auditoria` foi movida para `/admin/configuracoes/auditoria`.

## Dinamica de Rotas

### `/carro/[id]`

Pagina de detalhe do veiculo. Quando o usuario clica em "Negociar via WhatsApp" ou acessa os formularios de contato/financiamento a partir desta pagina, o `carro_id` e passado via query string para captura de lead:

```
/contato?carro_id=5
/financiamento?carro_id=5
```

Os formularios leem `useSearchParams()` e incluem `carro_id` no payload do lead.

### `/admin/carros/editar/[id]`

Parametro dinamico lido via `params.id`. Conteudo dinamico, sem pré-renderizacao.

## API Routes

Endpoints de backend em `src/app/api/`:

### Autenticacao
- `POST /api/login` — autenticar usuario

### Veiculos
- `GET /api/carros` — listar todos os disponiveis
- `GET /api/carros/[id]` — detalhes de um veiculo
- `POST /api/carros` — criar novo veiculo
- `PUT /api/carros/[id]` — atualizar veiculo
- `DELETE /api/carros/[id]` — deletar veiculo
- `POST /api/carros/[id]/interesse` — registrar clique no botao WhatsApp como lead

### Upload de Imagens
- `POST /api/upload` — upload para Cloudinary + salva em TAB_CARRO_IMAGEM

### Midia por Secao
- `GET /api/midia` — listar midias (com filtro por secao)
- `POST /api/midia` — adicionar midia
- `DELETE /api/midia` — remover midia
- `POST /api/midia/upload` — upload de arquivo de midia para Cloudinary

### CRM — Leads
- `GET /api/leads` — listar leads (com filtros)
- `POST /api/leads` — criar lead
- `GET /api/leads/[id]` — detalhe de um lead
- `PUT /api/leads/[id]` — atualizar lead (etapa, responsavel, etc.)
- `GET /api/leads/[id]/interacoes` — listar interacoes do lead
- `POST /api/leads/[id]/interacoes` — adicionar interacao
- `GET /api/leads/[id]/tarefas` — listar tarefas do lead
- `POST /api/leads/[id]/tarefas` — criar tarefa
- `PATCH /api/leads/[id]/tarefas` — atualizar status de tarefa
- `GET /api/leads/dashboard` — metricas agregadas do CRM
- `GET /api/leads/etapas` — listar etapas do pipeline
- `POST /api/leads/etapas` — criar nova etapa
- `PUT /api/leads/etapas/[id]` — atualizar etapa
- `DELETE /api/leads/etapas/[id]` — deletar etapa

### Configuracoes
- `GET /api/configuracao` — obter todas as configuracoes
- `POST /api/configuracao` — criar ou atualizar configuracao

### Auditoria
- `GET /api/auditoria` — listar logs (paginado)

### Formularios publicos (criam leads automaticamente)
- `POST /api/contact` — formulario de contato (email + lead)
- `POST /api/financiamento-contato` — formulario de financiamento (lead)

## Estrutura de Arquivos

```
src/app/
+-- api/                           # API routes
|   +-- login/route.ts
|   +-- carros/
|   |   +-- route.ts              # GET, POST
|   |   +-- [id]/
|   |       +-- route.ts          # GET, PUT, DELETE
|   |       +-- interesse/
|   |           +-- route.ts      # POST (registra lead de interesse)
|   +-- upload/route.ts
|   +-- midia/
|   |   +-- route.ts              # GET, POST, DELETE
|   |   +-- upload/route.ts       # POST (upload de arquivo)
|   +-- configuracao/route.ts     # GET, POST
|   +-- auditoria/route.ts        # GET
|   +-- leads/
|   |   +-- route.ts              # GET, POST
|   |   +-- dashboard/route.ts    # GET (metricas)
|   |   +-- etapas/
|   |   |   +-- route.ts          # GET, POST
|   |   |   +-- [id]/route.ts     # PUT, DELETE
|   |   +-- [id]/
|   |       +-- route.ts          # GET, PUT
|   |       +-- interacoes/route.ts  # GET, POST
|   |       +-- tarefas/route.ts     # GET, POST, PATCH
|   +-- contact/route.ts          # POST (formulario contato publico)
|   +-- financiamento-contato/route.ts  # POST (formulario financiamento)
|
+-- page.tsx                       # /
+-- estoque/page.tsx               # /estoque
+-- carro/[id]/page.tsx            # /carro/[id]
+-- empresa/page.tsx               # /empresa
+-- servicos/page.tsx              # /servicos
+-- contato/page.tsx               # /contato
+-- financiamento/page.tsx         # /financiamento
+-- entrar/page.tsx                # /entrar
|
+-- admin/                         # Admin (protegido)
|   +-- layout.tsx                 # Validacao auth + sidebar
|   +-- dashboard/page.tsx
|   +-- carros/
|   |   +-- page.tsx
|   |   +-- novo/page.tsx
|   |   +-- editar/[id]/page.tsx
|   +-- crm/
|   |   +-- page.tsx              # Dashboard CRM
|   |   +-- leads/
|   |   |   +-- page.tsx
|   |   |   +-- [id]/page.tsx
|   |   +-- funil/page.tsx
|   |   +-- tarefas/page.tsx
|   |   +-- relatorios/page.tsx
|   |   +-- configuracoes/page.tsx
|   +-- configuracoes/
|       +-- layout.tsx
|       +-- page.tsx              # Hub (redireciona para /cores)
|       +-- cores/page.tsx        # Editor de tema
|       +-- midia/page.tsx        # Gerenciador de midia
|       +-- textos/page.tsx       # Textos da pagina financiamento
|       +-- auditoria/page.tsx    # Log de auditoria
|
+-- layout.tsx                     # Layout raiz (inclui TemaProvider)
+-- globals.css
```

## Status Codes HTTP

APIs retornam:
- `200` — Sucesso
- `201` — Criado (POST)
- `400` — Erro de validacao
- `401` — Nao autenticado
- `404` — Nao encontrado
- `500` — Erro interno
