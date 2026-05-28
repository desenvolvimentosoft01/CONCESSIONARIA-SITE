# Banco de Dados

## Conexao

Arquivo: `src/lib/db.ts`

```typescript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function query(text, params) {
  return pool.query(text, params);
}
```

**Env var obrigatoria:**
```
DATABASE_URL=postgresql://user:password@localhost:5432/concessionaria
```

## Convencao de Nomes

- Tabelas: `TAB_NOMEMETODO` (ex: `TAB_CARRO`)
- Colunas: `snake_case` (ex: `data_criacao`, `carro_id`)
- Primary keys: `id` (tipo `SERIAL`)
- Foreign keys: `tabela_id` (ex: `carro_id`, `lead_id`)

## Schema Completo

### TAB_USUARIO
Usuarios admin (autenticacao simples).

```sql
CREATE TABLE TAB_USUARIO (
  id          SERIAL PRIMARY KEY,
  nome        VARCHAR(100) NOT NULL,
  email       VARCHAR(100) NOT NULL UNIQUE,
  senha       VARCHAR(255) NOT NULL,  -- plain text, nao hashed
  ativo       BOOLEAN DEFAULT TRUE,
  data_criacao TIMESTAMP DEFAULT NOW()
);
```

**Aviso:** Senhas armazenadas em plain text. O pacote `bcryptjs` esta instalado mas nao e usado.

---

### TAB_CARRO
Registros de veiculos.

```sql
CREATE TABLE TAB_CARRO (
  id           SERIAL PRIMARY KEY,
  marca        VARCHAR(100) NOT NULL,
  modelo       VARCHAR(100) NOT NULL,
  ano          INT,
  cor          VARCHAR(50),
  placa        VARCHAR(20),
  preco        DECIMAL(12, 2),
  imagem_url   VARCHAR(500),           -- imagem principal (legado)
  descricao    TEXT,
  disponivel   BOOLEAN DEFAULT TRUE,   -- false = vendido (oculto no estoque publico)
  data_criacao TIMESTAMP DEFAULT NOW()
);
```

**Nota:** `disponivel = false` e setado automaticamente quando um lead vinculado ao carro e movido para a etapa "Ganho" no CRM.

---

### TAB_CARRO_IMAGEM
Imagens associadas a veiculos (suporta multiplas por carro, com ordem).

```sql
CREATE TABLE TAB_CARRO_IMAGEM (
  id          SERIAL PRIMARY KEY,
  carro_id    INT NOT NULL REFERENCES TAB_CARRO(id) ON DELETE CASCADE,
  imagem_url  VARCHAR(500),
  ordem       INT DEFAULT 0,
  tipo        VARCHAR(20),             -- ex: 'imagem', 'video'
  data_criacao TIMESTAMP DEFAULT NOW()
);
```

**Nota:** Campo `ordem` determina a sequencia na galeria. Imagem com menor ordem aparece primeiro.

---

### TAB_MIDIA
Midia por secao do site (carousels, galerias, banners).

```sql
CREATE TABLE TAB_MIDIA (
  id          SERIAL PRIMARY KEY,
  titulo      VARCHAR(255),
  tipo        VARCHAR(20) NOT NULL,    -- 'imagem' ou 'video'
  url         VARCHAR(500),
  secao       VARCHAR(50) NOT NULL,   -- ex: 'carousel_home', 'galeria_empresa'
  ordem       INT DEFAULT 0,
  ativo       BOOLEAN DEFAULT TRUE,
  data_criacao TIMESTAMP DEFAULT NOW()
);
```

---

### TAB_CONFIGURACAO
Key-value store para tema e configuracoes globais do site.

```sql
CREATE TABLE TAB_CONFIGURACAO (
  id              SERIAL PRIMARY KEY,
  chave           VARCHAR(100) NOT NULL UNIQUE,
  valor           TEXT,
  descricao       VARCHAR(255),
  categoria       VARCHAR(50),         -- ex: 'cores', 'textos', 'geral'
  tipo            VARCHAR(20),         -- ex: 'color', 'text', 'url'
  data_atualizacao TIMESTAMP DEFAULT NOW()
);
```

**Exemplos de chaves:**
- `cor_primaria` → `#FF6B35` (CSS color)
- `cor_header` → `#1F2937`
- `cor_footer` → `#111827`
- Textos da pagina de financiamento

---

### TAB_AUDITORIA
Log de todas as operacoes que modificam dados.

```sql
CREATE TABLE TAB_AUDITORIA (
  id          SERIAL PRIMARY KEY,
  usuario     VARCHAR(100),            -- nome do admin logado (do cookie)
  acao        VARCHAR(20) NOT NULL,    -- 'CREATE', 'UPDATE', 'DELETE'
  tabela      VARCHAR(100) NOT NULL,
  registro_id INT,
  dados_antes JSONB,
  dados_depois JSONB,
  data_hora   TIMESTAMP DEFAULT NOW()
);
```

