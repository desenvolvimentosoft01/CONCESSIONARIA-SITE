-- ============================================================
--  SCHEMA — Concessionaria Site
--  Execute este script no banco PostgreSQL do novo projeto.
--  Compatível com Neon, Supabase, Railway, etc.
-- ============================================================

-- Usuários do painel admin
CREATE TABLE IF NOT EXISTS TAB_USUARIO (
  id         SERIAL PRIMARY KEY,
  nome       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL UNIQUE,
  senha      VARCHAR(255) NOT NULL,
  cargo      VARCHAR(50)  DEFAULT 'admin',
  ativo      BOOLEAN      DEFAULT true,
  criado_em  TIMESTAMP    DEFAULT NOW()
);

-- Veículos
CREATE TABLE IF NOT EXISTS TAB_CARRO (
  id          SERIAL PRIMARY KEY,
  marca       VARCHAR(100) NOT NULL,
  modelo      VARCHAR(100) NOT NULL,
  ano         INTEGER,
  cor         VARCHAR(50),
  placa       VARCHAR(20),
  preco       NUMERIC(12,2),
  imagem_url  TEXT,
  descricao   TEXT,
  disponivel  BOOLEAN   DEFAULT true,
  criado_em   TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Imagens dos veículos (múltiplas por carro)
CREATE TABLE IF NOT EXISTS TAB_CARRO_IMAGEM (
  id          SERIAL PRIMARY KEY,
  carro_id    INTEGER NOT NULL REFERENCES TAB_CARRO(id) ON DELETE CASCADE,
  imagem_url  TEXT    NOT NULL,
  ordem       INTEGER DEFAULT 0,
  tipo        VARCHAR(10) DEFAULT 'imagem',
  criado_em   TIMESTAMP  DEFAULT NOW()
);

-- Mídia do site (carrossel, galeria, etc.)
CREATE TABLE IF NOT EXISTS TAB_MIDIA (
  id         SERIAL PRIMARY KEY,
  titulo     VARCHAR(200),
  tipo       VARCHAR(10)  DEFAULT 'imagem',
  url        TEXT         NOT NULL,
  secao      VARCHAR(100) NOT NULL,
  ordem      INTEGER      DEFAULT 0,
  ativo      BOOLEAN      DEFAULT true,
  criado_em  TIMESTAMP    DEFAULT NOW()
);

-- Configurações / tema (cores, textos, etc.)
CREATE TABLE IF NOT EXISTS TAB_CONFIGURACAO (
  id              SERIAL PRIMARY KEY,
  chave           VARCHAR(100) NOT NULL UNIQUE,
  valor           TEXT,
  descricao       VARCHAR(255),
  categoria       VARCHAR(50),
  tipo            VARCHAR(20) DEFAULT 'text',
  data_atualizacao TIMESTAMP  DEFAULT NOW()
);

-- Log de auditoria
CREATE TABLE IF NOT EXISTS TAB_AUDITORIA (
  id           SERIAL PRIMARY KEY,
  usuario      VARCHAR(100),
  acao         VARCHAR(10) NOT NULL,
  tabela       VARCHAR(100),
  registro_id  INTEGER,
  dados_antes  JSONB,
  dados_depois JSONB,
  criado_em    TIMESTAMP DEFAULT NOW()
);

-- Etapas do funil de vendas (CRM)
CREATE TABLE IF NOT EXISTS TAB_LEAD_ETAPA (
  id     SERIAL PRIMARY KEY,
  nome   VARCHAR(100) NOT NULL,
  cor    VARCHAR(20)  DEFAULT '#5b9cf6',
  ordem  INTEGER      DEFAULT 0
);

-- Leads / contatos
CREATE TABLE IF NOT EXISTS TAB_LEAD (
  id               SERIAL PRIMARY KEY,
  nome             VARCHAR(150),
  email            VARCHAR(150),
  telefone         VARCHAR(30),
  mensagem         TEXT,
  origem           VARCHAR(50)   DEFAULT 'site',
  etapa_id         INTEGER       REFERENCES TAB_LEAD_ETAPA(id) ON DELETE SET NULL,
  carro_id         INTEGER       REFERENCES TAB_CARRO(id)      ON DELETE SET NULL,
  valor_estimado   NUMERIC(12,2),
  responsavel      VARCHAR(100),
  criado_em        TIMESTAMP     DEFAULT NOW(),
  atualizado_em    TIMESTAMP     DEFAULT NOW()
);

-- Interações / histórico do lead
CREATE TABLE IF NOT EXISTS TAB_LEAD_INTERACAO (
  id        SERIAL PRIMARY KEY,
  lead_id   INTEGER NOT NULL REFERENCES TAB_LEAD(id) ON DELETE CASCADE,
  tipo      VARCHAR(30) DEFAULT 'observacao',
  texto     TEXT,
  usuario   VARCHAR(100),
  criado_em TIMESTAMP DEFAULT NOW()
);

-- Tarefas vinculadas ao lead
CREATE TABLE IF NOT EXISTS TAB_LEAD_TAREFA (
  id        SERIAL PRIMARY KEY,
  lead_id   INTEGER NOT NULL REFERENCES TAB_LEAD(id) ON DELETE CASCADE,
  tipo      VARCHAR(50),
  descricao TEXT    NOT NULL,
  prazo     TIMESTAMP,
  usuario   VARCHAR(100),
  status    VARCHAR(20) DEFAULT 'pendente',
  criado_em TIMESTAMP   DEFAULT NOW()
);

-- ============================================================
--  DADOS INICIAIS OBRIGATÓRIOS
-- ============================================================

-- Etapas padrão do funil
INSERT INTO TAB_LEAD_ETAPA (nome, cor, ordem) VALUES
  ('Novo',        '#5b9cf6', 1),
  ('Contactado',  '#f59e0b', 2),
  ('Negociação',  '#a78bfa', 3),
  ('Ganho',       '#22c55e', 4),
  ('Perdido',     '#ef4444', 5)
ON CONFLICT DO NOTHING;

-- Usuário administrador padrão  (troque a senha após o primeiro acesso)
INSERT INTO TAB_USUARIO (nome, email, senha, cargo) VALUES
  ('Administrador', 'admin@demo.com', 'demo1234', 'admin')
ON CONFLICT (email) DO NOTHING;

-- ============================================================
--  FIM DO SCRIPT
-- ============================================================
