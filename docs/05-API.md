# API Reference

Todos os endpoints retornam JSON. Base URL: `/api/`

## Autenticacao

### POST /api/login

Autentica um usuario.

**Request:**
```json
{
  "email": "admin@example.com",
  "senha": "admin123"
}
```

**Response (200):**
```json
{
  "success": true,
  "nome": "Admin User"
}
```

**Response (401):**
```json
{
  "error": "Usuario ou senha invalidos"
}
```

**Efeitos colaterais:**
- Set cookie `admin_usuario` (nao httpOnly)
- Cliente armazena `admin_logado` e `admin_nome` em sessionStorage

---

## Veiculos

### GET /api/carros

Lista veiculos. Por padrao retorna apenas os disponiveis (para uso publico).

**Query params:**
- `todos` — se `true`, retorna todos incluindo indisponiveis (uso admin)

**Response (200):**
```json
[
  {
    "id": 1,
    "marca": "Toyota",
    "modelo": "Corolla",
    "ano": 2023,
    "cor": "Branco",
    "placa": "ABC1D23",
    "preco": 85000,
    "imagem_url": "https://res.cloudinary.com/.../img.jpg",
    "descricao": "Impecavel, unico dono",
    "disponivel": true,
    "data_criacao": "2024-01-15T10:30:00Z"
  }
]
```

---

### GET /api/carros/[id]

Detalhes de um veiculo especifico, incluindo imagens.

**Response (200):**
```json
{
  "carro": {
    "id": 1,
    "marca": "Toyota",
    "modelo": "Corolla",
    "ano": 2023,
    "cor": "Branco",
    "placa": "ABC1D23",
    "preco": 85000,
    "descricao": "Impecavel",
    "disponivel": true,
    "data_criacao": "2024-01-15T10:30:00Z"
  },
  "imagens": [
    {
      "id": 10,
      "imagem_url": "https://res.cloudinary.com/.../image.jpg",
      "ordem": 0,
      "tipo": "imagem"
    }
  ]
}
```

**Response (404):**
```json
{ "error": "Carro nao encontrado" }
```

---

### POST /api/carros

Criar novo veiculo.

**Request:**
```json
{
  "marca": "Honda",
  "modelo": "Civic",
  "ano": 2024,
  "cor": "Preto",
  "placa": "XYZ9A87",
  "preco": 120000,
  "descricao": "Novo, 0km"
}
```

**Response (201):** veiculo criado

**Efeitos colaterais:** Registra em `TAB_AUDITORIA`

---

### PUT /api/carros/[id]

Atualizar veiculo.

**Request:** mesmos campos de criacao (parcial aceito)

**Response (200):** veiculo atualizado

---

### DELETE /api/carros/[id]

Deletar veiculo.

**Response (200):** `{ "success": true }`

**Efeitos colaterais:**
- Deleta imagens associadas via CASCADE
- Registra em `TAB_AUDITORIA`

---

### POST /api/carros/[id]/interesse

Registra o clique no botao "Negociar via WhatsApp" como lead.

**Request:** (sem corpo obrigatorio — pode incluir dados do usuario se disponivel)

**Response (200):**
```json
{ "success": true, "lead_id": 42 }
```

**Efeitos colaterais:**
- Insere lead em `TAB_LEAD` com `origem = 'interesse'` e `carro_id` preenchido
- Registra em `TAB_AUDITORIA`

---

## Upload de Imagens

### POST /api/upload

Upload de imagem para Cloudinary e associacao ao carro.

**Request:** (multipart/form-data)
```
file: [binary image]
carro_id: "5"
ordem: "0"  (opcional)
```

**Response (200):**
```json
{
  "success": true,
  "url": "https://res.cloudinary.com/.../image_xyz123.jpg",
  "publicId": "concessionaria/carros/image_xyz123",
  "id": 25
}
```

---

## Midia por Secao

### GET /api/midia

Listar midias.

**Query params:**
- `secao` — filtrar por secao (ex: `carousel_home`)

**Response (200):**
```json
[
  {
    "id": 1,
    "titulo": "Slide 1",
    "tipo": "imagem",
    "url": "https://res.cloudinary.com/.../img.jpg",
    "secao": "carousel_home",
    "ordem": 0,
    "ativo": true
  }
]
```

---

### POST /api/midia

Adicionar midia a uma secao.

**Request:**
```json
{
  "titulo": "Nova imagem",
  "tipo": "imagem",
  "url": "https://res.cloudinary.com/.../img.jpg",
  "secao": "carousel_home",
  "ordem": 1
}
```

**Response (201):** midia criada

---

### DELETE /api/midia

Remover midia.

**Request:**
```json
{ "id": 5 }
```

**Response (200):** `{ "success": true }`

---

### POST /api/midia/upload

