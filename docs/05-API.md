# 📡 API Reference

Todos os endpoints retornam JSON. Base URL: `/api/`

## Autenticação

### POST /api/login

Autentica um usuário.

**Request:**
```json
{
  "usuario": "admin",
  "senha": "admin123"
}
```

**Response (200):**
```json
{
  "success": true,
  "usuario": "admin",
  "nome": "Admin User"
}
```

**Response (401):**
```json
{
  "error": "Usuário ou senha inválidos"
}
```

**Efeitos colaterais:**
- Set cookie `admin_usuario`
- Cliente armazena `admin_logado` e `admin_nome` em sessionStorage

---

### POST /api/logout

Fazer logout.

**Request:** (sem corpo)

**Response (200):**
```json
{
  "success": true
}
```

**Efeitos colaterais:**
- Delete cookie `admin_usuario`
- Cliente remove sessionStorage

---

## Veículos

### GET /api/carros

Lista todos os veículos.

**Query params:**
- `limit` (opcional) — número de resultados (padrão: todos)
- `offset` (opcional) — para paginação

**Response (200):**
```json
{
  "rows": [
    {
      "id": 1,
      "marca": "Toyota",
      "modelo": "Corolla",
      "ano": 2023,
      "preco_venda": 85000,
      "preco_tabela": 90000,
      "descricao": "Impecável, único dono",
      "data_criacao": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### GET /api/carros/[id]

Detalhes de um veículo específico, incluindo imagens.

**Response (200):**
```json
{
  "carro": {
    "id": 1,
    "marca": "Toyota",
    "modelo": "Corolla",
    "ano": 2023,
    "preco_venda": 85000,
    "preco_tabela": 90000,
    "descricao": "Impecável, único dono",
    "data_criacao": "2024-01-15T10:30:00Z"
  },
  "imagens": [
    {
      "id": 10,
      "url_cloudinary": "https://res.cloudinary.com/.../image.jpg",
      "ordem": 0
    },
    {
      "id": 11,
      "url_cloudinary": "https://res.cloudinary.com/.../image2.jpg",
      "ordem": 1
    }
  ]
}
```

**Response (404):**
```json
{
  "error": "Carro não encontrado"
}
```

---

### POST /api/carros

Criar novo veículo. **Requer autenticação.**

**Request:**
```json
{
  "marca": "Honda",
  "modelo": "Civic",
  "ano": 2024,
  "preco_venda": 120000,
  "preco_tabela": 125000,
  "descricao": "Novo, 0km"
}
```

**Response (201):**
```json
{
  "id": 42,
  "marca": "Honda",
  "modelo": "Civic",
  "ano": 2024,
  "preco_venda": 120000,
  "preco_tabela": 125000,
  "descricao": "Novo, 0km",
  "data_criacao": "2024-01-20T14:22:00Z"
}
```

**Efeitos colaterais:**
- Registra em `TAB_AUDITORIA`

---

### PUT /api/carros/[id]

Atualizar veículo. **Requer autenticação.**

**Request:** (mesmos campos de criação)

**Response (200):** (veículo atualizado)

---

### DELETE /api/carros/[id]

Deletar veículo. **Requer autenticação.**

**Response (204):** (sem corpo)

**Efeitos colaterais:**
- Deleta imagens associadas via CASCADE
- Registra em `TAB_AUDITORIA`

---

## Upload de Imagens

### POST /api/upload

Upload de imagem para Cloudinary. **Requer autenticação.**

**Request:** (multipart/form-data)
```
Content-Type: multipart/form-data
---
[form field "file": binary image]
[form field "id_carro": "5"]
```

**Response (200):**
```json
{
  "success": true,
  "url": "https://res.cloudinary.com/.../image_xyz123.jpg",
  "publicId": "concessionaria/image_xyz123"
}
```

---

### DELETE /api/upload

Deletar imagem do Cloudinary. **Requer autenticação.**

**Request:**
```json
{
  "publicId": "concessionaria/image_xyz123",
  "id_imagem": 10
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Imagem deletada"
}
```

---

## Mídia por Seção

### GET /api/midia/[secao]

Obter mídia de uma seção (ex: carousel_home, galeria_empresa).

**Response (200):**
```json
{
  "secao": "carousel_home",
  "midia": [
    {
      "id": 1,
      "url_cloudinary": "https://...",
      "tipo": "imagem",
      "descricao": "Slide 1",
      "ordem": 0
    }
  ]
}
```

---

### POST /api/midia/[secao]

Adicionar mídia a uma seção. **Requer autenticação.**

**Request:**
```json
{
  "url_cloudinary": "https://res.cloudinary.com/.../img.jpg",
  "tipo": "imagem",
  "descricao": "Nova imagem"
}
```

**Response (201):** (mídia criada)

---

### DELETE /api/midia/[id]

Deletar mídia. **Requer autenticação.**

**Response (204):** (sem corpo)

---

## Configurações (Tema)

### GET /api/config

Obter todas as configurações (cores, logos, etc).

**Response (200):**
```json
{
  "cor_primaria": "#FF6B35",
  "cor_header": "#1F2937",
  "cor_footer": "#111827",
  "logo_url": "https://res.cloudinary.com/.../logo.png",
  "razao_social": "Lucas Veículos Ltda"
}
```

---

### PUT /api/config

Atualizar configurações. **Requer autenticação.**

**Request:**
```json
{
  "cor_primaria": "#00AA00",
  "logo_url": "https://..."
}
```

**Response (200):** (config atualizada)

**Efeitos colaterais:**
- Atualiza `TAB_CONFIGURACAO`
- Frontend recarrega CSS via TemaProvider

---

## Auditoria

### GET /api/auditoria

Listar log de auditoria. **Requer autenticação.**

**Query params:**
- `limit` — número de linhas (padrão: 50)
- `offset` — para paginação
- `tabela` — filtrar por tabela (ex: TAB_CARRO)

**Response (200):**
```json
{
  "rows": [
    {
      "id": 100,
      "tabela": "TAB_CARRO",
      "acao": "INSERT",
      "dados_antigos": null,
      "dados_novos": {
        "id": 42,
        "marca": "Honda",
        "modelo": "Civic"
      },
      "usuario": "admin",
      "ip_address": "192.168.1.100",
      "data_criacao": "2024-01-20T14:22:00Z"
    }
  ]
}
```

---

## Tratamento de Erros

Todos os endpoints retornam erros no formato:

```json
{
  "error": "Descrição do erro"
}
```

Com status HTTP apropriado:
- `400` — Bad Request (dados inválidos)
- `401` — Unauthorized (sem autenticação)
- `404` — Not Found (recurso não existe)
- `500` — Internal Server Error

---

## Paginação

Endpoints que listam dados (GET /api/carros, GET /api/auditoria):

```javascript
// Buscar página 2 com 10 items
fetch('/api/carros?limit=10&offset=10')

// Respostas incluem:
{
  "rows": [...],
  "total": 42,
  "limit": 10,
  "offset": 10
}
```

---

## Autenticação em Requests

Todas as operações que **modificam** dados (POST, PUT, DELETE) requerem:

1. Cookie `admin_usuario` presente
2. SessionStorage `admin_logado` no cliente

Sem autenticação: `401 Unauthorized`

```bash
# Exemplo com curl
curl -X POST http://localhost:3000/api/carros \
  -H "Content-Type: application/json" \
  -H "Cookie: admin_usuario=lucas" \
  -d '{"marca":"Fiat","modelo":"Uno"}'
```