---

### TAB_LEAD_ETAPA
Etapas do pipeline de vendas (CRM).

```sql
CREATE TABLE TAB_LEAD_ETAPA (
  id    SERIAL PRIMARY KEY,
  nome  VARCHAR(100) NOT NULL,
  ordem INT DEFAULT 0,
  cor   VARCHAR(20)              -- cor hex para o kanban
);
```

**Etapas padrao:** Novo, Contactado, Negociacao, Ganho, Perdido

---

### TAB_LEAD
Leads do CRM.

```sql
CREATE TABLE TAB_LEAD (
  id              SERIAL PRIMARY KEY,
  nome            VARCHAR(255),
  email           VARCHAR(255),
  telefone        VARCHAR(20),
  mensagem        TEXT,
  origem          VARCHAR(50),         -- 'contato', 'financiamento', 'interesse'
  etapa_id        INT REFERENCES TAB_LEAD_ETAPA(id),
  responsavel_id  INT REFERENCES TAB_USUARIO(id),
  carro_id        INT REFERENCES TAB_CARRO(id),
  valor_estimado  DECIMAL(12, 2),
  criado_em       TIMESTAMP DEFAULT NOW(),
  atualizado_em   TIMESTAMP DEFAULT NOW()
);
```

**Nota:** `carro_id` e preenchido automaticamente quando o lead vem de uma pagina de detalhe de veiculo (via `?carro_id=X` na URL).

---

### TAB_LEAD_INTERACAO
Timeline de interacoes por lead.

```sql
CREATE TABLE TAB_LEAD_INTERACAO (
  id        SERIAL PRIMARY KEY,
  lead_id   INT NOT NULL REFERENCES TAB_LEAD(id) ON DELETE CASCADE,
  tipo      VARCHAR(50),               -- ex: 'ligacao', 'email', 'whatsapp', 'nota'
  texto     TEXT,
  usuario   VARCHAR(100),
  criado_em TIMESTAMP DEFAULT NOW()
);
```

---

### TAB_LEAD_TAREFA
Tarefas associadas a leads.

```sql
CREATE TABLE TAB_LEAD_TAREFA (
  id        SERIAL PRIMARY KEY,
  lead_id   INT NOT NULL REFERENCES TAB_LEAD(id) ON DELETE CASCADE,
  tipo      VARCHAR(50),               -- ex: 'ligacao', 'visita', 'email'
  descricao TEXT,
  prazo     TIMESTAMP,
  status    VARCHAR(20) DEFAULT 'pendente',  -- 'pendente' ou 'concluida'
  usuario   VARCHAR(100),
  criado_em TIMESTAMP DEFAULT NOW()
);
```

---

## Operacoes Comuns

### SELECT
```typescript
const resultado = await query("SELECT * FROM TAB_CARRO WHERE id = $1", [id]);
const carro = resultado.rows[0];
```

### INSERT
```typescript
const resultado = await query(
  "INSERT INTO TAB_CARRO (marca, modelo, ano, disponivel) VALUES ($1, $2, $3, true) RETURNING *",
  ["Toyota", "Corolla", 2023]
);
const novo = resultado.rows[0];
```

### UPDATE
```typescript
const resultado = await query(
  "UPDATE TAB_CARRO SET preco = $1, atualizado_em = NOW() WHERE id = $2 RETURNING *",
  [25000, id]
);
```

### DELETE
```typescript
await query("DELETE FROM TAB_CARRO WHERE id = $1", [id]);
```

## Indices Recomendados

```sql
CREATE INDEX idx_carro_disponivel ON TAB_CARRO(disponivel);
CREATE INDEX idx_carro_imagem_carro_id ON TAB_CARRO_IMAGEM(carro_id);
CREATE INDEX idx_midia_secao ON TAB_MIDIA(secao);
CREATE INDEX idx_auditoria_tabela ON TAB_AUDITORIA(tabela);
CREATE INDEX idx_lead_etapa_id ON TAB_LEAD(etapa_id);
CREATE INDEX idx_lead_interacao_lead_id ON TAB_LEAD_INTERACAO(lead_id);
CREATE INDEX idx_lead_tarefa_lead_id ON TAB_LEAD_TAREFA(lead_id);
CREATE INDEX idx_lead_tarefa_status ON TAB_LEAD_TAREFA(status);
```

## Backup/Restore

```bash
# Backup
pg_dump -h localhost -U user concessionaria > backup.sql

# Restore
psql -h localhost -U user concessionaria < backup.sql
```

## Criacao Automatizada das Tabelas

Ver `node scripts/setup-db.mjs` (se existir) ou executar os DDLs acima manualmente.

Ver [06-Configuracao.md](06-Configuracao.md) para o passo a passo de setup.
