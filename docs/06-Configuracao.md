# ⚙️ Configuração e Setup

## Variáveis de Ambiente

Arquivo: `.env.local` (não versionado no git)

```bash
# PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/concessionaria

# Cloudinary
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=seu_api_secret

# Email (Gmail)
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_app  # Usar "App Password" do Gmail, não a senha normal
```

### Como Gerar Credenciais

#### PostgreSQL
```bash
# Criar banco localmente (Windows com PostgreSQL instalado)
psql -U postgres
CREATE DATABASE concessionaria;
```

#### Cloudinary
1. Acesso: https://cloudinary.com/
2. Criar conta (gratuita)
3. Dashboard → Account Details → copiar Cloud Name, API Key, API Secret

#### Email (Gmail)
1. Ativar 2FA na conta Google
2. Gerar "App Password": https://myaccount.google.com/apppasswords
3. Usar a senha gerada (16 caracteres)

## Setup Local

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar .env.local
```bash
# Copiar exemplo
cp .env.example .env.local

# Editar com suas credenciais
# (ver instruções acima)
```

### 3. Preparar Banco de Dados

#### Opção A: Manual
```bash
# Conectar ao banco
psql -U postgres concessionaria

# Executar schema
\i schema.sql  # Se existir um arquivo de schema
```

#### Opção B: Script Automatizado
```bash
npm run db:setup
```

#### Opção C: Criar Tables Manualmente
```sql
-- Conecte ao banco e execute:

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

-- ... (ver 02-Banco-de-Dados.md para schema completo)

CREATE TABLE TAB_USUARIO (
  id SERIAL PRIMARY KEY,
  usuario VARCHAR(100) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  email VARCHAR(100),
  ativo BOOLEAN DEFAULT TRUE,
  data_criacao TIMESTAMP DEFAULT NOW()
);

-- Inserir usuário admin padrão
INSERT INTO TAB_USUARIO (usuario, senha, email, ativo) 
VALUES ('admin', 'admin123', 'admin@example.com', true);
```

### 4. Iniciar Dev Server
```bash
npm run dev
```

Acesse: http://localhost:3000

### 5. Login
- Usuário: `admin`
- Senha: `admin123`

---

## Tema/Personalizacao

### O que é Tema?

Cores CSS armazenadas em `TAB_CONFIGURACAO`:

| Chave | Exemplo | Uso |
|-------|---------|-----|
| `cor_primaria` | `#FF6B35` | CTA, botões principais |
| `cor_secundaria` | `#4B5563` | Links, destaques |
| `cor_header` | `#1F2937` | Fundo do header |
| `cor_footer` | `#111827` | Fundo do footer |
| `cor_fundo_card` | `#FFFFFF` | Fundo de cards |
| `cor_texto` | `#1F2937` | Texto principal |

### Como Funciona

1. **Armazenamento:** `TAB_CONFIGURACAO` (chave-valor)
2. **Fetch:** TemaProvider (`src/components/TemaProvider.tsx`) busca na montagem
3. **Injeção:** `<style>` block com CSS variables:
```css
:root {
  --cor-primaria: #FF6B35;
  --cor-header: #1F2937;
  /* ... */
}
```

4. **Componentes usam:** `var(--cor-primaria)` no CSS

### Editar Tema

**Via Admin Panel:** `/admin/personalizacao`

Ou direto no banco:
```sql
UPDATE TAB_CONFIGURACAO SET valor = '#00FF00' WHERE chave = 'cor_primaria';
```

---

## Build e Deploy

### Build para Produção

```bash
npm run build
```

Gera pasta `.next/` otimizada.

### Iniciar Servidor Produção

```bash
npm start
```

### Environment Produção

Criar `.env.local` no servidor com mesmas variáveis.

---

## Docker (Opcional)

Se quiser containerizar:

### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY .next ./.next
COPY public ./public

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "start"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: concessionaria
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - db_data:/var/lib/postgresql/data

  app:
    build: .
    environment:
      DATABASE_URL: postgresql://postgres:password@db:5432/concessionaria
      CLOUDINARY_CLOUD_NAME: ${CLOUDINARY_CLOUD_NAME}
      CLOUDINARY_API_KEY: ${CLOUDINARY_API_KEY}
      CLOUDINARY_API_SECRET: ${CLOUDINARY_API_SECRET}
      EMAIL_USER: ${EMAIL_USER}
      EMAIL_PASS: ${EMAIL_PASS}
    ports:
      - "3000:3000"
    depends_on:
      - db

volumes:
  db_data:
```

---

## Troubleshooting

### Erro: "Cannot find module 'pg'"
```bash
npm install pg
```

### Erro: "DATABASE_URL not found"
Verificar `.env.local` existe e tem DATABASE_URL.

### Cloudinary upload falha
- Verificar credenciais em `.env.local`
- Validar CLOUDINARY_CLOUD_NAME existe no Cloudinary

### Email não envia
- Verificar EMAIL_USER e EMAIL_PASS estão corretos
- Garantir Gmail tem 2FA + App Password gerada
- Verificar conta de email não está bloqueada

---

## Checklist Pré-Produção

- [ ] `.env.local` configurado no servidor
- [ ] Database backup funcionando
- [ ] SSL/HTTPS habilitado
- [ ] Senhas admin alteradas do padrão
- [ ] Cloudinary com limite de storage configurado
- [ ] Email com backup MX records
- [ ] Logs centralizados (opcional: sentry.io)
- [ ] Monitoring de uptime (opcional: datadog, newrelic)

---

## Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Produção
npm start

# Limpar cache Next.js
rm -rf .next

# Teste de conexão database
psql -U user -d concessionaria -c "SELECT 1;"

# Ver logs
npm run dev 2>&1 | tee app.log
```