Upload de arquivo de midia para Cloudinary (sem vincular a secao).

**Request:** (multipart/form-data)
```
file: [binary image/video]
```

**Response (200):**
```json
{
  "success": true,
  "url": "https://res.cloudinary.com/.../media.jpg",
  "publicId": "concessionaria/midia/media"
}
```

---

## CRM — Leads

### GET /api/leads

Listar leads.

**Query params:**
- `etapa_id` — filtrar por etapa
- `origem` — filtrar por origem (`contato`, `financiamento`, `interesse`)
- `search` — busca por nome/email/telefone

**Response (200):**
```json
[
  {
    "id": 1,
    "nome": "Joao Silva",
    "email": "joao@email.com",
    "telefone": "18999999999",
    "origem": "contato",
    "etapa_id": 1,
    "etapa_nome": "Novo",
    "etapa_cor": "#6B7280",
    "carro_id": 5,
    "carro_modelo": "Corolla",
    "valor_estimado": 85000,
    "criado_em": "2024-01-20T10:00:00Z"
  }
]
```

---

### POST /api/leads

Criar lead manualmente.

**Request:**
```json
{
  "nome": "Maria Santos",
  "email": "maria@email.com",
  "telefone": "18988888888",
  "mensagem": "Interesse no Civic",
  "origem": "contato",
  "carro_id": 3
}
```

**Response (201):** lead criado

---

### GET /api/leads/[id]

Detalhe de um lead.

**Response (200):**
```json
{
  "id": 1,
  "nome": "Joao Silva",
  "email": "joao@email.com",
  "telefone": "18999999999",
  "mensagem": "Quero o Corolla",
  "origem": "contato",
  "etapa_id": 2,
  "responsavel_id": 1,
  "carro_id": 5,
  "valor_estimado": 85000,
  "criado_em": "2024-01-20T10:00:00Z",
  "atualizado_em": "2024-01-21T14:00:00Z"
}
```

---

### PUT /api/leads/[id]

Atualizar lead (etapa, responsavel, valor, etc.).

**Request:**
```json
{
  "etapa_id": 4,
  "responsavel_id": 1,
  "valor_estimado": 90000
}
```

**Response (200):**
```json
{
  "lead": { ... },
  "carro_marcado_vendido": true
}
```

**Automacoes ao mudar etapa:**
- Mover para etapa **"Ganho"** + lead tem `carro_id`: define `TAB_CARRO.disponivel = false` e retorna `carro_marcado_vendido: true`
- Mover para etapa **"Perdido"** + lead tem `carro_id`: cria interacao automatica alertando para verificar disponibilidade do veiculo manualmente

---

### GET /api/leads/[id]/interacoes

Listar interacoes (timeline) de um lead.

**Response (200):**
```json
[
  {
    "id": 1,
    "lead_id": 5,
    "tipo": "ligacao",
    "texto": "Cliente confirmou interesse",
    "usuario": "Lucas",
    "criado_em": "2024-01-21T10:00:00Z"
  }
]
```

---

### POST /api/leads/[id]/interacoes

Adicionar interacao ao lead.

**Request:**
```json
{
  "tipo": "email",
  "texto": "Enviado proposta por email"
}
```

**Response (201):** interacao criada

---

### GET /api/leads/[id]/tarefas

Listar tarefas de um lead.

**Response (200):**
```json
[
  {
    "id": 1,
    "lead_id": 5,
    "tipo": "ligacao",
    "descricao": "Ligar para confirmar visita",
    "prazo": "2024-01-25T10:00:00Z",
    "status": "pendente",
    "usuario": "Lucas",
    "criado_em": "2024-01-21T10:00:00Z"
  }
]
```

---

### POST /api/leads/[id]/tarefas

Criar tarefa para um lead.

**Request:**
```json
{
  "tipo": "visita",
  "descricao": "Visita agendada para test drive",
  "prazo": "2024-01-30T14:00:00Z"
}
```

**Response (201):** tarefa criada

---

### PATCH /api/leads/[id]/tarefas

Atualizar status de uma tarefa.

**Request:**
```json
{
  "tarefa_id": 3,
  "status": "concluida"
}
```

**Response (200):** tarefa atualizada

---

### GET /api/leads/dashboard

Metricas agregadas do CRM.

**Response (200):**
```json
{
  "totalLeads": 42,
  "leadsPorEtapa": [
    { "etapa": "Novo", "cor": "#6B7280", "total": 10 },
    { "etapa": "Negociacao", "cor": "#F59E0B", "total": 5 },
    { "etapa": "Ganho", "cor": "#10B981", "total": 8 }
  ],
  "tarefasVencidas": 3,
  "leadsEsfriando": [
    {
      "id": 7,
      "nome": "Carlos Pereira",
      "etapa": "Contactado",
      "ultima_interacao": "2024-01-10T10:00:00Z"
    }
  ]
}
```

