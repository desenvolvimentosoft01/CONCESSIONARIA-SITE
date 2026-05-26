-- ─────────────────────────────────────────
-- TAB_LEAD_ETAPA — etapas do funil de vendas
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS TAB_LEAD_ETAPA (
  id    SERIAL PRIMARY KEY,
  nome  VARCHAR(100) NOT NULL,
  ordem INT          NOT NULL,
  cor   VARCHAR(20)  NOT NULL
);

INSERT INTO TAB_LEAD_ETAPA (nome, ordem, cor) VALUES
  ('Novo',       1, '#5b9cf6'),
  ('Contactado', 2, '#e8a832'),
  ('Negociação', 3, '#9b7fe8'),
  ('Ganho',      4, '#28a745'),
  ('Perdido',    5, '#dc3545')
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────
-- TAB_LEAD — leads capturados ou criados manualmente
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS TAB_LEAD (
  id             SERIAL PRIMARY KEY,
  nome           VARCHAR(255) NOT NULL,
  email          VARCHAR(255) NOT NULL,
  telefone       VARCHAR(50),
  mensagem       TEXT,
  origem         VARCHAR(50)  DEFAULT 'manual',
  etapa_id       INT REFERENCES TAB_LEAD_ETAPA(id) DEFAULT 1,
  responsavel_id INT REFERENCES TAB_USUARIO(id),
  carro_id       INT REFERENCES TAB_CARRO(id),
  valor_estimado NUMERIC(12,2),
  criado_em      TIMESTAMP DEFAULT NOW(),
  atualizado_em  TIMESTAMP DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- TAB_LEAD_INTERACAO — histórico de contatos
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS TAB_LEAD_INTERACAO (
  id        SERIAL PRIMARY KEY,
  lead_id   INT NOT NULL REFERENCES TAB_LEAD(id) ON DELETE CASCADE,
  tipo      VARCHAR(50) NOT NULL,
  texto     TEXT NOT NULL,
  usuario   VARCHAR(255),
  criado_em TIMESTAMP DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- TAB_LEAD_TAREFA — tarefas e follow-ups
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS TAB_LEAD_TAREFA (
  id        SERIAL PRIMARY KEY,
  lead_id   INT NOT NULL REFERENCES TAB_LEAD(id) ON DELETE CASCADE,
  tipo      VARCHAR(100),
  descricao TEXT,
  prazo     DATE,
  status    VARCHAR(20) DEFAULT 'pendente',
  usuario   VARCHAR(255),
  criado_em TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_lead_etapa       ON TAB_LEAD(etapa_id);
CREATE INDEX IF NOT EXISTS idx_lead_criado      ON TAB_LEAD(criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_interacao_lead   ON TAB_LEAD_INTERACAO(lead_id);
CREATE INDEX IF NOT EXISTS idx_tarefa_lead      ON TAB_LEAD_TAREFA(lead_id);
CREATE INDEX IF NOT EXISTS idx_tarefa_prazo     ON TAB_LEAD_TAREFA(prazo);
CREATE INDEX IF NOT EXISTS idx_tarefa_status    ON TAB_LEAD_TAREFA(status);
