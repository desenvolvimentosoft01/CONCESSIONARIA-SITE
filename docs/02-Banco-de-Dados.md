# 🗄️ Banco de Dados

## Conexão

Arquivo: `src/lib/db.ts`

```typescript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function query(text, params) {
  return pool.query(text, params);
}
```

**Env var obrigatória:**
```
DATABASE_URL=postgresql://user:password@localhost:5432/concessionaria
```

## Convenção de Nomes

- Tabelas: `TAB_NOMEMETODO` (ex: `TAB_CARRO`)
- Colunas: `snake_case` (ex: `data_criacao`, `preco_venda`)
- Primary keys: `id` (tipo `SERIAL` ou `BIGSERIAL`)
- Foreign keys: `id_tabela_referenciada` (ex: `id_carro`)

## Schema Completo

### TAB_CARRO
Registros de veículos.

```sql
CREATE TABLE TAB_CARRO (
  id SERIAL PRIMARY KEY,
  marca VARCHAR(100) NOT NULL,
  modelo VARCHAR(100) NOT NULL,
  ano INT,
  preco_venda DECIMAL(12, 2),
  preco_tabela DECIMAL(12, 2),
  descricao TEXT,
  data_criacao TIMESTAMP DEFAULT NOW(),
  data_atualizacao TIMESTAMP DEFAULT NOW()
);
```

### TAB_CARRO_IMAGEM
Imagens associadas a veículos (suporta múltiplas por carro).

```sql
CREATE TABLE TAB_CARRO_IMAGEM (
  id SERIAL PRIMARY KEY,
  id_carro INT NOT NULL REFERENCES TAB_CARRO(id) ON DELETE CASCADE,
  url_cloudinary VARCHAR(500),
  ordem INT DEFAULT 0,
  data_criacao TIMESTAMP DEFAULT NOW()
);
```

**Nota:** Campo `ordem` determina a sequência na galeria. Incrementar para ordenar.

### TAB_MIDIA
Mídia por seção (carousels, galerias, etc).

```sql
CREATE TABLE TAB_MIDIA (
  id SERIAL PRIMARY KEY,
  secao VARCHAR(50) NOT NULL,  -- Ex: 'carousel_home', 'galeria_empresa'
  url_cloudinary VARCHAR(500),
  tipo VARCHAR(20) NOT NULL,    -- 'imagem' ou 'video'
  descricao VARCHAR(255),
  ordem INT DEFAULT 0,
  data_criacao TIMESTAMP DEFAULT NOW()
);
```

### TAB_CONFIGURACAO
Key-value store para tema e configurações globais.

```sql
CREATE TABLE TAB_CONFIGURACAO (
  id SERIAL PRIMARY KEY,
  chave VARCHAR(100) NOT NULL UNIQUE,
  valor TEXT,
  data_atualizacao TIMESTAMP DEFAULT NOW()
);
```

**Exemplos de chaves:**
- `cor_primaria` → `#FF6B35` (CSS color)
- `cor_header` → `#1F2937`
- `cor_footer` → `#111827`
- `logo_url` → URL Cloudinary
- `razao_social` → "Lucas Veículos Ltda"

### TAB_USUARIO
Usuários admin (autenticação simples).

```sql
CREATE TABLE TAB_USUARIO (
  id SERIAL PRIMARY KEY,
  usuario VARCHAR(100) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,  -- Armazenado em plain text (não seguro!)
  email VARCHAR(100),
  ativo BOOLEAN DEFAULT TRUE,
  data_criacao TIMESTAMP DEFAULT NOW()
);
```

⚠️ **Aviso:** Senhas são armazenadas em plain text. Para produção, usar bcrypt/Argon2.

### TAB_AUDITORIA
Log de todas as operações que modificam dados.

```sql
CREATE TABLE TAB_AUDITORIA (
  id SERIAL PRIMARY KEY,
  tabela VARCHAR(100) NOT NULL,
  acao VARCHAR(20) NOT NULL,          -- 'INSERT', 'UPDATE', 'DELETE'
  dados_antigos JSONB,
  dados_novos JSONB,
  usuario VARCHAR(100),
  ip_address VARCHAR(45),
  user_agent TEXT,
  data_criacao TIMESTAMP DEFAULT NOW()
);
```

## Operações Comuns

### SELECT
```typescript
const resultado = await query("SELECT * FROM TAB_CARRO WHERE id = $1", [id]);
```

### INSERT
```typescript
const resultado = await query(
  "INSERT INTO TAB_CARRO (marca, modelo, ano) VALUES ($1, $2, $3) RETURNING *",
  ["Toyota", "Corolla", 2023]
);
```

### UPDATE
```typescript
const resultado = await query(
  "UPDATE TAB_CARRO SET preco_venda = $1 WHERE id = $2 RETURNING *",
  [25000, id]
);
```

### DELETE
```typescript
await query("DELETE FROM TAB_CARRO WHERE id = $1", [id]);
```

## Índices Recomendados

Para melhor performance:

```sql
CREATE INDEX idx_carro_marca ON TAB_CARRO(marca);
CREATE INDEX idx_carro_imagem_id_carro ON TAB_CARRO_IMAGEM(id_carro);
CREATE INDEX idx_midia_secao ON TAB_MIDIA(secao);
CREATE INDEX idx_auditoria_tabela ON TAB_AUDITORIA(tabela);
CREATE INDEX idx_auditoria_usuario ON TAB_AUDITORIA(usuario);
```

## Backup/Restore

```bash
# Backup
pg_dump -h localhost -U user concessionaria > backup.sql

# Restore
psql -h localhost -U user concessionaria < backup.sql
```