**Leads esfriando:** leads sem interacao nos ultimos 3 dias (ou sem nenhuma interacao) que nao estao em Ganho/Perdido. Max 5 resultados.

---

## CRM — Etapas do Pipeline

### GET /api/leads/etapas

Listar etapas do pipeline.

**Response (200):**
```json
[
  { "id": 1, "nome": "Novo", "ordem": 1, "cor": "#6B7280" },
  { "id": 2, "nome": "Contactado", "ordem": 2, "cor": "#3B82F6" },
  { "id": 3, "nome": "Negociacao", "ordem": 3, "cor": "#F59E0B" },
  { "id": 4, "nome": "Ganho", "ordem": 4, "cor": "#10B981" },
  { "id": 5, "nome": "Perdido", "ordem": 5, "cor": "#EF4444" }
]
```

---

### POST /api/leads/etapas

Criar nova etapa.

**Request:**
```json
{ "nome": "Em Analise", "ordem": 3, "cor": "#8B5CF6" }
```

**Response (201):** etapa criada

---

### PUT /api/leads/etapas/[id]

Atualizar etapa.

**Request:** campos parciais aceitos (`nome`, `ordem`, `cor`)

**Response (200):** etapa atualizada

---

### DELETE /api/leads/etapas/[id]

Deletar etapa.

**Response (200):** `{ "success": true }`

---

## Configuracoes

### GET /api/configuracao

Obter todas as configuracoes (cores, textos, etc.).

**Response (200):**
```json
[
  { "chave": "cor_primaria", "valor": "#FF6B35", "categoria": "cores", "tipo": "color" },
  { "chave": "cor_header", "valor": "#1F2937", "categoria": "cores", "tipo": "color" }
]
```

---

### POST /api/configuracao

Criar ou atualizar uma configuracao (upsert por chave).

**Request:**
```json
{ "chave": "cor_primaria", "valor": "#00AA00", "categoria": "cores", "tipo": "color" }
```

**Response (200):** configuracao salva

---

## Auditoria

### GET /api/auditoria

Listar log de auditoria.

**Query params:**
- `limit` — numero de linhas (padrao: 50)
- `offset` — para paginacao
- `tabela` — filtrar por tabela (ex: `TAB_CARRO`)

**Response (200):**
```json
{
  "rows": [
    {
      "id": 100,
      "usuario": "Lucas",
      "acao": "CREATE",
      "tabela": "TAB_CARRO",
      "registro_id": 42,
      "dados_antes": null,
      "dados_depois": { "id": 42, "marca": "Honda", "modelo": "Civic" },
      "data_hora": "2024-01-20T14:22:00Z"
    }
  ],
  "total": 1250
}
```

---

## Formularios Publicos

### POST /api/contact

Enviado pelo formulario `/contato`.

**Request:**
```json
{
  "nome": "Joao Silva",
  "email": "joao@email.com",
  "telefone": "18999999999",
  "mensagem": "Tenho interesse no Corolla",
  "carro_id": 5
}
```

**Efeitos colaterais:**
- Envia email via Nodemailer para `CONTACT_RECIPIENT_EMAIL`
- Chama `criarLeadAutomatico()` → insere em `TAB_LEAD` com `origem = 'contato'`
- Chama `enviarWhatsAppLead()` → notifica dono via WhatsApp (falha silenciosamente)

**Response (200):** `{ "success": true }`

---

### POST /api/financiamento-contato

Enviado pelo formulario `/financiamento`.

**Request:**
```json
{
  "nome": "Maria Santos",
  "telefone": "18988888888",
  "email": "maria@email.com",
  "carro_id": 3
}
```

**Efeitos colaterais:** mesmos que `/api/contact`, com `origem = 'financiamento'`

**Response (200):** `{ "success": true }`

---

## Tratamento de Erros

Todos os endpoints retornam erros no formato:

```json
{ "error": "Descricao do erro" }
```

Com status HTTP apropriado:
- `400` — Bad Request (dados invalidos ou faltando)
- `401` — Unauthorized (sem autenticacao)
- `404` — Not Found (recurso nao existe)
- `500` — Internal Server Error

---

## Autenticacao em Requests

Operacoes de mutacao (POST, PUT, DELETE) nas rotas admin devem ter o cookie `admin_usuario` presente para que a auditoria seja registrada corretamente. Sem o cookie, a operacao ainda e executada mas o campo `usuario` na auditoria fica nulo.

```bash
# Exemplo com curl
curl -X POST http://localhost:3000/api/carros \
  -H "Content-Type: application/json" \
  -H "Cookie: admin_usuario=Lucas" \
  -d '{"marca":"Fiat","modelo":"Uno","ano":2022}'
```
